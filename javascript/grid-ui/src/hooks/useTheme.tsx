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

import { useState, useEffect } from 'react'
import { lightTheme, darkTheme } from '../theme/themes'

type ThemeMode = 'light' | 'dark' | 'system'

export const useTheme = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system')
  const [systemPrefersDark, setSystemPrefersDark] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-mode') as ThemeMode
      if (saved) setThemeMode(saved)
      setSystemPrefersDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])



  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-mode', themeMode)
    }
  }, [themeMode])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [])

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemPrefersDark)
  const currentTheme = isDark ? darkTheme : lightTheme

  return {
    themeMode,
    setThemeMode,
    currentTheme,
    isDark
  }
}