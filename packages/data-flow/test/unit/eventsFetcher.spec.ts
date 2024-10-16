import { beforeEach, describe, expect, it, Mocked, vi } from "vitest";

import { IIndexerClient } from "@grants-stack-indexer/indexer-client";
import { AnyProtocolEvent } from "@grants-stack-indexer/shared";

import { EventsFetcher } from "../../src/eventsFetcher.js";

describe("EventsFetcher", () => {
    let indexerClientMock: Mocked<IIndexerClient>;
    let eventsFetcher: EventsFetcher;

    beforeEach(() => {
        indexerClientMock = {
            getEventsAfterBlockNumberAndLogIndex: vi.fn(),
        };

        eventsFetcher = new EventsFetcher(indexerClientMock);
    });

    it("fetches events by block number and log index", async () => {
        const mockEvents: AnyProtocolEvent[] = [
            {
                chainId: 1,
                blockNumber: 12345,
                blockTimestamp: 123123123,
                contractName: "Allo",
                eventName: "PoolCreated",
                srcAddress: "0x1234567890123456789012345678901234567890",
                logIndex: 0,
                params: { contractAddress: "0x1234" },
            },
            {
                chainId: 1,
                blockNumber: 12345,
                blockTimestamp: 123123123,
                contractName: "Allo",
                eventName: "PoolCreated",
                srcAddress: "0x1234567890123456789012345678901234567890",
                logIndex: 0,
                params: { contractAddress: "0x1234" },
            },
        ];
        const chainId = 1n;
        const blockNumber = 1000n;
        const logIndex = 0;
        const limit = 100;

        indexerClientMock.getEventsAfterBlockNumberAndLogIndex.mockResolvedValue(mockEvents);

        const result = await eventsFetcher.fetchEventsByBlockNumberAndLogIndex(
            chainId,
            blockNumber,
            logIndex,
        );

        expect(indexerClientMock.getEventsAfterBlockNumberAndLogIndex).toHaveBeenCalledWith(
            chainId,
            blockNumber,
            logIndex,
            limit,
        );
        expect(result).toEqual(mockEvents);
    });

    it("handles errors thrown by indexer client", async () => {
        const chainId = 1n;
        const blockNumber = 1000n;
        const logIndex = 0;

        indexerClientMock.getEventsAfterBlockNumberAndLogIndex.mockRejectedValue(
            new Error("Network error"),
        );

        await expect(
            eventsFetcher.fetchEventsByBlockNumberAndLogIndex(chainId, blockNumber, logIndex),
        ).rejects.toThrow("Network error");
    });
});
