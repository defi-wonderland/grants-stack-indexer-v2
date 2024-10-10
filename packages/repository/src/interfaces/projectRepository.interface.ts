import { Address, ChainId } from "@grants-stack-indexer/shared";

import {
    NewPendingProjectRole,
    NewProject,
    NewProjectRole,
    PartialProject,
    PendingProjectRole,
    Project,
    ProjectRoleNames,
} from "../types/project.types.js";

export interface IProjectReadRepository {
    /**
     * Retrieves all projects for a given chain ID.
     * @param chainId The chain ID to filter projects by.
     * @returns A promise that resolves to an array of Project objects.
     */
    getProjects(chainId: ChainId): Promise<Project[]>;

    /**
     * Retrieves a specific project by its ID and chain ID.
     * @param chainId The chain ID of the project.
     * @param projectId The unique identifier of the project.
     * @returns A promise that resolves to a Project object if found, or undefined if not found.
     */
    getProjectById(chainId: ChainId, projectId: string): Promise<Project | undefined>;

    /**
     * Retrieves all pending project roles.
     * @returns A promise that resolves to an array of PendingProjectRole objects.
     */
    getPendingProjectRoles(): Promise<PendingProjectRole[]>;

    /**
     * Retrieves pending project roles for a specific chain ID and role.
     * @param chainId The chain ID to filter pending roles by.
     * @param role The role to filter pending roles by.
     * @returns A promise that resolves to an array of PendingProjectRole objects.
     */
    getPendingProjectRolesByRole(chainId: ChainId, role: string): Promise<PendingProjectRole[]>;

    /**
     * Retrieves a project by its anchor address and chain ID.
     * @param chainId The chain ID of the project.
     * @param anchorAddress The anchor address of the project.
     * @returns A promise that resolves to a Project object if found, or undefined if not found.
     */
    getProjectByAnchor(chainId: ChainId, anchorAddress: Address): Promise<Project | undefined>;
}

export interface IProjectRepository extends IProjectReadRepository {
    /**
     * Inserts a new project into the repository.
     * @param project The new project to be inserted.
     * @returns A promise that resolves when the insertion is complete.
     */
    insertProject(project: NewProject): Promise<void>;

    /**
     * Updates an existing project in the repository.
     * @param where An object containing the id and chainId to identify the project to update.
     * @param project The partial project data to update.
     * @returns A promise that resolves when the update is complete.
     */
    updateProject(where: { id: string; chainId: ChainId }, project: PartialProject): Promise<void>;

    /**
     * Inserts a new project role into the repository.
     * @param projectRole The new project role to be inserted.
     * @returns A promise that resolves when the insertion is complete.
     */
    insertProjectRole(projectRole: NewProjectRole): Promise<void>;

    /**
     * Deletes multiple project roles based on the provided criteria.
     * @param chainId The chain ID of the project roles to delete.
     * @param projectId The project ID of the roles to delete.
     * @param role The role type to delete.
     * @param address Optional address to further filter the roles to delete.
     * @returns A promise that resolves when the deletion is complete.
     */
    deleteManyProjectRoles(
        chainId: ChainId,
        projectId: string,
        role: ProjectRoleNames,
        address?: Address,
    ): Promise<void>;

    /**
     * Inserts a new pending project role into the repository.
     * @param pendingProjectRole The new pending project role to be inserted.
     * @returns A promise that resolves when the insertion is complete.
     */
    insertPendingProjectRole(pendingProjectRole: NewPendingProjectRole): Promise<void>;

    /**
     * Deletes multiple pending project roles based on their IDs.
     * @param ids An array of IDs of the pending project roles to delete.
     * @returns A promise that resolves when the deletion is complete.
     */
    deleteManyPendingProjectRoles(ids: number[]): Promise<void>;
}
