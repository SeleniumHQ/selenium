import IdentitiesInterfaces = require("../interfaces/IdentitiesInterfaces");
import VSSInterfaces = require("../interfaces/common/VSSInterfaces");
export declare enum ConnectedServiceKind {
    /**
     * Custom or unknown service
     */
    Custom = 0,
    /**
     * Azure Subscription
     */
    AzureSubscription = 1,
    /**
     * Chef Connection
     */
    Chef = 2,
    /**
     * Generic Connection
     */
    Generic = 3,
}
export interface IdentityData {
    identityIds: string[];
}
export interface Process extends ProcessReference {
    _links: any;
    description: string;
    id: string;
    isDefault: boolean;
    type: ProcessType;
}
export interface ProcessReference {
    name: string;
    url: string;
}
export declare enum ProcessType {
    System = 0,
    Custom = 1,
    Inherited = 2,
}
export declare enum ProjectChangeType {
    Modified = 0,
    Deleted = 1,
    Added = 2,
}
/**
 * Contains information of the project
 */
export interface ProjectInfo {
    abbreviation: string;
    description: string;
    id: string;
    lastUpdateTime: Date;
    name: string;
    properties: ProjectProperty[];
    /**
     * Current revision of the project
     */
    revision: number;
    state: any;
    uri: string;
    version: number;
    visibility: ProjectVisibility;
}
export interface ProjectMessage {
    project: ProjectInfo;
    projectChangeType: ProjectChangeType;
    shouldInvalidateSystemStore: boolean;
}
export interface ProjectProperty {
    name: string;
    value: any;
}
export declare enum ProjectVisibility {
    Unchanged = -1,
    Private = 0,
    Organization = 1,
    Public = 2,
}
export interface Proxy {
    authorization: ProxyAuthorization;
    /**
     * This is a description string
     */
    description: string;
    /**
     * The friendly name of the server
     */
    friendlyName: string;
    globalDefault: boolean;
    /**
     * This is a string representation of the site that the proxy server is located in (e.g. "NA-WA-RED")
     */
    site: string;
    siteDefault: boolean;
    /**
     * The URL of the proxy server
     */
    url: string;
}
export interface ProxyAuthorization {
    /**
     * Gets or sets the endpoint used to obtain access tokens from the configured token service.
     */
    authorizationUrl: string;
    /**
     * Gets or sets the client identifier for this proxy.
     */
    clientId: string;
    /**
     * Gets or sets the user identity to authorize for on-prem.
     */
    identity: IdentitiesInterfaces.IdentityDescriptor;
    /**
     * Gets or sets the public key used to verify the identity of this proxy. Only specify on hosted.
     */
    publicKey: VSSInterfaces.PublicKey;
}
export declare enum SourceControlTypes {
    Tfvc = 1,
    Git = 2,
}
/**
 * The Team Context for an operation.
 */
export interface TeamContext {
    /**
     * The team project Id or name.  Ignored if ProjectId is set.
     */
    project: string;
    /**
     * The Team Project ID.  Required if Project is not set.
     */
    projectId: string;
    /**
     * The Team Id or name.  Ignored if TeamId is set.
     */
    team: string;
    /**
     * The Team Id
     */
    teamId: string;
}
/**
 * Represents a Team Project object.
 */
export interface TeamProject extends TeamProjectReference {
    /**
     * The links to other objects related to this object.
     */
    _links: any;
    /**
     * Set of capabilities this project has (such as process template & version control).
     */
    capabilities: {
        [key: string]: {
            [key: string]: string;
        };
    };
    /**
     * The shallow ref to the default team.
     */
    defaultTeam: WebApiTeamRef;
}
/**
 * Data contract for a TeamProjectCollection.
 */
export interface TeamProjectCollection extends TeamProjectCollectionReference {
    /**
     * The links to other objects related to this object.
     */
    _links: any;
    /**
     * Project collection description.
     */
    description: string;
    /**
     * Project collection state.
     */
    state: string;
}
/**
 * Reference object for a TeamProjectCollection.
 */
export interface TeamProjectCollectionReference {
    /**
     * Collection Id.
     */
    id: string;
    /**
     * Collection Name.
     */
    name: string;
    /**
     * Collection REST Url.
     */
    url: string;
}
/**
 * Represents a shallow reference to a TeamProject.
 */
export interface TeamProjectReference {
    /**
     * Project abbreviation.
     */
    abbreviation: string;
    /**
     * The project's description (if any).
     */
    description: string;
    /**
     * Project identifier.
     */
    id: string;
    /**
     * Project name.
     */
    name: string;
    /**
     * Project revision.
     */
    revision: number;
    /**
     * Project state.
     */
    state: any;
    /**
     * Url to the full version of the object.
     */
    url: string;
    /**
     * Project visibility.
     */
    visibility: ProjectVisibility;
}
/**
 * A data transfer object that stores the metadata associated with the creation of temporary data.
 */
export interface TemporaryDataCreatedDTO extends TemporaryDataDTO {
    expirationDate: Date;
    id: string;
    url: string;
}
/**
 * A data transfer object that stores the metadata associated with the temporary data.
 */
export interface TemporaryDataDTO {
    expirationSeconds: number;
    origin: string;
    value: any;
}
export interface WebApiConnectedService extends WebApiConnectedServiceRef {
    /**
     * The user who did the OAuth authentication to created this service
     */
    authenticatedBy: VSSInterfaces.IdentityRef;
    /**
     * Extra description on the service.
     */
    description: string;
    /**
     * Friendly Name of service connection
     */
    friendlyName: string;
    /**
     * Id/Name of the connection service. For Ex: Subscription Id for Azure Connection
     */
    id: string;
    /**
     * The kind of service.
     */
    kind: string;
    /**
     * The project associated with this service
     */
    project: TeamProjectReference;
    /**
     * Optional uri to connect directly to the service such as https://windows.azure.com
     */
    serviceUri: string;
}
export interface WebApiConnectedServiceDetails extends WebApiConnectedServiceRef {
    /**
     * Meta data for service connection
     */
    connectedServiceMetaData: WebApiConnectedService;
    /**
     * Credential info
     */
    credentialsXml: string;
    /**
     * Optional uri to connect directly to the service such as https://windows.azure.com
     */
    endPoint: string;
}
export interface WebApiConnectedServiceRef {
    id: string;
    url: string;
}
/**
 * The representation of data needed to create a tag definition which is sent across the wire.
 */
export interface WebApiCreateTagRequestData {
    /**
     * Name of the tag definition that will be created.
     */
    name: string;
}
export interface WebApiProject extends TeamProjectReference {
    /**
     * Set of capabilities this project has
     */
    capabilities: {
        [key: string]: {
            [key: string]: string;
        };
    };
    /**
     * Reference to collection which contains this project
     */
    collection: WebApiProjectCollectionRef;
    /**
     * Default team for this project
     */
    defaultTeam: WebApiTeamRef;
}
export interface WebApiProjectCollection extends WebApiProjectCollectionRef {
    /**
     * Project collection description
     */
    description: string;
    /**
     * Project collection state
     */
    state: string;
}
export interface WebApiProjectCollectionRef {
    /**
     * Collection Tfs Url (Host Url)
     */
    collectionUrl: string;
    /**
     * Collection Guid
     */
    id: string;
    /**
     * Collection Name
     */
    name: string;
    /**
     * Collection REST Url
     */
    url: string;
}
/**
 * The representation of a tag definition which is sent across the wire.
 */
export interface WebApiTagDefinition {
    /**
     * Whether or not the tag definition is active.
     */
    active: boolean;
    /**
     * ID of the tag definition.
     */
    id: string;
    /**
     * The name of the tag definition.
     */
    name: string;
    /**
     * Resource URL for the Tag Definition.
     */
    url: string;
}
export interface WebApiTeam extends WebApiTeamRef {
    /**
     * Team description
     */
    description: string;
    /**
     * Identity REST API Url to this team
     */
    identityUrl: string;
}
export interface WebApiTeamRef {
    /**
     * Team (Identity) Guid. A Team Foundation ID.
     */
    id: string;
    /**
     * Team name
     */
    name: string;
    /**
     * Team REST API Url
     */
    url: string;
}
export declare var TypeInfo: {
    ConnectedServiceKind: {
        enumValues: {
            "custom": number;
            "azureSubscription": number;
            "chef": number;
            "generic": number;
        };
    };
    Process: any;
    ProcessType: {
        enumValues: {
            "system": number;
            "custom": number;
            "inherited": number;
        };
    };
    ProjectChangeType: {
        enumValues: {
            "modified": number;
            "deleted": number;
            "added": number;
        };
    };
    ProjectInfo: any;
    ProjectMessage: any;
    ProjectVisibility: {
        enumValues: {
            "unchanged": number;
            "private": number;
            "organization": number;
            "public": number;
        };
    };
    SourceControlTypes: {
        enumValues: {
            "tfvc": number;
            "git": number;
        };
    };
    TeamProject: any;
    TeamProjectReference: any;
    TemporaryDataCreatedDTO: any;
    WebApiConnectedService: any;
    WebApiConnectedServiceDetails: any;
    WebApiProject: any;
};
