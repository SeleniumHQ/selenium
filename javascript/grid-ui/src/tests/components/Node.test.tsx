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

import * as React from 'react'
import Node from '../../components/Node/Node'
import NodeInfo from '../../models/node-info'
import OsInfo from '../../models/os-info'
import StereotypeInfo from '../../models/stereotype-info'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

jest.mock('../../components/LiveView/LiveView', () => {
  return {
    __esModule: true,
    default: React.forwardRef((props: { url: string, scaleViewport?: boolean, onClose?: () => void }, ref) => {
      React.useImperativeHandle(ref, () => ({
        disconnect: jest.fn()
      }))
      return <div data-testid="mock-live-view" data-url={props.url}>LiveView Mock</div>
    })
  }
})

const osInfo: OsInfo = {
  name: 'Mac OS X',
  version: '10.16',
  arch: 'x86_64'
}

const slotStereotype: StereotypeInfo = {
  browserName: 'chrome',
  browserVersion: 'v. 88',
  slotCount: 12,
  rawData: ['stereotype: {"browserName": "chrome"}'],
  platformName: 'macos'
}

const node: NodeInfo = {
  uri: 'http://192.168.1.7:4444',
  id: '9e92a45a-0de3-4424-824a-ff7b6aa57b16',
  status: 'UP',
  maxSession: 12,
  slotCount: 50,
  version: '4.0.0-beta-1',
  osInfo: osInfo,
  sessionCount: 2,
  slotStereotypes: [slotStereotype]
}

const sessionWithVnc = {
  id: 'session-with-vnc',
  capabilities: JSON.stringify({
    'browserName': 'chrome',
    'browserVersion': '88.0',
    'se:vnc': 'ws://172.17.0.2:4444/session/4d31d065-6cb9-4545-ac8d-d70ed5f5168b/se/vnc'
  }),
  nodeId: node.id
}

const sessionWithoutVnc = {
  id: 'session-without-vnc',
  capabilities: JSON.stringify({
    'browserName': 'chrome',
    'browserVersion': '88.0'
  }),
  nodeId: node.id
}

describe('Node component', () => {
  it('renders basic node information', () => {
    render(<Node node={node} />)
    expect(screen.getByText(node.uri)).toBeInTheDocument()
    expect(
      screen.getByText(`Sessions: ${node.sessionCount}`)).toBeInTheDocument()
    expect(screen.getByText(
      `Max. Concurrency: ${node.maxSession}`)).toBeInTheDocument()
  })

  it('renders detailed node information', async () => {
    render(<Node node={node}/>)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))
    expect(screen.getByText(`Node Id: ${node.id}`)).toBeInTheDocument()
    expect(
      screen.getByText(`Total slots: ${node.slotCount}`)).toBeInTheDocument()
    expect(screen.getByText(`OS Arch: ${node.osInfo.arch}`)).toBeInTheDocument()
    expect(screen.getByText(`OS Name: ${node.osInfo.name}`)).toBeInTheDocument()
    expect(
      screen.getByText(`OS Version: ${node.osInfo.version}`)).toBeInTheDocument()
  })

  it('does not render live view icon when no VNC session is available', () => {
    render(<Node node={node} sessions={[sessionWithoutVnc]} origin="http://localhost:4444" />)
    expect(screen.queryByTestId('VideocamIcon')).not.toBeInTheDocument()
  })

  it('renders live view icon when VNC session is available', () => {
    render(<Node node={node} sessions={[sessionWithVnc]} origin="http://localhost:4444" />)
    expect(screen.getByTestId('VideocamIcon')).toBeInTheDocument()
  })

  it('opens live view dialog when camera icon is clicked', async () => {
    render(<Node node={node} sessions={[sessionWithVnc]} origin="http://localhost:4444" />)

    const user = userEvent.setup()
    await user.click(screen.getByTestId('VideocamIcon'))

    expect(screen.getByText('Node Session Live View')).toBeInTheDocument()
    const dialogTitle = screen.getByText('Node Session Live View')
    const dialog = dialogTitle.closest('.MuiDialog-root')
    expect(dialog).not.toBeNull()
    if (dialog) {
      expect(within(dialog as HTMLElement).getAllByText(node.uri).length).toBeGreaterThan(0)
    }
    expect(screen.getByTestId('mock-live-view')).toBeInTheDocument()
  })

  it('closes live view dialog when close button is clicked', async () => {
    render(<Node node={node} sessions={[sessionWithVnc]} origin="http://localhost:4444" />)

    const user = userEvent.setup()
    await user.click(screen.getByTestId('VideocamIcon'))

    expect(screen.getByText('Node Session Live View')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(screen.queryByText('Node Session Live View')).not.toBeInTheDocument()
  })

  it('correctly transforms VNC URL for WebSocket connection', async () => {
    const origin = 'https://grid.example.com'
    render(<Node node={node} sessions={[sessionWithVnc]} origin={origin} />)

    const user = userEvent.setup()
    await user.click(screen.getByTestId('VideocamIcon'))

    const liveView = screen.getByTestId('mock-live-view')
    const url = liveView.getAttribute('data-url')

    expect(url).toBe('wss://grid.example.com/session/4d31d065-6cb9-4545-ac8d-d70ed5f5168b/se/vnc')
  })

  it('handles HTTP to WS protocol conversion correctly', async () => {
    const httpOrigin = 'http://grid.example.com'
    render(<Node node={node} sessions={[sessionWithVnc]} origin={httpOrigin} />)

    const user = userEvent.setup()
    await user.click(screen.getByTestId('VideocamIcon'))

    const liveView = screen.getByTestId('mock-live-view')
    const url = liveView.getAttribute('data-url')

    expect(url).toContain('ws:')
    expect(url).not.toContain('wss:')
  })

  it('handles invalid VNC URLs gracefully', async () => {
    const invalidVncSession = {
      id: 'session-invalid-vnc',
      capabilities: JSON.stringify({
        'browserName': 'chrome',
        'browserVersion': '88.0',
        'se:vnc': 'invalid-url'
      }),
      nodeId: node.id
    }

    render(<Node node={node} sessions={[invalidVncSession]} origin="http://localhost:4444" />)

    const user = userEvent.setup()
    await user.click(screen.getByTestId('VideocamIcon'))

    const liveView = screen.getByTestId('mock-live-view')
    const url = liveView.getAttribute('data-url')

    expect(url).toBe('')
  })
})
