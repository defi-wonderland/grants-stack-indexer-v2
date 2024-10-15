import { Changeset } from "@grants-stack-indexer/repository";
import { ProtocolEvent, StrategyEvent } from "@grants-stack-indexer/shared";

import type { IProcessor } from "../internal.js";

export class StrategyProcessor implements IProcessor<"Strategy", StrategyEvent> {
    process(_event: ProtocolEvent<"Strategy", StrategyEvent>): Promise<Changeset[]> {
        //TODO: Implement
        throw new Error("Method not implemented.");
    }
}
