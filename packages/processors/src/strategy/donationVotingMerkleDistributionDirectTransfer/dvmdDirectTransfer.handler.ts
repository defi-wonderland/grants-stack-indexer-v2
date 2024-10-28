import { parseUnits } from "viem";

import { Changeset } from "@grants-stack-indexer/repository";
import {
    Address,
    ChainId,
    ProtocolEvent,
    StrategyEvent,
    Token,
} from "@grants-stack-indexer/shared";

import type { ProcessorDependencies, StrategyTimings } from "../../internal.js";
import DonationVotingMerkleDistributionDirectTransferStrategy from "../../abis/allo-v2/v1/DonationVotingMerkleDistributionDirectTransferStrategy.js";
import { calculateAmountInUsd, getDateFromTimestamp } from "../../helpers/index.js";
import { TokenPriceNotFoundError, UnsupportedEventException } from "../../internal.js";
import { BaseDistributedHandler, BaseStrategyHandler } from "../common/index.js";
import { DVMDRegisteredHandler } from "./handlers/index.js";

type Dependencies = Pick<
    ProcessorDependencies,
    "projectRepository" | "roundRepository" | "metadataProvider" | "evmProvider" | "pricingProvider"
>;

const STRATEGY_NAME = "allov2.DonationVotingMerkleDistributionDirectTransferStrategy";

// sometimes coingecko returns no prices for 1 hour range, 2 hours works better
export const TIMESTAMP_DELTA_RANGE = 2 * 60 * 60 * 1000;

/**
 * This handler is responsible for processing events related to the
 * Donation Voting Merkle Distribution Direct Transfer strategy.
 *
 * The following events are currently handled by this strategy:
 * - Registered
 * - Distributed
 */

export class DVMDDirectTransferStrategyHandler extends BaseStrategyHandler {
    constructor(
        private readonly chainId: ChainId,
        private readonly dependencies: Dependencies,
    ) {
        super(STRATEGY_NAME);
    }

    /** @inheritdoc */
    async handle(event: ProtocolEvent<"Strategy", StrategyEvent>): Promise<Changeset[]> {
        switch (event.eventName) {
            case "Registered":
                return new DVMDRegisteredHandler(
                    event as ProtocolEvent<"Strategy", "Registered">,
                    this.chainId,
                    this.dependencies,
                ).handle();
            case "Distributed":
                return new BaseDistributedHandler(
                    event as ProtocolEvent<"Strategy", "Distributed">,
                    this.chainId,
                    this.dependencies,
                ).handle();
            default:
                throw new UnsupportedEventException("Strategy", event.eventName);
        }
    }

    /** @inheritdoc */
    override async fetchMatchAmount(
        matchingFundsAvailable: number,
        token: Token,
        blockTimestamp: number,
    ): Promise<{ matchAmount: bigint; matchAmountInUsd: string }> {
        const matchAmount = parseUnits(matchingFundsAvailable.toString(), token.decimals);

        const matchAmountInUsd = await this.getTokenAmountInUsd(token, matchAmount, blockTimestamp);

        return {
            matchAmount,
            matchAmountInUsd,
        };
    }

    /** @inheritdoc */
    override async fetchStrategyTimings(strategyId: Address): Promise<StrategyTimings> {
        const { evmProvider } = this.dependencies;
        let results: [bigint, bigint, bigint, bigint] = [0n, 0n, 0n, 0n];

        const contractCalls = [
            {
                abi: DonationVotingMerkleDistributionDirectTransferStrategy,
                functionName: "registrationStartTime",
                address: strategyId,
            },
            {
                abi: DonationVotingMerkleDistributionDirectTransferStrategy,
                functionName: "registrationEndTime",
                address: strategyId,
            },
            {
                abi: DonationVotingMerkleDistributionDirectTransferStrategy,
                functionName: "allocationStartTime",
                address: strategyId,
            },
            {
                abi: DonationVotingMerkleDistributionDirectTransferStrategy,
                functionName: "allocationEndTime",
                address: strategyId,
            },
        ] as const;

        // TODO: refactor when evmProvider implements this natively
        if (evmProvider.getMulticall3Address()) {
            results = await evmProvider.multicall({
                contracts: contractCalls,
                allowFailure: false,
            });
        } else {
            results = (await Promise.all(
                contractCalls.map((call) =>
                    evmProvider.readContract(call.address, call.abi, call.functionName),
                ),
            )) as [bigint, bigint, bigint, bigint];
        }

        return {
            applicationsStartTime: getDateFromTimestamp(results[0]),
            applicationsEndTime: getDateFromTimestamp(results[1]),
            donationsStartTime: getDateFromTimestamp(results[2]),
            donationsEndTime: getDateFromTimestamp(results[3]),
        };
    }

    /**
     * Get the amount in USD for a given token and amount and timestamp
     * @param token - The token
     * @param amount - The amount
     * @param timestamp - The timestamp
     * @returns The amount in USD
     * @throws TokenPriceNotFoundError if the token price is not found
     */
    private async getTokenAmountInUsd(
        token: Token,
        amount: bigint,
        timestamp: number,
    ): Promise<string> {
        const { pricingProvider } = this.dependencies;
        const tokenPrice = await pricingProvider.getTokenPrice(
            token.priceSourceCode,
            timestamp,
            timestamp + TIMESTAMP_DELTA_RANGE,
        );

        if (!tokenPrice) {
            throw new TokenPriceNotFoundError(token.address, timestamp);
        }

        return calculateAmountInUsd(amount, tokenPrice.priceUsd, token.decimals);
    }
}
