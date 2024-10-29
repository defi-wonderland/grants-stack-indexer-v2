import {
    AlloProcessor,
    ProcessorDependencies,
    RegistryProcessor,
    StrategyProcessor,
} from "@grants-stack-indexer/processors";
import { Changeset } from "@grants-stack-indexer/repository";

import "@grants-stack-indexer/processors/dist/src/internal.js";

import {
    AnyEvent,
    ChainId,
    ContractName,
    isAlloEvent,
    isRegistryEvent,
    isStrategyEvent,
    ProcessorEvent,
} from "@grants-stack-indexer/shared";

import { InvalidEvent } from "./exceptions/index.js";

export class EventsProcessor {
    alloProcessor: AlloProcessor;
    registryProcessor: RegistryProcessor;
    strategyProcessor: StrategyProcessor;

    constructor(chainId: ChainId, dependencies: Readonly<ProcessorDependencies>) {
        this.alloProcessor = new AlloProcessor(chainId, dependencies);
        this.registryProcessor = new RegistryProcessor(chainId, dependencies);
        this.strategyProcessor = new StrategyProcessor(chainId, dependencies);
    }

    public async processEvent(event: ProcessorEvent<ContractName, AnyEvent>): Promise<Changeset[]> {
        if (isAlloEvent(event)) {
            return await this.alloProcessor.process(event);
        }
        if (isRegistryEvent(event)) {
            return await this.registryProcessor.process(event);
        }
        if (isStrategyEvent(event)) {
            return await this.strategyProcessor.process(event);
        }

        throw new InvalidEvent(event);
    }
}
