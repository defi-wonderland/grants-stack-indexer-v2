// /*
//  * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
//  */
import { Allo } from "../../generated";

Allo.PoolCreated.contractRegister(({ event, context }) => {
    context.addStrategy(event.params.strategy);
});

Allo.PoolCreated.handler(async ({}) => {});

Allo.PoolMetadataUpdated.handler(async ({}) => {});

Allo.PoolFunded.handler(async ({}) => {});

Allo.RoleGranted.handler(async ({}) => {});

Allo.RoleRevoked.handler(async ({}) => {});
