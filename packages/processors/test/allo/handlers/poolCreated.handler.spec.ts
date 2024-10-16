import { Chain, GetTransactionReturnType, parseUnits, PublicClient, Transport } from "viem";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ChainId, DeepPartial, ProtocolEvent } from "@grants-stack-indexer/shared";
import { IMetadataProvider } from "@grants-stack-indexer/metadata";
import { IPricingProvider } from "@grants-stack-indexer/pricing";
import { IRoundReadRepository, Round } from "@grants-stack-indexer/repository";
import { mergeDeep } from "@grants-stack-indexer/shared";

import { PoolCreatedHandler } from "../../../src/allo/handlers/poolCreated.handler.js";
import * as strategy from "../../../src/helpers/strategy.js";

vi.mock("../../../src/helpers/strategy.js", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../../src/helpers/strategy.js")>();
    return {
        ...actual,
        getDonationVotingMerkleDistributionDirectTransferStrategyTimings: vi.fn(),
        getDirectGrantsStrategyTimings: vi.fn(),
    };
});

// Function to create a mock event with optional overrides
function createMockEvent(
    overrides: DeepPartial<ProtocolEvent<"Allo", "PoolCreated">> = {},
): ProtocolEvent<"Allo", "PoolCreated"> {
    const defaultEvent: ProtocolEvent<"Allo", "PoolCreated"> = {
        blockNumber: 116385567,
        blockTimestamp: 1708369911,
        chainId: 10 as ChainId,
        contractName: "Allo",
        eventName: "PoolCreated",
        logIndex: 221,
        srcAddress: "0x1133eA7Af70876e64665ecD07C0A0476d09465a1",
        params: {
            contractAddress: "0xD545fbA3f43EcA447CC7FBF41D4A8F0f575F2491",
            poolId: 10n,
            profileId: "0xcc3509068dfb6604965939f100e57dde21e9d764d8ce4b34284bbe9364b1f5ed",
            strategyId: "0x9fa6890423649187b1f0e8bf4265f0305ce99523c3d11aa36b35a54617bb0ec0",
            amount: 0n,
            token: "0x4200000000000000000000000000000000000042",
            metadata: {
                pointer: "bafkreihrjyu5tney6wia2hmkertc74nzfpsgxw2epvnxm72bxj6ifnd4ku",
                protocol: 1n,
            },
        },
        transactionFields: {
            hash: "0xd2352acdcd59e312370831ea927d51a1917654697a72434cd905a60897a5bb8b",
            transactionIndex: 6,
            from: "0xcBf407C33d68a55CB594Ffc8f4fD1416Bba39DA5",
        },
    };

    return mergeDeep(defaultEvent, overrides) as ProtocolEvent<"Allo", "PoolCreated">;
}

describe("PoolCreatedHandler", () => {
    let mockViemClient: PublicClient<Transport, Chain>;
    let mockPricingProvider: IPricingProvider;
    let mockMetadataProvider: IMetadataProvider;
    let mockRoundRepository: IRoundReadRepository;

    beforeEach(() => {
        mockViemClient = {
            readContract: vi.fn(),
            getTransaction: vi.fn(),
        } as unknown as PublicClient<Transport, Chain>;
        mockPricingProvider = {
            getTokenPrice: vi.fn(),
        };
        mockMetadataProvider = {
            getMetadata: vi.fn(),
        };
        mockRoundRepository = {
            getPendingRoundRoles: vi.fn(),
        } as unknown as IRoundReadRepository;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("process an event with initial funds", async () => {
        const fundedAmount = parseUnits("10", 18);
        const mockEvent = createMockEvent({
            params: { amount: fundedAmount, strategyId: "0xunknown" },
        });

        vi.spyOn(mockPricingProvider, "getTokenPrice").mockResolvedValue({
            priceUsd: 100,
            timestampMs: 1708369911,
        });
        vi.spyOn(mockRoundRepository, "getPendingRoundRoles").mockResolvedValue([]);

        const handler = new PoolCreatedHandler(mockEvent, 10 as ChainId, {
            viemClient: mockViemClient,
            pricingProvider: mockPricingProvider,
            metadataProvider: mockMetadataProvider,
            roundRepository: mockRoundRepository,
        });

        const result = await handler.handle();

        const changeset = result[0] as { type: "InsertRound"; args: { round: Round } };
        expect(changeset.type).toBe("InsertRound");
        expect(changeset.args.round).toMatchObject({
            fundedAmount: fundedAmount,
            fundedAmountInUsd: 1000,
        });
        expect(mockPricingProvider.getTokenPrice).toHaveBeenCalled();
        expect(mockMetadataProvider.getMetadata).toHaveBeenCalled();
    });

    it("process an unknown strategyId", async () => {
        const mockEvent = createMockEvent({
            params: { strategyId: "0xunknown" },
        });

        vi.spyOn(mockMetadataProvider, "getMetadata").mockResolvedValue(undefined);
        vi.spyOn(mockRoundRepository, "getPendingRoundRoles").mockResolvedValue([]);

        const handler = new PoolCreatedHandler(mockEvent, 10 as ChainId, {
            viemClient: mockViemClient,
            pricingProvider: mockPricingProvider,
            metadataProvider: mockMetadataProvider,
            roundRepository: mockRoundRepository,
        });

        const result = await handler.handle();

        const changeset = result[0] as { type: "InsertRound"; args: { round: Round } };
        expect(changeset.type).toBe("InsertRound");
        expect(changeset.args.round).toMatchObject({
            chainId: 10,
            id: "10",
            tags: ["allo-v2"],
            strategyAddress: mockEvent.params.contractAddress,
            strategyId: "0xunknown",
            strategyName: "",
            createdByAddress: mockEvent.transactionFields.from,
        });
        expect(mockPricingProvider.getTokenPrice).not.toHaveBeenCalled();
        expect(strategy.getDirectGrantsStrategyTimings).not.toHaveBeenCalled();
        expect(
            strategy.getDonationVotingMerkleDistributionDirectTransferStrategyTimings,
        ).not.toHaveBeenCalled();
    });

    it("process a DonationVotingMerkleDistributionDirectTransferStrategy", async () => {
        const mockEvent = createMockEvent();

        vi.spyOn(mockMetadataProvider, "getMetadata").mockResolvedValue({
            round: {
                name: "Test Round",
                roundType: "private",
                quadraticFundingConfig: {
                    matchingFundsAvailable: 1,
                },
            },
            application: {
                version: "1.0.0",
            },
        });

        vi.spyOn(mockPricingProvider, "getTokenPrice").mockResolvedValue({
            priceUsd: 100,
            timestampMs: 1708369911,
        });
        vi.spyOn(
            strategy,
            "getDonationVotingMerkleDistributionDirectTransferStrategyTimings",
        ).mockResolvedValue({
            applicationsStartTime: new Date(),
            applicationsEndTime: new Date(),
            donationsStartTime: new Date(),
            donationsEndTime: new Date(),
        });

        vi.spyOn(mockRoundRepository, "getPendingRoundRoles")
            .mockResolvedValueOnce([
                {
                    chainId: 10 as ChainId,
                    role: "admin",
                    address: "0x1133eA7Af70876e64665ecD07C0A0476d09465a1",
                    createdAtBlock: 116385567n,
                },
            ])
            .mockResolvedValue([]);

        const handler = new PoolCreatedHandler(mockEvent, 10 as ChainId, {
            viemClient: mockViemClient,
            pricingProvider: mockPricingProvider,
            metadataProvider: mockMetadataProvider,
            roundRepository: mockRoundRepository,
        });

        const result = await handler.handle();

        expect(result).toHaveLength(3);

        const changeset = result[0] as { type: "InsertRound"; args: { round: Round } };
        expect(changeset.type).toBe("InsertRound");
        expect(changeset.args.round).toMatchObject({
            chainId: 10,
            id: "10",
            tags: ["allo-v2", "grants-stack"],
            totalDonationsCount: 0,
            totalAmountDonatedInUsd: 0,
            uniqueDonorsCount: 0,
            matchTokenAddress: mockEvent.params.token,
            matchAmount: parseUnits("1", 18),
            matchAmountInUsd: 100,
            fundedAmount: 0n,
            fundedAmountInUsd: 0,
            applicationMetadataCid: "bafkreihrjyu5tney6wia2hmkertc74nzfpsgxw2epvnxm72bxj6ifnd4ku",
            applicationMetadata: {
                version: "1.0.0",
            },
            roundMetadataCid: "bafkreihrjyu5tney6wia2hmkertc74nzfpsgxw2epvnxm72bxj6ifnd4ku",
            roundMetadata: {
                name: "Test Round",
                roundType: "private",
                quadraticFundingConfig: {
                    matchingFundsAvailable: 1,
                },
            },
            strategyAddress: mockEvent.params.contractAddress,
            strategyId: "0x9fa6890423649187b1f0e8bf4265f0305ce99523c3d11aa36b35a54617bb0ec0",
            strategyName: "allov2.DonationVotingMerkleDistributionDirectTransferStrategy",
            createdByAddress: mockEvent.transactionFields.from,
            createdAtBlock: BigInt(mockEvent.blockNumber),
            updatedAtBlock: BigInt(mockEvent.blockNumber),
            projectId: mockEvent.params.profileId,
            totalDistributed: 0n,
            readyForPayoutTransaction: null,
            matchingDistribution: null,
        });
        expect(mockPricingProvider.getTokenPrice).toHaveBeenCalled();
        expect(mockMetadataProvider.getMetadata).toHaveBeenCalled();
    });

    it("fetches transaction sender if not present in event", async () => {
        const mockEvent = createMockEvent({
            params: { strategyId: "0xunknown" },
            transactionFields: {
                hash: "0xd2352acdcd59e312370831ea927d51a1917654697a72434cd905a60897a5bb8b",
                from: undefined,
            },
        });

        vi.spyOn(mockPricingProvider, "getTokenPrice").mockResolvedValue({
            priceUsd: 100,
            timestampMs: 1708369911,
        });
        vi.spyOn(mockRoundRepository, "getPendingRoundRoles").mockResolvedValue([]);
        vi.spyOn(mockViemClient, "getTransaction").mockResolvedValue({
            from: "0xcBf407C33d68a55CB594Ffc8f4fD1416Bba39DA5",
        } as unknown as GetTransactionReturnType);

        const handler = new PoolCreatedHandler(mockEvent, 10 as ChainId, {
            viemClient: mockViemClient,
            pricingProvider: mockPricingProvider,
            metadataProvider: mockMetadataProvider,
            roundRepository: mockRoundRepository,
        });

        const result = await handler.handle();

        const changeset = result[0] as { type: "InsertRound"; args: { round: Round } };
        expect(changeset.args.round.createdByAddress).toBe(
            "0xcBf407C33d68a55CB594Ffc8f4fD1416Bba39DA5",
        );
        expect(mockViemClient.getTransaction).toHaveBeenCalledWith({
            hash: "0xd2352acdcd59e312370831ea927d51a1917654697a72434cd905a60897a5bb8b",
        });
    });

    it("handles an undefined metadata", async () => {
        const mockEvent = createMockEvent();

        vi.spyOn(mockMetadataProvider, "getMetadata").mockResolvedValue(undefined);
        vi.spyOn(
            strategy,
            "getDonationVotingMerkleDistributionDirectTransferStrategyTimings",
        ).mockResolvedValue({
            applicationsStartTime: new Date(),
            applicationsEndTime: new Date(),
            donationsStartTime: new Date(),
            donationsEndTime: new Date(),
        });
        vi.spyOn(mockRoundRepository, "getPendingRoundRoles").mockResolvedValue([]);

        const handler = new PoolCreatedHandler(mockEvent, 10 as ChainId, {
            viemClient: mockViemClient,
            pricingProvider: mockPricingProvider,
            metadataProvider: mockMetadataProvider,
            roundRepository: mockRoundRepository,
        });

        const result = await handler.handle();

        const changeset = result[0] as { type: "InsertRound"; args: { round: Round } };
        expect(changeset.type).toBe("InsertRound");
        expect(changeset.args.round).toMatchObject({
            chainId: 10,
            id: "10",
            tags: ["allo-v2"],
            matchAmount: 0n,
            matchAmountInUsd: 0,
            fundedAmount: 0n,
            fundedAmountInUsd: 0,
            applicationMetadataCid: "bafkreihrjyu5tney6wia2hmkertc74nzfpsgxw2epvnxm72bxj6ifnd4ku",
            applicationMetadata: {},
            roundMetadataCid: "bafkreihrjyu5tney6wia2hmkertc74nzfpsgxw2epvnxm72bxj6ifnd4ku",
            roundMetadata: null,
            readyForPayoutTransaction: null,
            matchingDistribution: null,
        });

        expect(mockPricingProvider.getTokenPrice).not.toHaveBeenCalled();
        expect(mockMetadataProvider.getMetadata).toHaveBeenCalled();
    });

    it("returns empty changeset if token price fetch fails", async () => {
        const mockEvent = createMockEvent({ params: { amount: 1n } });

        vi.spyOn(mockMetadataProvider, "getMetadata").mockResolvedValue(undefined);

        vi.spyOn(mockPricingProvider, "getTokenPrice").mockResolvedValue(undefined);

        const handler = new PoolCreatedHandler(mockEvent, 10 as ChainId, {
            viemClient: mockViemClient,
            pricingProvider: mockPricingProvider,
            metadataProvider: mockMetadataProvider,
            roundRepository: mockRoundRepository,
        });

        const result = await handler.handle();
        expect(result).toHaveLength(0);
    });

    it("handles pending round roles", async () => {
        const mockEvent = createMockEvent();

        vi.spyOn(mockMetadataProvider, "getMetadata").mockResolvedValue(undefined);
        vi.spyOn(mockPricingProvider, "getTokenPrice").mockResolvedValue({
            priceUsd: 100,
            timestampMs: 1708369911,
        });
        vi.spyOn(
            strategy,
            "getDonationVotingMerkleDistributionDirectTransferStrategyTimings",
        ).mockResolvedValue({
            applicationsStartTime: new Date(),
            applicationsEndTime: new Date(),
            donationsStartTime: new Date(),
            donationsEndTime: new Date(),
        });

        vi.spyOn(mockRoundRepository, "getPendingRoundRoles")
            .mockResolvedValueOnce([
                {
                    id: 1,
                    chainId: 10 as ChainId,
                    role: "admin",
                    address: "0x1133eA7Af70876e64665ecD07C0A0476d09465a1",
                    createdAtBlock: 116385565n,
                },
            ])
            .mockResolvedValueOnce([
                {
                    id: 2,
                    chainId: 10 as ChainId,
                    role: "manager",
                    address: "0x1234567890123456789012345678901234567890",
                    createdAtBlock: 116385565n,
                },
                {
                    id: 3,
                    chainId: 10 as ChainId,
                    role: "manager",
                    address: "0xAaBBccdDeEFf0000000000000000000000000000",
                    createdAtBlock: 116385565n,
                },
            ]);

        const handler = new PoolCreatedHandler(mockEvent, 10 as ChainId, {
            viemClient: mockViemClient,
            pricingProvider: mockPricingProvider,
            metadataProvider: mockMetadataProvider,
            roundRepository: mockRoundRepository,
        });

        const result = await handler.handle();

        expect(result).toHaveLength(5);

        const changeset = result[0] as { type: "InsertRound"; args: { round: Round } };
        expect(changeset.type).toBe("InsertRound");

        expect(result.filter((c) => c.type === "InsertRoundRole")).toHaveLength(3);
        expect(result.filter((c) => c.type === "InsertRoundRole")[0]?.args.roundRole).toMatchObject(
            {
                chainId: 10 as ChainId,
                roundId: "10",
                role: "admin",
                address: "0x1133eA7Af70876e64665ecD07C0A0476d09465a1",
                createdAtBlock: 116385565n,
            },
        );
        expect(result.filter((c) => c.type === "InsertRoundRole")[1]?.args.roundRole).toMatchObject(
            {
                chainId: 10 as ChainId,
                roundId: "10",
                role: "manager",
                address: "0x1234567890123456789012345678901234567890",
                createdAtBlock: 116385565n,
            },
        );
        expect(result.filter((c) => c.type === "InsertRoundRole")[2]?.args.roundRole).toMatchObject(
            {
                chainId: 10 as ChainId,
                roundId: "10",
                role: "manager",
                address: "0xAaBBccdDeEFf0000000000000000000000000000",
                createdAtBlock: 116385565n,
            },
        );
        expect(result.filter((c) => c.type === "DeletePendingRoundRoles")).toHaveLength(1);
        expect(result.filter((c) => c.type === "DeletePendingRoundRoles")[0]?.args.ids).toContain(
            1,
        );
        expect(result.filter((c) => c.type === "DeletePendingRoundRoles")[0]?.args.ids).toContain(
            2,
        );
        expect(result.filter((c) => c.type === "DeletePendingRoundRoles")[0]?.args.ids).toContain(
            3,
        );
    });

    it.skip("handles a native token");
    it.skip("handles an unknown token");
});
