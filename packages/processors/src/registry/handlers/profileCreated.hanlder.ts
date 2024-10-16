import { PublicClient } from "viem";

import { IMetadataProvider } from "@grants-stack-indexer/metadata";
import { IPricingProvider } from "@grants-stack-indexer/pricing";
import { Changeset, IProjectReadRepository } from "@grants-stack-indexer/repository";
import { ProtocolEvent } from "@grants-stack-indexer/shared";

import { IEventHandler } from "../../internal.js";

export class ProfileCreatedHandler implements IEventHandler {
    constructor(
        private readonly event: ProtocolEvent<"Registry", "ProfileCreated">,
        private readonly pricingProvider: IPricingProvider,
        private readonly metadataProvider: IMetadataProvider,
        private readonly projectRepository: IProjectReadRepository,
        private readonly viemProvider: PublicClient,
    ) {}
    async handle(): Promise<Changeset[]> {
        return [];
    }
}
