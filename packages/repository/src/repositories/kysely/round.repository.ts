import { Kysely } from "kysely";

import { Address, ChainId } from "@grants-stack-indexer/shared";

import {
    Database,
    IRoundRepository,
    NewPendingRoundRole,
    NewRound,
    NewRoundRole,
    PartialRound,
    PendingRoundRole,
    Round,
    RoundRole,
    RoundRoleNames,
} from "../../internal.js";

export class KyselyRoundRepository implements IRoundRepository {
    constructor(
        private readonly db: Kysely<Database>,
        private readonly schemaName: string,
    ) {}

    // ============================ ROUNDS ============================

    /* @inheritdoc */
    async getRounds(chainId: ChainId): Promise<Round[]> {
        return this.db
            .withSchema(this.schemaName)
            .selectFrom("rounds")
            .where("chainId", "=", chainId)
            .selectAll()
            .execute();
    }

    /* @inheritdoc */
    async getRoundById(chainId: ChainId, roundId: string): Promise<Round | undefined> {
        return this.db
            .withSchema(this.schemaName)
            .selectFrom("rounds")
            .where("chainId", "=", chainId)
            .where("id", "=", roundId)
            .selectAll()
            .executeTakeFirst();
    }

    /* @inheritdoc */
    async getRoundByStrategyAddress(
        chainId: ChainId,
        strategyAddress: Address,
    ): Promise<Round | undefined> {
        return this.db
            .withSchema(this.schemaName)
            .selectFrom("rounds")
            .where("chainId", "=", chainId)
            .where("strategyAddress", "=", strategyAddress)
            .selectAll()
            .executeTakeFirst();
    }

    /* @inheritdoc */
    async getRoundByRole(
        chainId: ChainId,
        roleName: RoundRoleNames,
        roleValue: string,
    ): Promise<Round | undefined> {
        return this.db
            .withSchema(this.schemaName)
            .selectFrom("rounds")
            .where("chainId", "=", chainId)
            .where(`${roleName}Role`, "=", roleValue)
            .selectAll()
            .executeTakeFirst();
    }

    /* @inheritdoc */
    async getRoundMatchTokenAddressById(
        chainId: ChainId,
        roundId: Address | string,
    ): Promise<Address | undefined> {
        const res = await this.db
            .withSchema(this.schemaName)
            .selectFrom("rounds")
            .where("chainId", "=", chainId)
            .where("id", "=", roundId)
            .select("matchTokenAddress")
            .executeTakeFirst();

        return res?.matchTokenAddress;
    }

    /* @inheritdoc */
    async insertRound(round: NewRound): Promise<void> {
        await this.db.withSchema(this.schemaName).insertInto("rounds").values(round).execute();
    }

    async updateRound(where: { id: string; chainId: ChainId }, round: PartialRound): Promise<void> {
        await this.db
            .withSchema(this.schemaName)
            .updateTable("rounds")
            .set(round)
            .where("id", "=", where.id)
            .where("chainId", "=", where.chainId)
            .execute();
    }

    /* @inheritdoc */
    async incrementRoundFunds(
        where: {
            chainId: ChainId;
            roundId: string;
        },
        amount: bigint,
        amountInUsd: string,
    ): Promise<void> {
        await this.db
            .withSchema(this.schemaName)
            .updateTable("rounds")
            .set((eb) => ({
                fundedAmount: eb("fundedAmount", "+", amount),
                fundedAmountInUsd: eb("fundedAmountInUsd", "+", amountInUsd),
            }))
            .where("chainId", "=", where.chainId)
            .where("id", "=", where.roundId)
            .execute();
    }

    /* @inheritdoc */
    async incrementRoundTotalDistributed(
        where: {
            chainId: ChainId;
            roundId: string;
        },
        amount: bigint,
    ): Promise<void> {
        await this.db
            .withSchema(this.schemaName)
            .updateTable("rounds")
            .set((eb) => ({
                totalDistributed: eb("totalDistributed", "+", amount),
            }))
            .where("chainId", "=", where.chainId)
            .where("id", "=", where.roundId)
            .execute();
    }

    // ============================ ROUND ROLES ============================

    /* @inheritdoc */
    async getRoundRoles(): Promise<RoundRole[]> {
        return this.db.withSchema(this.schemaName).selectFrom("roundRoles").selectAll().execute();
    }

    /* @inheritdoc */
    async insertRoundRole(roundRole: NewRoundRole): Promise<void> {
        await this.db
            .withSchema(this.schemaName)
            .insertInto("roundRoles")
            .values(roundRole)
            .execute();
    }

    /* @inheritdoc */
    async deleteManyRoundRolesByRoleAndAddress(
        chainId: ChainId,
        roundId: string,
        role: RoundRoleNames,
        address: Address,
    ): Promise<void> {
        await this.db
            .withSchema(this.schemaName)
            .deleteFrom("roundRoles")
            .where("chainId", "=", chainId)
            .where("roundId", "=", roundId)
            .where("role", "=", role)
            .where("address", "=", address)
            .execute();
    }

    // ============================ PENDING ROUND ROLES ============================

    /* @inheritdoc */
    async getPendingRoundRoles(
        chainId: ChainId,
        role: RoundRoleNames,
    ): Promise<PendingRoundRole[]> {
        return this.db
            .withSchema(this.schemaName)
            .selectFrom("pendingRoundRoles")
            .where("chainId", "=", chainId)
            .where("role", "=", role)
            .selectAll()
            .execute();
    }

    /* @inheritdoc */
    async insertPendingRoundRole(pendingRoundRole: NewPendingRoundRole): Promise<void> {
        await this.db
            .withSchema(this.schemaName)
            .insertInto("pendingRoundRoles")
            .values(pendingRoundRole)
            .execute();
    }

    /* @inheritdoc */
    async deleteManyPendingRoundRoles(ids: number[]): Promise<void> {
        await this.db
            .withSchema(this.schemaName)
            .deleteFrom("pendingRoundRoles")
            .where("id", "in", ids)
            .execute();
    }
}
