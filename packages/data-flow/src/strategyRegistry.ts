import type { Address, Hex } from "viem";

import type { IStrategyRegistry } from "./internal.js";

/**
 * Class to store strategy ids
 */
export class InMemoryStrategyRegistry implements IStrategyRegistry {
    //TODO: Implement storage to persist strategies. since we're using address, do we need ChainId?
    private strategiesMap: Map<Address, Hex> = new Map();

    async getStrategyId(strategyAddress: Address): Promise<Hex | undefined> {
        return this.strategiesMap.get(strategyAddress);
    }

    async saveStrategyId(strategyAddress: Address, strategyId: Hex): Promise<void> {
        this.strategiesMap.set(strategyAddress, strategyId);
    }
}