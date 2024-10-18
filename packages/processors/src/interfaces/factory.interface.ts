import { Changeset } from "@grants-stack-indexer/repository";
import {
    ChainId,
    ContractName,
    ContractToEventName,
    ProtocolEvent,
} from "@grants-stack-indexer/shared";

import { ProcessorDependencies } from "../types/processor.types.js";

export interface IEventHandler {
    handle(): Promise<Changeset[]>;
}

export interface IEventHandlerFactory<C extends ContractName, E extends ContractToEventName<C>> {
    createHandler(
        event: ProtocolEvent<C, E>,
        chainId: ChainId,
        dependencies: ProcessorDependencies,
    ): IEventHandler;
}
