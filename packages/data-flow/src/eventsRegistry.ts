import { AnyEvent, ContractName, ProcessorEvent } from "@grants-stack-indexer/shared";

/**
 * Class to store the last processed event
 */
export class EventsRegistry {
    //TODO: Implement storage to persist the last processed event
    private lastProcessedEvent: ProcessorEvent<ContractName, AnyEvent> | null = null;

    constructor() {}

    async getLastProcessedEvent(): Promise<ProcessorEvent<ContractName, AnyEvent> | null> {
        return this.lastProcessedEvent;
    }
    async saveLastProcessedEvent(event: ProcessorEvent<ContractName, AnyEvent>): Promise<void> {
        this.lastProcessedEvent = event;
    }
}
