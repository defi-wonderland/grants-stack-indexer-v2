import { CamelCasePlugin, ColumnType, Kysely, PostgresDialect } from "kysely";
import { Pool, PoolConfig } from "pg";

import {
    Application,
    PendingProjectRole as PendingProjectRoleTable,
    PendingRoundRole as PendingRoundRoleTable,
    ProjectRole as ProjectRoleTable,
    Project as ProjectTable,
    RoundRole as RoundRoleTable,
    Round as RoundTable,
    StatusSnapshot,
} from "../internal.js";

export interface DatabaseConfig extends PoolConfig {
    connectionString: string;
}

type ApplicationTable = Omit<Application, "statusSnapshots"> & {
    statusSnapshots: ColumnType<
        StatusSnapshot[],
        StatusSnapshot[] | string,
        StatusSnapshot[] | string
    >;
};

export interface Database {
    rounds: RoundTable;
    pendingRoundRoles: PendingRoundRoleTable;
    roundRoles: RoundRoleTable;
    projects: ProjectTable;
    pendingProjectRoles: PendingProjectRoleTable;
    projectRoles: ProjectRoleTable;
    applications: ApplicationTable;
}

/**
 * Creates and configures a Kysely database instance for PostgreSQL.
 *
 * @param config - The database configuration object extending PoolConfig.
 * @returns A configured Kysely instance for the Database.
 *
 * This function sets up a PostgreSQL database connection using Kysely ORM.
 *
 * @example
 * const dbConfig: DatabaseConfig = {
 *   connectionString: 'postgresql://user:password@localhost:5432/mydb'
 * };
 * const db = createKyselyDatabase(dbConfig);
 */
export const createKyselyPostgresDb = (config: DatabaseConfig): Kysely<Database> => {
    const dialect = new PostgresDialect({
        pool: new Pool({
            max: 15,
            idleTimeoutMillis: 30_000,
            keepAlive: true,
            connectionTimeoutMillis: 5_000,
            ...config,
        }),
    });

    return new Kysely<Database>({ dialect, plugins: [new CamelCasePlugin()] });
};
