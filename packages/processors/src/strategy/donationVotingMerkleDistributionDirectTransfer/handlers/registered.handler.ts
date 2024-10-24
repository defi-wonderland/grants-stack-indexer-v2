import { getAddress } from "viem";

import { Changeset, NewApplication } from "@grants-stack-indexer/repository";
import { ChainId, ProtocolEvent } from "@grants-stack-indexer/shared";

import {
    IEventHandler,
    ProcessorDependencies,
    ProjectNotFound,
    RoundNotFound,
} from "../../../internal.js";
import { decodeDVMDApplicationData } from "../helpers/decoder.js";

type Dependencies = Pick<
    ProcessorDependencies,
    "roundRepository" | "projectRepository" | "metadataProvider"
>;

export class DVMDRegisteredHandler implements IEventHandler<"Strategy", "Registered"> {
    constructor(
        readonly event: ProtocolEvent<"Strategy", "Registered">,
        private readonly chainId: ChainId,
        private readonly dependencies: Dependencies,
    ) {}

    async handle(): Promise<Changeset[]> {
        const { projectRepository, roundRepository, metadataProvider } = this.dependencies;
        const { data: encodedData, recipientId, sender } = this.event.params;
        const { blockNumber, blockTimestamp } = this.event;

        const anchorAddress = getAddress(recipientId);
        const project = await projectRepository.getProjectByAnchor(this.chainId, anchorAddress);

        if (!project) {
            throw new ProjectNotFound(
                `Project not found for chainId: ${this.chainId} and anchorAddress: ${anchorAddress}`,
            );
        }

        const strategyAddress = getAddress(this.event.srcAddress);
        const round = await roundRepository.getRoundByStrategyAddress(
            this.chainId,
            strategyAddress,
        );

        if (!round) {
            throw new RoundNotFound(
                `Round not found for chainId: ${this.chainId} and strategyAddress: ${strategyAddress}`,
            );
        }

        const values = decodeDVMDApplicationData(encodedData);
        const id = (Number(values.recipientsCounter) - 1).toString();

        const metadata = await metadataProvider.getMetadata(values.metadata.pointer);

        const application: NewApplication = {
            chainId: this.chainId,
            id: id,
            projectId: project.id,
            anchorAddress,
            roundId: round.id,
            status: "PENDING",
            metadataCid: values.metadata.pointer,
            metadata: metadata ?? null,
            createdAtBlock: BigInt(blockNumber),
            createdByAddress: getAddress(sender),
            statusUpdatedAtBlock: BigInt(blockNumber),
            statusSnapshots: [
                {
                    status: "PENDING",
                    updatedAtBlock: blockNumber.toString(),
                    updatedAt: new Date(blockTimestamp * 1000),
                },
            ],
            distributionTransaction: null,
            totalAmountDonatedInUsd: 0,
            totalDonationsCount: 0,
            uniqueDonorsCount: 0,
            tags: ["allo-v2"],
        };

        return [
            {
                type: "InsertApplication",
                args: application,
            },
        ];
    }
}
