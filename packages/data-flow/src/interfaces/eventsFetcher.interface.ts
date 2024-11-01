import { AnyIndexerFetchedEvent, ChainId } from "@grants-stack-indexer/shared";

/**
 * Interface for the events fetcher
 */
export interface IEventsFetcher {
    /**
     * Fetch the events by block number and log index for a chain
     * @param chainId id of the chain
     * @param blockNumber block number to fetch events from
     * @param logIndex log index in the block to fetch events from
     * @param limit limit of events to fetch
     */
    fetchEventsByBlockNumberAndLogIndex(
        chainId: ChainId,
        blockNumber: number,
        logIndex: number,
        limit?: number,
    ): Promise<AnyIndexerFetchedEvent[]>;
}
