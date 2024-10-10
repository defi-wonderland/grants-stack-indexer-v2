export class UnknownPricingException extends Error {
    constructor(message: string, stack?: string) {
        super(message);
        this.stack = stack;
    }
}
