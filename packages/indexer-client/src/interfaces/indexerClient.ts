import { AnyIndexerFetchedEvent, ChainId } from "@grants-stack-indexer/shared";

/**
 * Interface for the indexer client
 */
export interface IIndexerClient {
    /**
     * Get the events by block number and log index from the indexer service
     * @param chainId Id of the chain
     * @param fromBlock Block number to start fetching events from
     * @param logIndex Log index in the block
     * @param limit Limit of events to fetch
     */
    getEventsAfterBlockNumberAndLogIndex(
        chainId: ChainId,
        fromBlock: number,
        logIndex: number,
        limit?: number,
    ): Promise<AnyIndexerFetchedEvent[]>;
}
