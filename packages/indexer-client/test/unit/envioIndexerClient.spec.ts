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
            rawRequest: vi.fn(),
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
        it("should create a GraphQLClient with the provided URL", () => {
            expect(GraphQLClient).toHaveBeenCalledWith("http://example.com/graphql");
        });

        it("should set the x-hasura-admin-secret header", () => {
            expect(graphqlClient.setHeader).toHaveBeenCalledWith("x-hasura-admin-secret", "secret");
        });
    });

    describe("getEventsByBlockNumberAndLogIndex", () => {
        const mockEvents: AnyProtocolEvent[] = [
            {
                chain_id: 1,
                block_number: 12345,
                block_timestamp: 123123123,
                contract_name: "Allo",
                event_name: "PoolCreated",
                event_id: "123",
                src_address: "0x1234567890123456789012345678901234567890",
                log_index: 0,
                params: { contractAddress: "0x1234" },
            },
        ];

        it("should return events when the query is successful", async () => {
            const mockedResponse = {
                status: 200,
                headers: {},
                data: {
                    raw_events: mockEvents,
                },
            };
            graphqlClient.rawRequest.mockResolvedValue(mockedResponse);

            const result = await envioIndexerClient.getEventsByBlockNumberAndLogIndex(
                1,
                12345,
                0,
                100,
            );
            expect(result).toEqual(mockEvents);
        });

        it("should use default limit when not provided", async () => {
            const mockedResponse = {
                status: 200,
                headers: {},
                data: {
                    raw_events: mockEvents,
                },
            };
            graphqlClient.rawRequest.mockResolvedValue(mockedResponse);

            await envioIndexerClient.getEventsByBlockNumberAndLogIndex(1, 12345, 0);
            expect(graphqlClient.rawRequest).toHaveBeenCalledWith(
                expect.stringContaining("limit: 100"),
            );
        });

        it("should use provided limit", async () => {
            const mockedResponse = {
                status: 200,
                headers: {},
                data: {
                    raw_events: mockEvents,
                },
            };
            graphqlClient.rawRequest.mockResolvedValue(mockedResponse);

            await envioIndexerClient.getEventsByBlockNumberAndLogIndex(1, 12345, 0, 50);
            expect(graphqlClient.rawRequest).toHaveBeenCalledWith(
                expect.stringContaining("limit: 50"),
            );
        });

        it("should throw InvalidIndexerResponse when response structure is incorrect", async () => {
            const mockedResponse = {
                status: 200,
                headers: {},
                data: {
                    raw_events: undefined,
                },
            };
            graphqlClient.rawRequest.mockResolvedValue(mockedResponse);

            await expect(
                envioIndexerClient.getEventsByBlockNumberAndLogIndex(1, 12345, 0),
            ).rejects.toThrow(InvalidIndexerResponse);
        });

        it("should throw IndexerClientError when GraphQL request fails", async () => {
            const error = new Error("GraphQL request failed");
            graphqlClient.rawRequest.mockRejectedValue(error);

            await expect(
                envioIndexerClient.getEventsByBlockNumberAndLogIndex(1, 12345, 0),
            ).rejects.toThrow(IndexerClientError);
        });

        it("should include chainId, blockNumber, and logIndex in the query", async () => {
            const mockedResponse = {
                status: 200,
                headers: {},
                data: {
                    raw_events: mockEvents,
                },
            };
            graphqlClient.rawRequest.mockResolvedValue(mockedResponse);

            await envioIndexerClient.getEventsByBlockNumberAndLogIndex(1, 12345, 0);
            expect(graphqlClient.rawRequest).toHaveBeenCalledWith(
                expect.stringContaining("chain_id: { _eq: 1 }"),
            );
            expect(graphqlClient.rawRequest).toHaveBeenCalledWith(
                expect.stringContaining("block_number: { _gte: 12345 }"),
            );
            expect(graphqlClient.rawRequest).toHaveBeenCalledWith(
                expect.stringContaining("log_index: { _gt: 0 }"),
            );
        });

        it("should return an empty array when no events are found", async () => {
            const mockedResponse = {
                status: 200,
                headers: {},
                data: {
                    raw_events: [],
                },
            };
            graphqlClient.rawRequest.mockResolvedValue(mockedResponse);

            const result = await envioIndexerClient.getEventsByBlockNumberAndLogIndex(1, 12345, 0);
            expect(result).toEqual([]);
        });
    });
});
