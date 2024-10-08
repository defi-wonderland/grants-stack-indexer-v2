import { AnyProtocolEvent } from "@grants-stack-indexer/shared";
import { gql, GraphQLClient } from "graphql-request";

import { IndexerClientError, InvalidIndexerResponse } from "../exceptions/index.js";
import { IIndexerClient } from "../internal.js";

export class EnvioIndexerClient implements IIndexerClient {
    private client: GraphQLClient;

    constructor(url: string, secret: string) {
        this.client = new GraphQLClient(url);
        this.client.setHeader("x-hasura-admin-secret", secret);
    }

    public async getEventsByBlockNumberAndLogIndex(
        chainId: number,
        blockNumber: number,
        logIndex: number,
        limit: number = 100,
    ): Promise<AnyProtocolEvent[]> {
        try {
            const response = (await this.client.rawRequest(gql`
                query getEventsByChainIdBlockNumberAndLogIndex {
                    raw_events(
                        where: {
                            chain_id: { _eq: ${chainId} }
                            block_number: { _gte: ${blockNumber} }
                            log_index: { _gt: ${logIndex} }
                        }
                        limit: ${limit}
                    ) {
                        block_number
                        block_timestamp
                        chain_id
                        contract_name
                        event_name
                        log_index
                        params
                        src_address
                    }
                }
            `)) as { data: { raw_events: AnyProtocolEvent[] } };
            if (response?.data?.raw_events) {
                return response.data.raw_events;
            } else {
                throw new InvalidIndexerResponse(JSON.stringify(response));
            }
        } catch (error) {
            if (error instanceof InvalidIndexerResponse) {
                throw error;
            }
            throw new IndexerClientError(JSON.stringify(error));
        }
    }
}
