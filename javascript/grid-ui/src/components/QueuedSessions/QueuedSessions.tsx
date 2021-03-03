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

import * as React from 'react'
import { createStyles, StyleRules, Theme } from '@material-ui/core/styles'
import { List, ListItem, withStyles } from '@material-ui/core'
import EnhancedTableToolbar from '../EnhancedTableToolbar'
import { ReactNode } from 'react'

const useStyles = (theme: Theme): StyleRules => createStyles(
  {
    root: {
      width: '100%',
      paddingTop: 30
    },
    queueList: {
      minWidth: 750,
      backgroundColor: theme.palette.background.paper,
      marginBottom: 20
    },
    queueListItem: {
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: '#e0e0e0'
    }
  })

interface QueuedSessionsProps {
  sessionQueueRequests: string[]
  classes: any
}

class QueuedSessions extends React.Component<QueuedSessionsProps, {}> {
  render (): ReactNode {
    const { sessionQueueRequests, classes } = this.props
    const queue = sessionQueueRequests.map((queuedSession) => {
      return JSON.stringify(JSON.parse(queuedSession) as object)
    })
    return (
      <div className={classes.root}>
        {queue.length > 0 && (
          <div className={classes.queueList}>
            <EnhancedTableToolbar title={`Queue (${queue.length})`} />
            <List>
              {queue.map((queueItem, index) => {
                return (
                  <ListItem className={classes.queueListItem} key={index}>
                    <pre>
                      {queueItem}
                    </pre>
                  </ListItem>
                )
              })}
            </List>
          </div>
        )}
      </div>
    )
  }
}

export default withStyles(useStyles)(QueuedSessions)
