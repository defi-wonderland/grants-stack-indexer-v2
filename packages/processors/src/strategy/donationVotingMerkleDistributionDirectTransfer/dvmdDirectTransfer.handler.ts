import { Changeset } from "@grants-stack-indexer/repository";
import { ChainId, ProtocolEvent, StrategyEvent } from "@grants-stack-indexer/shared";

import type { IStrategyHandler, ProcessorDependencies } from "../../internal.js";
import { BaseDistributedHandler, UnsupportedEventException } from "../../internal.js";
import { DVMDRegisteredHandler } from "./handlers/index.js";

type Dependencies = Pick<
    ProcessorDependencies,
    "projectRepository" | "roundRepository" | "metadataProvider"
>;

/**
 * This handler is responsible for processing events related to the
 * Donation Voting Merkle Distribution Direct Transfer strategy.
 *
 * The following events are currently handled by this strategy:
 * - Registered
 * - Distributed
 */

export class DVMDDirectTransferHandler implements IStrategyHandler<StrategyEvent> {
    constructor(
        private readonly chainId: ChainId,
        private readonly dependencies: Dependencies,
    ) {}
    async handle(event: ProtocolEvent<"Strategy", StrategyEvent>): Promise<Changeset[]> {
        switch (event.eventName) {
            case "Registered":
                return new DVMDRegisteredHandler(
                    event as ProtocolEvent<"Strategy", "Registered">,
                    this.chainId,
                    this.dependencies,
                ).handle();
            case "Distributed":
                return new BaseDistributedHandler(
                    event as ProtocolEvent<"Strategy", "Distributed">,
                    this.chainId,
                    this.dependencies,
                ).handle();
            default:
                throw new UnsupportedEventException("Strategy", event.eventName);
        }
    }
}
