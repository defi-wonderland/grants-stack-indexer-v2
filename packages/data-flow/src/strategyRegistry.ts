import { Address, Hex } from "viem";

/**
 * Class to store strategy ids
 */
export class StrategyRegistry {
    //TODO: Implement storage to persist strategies
    private strategiesMap: Map<Address, Hex> = new Map();

    async getStrategyId(strategyAddress: Address): Promise<Hex | undefined> {
        return this.strategiesMap.get(strategyAddress);
    }
    async saveStrategyId(strategyAddress: Address, strategyId: Hex): Promise<void> {
        this.strategiesMap.set(strategyAddress, strategyId);
    }
}
