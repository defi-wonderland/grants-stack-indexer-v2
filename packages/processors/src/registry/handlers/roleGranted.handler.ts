import { PublicClient } from "viem";

import { IMetadataProvider } from "@grants-stack-indexer/metadata";
import { IPricingProvider } from "@grants-stack-indexer/pricing";
import { Changeset } from "@grants-stack-indexer/repository";
import { ProtocolEvent } from "@grants-stack-indexer/shared";

import { IEventHandler } from "../../internal.js";

export class RoleGrantedHandler implements IEventHandler {
    constructor(
        private readonly event: ProtocolEvent<"Registry", "RoleGranted">,
        private readonly pricingProvider: IPricingProvider,
        private readonly metadataProvider: IMetadataProvider,
        private readonly viemProvider: PublicClient,
    ) {}
    async handle(): Promise<Changeset[]> {
        return [];
    }
}
