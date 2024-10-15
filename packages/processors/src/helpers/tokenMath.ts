import { formatUnits, parseUnits } from "viem";

import { TokenPrice } from "@grants-stack-indexer/pricing";

/**
 * Calculates the amount in USD
 * @param amount - The amount to convert to USD
 * @param tokenPrice - The price of the token in USD
 * @param tokenDecimals - The number of decimals the token has
 * @param truncateDecimals (optional) - The number of decimals to truncate the final result to. Must be between 0 and 18.
 * @returns The amount in USD
 */
export const calculateAmountInUsd = (
    amount: bigint,
    tokenPrice: TokenPrice,
    tokenDecimals: number,
    truncateDecimals?: number,
): number => {
    const amountInUsd = Number(
        formatUnits(
            amount * parseUnits(tokenPrice.priceUsd.toString(), tokenDecimals),
            tokenDecimals * 2,
        ),
    );

    if (truncateDecimals) {
        if (truncateDecimals < 0 || truncateDecimals > 18) {
            throw new Error("Truncate decimals must be between 0 and 18");
        }
        return Number(amountInUsd.toFixed(truncateDecimals));
    }

    return amountInUsd;
};
