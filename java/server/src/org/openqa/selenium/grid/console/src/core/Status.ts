import gql from "graphql-tag";
import { client } from "../App";
import NodeType from "../models/node";
import { GridConfig } from "../config";

const GAP_MILLIS = GridConfig.status.xhrPollingIntervalMillis;

type _CallbackType = (data: NodeType[]) => void;
type _QueryResultType = { grid: { nodes: NodeType[] } };

const fetchStatusUpdates = async (
	callback: _CallbackType,
	gapms = GAP_MILLIS,
	/* TODO can use redux for global state management here */
	controlFlag = "window.pauseUpdates"
) => {
	if (eval(controlFlag) !== undefined && eval(controlFlag)) {
		// pause updates
		setTimeout(() => {
			fetchStatusUpdates(callback);
		}, gapms);
	} else {
		client
			.query<_QueryResultType>({
				query: gql`
					query GetStatus {
						grid {
							nodes {
								id
								status
							}
						}
					}
				`,
				fetchPolicy: "network-only",
			})
			.then((result) => {
				callback(result.data.grid.nodes);
				setTimeout(() => {
					fetchStatusUpdates(callback);
				}, gapms);
			});
	}
};
export default fetchStatusUpdates;
