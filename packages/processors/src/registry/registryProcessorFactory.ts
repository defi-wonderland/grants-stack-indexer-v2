import { ChainId, ProtocolEvent, RegistryEvent } from "@grants-stack-indexer/shared";

import { UnsupportedEventException } from "../exceptions/unsupportedEvent.exception.js";
import { IEventHandler, IEventHandlerFactory } from "../internal.js";
import { ProcessorDependencies } from "../types/processor.types.js";
import { RoleGrantedHandler } from "./handlers/roleGranted.handler.js";

export class RegistryHandlerFactory implements IEventHandlerFactory<"Registry", RegistryEvent> {
    public createHandler(
        event: ProtocolEvent<"Registry", RegistryEvent>,
        chainId: ChainId,
        dependencies: ProcessorDependencies,
    ): IEventHandler {
        if (isRoleGranted(event)) {
            return new RoleGrantedHandler(event, chainId, dependencies);
        }
        throw new UnsupportedEventException("Registry", event.eventName as string);
    }
}

const isRoleGranted = (
    event: ProtocolEvent<"Registry", RegistryEvent>,
): event is ProtocolEvent<"Registry", "RoleGranted"> => {
    return event.eventName === "RoleGranted";
};
