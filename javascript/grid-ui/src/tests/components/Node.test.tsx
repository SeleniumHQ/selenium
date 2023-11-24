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
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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
