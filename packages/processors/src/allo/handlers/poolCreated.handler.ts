import { Address, getAddress, parseUnits, zeroAddress } from "viem";

import type { Changeset, NewRound, PendingRoundRole } from "@grants-stack-indexer/repository";
import type { ChainId, ProtocolEvent } from "@grants-stack-indexer/shared";
import { isAlloNativeToken } from "@grants-stack-indexer/shared/";

import type { IEventHandler, ProcessorDependencies, StrategyTimings } from "../../internal.js";
import { getRoundRoles } from "../../helpers/roles.js";
import { RoundMetadataSchema } from "../../helpers/schemas.js";
import { extractStrategyFromId, getStrategyTimings } from "../../helpers/strategy.js";
import { calculateAmountInUsd } from "../../helpers/tokenMath.js";
import { TokenPriceNotFoundError } from "../../internal.js";

type Dependencies = Pick<
    ProcessorDependencies,
    "evmProvider" | "pricingProvider" | "metadataProvider" | "roundRepository"
>;

// sometimes coingecko returns no prices for 1 hour range, 2 hours works better
const TIMESTAMP_DELTA_RANGE = 2 * 60 * 60 * 1000;

/**
 /**
  * Handles the PoolCreated event for the Allo protocol.
  * 
  * This handler performs the following core actions when a new pool is created:
  * - Retrieves the metadata associated with the pool
  * - Determines the correct token address, handling native tokens appropriately.
  * - Extracts the correct strategy information from the provided strategy ID.
  * - Calculates the funded amount in USD based on the token's pricing.
  * - Creates a new round object
  */
export class PoolCreatedHandler implements IEventHandler<"Allo", "PoolCreated"> {
    constructor(
        readonly event: ProtocolEvent<"Allo", "PoolCreated">,
        private readonly chainId: ChainId,
        private readonly dependencies: Dependencies,
    ) {}

    async handle(): Promise<Changeset[]> {
        const { metadataProvider, evmProvider } = this.dependencies;
        const [metadataPointer] = this.event.params.metadata;
        const {
            poolId,
            strategyId,
            token: tokenAddress,
            contractAddress: strategyAddress,
            amount: fundedAmount,
        } = this.event.params;
        const { hash: txHash, from: txFrom } = this.event.transactionFields;

        const metadata = await metadataProvider.getMetadata<{
            round?: unknown;
            application?: unknown;
        }>(metadataPointer);
        const parsedRoundMetadata = RoundMetadataSchema.safeParse(metadata?.round);

        const checksummedTokenAddress = getAddress(tokenAddress);
        const matchTokenAddress = isAlloNativeToken(checksummedTokenAddress)
            ? zeroAddress
            : checksummedTokenAddress;

        const strategy = extractStrategyFromId(strategyId);

        // TODO: get token for the chain
        const token = {
            address: matchTokenAddress,
            decimals: 18, //TODO: get decimals from token
            symbol: "USDC", //TODO: get symbol from token
            name: "USDC", //TODO: get name from token
        };

        let strategyTimings: StrategyTimings = {
            applicationsStartTime: null,
            applicationsEndTime: null,
            donationsStartTime: null,
            donationsEndTime: null,
        };

        let matchAmount = 0n;
        let matchAmountInUsd = 0;

        if (strategy) {
            strategyTimings = await getStrategyTimings(evmProvider, strategy, strategyAddress);

            //TODO: when creating strategy handlers, should this be moved there?
            if (
                strategy.name === "allov2.DonationVotingMerkleDistributionDirectTransferStrategy" &&
                parsedRoundMetadata.success &&
                token !== null
            ) {
                matchAmount = parseUnits(
                    parsedRoundMetadata.data.quadraticFundingConfig.matchingFundsAvailable.toString(),
                    token.decimals,
                );

                matchAmountInUsd = await this.getTokenAmountInUsd(
                    token,
                    matchAmount,
                    this.event.blockTimestamp,
                );
            }
        }

        let fundedAmountInUsd = 0;

        if (token !== null && fundedAmount > 0n) {
            fundedAmountInUsd = await this.getTokenAmountInUsd(
                token,
                fundedAmount,
                this.event.blockTimestamp,
            );
        }

        // transaction sender
        const createdBy = txFrom ?? (await evmProvider.getTransaction(txHash)).from;

        const roundRoles = getRoundRoles(poolId);

        const newRound: NewRound = {
            chainId: this.chainId,
            id: poolId.toString(),
            tags: ["allo-v2", ...(parsedRoundMetadata.success ? ["grants-stack"] : [])],
            totalDonationsCount: 0,
            totalAmountDonatedInUsd: 0,
            uniqueDonorsCount: 0,
            matchTokenAddress,
            matchAmount,
            matchAmountInUsd,
            fundedAmount,
            fundedAmountInUsd,
            applicationMetadataCid: metadataPointer,
            applicationMetadata: metadata?.application ?? {},
            roundMetadataCid: metadataPointer,
            roundMetadata: metadata?.round ?? null,
            ...strategyTimings,
            ...roundRoles,
            strategyAddress,
            strategyId,
            strategyName: strategy?.name ?? "",
            createdByAddress: getAddress(createdBy),
            createdAtBlock: BigInt(this.event.blockNumber),
            updatedAtBlock: BigInt(this.event.blockNumber),
            projectId: this.event.params.profileId,
            totalDistributed: 0n,
            readyForPayoutTransaction: null,
            matchingDistribution: null,
        };

        const changes: Changeset[] = [
            {
                type: "InsertRound",
                args: { round: newRound },
            },
        ];

        changes.push(...(await this.handlePendingRoles(this.chainId, poolId.toString())));

        return changes;
    }

    /**
     * Creates the admin and manager roles for the pool and deletes the pending roles.
     * @param chainId - The ID of the chain.
     * @param roundId - The ID of the round.
     * @returns The changesets.
     * @Note
     * Admin/Manager roles for the pool are emitted before the pool is created
     * so a pending round role is inserted in the db.
     * Now that the PoolCreated event is emitted, we can convert
     * pending roles to actual round roles.
     */
    private async handlePendingRoles(chainId: ChainId, roundId: string): Promise<Changeset[]> {
        const { roundRepository } = this.dependencies;
        const changes: Changeset[] = [];
        const allPendingRoles: PendingRoundRole[] = [];

        for (const roleName of ["admin", "manager"] as const) {
            const pendingRoles = await roundRepository.getPendingRoundRoles(chainId, roleName);
            for (const pr of pendingRoles) {
                changes.push({
                    type: "InsertRoundRole",
                    args: {
                        roundRole: {
                            chainId,
                            roundId,
                            address: pr.address,
                            role: roleName,
                            createdAtBlock: pr.createdAtBlock,
                        },
                    },
                });
            }
            allPendingRoles.push(...pendingRoles);
        }

        const pendingRoleIds = [...new Set(allPendingRoles.map((r) => r.id!))];
        if (pendingRoleIds.length > 0) {
            changes.push({
                type: "DeletePendingRoundRoles",
                args: { ids: pendingRoleIds },
            });
        }

        return changes;
    }

    private async getTokenAmountInUsd(
        token: { address: Address; decimals: number },
        amount: bigint,
        timestamp: number,
    ): Promise<number> {
        const { pricingProvider } = this.dependencies;
        const tokenPrice = await pricingProvider.getTokenPrice(
            this.chainId,
            token.address,
            timestamp,
            timestamp + TIMESTAMP_DELTA_RANGE,
        );

        if (!tokenPrice) {
            throw new TokenPriceNotFoundError(token.address, timestamp);
        }

        return calculateAmountInUsd(amount, tokenPrice.priceUsd, token.decimals);
    }
}
