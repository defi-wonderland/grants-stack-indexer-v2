import { Abi, AbiConstructor } from "abitype";

export type AbiWithConstructor = readonly [AbiConstructor, ...Abi];
