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
  Box,
  Button,
  Card,
  CardContent, createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Theme,
  Typography,
  withStyles
} from '@material-ui/core';
import React from 'react';
import InfoIcon from '@material-ui/icons/Info';
import NodeInfo from "../../models/node-info";
import LinearProgress, {LinearProgressProps} from '@material-ui/core/LinearProgress';
import osLogo from "../../util/os-logo";
import Stereotypes from "./Stereotypes";
import clsx from 'clsx';

const useStyles = (theme: Theme) => createStyles(
  {
    root: {
      height: '100%',
      flexGrow: 1,
    },
    paddingContent: {
      paddingRight: 10,
      paddingLeft: 10,
    },
    osLogo: {
      width: 32,
      height: 32,
      marginRight: 5,
    },
    buttonMargin: {
      padding: 1,
    },
    up: {

    },
    down: {
      backgroundColor: theme.palette.grey.A100,
    }
  });

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

type NodeProps = {
  node: NodeInfo
  classes: any;
};

type NodeState = {
  open: boolean
}

class Node extends React.Component<NodeProps, NodeState> {
  state: NodeState = {
    open: false,
  }

  handleDialogOpen = () => {
    this.setState({open: true});
  }

  handleDialogClose = () => {
    this.setState({open: false});
  }

  render () {
    const {node, classes} = this.props;
    const nodeInfo = node;
    const sessionCount = nodeInfo.sessionCount ?? 0;
    const currentLoad = sessionCount === 0
                        ? 0 :
                        Math.min(((sessionCount / nodeInfo.maxSession) * 100), 100).toFixed(2);

    const nodeStatusClass = node.status === 'UP' ? classes.up : classes.down;

    return (
      <Card
        className={clsx(classes.root, nodeStatusClass)}
      >
        <CardContent className={classes.paddingContent}>
          <Grid
            container
            justify="space-between"
            spacing={1}
          >
            <Grid item xs={10}>
              <Typography
                color="textPrimary"
                gutterBottom
                variant="h6"
              >
                <Box fontWeight="fontWeightBold" mr={1} display='inline'>
                  URI:
                </Box>
                {nodeInfo.uri}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography
                color="textPrimary"
                gutterBottom
                variant="h6"
              >
                <img
                  src={osLogo(nodeInfo.osInfo.name)}
                  className={classes.osLogo}
                  alt="OS Logo"
                />
                <IconButton
                  className={classes.buttonMargin}
                  onClick={this.handleDialogOpen}
                  data-testid={`node-info-${nodeInfo.id}`}>
                  <InfoIcon/>
                </IconButton>
                <Dialog onClose={this.handleDialogClose} aria-labelledby="node-info-dialog" open={this.state.open}>
                  <DialogTitle id="node-info-dialog">
                    <img
                      src={osLogo(nodeInfo.osInfo.name)}
                      className={classes.osLogo}
                      alt="OS Logo"
                    />
                    <Box fontWeight="fontWeightBold" mr={1} display='inline'>
                      URI:
                    </Box>
                    {nodeInfo.uri}
                  </DialogTitle>
                  <DialogContent dividers>
                    <Typography gutterBottom>
                      Node Id: {nodeInfo.id}
                    </Typography>
                    <Typography gutterBottom>
                      OS Arch: {nodeInfo.osInfo.arch}
                    </Typography>
                    <Typography gutterBottom>
                      OS Name: {nodeInfo.osInfo.name}
                    </Typography>
                    <Typography gutterBottom>
                      OS Version: {nodeInfo.osInfo.version}
                    </Typography>
                    <Typography gutterBottom>
                      Total slots: {nodeInfo.slotCount}
                    </Typography>
                    <Typography gutterBottom>
                      Grid version: {nodeInfo.version}
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.handleDialogClose} color="primary" variant="contained">
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Stereotypes stereotypes={nodeInfo.slotStereotypes}/>
            </Grid>
            <Grid item xs={12}>
              <Grid
                container
                justify="space-between"
                spacing={2}
              >
                <Grid item xs={3}
                >
                  <Box pt={1} mt={2}>
                    <Typography
                      variant="body2"
                      gutterBottom
                    >
                      Sessions: {sessionCount}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={9}>
                  <Box pt={1} mt={2}>
                    <Typography
                      variant="body2"
                      gutterBottom
                    >
                      Max. Concurrency: {nodeInfo.maxSession}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}
                >
                  <LinearProgressWithLabel value={Number(currentLoad)}/>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(useStyles)(Node)
