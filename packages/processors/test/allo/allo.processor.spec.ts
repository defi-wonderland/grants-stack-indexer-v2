import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EvmProvider } from "@grants-stack-indexer/chain-providers";
import type { IMetadataProvider } from "@grants-stack-indexer/metadata";
import type { IPricingProvider } from "@grants-stack-indexer/pricing";
import type {
    IProjectReadRepository,
    IRoundReadRepository,
} from "@grants-stack-indexer/repository";
import type { AlloEvent, ChainId, ProtocolEvent } from "@grants-stack-indexer/shared";

import { AlloProcessor } from "../../src/allo/allo.processor.js";
import { PoolCreatedHandler } from "../../src/allo/handlers/poolCreated.handler.js";

// Mock the handlers
vi.mock("../../src/allo/handlers/poolCreated.handler.js", () => {
    const PoolCreatedHandler = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    PoolCreatedHandler.prototype.handle = vi.fn();
    return {
        PoolCreatedHandler,
    };
});

describe("AlloProcessor", () => {
    const mockChainId = 10 as ChainId;
    let processor: AlloProcessor;
    let mockEvmProvider: EvmProvider;
    let mockPricingProvider: IPricingProvider;
    let mockMetadataProvider: IMetadataProvider;
    let mockRoundRepository: IRoundReadRepository;

    beforeEach(() => {
        mockEvmProvider = {} as EvmProvider;
        mockPricingProvider = {} as IPricingProvider;
        mockMetadataProvider = {} as IMetadataProvider;
        mockRoundRepository = {} as IRoundReadRepository;

        processor = new AlloProcessor(mockChainId, {
            evmProvider: mockEvmProvider,
            pricingProvider: mockPricingProvider,
            metadataProvider: mockMetadataProvider,
            roundRepository: mockRoundRepository,
            projectRepository: {} as IProjectReadRepository,
        });

        // Reset mocks before each test
        vi.clearAllMocks();
    });

    it("call PoolCreatedHandler for PoolCreated event", async () => {
        const mockEvent: ProtocolEvent<"Allo", "PoolCreated"> = {
            eventName: "PoolCreated",
            // Add other necessary event properties here
        } as ProtocolEvent<"Allo", "PoolCreated">;

        vi.spyOn(PoolCreatedHandler.prototype, "handle").mockResolvedValue([]);

        await processor.process(mockEvent);

        expect(PoolCreatedHandler).toHaveBeenCalledWith(mockEvent, mockChainId, {
            evmProvider: mockEvmProvider,
            pricingProvider: mockPricingProvider,
            metadataProvider: mockMetadataProvider,
            roundRepository: mockRoundRepository,
        });
        expect(PoolCreatedHandler.prototype.handle).toHaveBeenCalled();
    });

    it("throw an error for unknown event names", async () => {
        const mockEvent = {
            eventName: "UnknownEvent",
        } as unknown as ProtocolEvent<"Allo", AlloEvent>;

        await expect(() => processor.process(mockEvent)).rejects.toThrow(
            "Unknown event name: UnknownEvent",
        );
    });
});
