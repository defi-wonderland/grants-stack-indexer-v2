import type { AnyEvent, ContractName, ProcessorEvent } from "@grants-stack-indexer/shared";

import type { IEventsRegistry } from "./internal.js";

/**
 * Class to store the last processed event in memory
 */
//TODO: Implement storage version to persist the last processed event. we need to store it by chainId
export class InMemoryEventsRegistry implements IEventsRegistry {
    private lastProcessedEvent: ProcessorEvent<ContractName, AnyEvent> | undefined;

    /**
     * @inheritdoc
     */
    async getLastProcessedEvent(): Promise<ProcessorEvent<ContractName, AnyEvent> | undefined> {
        return this.lastProcessedEvent;
    }

    /**
     * @inheritdoc
     */
    async saveLastProcessedEvent(event: ProcessorEvent<ContractName, AnyEvent>): Promise<void> {
        this.lastProcessedEvent = event;
    }
}
