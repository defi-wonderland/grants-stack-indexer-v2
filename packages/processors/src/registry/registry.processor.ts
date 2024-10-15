import { PublicClient } from "viem";

import { IMetadataProvider } from "@grants-stack-indexer/metadata";
import { IPricingProvider } from "@grants-stack-indexer/pricing";
import { Changeset } from "@grants-stack-indexer/repository";
import { ProtocolEvent, RegistryEvent } from "@grants-stack-indexer/shared";

import type { IProcessor } from "../internal.js";
import { RegistryHandlerFactory } from "./registryProcessorFactory.js";

export class RegistryProcessor implements IProcessor<"Registry", RegistryEvent> {
    private factory: RegistryHandlerFactory = new RegistryHandlerFactory();
    constructor(
        private readonly pricingProvider: IPricingProvider,
        private readonly metadataProvider: IMetadataProvider,
        private readonly viemProvider: PublicClient,
    ) {}
    //TODO: Implement
    async process(_event: ProtocolEvent<"Registry", RegistryEvent>): Promise<Changeset[]> {
        return await this.factory
            .createHandler(_event, this.pricingProvider, this.metadataProvider, this.viemProvider)
            .handle();
        throw new Error("Method not implemented.");
    }
}
