export interface IQueue<T> {
    push(...items: T[]): void;
    pop(): T | undefined;
    peek(): T | undefined;
    get length(): number;
    isEmpty(): boolean;
}
/**
 * A circular buffer-based queue implementation that provides efficient O(1) operations
 * with automatic resizing capabilities.
 *
 * Key benefits:
 * - Constant O(1) time complexity for push/pop/peek operations
 * - Memory efficient circular buffer that reuses space
 * - Automatic buffer resizing to handle growth and shrinkage
 * - Amortized O(1) push operations even when resizing is needed
 * - Memory optimization by shrinking when queue becomes very empty
 * - Initial capacity can be tuned based on expected usage
 *
 * The circular buffer approach avoids the need to shift elements, making it more
 * efficient than array-based queues for high-throughput scenarios. The automatic
 * resizing ensures memory usage adapts to actual needs while maintaining performance.
 */

export class Queue<T> implements IQueue<T> {
    private buffer: (T | undefined)[];
    private head: number = 0;
    private tail: number = 0;
    private size: number = 0;

    constructor(initialCapacity: number = 5000) {
        this.buffer = new Array(initialCapacity).fill(undefined) as (T | undefined)[];
    }

    push(...items: T[]): void {
        const requiredCapacity = this.size + items.length;
        if (requiredCapacity > this.buffer.length) {
            const newCapacity = Math.max(this.buffer.length * 2, requiredCapacity * 1.5);
            this.resize(Math.ceil(newCapacity));
        }

        for (const item of items) {
            this.buffer[this.tail] = item;
            this.tail = (this.tail + 1) % this.buffer.length;
            this.size++;
        }
    }

    pop(): T | undefined {
        if (this.size === 0) {
            return undefined;
        }

        const item = this.buffer[this.head];
        this.buffer[this.head] = undefined;
        this.head = (this.head + 1) % this.buffer.length;
        this.size--;

        // Only shrink when very empty and buffer is large
        if (this.size < this.buffer.length / 8 && this.buffer.length > 16384) {
            this.resize(this.buffer.length / 2);
        }

        return item;
    }

    peek(): T | undefined {
        return this.buffer[this.head];
    }

    get length(): number {
        return this.size;
    }

    isEmpty(): boolean {
        return this.size === 0;
    }

    private resize(newCapacity: number): void {
        const newBuffer = Array(Math.ceil(newCapacity)).fill(undefined) as (T | undefined)[];
        for (let i = 0; i < this.size; i++) {
            newBuffer[i] = this.buffer[(this.head + i) % this.buffer.length];
        }
        this.buffer = newBuffer;
        this.head = 0;
        this.tail = this.size;
    }
}
