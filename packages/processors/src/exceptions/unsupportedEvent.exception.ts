import { ContractName } from "@grants-stack-indexer/shared";

export class UnsupportedEventException extends Error {
    constructor(
        contract: ContractName,
        public readonly eventName: string,
    ) {
        super(`Event ${eventName} unsupported for ${contract} processor`);
    }
}
