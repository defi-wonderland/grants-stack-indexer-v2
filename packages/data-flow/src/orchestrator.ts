// class should contain the logic to orchestrate the data flow Events Fetcher -> Events Processor -> Data Loader

import { IIndexerClient } from "@grants-stack-indexer/indexer-client";
import { ProcessorDependencies } from "@grants-stack-indexer/processors";
import { AnyEvent, ChainId, ContractName, ProcessorEvent } from "@grants-stack-indexer/shared";

import { EventsFetcher } from "./eventsFetcher.js";
import { EventsProcessor } from "./eventsProcessor.js";
import { EventsRegistry } from "./eventsRegistry.js";
import { StrategyRegistry } from "./strategyRegistry.js";

export class Orchestrator {
    private eventsQueue: ProcessorEvent<ContractName, AnyEvent>[] = [];
    private readonly eventsFetcher: EventsFetcher;
    private readonly eventsProcessor: EventsProcessor;
    private readonly eventsRegistry: EventsRegistry;
    private readonly strategyRegistry: StrategyRegistry;

    constructor(
        private chainId: ChainId,
        private dependencies: Readonly<ProcessorDependencies>,
        private indexerClient: IIndexerClient,
        private fetchLimit: number = 1000,
        private fetchDelay: number = 10000,
    ) {
        this.eventsFetcher = new EventsFetcher(this.indexerClient);
        this.eventsProcessor = new EventsProcessor(this.chainId, this.dependencies);
        this.eventsRegistry = new EventsRegistry();
        this.strategyRegistry = new StrategyRegistry();
    }

    async run(): Promise<void> {
        while (true) {
            try {
                if (this.eventsQueue.length === 0) {
                    const lastProcessedEvent = await this.eventsRegistry.getLastProcessedEvent();
                    const blockNumber = lastProcessedEvent ? lastProcessedEvent.blockNumber : 0;
                    const logIndex = lastProcessedEvent ? lastProcessedEvent.logIndex : 0;

                    const events = await this.eventsFetcher.fetchEventsByBlockNumberAndLogIndex(
                        this.chainId,
                        blockNumber,
                        logIndex,
                        this.fetchLimit,
                    );
                    this.eventsQueue.push(...events);

                    //there are no events left to process
                    if (events.length === 0) {
                        await delay(this.fetchDelay);
                        break;
                    }
                }

                // if poolCreated event, get strategyId and save in the map
                // if strategy event populate event with strategyId if exists in the map
                // get strategyId and populate event with it

                const event = this.eventsQueue[0];
            } catch (error) {
                console.log("asd");
            }
        }
    }
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
