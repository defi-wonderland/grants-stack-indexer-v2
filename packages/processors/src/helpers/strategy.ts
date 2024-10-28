import type { EvmProvider } from "@grants-stack-indexer/chain-providers";
import type { Address } from "@grants-stack-indexer/shared";

import DirectGrantsLiteStrategy from "../abis/allo-v2/v1/DirectGrantsLiteStrategy.js";
import { StrategyTimings } from "../internal.js";
import { getDateFromTimestamp } from "./utils.js";

//TODO: move this to the DirectGrantsStrategyHandler when implemented
/**
 * Gets the strategy data for the DirectGrantsStrategy
 * @param evmProvider - The evm provider
 * @param strategyAddress - The address of the strategy
 * @returns The strategy data
 */
export const getDirectGrantsStrategyTimings = async (
    evmProvider: EvmProvider,
    strategyAddress: Address,
): Promise<StrategyTimings> => {
    let results: [bigint, bigint] = [0n, 0n];

    const contractCalls = [
        {
            abi: DirectGrantsLiteStrategy,
            functionName: "registrationStartTime",
            address: strategyAddress,
        },
        {
            abi: DirectGrantsLiteStrategy,
            functionName: "registrationEndTime",
            address: strategyAddress,
        },
    ] as const;

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
        )) as [bigint, bigint];
    }

    return {
        applicationsStartTime: getDateFromTimestamp(results[0]),
        applicationsEndTime: getDateFromTimestamp(results[1]),
        donationsStartTime: null,
        donationsEndTime: null,
    };
};
