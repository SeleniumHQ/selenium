import {ApolloClient, ApolloProvider, InMemoryCache} from "@apollo/client";
import {HashRouter as Router, Route, Switch} from "react-router-dom";
import React from "react";
import ReactModal from "react-modal";
import {GridConfig} from "./config";
import TopBar from "./components/TopBar/TopBar";
import Overview from "./screens/Overview/Overview";
import {Box, Link, makeStyles} from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Sessions from "./screens/Sessions/Sessions";
import Help from "./screens/Help/Help";

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: GridConfig.serverUri,
});

function Copyright() {
  // noinspection HtmlUnknownAnchorTarget
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      <Link href="#help">
        Help
      </Link>
      {' - All rights reserved - '}
      <Link href="https://sfconservancy.org/" target={"_blank"}>
        Software Freedom Conservancy
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}


const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
    paddingTop: theme.spacing(8),
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
}));


if (process.env.NODE_ENV !== 'test') ReactModal.setAppElement("#root");

function App() {
  const classes = useStyles();
  return (
    <ApolloProvider client={client}>
      <Router>
        <div className={classes.root}>
          <TopBar/>
          <main className={classes.content}>
            <Container maxWidth={false} className={classes.container}>
              <Switch>
                <Route exact path={"/sessions"} component={Sessions}/>
                <Route exact path={"/help"} component={Help}/>
                <Route exact path={"/"} component={Overview}/>
                <Route component={Help}/>
              </Switch>
            </Container>
            <Box pt={4}>
              <Copyright/>
            </Box>
          </main>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
