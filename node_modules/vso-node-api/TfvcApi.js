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
const TfvcInterfaces = require("./interfaces/TfvcInterfaces");
class TfvcApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-Tfvc-api', options);
    }
    /**
     * Get a single branch hierarchy at the given path with parents or children as specified.
     *
     * @param {string} path - Full path to the branch.  Default: $/ Examples: $/, $/MyProject, $/MyProject/SomeFolder.
     * @param {string} project - Project ID or project name
     * @param {boolean} includeParent - Return the parent branch, if there is one. Default: False
     * @param {boolean} includeChildren - Return child branches, if there are any. Default: False
     */
    getBranch(path, project, includeParent, includeChildren) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    path: path,
                    includeParent: includeParent,
                    includeChildren: includeChildren,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "bc1f417e-239d-42e7-85e1-76e80cb2d6eb", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcBranch, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a collection of branch roots -- first-level children, branches with no parents.
     *
     * @param {string} project - Project ID or project name
     * @param {boolean} includeParent - Return the parent branch, if there is one. Default: False
     * @param {boolean} includeChildren - Return the child branches for each root branch. Default: False
     * @param {boolean} includeDeleted - Return deleted branches. Default: False
     * @param {boolean} includeLinks - Return links. Default: False
     */
    getBranches(project, includeParent, includeChildren, includeDeleted, includeLinks) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    includeParent: includeParent,
                    includeChildren: includeChildren,
                    includeDeleted: includeDeleted,
                    includeLinks: includeLinks,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "bc1f417e-239d-42e7-85e1-76e80cb2d6eb", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcBranch, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get branch hierarchies below the specified scopePath
     *
     * @param {string} scopePath - Full path to the branch.  Default: $/ Examples: $/, $/MyProject, $/MyProject/SomeFolder.
     * @param {string} project - Project ID or project name
     * @param {boolean} includeDeleted - Return deleted branches. Default: False
     * @param {boolean} includeLinks - Return links. Default: False
     */
    getBranchRefs(scopePath, project, includeDeleted, includeLinks) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    scopePath: scopePath,
                    includeDeleted: includeDeleted,
                    includeLinks: includeLinks,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "bc1f417e-239d-42e7-85e1-76e80cb2d6eb", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcBranchRef, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve Tfvc changes for a given changeset.
     *
     * @param {number} id - ID of the changeset. Default: null
     * @param {number} skip - Number of results to skip. Default: null
     * @param {number} top - The maximum number of results to return. Default: null
     */
    getChangesetChanges(id, skip, top) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                let queryValues = {
                    '$skip': skip,
                    '$top': top,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "f32b86f2-15b9-4fe6-81b1-6f8938617ee5", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcChange, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Create a new changeset.
     *
     * @param {TfvcInterfaces.TfvcChangeset} changeset
     * @param {string} project - Project ID or project name
     */
    createChangeset(changeset, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "tfvc", "0bc8f0a4-6bfb-42a9-ba84-139da7b99c49", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, changeset, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcChangesetRef, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve a Tfvc Changeset
     *
     * @param {number} id - Changeset Id to retrieve.
     * @param {string} project - Project ID or project name
     * @param {number} maxChangeCount - Number of changes to return (maximum 100 changes) Default: 0
     * @param {boolean} includeDetails - Include policy details and check-in notes in the response. Default: false
     * @param {boolean} includeWorkItems - Include workitems. Default: false
     * @param {number} maxCommentLength - Include details about associated work items in the response. Default: null
     * @param {boolean} includeSourceRename - Include renames.  Default: false
     * @param {number} skip - Number of results to skip. Default: null
     * @param {number} top - The maximum number of results to return. Default: null
     * @param {string} orderby - Results are sorted by ID in descending order by default. Use id asc to sort by ID in ascending order.
     * @param {TfvcInterfaces.TfvcChangesetSearchCriteria} searchCriteria - Following criteria available (.itemPath, .version, .versionType, .versionOption, .author, .fromId, .toId, .fromDate, .toDate) Default: null
     */
    getChangeset(id, project, maxChangeCount, includeDetails, includeWorkItems, maxCommentLength, includeSourceRename, skip, top, orderby, searchCriteria) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    id: id
                };
                let queryValues = {
                    maxChangeCount: maxChangeCount,
                    includeDetails: includeDetails,
                    includeWorkItems: includeWorkItems,
                    maxCommentLength: maxCommentLength,
                    includeSourceRename: includeSourceRename,
                    '$skip': skip,
                    '$top': top,
                    '$orderby': orderby,
                    searchCriteria: searchCriteria,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "tfvc", "0bc8f0a4-6bfb-42a9-ba84-139da7b99c49", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcChangeset, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve Tfvc Changesets
     *
     * @param {string} project - Project ID or project name
     * @param {number} maxCommentLength - Include details about associated work items in the response. Default: null
     * @param {number} skip - Number of results to skip. Default: null
     * @param {number} top - The maximum number of results to return. Default: null
     * @param {string} orderby - Results are sorted by ID in descending order by default. Use id asc to sort by ID in ascending order.
     * @param {TfvcInterfaces.TfvcChangesetSearchCriteria} searchCriteria - Following criteria available (.itemPath, .version, .versionType, .versionOption, .author, .fromId, .toId, .fromDate, .toDate) Default: null
     */
    getChangesets(project, maxCommentLength, skip, top, orderby, searchCriteria) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    maxCommentLength: maxCommentLength,
                    '$skip': skip,
                    '$top': top,
                    '$orderby': orderby,
                    searchCriteria: searchCriteria,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "tfvc", "0bc8f0a4-6bfb-42a9-ba84-139da7b99c49", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcChangesetRef, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Returns changesets for a given list of changeset Ids.
     *
     * @param {TfvcInterfaces.TfvcChangesetsRequestData} changesetsRequestData - List of changeset IDs.
     */
    getBatchedChangesets(changesetsRequestData) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "b7e7c173-803c-4fea-9ec8-31ee35c5502a", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, changesetsRequestData, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcChangesetRef, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieves the work items associated with a particular changeset.
     *
     * @param {number} id - ID of the changeset. Default: null
     */
    getChangesetWorkItems(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "64ae0bea-1d71-47c9-a9e5-fe73f5ea0ff4", routeValues);
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
     * Post for retrieving a set of items given a list of paths or a long path. Allows for specifying the recursionLevel and version descriptors for each path.
     *
     * @param {TfvcInterfaces.TfvcItemRequestData} itemRequestData
     * @param {string} project - Project ID or project name
     */
    getItemsBatch(itemRequestData, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "fe6f827b-5f64-480f-b8af-1eca3b80e833", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, itemRequestData, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcItem, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Post for retrieving a set of items given a list of paths or a long path. Allows for specifying the recursionLevel and version descriptors for each path.
     *
     * @param {TfvcInterfaces.TfvcItemRequestData} itemRequestData
     * @param {string} project - Project ID or project name
     */
    getItemsBatchZip(itemRequestData, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "fe6f827b-5f64-480f-b8af-1eca3b80e833", routeValues);
                    let url = verData.requestUrl;
                    let apiVersion = verData.apiVersion;
                    let accept = this.createAcceptHeader("application/zip", apiVersion);
                    resolve((yield this.http.get(url, { "Accept": accept })).message);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get Item Metadata and/or Content for a single item. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content which is always returned as a download.
     *
     * @param {string} path - Version control path of an individual item to return.
     * @param {string} project - Project ID or project name
     * @param {string} fileName - file name of item returned.
     * @param {boolean} download - If true, create a downloadable attachment.
     * @param {string} scopePath - Version control path of a folder to return multiple items.
     * @param {TfvcInterfaces.VersionControlRecursionType} recursionLevel - None (just the item), or OneLevel (contents of a folder).
     * @param {TfvcInterfaces.TfvcVersionDescriptor} versionDescriptor
     */
    getItem(path, project, fileName, download, scopePath, recursionLevel, versionDescriptor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    path: path,
                    fileName: fileName,
                    download: download,
                    scopePath: scopePath,
                    recursionLevel: recursionLevel,
                    versionDescriptor: versionDescriptor,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "ba9fc436-9a38-4578-89d6-e4f3241f5040", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcItem, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get Item Metadata and/or Content for a single item. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content which is always returned as a download.
     *
     * @param {string} path - Version control path of an individual item to return.
     * @param {string} project - Project ID or project name
     * @param {string} fileName - file name of item returned.
     * @param {boolean} download - If true, create a downloadable attachment.
     * @param {string} scopePath - Version control path of a folder to return multiple items.
     * @param {TfvcInterfaces.VersionControlRecursionType} recursionLevel - None (just the item), or OneLevel (contents of a folder).
     * @param {TfvcInterfaces.TfvcVersionDescriptor} versionDescriptor
     */
    getItemContent(path, project, fileName, download, scopePath, recursionLevel, versionDescriptor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    path: path,
                    fileName: fileName,
                    download: download,
                    scopePath: scopePath,
                    recursionLevel: recursionLevel,
                    versionDescriptor: versionDescriptor,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "ba9fc436-9a38-4578-89d6-e4f3241f5040", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let apiVersion = verData.apiVersion;
                    let accept = this.createAcceptHeader("application/octet-stream", apiVersion);
                    resolve((yield this.http.get(url, { "Accept": accept })).message);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a list of Tfvc items
     *
     * @param {string} project - Project ID or project name
     * @param {string} scopePath - Version control path of a folder to return multiple items.
     * @param {TfvcInterfaces.VersionControlRecursionType} recursionLevel - None (just the item), or OneLevel (contents of a folder).
     * @param {boolean} includeLinks - True to include links.
     * @param {TfvcInterfaces.TfvcVersionDescriptor} versionDescriptor
     */
    getItems(project, scopePath, recursionLevel, includeLinks, versionDescriptor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    scopePath: scopePath,
                    recursionLevel: recursionLevel,
                    includeLinks: includeLinks,
                    versionDescriptor: versionDescriptor,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "ba9fc436-9a38-4578-89d6-e4f3241f5040", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcItem, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get Item Metadata and/or Content for a single item. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content which is always returned as a download.
     *
     * @param {string} path - Version control path of an individual item to return.
     * @param {string} project - Project ID or project name
     * @param {string} fileName - file name of item returned.
     * @param {boolean} download - If true, create a downloadable attachment.
     * @param {string} scopePath - Version control path of a folder to return multiple items.
     * @param {TfvcInterfaces.VersionControlRecursionType} recursionLevel - None (just the item), or OneLevel (contents of a folder).
     * @param {TfvcInterfaces.TfvcVersionDescriptor} versionDescriptor
     */
    getItemText(path, project, fileName, download, scopePath, recursionLevel, versionDescriptor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    path: path,
                    fileName: fileName,
                    download: download,
                    scopePath: scopePath,
                    recursionLevel: recursionLevel,
                    versionDescriptor: versionDescriptor,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "ba9fc436-9a38-4578-89d6-e4f3241f5040", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let apiVersion = verData.apiVersion;
                    let accept = this.createAcceptHeader("text/plain", apiVersion);
                    resolve((yield this.http.get(url, { "Accept": accept })).message);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get Item Metadata and/or Content for a single item. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content which is always returned as a download.
     *
     * @param {string} path - Version control path of an individual item to return.
     * @param {string} project - Project ID or project name
     * @param {string} fileName - file name of item returned.
     * @param {boolean} download - If true, create a downloadable attachment.
     * @param {string} scopePath - Version control path of a folder to return multiple items.
     * @param {TfvcInterfaces.VersionControlRecursionType} recursionLevel - None (just the item), or OneLevel (contents of a folder).
     * @param {TfvcInterfaces.TfvcVersionDescriptor} versionDescriptor
     */
    getItemZip(path, project, fileName, download, scopePath, recursionLevel, versionDescriptor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    path: path,
                    fileName: fileName,
                    download: download,
                    scopePath: scopePath,
                    recursionLevel: recursionLevel,
                    versionDescriptor: versionDescriptor,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "ba9fc436-9a38-4578-89d6-e4f3241f5040", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let apiVersion = verData.apiVersion;
                    let accept = this.createAcceptHeader("application/zip", apiVersion);
                    resolve((yield this.http.get(url, { "Accept": accept })).message);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get items under a label.
     *
     * @param {string} labelId - Unique identifier of label
     * @param {number} top - Max number of items to return
     * @param {number} skip - Number of items to skip
     */
    getLabelItems(labelId, top, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    labelId: labelId
                };
                let queryValues = {
                    '$top': top,
                    '$skip': skip,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "06166e34-de17-4b60-8cd1-23182a346fda", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcItem, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a single deep label.
     *
     * @param {string} labelId - Unique identifier of label
     * @param {TfvcInterfaces.TfvcLabelRequestData} requestData - maxItemCount
     * @param {string} project - Project ID or project name
     */
    getLabel(labelId, requestData, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    labelId: labelId
                };
                let queryValues = {
                    requestData: requestData,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "a5d9bd7f-b661-4d0e-b9be-d9c16affae54", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcLabel, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a collection of shallow label references.
     *
     * @param {TfvcInterfaces.TfvcLabelRequestData} requestData - labelScope, name, owner, and itemLabelFilter
     * @param {string} project - Project ID or project name
     * @param {number} top - Max number of labels to return
     * @param {number} skip - Number of labels to skip
     */
    getLabels(requestData, project, top, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    requestData: requestData,
                    '$top': top,
                    '$skip': skip,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "a5d9bd7f-b661-4d0e-b9be-d9c16affae54", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcLabelRef, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get changes included in a shelveset.
     *
     * @param {string} shelvesetId - Shelveset's unique ID
     * @param {number} top - Max number of changes to return
     * @param {number} skip - Number of changes to skip
     */
    getShelvesetChanges(shelvesetId, top, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    shelvesetId: shelvesetId,
                    '$top': top,
                    '$skip': skip,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "dbaf075b-0445-4c34-9e5b-82292f856522", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcChange, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a single deep shelveset.
     *
     * @param {string} shelvesetId - Shelveset's unique ID
     * @param {TfvcInterfaces.TfvcShelvesetRequestData} requestData - includeDetails, includeWorkItems, maxChangeCount, and maxCommentLength
     */
    getShelveset(shelvesetId, requestData) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    shelvesetId: shelvesetId,
                    requestData: requestData,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "e36d44fb-e907-4b0a-b194-f83f1ed32ad3", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcShelveset, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Return a collection of shallow shelveset references.
     *
     * @param {TfvcInterfaces.TfvcShelvesetRequestData} requestData - name, owner, and maxCommentLength
     * @param {number} top - Max number of shelvesets to return
     * @param {number} skip - Number of shelvesets to skip
     */
    getShelvesets(requestData, top, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    requestData: requestData,
                    '$top': top,
                    '$skip': skip,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "e36d44fb-e907-4b0a-b194-f83f1ed32ad3", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TfvcInterfaces.TypeInfo.TfvcShelvesetRef, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get work items associated with a shelveset.
     *
     * @param {string} shelvesetId - Shelveset's unique ID
     */
    getShelvesetWorkItems(shelvesetId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    shelvesetId: shelvesetId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "tfvc", "a7a0c1c1-373e-425a-b031-a519474d743d", routeValues, queryValues);
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
}
exports.TfvcApi = TfvcApi;
