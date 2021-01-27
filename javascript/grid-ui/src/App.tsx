import {ApolloClient, ApolloProvider, InMemoryCache} from "@apollo/client";
// import { HashRouter as Router, Route, Switch } from "react-router-dom";
import React from "react";
import ReactModal from "react-modal";
// css import order is important
/* 1 */
// import "./css/theme.css";
/* 2 */
// import "./css/theme-selenium.css";
/* 3 */
// import "./App.css";
// import HelpPage from "./screens/HelpPage/HelpPage";
// import Console from "./screens/Console/Console";
// import NavBar from "./components/NavBar/NavBar";
import {GridConfig} from "./config";
// import NodePage from "./screens/Node/NodePage";
import NodeType from "./models/node";
import Overview from "./screens/Overview/Overview";

export const client = new ApolloClient({
	cache: new InMemoryCache(),
	uri: GridConfig.serverUri,
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

if (process.env.NODE_ENV !== 'test') ReactModal.setAppElement("#root");

function App() {
	return (
		<ApolloProvider client={client}>
			<Overview/>
		</ApolloProvider>
		// <ApolloProvider client={client}>
		// 	<Router>
		// 		<NavBar />
		// 		<Switch>
		// 			<Route exact path="/" component={Console} />
		// 			<Route exact path="/node/:id" component={NodePage} />
		// 			<Route exact path="/home" component={HelpPage} />
		// 			<Route exact path="/console" component={Console} />
		// 			<Route component={HelpPage} />
		// 		</Switch>
		// 	</Router>
		// </ApolloProvider>
	);
}

export default App;
