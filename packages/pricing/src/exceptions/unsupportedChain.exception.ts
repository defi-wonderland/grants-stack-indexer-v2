export class UnsupportedChainException extends Error {
    constructor(chainId: number) {
        super(`Unsupported chain ID: ${chainId}`);
    }
}
