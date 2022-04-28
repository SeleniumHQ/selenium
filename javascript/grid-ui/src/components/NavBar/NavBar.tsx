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

import Divider from '@mui/material/Divider'
import MuiDrawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AssessmentIcon from '@mui/icons-material/Assessment'
import HelpIcon from '@mui/icons-material/Help'
import React from 'react'
import { Box, Typography } from '@mui/material'
import { useLocation } from 'react-router-dom'
import OverallConcurrency from './OverallConcurrency'
import { CSSObject, styled, Theme } from '@mui/material/styles'

const drawerWidth = 240

function ListItemLink (props): JSX.Element {
  return <ListItem button component='a' {...props} />
}

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: 'hidden'
})

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`
  }
})

const Drawer = styled(MuiDrawer,
  { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme)
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme)
    })
  })
)

function NavBarBottom (props): JSX.Element {
  const {
    sessionQueueSize,
    sessionCount,
    maxSession,
    nodeCount
  } = props
  const location = useLocation()
  // Not showing the overall status when the user is on the Overview
  // page and there is only one node, because polling is not happening
  // at the same time, and it could be confusing for the user. So,
  // displaying it when there is more than one node, or when the user is
  // on a different page and there is at least one node registered.
  const showOverallConcurrency =
    nodeCount > 1 || (location.pathname !== '/' && nodeCount > 0)

  return (
    <div>
      <Box p={3} m={1}>
        <Typography
          align='center'
          gutterBottom
          variant='h4'
        >
          Queue size: {sessionQueueSize}
        </Typography>
      </Box>
      {showOverallConcurrency && (
        <OverallConcurrency
          sessionCount={sessionCount}
          maxSession={maxSession}
        />
      )}
    </div>
  )
}

function NavBar (props) {
  const {
    open,
    maxSession,
    sessionCount,
    nodeCount,
    sessionQueueSize
  } = props

  return (
    <Drawer
      variant='permanent'
      open={open}
    >
      <Box
        display='flex'
        alignItems='center'
        justifyContent='flex-end'
        sx={{ bgcolor: 'primary.main' }}
        marginTop={2}
      >
        <IconButton color='secondary' size='large'>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        <div>
          <ListItemLink href='#'>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary='Overview' />
          </ListItemLink>
          <ListItemLink href='#/sessions'>
            <ListItemIcon>
              <AssessmentIcon />
            </ListItemIcon>
            <ListItemText primary='Sessions' />
          </ListItemLink>
          <ListItemLink href='#/help'>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary='Help' />
          </ListItemLink>
        </div>
      </List>
      <Box flexGrow={1} />
      {open && (
        <NavBarBottom
          sessionQueueSize={sessionQueueSize}
          sessionCount={sessionCount}
          maxSession={maxSession}
          nodeCount={nodeCount}
        />
      )}
    </Drawer>
  )
}

export default NavBar
