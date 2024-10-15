import { PublicClient } from "viem";

import { IMetadataProvider } from "@grants-stack-indexer/metadata";
import { IPricingProvider } from "@grants-stack-indexer/pricing";
import { Changeset } from "@grants-stack-indexer/repository";
import { ContractName, ContractToEventName, ProtocolEvent } from "@grants-stack-indexer/shared";

export interface IEventHandler {
    handle(): Promise<Changeset[]>;
}

export interface IEventHandlerFactory<C extends ContractName, E extends ContractToEventName<C>> {
    createHandler(
        event: ProtocolEvent<C, E>,
        pricingProvider: IPricingProvider,
        metadataProvider: IMetadataProvider,
        viemProvider: PublicClient,
    ): IEventHandler;
}
