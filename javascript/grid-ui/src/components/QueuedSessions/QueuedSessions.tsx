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
import {
  Box, Button,
  Dialog, DialogActions, DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material'
import EnhancedTableToolbar from '../EnhancedTableToolbar'
import OsLogo from '../common/OsLogo'
import { Size } from '../../models/size'
import BrowserLogo from '../common/BrowserLogo'
import browserVersion from '../../util/browser-version'
import Grid from '@mui/material/Grid';
import { experimentalStyled as styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import InfoIcon from '@mui/icons-material/Info'
import { useState } from 'react'
import Typography from '@mui/material/Typography'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function QueuedSessions (props) {
  const [itemOpen, setItemOpen] = useState('')
  const { sessionQueueRequests } = props
  const queue = sessionQueueRequests.map((sessionQueueRequest) => {
    return JSON.parse(sessionQueueRequest)
  });

  const displayRequestInfo = (id: string): JSX.Element => {
    const handleInfoIconClick = (): void => {
      setItemOpen(id)
    }
    return (
      <IconButton
        sx={{ padding: '1px' }}
        onClick={handleInfoIconClick}
        size='large'
      >
        <InfoIcon />
      </IconButton>
    )
  }

  return (
    <Box
      paddingTop='30px'
      width='100%'
      bgcolor='background.paper'
      marginTop='30px'
      marginBottom='20px'
      sx={{flexGrow: 1}}
    >
      {queue.length > 0 && (
        <Box minWidth='750px'>
          <EnhancedTableToolbar title={`Queue (${queue.length})`} />
          <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            {queue.map((queueItem, index) => (
              <Grid item xs={2} sm={4} md={4} key={index}>
                <Item>
                  {displayRequestInfo(index as string)}
                  {(queueItem.platformName ?? '' as string).length > 0 &&
                   <OsLogo
                     osName={queueItem.platformName as string}
                     size={Size.S}
                   />
                  }
                  {(queueItem.browserName ?? '' as string).length > 0 &&
                   <BrowserLogo
                     browserName={queueItem.browserName as string}
                   />
                  }
                  {browserVersion(queueItem.browserVersion as string)}
                  <Dialog
                    onClose={() => setItemOpen('')}
                    aria-labelledby='session-info-dialog'
                    open={itemOpen === index}
                    fullWidth
                    maxWidth='md'
                  >
                    <DialogTitle id='session-info-dialog'>
                      <Typography
                        gutterBottom component='span'
                        sx={{ paddingX: '10px' }}
                      >
                        <Box
                          fontWeight='fontWeightBold'
                          mr={1}
                          display='inline'
                        >
                          Session Request
                        </Box>
                      </Typography>
                      {(queueItem.platformName ?? '' as string).length > 0 &&
                       <OsLogo
                         osName={queueItem.platformName as string}
                         size={Size.S}
                       />
                      }
                      {(queueItem.browserName ?? '' as string).length > 0 &&
                       <BrowserLogo
                         browserName={queueItem.browserName as string}
                       />
                      }
                      {browserVersion(queueItem.browserVersion as string)}
                    </DialogTitle>
                    <DialogContent dividers>
                      <Typography gutterBottom>
                        Capabilities:
                      </Typography>
                      <Typography gutterBottom component='span'>
                                  <pre>
                                    {JSON.stringify(queueItem,null, 2)}
                                  </pre>
                      </Typography>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={() => setItemOpen('')}
                        color='primary'
                        variant='contained'
                      >
                        Close
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Item>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  )
}

export default QueuedSessions
