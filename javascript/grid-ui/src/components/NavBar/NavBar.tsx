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

import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DashboardIcon from "@material-ui/icons/Dashboard";
import AssessmentIcon from '@material-ui/icons/Assessment';
import HelpIcon from '@material-ui/icons/Help';
import clsx from 'clsx';
import React from 'react';
import {
  Box,
  CircularProgress,
  CircularProgressProps,
  createStyles,
  Theme,
  Typography,
  withStyles
} from "@material-ui/core";
import {withRouter} from "react-router"

const drawerWidth = 240;

const useStyles = (theme: Theme) => createStyles(
  {
    root: {
      display: 'flex',
    },
    toolbarIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 8px',
      ...theme.mixins.toolbar,
      backgroundColor: theme.palette.primary.main,
    },
    drawerPaper: {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      minHeight: '100vh',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerPaperClose: {
      overflowX: 'hidden',
      minHeight: '100vh',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    },
    concurrencyBackground: {
      backgroundColor: theme.palette.secondary.main,
    },
  });

function ListItemLink(props) {
  return <ListItem button component="a" {...props} />;
}

function CircularProgressWithLabel(props: CircularProgressProps & { value: number }) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" size={80} {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h4" component="div" color="textSecondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

type NavBarProps = {
  open: boolean;
  maxSession: number;
  sessionCount: number;
  nodeCount: number;
  classes: any;
  match: any;
  location: any;
  history: any;
};

class NavBar extends React.Component<NavBarProps, {}> {

  render () {
    const {open, maxSession, sessionCount, nodeCount, classes, location} = this.props;
    const currentLoad = Math.min(((sessionCount / (maxSession === 0 ? 1 : maxSession)) * 100), 100);

    // Not showing the overall status when the user is on the Overview page and there is only one node, because polling
    // is not happening at the same time and it could be confusing for the user. So, displaying it when there is more
    // than one node, or when the user is on a different page and there is at least one node registered.
    const showOverallConcurrency = nodeCount > 1 || (location.pathname !== "/" && nodeCount > 0);

    return (
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton color={"secondary"}>
            <ChevronLeftIcon/>
          </IconButton>
        </div>
        <Divider/>
        <List>
          <div>
            <ListItemLink href={"#"}>
              <ListItemIcon>
                <DashboardIcon/>
              </ListItemIcon>
              <ListItemText primary="Overview"/>
            </ListItemLink>
            <ListItemLink href={"#sessions"}>
              <ListItemIcon>
                <AssessmentIcon/>
              </ListItemIcon>
              <ListItemText primary="Sessions"/>
            </ListItemLink>
            <ListItemLink href={"#help"}>
              <ListItemIcon>
                <HelpIcon/>
              </ListItemIcon>
              <ListItemText primary="Help"/>
            </ListItemLink>
          </div>
        </List>
        <Box flexGrow={1}/>
        {showOverallConcurrency && open && (
          <Box
            p={2}
            m={2}
            className={classes.concurrencyBackground}
            data-testid={"overall-concurrency"}
          >
            <Typography
              align="center"
              gutterBottom
              variant="h4"
            >
              Concurrency
            </Typography>
            <Box
              display="flex"
              justifyContent="center"
              mt={2}
              mb={2}
            data-testid={"concurrency-usage"}
            >
              <CircularProgressWithLabel value={currentLoad}/>
            </Box>
            <Typography
              align="center"
              variant="h4"
            >
            <Box display='inline' data-testid={"session-count"}>
              {sessionCount}
            </Box>
            {' / '}
            <Box display='inline' data-testid={"max-session"}>
              {maxSession}
            </Box>
            </Typography>
          </Box>
        )}
      </Drawer>
    );
  }
}

export default (withStyles(useStyles))(withRouter(NavBar))
