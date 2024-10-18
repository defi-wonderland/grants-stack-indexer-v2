import { Address } from "@grants-stack-indexer/shared";

export class TokenPriceNotFoundError extends Error {
    constructor(tokenAddress: Address, timestamp: number) {
        super(`Token price not found for token ${tokenAddress} at timestamp ${timestamp}`);
    }
}
