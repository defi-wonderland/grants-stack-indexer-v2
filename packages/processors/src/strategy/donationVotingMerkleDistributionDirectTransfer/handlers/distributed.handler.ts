import { Changeset } from "@grants-stack-indexer/repository";
import { ChainId, ProtocolEvent } from "@grants-stack-indexer/shared";

import { IEventHandler, ProcessorDependencies } from "../../../internal.js";

type Dependencies = Pick<ProcessorDependencies, "roundRepository">;

export class DVMDDistributedHandler implements IEventHandler<"Strategy", "Distributed"> {
    constructor(
        readonly event: ProtocolEvent<"Strategy", "Distributed">,
        private readonly chainId: ChainId,
        private readonly dependencies: Dependencies,
    ) {}

    async handle(): Promise<Changeset[]> {
        //TODO: Implement
        throw new Error("Method not implemented.");
    }
}
