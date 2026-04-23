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
import { IconButton, Tooltip } from '@mui/material'
import { LightMode, DarkMode, AutoMode } from '@mui/icons-material'
import { useTheme } from '../../contexts/ThemeContext'

export const ThemeToggle: React.FC = () => {
  const { themeMode, setThemeMode } = useTheme()

  const handleClick = () => {
    const nextMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light'
    setThemeMode(nextMode)
  }

  const getIcon = () => {
    if (themeMode === 'light') return <LightMode />
    if (themeMode === 'dark') return <DarkMode />
    return <AutoMode />
  }

  const getTooltip = () => {
    if (themeMode === 'light') return 'Switch to dark mode'
    if (themeMode === 'dark') return 'Switch to system mode'
    return 'Switch to light mode'
  }

  return (
    <Tooltip title={getTooltip()}>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="Toggle theme"
      >
        {getIcon()}
      </IconButton>
    </Tooltip>
  )
}