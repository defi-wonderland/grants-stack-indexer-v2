import { ChainId, ProtocolEvent } from "@grants-stack-indexer/shared";

import { AbstractDistributedHandler, ProcessorDependencies } from "../../../internal.js";

type Dependencies = Pick<ProcessorDependencies, "roundRepository">;

export class DVMDDistributedHandler extends AbstractDistributedHandler {
    constructor(
        event: ProtocolEvent<"Strategy", "Distributed">,
        chainId: ChainId,
        dependencies: Dependencies,
    ) {
        super(event, chainId, dependencies);
    }
}
