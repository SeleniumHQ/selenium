import OsInfoType from "./os-info";
import CapabilitiesType from "./capabilities";

interface NodeType {
    /** Node id */
    id: string;
    /** A set of capabilities that this node has */
    capabilities: CapabilitiesType[];
    /** Node URI */
    uri: string;
    /** Node status (UP, DRAINING, UNAVAILABLE)  */
    status: string;
    /** Max. number of concurrent sessions */
    maxSession: number;
    /** Number of current sessions */
    sessionCount: number;
    /** Grid Node version */
    version: string;
    /** Grid Node OS information */
    osInfo: OsInfoType;
    /** Node stereotypes.
     * Not an ideal type, but it simplifies the parsing.
     * There is room for improvement here. */
    slotStereotypes: [];
}

export default NodeType;
