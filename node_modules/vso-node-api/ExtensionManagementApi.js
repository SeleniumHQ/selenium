"use strict";
/*
 * ---------------------------------------------------------
 * Copyright(C) Microsoft Corporation. All rights reserved.
 * ---------------------------------------------------------
 *
 * ---------------------------------------------------------
 * Generated file, DO NOT EDIT
 * ---------------------------------------------------------
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const basem = require("./ClientApiBases");
const ExtensionManagementInterfaces = require("./interfaces/ExtensionManagementInterfaces");
const GalleryInterfaces = require("./interfaces/GalleryInterfaces");
class ExtensionManagementApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-ExtensionManagement-api', options);
    }
    /**
     * @param {string} itemId
     * @param {boolean} testCommerce
     * @param {boolean} isFreeOrTrialInstall
     * @param {boolean} isAccountOwner
     */
    getAcquisitionOptions(itemId, testCommerce, isFreeOrTrialInstall, isAccountOwner) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    itemId: itemId,
                    testCommerce: testCommerce,
                    isFreeOrTrialInstall: isFreeOrTrialInstall,
                    isAccountOwner: isAccountOwner,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "288dff58-d13b-468e-9671-0fb754e9398c", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ExtensionManagementInterfaces.TypeInfo.AcquisitionOptions, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {ExtensionManagementInterfaces.ExtensionAcquisitionRequest} acquisitionRequest
     */
    requestAcquisition(acquisitionRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "da616457-eed3-4672-92d7-18d21f5c1658", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, acquisitionRequest, options);
                    let ret = this.formatResponse(res.result, ExtensionManagementInterfaces.TypeInfo.ExtensionAcquisitionRequest, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} registrationId
     */
    registerAuthorization(publisherName, extensionName, registrationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    publisherName: publisherName,
                    extensionName: extensionName,
                    registrationId: registrationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "f21cfc80-d2d2-4248-98bb-7820c74c4606", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {any} doc
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} scopeType
     * @param {string} scopeValue
     * @param {string} collectionName
     */
    createDocumentByName(doc, publisherName, extensionName, scopeType, scopeValue, collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    publisherName: publisherName,
                    extensionName: extensionName,
                    scopeType: scopeType,
                    scopeValue: scopeValue,
                    collectionName: collectionName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "bbe06c18-1c8b-4fcd-b9c6-1535aaab8749", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, doc, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} scopeType
     * @param {string} scopeValue
     * @param {string} collectionName
     * @param {string} documentId
     */
    deleteDocumentByName(publisherName, extensionName, scopeType, scopeValue, collectionName, documentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    publisherName: publisherName,
                    extensionName: extensionName,
                    scopeType: scopeType,
                    scopeValue: scopeValue,
                    collectionName: collectionName,
                    documentId: documentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "bbe06c18-1c8b-4fcd-b9c6-1535aaab8749", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.del(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} scopeType
     * @param {string} scopeValue
     * @param {string} collectionName
     * @param {string} documentId
     */
    getDocumentByName(publisherName, extensionName, scopeType, scopeValue, collectionName, documentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    publisherName: publisherName,
                    extensionName: extensionName,
                    scopeType: scopeType,
                    scopeValue: scopeValue,
                    collectionName: collectionName,
                    documentId: documentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "bbe06c18-1c8b-4fcd-b9c6-1535aaab8749", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} scopeType
     * @param {string} scopeValue
     * @param {string} collectionName
     */
    getDocumentsByName(publisherName, extensionName, scopeType, scopeValue, collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    publisherName: publisherName,
                    extensionName: extensionName,
                    scopeType: scopeType,
                    scopeValue: scopeValue,
                    collectionName: collectionName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "bbe06c18-1c8b-4fcd-b9c6-1535aaab8749", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {any} doc
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} scopeType
     * @param {string} scopeValue
     * @param {string} collectionName
     */
    setDocumentByName(doc, publisherName, extensionName, scopeType, scopeValue, collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    publisherName: publisherName,
                    extensionName: extensionName,
                    scopeType: scopeType,
                    scopeValue: scopeValue,
                    collectionName: collectionName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "bbe06c18-1c8b-4fcd-b9c6-1535aaab8749", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, doc, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {any} doc
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} scopeType
     * @param {string} scopeValue
     * @param {string} collectionName
     */
    updateDocumentByName(doc, publisherName, extensionName, scopeType, scopeValue, collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    publisherName: publisherName,
                    extensionName: extensionName,
                    scopeType: scopeType,
                    scopeValue: scopeValue,
                    collectionName: collectionName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "bbe06c18-1c8b-4fcd-b9c6-1535aaab8749", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, doc, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Query for one or more data collections for the specified extension.  Note: the token used for authorization must have been issued on behalf of the specified extension.
     *
     * @param {ExtensionManagementInterfaces.ExtensionDataCollectionQuery} collectionQuery
     * @param {string} publisherName - Name of the publisher. Example: "fabrikam".
     * @param {string} extensionName - Name of the extension. Example: "ops-tools".
     */
    queryCollectionsByName(collectionQuery, publisherName, extensionName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    publisherName: publisherName,
                    extensionName: extensionName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "56c331f1-ce53-4318-adfd-4db5c52a7a2e", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, collectionQuery, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * List state and version information for all installed extensions.
     *
     * @param {boolean} includeDisabled - If true (the default), include disabled extensions in the results.
     * @param {boolean} includeErrors - If true, include installed extensions in an error state in the results.
     * @param {boolean} includeInstallationIssues
     */
    getStates(includeDisabled, includeErrors, includeInstallationIssues) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    includeDisabled: includeDisabled,
                    includeErrors: includeErrors,
                    includeInstallationIssues: includeInstallationIssues,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "92755d3d-9a8a-42b3-8a4d-87359fe5aa93", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ExtensionManagementInterfaces.TypeInfo.ExtensionState, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {ExtensionManagementInterfaces.InstalledExtensionQuery} query
     */
    queryExtensions(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "046c980f-1345-4ce2-bf85-b46d10ff4cfd", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, query, options);
                    let ret = this.formatResponse(res.result, ExtensionManagementInterfaces.TypeInfo.InstalledExtension, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * List the installed extensions in the account / project collection.
     *
     * @param {boolean} includeDisabledExtensions - If true (the default), include disabled extensions in the results.
     * @param {boolean} includeErrors - If true, include installed extensions with errors.
     * @param {string[]} assetTypes
     * @param {boolean} includeInstallationIssues
     */
    getInstalledExtensions(includeDisabledExtensions, includeErrors, assetTypes, includeInstallationIssues) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    includeDisabledExtensions: includeDisabledExtensions,
                    includeErrors: includeErrors,
                    assetTypes: assetTypes && assetTypes.join(":"),
                    includeInstallationIssues: includeInstallationIssues,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "275424d0-c844-4fe2-bda6-04933a1357d8", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ExtensionManagementInterfaces.TypeInfo.InstalledExtension, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update an installed extension. Typically this API is used to enable or disable an extension.
     *
     * @param {ExtensionManagementInterfaces.InstalledExtension} extension
     */
    updateInstalledExtension(extension) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "275424d0-c844-4fe2-bda6-04933a1357d8", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, extension, options);
                    let ret = this.formatResponse(res.result, ExtensionManagementInterfaces.TypeInfo.InstalledExtension, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get an installed extension by its publisher and extension name.
     *
     * @param {string} publisherName - Name of the publisher. Example: "fabrikam".
     * @param {string} extensionName - Name of the extension. Example: "ops-tools".
     * @param {string[]} assetTypes
     */
    getInstalledExtensionByName(publisherName, extensionName, assetTypes) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    publisherName: publisherName,
                    extensionName: extensionName
                };
                let queryValues = {
                    assetTypes: assetTypes && assetTypes.join(":"),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "fb0da285-f23e-4b56-8b53-3ef5f9f6de66", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ExtensionManagementInterfaces.TypeInfo.InstalledExtension, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Install the specified extension into the account / project collection.
     *
     * @param {string} publisherName - Name of the publisher. Example: "fabrikam".
     * @param {string} extensionName - Name of the extension. Example: "ops-tools".
     * @param {string} version
     */
    installExtensionByName(publisherName, extensionName, version) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    publisherName: publisherName,
                    extensionName: extensionName,
                    version: version
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "fb0da285-f23e-4b56-8b53-3ef5f9f6de66", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, options);
                    let ret = this.formatResponse(res.result, ExtensionManagementInterfaces.TypeInfo.InstalledExtension, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Uninstall the specified extension from the account / project collection.
     *
     * @param {string} publisherName - Name of the publisher. Example: "fabrikam".
     * @param {string} extensionName - Name of the extension. Example: "ops-tools".
     * @param {string} reason
     * @param {string} reasonCode
     */
    uninstallExtensionByName(publisherName, extensionName, reason, reasonCode) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    publisherName: publisherName,
                    extensionName: extensionName
                };
                let queryValues = {
                    reason: reason,
                    reasonCode: reasonCode,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "fb0da285-f23e-4b56-8b53-3ef5f9f6de66", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.del(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} userId
     */
    getPolicies(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    userId: userId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "e5cc8c09-407b-4867-8319-2ae3338cbf6f", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GalleryInterfaces.TypeInfo.UserExtensionPolicy, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} rejectMessage
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} requesterId
     * @param {ExtensionManagementInterfaces.ExtensionRequestState} state
     */
    resolveRequest(rejectMessage, publisherName, extensionName, requesterId, state) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    publisherName: publisherName,
                    extensionName: extensionName,
                    requesterId: requesterId
                };
                let queryValues = {
                    state: state,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "aa93e1f3-511c-4364-8b9c-eb98818f2e0b", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, rejectMessage, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     */
    getRequests() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "216b978f-b164-424e-ada2-b77561e842b7", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ExtensionManagementInterfaces.TypeInfo.RequestedExtension, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} rejectMessage
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {ExtensionManagementInterfaces.ExtensionRequestState} state
     */
    resolveAllRequests(rejectMessage, publisherName, extensionName, state) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    publisherName: publisherName,
                    extensionName: extensionName
                };
                let queryValues = {
                    state: state,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "ba93e1f3-511c-4364-8b9c-eb98818f2e0b", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, rejectMessage, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} publisherName
     * @param {string} extensionName
     */
    deleteRequest(publisherName, extensionName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    publisherName: publisherName,
                    extensionName: extensionName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "f5afca1e-a728-4294-aa2d-4af0173431b5", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.del(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} publisherName
     * @param {string} extensionName
     * @param {string} requestMessage
     */
    requestExtension(publisherName, extensionName, requestMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    publisherName: publisherName,
                    extensionName: extensionName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "f5afca1e-a728-4294-aa2d-4af0173431b5", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, requestMessage, options);
                    let ret = this.formatResponse(res.result, ExtensionManagementInterfaces.TypeInfo.RequestedExtension, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     */
    getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "ExtensionManagement", "3a2e24ed-1d6f-4cb2-9f3b-45a96bbfaf50", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
}
ExtensionManagementApi.RESOURCE_AREA_ID = "6c2b0933-3600-42ae-bf8b-93d4f7e83594";
exports.ExtensionManagementApi = ExtensionManagementApi;
