export class RpcUrlsEmpty extends Error {
    constructor() {
        super("RPC URLs array cannot be empty");
        this.name = "RpcUrlsEmpty";
    }
}
