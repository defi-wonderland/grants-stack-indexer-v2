import type { Changeset } from "@grants-stack-indexer/repository";
import type {
    ContractName,
    ContractToEventName,
    ProcessorEvent,
} from "@grants-stack-indexer/shared";

/**
 * Interface for an event handler.
 * @template C - The contract name.
 * @template E - The event name.
 */
export interface IEventHandler<C extends ContractName, E extends ContractToEventName<C>> {
    /**
     * The event to handle.
     */
    readonly event: ProcessorEvent<C, E>;

    /**
     * Handles the event.
     * @returns A promise that resolves to an array of changesets.
     */
    handle(): Promise<Changeset[]>;
}
