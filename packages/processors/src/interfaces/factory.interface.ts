import {
    ChainId,
    ContractName,
    ContractToEventName,
    ProcessorEvent,
} from "@grants-stack-indexer/shared";

import { ProcessorDependencies } from "../types/processor.types.js";
import { IEventHandler } from "./index.js";

export interface IEventHandlerFactory<C extends ContractName, E extends ContractToEventName<C>> {
    createHandler(
        event: ProcessorEvent<C, E>,
        chainId: ChainId,
        dependencies: ProcessorDependencies,
    ): IEventHandler<C, E>;
}
