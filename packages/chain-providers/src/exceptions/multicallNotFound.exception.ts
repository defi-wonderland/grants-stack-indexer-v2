export class MulticallNotFound extends Error {
    constructor() {
        super("Multicall contract address not found");
    }
}
