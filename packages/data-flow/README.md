# @grants-stack-indexer/data-flow

Is a library that provides the core components of the processing pipeline for gitcoin grants-stack-indexer.

## Available Scripts

Available scripts that can be run using `pnpm`:

| Script        | Description                                             |
| ------------- | ------------------------------------------------------- |
| `build`       | Build library using tsc                                 |
| `check-types` | Check types issues using tsc                            |
| `clean`       | Remove `dist` folder                                    |
| `lint`        | Run ESLint to check for coding standards                |
| `lint:fix`    | Run linter and automatically fix code formatting issues |
| `format`      | Check code formatting and style using Prettier          |
| `format:fix`  | Run formatter and automatically fix issues              |
| `test`        | Run tests using vitest                                  |
| `test:cov`    | Run tests with coverage report                          |

## Usage

### Importing the Package

You can import the package in your TypeScript or JavaScript files as follows:

```typescript
import { EventsFetcher } from "@grants-stack-indexer/data-flow";
```

### Example

```typescript
const eventsFetcher = new EventsFetcher(indexerClient);

const chainId = 1;
const blockNumber = 1000;
const logIndex = 0;

const result = await eventsFetcher.fetcEventsByBlockNumberAndLogIndex(
    chainId,
    blockNumber,
    logIndex,
);
```
