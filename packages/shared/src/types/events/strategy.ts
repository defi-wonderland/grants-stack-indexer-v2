import { Hex } from "viem";

import { Address } from "../../internal.js";

/**
 * This type is used to represent a Strategy events.
 */
export type StrategyEvent =
    | "Registered"
    | "Distributed"
    | "TimestampsUpdated"
    | "AllocatedWithToken";
/**
 * This type maps Strategy events to their respective parameters.
 */
export type StrategyEventParams<T extends StrategyEvent> = T extends "Registered"
    ? RegisteredParams
    : T extends "Distributed"
      ? DistributedParams
      : T extends "TimestampsUpdated"
        ? TimestampsUpdatedParams
        : T extends "AllocatedWithToken"
          ? AllocatedWithTokenParams
          : never;

// =============================================================================
// =============================== Event Parameters ============================
// =============================================================================
export type RegisteredParams = {
    recipientId: Address;
    data: Hex;
    sender: Address;
};

export type DistributedParams = {
    recipientAddress: Address;
    recipientId: Address;
    sender: Address;
    amount: number;
};

export type TimestampsUpdatedParams = {
    contractAddress: Address;
    timestamp: number;
};

export type AllocatedWithTokenParams = {
    contractAddress: Address;
    tokenAddress: Address;
    amount: number;
};
