export class IndexerClientError extends Error {
    constructor(message: string) {
        super(`Indexer client error - ${message}`);
        this.name = "IndexerClientError";
    }
}
