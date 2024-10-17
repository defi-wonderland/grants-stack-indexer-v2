import type { Address, ChainId } from "@grants-stack-indexer/shared";

import {
    NewPendingProjectRole,
    NewProject,
    NewProjectRole,
    PartialProject,
    ProjectRole,
} from "./project.types.js";
import {
    NewPendingRoundRole,
    NewRound,
    NewRoundRole,
    PartialRound,
    RoundRole,
} from "./round.types.js";

export type Changeset =
    | {
          type: "InsertProject";
          args: {
              project: NewProject;
          };
      }
    | {
          type: "UpdateProject";
          args: {
              chainId: ChainId;
              projectId: string;
              project: PartialProject;
          };
      }
    | {
          type: "InsertPendingProjectRole";
          args: {
              pendingProjectRole: NewPendingProjectRole;
          };
      }
    | {
          type: "DeletePendingProjectRoles";
          args: {
              ids: number[];
          };
      }
    | {
          type: "InsertProjectRole";
          args: {
              projectRole: NewProjectRole;
          };
      }
    | {
          type: "DeleteAllProjectRolesByRole";
          args: {
              projectRole: Pick<ProjectRole, "chainId" | "projectId" | "role">;
          };
      }
    | {
          type: "DeleteAllProjectRolesByRoleAndAddress";
          args: {
              projectRole: Pick<ProjectRole, "chainId" | "projectId" | "role" | "address">;
          };
      }
    | {
          type: "InsertRound";
          args: {
              round: NewRound;
          };
      }
    | {
          type: "UpdateRound";
          args: {
              chainId: ChainId;
              roundId: string;
              round: PartialRound;
          };
      }
    | {
          type: "UpdateRoundByStrategyAddress";
          args: {
              chainId: ChainId;
              strategyAddress: Address;
              round: PartialRound;
          };
      }
    | {
          type: "IncrementRoundFundedAmount";
          args: {
              chainId: ChainId;
              roundId: string;
              fundedAmount: bigint;
              fundedAmountInUsd: string;
          };
      }
    | {
          type: "IncrementRoundDonationStats";
          args: {
              chainId: ChainId;
              roundId: Address;
              amountInUsd: string;
          };
      }
    | {
          type: "IncrementRoundTotalDistributed";
          args: {
              chainId: ChainId;
              roundId: string;
              amount: bigint;
          };
      }
    | {
          type: "IncrementApplicationDonationStats";
          args: {
              chainId: ChainId;
              roundId: Address;
              applicationId: string;
              amountInUsd: number;
          };
      }
    | {
          type: "InsertPendingRoundRole";
          args: {
              pendingRoundRole: NewPendingRoundRole;
          };
      }
    | {
          type: "DeletePendingRoundRoles";
          args: {
              ids: number[];
          };
      }
    | {
          type: "InsertRoundRole";
          args: {
              roundRole: NewRoundRole;
          };
      }
    | {
          type: "DeleteAllRoundRolesByRoleAndAddress";
          args: {
              roundRole: Pick<RoundRole, "chainId" | "roundId" | "role" | "address">;
          };
      };
