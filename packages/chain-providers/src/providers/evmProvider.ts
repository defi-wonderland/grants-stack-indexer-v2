import { AbiParameter } from "abitype";
import {
    Abi,
    Address,
    Chain,
    ContractConstructorArgs,
    ContractFunctionArgs,
    ContractFunctionName,
    ContractFunctionParameters,
    ContractFunctionReturnType,
    createPublicClient,
    decodeAbiParameters,
    DecodeAbiParametersReturnType,
    encodeDeployData,
    EstimateGasParameters,
    fallback,
    FallbackTransport,
    GetBlockReturnType,
    Hex,
    http,
    HttpTransport,
    MulticallParameters,
    MulticallReturnType,
    toHex,
} from "viem";

import { ILogger } from "@grants-stack-indexer/shared";

import {
    AbiWithConstructor,
    DataDecodeException,
    InvalidArgumentException,
    MulticallNotFound,
    RpcUrlsEmpty,
} from "../internal.js";

/**
 * Acts as a wrapper around Viem library to provide methods to interact with an EVM-based blockchain.
 */
export class EvmProvider {
    private client: ReturnType<
        typeof createPublicClient<FallbackTransport<HttpTransport[]>, Chain | undefined>
    >;

    constructor(
        rpcUrls: string[],
        readonly chain: Chain | undefined,
        private readonly logger: ILogger,
    ) {
        if (rpcUrls.length === 0) {
            throw new RpcUrlsEmpty();
        }

        this.client = createPublicClient({
            chain,
            transport: fallback(rpcUrls.map((rpcUrl) => http(rpcUrl))),
        });
    }

    /**
     * Retrieves the address of the Multicall3 contract.
     * @returns {Address | undefined} The address of the Multicall3 contract, or undefined if not found.
     */
    getMulticall3Address(): Address | undefined {
        return this.chain?.contracts?.multicall3?.address;
    }

    /**
     * Retrieves the balance of the specified address.
     * @param {Address} address The address for which to retrieve the balance.
     * @returns {Promise<bigint>} A Promise that resolves to the balance of the address.
     */
    async getBalance(address: Address): Promise<bigint> {
        return this.client.getBalance({ address });
    }

    /**
     * Retrieves the current block number.
     * @returns {Promise<bigint>} A Promise that resolves to the latest block number.
     */
    async getBlockNumber(): Promise<bigint> {
        return this.client.getBlockNumber();
    }

    /**
     * Retrieves the current block number.
     * @returns {Promise<GetBlockReturnType>} Latest block number.
     */
    async getBlockByNumber(blockNumber: number): Promise<GetBlockReturnType> {
        return this.client.getBlock({ blockNumber: BigInt(blockNumber) });
    }

    /**
     * Retrieves the current estimated gas price on the chain.
     * @returns {Promise<bigint>} A Promise that resolves to the current gas price.
     */
    async getGasPrice(): Promise<bigint> {
        return this.client.getGasPrice();
    }

    async estimateGas(args: EstimateGasParameters<typeof this.chain>): Promise<bigint> {
        return this.client.estimateGas(args);
    }

    /**
     * Retrieves the value from a storage slot at a given address.
     * @param {Address} address The address of the contract.
     * @param {number} slot The slot number to read.
     * @returns {Promise<Hex>} A Promise that resolves to the value of the storage slot.
     * @throws {InvalidArgumentException} If the slot is not a positive integer.
     */
    async getStorageAt(address: Address, slot: number | Hex): Promise<Hex | undefined> {
        if (typeof slot === "number" && (slot <= 0 || !Number.isInteger(slot))) {
            throw new InvalidArgumentException(
                `Slot must be a positive integer number. Received: ${slot}`,
            );
        }

        return this.client.getStorageAt({
            address,
            slot: typeof slot === "string" ? slot : toHex(slot),
        });
    }

    /**
     * Reads a contract "pure" or "view" function with the specified arguments using readContract from Viem.
     * @param {Address} contractAddress - The address of the contract.
     * @param {TAbi} abi - The ABI (Application Binary Interface) of the contract.
     * @param {TFunctionName} functionName - The name of the function to call.
     * @param {TArgs} [args] - The arguments to pass to the function (optional).
     * @returns A promise that resolves to the return value of the contract function.
     */
    async readContract<
        TAbi extends Abi,
        TFunctionName extends ContractFunctionName<TAbi, "pure" | "view"> = ContractFunctionName<
            TAbi,
            "pure" | "view"
        >,
        TArgs extends ContractFunctionArgs<
            TAbi,
            "pure" | "view",
            TFunctionName
        > = ContractFunctionArgs<TAbi, "pure" | "view", TFunctionName>,
    >(
        contractAddress: Address,
        abi: TAbi,
        functionName: TFunctionName,
        args?: TArgs,
    ): Promise<ContractFunctionReturnType<TAbi, "pure" | "view", TFunctionName, TArgs>> {
        return this.client.readContract({
            address: contractAddress,
            abi,
            functionName,
            args,
        });
    }

    /**
     * Executes a batch request to deploy a contract and returns the decoded constructor return parameters.
     * @param {AbiWithConstructor} abi - The ABI (Application Binary Interface) of the contract. Must contain a constructor.
     * @param {Hex} bytecode - The bytecode of the contract.
     * @param {ContractConstructorArgs<typeof abi>} args - The constructor arguments for the contract.
     * @param constructorReturnParams - The return parameters of the contract's constructor.
     * @returns The decoded constructor return parameters.
     * @throws {DataDecodeException} if there is no return data or if the return data does not match the expected type.
     */
    async batchRequest<ReturnType extends readonly AbiParameter[]>(
        abi: AbiWithConstructor,
        bytecode: Hex,
        args: ContractConstructorArgs<typeof abi>,
        constructorReturnParams: ReturnType,
    ): Promise<DecodeAbiParametersReturnType<ReturnType>> {
        const deploymentData = args ? encodeDeployData({ abi, bytecode, args }) : bytecode;

        const { data: returnData } = await this.client.call({
            data: deploymentData,
        });

        if (!returnData) {
            throw new DataDecodeException("No return data");
        }

        try {
            const decoded = decodeAbiParameters(constructorReturnParams, returnData);
            return decoded;
        } catch (e) {
            throw new DataDecodeException("Error decoding return data with given AbiParameters");
        }
    }

    /**
     * Similar to readContract, but batches up multiple functions
     * on a contract in a single RPC call via the multicall3 contract.
     * @param {MulticallParameters} args - The parameters for the multicall.
     * @returns — An array of results. If allowFailure is true, with accompanying status
     * @throws {MulticallNotFound} if the Multicall contract is not found.
     */
    async multicall<
        contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
        allowFailure extends boolean = true,
    >(
        args: MulticallParameters<contracts, allowFailure>,
    ): Promise<MulticallReturnType<contracts, allowFailure>> {
        if (!this.chain?.contracts?.multicall3?.address) throw new MulticallNotFound();

        return this.client.multicall<contracts, allowFailure>(args);
    }
}
