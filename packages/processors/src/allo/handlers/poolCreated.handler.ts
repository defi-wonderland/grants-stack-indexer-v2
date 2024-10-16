import {
    Address,
    encodePacked,
    getAddress,
    keccak256,
    pad,
    parseUnits,
    PublicClient,
    zeroAddress,
} from "viem";

import type { IMetadataProvider } from "@grants-stack-indexer/metadata";
import type { IPricingProvider } from "@grants-stack-indexer/pricing";
import type {
    Changeset,
    IRoundReadRepository,
    NewRound,
    PendingRoundRole,
} from "@grants-stack-indexer/repository";
import type { ChainId, ProtocolEvent } from "@grants-stack-indexer/shared";
import { isAlloNativeToken } from "@grants-stack-indexer/shared/";

import type { IEventHandler } from "../../internal.js";
import { RoundMetadataSchema } from "../../helpers/schemas.js";
import { extractStrategyFromId, getStrategyTimings } from "../../helpers/strategy.js";
import { calculateAmountInUsd } from "../../helpers/tokenMath.js";

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
    private readonly viemClient: PublicClient;
    private readonly pricingProvider: IPricingProvider;
    private readonly metadataProvider: IMetadataProvider;
    private readonly roundRepository: IRoundReadRepository;

    constructor(
        readonly event: ProtocolEvent<"Allo", "PoolCreated">,
        private readonly chainId: ChainId,
        dependencies: {
            viemClient: PublicClient;
            pricingProvider: IPricingProvider;
            metadataProvider: IMetadataProvider;
            roundRepository: IRoundReadRepository;
        },
    ) {
        this.viemClient = dependencies.viemClient;
        this.pricingProvider = dependencies.pricingProvider;
        this.metadataProvider = dependencies.metadataProvider;
        this.roundRepository = dependencies.roundRepository;
    }

    async handle(): Promise<Changeset[]> {
        const { pointer: metadataPointer } = this.event.params.metadata;
        const {
            poolId,
            strategyId,
            token: tokenAddress,
            contractAddress: strategyAddress,
            amount: fundedAmount,
        } = this.event.params;
        const { hash: txHash, from: txFrom } = this.event.transactionFields;

        try {
            const metadata = await this.metadataProvider.getMetadata<{
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

            let strategyTimings: {
                applicationsStartTime: Date | null;
                applicationsEndTime: Date | null;
                donationsStartTime: Date | null;
                donationsEndTime: Date | null;
            } = {
                applicationsStartTime: null,
                applicationsEndTime: null,
                donationsStartTime: null,
                donationsEndTime: null,
            };

            let matchAmount = 0n;
            let matchAmountInUsd = 0;

            if (strategy) {
                strategyTimings = await getStrategyTimings(
                    this.viemClient,
                    strategy,
                    strategyAddress,
                );

                //when creating strategy handlers, should this be moved there?
                if (
                    strategy.name ===
                        "allov2.DonationVotingMerkleDistributionDirectTransferStrategy" &&
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
            const createdBy =
                txFrom ?? (await this.viemClient.getTransaction({ hash: txHash })).from;

            const roundRoles = this.getRoundRoles(poolId);

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
        } catch (error: unknown) {
            console.error(
                `An error occurred while processing the PoolCreated event. Event: ${this.event} - Error: ${error}`,
            );
            return [];
        }
    }

    /**
     * Get the manager and admin roles for the pool
     * Note: POOL_MANAGER_ROLE = bytes32(poolId);
     * Note: POOL_ADMIN_ROLE = keccak256(abi.encodePacked(poolId, "admin"));
     * @param poolId - The ID of the pool.
     * @returns The manager and admin roles.
     */
    private getRoundRoles(poolId: bigint): { managerRole: string; adminRole: string } {
        // POOL_MANAGER_ROLE = bytes32(poolId);
        const managerRole = pad(`0x${poolId.toString(16)}`);

        // POOL_ADMIN_ROLE = keccak256(abi.encodePacked(poolId, "admin"));
        const adminRawRole = encodePacked(["uint256", "string"], [poolId, "admin"]);
        const adminRole = keccak256(adminRawRole);
        return { managerRole, adminRole };
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
        const changes: Changeset[] = [];
        const allPendingRoles: PendingRoundRole[] = [];

        for (const roleName of ["admin", "manager"] as const) {
            const pendingRoles = await this.roundRepository.getPendingRoundRoles(chainId, roleName);
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
        const tokenPrice = await this.pricingProvider.getTokenPrice(
            this.chainId,
            token.address,
            timestamp,
            timestamp + 1200000,
        );

        if (!tokenPrice) {
            throw new Error("Token price not found");
        }

        return calculateAmountInUsd(amount, tokenPrice.priceUsd, token.decimals);
    }
}
