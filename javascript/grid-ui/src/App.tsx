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
import Footer from "./components/Footer/Footer";
import Container from "@material-ui/core/Container";
import Sessions from "./screens/Sessions/Sessions";
import Help from "./screens/Help/Help";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {createStyles, Theme, withStyles} from "@material-ui/core/styles";
import {loader} from "graphql.macro";
import NavBar from "./components/NavBar/NavBar";

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri:GridConfig.serverUri,
});

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

const GRID_QUERY = loader("./graphql/grid.gql");

type AppProps = RouteComponentProps & {
  classes: any;
};

type AppState = {
  drawerOpen: boolean;
  loading: boolean;
  error: string;
  data: any;
};

class App extends React.Component<AppProps, AppState> {
  intervalID;

  constructor(props) {
    super(props);
    this.state = {
      drawerOpen: true,
      loading: true,
      error: '',
      data: {}
    }
  }

  fetchData = () => {
    client.query({query: GRID_QUERY, fetchPolicy: "network-only"})
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

  toggleDrawer = () => {
    this.setState({drawerOpen: !this.state.drawerOpen})
  }

  render () {
    const {classes} = this.props;
    const {loading, error, data, drawerOpen} = this.state;

    const maxSession = error ? 0 : data?.grid?.maxSession ?? 0;
    const sessionCount = error ? 0 : data?.grid?.sessionCount ?? 0;
    const nodeCount = error ? 0 : data?.grid?.nodeCount ?? 0;

    const topBarSubheader = error ? error : data?.grid?.version;

    return (
      <ApolloProvider client={client}>
        <Router>
          <div className={classes.root}>
            <TopBar subheader={topBarSubheader} error={!!error} drawerOpen={drawerOpen} toggleDrawer={this.toggleDrawer}/>
            {!error && (
              <NavBar open={drawerOpen} maxSession={maxSession} sessionCount={sessionCount} nodeCount={nodeCount}/>
            )}
            <main className={classes.content}>
              <Container maxWidth={false} className={classes.container}>
                <Switch>
                  <Route exact path={"/sessions"} component={Sessions} {...this.props}/>
                  <Route exact path={"/help"} component={Help} {...this.props}/>
                  <Route exact path={"/"} component={Overview} {...this.props}/>
                  <Route component={Help} {...this.props} {...this.props}/>
                </Switch>
              </Container>
              <Footer/>
            </main>
          </div>
        </Router>
      </ApolloProvider>
    );
  }
}

export default withStyles(useStyles)(withRouter(App));
