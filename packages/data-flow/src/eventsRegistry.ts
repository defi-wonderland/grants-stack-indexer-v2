import type { AnyEvent, ContractName, ProcessorEvent } from "@grants-stack-indexer/shared";

import type { IEventsRegistry } from "./internal.js";

/**
 * Class to store the last processed event
 */
export class InMemoryEventsRegistry implements IEventsRegistry {
    //TODO: Implement storage to persist the last processed event. we need to store it by chainId
    private lastProcessedEvent: ProcessorEvent<ContractName, AnyEvent> | undefined;

    async getLastProcessedEvent(): Promise<ProcessorEvent<ContractName, AnyEvent> | undefined> {
        return this.lastProcessedEvent;
    }

    async saveLastProcessedEvent(event: ProcessorEvent<ContractName, AnyEvent>): Promise<void> {
        this.lastProcessedEvent = event;
    }
}
