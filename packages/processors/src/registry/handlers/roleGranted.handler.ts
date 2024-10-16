import { getAddress, PublicClient } from "viem";

import { IMetadataProvider } from "@grants-stack-indexer/metadata";
import { IPricingProvider } from "@grants-stack-indexer/pricing";
import { Changeset, IProjectReadRepository } from "@grants-stack-indexer/repository";
import { ALLO_OWNER_ROLE, ChainId, ProtocolEvent } from "@grants-stack-indexer/shared";

import { IEventHandler } from "../../internal.js";

export class RoleGrantedHandler implements IEventHandler {
    constructor(
        private readonly event: ProtocolEvent<"Registry", "RoleGranted">,
        private readonly pricingProvider: IPricingProvider,
        private readonly metadataProvider: IMetadataProvider,
        private readonly projectRepository: IProjectReadRepository,
        private readonly viemProvider: PublicClient,
    ) {}
    async handle(): Promise<Changeset[]> {
        const role = this.event.params.role.toLocaleLowerCase();
        if (role === ALLO_OWNER_ROLE) {
            return [];
        }

        const account = getAddress(this.event.params.account);
        const project = await this.projectRepository.getProjectById(
            this.event.chainId as ChainId,
            role,
        );
        // The member role for an Allo V2 profile, is the profileId itself.
        // If a project exists with that id, we create the member role
        // If it doesn't exists we create a pending project role. This can happens
        // when a new project is created, since in Allo V2 the RoleGranted event for a member is
        // emitted before the ProfileCreated event.
        if (project) {
            return [
                {
                    type: "InsertProjectRole",
                    args: {
                        projectRole: {
                            chainId: this.event.chainId as ChainId,
                            projectId: project.id,
                            address: account,
                            role: "member",
                            createdAtBlock: BigInt(this.event.blockNumber),
                        },
                    },
                },
            ];
        }

        return [
            {
                type: "InsertPendingProjectRole",
                args: {
                    pendingProjectRole: {
                        chainId: this.event.chainId as ChainId,
                        role: role,
                        address: account,
                        createdAtBlock: BigInt(this.event.blockNumber),
                    },
                },
            },
        ];
    }
}
