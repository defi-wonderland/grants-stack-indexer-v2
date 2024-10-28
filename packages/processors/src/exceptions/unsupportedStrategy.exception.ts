import { Hex } from "viem";

export class UnsupportedStrategy extends Error {
    constructor(strategyId: Hex) {
        super(`Strategy ${strategyId} unsupported`);
    }
}
