import { Changeset } from "@grants-stack-indexer/repository";
import { ChainId, ProtocolEvent } from "@grants-stack-indexer/shared";

import { IEventHandler, ProcessorDependencies } from "../../internal.js";

type Dependencies = Pick<
    ProcessorDependencies,
    "projectRepository" | "evmProvider" | "pricingProvider"
>;

export class ProfileCreatedHandler implements IEventHandler<"Registry", "ProfileCreated"> {
    constructor(
        readonly event: ProtocolEvent<"Registry", "ProfileCreated">,
        readonly chainId: ChainId,
        private dependencies: Dependencies,
    ) {}
    async handle(): Promise<Changeset[]> {
        return [];
    }
}
