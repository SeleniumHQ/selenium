/** @jsx _jsx */
import { css, jsx as _jsx } from "@emotion/core";
import { loader } from "graphql.macro";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import localeInfo from "rc-pagination/lib/locale/en_US";
import React, { useEffect, useReducer, useRef, useState } from "react";
import { Query, QueryResult } from "react-apollo";
import NodeRow from "../../components/Node/NodeRow";
import RingSystem, { RingRef } from "../../components/RingSystem/RingSystem";
import { LABELS, LABEL_COLORS, StatusType } from "../../components/Status";
import TopBar from "../../components/TopBar";
import { GridConfig } from "../../config";
import fetchStatusUpdates from "../../core/Status";
import "../../css/common.css";
import CapabilitiesType from "../../models/capabilities";
import NodeType from "../../models/node";
import PaginationState from "../../models/pagination";
import RingDetails from "../../models/rings";
import NodeInfo from "../Node/NodeInfo/NodeInfo";
import "./Console.css";
import { initializeKeyBinds, unBindKeys } from "./Console.keybinds";

/**
 * TODO
	1. add a pagination variable to the query
	2. pagination component which queries based on page from server
	// 3. Write a RingController class which allows calling `filter(tag);`
	4. Sort entries in tables by columns
	5. Search with filters id, status
	// 6. Toggle status filter selection on arc click
	7. When no nodes are running show something like No Nodes running
		And the ringSystem should also show (?)
	8. When the nodes go down it's not unregistering from the hub even after an hour
	// 9. Add ctrl + / for showing keyboard shortcuts modal
	// 10. auto generate shortcuts modal
	11. when searching keybinds should be paused
  12. Move consts to a global config one for ts, one for css
*/

const NODES_QUERY = loader("../../graphql/grid.gql");

interface GqlDataType {
	grid: { nodes: NodeType[] };
}

const numPerPage = GridConfig.console.numEntriesPerPage;

const initialPaginationState: PaginationState = {
	allNodes: [],
	activeNodes: [],
	filteredNodes: [],
	currentPageCount: numPerPage,
	currentPage: 1,
	filterIndex: -1,
};

const initialDetails: RingDetails = {
	count: 0,
	progresses: {},
};

enum PaginationDispatchTypes {
	onPagechange,
	initialiaze,
	filterNodes,
	clearFilter,
	onStatusUpdate,
}

export enum PagenavType {
	next = "next",
	prev = "prev",
}

interface PaginationDispatchArgs {
	page?: number;
	pageSize?: number;
	allNodes?: NodeType[];
	type?: PagenavType;
	filterIndex?: number;
	pageCount?: number;
	updates?: NodeType[];
}

function ringReducer(
	state: RingDetails,
	action: { type: string; args: { progress: number; currentIndex: number } }
) {
	switch (action.type) {
		case "addRing":
			const currentIndex = action.args.currentIndex;
			const newState: RingDetails = {
				...state,
				count: currentIndex + 1,
				progresses: { ...state.progresses },
			};
			newState.progresses[currentIndex] = {
				progress: action.args.progress,
				color: LABEL_COLORS[currentIndex as StatusType],
			};
			return newState;
		default:
			throw new Error();
	}
}

/**
 * Reducer to deal with pagination state updates
 * Also initialiazes the details from the server
 * @param state The sate of the progresses and pagination
 */
function paginationReducer(
	state: PaginationState,
	{
		type: actionType,
		args,
	}: { type: PaginationDispatchTypes; args?: PaginationDispatchArgs }
) {
	let newState: PaginationState = { ...state };

	switch (actionType) {
		case PaginationDispatchTypes.initialiaze:
			const { allNodes } = args!;
			newState = {
				...state,
				allNodes: allNodes!,
				// nodes that should be on the first page
				activeNodes: allNodes!.slice(0, numPerPage),
				// no filter initially so all the nodes
				filteredNodes: [...allNodes!],
			};
			return newState;

		case PaginationDispatchTypes.onPagechange:
			const { page, pageSize } = args!;
			// Show active nodes among the filter nodes based on the page
			newState.activeNodes = newState.filteredNodes.slice(
				(page! - 1) * numPerPage,
				(page! - 1) * numPerPage + pageSize!
			);
			newState.currentPage = page!;
			newState.currentPageCount = pageSize!;
			return newState;
		case PaginationDispatchTypes.onStatusUpdate:
			const { updates } = args!;
			newState.allNodes.forEach((node, i) => {
				node.status = updates![i].status;
			});
			console.log(newState.allNodes.map((node) => node.status));
			return newState;

		case PaginationDispatchTypes.filterNodes:
			// TODO simplify this logic (?)
			let filterIndex = -1;
			if (!args) {
				// if filterIndex was not specified
				// implies we need to re-filter on Page change
				// using the previous filter
				filterIndex = state.filterIndex;
			} else {
				// if specified
				filterIndex = args!.filterIndex!;
			}
			// if selected outside (ideally this wouldn't be called in this case)
			if (filterIndex === -1) return state;

			// if unknown was selected (which should Ideally be not visible)
			if (filterIndex === LABELS.length) return state;

			newState.filterIndex = filterIndex;

			// Note: Better way is to query the server for filtering nodes
			// filtering globally as of now
			newState.filteredNodes = state.allNodes.filter(
				(x) => x.status === LABELS[filterIndex]
			);

			// get the number of pages
			let pageCount = Math.floor(newState.filteredNodes.length / numPerPage);
			let remainingItems = newState.filteredNodes.length % numPerPage;
			if (remainingItems !== 0) pageCount += 1;

			// if number of pages is greater than current page
			// jump to last page i.e. if newpage count < old page count on filter
			if (newState.currentPage > pageCount) newState.currentPage = pageCount;

			// if some filter has no nodes reset to page 1 on change
			// Ideally this won't happen as we'll not be able to click
			// on the zero ring
			if (newState.currentPage <= 0) newState.currentPage = 1;

			// TODO if we need to show some small arc for zero progress rings

			// set active visible nodes
			// Must set these at the end after reseting the page
			newState.activeNodes = newState.filteredNodes.slice(
				(newState.currentPage - 1) * numPerPage,
				(newState.currentPage - 1) * numPerPage + newState.currentPageCount
			);

			return newState;

		case PaginationDispatchTypes.clearFilter:
			newState.filteredNodes = [...state.allNodes];
			newState.filterIndex = -1;
			// set active nodes
			newState.activeNodes = newState.filteredNodes.slice(
				(newState.currentPage - 1) * numPerPage,
				(newState.currentPage - 1) * numPerPage + newState.currentPageCount
			);
			return newState;
		default:
			throw new Error();
	}
}

export default function Console(props: {
	location: { search: string };
	history: any;
}) {
	// Getting a reference to the ringsystem functions
	const ringRef = useRef<RingRef>(null);

	/* Should Ideally just show notifications */
	const handleStatusUpdates = (data: NodeType[]) => {
		// Update table data
		// Update ringsystem
	};

	useEffect(() => {
		window.pauseUpdates = false;
		fetchStatusUpdates(
			handleStatusUpdates,
			GridConfig.status.xhrPollingIntervalMillis
		);

		return () => {
			window.pauseUpdates = true;
		};
	}, []);

	const addRing = (progress: number, index: number) => {
		ringDispatch({ type: "addRing", args: { currentIndex: index, progress } });
	};

	const onPageChange = (page: number, pageSize: number) => {
		paginationDispatch({
			type: PaginationDispatchTypes.onPagechange,
			args: { page, pageSize },
		});
		paginationDispatch({
			type: PaginationDispatchTypes.filterNodes,
		});
	};

	const setInitialQLdata = (gridInfo: { grid: { nodes: NodeType[] } }) => {
		// Initializes the data fetched from graphql

		// TODO remove this after capabilities is fixed on the server
		// parsing capabilities from string to capabilities[]
		const nodes = gridInfo.grid.nodes.map((node: NodeType) => {
			const capStr = (node.capabilities as unknown) as string;
			console.log(capStr);
			if (capStr === "") return { ...node, capabilities: [] };
			let json: { [key: string]: number } = JSON.parse(capStr);
			let capabilities = Object.keys(json).map((key) => {
				let data = key
					.split("{")
					.slice(1)
					.join("")
					.replace(/}/g, "")
					.split(":");
				return { slots: json[key] };
			});
			let caps = (capabilities as unknown) as CapabilitiesType[];
			const newnode: NodeType = { ...node, capabilities: caps };
			console.log(caps);
			return newnode;
		});

		/* Initialize the data in the tables */
		paginationDispatch({
			type: PaginationDispatchTypes.initialiaze,
			args: { allNodes: nodes },
		});

		/* Count the number of nodes based on their status */
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
	};

	// details is the state for the ring progress
	const [details, ringDispatch] = useReducer(ringReducer, initialDetails);
	// this tracks the state of the pagination and filtering
	const [paginationState, paginationDispatch] = useReducer(
		paginationReducer,
		initialPaginationState
	);

	// This is a custom icon renderer for the <Pagination />
	const paginationItemRenderer = (
		_page: number,
		type: string,
		element: React.ReactNode
	) => {
		if (type === "prev") {
			return (
				<button className="btn" id={`${PagenavType.prev}-page`}>
					Prev
				</button>
			);
		} else if (type === "next") {
			return (
				<button className="btn" id={`${PagenavType.next}-page`}>
					Next
				</button>
			);
		} else if (type === "jump-next" || type === "jump-prev") {
			return <i></i>;
		}
		return element;
	};

	// re run the previous search after page changes
	useEffect(window.rerunSearch, [paginationState]);

	// A callback for the child RingSystem
	const ringFilter = (filterIndex: number) => {
		// TODO keep track of selected pages for all states
		// And restore on that state
		// Not hard to implement
		if (filterIndex !== -1) {
			// update the state if index changes
			paginationDispatch({
				type: PaginationDispatchTypes.filterNodes,
				args: { filterIndex },
			});
		} else {
			paginationDispatch({
				type: PaginationDispatchTypes.clearFilter,
			});
		}
	};

	let [modalNode, setModalNode] = useState<NodeType | undefined>();

	// On mount registers keybinds
	useEffect(() => {
		initializeKeyBinds(ringRef, ringFilter);
		// Unbind on unmount
		return unBindKeys;
	}, []);

	var params = new URLSearchParams(props.location.search);
	if (params.get("filter") != null) {
		// TODO set initial filter to be filter
		props.history.push(params.get("filter"));
	}

	// Align to the right
	const paginationCss = css`
		display: flex;
		justify-content: flex-end;
	`;

	let PaginationWidget = (
		<Pagination
			css={paginationCss}
			itemRender={paginationItemRenderer}
			onChange={onPageChange}
			current={paginationState.currentPage}
			defaultPageSize={numPerPage}
			total={paginationState.filteredNodes.length}
			showQuickJumper={true}
			showLessItems={true}
			locale={localeInfo}
		/>
	);

	return (
		<section id="body">
			<div id="overlay"></div>
			<div className="highlightable padding">
				<TopBar />
				<Query
					query={NODES_QUERY}
					// Handle variables on the server side
					// variables={{ count: 10, offset: 0 }}
					// TODO remove <Query /> and try another way if two builds are not allowed
					// rebuilds twice because of setting nodes
					// do not use <Query /> if that's not intended
					onCompleted={(data: GqlDataType) => setInitialQLdata(data!)}
				>
					{(result: QueryResult<GqlDataType>) => {
						let { loading, error } = result;

						// TODO shimmer or something more informative (?)
						if (loading) return <h4>fetching...</h4>;
						if (error) {
							console.error(error);
							// TODO show error message properly
							return <div>{error.message}</div>;
						}
						return (
							<React.Fragment>
								<RingSystem
									ref={ringRef}
									details={details}
									ringFilterCallback={ringFilter}
								/>
								<div
									css={css`
										display: flex;
										justify-content: space-between;
									`}
								>
									<div
										css={css`
											width: ${modalNode ? "70" : "100"}%;
										`}
									>
										{PaginationWidget}
										<div>
											<table className="table table-hover">
												<thead>
													<tr>
														<th
															scope="col"
															// TODO make this call a reset sortfilter function
															// onClick={addRing}
															css={css`
																cursor: pointer;
															`}
														>
															#
														</th>
														<th
															scope="col"
															// onClick={}
															css={css`
																cursor: pointer;
															`}
														>
															Name
														</th>
														<th scope="col">ID</th>
														<th scope="col">
															status{" "}
															{paginationState.filterIndex !== -1 && (
																<i>({LABELS[paginationState.filterIndex]})</i>
															)}
														</th>
														<th scope="col"></th>
													</tr>
												</thead>
												<tbody
													css={css`
														tr:hover td {
															background: rgba(83, 83, 83, 0.3);
														}
													`}
												>
													{/* Map over the nodes */}
													{paginationState.activeNodes.map((n, i) => (
														<NodeRow
															node={n}
															key={n.id}
															dispatch={setModalNode}
															selectedFilterIndex={paginationState.filterIndex}
															index={
																(paginationState.currentPage - 1) * numPerPage +
																i
															}
														/>
													))}
												</tbody>
											</table>
										</div>
										{PaginationWidget}
									</div>
									<NodeInfo
										node={modalNode}
										closecallback={() => setModalNode(undefined)}
									/>
								</div>
							</React.Fragment>
						);
					}}
				</Query>
			</div>
		</section>
	);
}
