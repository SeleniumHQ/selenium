import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import {makeStyles} from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DashboardIcon from "@material-ui/icons/Dashboard";
import AssessmentIcon from '@material-ui/icons/Assessment';
import HelpIcon from '@material-ui/icons/Help';
import clsx from 'clsx';
import * as React from 'react';
import {Box, CircularProgress, CircularProgressProps, Typography} from "@material-ui/core";
import {useLocation} from "react-router-dom";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
}));

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

export default function NavBar(props) {
  const classes = useStyles();
  const {open, setOpen, width, maxSession, sessionCount, nodeCount} = props;
  const currentLoad = Math.min(((sessionCount / (maxSession === 0 ? 1 : maxSession)) * 100), 100);

  const location = useLocation();
  // Not showing the overall status when the user is on the Overview page and there is only one node, because polling
  // is not happening at the same time and it could be confusing for the user. So, displaying it when there is more
  // than one node, or when the user is on a different page and there is at least one node registered.
  const showOverallConcurrency = nodeCount > 1 || (location.pathname !== "/" && nodeCount > 0);

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
      }}
      open={open}
    >
      <div className={classes.toolbarIcon} onClick={handleDrawerClose}>
        <IconButton color={"secondary"} onClick={handleDrawerClose}>
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
          >
            <CircularProgressWithLabel value={currentLoad}/>
          </Box>
          <Typography
            align="center"
            variant="h4"
          >
            {sessionCount} / {maxSession}
          </Typography>
        </Box>
      )}
    </Drawer>
  );
}

