import axios, { isAxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Address, NATIVE_TOKEN_ADDRESS } from "@grants-stack-indexer/shared";

import type { TokenPrice } from "../../src/external.js";
import {
    CoingeckoProvider,
    NetworkException,
    UnsupportedChainException,
} from "../../src/external.js";

const mock = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
}));

vi.mock("axios", async (importActual) => {
    const actual = await importActual<typeof import("axios")>();

    const mockAxios = {
        default: {
            ...actual.default,
            create: vi.fn(() => ({
                ...actual.default.create(),
                get: mock.get,
                post: mock.post,
            })),
        },
        isAxiosError: actual.isAxiosError, // Return it directly from the mock
    };

    return mockAxios;
});
describe("CoingeckoProvider", () => {
    let provider: CoingeckoProvider;

    beforeEach(() => {
        provider = new CoingeckoProvider({
            apiKey: "test-api-key",
            apiType: "demo",
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("getTokenPrice", () => {
        it("return token price for a supported chain and valid token", async () => {
            const mockResponse = {
                prices: [[1609459200000, 100]],
            };
            mock.get.mockResolvedValueOnce({ status: 200, data: mockResponse });

            const result = await provider.getTokenPrice(
                1,
                "0x1234567890123456789012345678901234567890" as Address,
                1609459200000,
                1609545600000,
            );

            const expectedPrice: TokenPrice = {
                timestampMs: 1609459200000,
                priceUsd: 100,
            };

            expect(result).toEqual(expectedPrice);
            expect(mock.get).toHaveBeenCalledWith(
                "/coins/ethereum/contract/0x1234567890123456789012345678901234567890/market_chart/range?vs_currency=usd&from=1609459200&to=1609545600&precision=full",
            );
        });

        it("return token price for a supported chain and native token", async () => {
            const mockResponse = {
                prices: [[1609459200000, 100]],
            };
            mock.get.mockResolvedValueOnce({ status: 200, data: mockResponse });

            const result = await provider.getTokenPrice(
                10,
                NATIVE_TOKEN_ADDRESS,
                1609459200000,
                1609545600000,
            );

            const expectedPrice: TokenPrice = {
                timestampMs: 1609459200000,
                priceUsd: 100,
            };

            expect(result).toEqual(expectedPrice);
            expect(mock.get).toHaveBeenCalledWith(
                "/coins/ethereum/market_chart/range?vs_currency=usd&from=1609459200&to=1609545600&precision=full",
            );
        });

        it("return undefined if no price data is available for timerange", async () => {
            const mockResponse = {
                prices: [],
            };
            mock.get.mockResolvedValueOnce({ status: 200, data: mockResponse });

            const result = await provider.getTokenPrice(
                1,
                "0x1234567890123456789012345678901234567890" as Address,
                1609459200000,
                1609545600000,
            );

            expect(result).toBeUndefined();
        });

        it("return undefined when endTimestamp is greater than startTimestamp", async () => {
            const result = await provider.getTokenPrice(
                1,
                "0x1234567890123456789012345678901234567890" as Address,
                1609545600000, // startTimestamp
                1609459200000, // endTimestamp
            );

            expect(result).toBeUndefined();
        });

        it("return undefined if 400 family error", async () => {
            mock.get.mockRejectedValueOnce({
                status: 400,
                data: "Bad Request",
                isAxiosError: true,
            });

            const result = await provider.getTokenPrice(
                1,
                "0x1234567890123456789012345678901234567890" as Address,
                1609459200000,
                1609545600000,
            );

            expect(result).toBeUndefined();
        });

        it("throw UnsupportedChainException for unsupported chain", async () => {
            await expect(() =>
                provider.getTokenPrice(
                    999999, // Unsupported chain ID
                    "0x1234567890123456789012345678901234567890" as Address,
                    1609459200000,
                    1609545600000,
                ),
            ).rejects.toThrow(UnsupportedChainException);
        });

        it("throws NetworkException for 500 family errors", async () => {
            mock.get.mockRejectedValueOnce({
                status: 500,
                data: "Internal Server Error",
                isAxiosError: true,
            });
            await expect(
                provider.getTokenPrice(
                    1,
                    "0x1234567890123456789012345678901234567890" as Address,
                    1609459200000,
                    1609545600000,
                ),
            ).rejects.toThrow(NetworkException);
        });

        it("throw NetworkException for network errors", async () => {
            mock.get.mockRejectedValueOnce({
                status: 500,
                data: "Network Error",
                isAxiosError: true,
            });

            await expect(
                provider.getTokenPrice(
                    1,
                    "0x1234567890123456789012345678901234567890" as Address,
                    1609459200000,
                    1609545600000,
                ),
            ).rejects.toThrow(NetworkException);
        });
    });
});
