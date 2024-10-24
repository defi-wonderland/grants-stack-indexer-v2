import { Changeset } from "@grants-stack-indexer/repository";
import { ChainId, ProtocolEvent } from "@grants-stack-indexer/shared";

import { IEventHandler, ProcessorDependencies } from "../../../internal.js";

type Dependencies = Pick<
    ProcessorDependencies,
    "roundRepository" | "projectRepository" | "metadataProvider"
>;

export class DVMDRegisteredHandler implements IEventHandler<"Strategy", "Registered"> {
    constructor(
        readonly event: ProtocolEvent<"Strategy", "Registered">,
        private readonly chainId: ChainId,
        private readonly dependencies: Dependencies,
    ) {}

    async handle(): Promise<Changeset[]> {
        //TODO: Implement
        throw new Error("Not implemented");
    }
}
