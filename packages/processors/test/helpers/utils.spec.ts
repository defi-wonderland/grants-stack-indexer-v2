import { describe, expect, it } from "vitest";

import { getDateFromTimestamp } from "../../src/helpers/utils.js";

describe("utils", () => {
    describe("getDateFromTimestamp", () => {
        it("should convert a valid timestamp to a Date object", () => {
            const timestamp = 1609459200n; // 2021-01-01 00:00:00 UTC
            const result = getDateFromTimestamp(timestamp);
            expect(result).toBeInstanceOf(Date);
            expect(result?.toISOString()).toBe("2021-01-01T00:00:00.000Z");
        });

        it("should handle the minimum valid timestamp (0)", () => {
            const timestamp = 0n;
            const result = getDateFromTimestamp(timestamp);
            expect(result).toBeInstanceOf(Date);
            expect(result?.toISOString()).toBe("1970-01-01T00:00:00.000Z");
        });

        it("should handle the maximum valid timestamp", () => {
            const maxTimestamp = 18446744073709551615n - 1n;
            const result = getDateFromTimestamp(maxTimestamp);
            expect(result).toBeInstanceOf(Date);
        });

        it("should return null for timestamps equal to or greater than UINT64_MAX", () => {
            const maxTimestamp = 18446744073709551615n;
            expect(getDateFromTimestamp(maxTimestamp)).toBeNull();
            expect(getDateFromTimestamp(maxTimestamp + 1n)).toBeNull();
        });

        it("should return null for negative timestamps", () => {
            expect(getDateFromTimestamp(-1n)).toBeNull();
            expect(getDateFromTimestamp(-1000000n)).toBeNull();
        });
    });
});
