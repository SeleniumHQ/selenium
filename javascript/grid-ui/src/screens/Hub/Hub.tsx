/** @jsx _jsx */
import { css, jsx as _jsx } from "@emotion/core";
import { loader } from "graphql.macro";
import ProgressBar from "progressbar.js";
import React, { useEffect, useReducer, useState } from "react";
import { Query, QueryResult } from "react-apollo";
import RingSystem from "../../components/RingSystem/RingSystem";
import { LABELS, LABEL_COLORS, StatusType } from "../../components/Status";
import TopBar from "../../components/TopBar";
import "../../css/common.css";
import NodeType from "../../models/node";
import RingDetails from "../../models/rings";
import "./Hub.css";
import { GridSchema } from "../../models/grid";

const NODES_QUERY = loader("../../graphql/grid.gql");

interface GqlDataType {
	nodes: NodeType[];
}

const initialDetails: RingDetails = {
	count: 0,
	progresses: {},
};

function ringReducer(state: RingDetails, action: { type: string; args?: any }) {
	switch (action.type) {
		case "addRing":
			const newState = {
				count: state.count + 1,
				progresses: { ...state.progresses },
			};
			newState.progresses[state.count] = {
				progress: 25,
				color: LABEL_COLORS[state.count as StatusType],
			};
			return newState;
		case "updateRing":
			const updatedState = { ...state };
			if (updatedState.count > 0) {
				updatedState.progresses[action.args as number] = {
					...updatedState.progresses[action.args as number],
					progress: Math.round(Math.random() * 99 + 1),
				};
			}
			return updatedState;
		default:
			throw new Error();
	}
}

export default function Hubpage() {
	let [currentIndex] = useState(0);
	let [slots, setSlots] = useState({ usedSlots: 0, totalSlots: 0 });
	let [_renderedLoad, _setRenderedLoad] = useState(false);
	let [dataAvailable, setDataAvailable] = useState<NodeType[]>([]);

	const initializeData = (gridInfo: GridSchema) => {
		const countHash: {
			[x: string]: number;
		} = {};
		LABELS.forEach((l) => (countHash[l] = 0));

		gridInfo.grid.nodes.forEach(
			(node: NodeType) => (countHash[node.status] += 1)
		);

		const sum = Object.values(countHash).reduce((a, b) => a + b, 0);
		// Initialize the 4 rings
		LABELS.forEach((l, i) => {
			const percent = Math.round((countHash[l] / sum) * 100);
			addRing(percent, i);
		});

		setDataAvailable(gridInfo.grid.nodes);
		setSlots({
			totalSlots: gridInfo.grid.totalSlots,
			usedSlots: gridInfo.grid.usedSlots,
		});
	};

	const addRing = (progress: number, index: number) => {
		ringDispatch({ type: "addRing", args: { currentIndex: index, progress } });
	};

	const [details, ringDispatch] = useReducer(ringReducer, initialDetails);

	useEffect(() => {
		if (_renderedLoad) return;
		if (dataAvailable === []) return;
		window.pbar = ProgressBar;

		const div = document.querySelector("#container");
		if (!div) return;

		var bar = new ProgressBar.SemiCircle(div, {
			strokeWidth: 6,
			color: "#FFEA82",
			trailColor: "#eee",
			trailWidth: 1,
			easing: "easeInOut",
			duration: 1400,
			svgStyle: null,
			text: {
				value: "",
				alignToBottom: false,
			},
			from: { color: "#3BEC70" },
			// from: { color: "#FFEA82" },
			to: { color: "#ED6A5A" },
			// Set default step function for all animate calls
			step: (
				state: { color: any },
				bar: {
					path: { setAttribute: (arg0: string, arg1: any) => void };
					value: () => number;
					setText: (arg0: string | number) => void;
					text: { style: { color: any } };
				}
			) => {
				bar.path.setAttribute("stroke", state.color);
				var value = Math.round(bar.value() * slots.totalSlots);
				if (value === 0) {
					bar.setText("");
				} else {
					bar.setText(`${value}/${slots.totalSlots}`);
				}

				bar.text.style.color = state.color;
			},
		});
		bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
		bar.text.style.fontSize = "2rem";

		// usedSlots/TotalSlots
		bar.animate(slots.usedSlots / slots.totalSlots); // Number from 0.0 to 1.0
		_setRenderedLoad(true);
	}, [dataAvailable, slots, _renderedLoad]);

	return (
		<section id="body">
			<div id="overlay"></div>
			<div
				className="highlightable padding"
				style={{
					height: "500px",
				}}
			>
				<TopBar />
				<div
					css={css`
						position: relative;
					`}
				>
					<Query
						query={NODES_QUERY}
						// TODO Handle variables on the server side
						variables={{ count: 10, offset: 0 }}
						onCompleted={(data: GridSchema) => initializeData(data)}
					>
						{(result: QueryResult<GqlDataType>) => {
							let { loading, error } = result;
							if (loading) return <h4>fetching...</h4>;
							if (error) {
								console.error(error);
								// TODO show error message properly
								return <div>{error.message}</div>;
							}
							return (
								<React.Fragment>
									<div
										id="container"
										css={css`
											margin: 20px;
											width: 200px;
											height: 100px;
										`}
									></div>

									<RingSystem
										details={details}
										stroke={10}
										radius={140}
										showLabels={true}
										css={css`
											position: absolute;
										`}
									/>
								</React.Fragment>
							);
						}}
					</Query>
				</div>
			</div>
		</section>
	);
}
