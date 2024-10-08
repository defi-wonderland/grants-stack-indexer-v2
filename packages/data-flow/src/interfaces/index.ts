import { AnyProtocolEvent } from "@grants-stack-indexer/shared";

export interface IEventsFetcher {
    fetcEventsByBlockNumberAndLogIndex(
        chainId: number,
        blockNumber: number,
        logIndex: number,
        limit?: number,
    ): Promise<AnyProtocolEvent[]>;
}
