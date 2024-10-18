import * as b from "bignumber.js";

export const BigNumber = b.BigNumber.clone({ EXPONENTIAL_AT: 32 });
export type BigNumberType = typeof BigNumber;
