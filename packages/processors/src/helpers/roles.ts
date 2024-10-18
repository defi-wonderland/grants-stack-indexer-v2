import { encodePacked, keccak256, pad } from "viem";

/**
 * Get the manager and admin roles for the pool
 * Note: POOL_MANAGER_ROLE = bytes32(poolId);
 * Note: POOL_ADMIN_ROLE = keccak256(abi.encodePacked(poolId, "admin"));
 * @param poolId - The ID of the pool.
 * @returns The manager and admin roles.
 */
export const getRoundRoles = (poolId: bigint): { managerRole: string; adminRole: string } => {
    // POOL_MANAGER_ROLE = bytes32(poolId);
    const managerRole = pad(`0x${poolId.toString(16)}`);

    // POOL_ADMIN_ROLE = keccak256(abi.encodePacked(poolId, "admin"));
    const adminRawRole = encodePacked(["uint256", "string"], [poolId, "admin"]);
    const adminRole = keccak256(adminRawRole);
    return { managerRole, adminRole };
};
