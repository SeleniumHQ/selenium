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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography
} from '@mui/material'
import React, { useState } from 'react'
import InfoIcon from '@mui/icons-material/Info'
import OsLogo from '../common/OsLogo'
import NodeInfo from '../../models/node-info'

function NodeDetailsDialog (props) {
  const [open, setOpen] = useState(false)
  const { node } = props
  const nodeInfo: NodeInfo = node

  return (
    <Box component='span'>
      <IconButton
        sx={{ bm: 1 }}
        onClick={() => setOpen(true)}
        data-testid={`node-info-${nodeInfo.id}`}
        size='large'
      >
        <InfoIcon />
      </IconButton>
      <Dialog
        onClose={() => setOpen(false)}
        aria-labelledby='node-info-dialog' open={open}
      >
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
          <Button
            onClick={() => setOpen(false)}
            color='primary'
            variant='contained'
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default NodeDetailsDialog
