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

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import {
  createStyles,
  StyleRules,
  Theme,
  withStyles
} from '@material-ui/core/styles'
import clsx from 'clsx'
import { loader } from 'graphql.macro'
import React, { ReactNode } from 'react'
import Node from '../../components/Node/Node'
import { ApolloClient, ApolloConsumer } from '@apollo/client'
import NodeInfo from '../../models/node-info'
import OsInfo from '../../models/os-info'
import { GridConfig } from '../../config'
import NoData from '../../components/NoData/NoData'
import Loading from '../../components/Loading/Loading'
import Error from '../../components/Error/Error'
import StereotypeInfo from '../../models/stereotype-info'
import browserVersion from '../../util/browser-version'
import Capabilities from "../../models/capabilities";

const useStyles = (theme: Theme): StyleRules => createStyles(
  {
    toolbar: {
      paddingRight: 24 // keep right padding when drawer closed
    },
    title: {
      flexGrow: 1,
      color: theme.palette.secondary.main
    },
    paper: {
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column'
    }
  })

const NODES_QUERY = loader('../../graphql/nodes.gql')

interface OverviewProps {
  classes: any
}

interface OverviewState {
  loading: boolean
  error: string | undefined
  data: any
}

class Overview extends React.Component<OverviewProps, OverviewState> {
  client: ApolloClient<any> | null
  intervalID

  constructor (props) {
    super(props)
    this.client = null
  }

  fetchData = (): void => {
    this.client?.query({ query: NODES_QUERY, fetchPolicy: 'network-only' })
      .then(({ loading, error, data }) => {
        this.setState({
          loading: loading,
          error: error?.networkError?.message,
          data: data
        })
      })
      .catch((error) => {
        this.setState({ loading: false, error: error.message })
      })
  }

  componentDidMount (): void {
    this.fetchData()
    this.intervalID =
      setInterval(this.fetchData.bind(this),
        GridConfig.status.xhrPollingIntervalMillis)
  }

  componentWillUnmount (): void {
    clearInterval(this.intervalID)
  }

  render (): ReactNode {
    if (this.client === null) {
      return (
        <ApolloConsumer>
          {client => {
            this.client = client
            return (
              <Grid container spacing={3}>
                <Loading />
              </Grid>
            )
          }}
        </ApolloConsumer>
      )
    }
    const { loading, error, data } = this.state ?? { loading: false, error: 'No connection to the Grid', data: [] }

    if (loading) {
      return (
        <Grid container spacing={3}>
          <Loading />
        </Grid>
      )
    }

    if (error !== undefined) {
      const message = 'There has been an error while loading the Nodes from the Grid.'
      return (
        <Grid container spacing={3}>
          <Error message={message} errorMessage={error} />
        </Grid>
      )
    }

    const nodes = data.nodesInfo.nodes.map((node) => {
      const osInfo: OsInfo = {
        name: node.osInfo.name,
        version: node.osInfo.version,
        arch: node.osInfo.arch
      }

      interface StereoTypeData {
        stereotype: Capabilities;
        slots: number
      }

      const slotStereotypes = (JSON.parse(node.stereotypes) as Array<StereoTypeData>).map((item) => {
        const slotStereotype: StereotypeInfo = {
          browserName: item.stereotype.browserName,
          browserVersion: browserVersion(
            item.stereotype.browserVersion ?? item.stereotype.version),
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

    if (nodes.length === 0) {
      const shortMessage = 'The Grid has no registered Nodes yet.'
      return (
        <Grid container spacing={3}>
          <NoData message={shortMessage} />
        </Grid>
      )
    }

    const { classes } = this.props
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight)

    return (
      <Grid container spacing={3}>
        {/* Nodes */}
        {nodes.map((node, index) => {
          return (
            <Grid item lg={6} sm={12} xl={4} xs={12} key={index}>
              <Paper className={fixedHeightPaper}>
                <Node node={node} />
              </Paper>
            </Grid>
          )
        })}
      </Grid>
    )
  }
}

export default withStyles(useStyles)(Overview)
