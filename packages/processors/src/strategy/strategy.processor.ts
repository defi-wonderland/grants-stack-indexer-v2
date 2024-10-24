import { Changeset } from "@grants-stack-indexer/repository";
import { ChainId, ProtocolEvent, StrategyEvent } from "@grants-stack-indexer/shared";

import type { IProcessor, ProcessorDependencies } from "../internal.js";
import { StrategyHandlerFactory } from "./strategyHandler.factory.js";

export class StrategyProcessor implements IProcessor<"Strategy", StrategyEvent> {
    constructor(
        private readonly chainId: ChainId,
        private readonly dependencies: ProcessorDependencies,
    ) {}

    async process(event: ProtocolEvent<"Strategy", StrategyEvent>): Promise<Changeset[]> {
        const strategyId = event.strategyId;

        return StrategyHandlerFactory.createHandler(
            this.chainId,
            this.dependencies,
            strategyId,
        ).handle(event);
    }
}
