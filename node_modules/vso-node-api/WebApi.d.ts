import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import buildm = require('./BuildApi');
import corem = require('./CoreApi');
import dashboardm = require('./DashboardApi');
import extmgmtm = require("./ExtensionManagementApi");
import featuremgmtm = require("./FeatureManagementApi");
import filecontainerm = require('./FileContainerApi');
import gitm = require('./GitApi');
import locationsm = require('./LocationsApi');
import notificationm = require('./NotificationApi');
import policym = require('./PolicyApi');
import profilem = require('./ProfileApi');
import projectm = require('./ProjectAnalysisApi');
import releasem = require('./ReleaseApi');
import securityrolesm = require('./SecurityRolesApi');
import taskagentm = require('./TaskAgentApi');
import taskm = require('./TaskApi');
import testm = require('./TestApi');
import tfvcm = require('./TfvcApi');
import workm = require('./WorkApi');
import workitemtrackingm = require('./WorkItemTrackingApi');
import workitemtrackingprocessm = require('./WorkItemTrackingProcessApi');
import workitemtrackingprocessdefinitionm = require('./WorkItemTrackingProcessDefinitionsApi');
import * as rm from 'typed-rest-client/RestClient';
import vsom = require('./VsoClient');
import lim = require("./interfaces/LocationsInterfaces");
/**
 * Methods to return handler objects (see handlers folder)
 */
export declare function getBasicHandler(username: string, password: string): VsoBaseInterfaces.IRequestHandler;
export declare function getNtlmHandler(username: string, password: string, workstation?: string, domain?: string): VsoBaseInterfaces.IRequestHandler;
export declare function getBearerHandler(token: string): VsoBaseInterfaces.IRequestHandler;
export declare function getPersonalAccessTokenHandler(token: string): VsoBaseInterfaces.IRequestHandler;
export declare function getHandlerFromToken(token: string): VsoBaseInterfaces.IRequestHandler;
export declare class WebApi {
    serverUrl: string;
    authHandler: VsoBaseInterfaces.IRequestHandler;
    rest: rm.RestClient;
    vsoClient: vsom.VsoClient;
    options: VsoBaseInterfaces.IRequestOptions;
    private _resourceAreas;
    constructor(defaultUrl: string, authHandler: VsoBaseInterfaces.IRequestHandler, options?: VsoBaseInterfaces.IRequestOptions);
    /**
     *  Convenience factory to create with a bearer token.
     * @param defaultServerUrl default server url to use when creating new apis from factory methods
     * @param defaultAuthHandler default authentication credentials to use when creating new apis from factory methods
     */
    static createWithBearerToken(defaultUrl: string, token: string, options?: VsoBaseInterfaces.IRequestOptions): WebApi;
    connect(): Promise<lim.ConnectionData>;
    /**
     * Each factory method can take a serverUrl and a list of handlers
     * if these aren't provided, the default url and auth handler given to the constructor for this class will be used
     */
    getBuildApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<buildm.IBuildApi>;
    getCoreApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<corem.ICoreApi>;
    getDashboardApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<dashboardm.IDashboardApi>;
    getExtensionManagementApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<extmgmtm.IExtensionManagementApi>;
    getFeatureManagementApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<featuremgmtm.IFeatureManagementApi>;
    getFileContainerApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<filecontainerm.IFileContainerApi>;
    getGitApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<gitm.IGitApi>;
    getLocationsApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<locationsm.ILocationsApi>;
    getNotificationApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<notificationm.INotificationApi>;
    getPolicyApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<policym.IPolicyApi>;
    getProfileApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<profilem.IProfileApi>;
    getProjectAnalysisApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<projectm.IProjectAnalysisApi>;
    getSecurityRolesApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<securityrolesm.ISecurityRolesApi>;
    getReleaseApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<releasem.IReleaseApi>;
    getTaskApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<taskm.ITaskApi>;
    getTaskAgentApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<taskagentm.ITaskAgentApi>;
    getTestApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<testm.ITestApi>;
    getTfvcApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<tfvcm.ITfvcApi>;
    getWorkApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<workm.IWorkApi>;
    getWorkItemTrackingApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<workitemtrackingm.IWorkItemTrackingApi>;
    getWorkItemTrackingProcessApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<workitemtrackingprocessm.IWorkItemTrackingProcessApi>;
    getWorkItemTrackingProcessDefinitionApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<workitemtrackingprocessdefinitionm.IWorkItemTrackingProcessDefinitionsApi>;
    private _getResourceAreaUrl(serverUrl, resourceId);
    private _getResourceAreas();
    private _readTaskLibSecrets(lookupKey);
}
