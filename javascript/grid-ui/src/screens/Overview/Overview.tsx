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
import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material'
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
import { NODES_QUERY } from '../../graphql/nodes'

function Overview (): JSX.Element {
  const { loading, error, data } = useQuery(NODES_QUERY, {
    pollInterval: GridConfig.status.xhrPollingIntervalMillis,
    fetchPolicy: 'network-only'
  })

  function compareSlotStereotypes(a: NodeInfo, b: NodeInfo, attribute: string): number {
    const joinA = a.slotStereotypes.length === 1
      ? a.slotStereotypes[0][attribute]
      : a.slotStereotypes.slice().map(st => st[attribute]).reverse().join(',')
    const joinB = b.slotStereotypes.length === 1
      ? b.slotStereotypes[0][attribute]
      : b.slotStereotypes.slice().map(st => st[attribute]).reverse().join(',')
    return joinA.localeCompare(joinB)
  }

  const sortProperties = {
    'platformName': (a, b) => compareSlotStereotypes(a, b, 'platformName'),
    'status': (a, b) => a.status.localeCompare(b.status),
    'browserName': (a, b) => compareSlotStereotypes(a, b, 'browserName'),
    'browserVersion': (a, b) => compareSlotStereotypes(a, b, 'browserVersion'),
    'slotCount': (a, b) => {
      const valueA = a.slotStereotypes.reduce((sum, st) => sum + st.slotCount, 0)
      const valueB = b.slotStereotypes.reduce((sum, st) => sum + st.slotCount, 0)
      return valueA < valueB ? -1 : 1
    },
    'id': (a, b) => (a.id < b.id ? -1 : 1)
  }

  const sortPropertiesLabel = {
    'platformName': 'Platform Name',
    'status': 'Status',
    'browserName': 'Browser Name',
    'browserVersion': 'Browser Version',
    'slotCount': 'Slot Count',
    'id': 'ID'
  }

  const [sortOption, setSortOption] = useState(Object.keys(sortProperties)[0])
  const [sortOrder, setSortOrder] = useState(1)
  const [sortedNodes, setSortedNodes] = useState<NodeInfo[]>([])
  const [isDescending, setIsDescending] = useState(false)

  const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortOption(event.target.value as string)
  }

  const handleOrderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsDescending(event.target.checked)
    setSortOrder(event.target.checked ? -1 : 1)
  }

  const sortNodes = useMemo(() => {
    return (nodes: NodeInfo[], option: string, order: number) => {
      const sortFn = sortProperties[option] || (() => 0)
      return nodes.sort((a, b) => order * sortFn(a, b))
    }
  }, [sortOption, sortOrder])

  useEffect(() => {
    if (data) {
      const unSortedNodes = data.nodesInfo.nodes.map((node) => {
        const osInfo: OsInfo = {
          name: node.osInfo.name,
          version: node.osInfo.version,
          arch: node.osInfo.arch
        }

        interface StereoTypeData {
          stereotype: Capabilities;
          slots: number;
        }

        const slotStereotypes = (JSON.parse(
          node.stereotypes) as StereoTypeData[]).map((item) => {
          const slotStereotype: StereotypeInfo = {
            browserName: item.stereotype.browserName ?? '',
            browserVersion: browserVersion(
              item.stereotype.browserVersion ?? item.stereotype.version),
            platformName: (item.stereotype.platformName
                          ?? item.stereotype.platform) ?? '',
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

      setSortedNodes(sortNodes(unSortedNodes, sortOption, sortOrder))
    }
  }, [data, sortOption, sortOrder])

  if (error !== undefined) {
    const message = 'There has been an error while loading the Nodes from the Grid.'
    const errorMessage = error?.networkError?.message
    return (
      <Grid container spacing={3}>
        <Error message={message} errorMessage={errorMessage}/>
      </Grid>
    )
  }

  if (loading) {
    return (
      <Grid container spacing={3}>
        <Loading/>
      </Grid>
    )
  }

  if (sortedNodes.length === 0) {
    const shortMessage = 'The Grid has no registered Nodes yet.'
    return (
      <Grid container spacing={3}>
        <NoData message={shortMessage}/>
      </Grid>
    )
  }

  return (
    <Grid container>
      <Grid item xs={12}
            style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <FormControl variant="outlined" style={{ marginBottom: '16px' }}>
          <InputLabel>Sort By</InputLabel>
          <Box display="flex" alignItems="center">
            <Select value={sortOption} onChange={handleSortChange}
                    label="Sort By" style={{ minWidth: '170px' }}>
              {Object.keys(sortProperties).map((key) => (
                <MenuItem value={key}>
                  {sortPropertiesLabel[key]}
                </MenuItem>
              ))}
            </Select>
            <FormControlLabel
              control={<Checkbox checked={isDescending}
                                 onChange={handleOrderChange}/>}
              label="Descending"
              style={{ marginLeft: '8px' }}
            />
          </Box>
        </FormControl>
      </Grid>
      {sortedNodes.map((node, index) => {
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
              <Node node={node}/>
            </Paper>
          </Grid>
        )
      })}
    </Grid>
  )
}

export default Overview
