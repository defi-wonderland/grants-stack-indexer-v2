export class InvalidCidException extends Error {
    constructor(cid: string) {
        super(`Invalid CID: ${cid}`);
        this.name = "InvalidCidException";
    }
}
