const UINT64_MAX = 18446744073709551615n;

/**
 * Converts a timestamp to a date
 * @param timestamp - The timestamp to convert to a date
 * @returns The date or null if the timestamp is greater than 18446744073709551615
 */
export const getDateFromTimestamp = (timestamp: bigint): Date | null => {
    return timestamp >= 0n && timestamp < UINT64_MAX ? new Date(Number(timestamp) * 1000) : null;
};
