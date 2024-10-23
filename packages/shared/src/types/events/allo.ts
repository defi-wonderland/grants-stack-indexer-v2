import { Address } from "../../internal.js";

/**
 * This type is used to represent a Allo events.
 */
export type AlloEvent = "PoolCreated";

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
