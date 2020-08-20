import CapabilitiesType from "./capabilities";

interface NodeType {
    /** The id assigned by the hub to the node */
    id: string;
    /** A set of capabilities that this node has */
    capabilities: CapabilitiesType[];
    /** The url of the node */
    uri: string;
    /** The status of the node can be one of UP, DRAINING, UNAVAILABLE, (IDLE?) */
    status: string;
    /** The maximum number of sessions this node can handle */
    maxSession: number;
}

export default NodeType;
