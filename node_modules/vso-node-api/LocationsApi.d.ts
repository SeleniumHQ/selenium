import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import LocationsInterfaces = require("./interfaces/LocationsInterfaces");
import VSSInterfaces = require("./interfaces/common/VSSInterfaces");
export interface ILocationsApi extends basem.ClientApiBase {
    getConnectionData(connectOptions?: VSSInterfaces.ConnectOptions, lastChangeId?: number, lastChangeId64?: number): Promise<LocationsInterfaces.ConnectionData>;
    getResourceArea(areaId: string, organizationName?: string, accountName?: string): Promise<LocationsInterfaces.ResourceAreaInfo>;
    getResourceAreaByHost(areaId: string, hostId: string): Promise<LocationsInterfaces.ResourceAreaInfo>;
    getResourceAreas(organizationName?: string, accountName?: string): Promise<LocationsInterfaces.ResourceAreaInfo[]>;
    getResourceAreasByHost(hostId: string): Promise<LocationsInterfaces.ResourceAreaInfo[]>;
    deleteServiceDefinition(serviceType: string, identifier: string): Promise<void>;
    getServiceDefinition(serviceType: string, identifier: string, allowFaultIn?: boolean, previewFaultIn?: boolean): Promise<LocationsInterfaces.ServiceDefinition>;
    getServiceDefinitions(serviceType?: string): Promise<LocationsInterfaces.ServiceDefinition[]>;
    updateServiceDefinitions(serviceDefinitions: VSSInterfaces.VssJsonCollectionWrapperV<LocationsInterfaces.ServiceDefinition[]>): Promise<void>;
}
export declare class LocationsApi extends basem.ClientApiBase implements ILocationsApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
     * This was copied and adapted from TeamFoundationConnectionService.Connect()
     *
     * @param {VSSInterfaces.ConnectOptions} connectOptions
     * @param {number} lastChangeId - Obsolete 32-bit LastChangeId
     * @param {number} lastChangeId64 - Non-truncated 64-bit LastChangeId
     */
    getConnectionData(connectOptions?: VSSInterfaces.ConnectOptions, lastChangeId?: number, lastChangeId64?: number): Promise<LocationsInterfaces.ConnectionData>;
    /**
     * @param {string} areaId
     * @param {string} organizationName
     * @param {string} accountName
     */
    getResourceArea(areaId: string, organizationName?: string, accountName?: string): Promise<LocationsInterfaces.ResourceAreaInfo>;
    /**
     * @param {string} areaId
     * @param {string} hostId
     */
    getResourceAreaByHost(areaId: string, hostId: string): Promise<LocationsInterfaces.ResourceAreaInfo>;
    /**
     * @param {string} organizationName
     * @param {string} accountName
     */
    getResourceAreas(organizationName?: string, accountName?: string): Promise<LocationsInterfaces.ResourceAreaInfo[]>;
    /**
     * @param {string} hostId
     */
    getResourceAreasByHost(hostId: string): Promise<LocationsInterfaces.ResourceAreaInfo[]>;
    /**
     * @param {string} serviceType
     * @param {string} identifier
     */
    deleteServiceDefinition(serviceType: string, identifier: string): Promise<void>;
    /**
     * Finds a given service definition.
     *
     * @param {string} serviceType
     * @param {string} identifier
     * @param {boolean} allowFaultIn - If true, we will attempt to fault in a host instance mapping if in SPS.
     * @param {boolean} previewFaultIn - If true, we will calculate and return a host instance mapping, but not persist it.
     */
    getServiceDefinition(serviceType: string, identifier: string, allowFaultIn?: boolean, previewFaultIn?: boolean): Promise<LocationsInterfaces.ServiceDefinition>;
    /**
     * @param {string} serviceType
     */
    getServiceDefinitions(serviceType?: string): Promise<LocationsInterfaces.ServiceDefinition[]>;
    /**
     * @param {VSSInterfaces.VssJsonCollectionWrapperV<LocationsInterfaces.ServiceDefinition[]>} serviceDefinitions
     */
    updateServiceDefinitions(serviceDefinitions: VSSInterfaces.VssJsonCollectionWrapperV<LocationsInterfaces.ServiceDefinition[]>): Promise<void>;
}
