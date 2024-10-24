import { Changeset } from "@grants-stack-indexer/repository";
import { ContractToEventName, ProtocolEvent } from "@grants-stack-indexer/shared";

/**
 * Interface for an event handler.
 * @template C - The contract name.
 * @template E - The event name.
 */
export interface IStrategyHandler<E extends ContractToEventName<"Strategy">> {
    /**
     * Handles the event.
     * @returns A promise that resolves to an array of changesets.
     */
    handle(event: ProtocolEvent<"Strategy", E>): Promise<Changeset[]>;
}
