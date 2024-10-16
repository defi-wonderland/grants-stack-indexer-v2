export class DataDecodeException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DataDecodeException";
    }
}
