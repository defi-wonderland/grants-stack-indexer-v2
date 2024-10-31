import { Address, Hex } from "viem";

/**
 * The strategy registry saves the mapping between the strategy address and the strategy id. Serves as a Cache
 * to avoid having to read from the chain to get the strategy id every time.
 */
//TODO: implement a mechanism to record Strategy that we still don't have a corresponding handler
// we need to store and mark that this strategy is not handled yet, so when it's supported we can process all of the pending events for it
export interface IStrategyRegistry {
    /**
     * Get the strategy id by the strategy address
     * @param strategyAddress - The strategy address
     * @returns The strategy id or undefined if the strategy address is not registered
     */
    getStrategyId(strategyAddress: Address): Promise<Hex | undefined>;
    /**
     * Save the strategy id by the strategy address
     * @param strategyAddress - The strategy address
     * @param strategyId - The strategy id
     */
    saveStrategyId(strategyAddress: Address, strategyId: Hex): Promise<void>;
}
