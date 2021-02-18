import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import {createStyles, Theme} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu'
import HelpIcon from '@material-ui/icons/Help';
import clsx from 'clsx';
import {loader} from "graphql.macro";
import React from 'react';
import seleniumGridLogo from '../../assets/selenium-grid-logo.svg';
import NavBar from "../NavBar/NavBar";
import Loading from "../Loading/Loading";
import {withStyles} from "@material-ui/core";
import {ApolloClient, ApolloConsumer} from '@apollo/client';
import {GridConfig} from "../../config";

const useStyles = (theme: Theme) => createStyles(
  {
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
  });

const GRID_QUERY = loader("../../graphql/grid.gql");

type TopBarProps = {
  classes: any;
};

type TopBarState = {
  open: boolean;
  loading: boolean;
  error: string;
  data: any;
};

class TopBar extends React.Component<TopBarProps, TopBarState> {
  client: ApolloClient<any> | null;
  intervalID;

  constructor(props) {
    super(props);
    this.client = null;
    this.state = {
      open: false,
      loading: true,
      error: '',
      data: {}
    }
  }

  handleDrawerOpen = () => {
    this.setState({open: true});
  };

  handleDrawerClose = () => {
    this.setState({open: false});
  };

  fetchData = () => {
    this.client?.query({query: GRID_QUERY, fetchPolicy: "network-only"})
      .then(({loading, error, data}) => {
        this.setState({loading: loading, error: error?.networkError?.message || '', data: data});
      })
      .catch((error) => {
        this.setState({loading: false, error: error.message})
      })
  };

  componentDidMount() {
    this.fetchData();
    this.intervalID = setInterval(this.fetchData.bind(this), GridConfig.status.xhrPollingIntervalMillis);
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  render () {
    const {classes} = this.props;

    if (!this.client) {
      return (
        <ApolloConsumer>
          {client => {
            this.client = client;
            return (
              <div className={classes.root}>
                <CssBaseline/>
                <AppBar position="fixed" className={classes.appBar}>
                  <Loading/>
                </AppBar>
              </div>
            )
          }}
        </ApolloConsumer>
      )
    }

    const {loading, error, data, open} = this.state;

    if (loading) {
      return (
        <ApolloConsumer>
          {client => {
            this.client = client;
            return (
              <div className={classes.root}>
                <CssBaseline/>
                <AppBar position="fixed" className={classes.appBar}>
                  <Loading/>
                </AppBar>
              </div>
            )
          }}
        </ApolloConsumer>
      );
    }

    const gridVersion = error ? "" : data.grid.version;
    const maxSession = error ? 0 : data.grid.maxSession ?? 0;
    const sessionCount = error ? 0 : data.grid.sessionCount ?? 0;
    const nodeCount = error ? 0 : data.grid.nodeCount ?? 0;
    const connectionError = !!error;

    return (
      <div className={classes.root}>
        <CssBaseline/>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
            {!connectionError && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={this.handleDrawerOpen}
                className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
              >
                <MenuIcon/>
              </IconButton>
            )}
            {!connectionError && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="close drawer"
                onClick={this.handleDrawerClose}
                className={clsx(classes.menuButton, !open && classes.menuButtonHidden)}
              >
                <ChevronLeftIcon/>
              </IconButton>
            )}
            <IconButton
              edge="start"
              color="inherit"
              aria-label="help"
              href={"#help"}
              className={clsx(classes.menuButton, !connectionError && classes.menuButtonHidden)}
            >
              <HelpIcon/>
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
                  {error || gridVersion}
                </Typography>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
        {!error && (
          <NavBar open={open} maxSession={maxSession} sessionCount={sessionCount} nodeCount={nodeCount}/>
        )}
      </div>
    );
  }
}

export default withStyles(useStyles)(TopBar)
