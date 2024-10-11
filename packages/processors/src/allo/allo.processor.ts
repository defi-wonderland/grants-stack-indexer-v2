import { AlloEvent, ProtocolEvent } from "@grants-stack-indexer/shared";

import type { IProcessor } from "../internal.js";

export class AlloProcessor implements IProcessor<"Allo", AlloEvent> {
    //TODO: Implement
    process(_event: ProtocolEvent<"Allo", AlloEvent>): Promise<unknown> {
        throw new Error("Method not implemented.");
    }
}
