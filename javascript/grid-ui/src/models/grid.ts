import NodeType from "./node";

export interface GridSchema {
	grid: {
		nodes: NodeType[];
		totalSlots: number;
		usedSlots: number;
		uri: string;
	};
}
