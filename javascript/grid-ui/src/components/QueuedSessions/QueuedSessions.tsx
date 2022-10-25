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
import { Box, List, ListItem } from '@mui/material'
import EnhancedTableToolbar from '../EnhancedTableToolbar'

function QueuedSessions (props) {
  const { sessionQueueRequests } = props
  const queue = sessionQueueRequests.map((queuedSession) => {
    return JSON.stringify(JSON.parse(queuedSession) as object)
  })
  return (
    <Box
      paddingTop='30px'
      width='100%'
      bgcolor='background.paper'
      marginTop='30px'
      marginBottom='20px'
    >
      {queue.length > 0 && (
        <Box minWidth='750px'>
          <EnhancedTableToolbar title={`Queue (${queue.length})`} />
          <List>
            {queue.map((queueItem, index) => {
              return (
                <ListItem
                  key={index}
                  sx={{
                    borderBottomWidth: 1,
                    borderBottomStyle: 'solid',
                    borderBottomColor: '#e0e0e0'
                  }}
                >
                  <pre>
                    {queueItem}
                  </pre>
                </ListItem>
              )
            })}
          </List>
        </Box>
      )}
    </Box>
  )
}

export default QueuedSessions
