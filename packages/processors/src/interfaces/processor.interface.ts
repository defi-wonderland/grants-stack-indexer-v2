import { ContractName, ContractToEventName, ProtocolEvent } from "@grants-stack-indexer/shared";

export interface IProcessor<C extends ContractName, E extends ContractToEventName<C>> {
    /**
     * Processes an event from the Allo protocol.
     * @param event - The event to process.
     * @returns A promise that resolves when the event is processed.
     */
    process(event: ProtocolEvent<C, E>): Promise<unknown>;
}
