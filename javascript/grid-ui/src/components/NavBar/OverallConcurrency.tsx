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

import React, { ReactNode } from 'react'
import {
  Box,
  CircularProgress,
  CircularProgressProps,
  createStyles,
  Theme,
  Typography,
  withStyles
} from '@material-ui/core'
import { StyleRules } from '@material-ui/core/styles'

const useStyles = (theme: Theme): StyleRules => createStyles(
  {
    concurrencyBackground: {
      backgroundColor: theme.palette.secondary.main
    }
  })

function CircularProgressWithLabel (props: CircularProgressProps & { value: number }): JSX.Element {
  return (
    <Box position='relative' display='inline-flex'>
      <CircularProgress variant='determinate' size={80} {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position='absolute'
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        <Typography variant='h4' component='div' color='textSecondary'>
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  )
}

interface OverallConcurrencyProps {
  sessionCount: number
  maxSession: number
  classes: any
}

class OverallConcurrency extends React.Component<OverallConcurrencyProps, {}> {
  render (): ReactNode {
    const { maxSession, sessionCount, classes } = this.props
    const currentLoad = Math.min(
      ((sessionCount / (maxSession === 0 ? 1 : maxSession)) * 100), 100)

    return (
      <Box
        p={2}
        m={2}
        className={classes.concurrencyBackground}
        data-testid='overall-concurrency'
      >
        <Typography
          align='center'
          gutterBottom
          variant='h4'
        >
          Concurrency
        </Typography>
        <Box
          display='flex'
          justifyContent='center'
          mt={2}
          mb={2}
          data-testid='concurrency-usage'
        >
          <CircularProgressWithLabel value={currentLoad} />
        </Box>
        <Typography
          align='center'
          variant='h4'
        >
          <Box display='inline' data-testid='session-count'>
            {sessionCount}
          </Box>
          {' / '}
          <Box display='inline' data-testid='max-session'>
            {maxSession}
          </Box>
        </Typography>
      </Box>
    )
  }
}

export default (withStyles(useStyles))(OverallConcurrency)
