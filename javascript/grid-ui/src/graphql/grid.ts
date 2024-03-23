import { gql } from '@apollo/client'

export const GRID_QUERY = gql`
  query Summary {
    grid {
      uri
      totalSlots
      nodeCount
      maxSession
      sessionCount
      sessionQueueSize
      version
    }
  }
`
