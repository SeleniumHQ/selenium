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

import React, { useEffect, useState } from 'react'
import RFB from '@novnc/novnc/core/rfb'
import PasswordDialog from './PasswordDialog'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert (
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />
})

function LiveView (props) {
  let canvas: any = null

  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [rfb, setRfb] = useState<RFB>(null)
  const [openErrorAlert, setOpenErrorAlert] = useState(false)
  const [openSuccessAlert, setOpenSuccessAlert] = useState(false)

  const handlePasswordDialog = (state: boolean): void => {
    setOpen(state)
  }

  const disconnect = () => {
    if (!rfb) {
      return
    }
    rfb.disconnect()
    setRfb(null)
  }

  const connect = () => {
    disconnect()

    if (!canvas) {
      return
    }

    const newRfb = new RFB(canvas, props.url, {})
    newRfb.scaleViewport = props.scaleViewport
    newRfb.background = 'rgb(247,248,248)'
    newRfb.addEventListener('credentialsrequired', handleCredentials)
    newRfb.addEventListener('securityfailure', securityFailed)
    newRfb.addEventListener('connect', connectedToServer)
    setRfb(newRfb)
  }

  const registerChild = ref => {
    canvas = ref
  }

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (rfb) {
      rfb.scaleViewport = props.scaleViewport
    }
  })

  const securityFailed = (event: any) => {
    let errorMessage
    if ('reason' in event.detail) {
      errorMessage =
        'Connection has been rejected with reason: ' + event.detail.reason
    } else {
      errorMessage = 'New connection has been rejected'
    }
    setMessage(errorMessage)
    setOpenErrorAlert(true)
  }

  const handleCredentials = () => {
    handlePasswordDialog(true)
  }

  const connectedToServer = () => {
    setOpenSuccessAlert(true)
  }

  const handleCredentialsEntered = (password: string) => {
    rfb.sendCredentials({ username: '', password: password })
    setOpen(false)
  }

  const handlePasswordDialogClose = () => {
    props.onClose()
  }

  const handleMouseEnter = () => {
    if (!rfb) {
      return
    }
    rfb.focus()
  }

  const handleMouseLeave = () => {
    if (!rfb) {
      return
    }
    rfb.blur()
  }

  const handleClose = (event?: React.SyntheticEvent | Event,
    reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenErrorAlert(false)
    props.onClose()
  }

  return (
    <div
      style={
        {
          width: '100%',
          height: '100%'
        }
      }
      ref={registerChild}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <PasswordDialog
        title='LiveView (VNC) Password'
        open={open}
        openDialog={handlePasswordDialog}
        onConfirm={handleCredentialsEntered}
        onCancel={handlePasswordDialogClose}
      />
      <Snackbar
        open={openErrorAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert severity='error' sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
      <Snackbar
        open={openSuccessAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={4000}
        onClose={() => setOpenSuccessAlert(false)}
      >
        <Alert severity='success' sx={{ width: '100%' }}>
          Connected successfully!
        </Alert>
      </Snackbar>
    </div>
  )
}

export default LiveView
