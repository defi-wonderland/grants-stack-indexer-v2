import { Chain, PublicClient, Transport } from "viem";

import type { IMetadataProvider } from "@grants-stack-indexer/metadata";
import type { IPricingProvider } from "@grants-stack-indexer/pricing";
import { Changeset, IRoundReadRepository } from "@grants-stack-indexer/repository";
import { AlloEvent, ChainId, ProtocolEvent } from "@grants-stack-indexer/shared";

import type { IProcessor } from "../internal.js";
import { PoolCreatedHandler } from "./handlers/index.js";

export class AlloProcessor implements IProcessor<"Allo", AlloEvent> {
    constructor(
        private readonly chainId: ChainId,
        //TODO: replace with provider abstraction
        private readonly viemClient: PublicClient<Transport, Chain>,
        private readonly pricingProvider: IPricingProvider,
        private readonly metadataProvider: IMetadataProvider,
        private readonly roundRepository: IRoundReadRepository,
    ) {}

    async process(event: ProtocolEvent<"Allo", AlloEvent>): Promise<Changeset[]> {
        switch (event.eventName) {
            case "PoolCreated":
                return new PoolCreatedHandler(event, this.chainId, {
                    viemClient: this.viemClient,
                    pricingProvider: this.pricingProvider,
                    metadataProvider: this.metadataProvider,
                    roundRepository: this.roundRepository,
                }).handle();
            default:
                throw new Error(`Unknown event name: ${event.eventName}`);
        }
    }
}
