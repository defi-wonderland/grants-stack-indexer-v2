import { Changeset } from "@grants-stack-indexer/repository";
import { ChainId, ProcessorEvent, RegistryEvent } from "@grants-stack-indexer/shared";

import type { IProcessor } from "../internal.js";
import { UnsupportedEventException } from "../internal.js";
import { ProcessorDependencies } from "../types/processor.types.js";
import { ProfileCreatedHandler, RoleGrantedHandler } from "./handlers/index.js";

export class RegistryProcessor implements IProcessor<"Registry", RegistryEvent> {
    constructor(
        private readonly chainId: ChainId,
        private readonly dependencies: ProcessorDependencies,
    ) {}

    async process(event: ProcessorEvent<"Registry", RegistryEvent>): Promise<Changeset[]> {
        //TODO: Implement robust error handling and retry logic
        switch (event.eventName) {
            case "RoleGranted":
                return new RoleGrantedHandler(
                    event as ProcessorEvent<"Registry", "RoleGranted">,
                    this.chainId,
                    this.dependencies,
                ).handle();
            case "ProfileCreated":
                return new ProfileCreatedHandler(
                    event as ProcessorEvent<"Registry", "ProfileCreated">,
                    this.chainId,
                    this.dependencies,
                ).handle();
            default:
                throw new UnsupportedEventException("Registry", event.eventName);
        }
    }
}
