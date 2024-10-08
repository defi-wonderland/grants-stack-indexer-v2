import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { Address, NATIVE_TOKEN_ADDRESS } from "@grants-stack-indexer/shared";

import type { TokenPrice } from "../../src/external.js";
import {
    CoingeckoProvider,
    NetworkException,
    UnsupportedChainException,
} from "../../src/external.js";

describe("CoingeckoProvider", () => {
    let provider: CoingeckoProvider;
    let mock: MockAdapter;

    beforeEach(() => {
        provider = new CoingeckoProvider({
            apiKey: "test-api-key",
            apiType: "demo",
        });
        mock = new MockAdapter(provider["axios"]);
    });

    afterEach(() => {
        mock.reset();
    });

    describe("getTokenPrice", () => {
        it("return token price for a supported chain and valid token", async () => {
            const mockResponse = {
                prices: [[1609459200000, 100]],
            };
            mock.onGet().reply(200, mockResponse);

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
            expect(mock.history.get[0].url).toContain(
                "/coins/ethereum/contract/0x1234567890123456789012345678901234567890/market_chart/range?vs_currency=usd&from=1609459200&to=1609545600&precision=full",
            );
        });

        it("return token price for a supported chain and native token", async () => {
            const mockResponse = {
                prices: [[1609459200000, 100]],
            };
            mock.onGet().reply(200, mockResponse);

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
            expect(mock.history.get[0].url).toContain(
                "/coins/ethereum/market_chart/range?vs_currency=usd&from=1609459200&to=1609545600&precision=full",
            );
        });

        it("return undefined if no price data is available for timerange", async () => {
            const mockResponse = {
                prices: [],
            };
            mock.onGet().reply(200, mockResponse);

            const result = await provider.getTokenPrice(
                1,
                "0x1234567890123456789012345678901234567890" as Address,
                1609459200000,
                1609545600000,
            );

            expect(result).toBeUndefined();
        });

        it("return undefined if 400 family error", async () => {
            mock.onGet().replyOnce(400, "Bad Request");

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

        it("should throw NetworkException for 500 family errors", async () => {
            mock.onGet().reply(500, "Internal Server Error");

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
            mock.onGet().networkErrorOnce();

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
