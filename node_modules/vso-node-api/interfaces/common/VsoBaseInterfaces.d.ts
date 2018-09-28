/**
 * Information about the location of a REST API resource
 */
export interface ApiResourceLocation {
    /**
     * Area name for this resource
     */
    area: string;
    /**
     * Unique Identifier for this location
     */
    id: string;
    /**
     * Maximum api version that this resource supports (current server version for this resource)
     */
    maxVersion: string;
    /**
     * Minimum api version that this resource supports
     */
    minVersion: string;
    /**
     * The latest version of this resource location that is in "Release" (non-preview) mode
     */
    releasedVersion: string;
    /**
     * Resource name
     */
    resourceName: string;
    /**
     * The current resource version supported by this resource location
     */
    resourceVersion: number;
    /**
     * This location's route template (templated relative path)
     */
    routeTemplate: string;
}
export interface IHeaders {
    [key: string]: any;
}
export interface IBasicCredentials {
    username: string;
    password: string;
}
export interface IRequestHandler {
    prepareRequest(options: any): void;
    canHandleAuthentication(res: IHttpResponse): boolean;
    handleAuthentication(httpClient: any, protocol: any, options: any, objs: any, finalCallback: any): void;
}
export interface IHttpResponse {
    statusCode?: number;
    headers: any;
}
export interface IRequestOptions {
    socketTimeout?: number;
    ignoreSslError?: boolean;
    proxy?: IProxyConfiguration;
    cert?: ICertConfiguration;
}
export interface IProxyConfiguration {
    proxyUrl: string;
    proxyUsername?: string;
    proxyPassword?: string;
    proxyBypassHosts?: string[];
}
export interface ICertConfiguration {
    caFile?: string;
    certFile?: string;
    keyFile?: string;
    passphrase?: string;
}
