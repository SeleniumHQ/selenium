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

import React, { ReactNode } from 'react'
import { createStyles, Theme, withStyles } from '@material-ui/core'
import { StyleRules } from '@material-ui/core/styles'
import RFB from '@novnc/novnc/core/rfb'
import PasswordDialog from './PasswordDialog'

const useStyles = (theme: Theme): StyleRules => createStyles(
  {
    root: {
      backgroundColor: theme.palette.secondary.main,
      height: '100%',
      paddingTop: theme.spacing(1),
      width: '100%',
      justifyContent: 'center'
    }
  })

interface LiveViewProps {
  /**
   * The URL for which to create a remote VNC connection.
   * Should include the protocol, host, port, and path.
   */
  url?: string
  /**
   * Customize the CSS styles of the canvas element with an object.
   */
  style?: object
  /**
   * Specify if the remote session should be scaled locally so it fits its
   * container.  When disabled it will be centered if the remote session is
   * smaller than its container, or handled according to `clipViewport` if it
   * is larger.  Default is false.
   */
  scaleViewport?: boolean
  /**
   * Callback to close the Live View when the PasswordDialog is prompted and
   * the user clicks 'Cancel'
   */
  onClose: () => void
}

interface PasswordDialogState {
  open: boolean
  message: string
}

class LiveView extends React.Component<LiveViewProps, PasswordDialogState> {
  rfb: any = null
  canvas: any = null

  constructor (props) {
    super(props)
    this.state = {
      open: false,
      message: ''
    }
  }

  handlePasswordDialog = (state: boolean): void => {
    this.setState({ open: state })
  }

  disconnect = () => {
    if (!this.rfb) {
      return
    }

    this.rfb.disconnect()
    this.rfb = null
  }

  connect = () => {
    this.disconnect()

    if (!this.canvas) {
      return
    }

    this.rfb = new RFB(this.canvas, this.props.url, {})
    this.rfb.scaleViewport = this.props.scaleViewport
    this.rfb.background = 'rgb(247,248,248)'
    this.rfb.addEventListener('credentialsrequired', this.handleCredentials)
    this.rfb.addEventListener('securityfailure', this.securityFailed)
  }

  registerChild = ref => {
    this.canvas = ref
  }

  componentDidMount () {
    this.connect()
  }

  componentWillUnmount () {
    this.disconnect()
  }

  componentDidUpdate (prevProps) {
    if (!this.rfb) {
      return
    }

    this.rfb.scaleViewport = this.props.scaleViewport
  }

  securityFailed = (event: any) => {
    let errorMessage
    if ('reason' in event.detail) {
      errorMessage =
        'Connection has been rejected with reason: ' + event.detail.reason
    } else {
      errorMessage = 'New connection has been rejected'
    }
    this.setState({ message: errorMessage })
    this.connect()
  }

  handleCredentials = () => {
    this.handlePasswordDialog(true)
  }

  handleCredentialsEntered = (password: string) => {
    this.rfb.sendCredentials({ username: '', password: password })
  }

  handlePasswordDialogClose = () => {
    this.props.onClose()
  }

  handleMouseEnter = () => {
    if (!this.rfb) {
      return
    }

    this.rfb.focus()
  }

  handleMouseLeave = () => {
    if (!this.rfb) {
      return
    }

    this.rfb.blur()
  }

  render (): ReactNode {
    const { open, message } = this.state

    return (
      <div
        style={
          {
            width: '100%',
            height: '100%'
          }
        }
        ref={this.registerChild}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <PasswordDialog
          title='LiveView (VNC) Password'
          open={open}
          setOpen={this.handlePasswordDialog}
          onConfirm={this.handleCredentialsEntered}
          onCancel={this.handlePasswordDialogClose}
        >
          {message}
        </PasswordDialog>
      </div>
    )
  }
}

export default withStyles(useStyles)(LiveView)
