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

import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { loader } from 'graphql.macro'
import React from 'react'
import Node from '../../components/Node/Node'
import { useQuery } from '@apollo/client'
import NodeInfo from '../../models/node-info'
import OsInfo from '../../models/os-info'
import NoData from '../../components/NoData/NoData'
import Loading from '../../components/Loading/Loading'
import Error from '../../components/Error/Error'
import StereotypeInfo from '../../models/stereotype-info'
import browserVersion from '../../util/browser-version'
import Capabilities from '../../models/capabilities'
import { GridConfig } from '../../config'

const NODES_QUERY = loader('../../graphql/nodes.gql')

function Overview (): JSX.Element {
  const { loading, error, data } = useQuery(NODES_QUERY, {
    pollInterval: GridConfig.status.xhrPollingIntervalMillis,
    fetchPolicy: 'network-only'
  })

  if (error !== undefined) {
    const message = 'There has been an error while loading the Nodes from the Grid.'
    const errorMessage = error?.networkError?.message
    return (
      <Grid container spacing={3}>
        <Error message={message} errorMessage={errorMessage} />
      </Grid>
    )
  }

  if (loading) {
    return (
      <Grid container spacing={3}>
        <Loading />
      </Grid>
    )
  }

  const unSortedNodes = data.nodesInfo.nodes.map((node) => {
    const osInfo: OsInfo = {
      name: node.osInfo.name,
      version: node.osInfo.version,
      arch: node.osInfo.arch
    }

    interface StereoTypeData {
      stereotype: Capabilities
      slots: number
    }

    const slotStereotypes = (JSON.parse(
      node.stereotypes) as StereoTypeData[]).map((item) => {
      const slotStereotype: StereotypeInfo = {
        browserName: item.stereotype.browserName ?? '',
        browserVersion: browserVersion(
          item.stereotype.browserVersion ?? item.stereotype.version),
        platformName: (item.stereotype.platformName ??
                      item.stereotype.platform) ?? '',
        slotCount: item.slots,
        rawData: item
      }
      return slotStereotype
    })
    const newNode: NodeInfo = {
      uri: node.uri,
      id: node.id,
      status: node.status,
      maxSession: node.maxSession,
      slotCount: node.slotCount,
      version: node.version,
      osInfo: osInfo,
      sessionCount: node.sessionCount ?? 0,
      slotStereotypes: slotStereotypes
    }
    return newNode
  })

  const nodes = unSortedNodes.sort((a, b) => (a.id < b.id ? -1 : 1))
  if (nodes.length === 0) {
    const shortMessage = 'The Grid has no registered Nodes yet.'
    return (
      <Grid container spacing={3}>
        <NoData message={shortMessage} />
      </Grid>
    )
  }

  return (
    <Grid container>
      {/* Nodes */}
      {nodes.map((node, index) => {
        return (
          <Grid
            item
            lg={6}
            sm={12}
            xl={4}
            xs={12}
            key={index}
            paddingX={1}
            paddingY={1}
          >
            <Paper
              sx={{
                display: 'flex',
                overflow: 'auto',
                flexDirection: 'column'
              }}
            >
              <Node node={node} />
            </Paper>
          </Grid>
        )
      })}
    </Grid>
  )
}

export default Overview
