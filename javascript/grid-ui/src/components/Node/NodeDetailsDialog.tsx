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
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Theme,
  Typography,
  withStyles
} from '@material-ui/core'
import React, { ReactNode } from 'react'
import NodeInfo from '../../models/node-info'
import InfoIcon from '@material-ui/icons/Info'
import OsLogo from '../common/OsLogo'
import { StyleRules } from '@material-ui/core/styles'

const useStyles = (theme: Theme): StyleRules => createStyles(
  {
    buttonMargin: {
      padding: 1
    }
  })

interface NodeDetailsDialogProps {
  node: NodeInfo
  classes: any
}

interface NodeDetailsDialogState {
  open: boolean
}

class NodeDetailsDialog extends React.Component<NodeDetailsDialogProps, NodeDetailsDialogState> {
  constructor (props) {
    super(props)
    this.state = {
      open: false
    }
  }

  handleDialogOpen = (): void => {
    this.setState({ open: true })
  }

  handleDialogClose = (): void => {
    this.setState({ open: false })
  }

  render (): ReactNode {
    const { node, classes } = this.props
    const { open } = this.state
    const nodeInfo = node

    return (
      <Box component='span'>
        <IconButton
          className={classes.buttonMargin}
          onClick={this.handleDialogOpen}
          data-testid={`node-info-${nodeInfo.id}`}
        >
          <InfoIcon />
        </IconButton>
        <Dialog onClose={this.handleDialogClose} aria-labelledby='node-info-dialog' open={open}>
          <DialogTitle id='node-info-dialog'>
            <OsLogo osName={nodeInfo.osInfo.name} />
            <Box fontWeight='fontWeightBold' mr={1} display='inline'>
              URI:
            </Box>
            {nodeInfo.uri}
          </DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom>
              Node Id: {nodeInfo.id}
            </Typography>
            <Typography gutterBottom>
              OS Arch: {nodeInfo.osInfo.arch}
            </Typography>
            <Typography gutterBottom>
              OS Name: {nodeInfo.osInfo.name}
            </Typography>
            <Typography gutterBottom>
              OS Version: {nodeInfo.osInfo.version}
            </Typography>
            <Typography gutterBottom>
              Total slots: {nodeInfo.slotCount}
            </Typography>
            <Typography gutterBottom>
              Grid version: {nodeInfo.version}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDialogClose} color='primary' variant='contained'>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }
}

export default withStyles(useStyles)(NodeDetailsDialog)
