export class InvalidIndexerResponse extends Error {
    constructor(response: string) {
        super(`Indexer response is invalid - ${response}`);
        this.name = "InvalidIndexerResponse";
    }
}
