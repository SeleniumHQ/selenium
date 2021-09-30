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
import { Box, Container, createStyles, Typography, Theme, withStyles } from '@material-ui/core'
import { StyleRules } from '@material-ui/core/styles'

const useStyles = (theme: Theme): StyleRules => createStyles(
  {
    root: {
      backgroundColor: theme.palette.secondary.main,
      height: '100%',
      paddingBottom: theme.spacing(3),
      paddingTop: theme.spacing(3),
      width: '100%',
      justifyContent: 'center'
    }
  })

interface ErrorProps {
  message: string
  errorMessage: string
  classes: any
}

class Error extends React.Component<ErrorProps, {}> {
  render (): ReactNode {
    const { message, errorMessage, classes } = this.props
    // noinspection HtmlUnknownAnchorTarget
    return (
      <div className={classes.root}>
        <Box
          display='flex'
          flexDirection='column'
          height='100%'
          justifyContent='center'
        >
          <Container maxWidth='md'>
            <Box mb={3}>
              <Typography
                align='center'
                color='textPrimary'
                variant='h3'
              >
                {message}
              </Typography>
            </Box>
            <Typography
              align='center'
              color='textPrimary'
              variant='h4'
              component='span'
            >
              <pre>
                {errorMessage}
              </pre>
            </Typography>
          </Container>
        </Box>
      </div>
    )
  }
}

export default withStyles(useStyles)(Error)
