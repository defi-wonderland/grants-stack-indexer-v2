import { IProjectRepository } from "@grants-stack-indexer/repository";

import { ChangesetHandler } from "../types/index.js";

/**
 * Collection of handlers for project-related operations.
 * Each handler corresponds to a specific Project changeset type.
 */
export type ProjectHandlers = {
    InsertProject: ChangesetHandler<"InsertProject">;
    UpdateProject: ChangesetHandler<"UpdateProject">;
    InsertPendingProjectRole: ChangesetHandler<"InsertPendingProjectRole">;
    DeletePendingProjectRoles: ChangesetHandler<"DeletePendingProjectRoles">;
    InsertProjectRole: ChangesetHandler<"InsertProjectRole">;
    DeleteAllProjectRolesByRole: ChangesetHandler<"DeleteAllProjectRolesByRole">;
    DeleteAllProjectRolesByRoleAndAddress: ChangesetHandler<"DeleteAllProjectRolesByRoleAndAddress">;
};

/**
 * Creates handlers for managing project-related operations.
 *
 * @param repository - The project repository instance used for database operations
 * @returns An object containing all project-related handlers
 */
export const createProjectHandlers = (repository: IProjectRepository): ProjectHandlers => ({
    InsertProject: (async (changeset): Promise<void> => {
        const { project } = changeset.args;
        await repository.insertProject(project);
    }) satisfies ChangesetHandler<"InsertProject">,

    UpdateProject: (async (changeset): Promise<void> => {
        const { chainId, projectId, project } = changeset.args;
        await repository.updateProject({ id: projectId, chainId }, project);
    }) satisfies ChangesetHandler<"UpdateProject">,

    InsertPendingProjectRole: (async (changeset): Promise<void> => {
        const { pendingProjectRole } = changeset.args;
        await repository.insertPendingProjectRole(pendingProjectRole);
    }) satisfies ChangesetHandler<"InsertPendingProjectRole">,

    DeletePendingProjectRoles: (async (changeset): Promise<void> => {
        const { ids } = changeset.args;
        await repository.deleteManyPendingProjectRoles(ids);
    }) satisfies ChangesetHandler<"DeletePendingProjectRoles">,

    InsertProjectRole: (async (changeset): Promise<void> => {
        const { projectRole } = changeset.args;
        await repository.insertProjectRole(projectRole);
    }) satisfies ChangesetHandler<"InsertProjectRole">,

    DeleteAllProjectRolesByRole: (async (changeset): Promise<void> => {
        const { chainId, projectId, role } = changeset.args.projectRole;
        await repository.deleteManyProjectRoles(chainId, projectId, role);
    }) satisfies ChangesetHandler<"DeleteAllProjectRolesByRole">,

    DeleteAllProjectRolesByRoleAndAddress: (async (changeset): Promise<void> => {
        const { chainId, projectId, role, address } = changeset.args.projectRole;
        await repository.deleteManyProjectRoles(chainId, projectId, role, address);
    }) satisfies ChangesetHandler<"DeleteAllProjectRolesByRoleAndAddress">,
});
