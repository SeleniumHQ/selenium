import OsInfo from "./os-info";
import StereotypeInfo from "./stereotype-info";

interface NodeInfo {
  /** Node id */
  id: string;
  /** Node URI */
  uri: string;
  /** Node status (UP, DRAINING, UNAVAILABLE)  */
  status: string;
  /** Max. number of concurrent sessions */
  maxSession: number;
  /** Number of slots */
  slotCount: number;
  /** Number of current sessions */
  sessionCount: number;
  /** Grid Node version */
  version: string;
  /** Grid Node OS information */
  osInfo: OsInfo;
  /** Node stereotypes. */
  slotStereotypes: StereotypeInfo[];
}

export default NodeInfo;
