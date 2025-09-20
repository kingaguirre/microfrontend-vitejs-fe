// packages/common/src/createGraphQLClient.ts
import { GraphQLClient, gql as _gql } from 'graphql-request'

/** Create a new client for any endpoint & headers. */
export function createGraphQLClient(endpoint: string, headers?: Record<string, string>) {
  return new GraphQLClient(endpoint, { headers })
}

/** Fire a query or mutation. */
export async function request<T>(
  client: GraphQLClient,
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  return client.request<T>(query, variables)
}

/** Re-export gql tag for convenience. */
export const gql = _gql
