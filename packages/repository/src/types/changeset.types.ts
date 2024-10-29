import type { Address, ChainId } from "@grants-stack-indexer/shared";

import { NewApplication, PartialApplication } from "./application.types.js";
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

//TODO: see if in the future we move out of inline object types for changesets

type ProjectChangeset =
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
      };

type RoundChangeset =
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
          type: "IncrementRoundTotalDistributed";
          args: {
              chainId: ChainId;
              roundId: string;
              amount: bigint;
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

type ApplicationChangeset =
    | {
          type: "InsertApplication";
          args: NewApplication;
      }
    | {
          type: "UpdateApplication";
          args: {
              chainId: ChainId;
              roundId: string;
              applicationId: string;
              application: PartialApplication;
          };
      };

//TODO: add changeset for Donation and Payout tables

export type Changeset = ProjectChangeset | RoundChangeset | ApplicationChangeset;
