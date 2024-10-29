// TODO: Should we validate event params in runtime ? How should we approach that ?

import { Address, AnyEvent, Bytes32String, ContractName, ProcessorEvent } from "../../internal.js";

/**
 * This array is used to represent all Registry events.
 */
const RegistryEventArray = ["ProfileCreated", "RoleGranted"] as const;

/**
 * This type is used to represent a Registry events.
 */
export type RegistryEvent = (typeof RegistryEventArray)[number];

/**
 * This type maps Registry events to their respective parameters.
 */
export type RegistryEventParams<T extends RegistryEvent> = T extends "ProfileCreated"
    ? ProfileCreatedParams
    : T extends "RoleGranted"
      ? RoleGrantedParams
      : never;

// =============================================================================
// =============================== Event Parameters ============================
// =============================================================================
export type ProfileCreatedParams = {
    profileId: Bytes32String;
    nonce: bigint;
    name: string;
    metadata: [protocol: bigint, pointer: string];
    owner: Address;
    anchor: Address;
};
export type RoleGrantedParams = {
    role: Bytes32String;
    account: Address;
    sender: Address;
};

/**
 * Type guard for Registry events.
 * @param event The event to check.
 * @returns True if the event is a Registry event, false otherwise.
 */
export function isRegistryEvent(
    event: ProcessorEvent<ContractName, AnyEvent>,
): event is ProcessorEvent<"Registry", RegistryEvent> {
    return (
        event.contractName === "Registry" &&
        (RegistryEventArray as readonly string[]).includes(event.eventName)
    );
}
