import { Branded } from "../internal.js";

export type ChainId = Branded<number, "ChainId">;

export type Bytes32String = Branded<`0x${string}`, "Bytes32String">;
