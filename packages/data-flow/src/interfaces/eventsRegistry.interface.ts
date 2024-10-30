import { AnyEvent, ContractName, ProcessorEvent } from "@grants-stack-indexer/shared";

export interface IEventsRegistry {
    getLastProcessedEvent(): Promise<ProcessorEvent<ContractName, AnyEvent> | undefined>;
    saveLastProcessedEvent(event: ProcessorEvent<ContractName, AnyEvent>): Promise<void>;
}
