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
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { MockedProvider } from '@apollo/client/testing'
import Overview from '../../screens/Overview/Overview'
import { NODES_QUERY } from '../../graphql/nodes'
import { GRID_SESSIONS_QUERY } from '../../graphql/sessions'

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

const mockNodesData = {
  nodesInfo: {
    nodes: [
      {
        id: 'node1',
        uri: 'http://192.168.1.10:4444',
        status: 'UP',
        maxSession: 5,
        slotCount: 5,
        version: '4.0.0',
        osInfo: {
          name: 'Linux',
          version: '5.4.0',
          arch: 'x86_64'
        },
        sessionCount: 1,
        stereotypes: JSON.stringify([
          {
            stereotype: {
              browserName: 'chrome',
              browserVersion: '88.0',
              platformName: 'linux'
            },
            slots: 5
          }
        ])
      },
      {
        id: 'node2',
        uri: 'http://192.168.1.11:4444',
        status: 'UP',
        maxSession: 5,
        slotCount: 5,
        version: '4.0.0',
        osInfo: {
          name: 'Windows',
          version: '10',
          arch: 'x86_64'
        },
        sessionCount: 2,
        stereotypes: JSON.stringify([
          {
            stereotype: {
              browserName: 'firefox',
              browserVersion: '78.0',
              platformName: 'windows'
            },
            slots: 5
          }
        ])
      }
    ]
  }
}

const mockSessionsData = {
  sessionsInfo: {
    sessions: [
      {
        id: 'session1',
        nodeId: 'node1',
        capabilities: JSON.stringify({
          browserName: 'chrome',
          browserVersion: '88.0',
          platformName: 'linux',
          'se:vnc': 'ws://192.168.1.10:5900/websockify'
        }),
        startTime: '2023-01-01T00:00:00Z',
        uri: 'http://192.168.1.10:4444/session/session1',
        nodeUri: 'http://192.168.1.10:4444',
        sessionDurationMillis: 60000,
        slot: {
          id: 'slot1',
          stereotype: '{"browserName":"chrome"}',
          lastStarted: '2023-01-01T00:00:00Z'
        }
      },
      {
        id: 'session2',
        nodeId: 'node2',
        capabilities: JSON.stringify({
          browserName: 'firefox',
          browserVersion: '78.0',
          platformName: 'windows'
        }),
        startTime: '2023-01-01T00:00:00Z',
        uri: 'http://192.168.1.11:4444/session/session2',
        nodeUri: 'http://192.168.1.11:4444',
        sessionDurationMillis: 60000,
        slot: {
          id: 'slot2',
          stereotype: '{"browserName":"firefox"}',
          lastStarted: '2023-01-01T00:00:00Z'
        }
      }
    ],
    sessionQueueRequests: []
  }
}

const mocks = [
  {
    request: {
      query: NODES_QUERY
    },
    result: {
      data: mockNodesData
    }
  },
  {
    request: {
      query: GRID_SESSIONS_QUERY
    },
    result: {
      data: mockSessionsData
    }
  },
  {
    request: {
      query: GRID_SESSIONS_QUERY
    },
    result: {
      data: mockSessionsData
    }
  },
  {
    request: {
      query: GRID_SESSIONS_QUERY
    },
    result: {
      data: mockSessionsData
    }
  }
]

describe('Overview component', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:4444'
      },
      writable: true
    })
  })

  it('renders loading state initially', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Overview />
      </MockedProvider>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders nodes when data is loaded', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Overview />
      </MockedProvider>
    )

    await screen.findByText('http://192.168.1.10:4444')

    expect(screen.getByText('http://192.168.1.10:4444')).toBeInTheDocument()
    expect(screen.getByText('http://192.168.1.11:4444')).toBeInTheDocument()
  })

  it('renders sort controls', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Overview />
      </MockedProvider>
    )

    await screen.findByText('http://192.168.1.10:4444')

    expect(screen.getAllByText('Sort By').length).toBeGreaterThan(0)
    expect(screen.getByText('Descending')).toBeInTheDocument()
  })

  it('changes sort option when selected', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Overview />
      </MockedProvider>
    )

    await screen.findByText('http://192.168.1.10:4444')

    const user = userEvent.setup()
    const selectElement = screen.getByRole('combobox')
    await user.click(selectElement)

    await user.click(screen.getByText('Browser Name'))

    expect(selectElement).toHaveTextContent('Browser Name')
  })

  it('toggles sort order when descending checkbox is clicked', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Overview />
      </MockedProvider>
    )

    await screen.findByText('http://192.168.1.10:4444')

    const user = userEvent.setup()
    const descendingLabel = screen.getByText('Descending')
    const checkbox = descendingLabel.closest('label')?.querySelector('input[type="checkbox"]')

    expect(checkbox).not.toBeNull()
    if (checkbox) {
      await user.click(checkbox)
      expect(checkbox).toBeChecked()
    }
  })

  it('sorts nodes by URI when selected', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Overview />
      </MockedProvider>
    )

    await screen.findByText('http://192.168.1.10:4444')

    const user = userEvent.setup()
    const selectElement = screen.getByRole('combobox')
    await user.click(selectElement)
    await user.click(screen.getByText('URI'))

    // After sorting by URI, node1 should appear before node2
    const nodeUris = screen.getAllByText(/http:\/\/192\.168\.1\.\d+:4444/)
    expect(nodeUris[0]).toHaveTextContent('http://192.168.1.10:4444')
    expect(nodeUris[1]).toHaveTextContent('http://192.168.1.11:4444')
  })

  it('sorts nodes by URI in descending order when selected', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Overview />
      </MockedProvider>
    )

    await screen.findByText('http://192.168.1.10:4444')

    const user = userEvent.setup()
    const selectElement = screen.getByRole('combobox')
    await user.click(selectElement)
    await user.click(screen.getByText('URI'))

    const descendingLabel = screen.getByText('Descending')
    const checkbox = descendingLabel.closest('label')?.querySelector('input[type="checkbox"]')
    expect(checkbox).not.toBeNull()
    if (checkbox) {
      await user.click(checkbox)
      expect(checkbox).toBeChecked()
    }

    // After sorting by URI descending, node2 should appear before node1
    const nodeUris = screen.getAllByText(/http:\/\/192\.168\.1\.\d+:4444/)
    expect(nodeUris[0]).toHaveTextContent('http://192.168.1.11:4444')
    expect(nodeUris[1]).toHaveTextContent('http://192.168.1.10:4444')
  })

  it('renders live view icon for node with VNC session', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Overview />
      </MockedProvider>
    )

    await screen.findByText('http://192.168.1.10:4444')

    expect(screen.getByTestId('VideocamIcon')).toBeInTheDocument()
  })

  it('does not render live view icon for node without VNC session', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Overview />
      </MockedProvider>
    )

    await screen.findByText('http://192.168.1.11:4444')

    const videocamIcons = screen.getAllByTestId('VideocamIcon')

    expect(videocamIcons.length).toBe(1)

    const node2Element = screen.getByText('http://192.168.1.11:4444')
    const node2Card = node2Element.closest('.MuiCard-root')

    if (node2Card) {
      expect(within(node2Card as HTMLElement).queryByTestId('VideocamIcon')).not.toBeInTheDocument()
    }
  })

  it('opens live view dialog when camera icon is clicked', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Overview />
      </MockedProvider>
    )

    await screen.findByText('http://192.168.1.10:4444')

    const user = userEvent.setup()
    await user.click(screen.getByTestId('VideocamIcon'))

    expect(screen.getByText('Node Session Live View')).toBeInTheDocument()
    expect(screen.getByTestId('mock-live-view')).toBeInTheDocument()
  })

  it('closes live view dialog when close button is clicked', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Overview />
      </MockedProvider>
    )

    await screen.findByText('http://192.168.1.10:4444')

    const user = userEvent.setup()
    await user.click(screen.getByTestId('VideocamIcon'))

    expect(screen.getByText('Node Session Live View')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(screen.queryByText('Node Session Live View')).not.toBeInTheDocument()
  })

  it('handles error state', async () => {
    const errorMocks = [
      {
        request: {
          query: NODES_QUERY
        },
        error: new Error('Network error')
      },
      {
        request: {
          query: GRID_SESSIONS_QUERY
        },
        result: {
          data: mockSessionsData
        }
      },
      {
        request: {
          query: GRID_SESSIONS_QUERY
        },
        result: {
          data: mockSessionsData
        }
      }
    ]

    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <Overview />
      </MockedProvider>
    )

    await new Promise(resolve => setTimeout(resolve, 0))

    const errorElement = screen.getByRole('heading', { level: 3 })
    expect(errorElement).toBeInTheDocument()
  })

  it('handles empty nodes state', async () => {
    const emptyMocks = [
      {
        request: {
          query: NODES_QUERY
        },
        result: {
          data: { nodesInfo: { nodes: [] } }
        }
      },
      {
        request: {
          query: GRID_SESSIONS_QUERY
        },
        result: {
          data: mockSessionsData
        }
      },
      {
        request: {
          query: GRID_SESSIONS_QUERY
        },
        result: {
          data: mockSessionsData
        }
      }
    ]

    render(
      <MockedProvider mocks={emptyMocks} addTypename={false}>
        <Overview />
      </MockedProvider>
    )

    await screen.findByText('The Grid has no registered Nodes yet.')

    expect(screen.getByText('The Grid has no registered Nodes yet.')).toBeInTheDocument()
  })
})
