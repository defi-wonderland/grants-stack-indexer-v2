import { Address } from "viem";

import { Bytes32String } from "../internal.js";

export const ALLO_OWNER_ROLE =
    "0x815b5a78dc333d344c7df9da23c04dbd432015cc701876ddb9ffe850e6882747" as Bytes32String;

export const NATIVE_TOKEN_ADDRESS: Address = "0x0000000000000000000000000000000000000001";

export const isNativeToken = (address: Address): boolean => {
    return address === NATIVE_TOKEN_ADDRESS;
};
