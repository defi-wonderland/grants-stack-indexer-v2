import { ProcessorDependencies } from "@grants-stack-indexer/processors";
import {
    Changeset,
    IApplicationRepository,
    IProjectRepository,
    IRoundRepository,
} from "@grants-stack-indexer/repository";

export type ExecutionResult = {
    changesets: Changeset["type"][];
    numExecuted: number;
    numSuccessful: number;
    numFailed: number;
    errors: string[];
};

export type CoreDependencies = Pick<
    ProcessorDependencies,
    "evmProvider" | "pricingProvider" | "metadataProvider"
> & {
    roundRepository: IRoundRepository;
    projectRepository: IProjectRepository;
    applicationRepository: IApplicationRepository;
};
