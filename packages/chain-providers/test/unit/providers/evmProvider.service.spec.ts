import { parseAbi } from "abitype";
import * as viem from "viem";
import { localhost } from "viem/chains";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ILogger } from "@grants-stack-indexer/shared";

import {
    DataDecodeException,
    EvmProvider,
    MulticallNotFound,
    RpcUrlsEmpty,
} from "../../../src/internal.js";
import { arrayAbiFixture, structAbiFixture } from "../../fixtures/batchRequest.fixture.js";

const mockClient = {
    getBalance: vi.fn(),
    getBlockNumber: vi.fn(),
    getGasPrice: vi.fn(),
    estimateGas: vi.fn(),
    getStorageAt: vi.fn(),
    readContract: vi.fn(),
    multicall: vi.fn(),
    call: vi.fn(),
};

vi.mock("viem", async (importOriginal) => {
    const actual = await importOriginal<typeof import("viem")>();
    return {
        ...actual,
        createPublicClient: vi.fn().mockImplementation(() => mockClient),
        http: vi.fn(),
    };
});

export const mockLogger: ILogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
};
const testAbi = parseAbi([
    "constructor(uint256 totalSupply)",
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenURI(uint256 tokenId) pure returns (string)",
]);

describe("EvmProvider", () => {
    let viemProvider: EvmProvider | null = null;
    const defaultMockChain: viem.Chain = vi.mocked<viem.Chain>({
        ...localhost,
        contracts: { multicall3: undefined },
    });
    const defaultRpcUrls = ["http://localhost:8545"];

    afterEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        viemProvider = null;
    });

    it("has a client property defined", () => {
        viemProvider = new EvmProvider(defaultRpcUrls, defaultMockChain, mockLogger);
        expect(viemProvider["client"]).toBeDefined();
    });

    it("throws RpcUrlsEmpty error if rpcUrls is empty", () => {
        expect(() => {
            new EvmProvider([], defaultMockChain, mockLogger);
        }).toThrowError(RpcUrlsEmpty);
    });

    describe("getBalance", () => {
        it("returns the balance of the specified address", async () => {
            viemProvider = new EvmProvider(defaultRpcUrls, defaultMockChain, mockLogger);
            const address = "0x123456789";
            const expectedBalance = 100n;
            vi.spyOn(mockClient, "getBalance").mockResolvedValue(expectedBalance);

            const balance = await viemProvider.getBalance(address);

            expect(balance).toBe(expectedBalance);
            expect(mockClient.getBalance).toHaveBeenCalledWith({ address });
        });
    });

    describe("getBlockNumber", () => {
        it("returns the current block number", async () => {
            viemProvider = new EvmProvider(defaultRpcUrls, defaultMockChain, mockLogger);
            const expectedBlockNumber = 1000n;
            vi.spyOn(mockClient, "getBlockNumber").mockResolvedValue(expectedBlockNumber);

            const blockNumber = await viemProvider.getBlockNumber();

            expect(blockNumber).toBe(expectedBlockNumber);
        });
    });

    describe("getGasPrice", () => {
        it("returns the current gas price", async () => {
            viemProvider = new EvmProvider(defaultRpcUrls, defaultMockChain, mockLogger);
            const expectedGasPrice = BigInt(100);
            // Mock the getGasPrice method of the Viem client
            vi.spyOn(mockClient, "getGasPrice").mockResolvedValue(expectedGasPrice);

            const gasPrice = await viemProvider.getGasPrice();

            expect(gasPrice).toBe(expectedGasPrice);
        });
    });

    describe("estimateGas", () => {
        it("return the estimated gas for the given transaction", async () => {
            viemProvider = new EvmProvider(defaultRpcUrls, defaultMockChain, mockLogger);
            const args = vi.mocked<viem.EstimateGasParameters<typeof localhost>>({
                account: "0xffff",
                to: viem.zeroAddress,
                value: 100n,
            });

            const expectedGas = 50000n;
            vi.spyOn(mockClient, "estimateGas").mockResolvedValue(expectedGas);

            const gas = await viemProvider.estimateGas(args);

            expect(gas).toBe(expectedGas);
            expect(mockClient.estimateGas).toHaveBeenCalledWith(args);
        });
    });

    describe("getStorageAt", () => {
        it("returns the value of the storage slot at the given address and slot number", async () => {
            viemProvider = new EvmProvider(defaultRpcUrls, defaultMockChain, mockLogger);
            const address = "0x123456789";
            const slot = 1;
            const expectedValue = "0xabcdef";
            vi.spyOn(mockClient, "getStorageAt").mockResolvedValue(expectedValue);

            const value = await viemProvider.getStorageAt(address, slot);

            expect(value).toBe(expectedValue);
            expect(mockClient.getStorageAt).toHaveBeenCalledWith({ address, slot: "0x1" });
        });

        it("returns the value of the storage slot at the given address and slot value", async () => {
            viemProvider = new EvmProvider(defaultRpcUrls, defaultMockChain, mockLogger);
            const address = "0x123456789";
            const slot = "0x12";
            const expectedValue = "0xabcdef";
            vi.spyOn(mockClient, "getStorageAt").mockResolvedValue(expectedValue);

            const value = await viemProvider.getStorageAt(address, slot);

            expect(value).toBe(expectedValue);
            expect(mockClient.getStorageAt).toHaveBeenCalledWith({ address, slot: "0x12" });
        });

        it("throws an error if the slot is not a positive integer", async () => {
            viemProvider = new EvmProvider(defaultRpcUrls, defaultMockChain, mockLogger);
            const address = "0x123456789";
            const slot = -1;

            await expect(viemProvider.getStorageAt(address, slot)).rejects.toThrowError(
                "Slot must be a positive integer number. Received: -1",
            );
        });
    });

    describe("readContract", () => {
        it("calls the readContract method of the Viem client with the correct arguments", async () => {
            viemProvider = new EvmProvider(defaultRpcUrls, defaultMockChain, mockLogger);
            const contractAddress = "0x123456789";
            const abi = testAbi;
            const functionName = "balanceOf";
            const expectedReturnValue = 5n;

            // Mock the readContract method of the Viem client
            vi.spyOn(mockClient, "readContract").mockResolvedValue(expectedReturnValue);

            const returnValue = await viemProvider.readContract(contractAddress, abi, functionName);

            expect(returnValue).toBe(expectedReturnValue);
            expect(mockClient.readContract).toHaveBeenCalledWith({
                address: contractAddress,
                abi,
                functionName,
            });
        });

        it("calls the readContract method of the Viem client with the correct arguments when args are provided", async () => {
            viemProvider = new EvmProvider(defaultRpcUrls, defaultMockChain, mockLogger);
            const contractAddress = "0x123456789";
            const functionName = "tokenURI";
            const args = [1n] as const;
            const expectedReturnValue = "tokenUri";

            // Mock the readContract method of the Viem client
            vi.spyOn(mockClient, "readContract").mockResolvedValue(expectedReturnValue);

            const returnValue = await viemProvider.readContract(
                contractAddress,
                testAbi,
                functionName,
                args,
            );

            expect(returnValue).toBe(expectedReturnValue);
            expect(mockClient.readContract).toHaveBeenCalledWith({
                address: contractAddress,
                abi: testAbi,
                functionName,
                args,
            });
        });
    });

    describe("batchRequest", () => {
        it("encodes bytecode data and decode return data from batch request call", async () => {
            viemProvider = new EvmProvider(defaultRpcUrls, defaultMockChain, mockLogger);
            const returnAbiParams = viem.parseAbiParameters([
                "TokenData[] returnData",
                "struct TokenData { uint8 tokenDecimals; string tokenSymbol; string tokenName; }",
            ]);
            vi.spyOn(mockClient, "call").mockResolvedValue({ data: structAbiFixture.returnData });

            const [returnValue] = await viemProvider.batchRequest(
                structAbiFixture.abi,
                structAbiFixture.bytecode,
                structAbiFixture.args,
                returnAbiParams,
            );

            expect(returnValue).toStrictEqual([
                {
                    tokenDecimals: 18,
                    tokenSymbol: "WETH",
                    tokenName: "Wrapped Ether",
                },
                {
                    tokenDecimals: 6,
                    tokenSymbol: "USDC",
                    tokenName: "USD Coin",
                },
            ]);
        });

        it("fails if no data is returned", async () => {
            viemProvider = new EvmProvider(defaultRpcUrls, defaultMockChain, mockLogger);
            const returnAbiParams = viem.parseAbiParameters([
                "TokenData[] returnData",
                "struct TokenData { uint8 tokenDecimals; string tokenSymbol; string tokenName; }",
            ]);

            vi.spyOn(mockClient, "call").mockResolvedValue({ data: undefined });

            await expect(
                viemProvider.batchRequest(
                    structAbiFixture.abi,
                    structAbiFixture.bytecode,
                    structAbiFixture.args,
                    returnAbiParams,
                ),
            ).rejects.toThrowError(DataDecodeException);
        });

        it("fails if decoded data does not match validator (missing struct fields)", async () => {
            viemProvider = new EvmProvider(defaultRpcUrls, defaultMockChain, mockLogger);
            // this schema is incorrect, it should have 3 fields instead of 2
            const returnAbiParams = viem.parseAbiParameters([
                "WrongTokenData[] returnData",
                "struct WrongTokenData { string tokenSymbol; string tokenName; }",
            ]);

            vi.spyOn(mockClient, "call").mockResolvedValue({ data: structAbiFixture.returnData });

            await expect(
                viemProvider.batchRequest(
                    structAbiFixture.abi,
                    structAbiFixture.bytecode,
                    structAbiFixture.args,
                    returnAbiParams,
                ),
            ).rejects.toThrowError(
                new DataDecodeException("Error decoding return data with given AbiParameters"),
            );
        });

        it("fails if decoded data does not match validator (not struct vs struct)", async () => {
            viemProvider = new EvmProvider(defaultRpcUrls, defaultMockChain, mockLogger);
            // this schema is incorrect, it should have 3 fields instead of 2
            const returnAbiParams = viem.parseAbiParameters("uint8 decimals, address[] owners");

            vi.spyOn(mockClient, "call").mockResolvedValue({ data: structAbiFixture.returnData });

            await expect(
                viemProvider.batchRequest(
                    structAbiFixture.abi,
                    structAbiFixture.bytecode,
                    structAbiFixture.args,
                    returnAbiParams,
                ),
            ).rejects.toThrowError(
                new DataDecodeException("Error decoding return data with given AbiParameters"),
            );
        });

        it("decodes address[]", async () => {
            viemProvider = new EvmProvider(defaultRpcUrls, defaultMockChain, mockLogger);
            const returnAbiParams = viem.parseAbiParameters("address[]");

            vi.spyOn(mockClient, "call").mockResolvedValue({ data: arrayAbiFixture.returnData });

            const [returnValue] = await viemProvider.batchRequest(
                arrayAbiFixture.abi,
                arrayAbiFixture.bytecode,
                arrayAbiFixture.args,
                returnAbiParams,
            );

            expect(returnValue).toEqual(arrayAbiFixture.args[0]);
        });
    });
    describe("multicall", () => {
        it("calls the multicall method of the Viem client with the correct arguments", async () => {
            const mockChain: viem.Chain = vi.mocked<viem.Chain>({
                ...localhost,
                contracts: { multicall3: { address: "0x123456789" } },
            });

            viemProvider = new EvmProvider(defaultRpcUrls, mockChain, mockLogger);
            const contracts = [
                {
                    address: "0x123456789",
                    abi: testAbi,
                    functionName: "balanceOf",
                    args: ["0x987654321"],
                } as const,
                {
                    address: "0x123456789",
                    abi: testAbi,
                    functionName: "tokenURI",
                    args: [1n],
                } as const,
                {
                    address: "0x987654321",
                    abi: testAbi,
                    functionName: "totalSupply",
                    args: [],
                } as const,
            ];

            const expectedReturnValue = [
                { result: 100n, status: true },
                { result: "tokenUri", status: true },
                { result: 1000n, status: true },
            ];
            vi.spyOn(mockClient, "multicall").mockResolvedValue(expectedReturnValue);

            const returnValue = await viemProvider.multicall({ contracts });

            expect(returnValue).toEqual(expectedReturnValue);
            expect(mockClient.multicall).toHaveBeenCalledWith({ contracts });
        });

        it("throws a MulticallNotFound error if the Multicall contract is not found for the chain", async () => {
            viemProvider = new EvmProvider(defaultRpcUrls, defaultMockChain, mockLogger);
            const contracts = [
                {
                    address: "0x123456789",
                    abi: testAbi,
                    functionName: "balanceOf",
                    args: ["0x987654321"],
                } as const,
            ];

            await expect(viemProvider.multicall({ contracts })).rejects.toThrowError(
                MulticallNotFound,
            );
        });
    });
});
