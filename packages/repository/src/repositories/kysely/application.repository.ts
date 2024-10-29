import { Kysely } from "kysely";

import { Address, ChainId, stringify } from "@grants-stack-indexer/shared";

import {
    Application,
    Database,
    IApplicationRepository,
    NewApplication,
    PartialApplication,
} from "../../internal.js";

export class KyselyApplicationRepository implements IApplicationRepository {
    constructor(
        private readonly db: Kysely<Database>,
        private readonly schemaName: string,
    ) {}

    /* @inheritdoc */
    async getApplicationById(
        id: string,
        chainId: ChainId,
        roundId: string,
    ): Promise<Application | undefined> {
        return this.db
            .withSchema(this.schemaName)
            .selectFrom("applications")
            .where("id", "=", id)
            .where("chainId", "=", chainId)
            .where("roundId", "=", roundId)
            .selectAll()
            .executeTakeFirst();
    }

    /* @inheritdoc */
    async getApplicationByProjectId(
        chainId: ChainId,
        roundId: string,
        projectId: string,
    ): Promise<Application | undefined> {
        return this.db
            .withSchema(this.schemaName)
            .selectFrom("applications")
            .where("chainId", "=", chainId)
            .where("roundId", "=", roundId)
            .where("projectId", "=", projectId)
            .selectAll()
            .executeTakeFirst();
    }

    /* @inheritdoc */
    async getApplicationByAnchorAddress(
        chainId: ChainId,
        roundId: string,
        anchorAddress: Address,
    ): Promise<Application | undefined> {
        return this.db
            .withSchema(this.schemaName)
            .selectFrom("applications")
            .where("chainId", "=", chainId)
            .where("roundId", "=", roundId)
            .where("anchorAddress", "=", anchorAddress)
            .selectAll()
            .executeTakeFirst();
    }

    /* @inheritdoc */
    async getApplicationsByRoundId(chainId: ChainId, roundId: string): Promise<Application[]> {
        return this.db
            .withSchema(this.schemaName)
            .selectFrom("applications")
            .where("chainId", "=", chainId)
            .where("roundId", "=", roundId)
            .selectAll()
            .execute();
    }

    /* @inheritdoc */
    async insertApplication(application: NewApplication): Promise<void> {
        const _application = this.formatApplication(application);

        await this.db
            .withSchema(this.schemaName)
            .insertInto("applications")
            .values(_application)
            .execute();
    }

    /* @inheritdoc */
    async updateApplication(
        where: { id: string; chainId: ChainId; roundId: string },
        application: PartialApplication,
    ): Promise<void> {
        const _application = this.formatApplication(application);

        await this.db
            .withSchema(this.schemaName)
            .updateTable("applications")
            .set(_application)
            .where("id", "=", where.id)
            .where("chainId", "=", where.chainId)
            .where("roundId", "=", where.roundId)
            .execute();
    }

    /**
     * Formats the application to ensure that the statusSnapshots are stored as a JSON string.
     * Also, properly handles BigInt stringification.
     * @param application - The application to format.
     * @returns The formatted application.
     */
    private formatApplication<T extends NewApplication | PartialApplication>(application: T): T {
        if (application?.statusSnapshots) {
            application = {
                ...application,
                statusSnapshots: stringify(application.statusSnapshots),
            };
        }
        return application;
    }
}
