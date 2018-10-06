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
const GitInterfaces = require("./interfaces/GitInterfaces");
class GitApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-Git-api', options);
    }
    /**
     * Create an annotated tag.
     *
     * @param {GitInterfaces.GitAnnotatedTag} tagObject - Object containing details of tag to be created.
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - ID or name of the repository.
     */
    createAnnotatedTag(tagObject, project, repositoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "5e8a8081-3851-4626-b677-9891cc04102e", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, tagObject, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitAnnotatedTag, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get an annotated tag.
     *
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - ID or name of the repository.
     * @param {string} objectId - ObjectId (Sha1Id) of tag to get.
     */
    getAnnotatedTag(project, repositoryId, objectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    objectId: objectId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "5e8a8081-3851-4626-b677-9891cc04102e", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitAnnotatedTag, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a single blob.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} sha1 - SHA1 hash of the file. You can get the SHA1 of a file using the “Git/Items/Get Item” endpoint.
     * @param {string} project - Project ID or project name
     * @param {boolean} download - If true, prompt for a download rather than rendering in a browser. Note: this value defaults to true if $format is zip
     * @param {string} fileName - Provide a fileName to use for a download.
     */
    getBlob(repositoryId, sha1, project, download, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    sha1: sha1
                };
                let queryValues = {
                    download: download,
                    fileName: fileName,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "7b28e929-2c99-405d-9c5c-6167a06e6816", routeValues, queryValues);
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
     * Get a single blob.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} sha1 - SHA1 hash of the file. You can get the SHA1 of a file using the “Git/Items/Get Item” endpoint.
     * @param {string} project - Project ID or project name
     * @param {boolean} download - If true, prompt for a download rather than rendering in a browser. Note: this value defaults to true if $format is zip
     * @param {string} fileName - Provide a fileName to use for a download.
     */
    getBlobContent(repositoryId, sha1, project, download, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    sha1: sha1
                };
                let queryValues = {
                    download: download,
                    fileName: fileName,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "7b28e929-2c99-405d-9c5c-6167a06e6816", routeValues, queryValues);
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
     * Gets one or more blobs in a zip file download.
     *
     * @param {string[]} blobIds - Blob IDs (SHA1 hashes) to be returned in the zip file.
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {string} filename
     */
    getBlobsZip(blobIds, repositoryId, project, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    filename: filename,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "7b28e929-2c99-405d-9c5c-6167a06e6816", routeValues, queryValues);
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
     * Get a single blob.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} sha1 - SHA1 hash of the file. You can get the SHA1 of a file using the “Git/Items/Get Item” endpoint.
     * @param {string} project - Project ID or project name
     * @param {boolean} download - If true, prompt for a download rather than rendering in a browser. Note: this value defaults to true if $format is zip
     * @param {string} fileName - Provide a fileName to use for a download.
     */
    getBlobZip(repositoryId, sha1, project, download, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    sha1: sha1
                };
                let queryValues = {
                    download: download,
                    fileName: fileName,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "7b28e929-2c99-405d-9c5c-6167a06e6816", routeValues, queryValues);
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
     * Retrieve statistics about a single branch.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} name - Name of the branch.
     * @param {string} project - Project ID or project name
     * @param {GitInterfaces.GitVersionDescriptor} baseVersionDescriptor - Identifies the commit or branch to use as the base.
     */
    getBranch(repositoryId, name, project, baseVersionDescriptor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    name: name,
                    baseVersionDescriptor: baseVersionDescriptor,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "d5b216de-d8d5-4d32-ae76-51df755b16d3", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitBranchStats, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve statistics about all branches within a repository.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {GitInterfaces.GitVersionDescriptor} baseVersionDescriptor - Identifies the commit or branch to use as the base.
     */
    getBranches(repositoryId, project, baseVersionDescriptor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    baseVersionDescriptor: baseVersionDescriptor,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "d5b216de-d8d5-4d32-ae76-51df755b16d3", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitBranchStats, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {GitInterfaces.GitQueryBranchStatsCriteria} searchCriteria
     * @param {string} repositoryId
     * @param {string} project - Project ID or project name
     */
    getBranchStatsBatch(searchCriteria, repositoryId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "d5b216de-d8d5-4d32-ae76-51df755b16d3", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, searchCriteria, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitBranchStats, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve changes for a particular commit.
     *
     * @param {string} commitId - The id of the commit.
     * @param {string} repositoryId - The id or friendly name of the repository. To use the friendly name, projectId must also be specified.
     * @param {string} project - Project ID or project name
     * @param {number} top - The maximum number of changes to return.
     * @param {number} skip - The number of changes to skip.
     */
    getChanges(commitId, repositoryId, project, top, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    commitId: commitId,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    top: top,
                    skip: skip,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "5bf884f5-3e07-42e9-afb8-1b872267bf16", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitCommitChanges, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Given a commitId, returns a list of commits that are in the same cherry-pick family.
     *
     * @param {string} repositoryNameOrId
     * @param {string} commitId
     * @param {string} project - Project ID or project name
     * @param {boolean} includeLinks
     */
    getCherryPickRelationships(repositoryNameOrId, commitId, project, includeLinks) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryNameOrId: repositoryNameOrId,
                    commitId: commitId
                };
                let queryValues = {
                    includeLinks: includeLinks,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "8af142a4-27c2-4168-9e82-46b8629aaa0d", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitCommitRef, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Cherry pick a specific commit or commits that are associated to a pull request into a new branch.
     *
     * @param {GitInterfaces.GitAsyncRefOperationParameters} cherryPickToCreate
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - ID of the repository.
     */
    createCherryPick(cherryPickToCreate, project, repositoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "033bad68-9a14-43d1-90e0-59cb8856fef6", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, cherryPickToCreate, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitCherryPick, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve information about a cherry pick by cherry pick Id.
     *
     * @param {string} project - Project ID or project name
     * @param {number} cherryPickId - ID of the cherry pick.
     * @param {string} repositoryId - ID of the repository.
     */
    getCherryPick(project, cherryPickId, repositoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    cherryPickId: cherryPickId,
                    repositoryId: repositoryId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "033bad68-9a14-43d1-90e0-59cb8856fef6", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitCherryPick, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve information about a cherry pick for a specific branch.
     *
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - ID of the repository.
     * @param {string} refName - The GitAsyncRefOperationParameters generatedRefName used for the cherry pick operation.
     */
    getCherryPickForRefName(project, repositoryId, refName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    refName: refName,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "033bad68-9a14-43d1-90e0-59cb8856fef6", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitCherryPick, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve a particular commit.
     *
     * @param {string} commitId - The id of the commit.
     * @param {string} repositoryId - The id or friendly name of the repository. To use the friendly name, projectId must also be specified.
     * @param {string} project - Project ID or project name
     * @param {number} changeCount - The number of changes to include in the result.
     */
    getCommit(commitId, repositoryId, project, changeCount) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    commitId: commitId,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    changeCount: changeCount,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "c2570c3b-5b3f-41b8-98bf-5407bfde8d58", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitCommit, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve git commits for a project
     *
     * @param {string} repositoryId - The id or friendly name of the repository. To use the friendly name, projectId must also be specified.
     * @param {GitInterfaces.GitQueryCommitsCriteria} searchCriteria
     * @param {string} project - Project ID or project name
     * @param {number} skip
     * @param {number} top
     */
    getCommits(repositoryId, searchCriteria, project, skip, top) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    searchCriteria: searchCriteria,
                    '$skip': skip,
                    '$top': top,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "c2570c3b-5b3f-41b8-98bf-5407bfde8d58", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitCommitRef, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve a list of commits associated with a particular push.
     *
     * @param {string} repositoryId - The id or friendly name of the repository. To use the friendly name, projectId must also be specified.
     * @param {number} pushId - The id of the push.
     * @param {string} project - Project ID or project name
     * @param {number} top - The maximum number of commits to return ("get the top x commits").
     * @param {number} skip - The number of commits to skip.
     * @param {boolean} includeLinks
     */
    getPushCommits(repositoryId, pushId, project, top, skip, includeLinks) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    pushId: pushId,
                    top: top,
                    skip: skip,
                    includeLinks: includeLinks,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "c2570c3b-5b3f-41b8-98bf-5407bfde8d58", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitCommitRef, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve git commits for a project matching the search criteria
     *
     * @param {GitInterfaces.GitQueryCommitsCriteria} searchCriteria - Search options
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {number} skip - Number of commits to skip.
     * @param {number} top - Maximum number of commits to return.
     * @param {boolean} includeStatuses - True to include additional commit status information.
     */
    getCommitsBatch(searchCriteria, repositoryId, project, skip, top, includeStatuses) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    '$skip': skip,
                    '$top': top,
                    includeStatuses: includeStatuses,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "6400dfb2-0bcb-462b-b992-5a57f8f1416c", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, searchCriteria, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitCommitRef, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve deleted git repositories.
     *
     * @param {string} project - Project ID or project name
     */
    getDeletedRepositories(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "2b6869c4-cb25-42b5-b7a3-0d3e6be0a11a", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitDeletedRepository, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve all forks of a repository in the collection.
     *
     * @param {string} repositoryNameOrId - The name or ID of the repository.
     * @param {string} collectionId - Team project collection ID.
     * @param {string} project - Project ID or project name
     * @param {boolean} includeLinks - True to include links.
     */
    getForks(repositoryNameOrId, collectionId, project, includeLinks) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryNameOrId: repositoryNameOrId,
                    collectionId: collectionId
                };
                let queryValues = {
                    includeLinks: includeLinks,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "158c0340-bf6f-489c-9625-d572a1480d57", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitRepositoryRef, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Request that another repository's refs be fetched into this one.
     *
     * @param {GitInterfaces.GitForkSyncRequestParameters} syncParams - Source repository and ref mapping.
     * @param {string} repositoryNameOrId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {boolean} includeLinks - True to include links
     */
    createForkSyncRequest(syncParams, repositoryNameOrId, project, includeLinks) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryNameOrId: repositoryNameOrId
                };
                let queryValues = {
                    includeLinks: includeLinks,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "1703f858-b9d1-46af-ab62-483e9e1055b5", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, syncParams, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitForkSyncRequest, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a specific fork sync operation's details.
     *
     * @param {string} repositoryNameOrId - The name or ID of the repository.
     * @param {number} forkSyncOperationId - OperationId of the sync request.
     * @param {string} project - Project ID or project name
     * @param {boolean} includeLinks - True to include links.
     */
    getForkSyncRequest(repositoryNameOrId, forkSyncOperationId, project, includeLinks) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryNameOrId: repositoryNameOrId,
                    forkSyncOperationId: forkSyncOperationId
                };
                let queryValues = {
                    includeLinks: includeLinks,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "1703f858-b9d1-46af-ab62-483e9e1055b5", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitForkSyncRequest, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve all requested fork sync operations on this repository.
     *
     * @param {string} repositoryNameOrId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {boolean} includeAbandoned - True to include abandoned requests.
     * @param {boolean} includeLinks - True to include links.
     */
    getForkSyncRequests(repositoryNameOrId, project, includeAbandoned, includeLinks) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryNameOrId: repositoryNameOrId
                };
                let queryValues = {
                    includeAbandoned: includeAbandoned,
                    includeLinks: includeLinks,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "1703f858-b9d1-46af-ab62-483e9e1055b5", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitForkSyncRequest, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Create an import request.
     *
     * @param {GitInterfaces.GitImportRequest} importRequest - The import request to create.
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - The name or ID of the repository.
     */
    createImportRequest(importRequest, project, repositoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "01828ddc-3600-4a41-8633-99b3a73a0eb3", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, importRequest, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitImportRequest, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve a particular import request.
     *
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {number} importRequestId - The unique identifier for the import request.
     */
    getImportRequest(project, repositoryId, importRequestId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    importRequestId: importRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "01828ddc-3600-4a41-8633-99b3a73a0eb3", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitImportRequest, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve import requests for a repository.
     *
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {boolean} includeAbandoned - True to include abandoned import requests in the results.
     */
    queryImportRequests(project, repositoryId, includeAbandoned) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    includeAbandoned: includeAbandoned,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "01828ddc-3600-4a41-8633-99b3a73a0eb3", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitImportRequest, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retry or abandon a failed import request.
     *
     * @param {GitInterfaces.GitImportRequest} importRequestToUpdate - The updated version of the import request. Currently, the only change allowed is setting the Status to Queued or Abandoned.
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {number} importRequestId - The unique identifier for the import request to update.
     */
    updateImportRequest(importRequestToUpdate, project, repositoryId, importRequestId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    importRequestId: importRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "01828ddc-3600-4a41-8633-99b3a73a0eb3", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, importRequestToUpdate, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitImportRequest, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get Item Metadata and/or Content for a single item. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content, which is always returned as a download.
     *
     * @param {string} repositoryId - The Id of the repository.
     * @param {string} path - The item path.
     * @param {string} project - Project ID or project name
     * @param {string} scopePath - The path scope.  The default is null.
     * @param {GitInterfaces.VersionControlRecursionType} recursionLevel - The recursion level of this request. The default is 'none', no recursion.
     * @param {boolean} includeContentMetadata - Set to true to include content metadata.  Default is false.
     * @param {boolean} latestProcessedChange - Set to true to include the lastest changes.  Default is false.
     * @param {boolean} download - Set to true to download the response as a file.  Default is false.
     * @param {GitInterfaces.GitVersionDescriptor} versionDescriptor - Version descriptor.  Default is null.
     */
    getItem(repositoryId, path, project, scopePath, recursionLevel, includeContentMetadata, latestProcessedChange, download, versionDescriptor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    path: path,
                    scopePath: scopePath,
                    recursionLevel: recursionLevel,
                    includeContentMetadata: includeContentMetadata,
                    latestProcessedChange: latestProcessedChange,
                    download: download,
                    versionDescriptor: versionDescriptor,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "fb93c0db-47ed-4a31-8c20-47552878fb44", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitItem, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get Item Metadata and/or Content for a single item. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content, which is always returned as a download.
     *
     * @param {string} repositoryId - The Id of the repository.
     * @param {string} path - The item path.
     * @param {string} project - Project ID or project name
     * @param {string} scopePath - The path scope.  The default is null.
     * @param {GitInterfaces.VersionControlRecursionType} recursionLevel - The recursion level of this request. The default is 'none', no recursion.
     * @param {boolean} includeContentMetadata - Set to true to include content metadata.  Default is false.
     * @param {boolean} latestProcessedChange - Set to true to include the lastest changes.  Default is false.
     * @param {boolean} download - Set to true to download the response as a file.  Default is false.
     * @param {GitInterfaces.GitVersionDescriptor} versionDescriptor - Version descriptor.  Default is null.
     */
    getItemContent(repositoryId, path, project, scopePath, recursionLevel, includeContentMetadata, latestProcessedChange, download, versionDescriptor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    path: path,
                    scopePath: scopePath,
                    recursionLevel: recursionLevel,
                    includeContentMetadata: includeContentMetadata,
                    latestProcessedChange: latestProcessedChange,
                    download: download,
                    versionDescriptor: versionDescriptor,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "fb93c0db-47ed-4a31-8c20-47552878fb44", routeValues, queryValues);
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
     * Get Item Metadata and/or Content for a collection of items. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content which is always returned as a download.
     *
     * @param {string} repositoryId - The Id of the repository.
     * @param {string} project - Project ID or project name
     * @param {string} scopePath - The path scope.  The default is null.
     * @param {GitInterfaces.VersionControlRecursionType} recursionLevel - The recursion level of this request. The default is 'none', no recursion.
     * @param {boolean} includeContentMetadata - Set to true to include content metadata.  Default is false.
     * @param {boolean} latestProcessedChange - Set to true to include the lastest changes.  Default is false.
     * @param {boolean} download - Set to true to download the response as a file.  Default is false.
     * @param {boolean} includeLinks - Set to true to include links to items.  Default is false.
     * @param {GitInterfaces.GitVersionDescriptor} versionDescriptor - Version descriptor.  Default is null.
     */
    getItems(repositoryId, project, scopePath, recursionLevel, includeContentMetadata, latestProcessedChange, download, includeLinks, versionDescriptor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    scopePath: scopePath,
                    recursionLevel: recursionLevel,
                    includeContentMetadata: includeContentMetadata,
                    latestProcessedChange: latestProcessedChange,
                    download: download,
                    includeLinks: includeLinks,
                    versionDescriptor: versionDescriptor,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "fb93c0db-47ed-4a31-8c20-47552878fb44", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitItem, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get Item Metadata and/or Content for a single item. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content, which is always returned as a download.
     *
     * @param {string} repositoryId - The Id of the repository.
     * @param {string} path - The item path.
     * @param {string} project - Project ID or project name
     * @param {string} scopePath - The path scope.  The default is null.
     * @param {GitInterfaces.VersionControlRecursionType} recursionLevel - The recursion level of this request. The default is 'none', no recursion.
     * @param {boolean} includeContentMetadata - Set to true to include content metadata.  Default is false.
     * @param {boolean} latestProcessedChange - Set to true to include the lastest changes.  Default is false.
     * @param {boolean} download - Set to true to download the response as a file.  Default is false.
     * @param {GitInterfaces.GitVersionDescriptor} versionDescriptor - Version descriptor.  Default is null.
     */
    getItemText(repositoryId, path, project, scopePath, recursionLevel, includeContentMetadata, latestProcessedChange, download, versionDescriptor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    path: path,
                    scopePath: scopePath,
                    recursionLevel: recursionLevel,
                    includeContentMetadata: includeContentMetadata,
                    latestProcessedChange: latestProcessedChange,
                    download: download,
                    versionDescriptor: versionDescriptor,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "fb93c0db-47ed-4a31-8c20-47552878fb44", routeValues, queryValues);
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
     * Get Item Metadata and/or Content for a single item. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content, which is always returned as a download.
     *
     * @param {string} repositoryId - The Id of the repository.
     * @param {string} path - The item path.
     * @param {string} project - Project ID or project name
     * @param {string} scopePath - The path scope.  The default is null.
     * @param {GitInterfaces.VersionControlRecursionType} recursionLevel - The recursion level of this request. The default is 'none', no recursion.
     * @param {boolean} includeContentMetadata - Set to true to include content metadata.  Default is false.
     * @param {boolean} latestProcessedChange - Set to true to include the lastest changes.  Default is false.
     * @param {boolean} download - Set to true to download the response as a file.  Default is false.
     * @param {GitInterfaces.GitVersionDescriptor} versionDescriptor - Version descriptor.  Default is null.
     */
    getItemZip(repositoryId, path, project, scopePath, recursionLevel, includeContentMetadata, latestProcessedChange, download, versionDescriptor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    path: path,
                    scopePath: scopePath,
                    recursionLevel: recursionLevel,
                    includeContentMetadata: includeContentMetadata,
                    latestProcessedChange: latestProcessedChange,
                    download: download,
                    versionDescriptor: versionDescriptor,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "fb93c0db-47ed-4a31-8c20-47552878fb44", routeValues, queryValues);
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
     * Post for retrieving a creating a batch out of a set of items in a repo / project given a list of paths or a long path
     *
     * @param {GitInterfaces.GitItemRequestData} requestData - Request data attributes: ItemDescriptors, IncludeContentMetadata, LatestProcessedChange, IncludeLinks. ItemDescriptors: Collection of items to fetch, including path, version, and recursion level. IncludeContentMetadata: Whether to include metadata for all items LatestProcessedChange: Whether to include shallow ref to commit that last changed each item. IncludeLinks: Whether to include the _links field on the shallow references.
     * @param {string} repositoryId - The name or ID of the repository
     * @param {string} project - Project ID or project name
     */
    getItemsBatch(requestData, repositoryId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "630fd2e4-fb88-4f85-ad21-13f3fd1fbca9", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, requestData, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitItem, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Find the merge bases of two commits, optionally across forks. If otherRepositoryId is not specified, the merge bases will only be calculated within the context of the local repositoryNameOrId.
     *
     * @param {string} repositoryNameOrId - ID or name of the local repository.
     * @param {string} commitId - First commit, usually the tip of the target branch of the potential merge.
     * @param {string} otherCommitId - Other commit, usually the tip of the source branch of the potential merge.
     * @param {string} project - Project ID or project name
     * @param {string} otherCollectionId - The collection ID where otherCommitId lives.
     * @param {string} otherRepositoryId - The repository ID where otherCommitId lives.
     */
    getMergeBases(repositoryNameOrId, commitId, otherCommitId, project, otherCollectionId, otherRepositoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryNameOrId: repositoryNameOrId,
                    commitId: commitId
                };
                let queryValues = {
                    otherCommitId: otherCommitId,
                    otherCollectionId: otherCollectionId,
                    otherRepositoryId: otherRepositoryId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "7cf2abb6-c964-4f7e-9872-f78c66e72e9c", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitCommitRef, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Attach a new file to a pull request.
     *
     * @param {NodeJS.ReadableStream} contentStream - Content to upload
     * @param {string} fileName - The name of the file.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    createAttachment(customHeaders, contentStream, fileName, repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    fileName: fileName,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                customHeaders = customHeaders || {};
                customHeaders["Content-Type"] = "application/octet-stream";
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "965d9361-878b-413b-a494-45d5b5fd8ab7", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    options.additionalHeaders = customHeaders;
                    let res;
                    res = yield this.rest.uploadStream("POST", url, contentStream, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.Attachment, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Delete a pull request attachment.
     *
     * @param {string} fileName - The name of the attachment to delete.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    deleteAttachment(fileName, repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    fileName: fileName,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "965d9361-878b-413b-a494-45d5b5fd8ab7", routeValues);
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
     * Get the file content of a pull request attachment.
     *
     * @param {string} fileName - The name of the attachment.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    getAttachmentContent(fileName, repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    fileName: fileName,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "965d9361-878b-413b-a494-45d5b5fd8ab7", routeValues);
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
     * Get a list of files attached to a given pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    getAttachments(repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "965d9361-878b-413b-a494-45d5b5fd8ab7", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.Attachment, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get the file content of a pull request attachment.
     *
     * @param {string} fileName - The name of the attachment.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    getAttachmentZip(fileName, repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    fileName: fileName,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "965d9361-878b-413b-a494-45d5b5fd8ab7", routeValues);
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
     * Add a like on a comment.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - The ID of the thread that contains the comment.
     * @param {number} commentId - The ID of the comment.
     * @param {string} project - Project ID or project name
     */
    createLike(repositoryId, pullRequestId, threadId, commentId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    threadId: threadId,
                    commentId: commentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "5f2e2851-1389-425b-a00b-fb2adb3ef31b", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, options);
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
     * Delete a like on a comment.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - The ID of the thread that contains the comment.
     * @param {number} commentId - The ID of the comment.
     * @param {string} project - Project ID or project name
     */
    deleteLike(repositoryId, pullRequestId, threadId, commentId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    threadId: threadId,
                    commentId: commentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "5f2e2851-1389-425b-a00b-fb2adb3ef31b", routeValues);
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
     * Get likes for a comment.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - The ID of the thread that contains the comment.
     * @param {number} commentId - The ID of the comment.
     * @param {string} project - Project ID or project name
     */
    getLikes(repositoryId, pullRequestId, threadId, commentId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    threadId: threadId,
                    commentId: commentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "5f2e2851-1389-425b-a00b-fb2adb3ef31b", routeValues);
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
     * Get the commits for the specified iteration of a pull request.
     *
     * @param {string} repositoryId - ID or name of the repository.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} iterationId - ID of the iteration from which to get the commits.
     * @param {string} project - Project ID or project name
     */
    getPullRequestIterationCommits(repositoryId, pullRequestId, iterationId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    iterationId: iterationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "e7ea0883-095f-4926-b5fb-f24691c26fb9", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitCommitRef, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get the commits for the specified pull request.
     *
     * @param {string} repositoryId - ID or name of the repository.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    getPullRequestCommits(repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "52823034-34a8-4576-922c-8d8b77e9e4c4", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitCommitRef, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve one conflict for a pull request by ID
     *
     * @param {string} repositoryId
     * @param {number} pullRequestId
     * @param {number} conflictId
     * @param {string} project - Project ID or project name
     */
    getPullRequestConflict(repositoryId, pullRequestId, conflictId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    conflictId: conflictId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "d840fb74-bbef-42d3-b250-564604c054a4", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitConflict, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve all conflicts for a pull request
     *
     * @param {string} repositoryId
     * @param {number} pullRequestId
     * @param {string} project - Project ID or project name
     * @param {number} skip
     * @param {number} top
     * @param {boolean} includeObsolete
     * @param {boolean} excludeResolved
     * @param {boolean} onlyResolved
     */
    getPullRequestConflicts(repositoryId, pullRequestId, project, skip, top, includeObsolete, excludeResolved, onlyResolved) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                let queryValues = {
                    '$skip': skip,
                    '$top': top,
                    includeObsolete: includeObsolete,
                    excludeResolved: excludeResolved,
                    onlyResolved: onlyResolved,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "d840fb74-bbef-42d3-b250-564604c054a4", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitConflict, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update merge conflict resolution
     *
     * @param {GitInterfaces.GitConflict} conflict
     * @param {string} repositoryId
     * @param {number} pullRequestId
     * @param {number} conflictId
     * @param {string} project - Project ID or project name
     */
    updatePullRequestConflict(conflict, repositoryId, pullRequestId, conflictId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    conflictId: conflictId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "d840fb74-bbef-42d3-b250-564604c054a4", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, conflict, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitConflict, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update multiple merge conflict resolutions
     *
     * @param {GitInterfaces.GitConflict[]} conflictUpdates
     * @param {string} repositoryId
     * @param {number} pullRequestId
     * @param {string} project - Project ID or project name
     */
    updatePullRequestConflicts(conflictUpdates, repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "d840fb74-bbef-42d3-b250-564604c054a4", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, conflictUpdates, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitConflictUpdateResult, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve the changes made in a pull request between two iterations.
     *
     * @param {string} repositoryId - The repository ID of the pull request's target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} iterationId - ID of the pull request iteration. <br /> Iteration IDs are zero-based with zero indicating the common commit between the source and target branches. Iteration one is the head of the source branch at the time the pull request is created and subsequent iterations are created when there are pushes to the source branch.
     * @param {string} project - Project ID or project name
     * @param {number} top - Optional. The number of changes to retrieve.  The default value is 100 and the maximum value is 2000.
     * @param {number} skip - Optional. The number of changes to ignore.  For example, to retrieve changes 101-150, set top 50 and skip to 100.
     * @param {number} compareTo - ID of the pull request iteration to compare against.  The default value is zero which indicates the comparison is made against the common commit between the source and target branches
     */
    getPullRequestIterationChanges(repositoryId, pullRequestId, iterationId, project, top, skip, compareTo) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    iterationId: iterationId
                };
                let queryValues = {
                    '$top': top,
                    '$skip': skip,
                    '$compareTo': compareTo,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "4216bdcf-b6b1-4d59-8b82-c34cc183fc8b", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequestIterationChanges, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get the specified iteration for a pull request.
     *
     * @param {string} repositoryId - ID or name of the repository.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} iterationId - ID of the pull request iteration to return.
     * @param {string} project - Project ID or project name
     */
    getPullRequestIteration(repositoryId, pullRequestId, iterationId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    iterationId: iterationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "d43911ee-6958-46b0-a42b-8445b8a0d004", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequestIteration, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get the list of iterations for the specified pull request.
     *
     * @param {string} repositoryId - ID or name of the repository.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     * @param {boolean} includeCommits - If true, include the commits associated with each iteration in the response.
     */
    getPullRequestIterations(repositoryId, pullRequestId, project, includeCommits) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                let queryValues = {
                    includeCommits: includeCommits,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "d43911ee-6958-46b0-a42b-8445b8a0d004", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequestIteration, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Create a pull request status on the iteration. This operation will have the same result as Create status on pull request with specified iteration ID in the request body.
     *
     * @param {GitInterfaces.GitPullRequestStatus} status - Pull request status to create.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} iterationId - ID of the pull request iteration.
     * @param {string} project - Project ID or project name
     */
    createPullRequestIterationStatus(status, repositoryId, pullRequestId, iterationId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    iterationId: iterationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "75cf11c5-979f-4038-a76e-058a06adf2bf", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, status, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequestStatus, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Delete pull request iteration status.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} iterationId - ID of the pull request iteration.
     * @param {number} statusId - ID of the pull request status.
     * @param {string} project - Project ID or project name
     */
    deletePullRequestIterationStatus(repositoryId, pullRequestId, iterationId, statusId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    iterationId: iterationId,
                    statusId: statusId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "75cf11c5-979f-4038-a76e-058a06adf2bf", routeValues);
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
     * Get the specific pull request iteration status by ID. The status ID is unique within the pull request across all iterations.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} iterationId - ID of the pull request iteration.
     * @param {number} statusId - ID of the pull request status.
     * @param {string} project - Project ID or project name
     */
    getPullRequestIterationStatus(repositoryId, pullRequestId, iterationId, statusId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    iterationId: iterationId,
                    statusId: statusId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "75cf11c5-979f-4038-a76e-058a06adf2bf", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequestStatus, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get all the statuses associated with a pull request iteration.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} iterationId - ID of the pull request iteration.
     * @param {string} project - Project ID or project name
     */
    getPullRequestIterationStatuses(repositoryId, pullRequestId, iterationId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    iterationId: iterationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "75cf11c5-979f-4038-a76e-058a06adf2bf", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequestStatus, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update pull request iteration statuses collection. The only supported operation type is `remove`.
     *
     * @param {VSSInterfaces.JsonPatchDocument} patchDocument - Operations to apply to the pull request statuses in JSON Patch format.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} iterationId - ID of the pull request iteration.
     * @param {string} project - Project ID or project name
     */
    updatePullRequestIterationStatuses(customHeaders, patchDocument, repositoryId, pullRequestId, iterationId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    iterationId: iterationId
                };
                customHeaders = customHeaders || {};
                customHeaders["Content-Type"] = "application/json-patch+json";
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "75cf11c5-979f-4038-a76e-058a06adf2bf", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    options.additionalHeaders = customHeaders;
                    let res;
                    res = yield this.rest.update(url, patchDocument, options);
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
     * Create a label for a specified pull request. The only required field is the name of the new label.
     *
     * @param {TfsCoreInterfaces.WebApiCreateTagRequestData} label - Label to assign to the pull request.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     * @param {string} projectId - Project ID or project name.
     */
    createPullRequestLabel(label, repositoryId, pullRequestId, project, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                let queryValues = {
                    projectId: projectId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "f22387e3-984e-4c52-9c6d-fbb8f14c812d", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, label, options);
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
     * Removes a label from the set of those assigned to the pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} labelIdOrName - The name or ID of the label requested.
     * @param {string} project - Project ID or project name
     * @param {string} projectId - Project ID or project name.
     */
    deletePullRequestLabels(repositoryId, pullRequestId, labelIdOrName, project, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    labelIdOrName: labelIdOrName
                };
                let queryValues = {
                    projectId: projectId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "f22387e3-984e-4c52-9c6d-fbb8f14c812d", routeValues, queryValues);
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
     * Retrieves a single label that has been assigned to a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} labelIdOrName - The name or ID of the label requested.
     * @param {string} project - Project ID or project name
     * @param {string} projectId - Project ID or project name.
     */
    getPullRequestLabel(repositoryId, pullRequestId, labelIdOrName, project, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    labelIdOrName: labelIdOrName
                };
                let queryValues = {
                    projectId: projectId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "f22387e3-984e-4c52-9c6d-fbb8f14c812d", routeValues, queryValues);
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
     * Get all the labels assigned to a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     * @param {string} projectId - Project ID or project name.
     */
    getPullRequestLabels(repositoryId, pullRequestId, project, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                let queryValues = {
                    projectId: projectId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "f22387e3-984e-4c52-9c6d-fbb8f14c812d", routeValues, queryValues);
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
     * Get external properties of the pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    getPullRequestProperties(repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "48a52185-5b9e-4736-9dc1-bb1e2feac80b", routeValues);
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
     * Create or update pull request external properties. The patch operation can be `add`, `replace` or `remove`. For `add` operation, the path can be empty. If the path is empty, the value must be a list of key value pairs. For `replace` operation, the path cannot be empty. If the path does not exist, the property will be added to the collection. For `remove` operation, the path cannot be empty. If the path does not exist, no action will be performed.
     *
     * @param {VSSInterfaces.JsonPatchDocument} patchDocument - Properties to add, replace or remove in JSON Patch format.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    updatePullRequestProperties(customHeaders, patchDocument, repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                customHeaders = customHeaders || {};
                customHeaders["Content-Type"] = "application/json-patch+json";
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "48a52185-5b9e-4736-9dc1-bb1e2feac80b", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    options.additionalHeaders = customHeaders;
                    let res;
                    res = yield this.rest.update(url, patchDocument, options);
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
     * This API is used to find what pull requests are related to a given commit.  It can be used to either find the pull request that created a particular merge commit or it can be used to find all pull requests that have ever merged a particular commit.  The input is a list of queries which each contain a list of commits. For each commit that you search against, you will get back a dictionary of commit -> pull requests.
     *
     * @param {GitInterfaces.GitPullRequestQuery} queries - The list of queries to perform.
     * @param {string} repositoryId - ID of the repository.
     * @param {string} project - Project ID or project name
     */
    getPullRequestQuery(queries, repositoryId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "b3a6eebe-9cf0-49ea-b6cb-1a4c5f5007b0", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, queries, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequestQuery, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Add a reviewer to a pull request or cast a vote.
     *
     * @param {GitInterfaces.IdentityRefWithVote} reviewer - Reviewer's vote.<br />If the reviewer's ID is included here, it must match the reviewerID parameter.<br />Reviewers can set their own vote with this method.  When adding other reviewers, vote must be set to zero.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} reviewerId - ID of the reviewer.
     * @param {string} project - Project ID or project name
     */
    createPullRequestReviewer(reviewer, repositoryId, pullRequestId, reviewerId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    reviewerId: reviewerId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "4b6702c7-aa35-4b89-9c96-b9abf6d3e540", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, reviewer, options);
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
     * Add reviewers to a pull request.
     *
     * @param {VSSInterfaces.IdentityRef[]} reviewers - Reviewers to add to the pull request.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    createPullRequestReviewers(reviewers, repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "4b6702c7-aa35-4b89-9c96-b9abf6d3e540", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, reviewers, options);
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
     * Remove a reviewer from a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} reviewerId - ID of the reviewer to remove.
     * @param {string} project - Project ID or project name
     */
    deletePullRequestReviewer(repositoryId, pullRequestId, reviewerId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    reviewerId: reviewerId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "4b6702c7-aa35-4b89-9c96-b9abf6d3e540", routeValues);
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
     * Retrieve information about a particular reviewer on a pull request
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} reviewerId - ID of the reviewer.
     * @param {string} project - Project ID or project name
     */
    getPullRequestReviewer(repositoryId, pullRequestId, reviewerId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    reviewerId: reviewerId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "4b6702c7-aa35-4b89-9c96-b9abf6d3e540", routeValues);
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
     * Retrieve the reviewers for a pull request
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    getPullRequestReviewers(repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "4b6702c7-aa35-4b89-9c96-b9abf6d3e540", routeValues);
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
     * Reset the votes of multiple reviewers on a pull request.
     *
     * @param {GitInterfaces.IdentityRefWithVote[]} patchVotes - IDs of the reviewers whose votes will be reset to zero
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request
     * @param {string} project - Project ID or project name
     */
    updatePullRequestReviewers(patchVotes, repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "4b6702c7-aa35-4b89-9c96-b9abf6d3e540", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, patchVotes, options);
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
     * Retrieve a pull request.
     *
     * @param {number} pullRequestId - The ID of the pull request to retrieve.
     */
    getPullRequestById(pullRequestId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "01a46dea-7d46-4d40-bc84-319e7c260d99", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequest, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve all pull requests matching a specified criteria.
     *
     * @param {string} project - Project ID or project name
     * @param {GitInterfaces.GitPullRequestSearchCriteria} searchCriteria - Pull requests will be returned that match this search criteria.
     * @param {number} maxCommentLength - Not used.
     * @param {number} skip - The number of pull requests to ignore. For example, to retrieve results 101-150, set top to 50 and skip to 100.
     * @param {number} top - The number of pull requests to retrieve.
     */
    getPullRequestsByProject(project, searchCriteria, maxCommentLength, skip, top) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    searchCriteria: searchCriteria,
                    maxCommentLength: maxCommentLength,
                    '$skip': skip,
                    '$top': top,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "a5d28130-9cd2-40fa-9f08-902e7daa9efb", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequest, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Create a pull request.
     *
     * @param {GitInterfaces.GitPullRequest} gitPullRequestToCreate - The pull request to create.
     * @param {string} repositoryId - The repository ID of the pull request's target branch.
     * @param {string} project - Project ID or project name
     * @param {boolean} supportsIterations - If true, subsequent pushes to the pull request will be individually reviewable. Set this to false for large pull requests for performance reasons if this functionality is not needed.
     */
    createPullRequest(gitPullRequestToCreate, repositoryId, project, supportsIterations) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    supportsIterations: supportsIterations,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "9946fd70-0d40-406e-b686-b4744cbbcc37", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, gitPullRequestToCreate, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequest, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request's target branch.
     * @param {number} pullRequestId - The ID of the pull request to retrieve.
     * @param {string} project - Project ID or project name
     * @param {number} maxCommentLength - Not used.
     * @param {number} skip - Not used.
     * @param {number} top - Not used.
     * @param {boolean} includeCommits - If true, the pull request will be returned with the associated commits.
     * @param {boolean} includeWorkItemRefs - If true, the pull request will be returned with the associated work item references.
     */
    getPullRequest(repositoryId, pullRequestId, project, maxCommentLength, skip, top, includeCommits, includeWorkItemRefs) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                let queryValues = {
                    maxCommentLength: maxCommentLength,
                    '$skip': skip,
                    '$top': top,
                    includeCommits: includeCommits,
                    includeWorkItemRefs: includeWorkItemRefs,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "9946fd70-0d40-406e-b686-b4744cbbcc37", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequest, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve all pull requests matching a specified criteria.
     *
     * @param {string} repositoryId - The repository ID of the pull request's target branch.
     * @param {GitInterfaces.GitPullRequestSearchCriteria} searchCriteria - Pull requests will be returned that match this search criteria.
     * @param {string} project - Project ID or project name
     * @param {number} maxCommentLength - Not used.
     * @param {number} skip - The number of pull requests to ignore. For example, to retrieve results 101-150, set top to 50 and skip to 100.
     * @param {number} top - The number of pull requests to retrieve.
     */
    getPullRequests(repositoryId, searchCriteria, project, maxCommentLength, skip, top) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    searchCriteria: searchCriteria,
                    maxCommentLength: maxCommentLength,
                    '$skip': skip,
                    '$top': top,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "9946fd70-0d40-406e-b686-b4744cbbcc37", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequest, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update a pull request.
     *
     * @param {GitInterfaces.GitPullRequest} gitPullRequestToUpdate - The pull request content to update.
     * @param {string} repositoryId - The repository ID of the pull request's target branch.
     * @param {number} pullRequestId - The ID of the pull request to retrieve.
     * @param {string} project - Project ID or project name
     */
    updatePullRequest(gitPullRequestToUpdate, repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "9946fd70-0d40-406e-b686-b4744cbbcc37", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, gitPullRequestToUpdate, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequest, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Sends an e-mail notification about a specific pull request to a set of recipients
     *
     * @param {GitInterfaces.ShareNotificationContext} userMessage
     * @param {string} repositoryId - ID of the git repository.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    sharePullRequest(userMessage, repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "696f3a82-47c9-487f-9117-b9d00972ca84", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, userMessage, options);
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
     * Create a pull request status.
     *
     * @param {GitInterfaces.GitPullRequestStatus} status - Pull request status to create.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    createPullRequestStatus(status, repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "b5f6bb4f-8d1e-4d79-8d11-4c9172c99c35", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, status, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequestStatus, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Delete pull request status.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} statusId - ID of the pull request status.
     * @param {string} project - Project ID or project name
     */
    deletePullRequestStatus(repositoryId, pullRequestId, statusId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    statusId: statusId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "b5f6bb4f-8d1e-4d79-8d11-4c9172c99c35", routeValues);
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
     * Get the specific pull request status by ID. The status ID is unique within the pull request across all iterations.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} statusId - ID of the pull request status.
     * @param {string} project - Project ID or project name
     */
    getPullRequestStatus(repositoryId, pullRequestId, statusId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    statusId: statusId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "b5f6bb4f-8d1e-4d79-8d11-4c9172c99c35", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequestStatus, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get all the statuses associated with a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    getPullRequestStatuses(repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "b5f6bb4f-8d1e-4d79-8d11-4c9172c99c35", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequestStatus, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update pull request statuses collection. The only supported operation type is `remove`.
     *
     * @param {VSSInterfaces.JsonPatchDocument} patchDocument - Operations to apply to the pull request statuses in JSON Patch format.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    updatePullRequestStatuses(customHeaders, patchDocument, repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                customHeaders = customHeaders || {};
                customHeaders["Content-Type"] = "application/json-patch+json";
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "b5f6bb4f-8d1e-4d79-8d11-4c9172c99c35", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    options.additionalHeaders = customHeaders;
                    let res;
                    res = yield this.rest.update(url, patchDocument, options);
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
     * Create a comment on a specific thread in a pull request.
     *
     * @param {GitInterfaces.Comment} comment - The comment to create.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - ID of the thread that the desired comment is in.
     * @param {string} project - Project ID or project name
     */
    createComment(comment, repositoryId, pullRequestId, threadId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    threadId: threadId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "965a3ec7-5ed8-455a-bdcb-835a5ea7fe7b", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, comment, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.Comment, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Delete a comment associated with a specific thread in a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - ID of the thread that the desired comment is in.
     * @param {number} commentId - ID of the comment.
     * @param {string} project - Project ID or project name
     */
    deleteComment(repositoryId, pullRequestId, threadId, commentId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    threadId: threadId,
                    commentId: commentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "965a3ec7-5ed8-455a-bdcb-835a5ea7fe7b", routeValues);
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
     * Retrieve a comment associated with a specific thread in a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - ID of the thread that the desired comment is in.
     * @param {number} commentId - ID of the comment.
     * @param {string} project - Project ID or project name
     */
    getComment(repositoryId, pullRequestId, threadId, commentId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    threadId: threadId,
                    commentId: commentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "965a3ec7-5ed8-455a-bdcb-835a5ea7fe7b", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.Comment, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve all comments associated with a specific thread in a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - ID of the thread.
     * @param {string} project - Project ID or project name
     */
    getComments(repositoryId, pullRequestId, threadId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    threadId: threadId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "965a3ec7-5ed8-455a-bdcb-835a5ea7fe7b", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.Comment, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update a comment associated with a specific thread in a pull request.
     *
     * @param {GitInterfaces.Comment} comment - The comment content that should be updated.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - ID of the thread that the desired comment is in.
     * @param {number} commentId - ID of the comment to update.
     * @param {string} project - Project ID or project name
     */
    updateComment(comment, repositoryId, pullRequestId, threadId, commentId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    threadId: threadId,
                    commentId: commentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "965a3ec7-5ed8-455a-bdcb-835a5ea7fe7b", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, comment, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.Comment, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Create a thread in a pull request.
     *
     * @param {GitInterfaces.GitPullRequestCommentThread} commentThread - The thread to create. Thread must contain at least one comment.
     * @param {string} repositoryId - Repository ID of the pull request's target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    createThread(commentThread, repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "ab6e2e5d-a0b7-4153-b64a-a4efe0d49449", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, commentThread, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequestCommentThread, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve a thread in a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request's target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - ID of the thread.
     * @param {string} project - Project ID or project name
     * @param {number} iteration - If specified, thread position will be tracked using this iteration as the right side of the diff.
     * @param {number} baseIteration - If specified, thread position will be tracked using this iteration as the left side of the diff.
     */
    getPullRequestThread(repositoryId, pullRequestId, threadId, project, iteration, baseIteration) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    threadId: threadId
                };
                let queryValues = {
                    '$iteration': iteration,
                    '$baseIteration': baseIteration,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "ab6e2e5d-a0b7-4153-b64a-a4efe0d49449", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequestCommentThread, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve all threads in a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request's target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     * @param {number} iteration - If specified, thread positions will be tracked using this iteration as the right side of the diff.
     * @param {number} baseIteration - If specified, thread positions will be tracked using this iteration as the left side of the diff.
     */
    getThreads(repositoryId, pullRequestId, project, iteration, baseIteration) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                let queryValues = {
                    '$iteration': iteration,
                    '$baseIteration': baseIteration,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "ab6e2e5d-a0b7-4153-b64a-a4efe0d49449", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequestCommentThread, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update a thread in a pull request.
     *
     * @param {GitInterfaces.GitPullRequestCommentThread} commentThread - The thread content that should be updated.
     * @param {string} repositoryId - The repository ID of the pull request's target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - ID of the thread to update.
     * @param {string} project - Project ID or project name
     */
    updateThread(commentThread, repositoryId, pullRequestId, threadId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId,
                    threadId: threadId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "ab6e2e5d-a0b7-4153-b64a-a4efe0d49449", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, commentThread, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPullRequestCommentThread, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve a list of work items associated with a pull request.
     *
     * @param {string} repositoryId - ID or name of the repository.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    getPullRequestWorkItems(repositoryId, pullRequestId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pullRequestId: pullRequestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "0a637fcc-5370-4ce8-b0e8-98091f5f9482", routeValues);
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
     * Push changes to the repository.
     *
     * @param {GitInterfaces.GitPush} push
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     */
    createPush(push, repositoryId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "git", "ea98d07b-3c87-4971-8ede-a613694ffb55", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, push, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPush, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieves a particular push.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {number} pushId - ID of the push.
     * @param {string} project - Project ID or project name
     * @param {number} includeCommits - The number of commits to include in the result.
     * @param {boolean} includeRefUpdates - If true, include the list of refs that were updated by the push.
     */
    getPush(repositoryId, pushId, project, includeCommits, includeRefUpdates) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    pushId: pushId
                };
                let queryValues = {
                    includeCommits: includeCommits,
                    includeRefUpdates: includeRefUpdates,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "git", "ea98d07b-3c87-4971-8ede-a613694ffb55", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPush, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieves pushes associated with the specified repository.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {number} skip - Number of pushes to skip.
     * @param {number} top - Number of pushes to return.
     * @param {GitInterfaces.GitPushSearchCriteria} searchCriteria - Search criteria attributes: fromDate, toDate, pusherId, refName, includeRefUpdates or includeLinks. fromDate: Start date to search from. toDate: End date to search to. pusherId: Identity of the person who submitted the push. refName: Branch name to consider. includeRefUpdates: If true, include the list of refs that were updated by the push. includeLinks: Whether to include the _links field on the shallow references.
     */
    getPushes(repositoryId, project, skip, top, searchCriteria) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    '$skip': skip,
                    '$top': top,
                    searchCriteria: searchCriteria,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "git", "ea98d07b-3c87-4971-8ede-a613694ffb55", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitPush, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Queries the provided repository for its refs and returns them.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {string} filter - [optional] A filter to apply to the refs.
     * @param {boolean} includeLinks - [optional] Specifies if referenceLinks should be included in the result. default is false.
     * @param {boolean} latestStatusesOnly - [optional] True to include only the tip commit status for each ref. This option requires `includeStatuses` to be true. The default value is false.
     */
    getRefs(repositoryId, project, filter, includeLinks, latestStatusesOnly) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    filter: filter,
                    includeLinks: includeLinks,
                    latestStatusesOnly: latestStatusesOnly,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "2d874a60-a811-4f62-9c9f-963a6ea0a55b", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitRef, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Lock or Unlock a branch.
     *
     * @param {GitInterfaces.GitRefUpdate} newRefInfo - The ref update action (lock/unlock) to perform
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} filter - The name of the branch to lock/unlock
     * @param {string} project - Project ID or project name
     * @param {string} projectId - ID or name of the team project. Optional if specifying an ID for repository.
     */
    updateRef(newRefInfo, repositoryId, filter, project, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    filter: filter,
                    projectId: projectId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "2d874a60-a811-4f62-9c9f-963a6ea0a55b", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, newRefInfo, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitRef, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Creating, updating, or deleting refs(branches).
     *
     * @param {GitInterfaces.GitRefUpdate[]} refUpdates - List of ref updates to attempt to perform
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {string} projectId - ID or name of the team project. Optional if specifying an ID for repository.
     */
    updateRefs(refUpdates, repositoryId, project, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    projectId: projectId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "2d874a60-a811-4f62-9c9f-963a6ea0a55b", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, refUpdates, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitRefUpdateResult, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Creates a ref favorite
     *
     * @param {GitInterfaces.GitRefFavorite} favorite - The ref favorite to create.
     * @param {string} project - Project ID or project name
     */
    createFavorite(favorite, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "876f70af-5792-485a-a1c7-d0a7b2f42bbb", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, favorite, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitRefFavorite, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Deletes the refs favorite specified
     *
     * @param {string} project - Project ID or project name
     * @param {number} favoriteId - The Id of the ref favorite to delete.
     */
    deleteRefFavorite(project, favoriteId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    favoriteId: favoriteId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "876f70af-5792-485a-a1c7-d0a7b2f42bbb", routeValues);
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
     * Gets the refs favorite for a favorite Id.
     *
     * @param {string} project - Project ID or project name
     * @param {number} favoriteId - The Id of the requested ref favorite.
     */
    getRefFavorite(project, favoriteId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    favoriteId: favoriteId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "876f70af-5792-485a-a1c7-d0a7b2f42bbb", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitRefFavorite, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets the refs favorites for a repo and an identity.
     *
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - The id of the repository.
     * @param {string} identityId - The id of the identity whose favorites are to be retrieved. If null, the requesting identity is used.
     */
    getRefFavorites(project, repositoryId, identityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    repositoryId: repositoryId,
                    identityId: identityId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "876f70af-5792-485a-a1c7-d0a7b2f42bbb", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitRefFavorite, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Create a git repository in a team project.
     *
     * @param {GitInterfaces.GitRepositoryCreateOptions} gitRepositoryToCreate - Specify the repo name, team project and/or parent repository
     * @param {string} project - Project ID or project name
     * @param {string} sourceRef - [optional] Specify the source refs to use while creating a fork repo
     */
    createRepository(gitRepositoryToCreate, project, sourceRef) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    sourceRef: sourceRef,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "225f7195-f9c7-4d14-ab28-a83f7ff77e1f", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, gitRepositoryToCreate, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitRepository, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Delete a git repository
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     */
    deleteRepository(repositoryId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "225f7195-f9c7-4d14-ab28-a83f7ff77e1f", routeValues);
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
     * Retrieve git repositories.
     *
     * @param {string} project - Project ID or project name
     * @param {boolean} includeLinks - [optional] True to include reference links. The default value is false.
     * @param {boolean} includeAllUrls - [optional] True to include all remote URLs. The default value is false.
     * @param {boolean} includeHidden - [optional] True to include hidden repositories. The default value is false.
     */
    getRepositories(project, includeLinks, includeAllUrls, includeHidden) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    includeLinks: includeLinks,
                    includeAllUrls: includeAllUrls,
                    includeHidden: includeHidden,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "225f7195-f9c7-4d14-ab28-a83f7ff77e1f", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitRepository, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve a git repository.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {boolean} includeParent - [optional] True to include parent repository. The default value is false.
     */
    getRepository(repositoryId, project, includeParent) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    includeParent: includeParent,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "225f7195-f9c7-4d14-ab28-a83f7ff77e1f", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitRepository, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Updates the Git repository with either a new repo name or a new default branch.
     *
     * @param {GitInterfaces.GitRepository} newRepositoryInfo - Specify a new repo name or a new default branch of the repository
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     */
    updateRepository(newRepositoryInfo, repositoryId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "225f7195-f9c7-4d14-ab28-a83f7ff77e1f", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, newRepositoryInfo, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitRepository, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Starts the operation to create a new branch which reverts changes introduced by either a specific commit or commits that are associated to a pull request.
     *
     * @param {GitInterfaces.GitAsyncRefOperationParameters} revertToCreate
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - ID of the repository.
     */
    createRevert(revertToCreate, project, repositoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "bc866058-5449-4715-9cf1-a510b6ff193c", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, revertToCreate, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitRevert, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve information about a revert operation by revert Id.
     *
     * @param {string} project - Project ID or project name
     * @param {number} revertId - ID of the revert operation.
     * @param {string} repositoryId - ID of the repository.
     */
    getRevert(project, revertId, repositoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    revertId: revertId,
                    repositoryId: repositoryId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "bc866058-5449-4715-9cf1-a510b6ff193c", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitRevert, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve information about a revert operation for a specific branch.
     *
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - ID of the repository.
     * @param {string} refName - The GitAsyncRefOperationParameters generatedRefName used for the revert operation.
     */
    getRevertForRefName(project, repositoryId, refName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    refName: refName,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "bc866058-5449-4715-9cf1-a510b6ff193c", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitRevert, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Create Git commit status.
     *
     * @param {GitInterfaces.GitStatus} gitCommitStatusToCreate - Git commit status object to create.
     * @param {string} commitId - ID of the Git commit.
     * @param {string} repositoryId - ID of the repository.
     * @param {string} project - Project ID or project name
     */
    createCommitStatus(gitCommitStatusToCreate, commitId, repositoryId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    commitId: commitId,
                    repositoryId: repositoryId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "428dd4fb-fda5-4722-af02-9313b80305da", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, gitCommitStatusToCreate, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitStatus, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get statuses associated with the Git commit.
     *
     * @param {string} commitId - ID of the Git commit.
     * @param {string} repositoryId - ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {number} top - Optional. The number of statuses to retrieve. Default is 1000.
     * @param {number} skip - Optional. The number of statuses to ignore. Default is 0. For example, to retrieve results 101-150, set top to 50 and skip to 100.
     * @param {boolean} latestOnly - The flag indicates whether to get only latest statuses grouped by `Context.Name` and `Context.Genre`.
     */
    getStatuses(commitId, repositoryId, project, top, skip, latestOnly) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    commitId: commitId,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    top: top,
                    skip: skip,
                    latestOnly: latestOnly,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "428dd4fb-fda5-4722-af02-9313b80305da", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitStatus, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve a pull request suggestion for a particular repository or team project.
     *
     * @param {string} repositoryId - ID of the git repository.
     * @param {string} project - Project ID or project name
     */
    getSuggestions(repositoryId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "9393b4fb-4445-4919-972b-9ad16f442d83", routeValues);
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
     * The Tree endpoint returns the collection of objects underneath the specified tree. Trees are folders in a Git repository.
     *
     * @param {string} repositoryId - Repository Id.
     * @param {string} sha1 - SHA1 hash of the tree object.
     * @param {string} project - Project ID or project name
     * @param {string} projectId - Project Id.
     * @param {boolean} recursive - Search recursively. Include trees underneath this tree. Default is false.
     * @param {string} fileName - Name to use if a .zip file is returned. Default is the object ID.
     */
    getTree(repositoryId, sha1, project, projectId, recursive, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    sha1: sha1
                };
                let queryValues = {
                    projectId: projectId,
                    recursive: recursive,
                    fileName: fileName,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "729f6437-6f92-44ec-8bee-273a7111063c", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, GitInterfaces.TypeInfo.GitTreeRef, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * The Tree endpoint returns the collection of objects underneath the specified tree. Trees are folders in a Git repository.
     *
     * @param {string} repositoryId - Repository Id.
     * @param {string} sha1 - SHA1 hash of the tree object.
     * @param {string} project - Project ID or project name
     * @param {string} projectId - Project Id.
     * @param {boolean} recursive - Search recursively. Include trees underneath this tree. Default is false.
     * @param {string} fileName - Name to use if a .zip file is returned. Default is the object ID.
     */
    getTreeZip(repositoryId, sha1, project, projectId, recursive, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId,
                    sha1: sha1
                };
                let queryValues = {
                    projectId: projectId,
                    recursive: recursive,
                    fileName: fileName,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "git", "729f6437-6f92-44ec-8bee-273a7111063c", routeValues, queryValues);
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
}
GitApi.RESOURCE_AREA_ID = "4e080c62-fa21-4fbc-8fef-2a10a2b38049";
exports.GitApi = GitApi;
