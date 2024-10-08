import { IIndexerClient } from "@grants-stack-indexer/indexer-client";
import { AnyProtocolEvent } from "@grants-stack-indexer/shared";

import { IEventsFetcher } from "./interfaces/index.js";

export class EventsFetcher implements IEventsFetcher {
    constructor(private indexerClient: IIndexerClient) {}

    async fetcEventsByBlockNumberAndLogIndex(
        chainId: number,
        blockNumber: number,
        logIndex: number,
        limit: number = 100,
    ): Promise<AnyProtocolEvent[]> {
        return await this.indexerClient.getEventsByBlockNumberAndLogIndex(
            chainId,
            blockNumber,
            logIndex,
            limit,
        );
    }
}
