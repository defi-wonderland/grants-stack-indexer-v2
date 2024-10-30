// class should contain the logic to orchestrate the data flow Events Fetcher -> Events Processor -> Data Loader

import { IIndexerClient } from "@grants-stack-indexer/indexer-client";
import { UnsupportedStrategy } from "@grants-stack-indexer/processors/dist/src/internal.js";
import {
    Address,
    AnyEvent,
    ChainId,
    ContractName,
    Hex,
    isAlloEvent,
    isStrategyEvent,
    ProcessorEvent,
    StrategyEvent,
    stringify,
} from "@grants-stack-indexer/shared";

import { EventsFetcher } from "./eventsFetcher.js";
import { EventsProcessor } from "./eventsProcessor.js";
import { InvalidEvent } from "./exceptions/index.js";
import { IEventsRegistry } from "./interfaces/eventsRegistry.interface.js";
import { IEventsFetcher } from "./interfaces/index.js";
import { IStrategyRegistry } from "./interfaces/strategyRegistry.interface.js";
import { CoreDependencies, DataLoader, delay, IQueue, iStrategyAbi, Queue } from "./internal.js";

export class Orchestrator {
    private readonly eventsQueue: IQueue<ProcessorEvent<ContractName, AnyEvent>>;
    private readonly eventsFetcher: IEventsFetcher;
    private readonly eventsProcessor: EventsProcessor;
    private readonly eventsRegistry: IEventsRegistry;
    private readonly strategyRegistry: IStrategyRegistry;
    private readonly dataLoader: DataLoader;

    constructor(
        private chainId: ChainId,
        private dependencies: Readonly<CoreDependencies>,
        private indexerClient: IIndexerClient,
        private registries: {
            eventsRegistry: IEventsRegistry;
            strategyRegistry: IStrategyRegistry;
        },
        private fetchLimit: number = 1000,
        private fetchDelay: number = 10000,
    ) {
        this.eventsFetcher = new EventsFetcher(this.indexerClient);
        this.eventsProcessor = new EventsProcessor(this.chainId, this.dependencies);
        this.eventsRegistry = registries.eventsRegistry;
        this.strategyRegistry = registries.strategyRegistry;
        this.dataLoader = new DataLoader({
            project: this.dependencies.projectRepository,
            round: this.dependencies.roundRepository,
            application: this.dependencies.applicationRepository,
        });
        this.eventsQueue = new Queue<ProcessorEvent<ContractName, AnyEvent>>(fetchLimit);
    }

    async run(): Promise<void> {
        while (true) {
            let event: ProcessorEvent<ContractName, AnyEvent> | undefined;
            try {
                if (this.eventsQueue.isEmpty()) await this.fillQueue();

                event = this.eventsQueue.pop();

                if (!event) {
                    await delay(this.fetchDelay);
                    continue;
                }

                event = await this.enhanceStrategyId(event);
                const changesets = await this.eventsProcessor.processEvent(event);

                const executionResult = await this.dataLoader.applyChanges(changesets);

                if (executionResult.numFailed > 0) {
                    //TODO: should we retry the failed changesets?
                    console.error(
                        `Failed to apply changesets. ${executionResult.errors.join("\n")} Event: ${stringify(
                            event,
                        )}`,
                    );
                }

                await this.eventsRegistry.saveLastProcessedEvent(event);
            } catch (error: unknown) {
                // TODO: improve error handling and notify
                if (error instanceof UnsupportedStrategy || error instanceof InvalidEvent) {
                    console.error(`${error.name}: ${error.message}. Event: ${stringify(event)}`);
                } else {
                    console.error(`Error processing event: ${stringify(event)}`, error);
                }
            }
        }
    }

    private async fillQueue(): Promise<void> {
        const lastProcessedEvent = await this.eventsRegistry.getLastProcessedEvent();
        const blockNumber = lastProcessedEvent?.blockNumber ?? 0;
        const logIndex = lastProcessedEvent?.logIndex ?? 0;

        const events = await this.eventsFetcher.fetchEventsByBlockNumberAndLogIndex(
            this.chainId,
            blockNumber,
            logIndex,
            this.fetchLimit,
        );

        this.eventsQueue.push(...events);
    }

    // if poolCreated event, get strategyId and save in the map
    // if strategy event populate event with strategyId if exists in the map
    // get strategyId and populate event with it
    private async enhanceStrategyId(
        event: ProcessorEvent<ContractName, AnyEvent>,
    ): Promise<ProcessorEvent<ContractName, AnyEvent>> {
        if (!this.requiresStrategyId(event)) {
            return event;
        }

        const strategyAddress = this.getStrategyAddress(event);
        const strategyId = await this.getOrFetchStrategyId(strategyAddress);
        event.strategyId = strategyId;

        return event;
    }

    private getStrategyAddress(
        event: ProcessorEvent<"Allo", "PoolCreated"> | ProcessorEvent<"Strategy", StrategyEvent>,
    ): Address {
        return isAlloEvent(event) && event.eventName === "PoolCreated"
            ? event.params.strategy
            : event.srcAddress;
    }

    private async getOrFetchStrategyId(strategyAddress: Address): Promise<Hex> {
        const existingId = await this.strategyRegistry.getStrategyId(strategyAddress);
        if (existingId) {
            return existingId;
        }

        const strategyId = await this.dependencies.evmProvider.readContract(
            strategyAddress,
            iStrategyAbi,
            "getStrategyId",
        );

        await this.strategyRegistry.saveStrategyId(strategyAddress, strategyId);

        return strategyId;
    }

    private requiresStrategyId(
        event: ProcessorEvent<ContractName, AnyEvent>,
    ): event is ProcessorEvent<"Allo", "PoolCreated"> | ProcessorEvent<"Strategy", StrategyEvent> {
        return (isAlloEvent(event) && event.eventName === "PoolCreated") || isStrategyEvent(event);
    }
}
