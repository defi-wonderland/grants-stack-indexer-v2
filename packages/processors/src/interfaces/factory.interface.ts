import {
    ChainId,
    ContractName,
    ContractToEventName,
    ProtocolEvent,
} from "@grants-stack-indexer/shared";

import { ProcessorDependencies } from "../types/processor.types.js";
import { IEventHandler } from "./index.js";

export interface IEventHandlerFactory<C extends ContractName, E extends ContractToEventName<C>> {
    createHandler(
        event: ProtocolEvent<C, E>,
        chainId: ChainId,
        dependencies: ProcessorDependencies,
    ): IEventHandler<C, E>;
}
