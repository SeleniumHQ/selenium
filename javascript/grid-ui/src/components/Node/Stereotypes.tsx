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

import {
  Badge,
  Box,
  createStyles,
  Grid,
  Tooltip,
  Typography,
  withStyles
} from '@material-ui/core'
import React, { ReactNode } from 'react'
import StereotypeInfo from '../../models/stereotype-info'
import BrowserLogo from '../common/BrowserLogo'
import { StyleRules } from '@material-ui/core/styles'
import OsLogo from '../common/OsLogo'
import { Size } from '../../models/size'

const useStyles = (): StyleRules => createStyles(
  {
    boxStyle: {
      marginBottom: 5,
      marginTop: 20,
      marginRight: 35
    },
    browserVersion: {
      marginBottom: 5,
      marginRight: 7
    }
  })

interface StereotypesProps {
  stereotypes: StereotypeInfo[]
  classes: any
}

class Stereotypes extends React.Component<StereotypesProps, {}> {
  render (): ReactNode {
    const { stereotypes, classes } = this.props

    function CreateStereotypeGridItem (slotStereotype: StereotypeInfo, index: any): JSX.Element {
      return (
        <Grid item key={index}>
          <Grid container alignItems='center' spacing={1}>
            <Tooltip
              title={JSON.stringify(slotStereotype.rawData.stereotype) ?? ''}
            >
              <Badge
                badgeContent={slotStereotype.slotCount} color='primary'
                className={classes.boxStyle}
              >
                <Grid item className={classes.browserVersion}>
                  <OsLogo osName={slotStereotype.platformName} size={Size.XS} />
                  <BrowserLogo browserName={slotStereotype.browserName} />
                  <Typography variant='caption'>
                    {slotStereotype.browserVersion}
                  </Typography>
                </Grid>
              </Badge>
            </Tooltip>
          </Grid>
        </Grid>
      )
    }

    return (
      <Grid item xs={12}>
        <Typography
          color='textPrimary'
          gutterBottom
          variant='h6'
        >
          <Box fontWeight='fontWeightBold' mr={1} display='inline'>
            Stereotypes
          </Box>
        </Typography>
        <Grid container direction='row'>
          {
            stereotypes
              .sort((a, b) => {
                const browserNameComparison = a.browserName.localeCompare(b.browserName)
                if (browserNameComparison !== 0) {
                  return browserNameComparison
                } else {
                  return a.browserVersion.localeCompare(b.browserVersion)
                }
              })
              .map((slotStereotype: any, idx) => {
                return (
                  CreateStereotypeGridItem(slotStereotype, idx)
                )
              })
          }
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(useStyles)(Stereotypes)
