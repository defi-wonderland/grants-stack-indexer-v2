import { IRoundRepository } from "@grants-stack-indexer/repository";

import { ChangesetHandler } from "../types/index.js";

/**
 * Collection of handlers for round-related operations.
 * Each handler corresponds to a specific Round changeset type.
 */
export type RoundHandlers = {
    InsertRound: ChangesetHandler<"InsertRound">;
    UpdateRound: ChangesetHandler<"UpdateRound">;
    UpdateRoundByStrategyAddress: ChangesetHandler<"UpdateRoundByStrategyAddress">;
    IncrementRoundFundedAmount: ChangesetHandler<"IncrementRoundFundedAmount">;
    IncrementRoundTotalDistributed: ChangesetHandler<"IncrementRoundTotalDistributed">;
    InsertPendingRoundRole: ChangesetHandler<"InsertPendingRoundRole">;
    DeletePendingRoundRoles: ChangesetHandler<"DeletePendingRoundRoles">;
    InsertRoundRole: ChangesetHandler<"InsertRoundRole">;
    DeleteAllRoundRolesByRoleAndAddress: ChangesetHandler<"DeleteAllRoundRolesByRoleAndAddress">;
};

/**
 * Creates handlers for managing round-related operations.
 *
 * @param repository - The round repository instance used for database operations
 * @returns An object containing all round-related handlers
 */
export const createRoundHandlers = (repository: IRoundRepository): RoundHandlers => ({
    InsertRound: (async (changeset): Promise<void> => {
        const { round } = changeset.args;
        await repository.insertRound(round);
    }) satisfies ChangesetHandler<"InsertRound">,

    UpdateRound: (async (changeset): Promise<void> => {
        const { chainId, roundId, round } = changeset.args;
        await repository.updateRound({ id: roundId, chainId }, round);
    }) satisfies ChangesetHandler<"UpdateRound">,

    UpdateRoundByStrategyAddress: (async (changeset): Promise<void> => {
        const { chainId, strategyAddress, round } = changeset.args;
        if (round) {
            await repository.updateRound({ strategyAddress, chainId: chainId }, round);
        }
    }) satisfies ChangesetHandler<"UpdateRoundByStrategyAddress">,

    IncrementRoundFundedAmount: (async (changeset): Promise<void> => {
        const { chainId, roundId, fundedAmount, fundedAmountInUsd } = changeset.args;
        await repository.incrementRoundFunds(
            {
                chainId,
                roundId,
            },
            fundedAmount,
            fundedAmountInUsd,
        );
    }) satisfies ChangesetHandler<"IncrementRoundFundedAmount">,

    IncrementRoundTotalDistributed: (async (changeset): Promise<void> => {
        const { chainId, roundId, amount } = changeset.args;
        await repository.incrementRoundTotalDistributed(
            {
                chainId,
                roundId,
            },
            amount,
        );
    }) satisfies ChangesetHandler<"IncrementRoundTotalDistributed">,

    InsertPendingRoundRole: (async (changeset): Promise<void> => {
        const { pendingRoundRole } = changeset.args;
        await repository.insertPendingRoundRole(pendingRoundRole);
    }) satisfies ChangesetHandler<"InsertPendingRoundRole">,

    DeletePendingRoundRoles: (async (changeset): Promise<void> => {
        const { ids } = changeset.args;
        await repository.deleteManyPendingRoundRoles(ids);
    }) satisfies ChangesetHandler<"DeletePendingRoundRoles">,

    InsertRoundRole: (async (changeset): Promise<void> => {
        const { roundRole } = changeset.args;
        await repository.insertRoundRole(roundRole);
    }) satisfies ChangesetHandler<"InsertRoundRole">,

    DeleteAllRoundRolesByRoleAndAddress: (async (changeset): Promise<void> => {
        const { chainId, roundId, role, address } = changeset.args.roundRole;
        await repository.deleteManyRoundRolesByRoleAndAddress(chainId, roundId, role, address);
    }) satisfies ChangesetHandler<"DeleteAllRoundRolesByRoleAndAddress">,
});
