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
import {RouteComponentProps, withRouter} from "react-router-dom";
import {createStyles, Theme, withStyles} from "@material-ui/core/styles";

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri:GridConfig.serverUri,
});

function Copyright() {
  // noinspection HtmlUnknownAnchorTarget
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      <Link href="#/help">
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

const useStyles = (theme: Theme) => createStyles(
  {
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
  });

if (process.env.NODE_ENV !== 'test') ReactModal.setAppElement("#root");

type AppProps = RouteComponentProps & {
  classes: any;
};

class App extends React.Component<AppProps> {

  render () {
    const {classes} = this.props;

    return (
      <ApolloProvider client={client}>
        <Router>
          <div className={classes.root}>
            <TopBar/>
            <main className={classes.content}>
              <Container maxWidth={false} className={classes.container}>
                <Switch>
                  <Route exact path={"/sessions"} component={Sessions} {...this.props}/>
                  <Route exact path={"/help"} component={Help} {...this.props}/>
                  <Route exact path={"/"} component={Overview} {...this.props}/>
                  <Route component={Help} {...this.props} {...this.props}/>
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
}

export default withStyles(useStyles)(withRouter(App));
