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
import { StyleRules, Theme, withStyles } from '@material-ui/core/styles'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

const useStyles = (theme: Theme): StyleRules => (
  {
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1)
    },
    title: {
      flex: '1 1 100%'
    }
  })

interface EnhancedTableToolbarProps {
  title: string
  classes: any
}

class EnhancedTableToolbar extends React.Component<EnhancedTableToolbarProps, {}> {
  render (): ReactNode {
    const { title, classes } = this.props
    return (
      <Toolbar className={classes.root}>
        <Typography className={classes.title} variant='h3' id='tableTitle' component='div'>
          {title}
        </Typography>
      </Toolbar>
    )
  }
}

export default withStyles(useStyles)(EnhancedTableToolbar)
