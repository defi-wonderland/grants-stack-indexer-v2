# @grants-stack-indexer/indexer-client

Is library for interacting with blockchain event indexing services.

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
import { EnvioIndexerClient } from "@grants-stack-indexer/indexer-client";
```

### Example

```typescript
const envioIndexerClient = new EnvioIndexerClient("http://example.com/graphql", "secret");
await envioIndexerClient.getEventsByBlockNumberAndLogIndex(1, 12345, 0);
```
