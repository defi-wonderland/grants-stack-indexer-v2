import type { Changeset } from "@grants-stack-indexer/repository";
import { ContractName, ContractToEventName, ProcessorEvent } from "@grants-stack-indexer/shared";

export interface IProcessor<C extends ContractName, E extends ContractToEventName<C>> {
    /**
     * Processes an event from the Allo protocol.
     * @param event - The event to process.
     * @returns A promise that resolves to a changeset.
     */
    process(event: ProcessorEvent<C, E>): Promise<Changeset[]>;
}
