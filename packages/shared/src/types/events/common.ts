import { Address } from "../../internal.js";
import { AlloEvent, AlloEventParams, StrategyEvent, StrategyEventParams } from "./index.js";

export type ContractName = "Strategy" | "Allo";
export type AnyEvent = StrategyEvent | AlloEvent;

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
    block_number: number;
    block_timestamp: number;
    chain_id: number;
    contract_name: T;
    event_id: string;
    event_name: E;
    log_index: number;
    params: EventParams<T, E>;
    src_address: Address;
};

export type AnyProtocolEvent = ProtocolEvent<ContractName, ContractToEventName<ContractName>>;
