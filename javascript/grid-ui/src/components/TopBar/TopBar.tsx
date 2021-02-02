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
    alignItems: "center",
    justifyContent: "center",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
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
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const {loading, error, data} = useQuery(GRID_QUERY,
    {pollInterval: GridConfig.status.xhrPollingIntervalMillis, fetchPolicy: "network-only"});
  if (loading) return <p>Loading...</p>;
  if (error) return <p>`Error! ${error.message}`</p>;

  const gridVersion = data.grid.version;
  const maxSession = data.grid.maxSession;
  const sessionCount = data.grid.sessionCount ?? 0;

  return (
    <div className={classes.root}>
      <CssBaseline/>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon/>
          </IconButton>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="close drawer"
            onClick={handleDrawerClose}
            className={clsx(classes.menuButton, !open && classes.menuButtonHidden)}
          >
            <ChevronLeftIcon/>
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
                {gridVersion}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <NavBar open={open} maxSession={maxSession} sessionCount={sessionCount}/>
    </div>
  );
}

