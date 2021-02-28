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
  Card,
  CardContent,
  createStyles,
  Grid,
  Theme,
  Typography,
  withStyles
} from '@material-ui/core'
import React, { ReactNode } from 'react'
import NodeInfo from '../../models/node-info'
import NodeDetailsDialog from './NodeDetailsDialog'
import NodeLoad from './NodeLoad'
import Stereotypes from './Stereotypes'
import clsx from 'clsx'
import OsLogo from '../common/OsLogo'
import { StyleRules } from '@material-ui/core/styles'

const useStyles = (theme: Theme): StyleRules => createStyles(
  {
    root: {
      height: '100%',
      flexGrow: 1
    },
    paddingContent: {
      paddingRight: 10,
      paddingLeft: 10
    },
    osLogo: {
      width: 32,
      height: 32,
      marginRight: 5
    },
    up: {},
    down: {
      backgroundColor: theme.palette.grey.A100
    }
  })

interface NodeProps {
  node: NodeInfo
  classes: any
}

class Node extends React.Component<NodeProps, {}> {
  render (): ReactNode {
    const { node, classes } = this.props
    const nodeStatusClass = node.status === 'UP' ? classes.up : classes.down

    return (
      <Card className={clsx(classes.root, nodeStatusClass)}>
        <CardContent className={classes.paddingContent}>
          <Grid
            container
            justify='space-between'
            spacing={1}
          >
            <Grid item xs={10}>
              <Typography
                color='textPrimary'
                gutterBottom
                variant='h6'
              >
                <Box fontWeight='fontWeightBold' mr={1} display='inline'>
                  URI:
                </Box>
                {node.uri}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography
                color='textPrimary'
                gutterBottom
                variant='h6'
              >
                <OsLogo osName={node.osInfo.name} />
                <NodeDetailsDialog node={node} />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Stereotypes stereotypes={node.slotStereotypes} />
            </Grid>
            <Grid item xs={12}>
              <NodeLoad node={node} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }
}

export default withStyles(useStyles)(Node)
