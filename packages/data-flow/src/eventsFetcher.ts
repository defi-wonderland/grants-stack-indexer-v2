import { IIndexerClient } from "@grants-stack-indexer/indexer-client";
import { AnyProtocolEvent } from "@grants-stack-indexer/shared";

import { IEventsFetcher } from "./interfaces/index.js";

export class EventsFetcher implements IEventsFetcher {
    constructor(private indexerClient: IIndexerClient) {}
    /* @inheritdoc */
    async fetchEventsByBlockNumberAndLogIndex(
        chainId: bigint,
        blockNumber: bigint,
        logIndex: number,
        limit: number = 100,
    ): Promise<AnyProtocolEvent[]> {
        return await this.indexerClient.getEventsAfterBlockNumberAndLogIndex(
            chainId,
            blockNumber,
            logIndex,
            limit,
        );
    }
}
