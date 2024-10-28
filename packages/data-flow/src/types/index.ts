import { Changeset } from "@grants-stack-indexer/repository";

export type ExecutionResult = {
    changesets: Changeset["type"][];
    numExecuted: number;
    numSuccessful: number;
    numFailed: number;
    errors: string[];
};
