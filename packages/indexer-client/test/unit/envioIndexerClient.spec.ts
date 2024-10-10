import { AnyProtocolEvent } from "@grants-stack-indexer/shared";
import { GraphQLClient } from "graphql-request";
import { afterEach, beforeEach, describe, expect, it, Mocked, vi } from "vitest";

import { IndexerClientError, InvalidIndexerResponse } from "../../src/exceptions/index.js";
import { EnvioIndexerClient } from "../../src/providers/envioIndexerClient.js";

// Mock GraphQLClient
vi.mock("graphql-request", async (importOriginal) => {
    const mod: object = await importOriginal();
    return {
        ...mod,
        GraphQLClient: vi.fn().mockImplementation(() => ({
            setHeader: vi.fn(),
            request: vi.fn(),
        })),
    };
});

describe("EnvioIndexerClient", () => {
    let envioIndexerClient: EnvioIndexerClient;
    let graphqlClient: Mocked<GraphQLClient>;

    beforeEach(() => {
        envioIndexerClient = new EnvioIndexerClient("http://example.com/graphql", "secret");
        graphqlClient = envioIndexerClient["client"] as unknown as Mocked<GraphQLClient>;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("creates a GraphQLClient with the provided URL", () => {
            expect(GraphQLClient).toHaveBeenCalledWith("http://example.com/graphql");
        });

        it("sets the x-hasura-admin-secret header", () => {
            expect(graphqlClient.setHeader).toHaveBeenCalledWith("x-hasura-admin-secret", "secret");
        });
    });

    describe("getEventsAfterBlockNumberAndLogIndex", () => {
        const mockEvents: AnyProtocolEvent[] = [
            {
                chain_id: 1,
                block_number: 12345,
                block_timestamp: 123123123,
                contract_name: "Allo",
                event_name: "PoolCreated",
                src_address: "0x1234567890123456789012345678901234567890",
                log_index: 0,
                params: { contractAddress: "0x1234" },
            },
        ];

        it("returns events when the query is successful", async () => {
            const mockedResponse = {
                status: 200,
                headers: {},
                data: {
                    raw_events: mockEvents,
                },
            };
            graphqlClient.request.mockResolvedValue(mockedResponse);

            const result = await envioIndexerClient.getEventsAfterBlockNumberAndLogIndex(
                1n,
                12345n,
                0,
                100,
            );
            expect(result).toEqual(mockEvents);
        });

        it("throws InvalidIndexerResponse when response structure is incorrect", async () => {
            const mockedResponse = {
                status: 200,
                headers: {},
                data: {
                    raw_events: undefined,
                },
            };
            graphqlClient.request.mockResolvedValue(mockedResponse);

            await expect(
                envioIndexerClient.getEventsAfterBlockNumberAndLogIndex(1n, 12345n, 0),
            ).rejects.toThrow(InvalidIndexerResponse);
        });

        it("throws IndexerClientError when GraphQL request fails", async () => {
            const error = new Error("GraphQL request failed");
            graphqlClient.request.mockRejectedValue(error);

            await expect(
                envioIndexerClient.getEventsAfterBlockNumberAndLogIndex(1n, 12345n, 0),
            ).rejects.toThrow(IndexerClientError);
        });

        it("uses the default limit value when limit is not provided", async () => {
            const mockedResponse = {
                status: 200,
                headers: {},
                data: {
                    raw_events: mockEvents,
                },
            };
            graphqlClient.request.mockResolvedValue(mockedResponse);

            // Call the method without the limit argument
            const result = await envioIndexerClient.getEventsAfterBlockNumberAndLogIndex(
                1n,
                12345n,
                0,
            );

            expect(result).toEqual(mockEvents);
            expect(graphqlClient.request).toHaveBeenCalledWith(
                expect.any(String), // We can check the query string later if necessary
                {
                    chainId: 1n,
                    blockNumber: 12345n,
                    logIndex: 0,
                    limit: 100, // Ensure the default limit is used
                },
            );
        });

        it("returns an empty array when no events are found", async () => {
            const mockedResponse = {
                status: 200,
                headers: {},
                data: {
                    raw_events: [],
                },
            };
            graphqlClient.request.mockResolvedValue(mockedResponse);

            const result = await envioIndexerClient.getEventsAfterBlockNumberAndLogIndex(
                1n,
                12345n,
                0,
            );
            expect(result).toEqual([]);
        });
    });
});