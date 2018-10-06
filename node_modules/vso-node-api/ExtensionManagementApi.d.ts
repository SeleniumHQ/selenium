import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import ExtensionManagementInterfaces = require("./interfaces/ExtensionManagementInterfaces");
import GalleryInterfaces = require("./interfaces/GalleryInterfaces");
export interface IExtensionManagementApi extends basem.ClientApiBase {
    getAcquisitionOptions(itemId: string, testCommerce?: boolean, isFreeOrTrialInstall?: boolean, isAccountOwner?: boolean): Promise<ExtensionManagementInterfaces.AcquisitionOptions>;
    requestAcquisition(acquisitionRequest: ExtensionManagementInterfaces.ExtensionAcquisitionRequest): Promise<ExtensionManagementInterfaces.ExtensionAcquisitionRequest>;
    registerAuthorization(publisherName: string, extensionName: string, registrationId: string): Promise<ExtensionManagementInterfaces.ExtensionAuthorization>;
    createDocumentByName(doc: any, publisherName: string, extensionName: string, scopeType: string, scopeValue: string, collectionName: string): Promise<any>;
    deleteDocumentByName(publisherName: string, extensionName: string, scopeType: string, scopeValue: string, collectionName: string, documentId: string): Promise<void>;
    getDocumentByName(publisherName: string, extensionName: string, scopeType: string, scopeValue: string, collectionName: string, documentId: string): Promise<any>;
    getDocumentsByName(publisherName: string, extensionName: string, scopeType: string, scopeValue: string, collectionName: string): Promise<any[]>;
    setDocumentByName(doc: any, publisherName: string, extensionName: string, scopeType: string, scopeValue: string, collectionName: string): Promise<any>;
    updateDocumentByName(doc: any, publisherName: string, extensionName: string, scopeType: string, scopeValue: string, collectionName: string): Promise<any>;
    queryCollectionsByName(collectionQuery: ExtensionManagementInterfaces.ExtensionDataCollectionQuery, publisherName: string, extensionName: string): Promise<ExtensionManagementInterfaces.ExtensionDataCollection[]>;
    getStates(includeDisabled?: boolean, includeErrors?: boolean, includeInstallationIssues?: boolean): Promise<ExtensionManagementInterfaces.ExtensionState[]>;
    queryExtensions(query: ExtensionManagementInterfaces.InstalledExtensionQuery): Promise<ExtensionManagementInterfaces.InstalledExtension[]>;
    getInstalledExtensions(includeDisabledExtensions?: boolean, includeErrors?: boolean, assetTypes?: string[], includeInstallationIssues?: boolean): Promise<ExtensionManagementInterfaces.InstalledExtension[]>;
    updateInstalledExtension(extension: ExtensionManagementInterfaces.InstalledExtension): Promise<ExtensionManagementInterfaces.InstalledExtension>;
    getInstalledExtensionByName(publisherName: string, extensionName: string, assetTypes?: string[]): Promise<ExtensionManagementInterfaces.InstalledExtension>;
    installExtensionByName(publisherName: string, extensionName: string, version?: string): Promise<ExtensionManagementInterfaces.InstalledExtension>;
    uninstallExtensionByName(publisherName: string, extensionName: string, reason?: string, reasonCode?: string): Promise<void>;
    getPolicies(userId: string): Promise<GalleryInterfaces.UserExtensionPolicy>;
    resolveRequest(rejectMessage: string, publisherName: string, extensionName: string, requesterId: string, state: ExtensionManagementInterfaces.ExtensionRequestState): Promise<number>;
    getRequests(): Promise<ExtensionManagementInterfaces.RequestedExtension[]>;
    resolveAllRequests(rejectMessage: string, publisherName: string, extensionName: string, state: ExtensionManagementInterfaces.ExtensionRequestState): Promise<number>;
    deleteRequest(publisherName: string, extensionName: string): Promise<void>;
    requestExtension(publisherName: string, extensionName: string, requestMessage: string): Promise<ExtensionManagementInterfaces.RequestedExtension>;
    getToken(): Promise<string>;
}
export declare class ExtensionManagementApi extends basem.ClientApiBase implements IExtensionManagementApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    static readonly RESOURCE_AREA_ID: string;
    /**
     * @param {string} itemId
     * @param {boolean} testCommerce
     * @param {boolean} isFreeOrTrialInstall
     * @param {boolean} isAccountOwner
     */
    getAcquisitionOptions(itemId: string, testCommerce?: boolean, isFreeOrTrialInstall?: boolean, isAccountOwner?: boolean): Promise<ExtensionManagementInterfaces.AcquisitionOptions>;
    /**
     * @param {ExtensionManagementInterfaces.ExtensionAcquisitionRequest} acquisitionRequest
     */
    requestAcquisition(acquisitionRequest: ExtensionManagementInterfaces.ExtensionAcquisitionRequest): Promise<ExtensionManagementInterfaces.ExtensionAcquisitionRequest>;
    /**
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} registrationId
     */
    registerAuthorization(publisherName: string, extensionName: string, registrationId: string): Promise<ExtensionManagementInterfaces.ExtensionAuthorization>;
    /**
     * @param {any} doc
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} scopeType
     * @param {string} scopeValue
     * @param {string} collectionName
     */
    createDocumentByName(doc: any, publisherName: string, extensionName: string, scopeType: string, scopeValue: string, collectionName: string): Promise<any>;
    /**
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} scopeType
     * @param {string} scopeValue
     * @param {string} collectionName
     * @param {string} documentId
     */
    deleteDocumentByName(publisherName: string, extensionName: string, scopeType: string, scopeValue: string, collectionName: string, documentId: string): Promise<void>;
    /**
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} scopeType
     * @param {string} scopeValue
     * @param {string} collectionName
     * @param {string} documentId
     */
    getDocumentByName(publisherName: string, extensionName: string, scopeType: string, scopeValue: string, collectionName: string, documentId: string): Promise<any>;
    /**
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} scopeType
     * @param {string} scopeValue
     * @param {string} collectionName
     */
    getDocumentsByName(publisherName: string, extensionName: string, scopeType: string, scopeValue: string, collectionName: string): Promise<any[]>;
    /**
     * @param {any} doc
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} scopeType
     * @param {string} scopeValue
     * @param {string} collectionName
     */
    setDocumentByName(doc: any, publisherName: string, extensionName: string, scopeType: string, scopeValue: string, collectionName: string): Promise<any>;
    /**
     * @param {any} doc
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} scopeType
     * @param {string} scopeValue
     * @param {string} collectionName
     */
    updateDocumentByName(doc: any, publisherName: string, extensionName: string, scopeType: string, scopeValue: string, collectionName: string): Promise<any>;
    /**
     * Query for one or more data collections for the specified extension.  Note: the token used for authorization must have been issued on behalf of the specified extension.
     *
     * @param {ExtensionManagementInterfaces.ExtensionDataCollectionQuery} collectionQuery
     * @param {string} publisherName - Name of the publisher. Example: "fabrikam".
     * @param {string} extensionName - Name of the extension. Example: "ops-tools".
     */
    queryCollectionsByName(collectionQuery: ExtensionManagementInterfaces.ExtensionDataCollectionQuery, publisherName: string, extensionName: string): Promise<ExtensionManagementInterfaces.ExtensionDataCollection[]>;
    /**
     * List state and version information for all installed extensions.
     *
     * @param {boolean} includeDisabled - If true (the default), include disabled extensions in the results.
     * @param {boolean} includeErrors - If true, include installed extensions in an error state in the results.
     * @param {boolean} includeInstallationIssues
     */
    getStates(includeDisabled?: boolean, includeErrors?: boolean, includeInstallationIssues?: boolean): Promise<ExtensionManagementInterfaces.ExtensionState[]>;
    /**
     * @param {ExtensionManagementInterfaces.InstalledExtensionQuery} query
     */
    queryExtensions(query: ExtensionManagementInterfaces.InstalledExtensionQuery): Promise<ExtensionManagementInterfaces.InstalledExtension[]>;
    /**
     * List the installed extensions in the account / project collection.
     *
     * @param {boolean} includeDisabledExtensions - If true (the default), include disabled extensions in the results.
     * @param {boolean} includeErrors - If true, include installed extensions with errors.
     * @param {string[]} assetTypes
     * @param {boolean} includeInstallationIssues
     */
    getInstalledExtensions(includeDisabledExtensions?: boolean, includeErrors?: boolean, assetTypes?: string[], includeInstallationIssues?: boolean): Promise<ExtensionManagementInterfaces.InstalledExtension[]>;
    /**
     * Update an installed extension. Typically this API is used to enable or disable an extension.
     *
     * @param {ExtensionManagementInterfaces.InstalledExtension} extension
     */
    updateInstalledExtension(extension: ExtensionManagementInterfaces.InstalledExtension): Promise<ExtensionManagementInterfaces.InstalledExtension>;
    /**
     * Get an installed extension by its publisher and extension name.
     *
     * @param {string} publisherName - Name of the publisher. Example: "fabrikam".
     * @param {string} extensionName - Name of the extension. Example: "ops-tools".
     * @param {string[]} assetTypes
     */
    getInstalledExtensionByName(publisherName: string, extensionName: string, assetTypes?: string[]): Promise<ExtensionManagementInterfaces.InstalledExtension>;
    /**
     * Install the specified extension into the account / project collection.
     *
     * @param {string} publisherName - Name of the publisher. Example: "fabrikam".
     * @param {string} extensionName - Name of the extension. Example: "ops-tools".
     * @param {string} version
     */
    installExtensionByName(publisherName: string, extensionName: string, version?: string): Promise<ExtensionManagementInterfaces.InstalledExtension>;
    /**
     * Uninstall the specified extension from the account / project collection.
     *
     * @param {string} publisherName - Name of the publisher. Example: "fabrikam".
     * @param {string} extensionName - Name of the extension. Example: "ops-tools".
     * @param {string} reason
     * @param {string} reasonCode
     */
    uninstallExtensionByName(publisherName: string, extensionName: string, reason?: string, reasonCode?: string): Promise<void>;
    /**
     * @param {string} userId
     */
    getPolicies(userId: string): Promise<GalleryInterfaces.UserExtensionPolicy>;
    /**
     * @param {string} rejectMessage
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} requesterId
     * @param {ExtensionManagementInterfaces.ExtensionRequestState} state
     */
    resolveRequest(rejectMessage: string, publisherName: string, extensionName: string, requesterId: string, state: ExtensionManagementInterfaces.ExtensionRequestState): Promise<number>;
    /**
     */
    getRequests(): Promise<ExtensionManagementInterfaces.RequestedExtension[]>;
    /**
     * @param {string} rejectMessage
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {ExtensionManagementInterfaces.ExtensionRequestState} state
     */
    resolveAllRequests(rejectMessage: string, publisherName: string, extensionName: string, state: ExtensionManagementInterfaces.ExtensionRequestState): Promise<number>;
    /**
     * @param {string} publisherName
     * @param {string} extensionName
     */
    deleteRequest(publisherName: string, extensionName: string): Promise<void>;
    /**
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} requestMessage
     */
    requestExtension(publisherName: string, extensionName: string, requestMessage: string): Promise<ExtensionManagementInterfaces.RequestedExtension>;
    /**
     */
    getToken(): Promise<string>;
}
