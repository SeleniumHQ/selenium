import NodeType from "./node";

/**
 * A Reducer state object which holds the pagination and table state
 *
 * TODO can move the allNodes one to a different state if needed because
 * it needs to be accessible by `Hub` and `NavBar` or we can fetch the data again
 */
interface PaginationState {
	/**
	 * All nodes fecthed from the server
	 */
	allNodes: NodeType[];
	/**
	 * Active nodes are the nodes that are visible now in the UI
	 */
	activeNodes: NodeType[];
	/**
	 * Filtered nodes are all the nodes from the server filtered based on the selection
	 */
	filteredNodes: NodeType[];
	/**
	 * The number of rows in the current page of the table
	 */
	currentPageCount: number;
	/** The current active page in the table */
	currentPage: number;
	/** The index by which the current nodes are filtered
	 * Look at the `LABELS` Array in `Status.tsx`
	 */
	filterIndex: number;
}

export default PaginationState;
