import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from '@material-ui/core/Paper';
import {makeStyles} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DashboardIcon from "@material-ui/icons/Dashboard";
import MenuIcon from '@material-ui/icons/Menu'
import clsx from 'clsx';
import {loader} from "graphql.macro";
import * as React from 'react';
import seleniumGridLogo from '../../assets/selenium-grid-logo.svg';
import Node from "../../components/Node/Node";
import {useQuery} from "@apollo/client";
import NodeType from "../../models/node";
import {Link} from "@material-ui/core";
import OsInfoType from "../../models/os-info";
import {GridConfig} from "../../config";

function Copyright() {
  return (
      <Typography variant="body2" color="textSecondary" align="center">
        {'All rights reserved - '}
        <Link color="inherit" href="https://sfconservancy.org/" target={"_blank"}>
          Software Freedom Conservancy
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
  );
}

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
    backgroundColor: theme.palette.primary.main,
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
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  gridLogo: {
    width: 52,
    height: 52,
    marginRight: 10,
  },
}));

const GRID_QUERY = loader("../../graphql/grid.gql");


export default function Overview() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  const {loading, error, data} = useQuery(GRID_QUERY,
      {pollInterval: GridConfig.status.xhrPollingIntervalMillis, fetchPolicy: "network-only"});
  if (loading) return <p>Loading...</p>;
  if (error) return <p>`Error! ${error.message}`</p>;

  const gridVersion = data.grid.version;
  const nodes = data.grid.nodes.map((node) => {
    const osInfo: OsInfoType = {
      name: node.osInfo.name,
      version: node.osInfo.version,
      arch: node.osInfo.arch,
    }
    const slotStereotypes = JSON.parse(node.stereotypes);
    const newNode: NodeType = {
      uri: node.uri,
      id: node.id,
      status: node.status,
      maxSession: node.maxSession,
      slotCount: node.slotCount,
      version: node.version,
      osInfo: osInfo,
      sessionCount: node.sessionCount ?? 0,
      slotStereotypes: slotStereotypes,
    };
    return newNode;
  })

  return (
      <div className={classes.root}>
        <CssBaseline/>
        <AppBar position="fixed" className={clsx(classes.appBar, open && classes.appBarShift)}>
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
        <Drawer
            variant="permanent"
            classes={{
              paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
            }}
            open={open}
        >
          <div className={classes.toolbarIcon}>
            <IconButton onClick={handleDrawerClose} color={"secondary"}>
              <ChevronLeftIcon/>
            </IconButton>
          </div>
          <Divider/>
          <List>
            <div>
              <ListItem button>
                <ListItemIcon>
                  <DashboardIcon/>
                </ListItemIcon>
                <ListItemText primary="Overview"/>
              </ListItem>
            </div>
          </List>
          {/*<Divider/>*/}
          {/*<List>{secondaryListItems}</List>*/}
        </Drawer>
        <main className={classes.content}>
          <div className={classes.appBarSpacer}/>
          <Container maxWidth={false} className={classes.container}>
            <Grid container spacing={3}>
              {/* Nodes */}
              {nodes.map((node, index) => {
                return (
                    <Grid item lg={6} sm={12} xl={4} xs={12} key={index}>
                      <Paper className={fixedHeightPaper}>
                        <Node node={node}/>
                      </Paper>
                    </Grid>
                )
              })}
              {/* Sessions */}
              {/*<Grid item xs={12}>*/}
              {/*  <Paper className={classes.paper}>*/}
              {/*    <Sessions/>*/}
              {/*  </Paper>*/}
              {/*</Grid>*/}
            </Grid>
            <Box pt={4}>
              <Copyright/>
            </Box>
          </Container>
        </main>
      </div>
  );
}

