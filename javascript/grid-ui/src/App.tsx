import React from "react";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import ReactModal from "react-modal";
import { ApolloProvider } from "react-apollo";
import { HashRouter as Router, Route, Switch } from "react-router-dom";

// css import order is important
/* 1 */ import "./css/theme.css";
/* 2 */ import "./css/theme-selenium.css";
/* 3 */ import "./App.css";

import HelpPage from "./screens/HelpPage/HelpPage";
import Console from "./screens/Console/Console";
import NavBar from "./components/NavBar/NavBar";
import { GridConfig } from "./config";
import NodePage from "./screens/Node/NodePage";
import NodeType from "./models/node";

const cache = new InMemoryCache();
const link = new HttpLink({
	uri: GridConfig.serverUri,
});

export const client = new ApolloClient({
	cache,
	link,
});

declare global {
	interface Window {
		rerunSearch: VoidFunction;
		pbar: any;
		pauseUpdates: boolean;
		updatesRunning: boolean;
		activeNode: NodeType;
	}
}

ReactModal.setAppElement("#root");

function App() {
	return (
		<ApolloProvider client={client}>
			<Router>
				<NavBar />
				<Switch>
					<Route exact path="/" component={Console} />
					<Route exact path="/node/:id" component={NodePage} />
					<Route exact path="/home" component={HelpPage} />
					<Route exact path="/console" component={Console} />
					<Route component={HelpPage} />
				</Switch>
			</Router>
		</ApolloProvider>
	);
}

export default App;
