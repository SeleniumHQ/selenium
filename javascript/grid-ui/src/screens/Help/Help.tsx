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
import { Box, Container, Link, Typography } from '@material-ui/core'
import {
  createStyles,
  StyleRules,
  Theme,
  withStyles
} from '@material-ui/core/styles'
import { RouteComponentProps, withRouter } from 'react-router-dom'

const useStyles = (theme: Theme): StyleRules => createStyles(
  {
    root: {
      backgroundColor: theme.palette.secondary.main,
      height: '100%',
      paddingBottom: theme.spacing(3),
      paddingTop: theme.spacing(3),
      width: '100%',
      justifyContent: 'center'
    },
    image: {
      marginTop: 50,
      display: 'inline-block',
      maxWidth: '100%',
      width: 560
    }
  })

interface HelpProps extends RouteComponentProps {
  classes: any
}

class Help extends React.Component<HelpProps, {}> {
  // noinspection HtmlUnknownAnchorTarget
  render (): ReactNode {
    const { classes, location } = this.props

    return (
      <div className={classes.root}>
        <Box
          display='flex'
          flexDirection='column'
          height='100%'
          justifyContent='center'
        >
          <Container maxWidth='md'>
            {location.pathname !== '/help' && (
              <Box mt={2}>
                <Typography
                  align='center'
                  color='textPrimary'
                  variant='h2'
                >
                  Whoops! The URL specified routes to this help page.
                </Typography>
              </Box>
            )}
            <Box mt={6}>
              <Typography
                align='center'
                color='textPrimary'
                variant='h3'
              >
                More information about Selenium Grid can be found at the{' '}
                <Link
                  href="https://www.selenium.dev/documentation/grid/"
                  target="_blank" rel="noreferrer"
                >
                  documentation
                </Link>.
              </Typography>
            </Box>
            <Box mt={6}>
              <Typography
                align='center'
                color='textPrimary'
                variant='h3'
              >
                Please report bugs and issues to the Selenium{' '}
                <Link
                  href='https://github.com/SeleniumHQ/selenium/issues/new/choose'
                  target='_blank' rel='noreferrer'
                >
                  issue tracker
                </Link>.
              </Typography>
            </Box>
            <Box mt={6}>
              <Typography
                align='center'
                color='textPrimary'
                variant='h3'
              >
                For questions and help, check the different support channels on
                our{' '}
                <Link
                  href='https://www.selenium.dev/support/'
                  target='_blank' rel='noreferrer'
                >
                  website
                </Link>.
              </Typography>
            </Box>
            <Box m={10}>
              <Typography
                align='center'
                color='textPrimary'
                variant='h4'
              >
                Selenium is made possible through the efforts of our open source
                community, contributions from these{' '}
                <Link
                  href="https://www.selenium.dev/documentation/about/copyright_and_attributions/"
                  target="_blank" rel='noreferrer'
                >
                  people
                </Link>
                , and our{' '}
                <Link href='https://www.selenium.dev/sponsors/' target='_blank' rel='noreferrer'>
                  sponsors
                </Link>.
              </Typography>
            </Box>
          </Container>
        </Box>
      </div>
    )
  }
}

export default withStyles(useStyles)(withRouter(Help))
