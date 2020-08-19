/** @jsx _jsx*/

import { css, jsx as _jsx } from "@emotion/core";
import React from "react";
import { Link } from "react-router-dom";
import { ReactComponent as RightIcon } from "../../assets/icons/arrow.svg";
import NodeType from "../../models/node";
import { Status } from "../Status";

const NodeRow = React.memo(
	(props: {
		node: NodeType;
		index: number;
		dispatch: (node: NodeType) => void;
		/** Seleted Filter index to display it in the status */
		selectedFilterIndex?: number;
	}) => {
		const { node, index, selectedFilterIndex: selected = -1 } = props;
		return (
			<tr
				// Remove the vertical border in this table
				onClick={() => {
					console.log(node);
				}}
				css={css`
					td {
						border: 0 !important;
						font-family: monospace;
					}
				`}
			>
				<th scope="row">{index + 1}</th>
				<td>Node {index + 1}</td>
				<td>
					<Link
						to={`/node/${node.id}`}
						onClick={() => (window.activeNode = node)}
					>
						{node.id}
					</Link>
				</td>
				<td>
					<Status status={node.status} selected={selected} />
				</td>
				<td
					css={css`
						cursor: pointer;
					`}
					data-index={index}
					data-id={node.id}
					// TODO link to modal page
					onClick={() => props.dispatch(node)}
				>
					<RightIcon />
				</td>
			</tr>
		);
	}
);

export default NodeRow;
