import { gql } from '@apollo/client'

export const GRID_SESSIONS_QUERY = gql`
  query GetSessions {
      sessionsInfo {
          sessions {
              id
              capabilities
              startTime
              uri
              nodeId
              nodeUri
              sessionDurationMillis
              slot {
                  id
                  stereotype
                  lastStarted
              }
          }
          sessionQueueRequests
      }
  }
`
