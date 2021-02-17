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

import * as React from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import {Box, Typography} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.secondary.main,
      height: '100%',
      paddingTop: theme.spacing(1),
      width: '100%',
      justifyContent: "center",
    },
  }),
);

export default function Loading() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Box mb={2}>
        <Typography
          align="center"
          color="textPrimary"
          variant="h3"
        >
          Loading...
        </Typography>
      </Box>
      <LinearProgress/>
    </div>
  );
}
