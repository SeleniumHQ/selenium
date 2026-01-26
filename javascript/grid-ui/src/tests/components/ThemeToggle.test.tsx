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

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '../../components/ThemeToggle/ThemeToggle'
import { CustomThemeProvider } from '../../contexts/ThemeContext'

const mockMatchMedia = (matches: boolean) => ({
  matches,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
})

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => mockMatchMedia(false))
  })
})

it('cycles through theme modes on click', () => {
  render(
    <CustomThemeProvider>
      <ThemeToggle />
    </CustomThemeProvider>
  )
  
  const button = screen.getByRole('button')
  
  // Should start with system mode (AutoMode icon)
  expect(button).toHaveAttribute('aria-label', 'Toggle theme')
  expect(screen.getByTestId('AutoModeIcon')).toBeInTheDocument()
  
  // Click to light mode
  fireEvent.click(button)
  expect(screen.getByTestId('LightModeIcon')).toBeInTheDocument()
  expect(screen.queryByTestId('AutoModeIcon')).not.toBeInTheDocument()
  
  // Click to dark mode
  fireEvent.click(button)
  expect(screen.getByTestId('DarkModeIcon')).toBeInTheDocument()
  expect(screen.queryByTestId('LightModeIcon')).not.toBeInTheDocument()
  
  // Click back to system mode
  fireEvent.click(button)
  expect(screen.getByTestId('AutoModeIcon')).toBeInTheDocument()
  expect(screen.queryByTestId('DarkModeIcon')).not.toBeInTheDocument()
})

it('responds to system preference changes', () => {
  const listeners: Array<(e: any) => void> = []
  const mockMediaQuery = {
    matches: false,
    addEventListener: jest.fn((_, handler) => listeners.push(handler)),
    removeEventListener: jest.fn()
  }
  
  window.matchMedia = jest.fn(() => mockMediaQuery)
  
  render(
    <CustomThemeProvider>
      <ThemeToggle />
    </CustomThemeProvider>
  )
  
  // Simulate system preference change
  listeners.forEach(listener => listener({ matches: true }))
  
  expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
})