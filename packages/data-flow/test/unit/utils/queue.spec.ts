import { describe, expect, it } from "vitest";

import { Queue } from "../../../src/utils/queue.js";

describe("Queue", () => {
    it("create an empty queue", () => {
        const queue = new Queue<number>();
        expect(queue.length).toBe(0);
        expect(queue.isEmpty()).toBe(true);
    });

    it("push and pop items correctly", () => {
        const queue = new Queue<number>();
        queue.push(1, 2, 3);

        expect(queue.length).toBe(3);
        expect(queue.pop()).toBe(1);
        expect(queue.pop()).toBe(2);
        expect(queue.pop()).toBe(3);
        expect(queue.isEmpty()).toBe(true);
    });

    it("peek at the first item without removing it", () => {
        const queue = new Queue<number>();
        queue.push(1, 2);

        expect(queue.peek()).toBe(1);
        expect(queue.length).toBe(2); // Length shouldn't change after peek
    });

    it("handles pushing more items than initial capacity", () => {
        const queue = new Queue<number>(2);
        queue.push(1, 2, 3, 4, 5);

        expect(queue.length).toBe(5);
        expect(queue.pop()).toBe(1);
        expect(queue.pop()).toBe(2);
        expect(queue.pop()).toBe(3);
        expect(queue.pop()).toBe(4);
        expect(queue.pop()).toBe(5);
    });

    it("handles circular buffer wrapping", () => {
        const queue = new Queue<number>(3);
        queue.push(1, 2);
        queue.pop(); // Remove 1
        queue.pop(); // Remove 2
        queue.push(3, 4); // Should wrap around

        expect(queue.length).toBe(2);
        expect(queue.pop()).toBe(3);
        expect(queue.pop()).toBe(4);
    });

    it("returns undefined when popping from empty queue", () => {
        const queue = new Queue<number>();
        expect(queue.pop()).toBeUndefined();
        expect(queue.peek()).toBeUndefined();
    });

    it("shrinks buffer when queue becomes very empty", () => {
        const queue = new Queue<number>(20000);
        const manyItems = Array.from({ length: 18000 }, (_, i) => i);

        queue.push(...manyItems);
        expect(queue.length).toBe(18000);

        // Pop most items to trigger shrinking
        for (let i = 0; i < 17000; i++) {
            queue.pop();
        }

        expect(queue.length).toBe(1000);
        // Verify remaining items are correct
        for (let i = 17000; i < 18000; i++) {
            expect(queue.pop()).toBe(i);
        }
    });
});
