import { Address, Hex } from "viem";

export interface IStrategyRegistry {
    getStrategyId(strategyAddress: Address): Promise<Hex | undefined>;
    saveStrategyId(strategyAddress: Address, strategyId: Hex): Promise<void>;
}
