/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Registry } from "../../generated";

// Handler for RoleGranted event
Registry.RoleGranted.handler(async ({}) => {});

// Handler for RoleRevoked event
Registry.RoleRevoked.handler(async ({}) => {});

// Handler for ProfileCreated event
Registry.ProfileCreated.handler(async ({}) => {});

// Handler for ProfileMetadataUpdated event
Registry.ProfileMetadataUpdated.handler(async ({}) => {});

// Handler for ProfileNameUpdated event
Registry.ProfileNameUpdated.handler(async ({}) => {});

// Handler for ProfileOwnerUpdated event
Registry.ProfileOwnerUpdated.handler(async ({}) => {});
