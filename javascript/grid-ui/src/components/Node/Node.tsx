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

import { Box, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Typography, Button, keyframes, styled } from '@mui/material'
import React, { useState, useRef } from 'react'
import { Videocam as VideocamIcon } from '@mui/icons-material'
import NodeDetailsDialog from './NodeDetailsDialog'
import NodeLoad from './NodeLoad'
import Stereotypes from './Stereotypes'
import OsLogo from '../common/OsLogo'
import LiveView from '../LiveView/LiveView'

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(25, 118, 210, 0);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
    transform: scale(1);
  }
`

const LiveIconButton = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    animation: `${pulse} 2s infinite`,
    zIndex: 0
  }
}))

function getVncUrl(session, origin) {
  try {
    const parsed = JSON.parse(session.capabilities)
    let vnc = parsed['se:vnc'] ?? ''
    if (vnc.length > 0) {
      try {
        const url = new URL(origin)
        const vncUrl = new URL(vnc)
        url.pathname = vncUrl.pathname
        url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
        return url.href
      } catch (error) {
        console.log(error)
        return ''
      }
    }
    return ''
  } catch (e) {
    return ''
  }
}

function Node (props) {
  const { node, sessions = [], origin } = props
  const [liveViewSessionId, setLiveViewSessionId] = useState('')
  const liveViewRef = useRef<{ disconnect: () => void }>(null)

  const vncSession = sessions.find(session => {
    try {
      const capabilities = JSON.parse(session.capabilities)
      return capabilities['se:vnc'] !== undefined && capabilities['se:vnc'] !== ''
    } catch (e) {
      return false
    }
  })

  const handleLiveViewIconClick = () => {
    if (vncSession) {
      setLiveViewSessionId(vncSession.id)
    }
  }

  const handleDialogClose = () => {
    if (liveViewRef.current) {
      liveViewRef.current.disconnect()
    }
    setLiveViewSessionId('')
  }
  const getCardStyle = (status: string) => ({
    height: '100%',
    flexGrow: 1,
    opacity: status === 'DOWN' ? 0.25 : 1,
    bgcolor: (status === 'DOWN' || status === 'DRAINING') ? 'grey.A100' : ''
  })

  return (
    <>
    <Card sx={getCardStyle(node.status)}>
      <CardContent sx={{ pl: 2, pr: 1 }}>
        <Grid
          container
          justifyContent="space-between"
          spacing={1}
        >
          <Grid item xs={10}>
            <Typography
              color="textPrimary"
              gutterBottom
              variant="h6"
            >
              <Box fontWeight="fontWeightBold" mr={1} display="inline">
                URI:
              </Box>
              {node.uri}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography
              color="textPrimary"
              gutterBottom
              variant="h6"
            >
              <OsLogo osName={node.osInfo.name}/>
              <NodeDetailsDialog node={node}/>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
            <Stereotypes stereotypes={node.slotStereotypes}/>
              {vncSession && (
                <LiveIconButton onClick={handleLiveViewIconClick} size='medium' color="primary">
                  <VideocamIcon data-testid="VideocamIcon" />
                </LiveIconButton>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <NodeLoad node={node}/>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
    {vncSession && liveViewSessionId && (
      <Dialog
        onClose={handleDialogClose}
        aria-labelledby='live-view-dialog'
        open={liveViewSessionId === vncSession.id}
        fullWidth
        maxWidth='xl'
        fullScreen
      >
        <DialogTitle id='live-view-dialog'>
          <Typography gutterBottom component='span' sx={{ paddingX: '10px' }}>
            <Box fontWeight='fontWeightBold' mr={1} display='inline'>
              Node Session Live View
            </Box>
            {node.uri}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ height: '600px' }}>
          <LiveView
            ref={liveViewRef as any}
            url={getVncUrl(vncSession, origin)}
            scaleViewport
            onClose={handleDialogClose}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color='primary' variant='contained'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )}
    </>
  )
}

export default Node
