import React from "react";
import NodeInfo from "./NodeInfo/NodeInfo";
import { BasePropsType } from "../../models/props";

export default function NodePage(props: BasePropsType) {
	console.log(props.match.params.id);
	return (
		<section id="body">
			<div id="overlay"></div>
			<div className="highlightable padding">
				{/* <NodeInfo node={{}} /> */}
			</div>
		</section>
	);
}
