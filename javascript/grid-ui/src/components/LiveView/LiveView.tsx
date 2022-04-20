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

function LiveView (props) {
  // let rfb: RFB = null
  let canvas: any = null

  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [rfb, setRfb] = useState<RFB>(null)
  // const [canvas, setCanvas] = useState(null)

  const handlePasswordDialog = (state: boolean): void => {
    setOpen(state)
  }

  const disconnect = () => {
    if (!rfb) {
      return
    }
    rfb.disconnect()
    setRfb(null)
    // rfb = null
  }

  const connect = () => {
    disconnect()

    if (!canvas) {
      return
    }

    // rfb = new RFB(canvas, props.url, {})
    // rfb = new RFB(canvas, props.url, { credentials: { password: 'secret' } })
    // rfb.scaleViewport = props.scaleViewport
    // rfb.background = 'rgb(247,248,248)'
    // rfb.addEventListener('credentialsrequired', handleCredentials)
    // rfb.addEventListener('securityfailure', securityFailed)
    const newRfb = new RFB(canvas, props.url, {})
    newRfb.scaleViewport = props.scaleViewport
    newRfb.background = 'rgb(247,248,248)'
    newRfb.addEventListener('credentialsrequired', handleCredentials)
    newRfb.addEventListener('securityfailure', securityFailed)
    // newRfb.addEventListener('connect', connectedToServer)
    setRfb(newRfb)
  }

  const registerChild = ref => {
    // setCanvas(ref)
    canvas = ref
  }

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
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
    connect()
  }

  const handleCredentials = () => {
    handlePasswordDialog(true)
  }

  // const connectedToServer = () => {
  //   console.log('connectedToServer')
  //   setOpen(false)
  // }

  const handleCredentialsEntered = (password: string) => {
    rfb.sendCredentials({ username: '', password: password })
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
        title="LiveView (VNC) Password"
        open={open}
        setOpen={handlePasswordDialog}
        onConfirm={handleCredentialsEntered}
        onCancel={handlePasswordDialogClose}
      >
        {message}
      </PasswordDialog>
    </div>
  )
}

export default LiveView
