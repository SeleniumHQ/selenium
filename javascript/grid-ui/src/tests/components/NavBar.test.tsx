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
import { render, screen } from '@testing-library/react'
import NavBar from '../../components/NavBar/NavBar'
import { MemoryRouter } from 'react-router-dom'

it('renders menu options names', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <NavBar
        open
        maxSession={10}
        sessionCount={0}
        nodeCount={1}
        sessionQueueSize={0}
      />
    </MemoryRouter>
  )
  expect(screen.getByText('Sessions')).toBeInTheDocument()
  expect(screen.getByText('Overview')).toBeInTheDocument()
  expect(screen.getByText('Help')).toBeInTheDocument()
})

it('overall concurrency is not rendered on root path with a single node',
  () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NavBar
          open
          maxSession={0}
          sessionCount={0}
          nodeCount={1}
          sessionQueueSize={0}
        />
      </MemoryRouter>
    )
    expect(screen.queryByTestId('overall-concurrency')).not.toBeInTheDocument()
  })

it('overall concurrency is rendered on root path with more than one node',
  () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NavBar
          open
          maxSession={0}
          sessionCount={0}
          nodeCount={2}
          sessionQueueSize={0}
        />
      </MemoryRouter>
    )
    expect(screen.getByTestId('overall-concurrency')).toBeInTheDocument()
  })

it('overall concurrency is rendered on root path with more than one node',
  () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NavBar
          open
          maxSession={0}
          sessionCount={0}
          nodeCount={2}
          sessionQueueSize={0}
        />
      </MemoryRouter>
    )
    expect(screen.getByTestId('overall-concurrency')).toBeInTheDocument()
  })

it('overall concurrency is rendered on a path different than and one node',
  () => {
    render(
      <MemoryRouter initialEntries={['/sessions']}>
        <NavBar
          open
          maxSession={0}
          sessionCount={0}
          nodeCount={1}
          sessionQueueSize={0}
        />
      </MemoryRouter>
    )
    expect(screen.getByTestId('overall-concurrency')).toBeInTheDocument()
  })
