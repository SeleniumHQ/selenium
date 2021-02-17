import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import {makeStyles} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu'
import clsx from 'clsx';
import {loader} from "graphql.macro";
import * as React from 'react';
import seleniumGridLogo from '../../assets/selenium-grid-logo.svg';
import {useQuery} from "@apollo/client";
import {GridConfig} from "../../config";
import NavBar from "../NavBar/NavBar";
import Loading from "../Loading/Loading";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarTitle: {
    display: "flex",
    width: `calc(100%)`,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
    color: theme.palette.secondary.main,
  },
  gridLogo: {
    width: 52,
    height: 52,
    marginRight: 10,
  },
}));

const GRID_QUERY = loader("../../graphql/grid.gql");


export default function TopBar() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const {loading, error, data} = useQuery(GRID_QUERY,
    {pollInterval: GridConfig.status.xhrPollingIntervalMillis, fetchPolicy: "network-only"});
  if (loading) {
    return (
      <div className={classes.root}>
        <CssBaseline/>
        <AppBar position="fixed" className={classes.appBar}>
          <Loading/>
        </AppBar>
      </div>
    );
  }

  const gridVersion = error ? "" : data.grid.version;
  const maxSession = error ? 0 : data.grid.maxSession ?? 0;
  const sessionCount = error ? 0 : data.grid.sessionCount ?? 0;
  const nodeCount = error ? 0 : data.grid.nodeCount ?? 0;

  return (
    <div className={classes.root}>
      <CssBaseline/>
      <AppBar position="fixed" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            className={clsx(classes.menuButton)}
          >
            <MenuIcon/>
          </IconButton>
          <Box className={classes.toolbarTitle}>
            <img
              src={seleniumGridLogo}
              className={classes.gridLogo}
              alt="Selenium Grid Logo"
            />
            <Box
              alignItems="center"
              display="flex"
              flexDirection="column"
            >
              <Typography
                className={classes.title}
                component="h1"
                variant="h4"
                noWrap
              >
                Selenium Grid
              </Typography>
              <Typography variant="body2">
                {error ? 'Connection lost...' : gridVersion}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <NavBar open={open} setOpen={setOpen} width={drawerWidth} maxSession={maxSession} sessionCount={sessionCount} nodeCount={nodeCount}/>
    </div>
  );
}

