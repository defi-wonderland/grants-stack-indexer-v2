import { Hex } from "viem";

import { Address, AnyEvent, ContractName, ProcessorEvent } from "../../internal.js";

/**
 * This array is used to represent all Strategy events.
 */
const StrategyEventArray = [
    "Registered",
    "Distributed",
    "TimestampsUpdated",
    "AllocatedWithToken",
] as const;

/**
 * This type is used to represent a Strategy events.
 */
export type StrategyEvent = (typeof StrategyEventArray)[number];

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

/**
 * Type guard for Strategy events.
 * @param event The event to check.
 * @returns True if the event is a Strategy event, false otherwise.
 */
export function isStrategyEvent(
    event: ProcessorEvent<ContractName, AnyEvent>,
): event is ProcessorEvent<"Strategy", StrategyEvent> {
    return (
        event.contractName === "Strategy" &&
        (StrategyEventArray as readonly string[]).includes(event.eventName)
    );
}
