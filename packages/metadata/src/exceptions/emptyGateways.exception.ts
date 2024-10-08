export class EmptyGatewaysUrlsException extends Error {
    constructor() {
        super("Gateways array cannot be empty");
    }
}
