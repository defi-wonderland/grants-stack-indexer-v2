import { Address } from "viem";

export const NATIVE_TOKEN_ADDRESS: Address = "0x0000000000000000000000000000000000000001";

export const isNativeToken = (address: Address): boolean => {
    return address === NATIVE_TOKEN_ADDRESS;
};
