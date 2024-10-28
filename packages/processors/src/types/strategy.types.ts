import { Branded, ChainId, StrategyEvent } from "@grants-stack-indexer/shared";

import { IStrategyHandler } from "../internal.js";
import { ProcessorDependencies } from "./processor.types.js";

export type SanitizedStrategyId = Branded<string, "SanitizedStrategyId">;
export type Strategy = {
    id: SanitizedStrategyId;
    name: string | null;
    // TODO: check if groups are required
    groups: string[];
};

/**
 * This type represents the time fields for a strategy.
 */
export type StrategyTimings = {
    applicationsStartTime: Date | null;
    applicationsEndTime: Date | null;
    donationsStartTime: Date | null;
    donationsEndTime: Date | null;
};

export type StrategyHandlerConstructor = new (
    chainId: ChainId,
    dependencies: ProcessorDependencies,
) => IStrategyHandler<StrategyEvent>;
