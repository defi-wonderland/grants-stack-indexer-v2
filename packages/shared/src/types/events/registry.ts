//TODO: remove comment once we support registry events
// export type RegistryEvent =
//     | "ProfileCreated"
//     | "ProfileMetadataUpdated"
//     | "ProfileNameUpdated"
//     | "ProfileOwnerUpdated";

import { Address } from "../../internal.js";

/**
 * This type is used to represent a Registry events.
 */
export type RegistryEvent = "ProfileCreated" | "RoleGranted";

/**
 * This type maps Registry events to their respective parameters.
 */
export type RegistryEventParams<T extends RegistryEvent> = T extends "ProfileCreated"
    ? "ProfileCreatedParams"
    : T extends "RoleGranted"
      ? RoleGrantedParams
      : never;

// =============================================================================
// =============================== Event Parameters ============================
// =============================================================================
export type ProfileCreatedParams = {
    contractAddress: Address;
};
export type RoleGrantedParams = {
    contractAddress: Address;
};
