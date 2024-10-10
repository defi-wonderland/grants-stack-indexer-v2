import { AnyProtocolEvent } from "@grants-stack-indexer/shared";
import { gql, GraphQLClient } from "graphql-request";

import { IndexerClientError, InvalidIndexerResponse } from "../exceptions/index.js";
import { IIndexerClient } from "../internal.js";

/**
 * Indexer client for the Envio indexer service
 */
export class EnvioIndexerClient implements IIndexerClient {
    private client: GraphQLClient;

    constructor(url: string, secret: string) {
        this.client = new GraphQLClient(url);
        this.client.setHeader("x-hasura-admin-secret", secret);
    }
    /* @inheritdoc */
    public async getEventsAfterBlockNumberAndLogIndex(
        chainId: bigint,
        blockNumber: bigint,
        logIndex: number,
        limit: number = 100,
    ): Promise<AnyProtocolEvent[]> {
        try {
            const response = (await this.client.request(
                gql`
                    query getEventsAfterBlockNumberAndLogIndex(
                        $chainId: Int!
                        $blockNumber: Int!
                        $logIndex: Int!
                        $limit: Int!
                    ) {
                        raw_events(
                            where: {
                                chain_id: { _eq: $chainId }
                                block_number: { _gte: $blockNumber }
                                log_index: { _gt: $logIndex }
                            }
                            limit: $limit
                        ) {
                            block_number: blockNumber
                            block_timestamp: blockTimestamp
                            chain_id: chainId
                            contract_name: contractName
                            event_name: eventName
                            log_index: logIndex
                            params
                            src_address: srcAddress
                        }
                    }
                `,
                { chainId, blockNumber, logIndex, limit },
            )) as { data: { raw_events: AnyProtocolEvent[] } };
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
