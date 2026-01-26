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
import TopBar from '../../components/TopBar/TopBar'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CustomThemeProvider } from '../../contexts/ThemeContext'

const user = userEvent.setup()

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }))
  })
})

it('renders basic information', () => {
  const subheaderText = 'Hello, world!'
  const handleClick = jest.fn()
  render(
    <CustomThemeProvider>
      <TopBar subheader={subheaderText} drawerOpen toggleDrawer={handleClick}/>
    </CustomThemeProvider>
  )
  expect(screen.getByText('Selenium Grid')).toBeInTheDocument()
  expect(screen.getByRole('img')).toHaveAttribute('alt', 'Selenium Grid Logo')
  expect(screen.getByText(subheaderText)).toBeInTheDocument()
})

it('can toggle drawer if error flag is not set and the drawer is open',
  async () => {
    const handleClick = jest.fn()
    render(
      <CustomThemeProvider>
        <TopBar subheader="4.0.0" drawerOpen toggleDrawer={handleClick}/>
      </CustomThemeProvider>
    )
    const drawerButton = screen.getByLabelText('close drawer')
    expect(drawerButton.getAttribute('aria-label')).toBe('close drawer')
    await user.click(drawerButton)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

it('can toggle drawer if error flag is not set and the drawer is closed',
  async () => {
    const handleClick = jest.fn()
    render(
      <CustomThemeProvider>
        <TopBar subheader="4.0.0" toggleDrawer={handleClick}/>
      </CustomThemeProvider>
    )
    const drawerButton = screen.getByLabelText('open drawer')
    expect(drawerButton.getAttribute('aria-label')).toBe('open drawer')
    await user.click(drawerButton)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

it('should not toggle drawer if error flag is set', async () => {
  const handleClick = jest.fn()
  render(
    <CustomThemeProvider>
      <TopBar subheader="4.0.0" error toggleDrawer={handleClick}/>
    </CustomThemeProvider>
  )
  expect(screen.queryByLabelText('close drawer')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('open drawer')).not.toBeInTheDocument()
  const link = screen.getByRole('link')
  expect(link.getAttribute('href')).toBe('#help')
  await user.click(link)
  expect(handleClick).toHaveBeenCalledTimes(0)
})
