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
import RunningSessions from '../../components/RunningSessions/RunningSessions'
import SessionInfo from '../../models/session-info'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createSessionData } from '../../models/session-data'

const origin = 'http://localhost:4444'

const sessionsInfo: SessionInfo[] = [
  {
    id: 'aee43d1c1d10e85d359029719c20b146',
    capabilities: '{ "browserName": "chrome", "browserVersion": "88.0.4324.182", "platformName": "windows" }',
    startTime: '18/02/2021 13:12:05',
    uri: 'http://192.168.1.7:4444',
    nodeId: '9fe799f4-4397-4fbb-9344-1d5a3074695e',
    nodeUri: 'http://192.168.1.7:5555',
    sessionDurationMillis: '123456',
    slot: {
      id: '3c1e1508-c548-48fb-8a99-4332f244d87b',
      stereotype: '{"browserName": "chrome"}',
      lastStarted: '18/02/2021 13:12:05'
    }
  }
]

const sessions = sessionsInfo.map((session) => {
  return createSessionData(
    session.id,
    session.capabilities,
    session.startTime,
    session.uri,
    session.nodeId,
    session.nodeUri,
    (session.sessionDurationMillis as unknown) as number,
    session.slot,
    origin
  )
})

it('renders basic session information', () => {
  render(<RunningSessions sessions={sessions} origin={origin} />)
  const session = sessions[0]
  expect(screen.getByText(session.id)).toBeInTheDocument()
  expect(screen.getByText(session.startTime)).toBeInTheDocument()
  expect(screen.getByText(session.nodeUri)).toBeInTheDocument()
})

it('renders detailed session information', async () => {
  render(<RunningSessions sessions={sessions} origin={origin}/>)
  const session = sessions[0]
  const sessionRow = screen.getByText(session.id).closest('tr')
  const user = userEvent.setup()
  await user.click(within(sessionRow as HTMLElement).getByRole('button'))
  const dialogPane = screen.getByText('Capabilities:').closest('div')
  expect(dialogPane).toHaveTextContent('Capabilities:' + session.capabilities)
})
