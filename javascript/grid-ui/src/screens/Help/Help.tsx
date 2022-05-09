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
import { Box, Container, Link, Typography } from '@mui/material'
import { useLocation } from 'react-router-dom'

function HelpContainer (): JSX.Element {
  const location = useLocation()
  return (
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
            href='https://www.selenium.dev/documentation/grid/'
            target='_blank'
            rel='noreferrer'
            underline='hover'
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
            target='_blank'
            rel='noreferrer'
            underline='hover'
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
            target='_blank'
            rel='noreferrer'
            underline='hover'
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
            href='https://www.selenium.dev/documentation/about/copyright/'
            target='_blank'
            rel='noreferrer'
            underline='hover'
          >
            people
          </Link>
          , and our{' '}
          <Link
            href='https://www.selenium.dev/sponsors/'
            target='_blank'
            rel='noreferrer'
            underline='hover'
          >
            sponsors
          </Link>.
        </Typography>
      </Box>
    </Container>
  )
}

function Help (): JSX.Element {
  return (
    <Box
      display='flex'
      flexDirection='column'
      height='100%'
      justifyContent='center'
    >
      <HelpContainer />
    </Box>
  )
}

export default Help
