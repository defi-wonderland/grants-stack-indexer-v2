import { isNativeError } from "util/types";
import axios, { AxiosInstance, isAxiosError } from "axios";

import { Address, isNativeToken } from "@grants-stack-indexer/shared";

import { IPricingProvider } from "../interfaces/index.js";
import {
    CoingeckoPlatformId,
    CoingeckoPriceChartData,
    CoingeckoSupportedChainId,
    CoingeckoTokenId,
    NetworkException,
    TokenPrice,
    UnknownPricingException,
    UnsupportedChainException,
} from "../internal.js";

type CoingeckoOptions = {
    apiKey: string;
    apiType: "demo" | "pro";
};

const getApiTypeConfig = (apiType: "demo" | "pro"): { baseURL: string; authHeader: string } =>
    apiType === "demo"
        ? { baseURL: "https://api.coingecko.com/api/v3", authHeader: "x-cg-demo-api-key" }
        : { baseURL: "https://pro-api.coingecko.com/api/v3/", authHeader: "x-cg-pro-api-key" };

const platforms: { [key in CoingeckoSupportedChainId]: CoingeckoPlatformId } = {
    1: "ethereum" as CoingeckoPlatformId,
    10: "optimistic-ethereum" as CoingeckoPlatformId,
    100: "xdai" as CoingeckoPlatformId,
    250: "fantom" as CoingeckoPlatformId,
    42161: "arbitrum-one" as CoingeckoPlatformId,
    43114: "avalanche" as CoingeckoPlatformId,
    713715: "sei-network" as CoingeckoPlatformId,
    1329: "sei-network" as CoingeckoPlatformId,
    42: "lukso" as CoingeckoPlatformId,
    42220: "celo" as CoingeckoPlatformId,
    1088: "metis" as CoingeckoPlatformId,
};

const nativeTokens: { [key in CoingeckoSupportedChainId]: CoingeckoTokenId } = {
    1: "ethereum" as CoingeckoTokenId,
    10: "ethereum" as CoingeckoTokenId,
    100: "xdai" as CoingeckoTokenId,
    250: "fantom" as CoingeckoTokenId,
    42161: "ethereum" as CoingeckoTokenId,
    43114: "avalanche-2" as CoingeckoTokenId,
    713715: "sei-network" as CoingeckoTokenId,
    1329: "sei-network" as CoingeckoTokenId,
    42: "lukso-token" as CoingeckoTokenId,
    42220: "celo" as CoingeckoTokenId,
    1088: "metis-token" as CoingeckoTokenId,
};

/**
 * The Coingecko provider is a pricing provider that uses the Coingecko API to get the price of a token.
 */
export class CoingeckoProvider implements IPricingProvider {
    private readonly axios: AxiosInstance;

    /**
     * @param options.apiKey - Coingecko API key.
     * @param options.apiType - Coingecko API type (demo or pro).
     */
    constructor(options: CoingeckoOptions) {
        const { apiKey, apiType } = options;
        const { baseURL, authHeader } = getApiTypeConfig(apiType);

        this.axios = axios.create({
            baseURL,
            headers: {
                common: {
                    [authHeader]: apiKey,
                    Accept: "application/json",
                },
            },
        });
    }

    /* @inheritdoc */
    async getTokenPrice(
        chainId: number,
        tokenAddress: Address,
        startTimestampMs: number,
        endTimestampMs: number,
    ): Promise<TokenPrice | undefined> {
        if (!this.isSupportedChainId(chainId)) {
            throw new UnsupportedChainException(chainId);
        }

        if (startTimestampMs > endTimestampMs) {
            return undefined;
        }

        const startTimestampSecs = Math.floor(startTimestampMs / 1000);
        const endTimestampSecs = Math.floor(endTimestampMs / 1000);

        const path = this.getApiPath(chainId, tokenAddress, startTimestampSecs, endTimestampSecs);

        //TODO: handle retries
        try {
            const { data } = await this.axios.get<CoingeckoPriceChartData>(path);

            const closestEntry = data.prices.at(0);
            if (!closestEntry) {
                return undefined;
            }

            return {
                timestampMs: closestEntry[0],
                priceUsd: closestEntry[1],
            };
        } catch (error: unknown) {
            //TODO: notify
            if (isAxiosError(error)) {
                if (error.status! >= 400 && error.status! < 500) {
                    console.error(`Coingecko API error: ${error.message}. Stack: ${error.stack}`);
                    return undefined;
                }

                if (error.status! >= 500 || error.message === "Network Error") {
                    throw new NetworkException(error.message, error.status!);
                }
            }
            console.error(error);
            throw new UnknownPricingException(
                isNativeError(error) ? error.message : JSON.stringify(error),
                isNativeError(error) ? error.stack : undefined,
            );
        }
    }

    /*
     * @returns Whether the given chain ID is supported by the Coingecko API.
     */
    private isSupportedChainId(chainId: number): chainId is CoingeckoSupportedChainId {
        return chainId in platforms;
    }

    /*
     * @returns The API endpoint path for the given parameters.
     */
    private getApiPath(
        chainId: CoingeckoSupportedChainId,
        tokenAddress: Address,
        startTimestampSecs: number,
        endTimestampSecs: number,
    ): string {
        const platform = platforms[chainId];
        const nativeTokenId = nativeTokens[chainId];

        return isNativeToken(tokenAddress)
            ? `/coins/${nativeTokenId}/market_chart/range?vs_currency=usd&from=${startTimestampSecs}&to=${endTimestampSecs}&precision=full`
            : `/coins/${platform}/contract/${tokenAddress.toLowerCase()}/market_chart/range?vs_currency=usd&from=${startTimestampSecs}&to=${endTimestampSecs}&precision=full`;
    }
}
