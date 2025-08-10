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
import ColumnSelector from '../../components/RunningSessions/ColumnSelector'
import { act, screen, within } from '@testing-library/react'
import { render } from '../utils/render-utils'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: jest.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

const mockSessions = [
  {
    id: 'session1',
    capabilities: JSON.stringify({
      browserName: 'chrome',
      browserVersion: '88.0',
      platformName: 'windows',
      acceptInsecureCerts: true
    })
  },
  {
    id: 'session2',
    capabilities: JSON.stringify({
      browserName: 'firefox',
      browserVersion: '78.0',
      platformName: 'linux',
      acceptSslCerts: false
    })
  }
]

beforeEach(() => {
  localStorageMock.clear()
  jest.clearAllMocks()
})

it('renders column selector button', () => {
  const onColumnSelectionChange = jest.fn()
  render(
    <ColumnSelector
      sessions={mockSessions}
      selectedColumns={[]}
      onColumnSelectionChange={onColumnSelectionChange}
    />
  )

  const button = screen.getByRole('button', { name: /select columns/i })
  expect(button).toBeInTheDocument()

  expect(screen.getByTestId('ViewColumnIcon')).toBeInTheDocument()
})

it('opens dialog when button is clicked', async () => {
  const onColumnSelectionChange = jest.fn()
  render(
    <ColumnSelector
      sessions={mockSessions}
      selectedColumns={[]}
      onColumnSelectionChange={onColumnSelectionChange}
    />
  )

  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /select columns/i }))

  expect(screen.getByText('Select Columns to Display')).toBeInTheDocument()
  expect(screen.getByText('Select capability fields to display as additional columns:')).toBeInTheDocument()
})

it('displays available columns from session capabilities', async () => {
  const onColumnSelectionChange = jest.fn()
  render(
    <ColumnSelector
      sessions={mockSessions}
      selectedColumns={[]}
      onColumnSelectionChange={onColumnSelectionChange}
    />
  )

  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /select columns/i }))

  expect(screen.getByLabelText('browserName')).toBeInTheDocument()
  expect(screen.getByLabelText('browserVersion')).toBeInTheDocument()
  expect(screen.getByLabelText('platformName')).toBeInTheDocument()
  expect(screen.getByLabelText('acceptInsecureCerts')).toBeInTheDocument()
  expect(screen.getByLabelText('acceptSslCerts')).toBeInTheDocument()
})

it('shows selected columns as checked', async () => {
  const onColumnSelectionChange = jest.fn()
  const selectedColumns = ['browserName', 'platformName']

  render(
    <ColumnSelector
      sessions={mockSessions}
      selectedColumns={selectedColumns}
      onColumnSelectionChange={onColumnSelectionChange}
    />
  )

  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /select columns/i }))

  expect(screen.getByLabelText('browserName')).toBeChecked()
  expect(screen.getByLabelText('platformName')).toBeChecked()

  expect(screen.getByLabelText('browserVersion')).not.toBeChecked()
  expect(screen.getByLabelText('acceptInsecureCerts')).not.toBeChecked()
})

it('toggles column selection when checkbox is clicked', async () => {
  const onColumnSelectionChange = jest.fn()
  const selectedColumns = ['browserName']

  render(
    <ColumnSelector
      sessions={mockSessions}
      selectedColumns={selectedColumns}
      onColumnSelectionChange={onColumnSelectionChange}
    />
  )

  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /select columns/i }))

  await user.click(screen.getByLabelText('platformName'))
  await user.click(screen.getByLabelText('browserName'))

  await user.click(screen.getByRole('button', { name: /apply/i }))

  expect(onColumnSelectionChange).toHaveBeenCalledWith(['platformName'])
})

it('selects all columns when "Select All" is clicked', async () => {
  const onColumnSelectionChange = jest.fn()

  render(
    <ColumnSelector
      sessions={mockSessions}
      selectedColumns={[]}
      onColumnSelectionChange={onColumnSelectionChange}
    />
  )

  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /select columns/i }))

  await user.click(screen.getByLabelText(/select all/i))

  await user.click(screen.getByRole('button', { name: /apply/i }))

  expect(onColumnSelectionChange).toHaveBeenCalled()
  const allColumns = ['browserName', 'browserVersion', 'platformName', 'acceptInsecureCerts', 'acceptSslCerts']
  expect(onColumnSelectionChange.mock.calls[0][0].sort()).toEqual(allColumns.sort())
})

it('unselects all columns when "Select All" is unchecked', async () => {
  const onColumnSelectionChange = jest.fn()
  const allColumns = ['browserName', 'browserVersion', 'platformName', 'acceptInsecureCerts', 'acceptSslCerts']

  render(
    <ColumnSelector
      sessions={mockSessions}
      selectedColumns={allColumns}
      onColumnSelectionChange={onColumnSelectionChange}
    />
  )

  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /select columns/i }))

  await user.click(screen.getByLabelText(/select all/i))

  await user.click(screen.getByRole('button', { name: /apply/i }))

  expect(onColumnSelectionChange).toHaveBeenCalledWith([])
})

it('closes dialog without changes when Cancel is clicked', async () => {
  const onColumnSelectionChange = jest.fn()
  const selectedColumns = ['browserName']

  render(
    <ColumnSelector
      sessions={mockSessions}
      selectedColumns={selectedColumns}
      onColumnSelectionChange={onColumnSelectionChange}
    />
  )

  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /select columns/i }))

  await user.click(screen.getByLabelText('platformName'))

  await user.click(screen.getByRole('button', { name: /cancel/i }))

  expect(onColumnSelectionChange).not.toHaveBeenCalled()
})

it('saves capability keys to localStorage', async () => {
  render(
    <ColumnSelector
      sessions={mockSessions}
      selectedColumns={[]}
      onColumnSelectionChange={jest.fn()}
    />
  )

  expect(localStorageMock.setItem).toHaveBeenCalledWith(
    'selenium-grid-all-capability-keys',
    expect.any(String)
  )

  const savedKeys = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
  expect(savedKeys).toContain('browserName')
  expect(savedKeys).toContain('browserVersion')
  expect(savedKeys).toContain('platformName')
  expect(savedKeys).toContain('acceptInsecureCerts')
  expect(savedKeys).toContain('acceptSslCerts')
})

it('loads capability keys from localStorage', async () => {
  const savedKeys = ['browserName', 'customCapability', 'platformName']
  localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedKeys))

  render(
    <ColumnSelector
      sessions={[]}
      selectedColumns={[]}
      onColumnSelectionChange={jest.fn()}
    />
  )

  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /select columns/i }))

  expect(screen.getByLabelText('browserName')).toBeInTheDocument()
  expect(screen.getByLabelText('customCapability')).toBeInTheDocument()
  expect(screen.getByLabelText('platformName')).toBeInTheDocument()
})
