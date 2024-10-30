import type { Changeset } from "@grants-stack-indexer/repository";

import type { ExecutionResult } from "../internal.js";

export interface IDataLoader {
    /**
     * Applies the changesets to the database.
     * @param changesets - The changesets to apply.
     * @returns The execution result.
     * @throws {InvalidChangeset} if there are changesets with invalid types.
     */
    applyChanges(changesets: Changeset[]): Promise<ExecutionResult>;
}
