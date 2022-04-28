// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import React from 'react'
import RunningSessions from '../../components/RunningSessions/RunningSessions'
import { useQuery } from '@apollo/client'
import { loader } from 'graphql.macro'
import Grid from '@mui/material/Grid'
import QueuedSessions from '../../components/QueuedSessions/QueuedSessions'
import NoData from '../../components/NoData/NoData'
import Loading from '../../components/Loading/Loading'
import Error from '../../components/Error/Error'
import { GridConfig } from '../../config'

const GRID_SESSIONS_QUERY = loader('../../graphql/sessions.gql')

function Sessions (): JSX.Element {
  const { loading, error, data } = useQuery(GRID_SESSIONS_QUERY, {
    pollInterval: GridConfig.status.xhrPollingIntervalMillis,
    fetchPolicy: 'network-only'
  })

  if (error !== undefined) {
    const message = 'There has been an error while loading running and ' +
                    'queued Sessions from the Grid.'
    const errorMessage = error?.networkError?.message
    return (
      <Grid container>
        <Error message={message} errorMessage={errorMessage} />
      </Grid>
    )
  }

  if (loading) {
    return (
      <Grid container>
        <Loading />
      </Grid>
    )
  }

  if (data.sessionsInfo.sessionQueueRequests.length === 0 &&
      data.sessionsInfo.sessions.length === 0) {
    const shortMessage = 'No running or queued sessions at the moment.'
    return (
      <Grid container>
        <NoData message={shortMessage} />
      </Grid>
    )
  }

  return (
    <Grid container>
      <RunningSessions
        sessions={data.sessionsInfo.sessions}
        origin={window.location.origin}
      />
      <QueuedSessions
        sessionQueueRequests={data.sessionsInfo.sessionQueueRequests}
      />
    </Grid>
  )
}

export default Sessions
