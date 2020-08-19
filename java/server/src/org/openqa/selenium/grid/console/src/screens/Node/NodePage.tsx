import React from "react";
import NodeInfo from "./NodeInfo/NodeInfo";
import { BasePropsType } from "../../models/props";
import { loader } from "graphql.macro";

// Not using this query for getting a single node
// Because in Nodes.tsx we get all the attrs of all the existing Nodes
// Incase we might need this leaving it here
// eslint-disable-next-line
const NODE_QUERY = loader("../../graphql/node.gql");

export default function NodePage(props: BasePropsType) {
	console.log(props.match.params.id);
	return (
		<section id="body">
			<div id="overlay"></div>
			<div className="highlightable padding">
				{window.activeNode ? (
					<NodeInfo node={window.activeNode} />
				) : (
					"TODO : Get info by node id from the graphql server which is not implemented on the server"
				)}
			</div>
		</section>
	);
}
