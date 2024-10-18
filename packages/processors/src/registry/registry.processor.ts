import { Changeset } from "@grants-stack-indexer/repository";
import { ChainId, ProtocolEvent, RegistryEvent } from "@grants-stack-indexer/shared";

import type { IProcessor } from "../internal.js";
import { ProcessorDependencies } from "../types/processor.types.js";
import { RegistryHandlerFactory } from "./registryProcessorFactory.js";

export class RegistryProcessor implements IProcessor<"Registry", RegistryEvent> {
    private factory: RegistryHandlerFactory = new RegistryHandlerFactory();
    constructor(
        private readonly chainId: ChainId,
        private readonly dependencies: ProcessorDependencies,
    ) {}
    //TODO: Implement
    async process(_event: ProtocolEvent<"Registry", RegistryEvent>): Promise<Changeset[]> {
        return await this.factory.createHandler(_event, this.chainId, this.dependencies).handle();
    }
}
