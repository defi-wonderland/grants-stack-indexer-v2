import { Hex } from "viem";

import { Address } from "../../internal.js";
import { AlloEvent, AlloEventParams, StrategyEvent, StrategyEventParams } from "./index.js";

export type ContractName = "Strategy" | "Allo";
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
    // strategyId should be defined for Strategy events or PoolCreated events in Allo
    strategyId: T extends "Strategy"
        ? Address
        : T extends "Allo"
          ? E extends "PoolCreated"
              ? Address
              : never
          : never;
};

export type AnyProtocolEvent = ProtocolEvent<ContractName, ContractToEventName<ContractName>>;
