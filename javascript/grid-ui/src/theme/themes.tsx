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

import { createTheme, Theme } from '@mui/material/styles'
import typography from './typography'

export const lightTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#615E9B'
    },
    secondary: {
      main: '#F7F8F8'
    },
    error: {
      main: '#FF1744'
    },
    warning: {
      main: '#FF9800'
    },
    background: {
      default: '#F7F8F8'
    }
  },
  typography
})

export const darkTheme: Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#615E9B'
    },
    secondary: {
      main: '#36393F'
    },
    error: {
      main: '#F04747'
    },
    warning: {
      main: '#FFA726'
    },
    background: {
      default: '#0c1117',
      paper: '#161B22'
    },
    text: {
      primary: '#F0F6FC',
      secondary: '#8B949E'
    }
  },
  typography,
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#020408',
          boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
        }
      }
    }
  }
})
