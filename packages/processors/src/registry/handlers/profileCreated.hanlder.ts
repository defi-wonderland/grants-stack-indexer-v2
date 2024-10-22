import { getAddress } from "viem";

import { Changeset, ProjectType } from "@grants-stack-indexer/repository";
import { ChainId, ProtocolEvent } from "@grants-stack-indexer/shared";

import { IEventHandler, ProcessorDependencies } from "../../internal.js";
import { ProjectMetadata, ProjectMetadataSchema } from "../../schemas/projectMetadata.js";

type Dependencies = Pick<
    ProcessorDependencies,
    "projectRepository" | "evmProvider" | "pricingProvider" | "metadataProvider"
>;

export class ProfileCreatedHandler implements IEventHandler<"Registry", "ProfileCreated"> {
    constructor(
        readonly event: ProtocolEvent<"Registry", "ProfileCreated">,
        readonly chainId: ChainId,
        private dependencies: Dependencies,
    ) {}
    async handle(): Promise<Changeset[]> {
        const profileId = this.event.params.profileId;
        const metadataCid = this.event.params.metadata[1];
        const metadata = await this.dependencies.metadataProvider.getMetadata(metadataCid);

        const parsedMetadata = ProjectMetadataSchema.safeParse(metadata);

        let projectType: ProjectType = "canonical";
        let isProgram = false;
        let metadataValue = null;

        if (parsedMetadata.success) {
            projectType = this.getProjectTypeFromMetadata(parsedMetadata.data);
            isProgram = parsedMetadata.data.type === "program";
            metadataValue = parsedMetadata.data;
        } else {
            //TODO: Replace with logger
            console.warn({
                msg: `ProfileCreated: Failed to parse metadata for profile ${profileId}`,
                event: this.event,
                metadataCid,
                metadata,
            });
        }

        const tx = await this.dependencies.evmProvider.getTransaction(
            this.event.transactionFields.hash,
        );

        const createdBy = tx.from;
        const programTags = isProgram ? ["program"] : [];

        const changes: Changeset[] = [
            {
                type: "InsertProject",
                args: {
                    project: {
                        tags: ["allo-v2", ...programTags],
                        chainId: this.chainId,
                        registryAddress: getAddress(this.event.srcAddress),
                        id: profileId,
                        name: this.event.params.name,
                        nonce: this.event.params.nonce,
                        anchorAddress: getAddress(this.event.params.anchor),
                        projectNumber: null,
                        metadataCid: metadataCid,
                        metadata: metadataValue,
                        createdByAddress: getAddress(createdBy),
                        createdAtBlock: BigInt(this.event.blockNumber),
                        updatedAtBlock: BigInt(this.event.blockNumber),
                        projectType,
                    },
                },
            },
            {
                type: "InsertProjectRole",
                args: {
                    projectRole: {
                        chainId: this.chainId,
                        projectId: this.event.params.profileId,
                        address: getAddress(this.event.params.owner),
                        role: "owner",
                        createdAtBlock: BigInt(this.event.blockNumber),
                    },
                },
            },
        ];

        const pendingProjectRoles =
            await this.dependencies.projectRepository.getPendingProjectRolesByRole(
                this.chainId,
                profileId,
            );

        if (pendingProjectRoles.length !== 0) {
            for (const role of pendingProjectRoles) {
                changes.push({
                    type: "InsertProjectRole",
                    args: {
                        projectRole: {
                            chainId: this.chainId,
                            projectId: profileId,
                            address: getAddress(role.address),
                            role: "member",
                            createdAtBlock: BigInt(this.event.blockNumber),
                        },
                    },
                });
            }

            changes.push({
                type: "DeletePendingProjectRoles",
                args: { ids: pendingProjectRoles.map((r) => r.id!) },
            });
        }

        return changes;
    }

    private getProjectTypeFromMetadata(metadata: ProjectMetadata): ProjectType {
        // if the metadata contains a canonical reference, it's a linked project
        if ("canonical" in metadata) {
            return "linked";
        }

        return "canonical";
    }
}
