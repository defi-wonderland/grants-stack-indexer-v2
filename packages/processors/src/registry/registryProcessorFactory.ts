// registry processor factory for each of the events

import { PublicClient } from "viem";

import { IMetadataProvider } from "@grants-stack-indexer/metadata";
import { IPricingProvider } from "@grants-stack-indexer/pricing";
import { ProtocolEvent, RegistryEvent } from "@grants-stack-indexer/shared";

import { UnsupportedEventException } from "../exceptions/unsupportedEvent.exception.js";
import { IEventHandler, IEventHandlerFactory } from "../internal.js";
import { RoleGrantedHandler } from "./handlers/roleGranted.handler.js";

export class RegistryHandlerFactory implements IEventHandlerFactory<"Registry", RegistryEvent> {
    public createHandler(
        event: ProtocolEvent<"Registry", RegistryEvent>,
        pricingProvider: IPricingProvider,
        metadataProvider: IMetadataProvider,
        viemProvider: PublicClient,
    ): IEventHandler {
        if (isRoleGranted(event)) {
            return new RoleGrantedHandler(event, pricingProvider, metadataProvider, viemProvider);
        }
        throw new UnsupportedEventException("Registry", event.eventName as string);
    }
}

const isRoleGranted = (
    event: ProtocolEvent<"Registry", RegistryEvent>,
): event is ProtocolEvent<"Registry", "RoleGranted"> => {
    return event.eventName === "RoleGranted";
};
