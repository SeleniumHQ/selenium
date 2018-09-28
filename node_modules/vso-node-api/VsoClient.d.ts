import * as restm from 'typed-rest-client/RestClient';
import ifm = require("./interfaces/common/VsoBaseInterfaces");
export interface ClientVersioningData {
    /**
     * The api version string to send in the request (e.g. "1.0" or "2.0-preview.2")
     */
    apiVersion?: string;
    /**
     * The request path string to send the request to.  Looked up via an options request with the location id.
     */
    requestUrl?: string;
}
export declare class InvalidApiResourceVersionError implements Error {
    name: string;
    message: string;
    constructor(message?: string);
}
/**
 * Base class that should be used (derived from) to make requests to VSS REST apis
 */
export declare class VsoClient {
    private static APIS_RELATIVE_PATH;
    private static PREVIEW_INDICATOR;
    private _locationsByAreaPromises;
    private _initializationPromise;
    restClient: restm.RestClient;
    baseUrl: string;
    basePath: string;
    constructor(baseUrl: string, restClient: restm.RestClient);
    protected autoNegotiateApiVersion(location: ifm.ApiResourceLocation, requestedVersion: string): string;
    /**
     * Gets the route template for a resource based on its location ID and negotiates the api version
     */
    getVersioningData(apiVersion: string, area: string, locationId: string, routeValues: any, queryParams?: any): Promise<ClientVersioningData>;
    /**
     * Sets a promise that is waited on before any requests are issued. Can be used to asynchronously
     * set the request url and auth token manager.
     */
    _setInitializationPromise(promise: Promise<any>): void;
    /**
     * Gets information about an API resource location (route template, supported versions, etc.)
     *
     * @param area resource area name
     * @param locationId Guid of the location to get
     */
    beginGetLocation(area: string, locationId: string): Promise<ifm.ApiResourceLocation>;
    private beginGetAreaLocations(area);
    resolveUrl(relativeUrl: string): string;
    private getSerializedObject(object);
    protected getRequestUrl(routeTemplate: string, area: string, resource: string, routeValues: any, queryParams?: any): string;
    private replaceRouteValues(routeTemplate, routeValues);
}
