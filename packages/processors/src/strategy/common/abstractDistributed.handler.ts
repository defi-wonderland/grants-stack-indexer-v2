import { getAddress } from "viem";

import { Changeset } from "@grants-stack-indexer/repository";
import { ChainId, ProtocolEvent } from "@grants-stack-indexer/shared";

import { IEventHandler, ProcessorDependencies } from "../../internal.js";

type Dependencies = Pick<ProcessorDependencies, "roundRepository">;

export abstract class AbstractDistributedHandler
    implements IEventHandler<"Strategy", "Distributed">
{
    constructor(
        readonly event: ProtocolEvent<"Strategy", "Distributed">,
        private readonly chainId: ChainId,
        private readonly dependencies: Dependencies,
    ) {}

    async handle(): Promise<Changeset[]> {
        const { roundRepository } = this.dependencies;
        const strategyAddress = getAddress(this.event.srcAddress);
        const round = await roundRepository.getRoundByStrategyAddress(
            this.chainId,
            strategyAddress,
        );

        if (!round) {
            return [];
        }

        return [
            {
                type: "IncrementRoundTotalDistributed",
                args: {
                    chainId: this.chainId,
                    roundId: round.id,
                    amount: BigInt(this.event.params.amount),
                },
            },
        ];
    }
}
