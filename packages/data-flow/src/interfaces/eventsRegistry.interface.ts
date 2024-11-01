import { AnyEvent, ContractName, ProcessorEvent } from "@grants-stack-indexer/shared";

/**
 * The events registry saves as a checkpoint to the last processed event by the system.
 * This is used to resume the indexing from the last processed event in case of an error or temporary interruption.
 */
export interface IEventsRegistry {
    /**
     * Get the last processed event by the system
     * @returns The last processed event or undefined if no event has been processed yet.
     */
    getLastProcessedEvent(): Promise<ProcessorEvent<ContractName, AnyEvent> | undefined>;
    /**
     * Save the last processed event by the system
     * @param event - The event to save.
     */
    saveLastProcessedEvent(event: ProcessorEvent<ContractName, AnyEvent>): Promise<void>;
}
