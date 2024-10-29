import { AnyEvent, ContractName, ProcessorEvent } from "@grants-stack-indexer/shared";

export class InvalidEvent extends Error {
    constructor(event: ProcessorEvent<ContractName, AnyEvent>) {
        super(`Event couldn't be processed: ${event}`);
    }
}
