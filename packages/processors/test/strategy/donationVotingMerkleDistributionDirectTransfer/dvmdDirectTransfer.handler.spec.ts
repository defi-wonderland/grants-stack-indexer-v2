import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IMetadataProvider } from "@grants-stack-indexer/metadata";
import type {
    IProjectReadRepository,
    IRoundReadRepository,
} from "@grants-stack-indexer/repository";
import { ChainId, ProtocolEvent, StrategyEvent } from "@grants-stack-indexer/shared";

import { UnsupportedEventException } from "../../../src/internal.js";
import { BaseDistributedHandler } from "../../../src/strategy/common/index.js";
import { DVMDDirectTransferHandler } from "../../../src/strategy/donationVotingMerkleDistributionDirectTransfer/dvmdDirectTransfer.handler.js";
import { DVMDRegisteredHandler } from "../../../src/strategy/donationVotingMerkleDistributionDirectTransfer/handlers/index.js";

vi.mock(
    "../../../src/strategy/donationVotingMerkleDistributionDirectTransfer/handlers/index.js",
    () => {
        const DVMDRegisteredHandler = vi.fn();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        DVMDRegisteredHandler.prototype.handle = vi.fn();
        return {
            DVMDRegisteredHandler,
        };
    },
);
vi.mock("../../../src/strategy/common/baseDistributed.handler.js", () => {
    const BaseDistributedHandler = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    BaseDistributedHandler.prototype.handle = vi.fn();
    return {
        BaseDistributedHandler,
    };
});

describe("DVMDDirectTransferHandler", () => {
    const mockChainId = 10 as ChainId;
    let handler: DVMDDirectTransferHandler;
    let mockMetadataProvider: IMetadataProvider;
    let mockRoundRepository: IRoundReadRepository;
    let mockProjectRepository: IProjectReadRepository;

    beforeEach(() => {
        mockMetadataProvider = {} as IMetadataProvider;
        mockRoundRepository = {} as IRoundReadRepository;
        mockProjectRepository = {} as IProjectReadRepository;

        handler = new DVMDDirectTransferHandler(mockChainId, {
            metadataProvider: mockMetadataProvider,
            roundRepository: mockRoundRepository,
            projectRepository: mockProjectRepository,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("calls RegisteredHandler for Registered event", async () => {
        const mockEvent = {
            eventName: "Registered",
        } as ProtocolEvent<"Strategy", "Registered">;

        vi.spyOn(DVMDRegisteredHandler.prototype, "handle").mockResolvedValue([]);

        await handler.handle(mockEvent);

        expect(DVMDRegisteredHandler).toHaveBeenCalledWith(mockEvent, mockChainId, {
            metadataProvider: mockMetadataProvider,
            roundRepository: mockRoundRepository,
            projectRepository: mockProjectRepository,
        });
        expect(DVMDRegisteredHandler.prototype.handle).toHaveBeenCalled();
    });

    it("calls DistributedHandler for Distributed event", async () => {
        const mockEvent = {
            eventName: "Distributed",
        } as ProtocolEvent<"Strategy", "Distributed">;

        vi.spyOn(BaseDistributedHandler.prototype, "handle").mockResolvedValue([]);

        await handler.handle(mockEvent);

        expect(BaseDistributedHandler).toHaveBeenCalledWith(mockEvent, mockChainId, {
            metadataProvider: mockMetadataProvider,
            roundRepository: mockRoundRepository,
            projectRepository: mockProjectRepository,
        });
        expect(BaseDistributedHandler.prototype.handle).toHaveBeenCalled();
    });

    it.skip("calls AllocatedHandler for Allocated event");
    it.skip("calls TimestampsUpdatedHandler for TimestampsUpdated event");
    it.skip("calls RecipientStatusUpdatedHandler for RecipientStatusUpdated event");
    it.skip("calls DistributionUpdatedHandler for DistributionUpdated event");
    it.skip("calls UpdatedRegistrationHandler for UpdatedRegistration event");
    it.skip("calls FundsDistributedHandler for FundsDistributed event");

    it("throws UnsupportedEventException for unknown event names", async () => {
        const mockEvent = { eventName: "UnknownEvent" } as unknown as ProtocolEvent<
            "Strategy",
            StrategyEvent
        >;
        await expect(() => handler.handle(mockEvent)).rejects.toThrow(UnsupportedEventException);
    });
});
