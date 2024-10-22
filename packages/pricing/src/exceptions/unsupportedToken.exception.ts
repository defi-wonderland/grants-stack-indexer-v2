import { TokenCode } from "@grants-stack-indexer/shared";

export class UnsupportedToken extends Error {
    constructor(tokenCode: TokenCode) {
        super(`Unsupported token: ${tokenCode}`);
    }
}
