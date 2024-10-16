import { Changeset } from "@grants-stack-indexer/repository";
import { AlloEvent, ChainId, ProtocolEvent } from "@grants-stack-indexer/shared";

import type { IProcessor, ProcessorDependencies } from "../internal.js";
import { PoolCreatedHandler } from "./handlers/index.js";

export class AlloProcessor implements IProcessor<"Allo", AlloEvent> {
    constructor(
        private readonly chainId: ChainId,
        private readonly dependencies: ProcessorDependencies,
    ) {}

    async process(event: ProtocolEvent<"Allo", AlloEvent>): Promise<Changeset[]> {
        switch (event.eventName) {
            case "PoolCreated":
                return new PoolCreatedHandler(event, this.chainId, {
                    evmProvider: this.dependencies.evmProvider,
                    pricingProvider: this.dependencies.pricingProvider,
                    metadataProvider: this.dependencies.metadataProvider,
                    roundRepository: this.dependencies.roundRepository,
                }).handle();
            default:
                throw new Error(`Unknown event name: ${event.eventName}`);
        }
    }
}
