import { Branded } from "@grants-stack-indexer/shared";

export type CoingeckoSupportedChainId =
    | 1
    | 10
    | 100
    | 250
    | 42161
    | 43114
    | 713715
    | 1329
    | 42
    | 42220
    | 1088;

export type CoingeckoTokenId = Branded<string, "CoingeckoTokenId">;
export type CoingeckoPlatformId = Branded<string, "CoingeckoPlatformId">;

export type CoingeckoPriceChartData = {
    prices: [number, number][];
    market_caps: [number, number][];
    total_volumes: [number, number][];
};
