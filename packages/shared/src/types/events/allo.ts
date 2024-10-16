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
    contractAddress: Address;
    poolId: bigint;
    profileId: Address;
    strategyId: Address;
    token: Address;
    amount: bigint;
    metadata: [pointer: string, protocol: bigint];
};
