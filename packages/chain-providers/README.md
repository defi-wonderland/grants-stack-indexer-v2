# @grants-stack-indexer/chain-providers

## Overview

The `@grants-stack-indexer/chain-providers` package provides wrappers of the `Viem` library to interact with EVM-based blockchains.

## 📋 Prerequisites

-   Ensure you have `node >= 20.0.0` and `pnpm >= 9.5.0` installed.

## Installation

```bash
$ pnpm install
```

## Building

To build the monorepo packages, run:

```bash
$ pnpm build
```

## Test

```bash
# unit tests
$ pnpm run test

# test coverage
$ pnpm run test:cov
```

## Usage

### Importing the Package

You can import the package in your TypeScript or JavaScript files as follows:

```typescript
import { EvmProvider } from "@grants-stack-indexer/chain-providers";
```

### Example

```typescript
// EVM-provider
const rpcUrls = [...]; //non-empty
const chain = mainnet; // from viem/chains

const evmProvider = new EvmProvider(rpcUrls, chain, logger);

const gasPrice = await evmProvider.getGasPrice();

const result = await evmProvider.readContract(address, abi, "myfunction", [arg1, arg2]);
```

## API

### [EvmProvider](./src/providers/evmProvider.ts)

Available methods

-   `getMulticall3Address()`
-   `getBlockNumber()`
-   `getBlockByNumber(blockNumber: number)`
-   `readContract(contractAddress: Address, abi: TAbi functionName: TFunctionName, args?: TArgs)`
-   `batchRequest(abi: AbiWithConstructor,bytecode: Hex, args: ContractConstructorArgs<typeof abi>, constructorReturnParams: ReturnType)`
-   `multicall(args: MulticallParameters<contracts, allowFailure>)`

For more details on both providers, refer to their implementations.
