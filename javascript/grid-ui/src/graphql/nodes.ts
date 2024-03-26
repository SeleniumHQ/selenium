import { gql } from '@apollo/client'

export const NODES_QUERY = gql`
  query GetNodes {
    nodesInfo {
      nodes {
        id
        uri
        status
        maxSession
        slotCount
        stereotypes
        version
        sessionCount
        osInfo {
          version
          name
          arch
        }
      }
    }
}
`
