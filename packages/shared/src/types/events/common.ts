import { Hex } from "viem";

import { Address } from "../../internal.js";
import {
    AlloEvent,
    AlloEventParams,
    RegistryEvent,
    RegistryEventParams,
    StrategyEvent,
    StrategyEventParams,
} from "./index.js";

export type ContractName = "Strategy" | "Allo" | "Registry";
export type AnyEvent = StrategyEvent | AlloEvent;

type TransactionFields = {
    hash: Hex;
    transactionIndex: number;
    from?: Address;
};

/**
 * This type is used to map contract names to their respective event names.
 */
export type ContractToEventName<T extends ContractName> = T extends "Allo"
    ? AlloEvent
    : T extends "Strategy"
      ? StrategyEvent
      : T extends "Registry"
        ? RegistryEvent
        : never;

/**
 * This type is used to map contract names to their respective event parameters.
 */
export type EventParams<T extends ContractName, E extends ContractToEventName<T>> = T extends "Allo"
    ? E extends AlloEvent
        ? AlloEventParams<E>
        : never
    : T extends "Strategy"
      ? E extends StrategyEvent
          ? StrategyEventParams<E>
          : never
      : T extends "Registry"
        ? E extends RegistryEvent
            ? RegistryEventParams<E>
            : never
        : never;

/**
 * This type is used to represent a protocol event.
 */
export type ProtocolEvent<T extends ContractName, E extends ContractToEventName<T>> = {
    //TODO: make blocknumber and chainId bigints, implies implementing adapter patterns in the EventsFetcher or IndexerClient
    blockNumber: number;
    blockTimestamp: number;
    chainId: number;
    contractName: T;
    eventName: E;
    logIndex: number;
    params: EventParams<T, E>;
    srcAddress: Address;
    transactionFields: TransactionFields;
} & (T extends "Strategy" // strategyId should be defined for Strategy events or PoolCreated events in Allo
    ? { strategyId: Address }
    : T extends "Allo"
      ? E extends "PoolCreated"
          ? { strategyId: Address }
          : object
      : object);

/**
 * TODO: This type is currently only used in the EventsFetcher and IndexerClient.
 * In the future, we should evaluate if a more decoupled or generic type is needed
 * to improve flexibility and reduce dependencies across different parts of the system.
 * Consider creating separate event types for different contexts if necessary.
 */
export type AnyProtocolEvent = Omit<
    ProtocolEvent<ContractName, ContractToEventName<ContractName>>,
    "strategyId"
>;
