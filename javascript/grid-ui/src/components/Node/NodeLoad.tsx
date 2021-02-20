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
  Box,
  Grid,
  Typography
} from '@material-ui/core'
import React, { ReactNode } from 'react'
import NodeInfo from '../../models/node-info'
import LinearProgress, { LinearProgressProps } from '@material-ui/core/LinearProgress'

function LinearProgressWithLabel (props: LinearProgressProps & { value: number }): JSX.Element {
  return (
    <Box display='flex' alignItems='center'>
      <Box width='100%' mr={1}>
        <LinearProgress variant='determinate' {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant='body2' color='textSecondary'>
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  )
}

class NodeLoad extends React.Component<{ node: NodeInfo }, {}> {
  render (): ReactNode {
    const { node } = this.props
    const sessionCount = node.sessionCount ?? 0
    const currentLoad = sessionCount === 0
      ? 0
      : Math.min(((sessionCount / node.maxSession) * 100), 100).toFixed(2)

    return (
      <Grid item xs={12}>
        <Grid
          container
          justify='space-between'
          spacing={2}
        >
          <Grid item xs={3}>
            <Box pt={1} mt={2}>
              <Typography
                variant='body2'
                gutterBottom
              >
                Sessions: {sessionCount}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Box pt={1} mt={2}>
              <Typography
                variant='body2'
                gutterBottom
              >
                Max. Concurrency: {node.maxSession}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <LinearProgressWithLabel value={Number(currentLoad)} />
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

export default NodeLoad
