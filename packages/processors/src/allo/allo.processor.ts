import { Changeset } from "@grants-stack-indexer/repository";
import { AlloEvent, ProtocolEvent } from "@grants-stack-indexer/shared";

import type { IProcessor } from "../internal.js";

export class AlloProcessor implements IProcessor<"Allo", AlloEvent> {
    //TODO: Implement
    process(_event: ProtocolEvent<"Allo", AlloEvent>): Promise<Changeset> {
        throw new Error("Method not implemented.");
    }
}
