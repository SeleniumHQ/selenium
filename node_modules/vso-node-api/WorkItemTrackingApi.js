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
const WorkItemTrackingInterfaces = require("./interfaces/WorkItemTrackingInterfaces");
class WorkItemTrackingApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-WorkItemTracking-api', options);
    }
    /**
     * INTERNAL ONLY: USED BY ACCOUNT MY WORK PAGE. This returns Doing, Done, Follows and activity work items details.
     *
     * @param {WorkItemTrackingInterfaces.QueryOption} queryOption
     */
    getAccountMyWorkData(queryOption) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    '$queryOption': queryOption,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "def3d688-ddf5-4096-9024-69beea15cdbd", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.AccountMyWorkResult, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * INTERNAL ONLY: USED BY ACCOUNT MY WORK PAGE. This returns Doing, Done, Follows and activity work items details.
     *
     */
    getRecentActivityData() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "1bc988f4-c15f-4072-ad35-497c87e3a909", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.AccountRecentActivityWorkItemModel, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * INTERNAL ONLY: USED BY ACCOUNT MY WORK PAGE.
     *
     */
    getRecentMentions() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "d60eeb6e-e18c-4478-9e94-a0094e28f41c", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.AccountRecentMentionWorkItemModel, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get the list of work item tracking outbound artifact link types.
     *
     */
    getWorkArtifactLinkTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "1a31de40-e318-41cd-a6c6-881077df52e3", routeValues);
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
     * Queries work items linked to a given list of artifact URI.
     *
     * @param {WorkItemTrackingInterfaces.ArtifactUriQuery} artifactUriQuery - Defines a list of artifact URI for querying work items.
     */
    queryWorkItemsForArtifactUris(artifactUriQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "a9a9aa7a-8c09-44d3-ad1b-46e855c1e3d3", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, artifactUriQuery, options);
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
     * Uploads an attachment.
     *
     * @param {NodeJS.ReadableStream} contentStream - Content to upload
     * @param {string} fileName - The name of the file
     * @param {string} uploadType - Attachment upload type: Simple or Chunked
     * @param {string} areaPath - Target project Area Path
     */
    createAttachment(customHeaders, contentStream, fileName, uploadType, areaPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    fileName: fileName,
                    uploadType: uploadType,
                    areaPath: areaPath,
                };
                customHeaders = customHeaders || {};
                customHeaders["Content-Type"] = "application/octet-stream";
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "e07b5fa4-1499-494d-a496-64b860fd64ff", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    options.additionalHeaders = customHeaders;
                    let res;
                    res = yield this.rest.uploadStream("POST", url, contentStream, options);
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
     * Downloads an attachment.
     *
     * @param {string} id - Attachment ID
     * @param {string} fileName - Name of the file
     */
    getAttachmentContent(id, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                let queryValues = {
                    fileName: fileName,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "e07b5fa4-1499-494d-a496-64b860fd64ff", routeValues, queryValues);
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
     * Downloads an attachment.
     *
     * @param {string} id - Attachment ID
     * @param {string} fileName - Name of the file
     */
    getAttachmentZip(id, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                let queryValues = {
                    fileName: fileName,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "e07b5fa4-1499-494d-a496-64b860fd64ff", routeValues, queryValues);
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
     * Gets root classification nodes under the project.
     *
     * @param {string} project - Project ID or project name
     * @param {number} depth - Depth of children to fetch.
     */
    getRootNodes(project, depth) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    '$depth': depth,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "a70579d1-f53a-48ee-a5be-7be8659023b9", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.WorkItemClassificationNode, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Create new or update an existing classification node.
     *
     * @param {WorkItemTrackingInterfaces.WorkItemClassificationNode} postedNode - Node to create or update.
     * @param {string} project - Project ID or project name
     * @param {WorkItemTrackingInterfaces.TreeStructureGroup} structureGroup - Structure group of the classification node, area or iteration.
     * @param {string} path - Path of the classification node.
     */
    createOrUpdateClassificationNode(postedNode, project, structureGroup, path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    structureGroup: structureGroup,
                    path: path
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "5a172953-1b41-49d3-840a-33f79c3ce89f", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, postedNode, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.WorkItemClassificationNode, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Delete an existing classification node.
     *
     * @param {string} project - Project ID or project name
     * @param {WorkItemTrackingInterfaces.TreeStructureGroup} structureGroup - Structure group of the classification node, area or iteration.
     * @param {string} path - Path of the classification node.
     * @param {number} reclassifyId - Id of the target classification node for reclassification.
     */
    deleteClassificationNode(project, structureGroup, path, reclassifyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    structureGroup: structureGroup,
                    path: path
                };
                let queryValues = {
                    '$reclassifyId': reclassifyId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "5a172953-1b41-49d3-840a-33f79c3ce89f", routeValues, queryValues);
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
     * Gets the classification node for a given node path.
     *
     * @param {string} project - Project ID or project name
     * @param {WorkItemTrackingInterfaces.TreeStructureGroup} structureGroup - Structure group of the classification node, area or iteration.
     * @param {string} path - Path of the classification node.
     * @param {number} depth - Depth of children to fetch.
     */
    getClassificationNode(project, structureGroup, path, depth) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    structureGroup: structureGroup,
                    path: path
                };
                let queryValues = {
                    '$depth': depth,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "5a172953-1b41-49d3-840a-33f79c3ce89f", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.WorkItemClassificationNode, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update an existing classification node.
     *
     * @param {WorkItemTrackingInterfaces.WorkItemClassificationNode} postedNode - Node to create or update.
     * @param {string} project - Project ID or project name
     * @param {WorkItemTrackingInterfaces.TreeStructureGroup} structureGroup - Structure group of the classification node, area or iteration.
     * @param {string} path - Path of the classification node.
     */
    updateClassificationNode(postedNode, project, structureGroup, path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    structureGroup: structureGroup,
                    path: path
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "5a172953-1b41-49d3-840a-33f79c3ce89f", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, postedNode, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.WorkItemClassificationNode, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets a comment for a work item at the specified revision.
     *
     * @param {number} id - Work item id
     * @param {number} revision - Revision for which the comment need to be fetched
     */
    getComment(id, revision) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id,
                    revision: revision
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "19335ae7-22f7-4308-93d8-261f9384b7cf", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.WorkItemComment, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets the specified number of comments for a work item from the specified revision.
     *
     * @param {number} id - Work item id
     * @param {number} fromRevision - Revision from which comments are to be fetched
     * @param {number} top - The number of comments to return
     * @param {WorkItemTrackingInterfaces.CommentSortOrder} order - Ascending or descending by revision id
     */
    getComments(id, fromRevision, top, order) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                let queryValues = {
                    fromRevision: fromRevision,
                    '$top': top,
                    order: order,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "19335ae7-22f7-4308-93d8-261f9384b7cf", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.WorkItemComments, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Deletes the field.
     *
     * @param {string} fieldNameOrRefName - Field simple name or reference name
     * @param {string} project - Project ID or project name
     */
    deleteField(fieldNameOrRefName, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    fieldNameOrRefName: fieldNameOrRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "b51fd764-e5c2-4b9b-aaf7-3395cf4bdd94", routeValues);
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
     * Gets information on a specific field.
     *
     * @param {string} fieldNameOrRefName - Field simple name or reference name
     * @param {string} project - Project ID or project name
     */
    getField(fieldNameOrRefName, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    fieldNameOrRefName: fieldNameOrRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "b51fd764-e5c2-4b9b-aaf7-3395cf4bdd94", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.WorkItemField, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Returns information for all fields.
     *
     * @param {string} project - Project ID or project name
     * @param {WorkItemTrackingInterfaces.GetFieldsExpand} expand - Use ExtensionFields to include extension fields, otherwise exclude them. Unless the feature flag for this parameter is enabled, extension fields are always included.
     */
    getFields(project, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    '$expand': expand,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "b51fd764-e5c2-4b9b-aaf7-3395cf4bdd94", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.WorkItemField, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Updates the field.
     *
     * @param {WorkItemTrackingInterfaces.WorkItemField} workItemField - New field definition
     * @param {string} fieldNameOrRefName - Field simple name or reference name
     * @param {string} project - Project ID or project name
     */
    updateField(workItemField, fieldNameOrRefName, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    fieldNameOrRefName: fieldNameOrRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "b51fd764-e5c2-4b9b-aaf7-3395cf4bdd94", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, workItemField, options);
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
     * Creates a query, or moves a query.
     *
     * @param {WorkItemTrackingInterfaces.QueryHierarchyItem} postedQuery - The query to create.
     * @param {string} project - Project ID or project name
     * @param {string} query - The parent path for the query to create.
     */
    createQuery(postedQuery, project, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    query: query
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "a67d190c-c41f-424b-814d-0e906f659301", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, postedQuery, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.QueryHierarchyItem, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Delete a query or a folder
     *
     * @param {string} project - Project ID or project name
     * @param {string} query - ID or path of the query or folder to delete.
     */
    deleteQuery(project, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    query: query
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "a67d190c-c41f-424b-814d-0e906f659301", routeValues);
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
     * Gets the root queries and their children
     *
     * @param {string} project - Project ID or project name
     * @param {WorkItemTrackingInterfaces.QueryExpand} expand - Include the query string (wiql), clauses, query result columns, and sort options in the results.
     * @param {number} depth - In the folder of queries, return child queries and folders to this depth.
     * @param {boolean} includeDeleted - Include deleted queries and folders
     */
    getQueries(project, expand, depth, includeDeleted) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    '$expand': expand,
                    '$depth': depth,
                    '$includeDeleted': includeDeleted,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "a67d190c-c41f-424b-814d-0e906f659301", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.QueryHierarchyItem, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieves an individual query and its children
     *
     * @param {string} project - Project ID or project name
     * @param {string} query
     * @param {WorkItemTrackingInterfaces.QueryExpand} expand - Include the query string (wiql), clauses, query result columns, and sort options in the results.
     * @param {number} depth - In the folder of queries, return child queries and folders to this depth.
     * @param {boolean} includeDeleted - Include deleted queries and folders
     */
    getQuery(project, query, expand, depth, includeDeleted) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    query: query
                };
                let queryValues = {
                    '$expand': expand,
                    '$depth': depth,
                    '$includeDeleted': includeDeleted,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "a67d190c-c41f-424b-814d-0e906f659301", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.QueryHierarchyItem, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Searches all queries the user has access to in the current project
     *
     * @param {string} project - Project ID or project name
     * @param {string} filter - The text to filter the queries with.
     * @param {number} top - The number of queries to return (Default is 50 and maximum is 200).
     * @param {WorkItemTrackingInterfaces.QueryExpand} expand
     * @param {boolean} includeDeleted - Include deleted queries and folders
     */
    searchQueries(project, filter, top, expand, includeDeleted) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    '$filter': filter,
                    '$top': top,
                    '$expand': expand,
                    '$includeDeleted': includeDeleted,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "a67d190c-c41f-424b-814d-0e906f659301", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.QueryHierarchyItemsResult, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update a query or a folder. This allows you to update, rename and move queries and folders.
     *
     * @param {WorkItemTrackingInterfaces.QueryHierarchyItem} queryUpdate - The query to update.
     * @param {string} project - Project ID or project name
     * @param {string} query - The path for the query to update.
     * @param {boolean} undeleteDescendants - Undelete the children of this folder.
     */
    updateQuery(queryUpdate, project, query, undeleteDescendants) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    query: query
                };
                let queryValues = {
                    '$undeleteDescendants': undeleteDescendants,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "a67d190c-c41f-424b-814d-0e906f659301", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, queryUpdate, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.QueryHierarchyItem, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Destroys the specified work item permanently from the Recycle Bin. This action can not be undone.
     *
     * @param {number} id - ID of the work item to be destroyed permanently
     * @param {string} project - Project ID or project name
     */
    destroyWorkItem(id, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    id: id
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "b70d8d39-926c-465e-b927-b1bf0e5ca0e0", routeValues);
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
     * Gets a deleted work item from Recycle Bin.
     *
     * @param {number} id - ID of the work item to be returned
     * @param {string} project - Project ID or project name
     */
    getDeletedWorkItem(id, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    id: id
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "b70d8d39-926c-465e-b927-b1bf0e5ca0e0", routeValues);
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
     * Gets a list of the IDs and the URLs of the deleted the work items in the Recycle Bin.
     *
     * @param {string} project - Project ID or project name
     */
    getDeletedWorkItemReferences(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "b70d8d39-926c-465e-b927-b1bf0e5ca0e0", routeValues);
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
     * Gets the work items from the recycle bin, whose IDs have been specified in the parameters
     *
     * @param {number[]} ids - Comma separated list of IDs of the deleted work items to be returned
     * @param {string} project - Project ID or project name
     */
    getDeletedWorkItems(ids, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    ids: ids && ids.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "b70d8d39-926c-465e-b927-b1bf0e5ca0e0", routeValues, queryValues);
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
     * Restores the deleted work item from Recycle Bin.
     *
     * @param {WorkItemTrackingInterfaces.WorkItemDeleteUpdate} payload - Paylod with instructions to update the IsDeleted flag to false
     * @param {number} id - ID of the work item to be restored
     * @param {string} project - Project ID or project name
     */
    restoreWorkItem(payload, id, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    id: id
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "b70d8d39-926c-465e-b927-b1bf0e5ca0e0", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, payload, options);
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
     * Returns a fully hydrated work item for the requested revision
     *
     * @param {number} id
     * @param {number} revisionNumber
     * @param {WorkItemTrackingInterfaces.WorkItemExpand} expand
     */
    getRevision(id, revisionNumber, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id,
                    revisionNumber: revisionNumber
                };
                let queryValues = {
                    '$expand': expand,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "a00c85a5-80fa-4565-99c3-bcd2181434bb", routeValues, queryValues);
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
     * Returns the list of fully hydrated work item revisions, paged.
     *
     * @param {number} id
     * @param {number} top
     * @param {number} skip
     * @param {WorkItemTrackingInterfaces.WorkItemExpand} expand
     */
    getRevisions(id, top, skip, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                let queryValues = {
                    '$top': top,
                    '$skip': skip,
                    '$expand': expand,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "a00c85a5-80fa-4565-99c3-bcd2181434bb", routeValues, queryValues);
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
     * Validates the fields values.
     *
     * @param {WorkItemTrackingInterfaces.FieldsToEvaluate} ruleEngineInput
     */
    evaluateRulesOnField(ruleEngineInput) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "1a3a1536-dca6-4509-b9c3-dd9bb2981506", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, ruleEngineInput, options);
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
     * Creates a template
     *
     * @param {WorkItemTrackingInterfaces.WorkItemTemplate} template - Template contents
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    createTemplate(template, teamContext) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "6a90345f-a676-4969-afce-8e163e1d5642", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, template, options);
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
     * Gets template
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} workitemtypename - Optional, When specified returns templates for given Work item type.
     */
    getTemplates(teamContext, workitemtypename) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                let queryValues = {
                    workitemtypename: workitemtypename,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "6a90345f-a676-4969-afce-8e163e1d5642", routeValues, queryValues);
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
     * Deletes the template with given id
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} templateId - Template id
     */
    deleteTemplate(teamContext, templateId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    templateId: templateId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "fb10264a-8836-48a0-8033-1b0ccd2748d5", routeValues);
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
     * Gets the template with specified id
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} templateId - Template Id
     */
    getTemplate(teamContext, templateId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    templateId: templateId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "fb10264a-8836-48a0-8033-1b0ccd2748d5", routeValues);
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
     * Replace template contents
     *
     * @param {WorkItemTrackingInterfaces.WorkItemTemplate} templateContent - Template contents to replace with
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} templateId - Template id
     */
    replaceTemplate(templateContent, teamContext, templateId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    templateId: templateId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "fb10264a-8836-48a0-8033-1b0ccd2748d5", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, templateContent, options);
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
     * Returns a single update for a work item
     *
     * @param {number} id
     * @param {number} updateNumber
     */
    getUpdate(id, updateNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id,
                    updateNumber: updateNumber
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "6570bf97-d02c-4a91-8d93-3abe9895b1a9", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.WorkItemUpdate, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Returns a the deltas between work item revisions
     *
     * @param {number} id
     * @param {number} top
     * @param {number} skip
     */
    getUpdates(id, top, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                let queryValues = {
                    '$top': top,
                    '$skip': skip,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "6570bf97-d02c-4a91-8d93-3abe9895b1a9", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.WorkItemUpdate, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets the results of the query given its WIQL.
     *
     * @param {WorkItemTrackingInterfaces.Wiql} wiql - The query containing the WIQL.
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {boolean} timePrecision - Whether or not to use time precision.
     * @param {number} top - The max number of results to return.
     */
    queryByWiql(wiql, teamContext, timePrecision, top) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                let queryValues = {
                    timePrecision: timePrecision,
                    '$top': top,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "1a9c53f7-f243-4447-b110-35ef023636e4", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, wiql, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.WorkItemQueryResult, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets the results of the query given the query ID.
     *
     * @param {string} id - The query ID.
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {boolean} timePrecision - Whether or not to use time precision.
     */
    queryById(id, teamContext, timePrecision) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    id: id
                };
                let queryValues = {
                    timePrecision: timePrecision,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "a02355f5-5f8a-4671-8e32-369d23aac83d", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingInterfaces.TypeInfo.WorkItemQueryResult, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a work item icon given the friendly name and icon color.
     *
     * @param {string} icon - The name of the icon
     * @param {string} color - The 6-digit hex color for the icon
     * @param {number} v - The version of the icon (used only for cache invalidation)
     */
    getWorkItemIconJson(icon, color, v) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    icon: icon
                };
                let queryValues = {
                    color: color,
                    v: v,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "4e1eb4a5-1970-4228-a682-ec48eb2dca30", routeValues, queryValues);
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
     * Get a list of all work item icons.
     *
     */
    getWorkItemIcons() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "4e1eb4a5-1970-4228-a682-ec48eb2dca30", routeValues);
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
     * Get a work item icon given the friendly name and icon color.
     *
     * @param {string} icon - The name of the icon
     * @param {string} color - The 6-digit hex color for the icon
     * @param {number} v - The version of the icon (used only for cache invalidation)
     */
    getWorkItemIconSvg(icon, color, v) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    icon: icon
                };
                let queryValues = {
                    color: color,
                    v: v,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "4e1eb4a5-1970-4228-a682-ec48eb2dca30", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let apiVersion = verData.apiVersion;
                    let accept = this.createAcceptHeader("image/svg+xml", apiVersion);
                    resolve((yield this.http.get(url, { "Accept": accept })).message);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a batch of work item links
     *
     * @param {string} project - Project ID or project name
     * @param {string[]} types - A list of types to filter the results to specific work item types. Omit this parameter to get work item links of all work item types.
     * @param {string} continuationToken - Specifies the continuationToken to start the batch from. Omit this parameter to get the first batch of links.
     * @param {Date} startDateTime - Date/time to use as a starting point for link changes. Only link changes that occurred after that date/time will be returned. Cannot be used in conjunction with 'watermark' parameter.
     */
    getReportingLinks(project, types, continuationToken, startDateTime) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    types: types && types.join(","),
                    continuationToken: continuationToken,
                    startDateTime: startDateTime,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "b5b5b6d0-0308-40a1-b3f4-b9bb3c66878f", routeValues, queryValues);
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
     * Gets the work item relation type definition.
     *
     * @param {string} relation - The relation name
     */
    getRelationType(relation) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    relation: relation
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "f5d33bc9-5b49-4a3c-a9bd-f3cd46dd2165", routeValues);
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
     * Gets the work item relation types.
     *
     */
    getRelationTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "f5d33bc9-5b49-4a3c-a9bd-f3cd46dd2165", routeValues);
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
     * Get a batch of work item revisions with the option of including deleted items
     *
     * @param {string} project - Project ID or project name
     * @param {string[]} fields - A list of fields to return in work item revisions. Omit this parameter to get all reportable fields.
     * @param {string[]} types - A list of types to filter the results to specific work item types. Omit this parameter to get work item revisions of all work item types.
     * @param {string} continuationToken - Specifies the watermark to start the batch from. Omit this parameter to get the first batch of revisions.
     * @param {Date} startDateTime - Date/time to use as a starting point for revisions, all revisions will occur after this date/time. Cannot be used in conjunction with 'watermark' parameter.
     * @param {boolean} includeIdentityRef - Return an identity reference instead of a string value for identity fields.
     * @param {boolean} includeDeleted - Specify if the deleted item should be returned.
     * @param {boolean} includeTagRef - Specify if the tag objects should be returned for System.Tags field.
     * @param {boolean} includeLatestOnly - Return only the latest revisions of work items, skipping all historical revisions
     * @param {WorkItemTrackingInterfaces.ReportingRevisionsExpand} expand - Return all the fields in work item revisions, including long text fields which are not returned by default
     * @param {boolean} includeDiscussionChangesOnly - Return only the those revisions of work items, where only history field was changed
     * @param {number} maxPageSize - The maximum number of results to return in this batch
     */
    readReportingRevisionsGet(project, fields, types, continuationToken, startDateTime, includeIdentityRef, includeDeleted, includeTagRef, includeLatestOnly, expand, includeDiscussionChangesOnly, maxPageSize) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    fields: fields && fields.join(","),
                    types: types && types.join(","),
                    continuationToken: continuationToken,
                    startDateTime: startDateTime,
                    includeIdentityRef: includeIdentityRef,
                    includeDeleted: includeDeleted,
                    includeTagRef: includeTagRef,
                    includeLatestOnly: includeLatestOnly,
                    '$expand': expand,
                    includeDiscussionChangesOnly: includeDiscussionChangesOnly,
                    '$maxPageSize': maxPageSize,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "f828fe59-dd87-495d-a17c-7a8d6211ca6c", routeValues, queryValues);
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
     * Get a batch of work item revisions. This request may be used if your list of fields is large enough that it may run the URL over the length limit.
     *
     * @param {WorkItemTrackingInterfaces.ReportingWorkItemRevisionsFilter} filter - An object that contains request settings: field filter, type filter, identity format
     * @param {string} project - Project ID or project name
     * @param {string} continuationToken - Specifies the watermark to start the batch from. Omit this parameter to get the first batch of revisions.
     * @param {Date} startDateTime - Date/time to use as a starting point for revisions, all revisions will occur after this date/time. Cannot be used in conjunction with 'watermark' parameter.
     * @param {WorkItemTrackingInterfaces.ReportingRevisionsExpand} expand
     */
    readReportingRevisionsPost(filter, project, continuationToken, startDateTime, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    continuationToken: continuationToken,
                    startDateTime: startDateTime,
                    '$expand': expand,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "f828fe59-dd87-495d-a17c-7a8d6211ca6c", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, filter, options);
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
     * Deletes the specified work item and sends it to the Recycle Bin, so that it can be restored back, if required. Optionally, if the destroy parameter has been set to true, it destroys the work item permanently.
     *
     * @param {number} id - ID of the work item to be deleted
     * @param {boolean} destroy - Optional parameter, if set to true, the work item is deleted permanently
     */
    deleteWorkItem(id, destroy) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                let queryValues = {
                    destroy: destroy,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "72c7ddf8-2cdc-4f60-90cd-ab71c14a399b", routeValues, queryValues);
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
     * Returns a single work item.
     *
     * @param {number} id - The work item id
     * @param {string[]} fields - Comma-separated list of requested fields
     * @param {Date} asOf - AsOf UTC date time string
     * @param {WorkItemTrackingInterfaces.WorkItemExpand} expand - The expand parameters for work item attributes
     */
    getWorkItem(id, fields, asOf, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                let queryValues = {
                    fields: fields && fields.join(","),
                    asOf: asOf,
                    '$expand': expand,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "72c7ddf8-2cdc-4f60-90cd-ab71c14a399b", routeValues, queryValues);
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
     * Returns a list of work items.
     *
     * @param {number[]} ids - The comma-separated list of requested work item ids
     * @param {string[]} fields - Comma-separated list of requested fields
     * @param {Date} asOf - AsOf UTC date time string
     * @param {WorkItemTrackingInterfaces.WorkItemExpand} expand - The expand parameters for work item attributes
     * @param {WorkItemTrackingInterfaces.WorkItemErrorPolicy} errorPolicy - The flag to control error policy in a bulk get work items request
     */
    getWorkItems(ids, fields, asOf, expand, errorPolicy) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    ids: ids && ids.join(","),
                    fields: fields && fields.join(","),
                    asOf: asOf,
                    '$expand': expand,
                    errorPolicy: errorPolicy,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "72c7ddf8-2cdc-4f60-90cd-ab71c14a399b", routeValues, queryValues);
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
     * Updates a single work item.
     *
     * @param {VSSInterfaces.JsonPatchDocument} document - The JSON Patch document representing the update
     * @param {number} id - The id of the work item to update
     * @param {boolean} validateOnly - Indicate if you only want to validate the changes without saving the work item
     * @param {boolean} bypassRules - Do not enforce the work item type rules on this update
     * @param {boolean} suppressNotifications - Do not fire any notifications for this change
     */
    updateWorkItem(customHeaders, document, id, validateOnly, bypassRules, suppressNotifications) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    id: id
                };
                let queryValues = {
                    validateOnly: validateOnly,
                    bypassRules: bypassRules,
                    suppressNotifications: suppressNotifications,
                };
                customHeaders = customHeaders || {};
                customHeaders["Content-Type"] = "application/json-patch+json";
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "72c7ddf8-2cdc-4f60-90cd-ab71c14a399b", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    options.additionalHeaders = customHeaders;
                    let res;
                    res = yield this.rest.update(url, document, options);
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
     * Creates a single work item.
     *
     * @param {VSSInterfaces.JsonPatchDocument} document - The JSON Patch document representing the work item
     * @param {string} project - Project ID or project name
     * @param {string} type - The work item type of the work item to create
     * @param {boolean} validateOnly - Indicate if you only want to validate the changes without saving the work item
     * @param {boolean} bypassRules - Do not enforce the work item type rules on this update
     * @param {boolean} suppressNotifications - Do not fire any notifications for this change
     */
    createWorkItem(customHeaders, document, project, type, validateOnly, bypassRules, suppressNotifications) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    type: type
                };
                let queryValues = {
                    validateOnly: validateOnly,
                    bypassRules: bypassRules,
                    suppressNotifications: suppressNotifications,
                };
                customHeaders = customHeaders || {};
                customHeaders["Content-Type"] = "application/json-patch+json";
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "62d3d110-0047-428c-ad3c-4fe872c91c74", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    options.additionalHeaders = customHeaders;
                    let res;
                    res = yield this.rest.create(url, document, options);
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
     * Returns a single work item from a template.
     *
     * @param {string} project - Project ID or project name
     * @param {string} type - The work item type name
     * @param {string} fields - Comma-separated list of requested fields
     * @param {Date} asOf - AsOf UTC date time string
     * @param {WorkItemTrackingInterfaces.WorkItemExpand} expand - The expand parameters for work item attributes
     */
    getWorkItemTemplate(project, type, fields, asOf, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    type: type
                };
                let queryValues = {
                    fields: fields,
                    asOf: asOf,
                    '$expand': expand,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "62d3d110-0047-428c-ad3c-4fe872c91c74", routeValues, queryValues);
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
     * INTERNAL ONLY: It will be used for My account work experience. Get the work item type state color for multiple projects
     *
     * @param {string[]} projectNames
     */
    getWorkItemStateColors(projectNames) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "0b83df8a-3496-4ddb-ba44-63634f4cda61", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, projectNames, options);
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
     * Returns the next state on the given work item IDs.
     *
     * @param {number[]} ids - list of work item ids
     * @param {string} action - possible actions. Currently only supports checkin
     */
    getWorkItemNextStatesOnCheckinAction(ids, action) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    ids: ids && ids.join(","),
                    action: action,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "afae844b-e2f6-44c2-8053-17b3bb936a40", routeValues, queryValues);
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
     * Returns a the deltas between work item revisions.
     *
     * @param {string} project - Project ID or project name
     */
    getWorkItemTypeCategories(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "9b9f5734-36c8-415e-ba67-f83b45c31408", routeValues);
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
     * Returns a the deltas between work item revisions.
     *
     * @param {string} project - Project ID or project name
     * @param {string} category - The category name
     */
    getWorkItemTypeCategory(project, category) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    category: category
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "9b9f5734-36c8-415e-ba67-f83b45c31408", routeValues);
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
     * INTERNAL ONLY: It will be used for My account work experience. Get the wit type color for multiple projects
     *
     * @param {string[]} projectNames
     */
    getWorkItemTypeColors(projectNames) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "958fde80-115e-43fb-bd65-749c48057faf", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, projectNames, options);
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
     * INTERNAL ONLY: It is used for color and icon providers. Get the wit type color for multiple projects
     *
     * @param {string[]} projectNames
     */
    getWorkItemTypeColorAndIcons(projectNames) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "f0f8dc62-3975-48ce-8051-f636b68b52e3", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, projectNames, options);
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
     * Returns a work item type definition.
     *
     * @param {string} project - Project ID or project name
     * @param {string} type - Work item type name
     */
    getWorkItemType(project, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    type: type
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "7c8d7a76-4a09-43e8-b5df-bd792f4ac6aa", routeValues);
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
     * Returns the list of work item types
     *
     * @param {string} project - Project ID or project name
     */
    getWorkItemTypes(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "7c8d7a76-4a09-43e8-b5df-bd792f4ac6aa", routeValues);
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
     * Get field of a work item type.
     *
     * @param {string} project - Project ID or project name
     * @param {string} type - Work item type
     * @param {string} field
     * @param {WorkItemTrackingInterfaces.WorkItemTypeFieldsExpandLevel} expand - Expand level for the API response. Properties: to include allowedvalues, default value, isRequired etc. as a part of response; None: to skip these properties.
     */
    getWorkItemTypeField(project, type, field, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    type: type,
                    field: field
                };
                let queryValues = {
                    '$expand': expand,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "bd293ce5-3d25-4192-8e67-e8092e879efb", routeValues, queryValues);
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
     * Get a list of fields for a work Item type.
     *
     * @param {string} project - Project ID or project name
     * @param {string} type - Work item type.
     * @param {WorkItemTrackingInterfaces.WorkItemTypeFieldsExpandLevel} expand - Expand level for the API response. Properties: to include allowedvalues, default value, isRequired etc. as a part of response; None: to skip these properties.
     */
    getWorkItemTypeFields(project, type, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    type: type
                };
                let queryValues = {
                    '$expand': expand,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "wit", "bd293ce5-3d25-4192-8e67-e8092e879efb", routeValues, queryValues);
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
     * Returns the state names and colors for a work item type.
     *
     * @param {string} project - Project ID or project name
     * @param {string} type - The state name
     */
    getWorkItemTypeStates(project, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    type: type
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "7c9d7a76-4a09-43e8-b5df-bd792f4ac6aa", routeValues);
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
     * Export work item type
     *
     * @param {string} project - Project ID or project name
     * @param {string} type
     * @param {boolean} exportGlobalLists
     */
    exportWorkItemTypeDefinition(project, type, exportGlobalLists) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    type: type
                };
                let queryValues = {
                    exportGlobalLists: exportGlobalLists,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "8637ac8b-5eb6-4f90-b3f7-4f2ff576a459", routeValues, queryValues);
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
     * Add/updates a work item type
     *
     * @param {WorkItemTrackingInterfaces.WorkItemTypeTemplateUpdateModel} updateModel
     * @param {string} project - Project ID or project name
     */
    updateWorkItemTypeDefinition(updateModel, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "wit", "8637ac8b-5eb6-4f90-b3f7-4f2ff576a459", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, updateModel, options);
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
WorkItemTrackingApi.RESOURCE_AREA_ID = "5264459e-e5e0-4bd8-b118-0985e68a4ec5";
exports.WorkItemTrackingApi = WorkItemTrackingApi;
