import { Address, AnyEvent, ContractName, ProcessorEvent } from "../../internal.js";

/**
 * This array is used to represent all Allo events.
 */
const AlloEventArray = ["PoolCreated"] as const;

/**
 * This type is used to represent a Allo events.
 */
export type AlloEvent = (typeof AlloEventArray)[number];

/**
 * This type maps Allo events to their respective parameters.
 */
export type AlloEventParams<T extends AlloEvent> = T extends "PoolCreated"
    ? PoolCreatedParams
    : never;

// =============================================================================
// =============================== Event Parameters ============================
// =============================================================================
export type PoolCreatedParams = {
    strategy: Address;
    poolId: bigint;
    profileId: Address;
    token: Address;
    amount: bigint;
    metadata: [protocol: bigint, pointer: string];
};

/**
 * Type guard for Allo events.
 * @param event The event to check.
 * @returns True if the event is a Allo event, false otherwise.
 */
export function isAlloEvent(
    event: ProcessorEvent<ContractName, AnyEvent>,
): event is ProcessorEvent<"Allo", AlloEvent> {
    return (
        event.contractName === "Allo" &&
        (AlloEventArray as readonly string[]).includes(event.eventName)
    );
}
