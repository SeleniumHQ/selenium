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
const CoreInterfaces = require("./interfaces/CoreInterfaces");
const OperationsInterfaces = require("./interfaces/common/OperationsInterfaces");
class CoreApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-Core-api', options);
    }
    /**
     * @param {CoreInterfaces.WebApiConnectedServiceDetails} connectedServiceCreationData
     * @param {string} projectId
     */
    createConnectedService(connectedServiceCreationData, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    projectId: projectId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "core", "b4f70219-e18b-42c5-abe3-98b07d35525e", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, connectedServiceCreationData, options);
                    let ret = this.formatResponse(res.result, CoreInterfaces.TypeInfo.WebApiConnectedService, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} projectId
     * @param {string} name
     */
    getConnectedServiceDetails(projectId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    projectId: projectId,
                    name: name
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "core", "b4f70219-e18b-42c5-abe3-98b07d35525e", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, CoreInterfaces.TypeInfo.WebApiConnectedServiceDetails, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} projectId
     * @param {CoreInterfaces.ConnectedServiceKind} kind
     */
    getConnectedServices(projectId, kind) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    projectId: projectId
                };
                let queryValues = {
                    kind: kind,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "core", "b4f70219-e18b-42c5-abe3-98b07d35525e", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, CoreInterfaces.TypeInfo.WebApiConnectedService, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {CoreInterfaces.IdentityData} mruData
     * @param {string} mruName
     */
    createIdentityMru(mruData, mruName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    mruName: mruName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "core", "5ead0b70-2572-4697-97e9-f341069a783a", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, mruData, options);
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
     * @param {CoreInterfaces.IdentityData} mruData
     * @param {string} mruName
     */
    deleteIdentityMru(mruData, mruName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    mruName: mruName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "core", "5ead0b70-2572-4697-97e9-f341069a783a", routeValues);
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
     * @param {string} mruName
     */
    getIdentityMru(mruName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    mruName: mruName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "core", "5ead0b70-2572-4697-97e9-f341069a783a", routeValues);
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
     * @param {CoreInterfaces.IdentityData} mruData
     * @param {string} mruName
     */
    updateIdentityMru(mruData, mruName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    mruName: mruName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "core", "5ead0b70-2572-4697-97e9-f341069a783a", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, mruData, options);
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
     * Get a list of members for a specific team.
     *
     * @param {string} projectId - The name or ID (GUID) of the team project the team belongs to.
     * @param {string} teamId - The name or ID (GUID) of the team .
     * @param {number} top
     * @param {number} skip
     */
    getTeamMembersWithExtendedProperties(projectId, teamId, top, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    projectId: projectId,
                    teamId: teamId
                };
                let queryValues = {
                    '$top': top,
                    '$skip': skip,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "core", "294c494c-2600-4d7e-b76c-3dd50c3c95be", routeValues, queryValues);
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
     * Get a process by ID.
     *
     * @param {string} processId - ID for a process.
     */
    getProcessById(processId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "core", "93878975-88c5-4e6a-8abb-7ddd77a8a7d8", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, CoreInterfaces.TypeInfo.Process, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a list of processes.
     *
     */
    getProcesses() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "core", "93878975-88c5-4e6a-8abb-7ddd77a8a7d8", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, CoreInterfaces.TypeInfo.Process, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get project collection with the specified id or name.
     *
     * @param {string} collectionId
     */
    getProjectCollection(collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    collectionId: collectionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "core", "8031090f-ef1d-4af6-85fc-698cd75d42bf", routeValues);
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
     * Get project collection references for this application.
     *
     * @param {number} top
     * @param {number} skip
     */
    getProjectCollections(top, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    '$top': top,
                    '$skip': skip,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "core", "8031090f-ef1d-4af6-85fc-698cd75d42bf", routeValues, queryValues);
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
     * @param {number} minRevision
     */
    getProjectHistoryEntries(minRevision) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    minRevision: minRevision,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "core", "6488a877-4749-4954-82ea-7340d36be9f2", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, CoreInterfaces.TypeInfo.ProjectInfo, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get project with the specified id or name, optionally including capabilities.
     *
     * @param {string} projectId
     * @param {boolean} includeCapabilities - Include capabilities (such as source control) in the team project result (default: false).
     * @param {boolean} includeHistory - Search within renamed projects (that had such name in the past).
     */
    getProject(projectId, includeCapabilities, includeHistory) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    projectId: projectId
                };
                let queryValues = {
                    includeCapabilities: includeCapabilities,
                    includeHistory: includeHistory,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "core", "603fe2ac-9723-48b9-88ad-09305aa6c6e1", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, CoreInterfaces.TypeInfo.TeamProject, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get project references with the specified state
     *
     * @param {any} stateFilter - Filter on team projects in a specific team project state (default: WellFormed).
     * @param {number} top
     * @param {number} skip
     * @param {string} continuationToken
     */
    getProjects(stateFilter, top, skip, continuationToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    stateFilter: stateFilter,
                    '$top': top,
                    '$skip': skip,
                    continuationToken: continuationToken,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "core", "603fe2ac-9723-48b9-88ad-09305aa6c6e1", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, CoreInterfaces.TypeInfo.TeamProjectReference, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Queue a project creation.
     *
     * @param {CoreInterfaces.TeamProject} projectToCreate - The project to create.
     */
    queueCreateProject(projectToCreate) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "core", "603fe2ac-9723-48b9-88ad-09305aa6c6e1", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, projectToCreate, options);
                    let ret = this.formatResponse(res.result, OperationsInterfaces.TypeInfo.OperationReference, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Queue a project deletion.
     *
     * @param {string} projectId - The project id of the project to delete.
     */
    queueDeleteProject(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    projectId: projectId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "core", "603fe2ac-9723-48b9-88ad-09305aa6c6e1", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.del(url, options);
                    let ret = this.formatResponse(res.result, OperationsInterfaces.TypeInfo.OperationReference, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update an existing project's name, abbreviation, or description.
     *
     * @param {CoreInterfaces.TeamProject} projectUpdate - The updates for the project.
     * @param {string} projectId - The project id of the project to update.
     */
    updateProject(projectUpdate, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    projectId: projectId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "core", "603fe2ac-9723-48b9-88ad-09305aa6c6e1", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, projectUpdate, options);
                    let ret = this.formatResponse(res.result, OperationsInterfaces.TypeInfo.OperationReference, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a collection of team project properties.
     *
     * @param {string} projectId - The team project ID.
     * @param {string[]} keys - A comma-delimited string of team project property names. Wildcard characters ("?" and "*") are supported. If no key is specified, all properties will be returned.
     */
    getProjectProperties(projectId, keys) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    projectId: projectId
                };
                let queryValues = {
                    keys: keys && keys.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "core", "4976a71a-4487-49aa-8aab-a1eda469037a", routeValues, queryValues);
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
     * Create, update, and delete team project properties.
     *
     * @param {string} projectId - The team project ID.
     * @param {VSSInterfaces.JsonPatchDocument} patchDocument - A JSON Patch document that represents an array of property operations. See RFC 6902 for more details on JSON Patch. The accepted operation verbs are Add and Remove, where Add is used for both creating and updating properties. The path consists of a forward slash and a property name.
     */
    setProjectProperties(customHeaders, projectId, patchDocument) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    projectId: projectId
                };
                customHeaders = customHeaders || {};
                customHeaders["Content-Type"] = "application/json-patch+json";
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "core", "4976a71a-4487-49aa-8aab-a1eda469037a", routeValues);
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
     * @param {CoreInterfaces.Proxy} proxy
     */
    createOrUpdateProxy(proxy) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "core", "ec1f4311-f2b4-4c15-b2b8-8990b80d2908", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, proxy, options);
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
     * @param {string} proxyUrl
     * @param {string} site
     */
    deleteProxy(proxyUrl, site) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    proxyUrl: proxyUrl,
                    site: site,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "core", "ec1f4311-f2b4-4c15-b2b8-8990b80d2908", routeValues, queryValues);
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
     * @param {string} proxyUrl
     */
    getProxies(proxyUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    proxyUrl: proxyUrl,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "core", "ec1f4311-f2b4-4c15-b2b8-8990b80d2908", routeValues, queryValues);
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
     * Get a list of all teams.
     *
     * @param {boolean} mine - If true return all the teams requesting user is member, otherwise return all the teams user has read access
     * @param {number} top - Maximum number of teams to return.
     * @param {number} skip - Number of teams to skip.
     */
    getAllTeams(mine, top, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    '$mine': mine,
                    '$top': top,
                    '$skip': skip,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "core", "7a4d9ee9-3433-4347-b47a-7a80f1cf307e", routeValues, queryValues);
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
     * Create a team in a team project.
     *
     * @param {CoreInterfaces.WebApiTeam} team - The team data used to create the team.
     * @param {string} projectId - The name or ID (GUID) of the team project in which to create the team.
     */
    createTeam(team, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    projectId: projectId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "core", "d30a3dd1-f8ba-442a-b86a-bd0c0c383e59", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, team, options);
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
     * Delete a team.
     *
     * @param {string} projectId - The name or ID (GUID) of the team project containing the team to delete.
     * @param {string} teamId - The name of ID of the team to delete.
     */
    deleteTeam(projectId, teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    projectId: projectId,
                    teamId: teamId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "core", "d30a3dd1-f8ba-442a-b86a-bd0c0c383e59", routeValues);
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
     * Get a specific team.
     *
     * @param {string} projectId - The name or ID (GUID) of the team project containing the team.
     * @param {string} teamId - The name or ID (GUID) of the team.
     */
    getTeam(projectId, teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    projectId: projectId,
                    teamId: teamId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "core", "d30a3dd1-f8ba-442a-b86a-bd0c0c383e59", routeValues);
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
     * Get a list of teams.
     *
     * @param {string} projectId
     * @param {boolean} mine - If true return all the teams requesting user is member, otherwise return all the teams user has read access
     * @param {number} top - Maximum number of teams to return.
     * @param {number} skip - Number of teams to skip.
     */
    getTeams(projectId, mine, top, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    projectId: projectId
                };
                let queryValues = {
                    '$mine': mine,
                    '$top': top,
                    '$skip': skip,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "core", "d30a3dd1-f8ba-442a-b86a-bd0c0c383e59", routeValues, queryValues);
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
     * Update a team's name and/or description.
     *
     * @param {CoreInterfaces.WebApiTeam} teamData
     * @param {string} projectId - The name or ID (GUID) of the team project containing the team to update.
     * @param {string} teamId - The name of ID of the team to update.
     */
    updateTeam(teamData, projectId, teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    projectId: projectId,
                    teamId: teamId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "core", "d30a3dd1-f8ba-442a-b86a-bd0c0c383e59", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, teamData, options);
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
CoreApi.RESOURCE_AREA_ID = "79134c72-4a58-4b42-976c-04e7115f32bf";
exports.CoreApi = CoreApi;
