import { ProtocolEvent, StrategyEvent } from "@grants-stack-indexer/shared";

import type { IProcessor } from "../internal.js";

export class StrategyProcessor implements IProcessor<"Strategy", StrategyEvent> {
    process(_event: ProtocolEvent<"Strategy", StrategyEvent>): Promise<unknown> {
        //TODO: Implement
        throw new Error("Method not implemented.");
    }
}
