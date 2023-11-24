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

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  NormalizedCacheObject,
  useQuery
} from '@apollo/client'
import { Route, Routes } from 'react-router-dom'
import React, { useState } from 'react'
import ReactModal from 'react-modal'
import { GridConfig } from './config'
import TopBar from './components/TopBar/TopBar'
import Overview from './screens/Overview/Overview'
import Footer from './components/Footer/Footer'
import Container from '@mui/material/Container'
import Sessions from './screens/Sessions/Sessions'
import Help from './screens/Help/Help'
import { loader } from 'graphql.macro'
import NavBar from './components/NavBar/NavBar'
import { Box } from '@mui/material'

export const client: ApolloClient<NormalizedCacheObject> = new ApolloClient(
  {
    cache: new InMemoryCache(),
    uri: GridConfig.serverUri
  })

if (process.env.NODE_ENV !== 'test') {
  ReactModal.setAppElement('#root')
}

const GRID_QUERY = loader('./graphql/grid.gql')

function App () {
  const { error, data } = useQuery(GRID_QUERY, {
    pollInterval: GridConfig.status.xhrPollingIntervalMillis,
    fetchPolicy: 'network-only',
    client: client
  })

  const [drawerOpen, setDrawerOpen] = useState(true)

  const toggleDrawer = (): void => {
    setDrawerOpen(!drawerOpen)
  }

  const maxSession = error !== undefined ? 0 : data?.grid?.maxSession ?? 0
  const sessionCount = error !== undefined ? 0 : data?.grid?.sessionCount ?? 0
  const nodeCount = error !== undefined ? 0 : data?.grid?.nodeCount ?? 0
  const sessionQueueSize = error !== undefined
    ? 0
    : data?.grid?.sessionQueueSize ?? 0

  const topBarSubheader = error !== undefined
    ? error?.networkError?.message
    : data?.grid?.version

  return (
    <ApolloProvider client={client}>
      <Box display='flex'>
        <TopBar
          subheader={topBarSubheader}
          error={error !== undefined}
          drawerOpen={drawerOpen}
          toggleDrawer={toggleDrawer}
        />
        {error === undefined && (
          <NavBar
            open={drawerOpen}
            maxSession={maxSession}
            sessionCount={sessionCount}
            nodeCount={nodeCount}
            sessionQueueSize={sessionQueueSize}
          />
        )}
        <Box
          component='main'
          sx={{
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
            paddingTop: 8
          }}
        >
          <Container maxWidth={false} sx={{ paddingY: 4 }}>
            <Routes>
              <Route path='/sessions' element={<Sessions />} />
              <Route path='/help' element={<Help />} />
              <Route path='/' element={<Overview />} />
              <Route path='*' element={<Help />} />
            </Routes>
          </Container>
          <Footer />
        </Box>
      </Box>
    </ApolloProvider>
  )
}

export default App
