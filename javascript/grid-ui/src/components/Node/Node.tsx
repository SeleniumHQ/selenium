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

import { Box, Card, CardContent, Grid, Typography } from '@mui/material'
import React from 'react'
import NodeDetailsDialog from './NodeDetailsDialog'
import NodeLoad from './NodeLoad'
import Stereotypes from './Stereotypes'
import OsLogo from '../common/OsLogo'

function Node (props) {
  const { node } = props
  const getCardStyle = (status: string) => ({
    height: '100%',
    flexGrow: 1,
    opacity: status === 'DOWN' ? 0.25 : 1,
    bgcolor: (status === 'DOWN' || status === 'DRAINING') ? 'grey.A100' : ''
  })

  return (
    <Card sx={getCardStyle(node.status)}>
      <CardContent sx={{ pl: 2, pr: 1 }}>
        <Grid
          container
          justifyContent="space-between"
          spacing={1}
        >
          <Grid item xs={10}>
            <Typography
              color="textPrimary"
              gutterBottom
              variant="h6"
            >
              <Box fontWeight="fontWeightBold" mr={1} display="inline">
                URI:
              </Box>
              {node.uri}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography
              color="textPrimary"
              gutterBottom
              variant="h6"
            >
              <OsLogo osName={node.osInfo.name}/>
              <NodeDetailsDialog node={node}/>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Stereotypes stereotypes={node.slotStereotypes}/>
          </Grid>
          <Grid item xs={12}>
            <NodeLoad node={node}/>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Node
