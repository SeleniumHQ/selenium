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
const TaskAgentInterfaces = require("./interfaces/TaskAgentInterfaces");
class TaskAgentApiBase extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-TaskAgent-api', options);
    }
    /**
     * @param {TaskAgentInterfaces.TaskAgent} agent
     * @param {number} poolId
     */
    addAgent(agent, poolId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "e298ef32-5878-4cab-993c-043836571f42", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, agent, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgent, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} poolId
     * @param {number} agentId
     */
    deleteAgent(poolId, agentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    agentId: agentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "e298ef32-5878-4cab-993c-043836571f42", routeValues);
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
     * @param {number} poolId
     * @param {number} agentId
     * @param {boolean} includeCapabilities
     * @param {boolean} includeAssignedRequest
     * @param {string[]} propertyFilters
     */
    getAgent(poolId, agentId, includeCapabilities, includeAssignedRequest, propertyFilters) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    agentId: agentId
                };
                let queryValues = {
                    includeCapabilities: includeCapabilities,
                    includeAssignedRequest: includeAssignedRequest,
                    propertyFilters: propertyFilters && propertyFilters.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "e298ef32-5878-4cab-993c-043836571f42", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgent, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} poolId
     * @param {string} agentName
     * @param {boolean} includeCapabilities
     * @param {boolean} includeAssignedRequest
     * @param {string[]} propertyFilters
     * @param {string[]} demands
     */
    getAgents(poolId, agentName, includeCapabilities, includeAssignedRequest, propertyFilters, demands) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                let queryValues = {
                    agentName: agentName,
                    includeCapabilities: includeCapabilities,
                    includeAssignedRequest: includeAssignedRequest,
                    propertyFilters: propertyFilters && propertyFilters.join(","),
                    demands: demands && demands.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "e298ef32-5878-4cab-993c-043836571f42", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgent, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.TaskAgent} agent
     * @param {number} poolId
     * @param {number} agentId
     */
    replaceAgent(agent, poolId, agentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    agentId: agentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "e298ef32-5878-4cab-993c-043836571f42", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, agent, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgent, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.TaskAgent} agent
     * @param {number} poolId
     * @param {number} agentId
     */
    updateAgent(agent, poolId, agentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    agentId: agentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "e298ef32-5878-4cab-993c-043836571f42", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, agent, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgent, false);
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
    getAzureSubscriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "bcd6189c-0303-471f-a8e1-acb22b74d700", routeValues);
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
     * @param {string} project - Project ID or project name
     * @param {number} deploymentGroupId
     */
    generateDeploymentGroupAccessToken(project, deploymentGroupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    deploymentGroupId: deploymentGroupId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "3d197ba2-c3e9-4253-882f-0ee2440f8174", routeValues);
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
     * @param {TaskAgentInterfaces.DeploymentGroup} deploymentGroup
     * @param {string} project - Project ID or project name
     */
    addDeploymentGroup(deploymentGroup, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "083c4d89-ab35-45af-aa11-7cf66895c53e", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, deploymentGroup, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.DeploymentGroup, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} deploymentGroupId
     */
    deleteDeploymentGroup(project, deploymentGroupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    deploymentGroupId: deploymentGroupId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "083c4d89-ab35-45af-aa11-7cf66895c53e", routeValues);
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
     * @param {string} project - Project ID or project name
     * @param {number} deploymentGroupId
     * @param {TaskAgentInterfaces.DeploymentGroupActionFilter} actionFilter
     * @param {TaskAgentInterfaces.DeploymentGroupExpands} expand
     */
    getDeploymentGroup(project, deploymentGroupId, actionFilter, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    deploymentGroupId: deploymentGroupId
                };
                let queryValues = {
                    actionFilter: actionFilter,
                    '$expand': expand,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "083c4d89-ab35-45af-aa11-7cf66895c53e", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.DeploymentGroup, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {string} name
     * @param {TaskAgentInterfaces.DeploymentGroupActionFilter} actionFilter
     * @param {TaskAgentInterfaces.DeploymentGroupExpands} expand
     */
    getDeploymentGroups(project, name, actionFilter, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    name: name,
                    actionFilter: actionFilter,
                    '$expand': expand,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "083c4d89-ab35-45af-aa11-7cf66895c53e", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.DeploymentGroup, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.DeploymentGroup} deploymentGroup
     * @param {string} project - Project ID or project name
     * @param {number} deploymentGroupId
     */
    updateDeploymentGroup(deploymentGroup, project, deploymentGroupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    deploymentGroupId: deploymentGroupId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "083c4d89-ab35-45af-aa11-7cf66895c53e", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, deploymentGroup, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.DeploymentGroup, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Proxy for a GET request defined by an 'endpoint'. The request is authorized using a service connection. The response is filtered using an XPath/Json based selector.
     *
     * @param {TaskAgentInterfaces.TaskDefinitionEndpoint} endpoint - Describes the URL to fetch.
     */
    queryEndpoint(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "f223b809-8c33-4b7d-b53f-07232569b5d6", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, endpoint, options);
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
     * @param {string} hubName
     * @param {boolean} includeEnterpriseUsersCount
     * @param {boolean} includeHostedAgentMinutesCount
     */
    getTaskHubLicenseDetails(hubName, includeEnterpriseUsersCount, includeHostedAgentMinutesCount) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    hubName: hubName
                };
                let queryValues = {
                    includeEnterpriseUsersCount: includeEnterpriseUsersCount,
                    includeHostedAgentMinutesCount: includeHostedAgentMinutesCount,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "f9f0f436-b8a1-4475-9041-1ccdbf8f0128", routeValues, queryValues);
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
     * @param {TaskAgentInterfaces.TaskHubLicenseDetails} taskHubLicenseDetails
     * @param {string} hubName
     */
    updateTaskHubLicenseDetails(taskHubLicenseDetails, hubName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    hubName: hubName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "f9f0f436-b8a1-4475-9041-1ccdbf8f0128", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, taskHubLicenseDetails, options);
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
     * @param {TaskAgentInterfaces.InputValidationRequest} inputValidationRequest
     */
    validateInputs(inputValidationRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "58475b1e-adaf-4155-9bc1-e04bf1fff4c2", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, inputValidationRequest, options);
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
     * @param {number} poolId
     * @param {number} requestId
     * @param {string} lockToken
     * @param {TaskAgentInterfaces.TaskResult} result
     */
    deleteAgentRequest(poolId, requestId, lockToken, result) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    requestId: requestId
                };
                let queryValues = {
                    lockToken: lockToken,
                    result: result,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "fc825784-c92a-4299-9221-998a02d1b54f", routeValues, queryValues);
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
     * @param {number} poolId
     * @param {number} requestId
     */
    getAgentRequest(poolId, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    requestId: requestId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "fc825784-c92a-4299-9221-998a02d1b54f", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentJobRequest, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} poolId
     * @param {number} agentId
     * @param {number} completedRequestCount
     */
    getAgentRequestsForAgent(poolId, agentId, completedRequestCount) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                let queryValues = {
                    agentId: agentId,
                    completedRequestCount: completedRequestCount,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "fc825784-c92a-4299-9221-998a02d1b54f", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentJobRequest, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} poolId
     * @param {number[]} agentIds
     * @param {number} completedRequestCount
     */
    getAgentRequestsForAgents(poolId, agentIds, completedRequestCount) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                let queryValues = {
                    agentIds: agentIds && agentIds.join(","),
                    completedRequestCount: completedRequestCount,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "fc825784-c92a-4299-9221-998a02d1b54f", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentJobRequest, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} poolId
     * @param {string} planId
     * @param {string} jobId
     */
    getAgentRequestsForPlan(poolId, planId, jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                let queryValues = {
                    planId: planId,
                    jobId: jobId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "fc825784-c92a-4299-9221-998a02d1b54f", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentJobRequest, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.TaskAgentJobRequest} request
     * @param {number} poolId
     */
    queueAgentRequest(request, poolId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "fc825784-c92a-4299-9221-998a02d1b54f", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, request, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentJobRequest, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.TaskAgentJobRequest} request
     * @param {number} poolId
     * @param {number} requestId
     * @param {string} lockToken
     */
    updateAgentRequest(request, poolId, requestId, lockToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    requestId: requestId
                };
                let queryValues = {
                    lockToken: lockToken,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "fc825784-c92a-4299-9221-998a02d1b54f", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, request, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentJobRequest, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} machineGroupId
     */
    generateDeploymentMachineGroupAccessToken(project, machineGroupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    machineGroupId: machineGroupId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "f8c7c0de-ac0d-469b-9cb1-c21f72d67693", routeValues);
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
     * @param {TaskAgentInterfaces.DeploymentMachineGroup} machineGroup
     * @param {string} project - Project ID or project name
     */
    addDeploymentMachineGroup(machineGroup, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "d4adf50f-80c6-4ac8-9ca1-6e4e544286e9", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, machineGroup, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.DeploymentMachineGroup, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} machineGroupId
     */
    deleteDeploymentMachineGroup(project, machineGroupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    machineGroupId: machineGroupId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "d4adf50f-80c6-4ac8-9ca1-6e4e544286e9", routeValues);
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
     * @param {string} project - Project ID or project name
     * @param {number} machineGroupId
     * @param {TaskAgentInterfaces.MachineGroupActionFilter} actionFilter
     */
    getDeploymentMachineGroup(project, machineGroupId, actionFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    machineGroupId: machineGroupId
                };
                let queryValues = {
                    actionFilter: actionFilter,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "d4adf50f-80c6-4ac8-9ca1-6e4e544286e9", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.DeploymentMachineGroup, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {string} machineGroupName
     * @param {TaskAgentInterfaces.MachineGroupActionFilter} actionFilter
     */
    getDeploymentMachineGroups(project, machineGroupName, actionFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    machineGroupName: machineGroupName,
                    actionFilter: actionFilter,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "d4adf50f-80c6-4ac8-9ca1-6e4e544286e9", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.DeploymentMachineGroup, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.DeploymentMachineGroup} machineGroup
     * @param {string} project - Project ID or project name
     * @param {number} machineGroupId
     */
    updateDeploymentMachineGroup(machineGroup, project, machineGroupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    machineGroupId: machineGroupId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "d4adf50f-80c6-4ac8-9ca1-6e4e544286e9", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, machineGroup, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.DeploymentMachineGroup, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} machineGroupId
     * @param {string[]} tagFilters
     */
    getDeploymentMachineGroupMachines(project, machineGroupId, tagFilters) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    machineGroupId: machineGroupId
                };
                let queryValues = {
                    tagFilters: tagFilters && tagFilters.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "966c3874-c347-4b18-a90c-d509116717fd", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.DeploymentMachine, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.DeploymentMachine[]} deploymentMachines
     * @param {string} project - Project ID or project name
     * @param {number} machineGroupId
     */
    updateDeploymentMachineGroupMachines(deploymentMachines, project, machineGroupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    machineGroupId: machineGroupId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "966c3874-c347-4b18-a90c-d509116717fd", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, deploymentMachines, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.DeploymentMachine, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} deploymentGroupId
     * @param {string[]} tags
     */
    getDeploymentMachines(project, deploymentGroupId, tags) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    deploymentGroupId: deploymentGroupId
                };
                let queryValues = {
                    tags: tags && tags.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "6f6d406f-cfe6-409c-9327-7009928077e7", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.DeploymentMachine, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.DeploymentMachine[]} deploymentMachines
     * @param {string} project - Project ID or project name
     * @param {number} deploymentGroupId
     */
    updateDeploymentMachines(deploymentMachines, project, deploymentGroupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    deploymentGroupId: deploymentGroupId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "6f6d406f-cfe6-409c-9327-7009928077e7", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, deploymentMachines, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.DeploymentMachine, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.TaskAgentPoolMaintenanceDefinition} definition
     * @param {number} poolId
     */
    createAgentPoolMaintenanceDefinition(definition, poolId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "80572e16-58f0-4419-ac07-d19fde32195c", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, definition, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentPoolMaintenanceDefinition, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} poolId
     * @param {number} definitionId
     */
    deleteAgentPoolMaintenanceDefinition(poolId, definitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    definitionId: definitionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "80572e16-58f0-4419-ac07-d19fde32195c", routeValues);
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
     * @param {number} poolId
     * @param {number} definitionId
     */
    getAgentPoolMaintenanceDefinition(poolId, definitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    definitionId: definitionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "80572e16-58f0-4419-ac07-d19fde32195c", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentPoolMaintenanceDefinition, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} poolId
     */
    getAgentPoolMaintenanceDefinitions(poolId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "80572e16-58f0-4419-ac07-d19fde32195c", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentPoolMaintenanceDefinition, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.TaskAgentPoolMaintenanceDefinition} definition
     * @param {number} poolId
     * @param {number} definitionId
     */
    updateAgentPoolMaintenanceDefinition(definition, poolId, definitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    definitionId: definitionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "80572e16-58f0-4419-ac07-d19fde32195c", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, definition, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentPoolMaintenanceDefinition, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} poolId
     * @param {number} jobId
     */
    deleteAgentPoolMaintenanceJob(poolId, jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    jobId: jobId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "15e7ab6e-abce-4601-a6d8-e111fe148f46", routeValues);
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
     * @param {number} poolId
     * @param {number} jobId
     */
    getAgentPoolMaintenanceJob(poolId, jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    jobId: jobId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "15e7ab6e-abce-4601-a6d8-e111fe148f46", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentPoolMaintenanceJob, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} poolId
     * @param {number} jobId
     */
    getAgentPoolMaintenanceJobLogs(poolId, jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    jobId: jobId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "15e7ab6e-abce-4601-a6d8-e111fe148f46", routeValues);
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
     * @param {number} poolId
     * @param {number} definitionId
     */
    getAgentPoolMaintenanceJobs(poolId, definitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                let queryValues = {
                    definitionId: definitionId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "15e7ab6e-abce-4601-a6d8-e111fe148f46", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentPoolMaintenanceJob, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.TaskAgentPoolMaintenanceJob} job
     * @param {number} poolId
     */
    queueAgentPoolMaintenanceJob(job, poolId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "15e7ab6e-abce-4601-a6d8-e111fe148f46", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, job, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentPoolMaintenanceJob, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.TaskAgentPoolMaintenanceJob} job
     * @param {number} poolId
     * @param {number} jobId
     */
    updateAgentPoolMaintenanceJob(job, poolId, jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    jobId: jobId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "15e7ab6e-abce-4601-a6d8-e111fe148f46", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, job, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentPoolMaintenanceJob, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} poolId
     * @param {number} messageId
     * @param {string} sessionId
     */
    deleteMessage(poolId, messageId, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    messageId: messageId
                };
                let queryValues = {
                    sessionId: sessionId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "c3a054f6-7a8a-49c0-944e-3a8e5d7adfd7", routeValues, queryValues);
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
     * @param {number} poolId
     * @param {string} sessionId
     * @param {number} lastMessageId
     */
    getMessage(poolId, sessionId, lastMessageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                let queryValues = {
                    sessionId: sessionId,
                    lastMessageId: lastMessageId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "c3a054f6-7a8a-49c0-944e-3a8e5d7adfd7", routeValues, queryValues);
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
     * @param {number} poolId
     * @param {number} agentId
     */
    refreshAgent(poolId, agentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                let queryValues = {
                    agentId: agentId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "c3a054f6-7a8a-49c0-944e-3a8e5d7adfd7", routeValues, queryValues);
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
     * @param {number} poolId
     */
    refreshAgents(poolId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "c3a054f6-7a8a-49c0-944e-3a8e5d7adfd7", routeValues);
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
     * @param {TaskAgentInterfaces.TaskAgentMessage} message
     * @param {number} poolId
     * @param {number} requestId
     */
    sendMessage(message, poolId, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                let queryValues = {
                    requestId: requestId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "c3a054f6-7a8a-49c0-944e-3a8e5d7adfd7", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, message, options);
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
     * @param {string} packageType
     * @param {string} platform
     * @param {string} version
     */
    getPackage(packageType, platform, version) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    packageType: packageType,
                    platform: platform,
                    version: version
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.2", "distributedtask", "8ffcd551-079c-493a-9c02-54346299d144", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.PackageMetadata, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} packageType
     * @param {string} platform
     * @param {number} top
     */
    getPackages(packageType, platform, top) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    packageType: packageType,
                    platform: platform
                };
                let queryValues = {
                    '$top': top,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.2", "distributedtask", "8ffcd551-079c-493a-9c02-54346299d144", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.PackageMetadata, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} poolId
     */
    getAgentPoolRoles(poolId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "381dd2bb-35cf-4103-ae8c-3c815b25763c", routeValues);
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
     * @param {TaskAgentInterfaces.TaskAgentPool} pool
     */
    addAgentPool(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "a8c47e17-4d56-4a56-92bb-de7ea7dc65be", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, pool, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentPool, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} poolId
     */
    deleteAgentPool(poolId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "a8c47e17-4d56-4a56-92bb-de7ea7dc65be", routeValues);
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
     * @param {number} poolId
     * @param {string[]} properties
     * @param {TaskAgentInterfaces.TaskAgentPoolActionFilter} actionFilter
     */
    getAgentPool(poolId, properties, actionFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                let queryValues = {
                    properties: properties && properties.join(","),
                    actionFilter: actionFilter,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "a8c47e17-4d56-4a56-92bb-de7ea7dc65be", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentPool, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} poolName
     * @param {string[]} properties
     * @param {TaskAgentInterfaces.TaskAgentPoolType} poolType
     * @param {TaskAgentInterfaces.TaskAgentPoolActionFilter} actionFilter
     */
    getAgentPools(poolName, properties, poolType, actionFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    poolName: poolName,
                    properties: properties && properties.join(","),
                    poolType: poolType,
                    actionFilter: actionFilter,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "a8c47e17-4d56-4a56-92bb-de7ea7dc65be", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentPool, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.TaskAgentPool} pool
     * @param {number} poolId
     */
    updateAgentPool(pool, poolId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "a8c47e17-4d56-4a56-92bb-de7ea7dc65be", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, pool, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentPool, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} queueId
     */
    getAgentQueueRoles(queueId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    queueId: queueId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "b0c6d64d-c9fa-4946-b8de-77de623ee585", routeValues);
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
     * @param {TaskAgentInterfaces.TaskAgentQueue} queue
     * @param {string} project - Project ID or project name
     */
    addAgentQueue(queue, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "900fa995-c559-4923-aae7-f8424fe4fbea", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, queue, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentQueue, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     */
    createTeamProject(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "900fa995-c559-4923-aae7-f8424fe4fbea", routeValues);
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
     * @param {number} queueId
     * @param {string} project - Project ID or project name
     */
    deleteAgentQueue(queueId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    queueId: queueId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "900fa995-c559-4923-aae7-f8424fe4fbea", routeValues);
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
     * @param {number} queueId
     * @param {string} project - Project ID or project name
     * @param {TaskAgentInterfaces.TaskAgentQueueActionFilter} actionFilter
     */
    getAgentQueue(queueId, project, actionFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    queueId: queueId
                };
                let queryValues = {
                    actionFilter: actionFilter,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "900fa995-c559-4923-aae7-f8424fe4fbea", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentQueue, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {string} queueName
     * @param {TaskAgentInterfaces.TaskAgentQueueActionFilter} actionFilter
     */
    getAgentQueues(project, queueName, actionFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    queueName: queueName,
                    actionFilter: actionFilter,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "900fa995-c559-4923-aae7-f8424fe4fbea", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentQueue, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {string} taskGroupId
     */
    getTaskGroupHistory(project, taskGroupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    taskGroupId: taskGroupId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "100cc92a-b255-47fa-9ab3-e44a2985a3ac", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskGroupRevision, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Delete a secure file
     *
     * @param {string} project - Project ID or project name
     * @param {string} secureFileId - The unique secure file Id
     */
    deleteSecureFile(project, secureFileId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    secureFileId: secureFileId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "adcfd8bc-b184-43ba-bd84-7c8c6a2ff421", routeValues);
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
     * Download a secure file by Id
     *
     * @param {string} project - Project ID or project name
     * @param {string} secureFileId - The unique secure file Id
     * @param {string} ticket - A valid download ticket
     * @param {boolean} download - If download is true, the file is sent as attachement in the response body. If download is false, the response body contains the file stream.
     */
    downloadSecureFile(project, secureFileId, ticket, download) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    secureFileId: secureFileId
                };
                let queryValues = {
                    ticket: ticket,
                    download: download,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "adcfd8bc-b184-43ba-bd84-7c8c6a2ff421", routeValues, queryValues);
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
     * Get a secure file
     *
     * @param {string} project - Project ID or project name
     * @param {string} secureFileId - The unique secure file Id
     * @param {boolean} includeDownloadTicket - If includeDownloadTicket is true and the caller has permissions, a download ticket is included in the response.
     */
    getSecureFile(project, secureFileId, includeDownloadTicket) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    secureFileId: secureFileId
                };
                let queryValues = {
                    includeDownloadTicket: includeDownloadTicket,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "adcfd8bc-b184-43ba-bd84-7c8c6a2ff421", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.SecureFile, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get secure files
     *
     * @param {string} project - Project ID or project name
     * @param {string} namePattern - Name of the secure file to match. Can include wildcards to match multiple files.
     * @param {boolean} includeDownloadTickets - If includeDownloadTickets is true and the caller has permissions, a download ticket for each secure file is included in the response.
     * @param {TaskAgentInterfaces.SecureFileActionFilter} actionFilter - Filter by secure file permissions for View, Manage or Use action. Defaults to View.
     */
    getSecureFiles(project, namePattern, includeDownloadTickets, actionFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    namePattern: namePattern,
                    includeDownloadTickets: includeDownloadTickets,
                    actionFilter: actionFilter,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "adcfd8bc-b184-43ba-bd84-7c8c6a2ff421", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.SecureFile, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get secure files
     *
     * @param {string} project - Project ID or project name
     * @param {string[]} secureFileIds - A list of secure file Ids
     * @param {boolean} includeDownloadTickets - If includeDownloadTickets is true and the caller has permissions, a download ticket for each secure file is included in the response.
     */
    getSecureFilesByIds(project, secureFileIds, includeDownloadTickets) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    secureFileIds: secureFileIds && secureFileIds.join(","),
                    includeDownloadTickets: includeDownloadTickets,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "adcfd8bc-b184-43ba-bd84-7c8c6a2ff421", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.SecureFile, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Query secure files using a name pattern and a condition on file properties.
     *
     * @param {string} condition - The main condition syntax is described [here](https://go.microsoft.com/fwlink/?linkid=842996). Use the *property('property-name')* function to access the value of the specified property of a secure file. It returns null if the property is not set. E.g. ``` and( eq( property('devices'), '2' ), in( property('provisioning profile type'), 'ad hoc', 'development' ) ) ```
     * @param {string} project - Project ID or project name
     * @param {string} namePattern - Name of the secure file to match. Can include wildcards to match multiple files.
     */
    querySecureFilesByProperties(condition, project, namePattern) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    namePattern: namePattern,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "adcfd8bc-b184-43ba-bd84-7c8c6a2ff421", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, condition, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.SecureFile, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update the name or properties of an existing secure file
     *
     * @param {TaskAgentInterfaces.SecureFile} secureFile - The secure file with updated name and/or properties
     * @param {string} project - Project ID or project name
     * @param {string} secureFileId - The unique secure file Id
     */
    updateSecureFile(secureFile, project, secureFileId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    secureFileId: secureFileId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "adcfd8bc-b184-43ba-bd84-7c8c6a2ff421", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, secureFile, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.SecureFile, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update properties and/or names of a set of secure files. Files are identified by their IDs. Properties provided override the existing one entirely, i.e. do not merge.
     *
     * @param {TaskAgentInterfaces.SecureFile[]} secureFiles - A list of secure file objects. Only three field must be populated Id, Name, and Properties. The rest of fields in the object are ignored.
     * @param {string} project - Project ID or project name
     */
    updateSecureFiles(secureFiles, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "adcfd8bc-b184-43ba-bd84-7c8c6a2ff421", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, secureFiles, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.SecureFile, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Upload a secure file, include the file stream in the request body
     *
     * @param {NodeJS.ReadableStream} contentStream - Content to upload
     * @param {string} project - Project ID or project name
     * @param {string} name - Name of the file to upload
     */
    uploadSecureFile(customHeaders, contentStream, project, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    name: name,
                };
                customHeaders = customHeaders || {};
                customHeaders["Content-Type"] = "application/octet-stream";
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "adcfd8bc-b184-43ba-bd84-7c8c6a2ff421", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    options.additionalHeaders = customHeaders;
                    let res;
                    res = yield this.rest.uploadStream("POST", url, contentStream, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.SecureFile, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.ServiceEndpointRequest} serviceEndpointRequest
     * @param {string} project - Project ID or project name
     * @param {string} endpointId
     */
    executeServiceEndpointRequest(serviceEndpointRequest, project, endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    endpointId: endpointId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.2", "distributedtask", "f956a7de-d766-43af-81b1-e9e349245634", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, serviceEndpointRequest, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.ServiceEndpointRequestResult, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Proxy for a GET request defined by an service endpoint. The request is authorized using a data source in service endpoint. The response is filtered using an XPath/Json based selector.
     *
     * @param {TaskAgentInterfaces.DataSourceBinding} binding - Describes the data source to fetch.
     * @param {string} project - Project ID or project name
     */
    queryServiceEndpoint(binding, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.2", "distributedtask", "f956a7de-d766-43af-81b1-e9e349245634", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, binding, options);
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
     * @param {TaskAgentInterfaces.ServiceEndpoint} endpoint
     * @param {string} project - Project ID or project name
     */
    createServiceEndpoint(endpoint, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.2", "distributedtask", "dca61d2f-3444-410a-b5ec-db2fc4efb4c5", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, endpoint, options);
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
     * @param {string} project - Project ID or project name
     * @param {string} endpointId
     */
    deleteServiceEndpoint(project, endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    endpointId: endpointId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.2", "distributedtask", "dca61d2f-3444-410a-b5ec-db2fc4efb4c5", routeValues);
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
     * @param {string} project - Project ID or project name
     * @param {string} endpointId
     */
    getServiceEndpointDetails(project, endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    endpointId: endpointId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.2", "distributedtask", "dca61d2f-3444-410a-b5ec-db2fc4efb4c5", routeValues);
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
     * @param {string} project - Project ID or project name
     * @param {string} type
     * @param {string[]} authSchemes
     * @param {string[]} endpointIds
     * @param {boolean} includeFailed
     */
    getServiceEndpoints(project, type, authSchemes, endpointIds, includeFailed) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    type: type,
                    authSchemes: authSchemes && authSchemes.join(","),
                    endpointIds: endpointIds && endpointIds.join(","),
                    includeFailed: includeFailed,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.2", "distributedtask", "dca61d2f-3444-410a-b5ec-db2fc4efb4c5", routeValues, queryValues);
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
     * @param {TaskAgentInterfaces.ServiceEndpoint} endpoint
     * @param {string} project - Project ID or project name
     * @param {string} endpointId
     */
    updateServiceEndpoint(endpoint, project, endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    endpointId: endpointId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.2", "distributedtask", "dca61d2f-3444-410a-b5ec-db2fc4efb4c5", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, endpoint, options);
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
     * @param {TaskAgentInterfaces.ServiceEndpoint[]} endpoints
     * @param {string} project - Project ID or project name
     */
    updateServiceEndpoints(endpoints, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.2", "distributedtask", "dca61d2f-3444-410a-b5ec-db2fc4efb4c5", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, endpoints, options);
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
     * @param {string} type
     * @param {string} scheme
     */
    getServiceEndpointTypes(type, scheme) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    type: type,
                    scheme: scheme,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "7c74af83-8605-45c1-a30b-7a05d5d7f8c1", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.ServiceEndpointType, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.TaskAgentSession} session
     * @param {number} poolId
     */
    createAgentSession(session, poolId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "134e239e-2df3-4794-a6f6-24f1f19ec8dc", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, session, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgentSession, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} poolId
     * @param {string} sessionId
     */
    deleteAgentSession(poolId, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    sessionId: sessionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "134e239e-2df3-4794-a6f6-24f1f19ec8dc", routeValues);
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
     * @param {TaskAgentInterfaces.TaskGroup} taskGroup
     * @param {string} project - Project ID or project name
     */
    addTaskGroup(taskGroup, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "6c08ffbf-dbf1-4f9a-94e5-a1cbd47005e7", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, taskGroup, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskGroup, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {string} taskGroupId
     */
    deleteTaskGroup(project, taskGroupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    taskGroupId: taskGroupId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "6c08ffbf-dbf1-4f9a-94e5-a1cbd47005e7", routeValues);
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
     * @param {string} project - Project ID or project name
     * @param {string} taskGroupId
     * @param {number} revision
     */
    getTaskGroupRevision(project, taskGroupId, revision) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    taskGroupId: taskGroupId
                };
                let queryValues = {
                    revision: revision,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "6c08ffbf-dbf1-4f9a-94e5-a1cbd47005e7", routeValues, queryValues);
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
     * @param {string} project - Project ID or project name
     * @param {string} taskGroupId
     * @param {boolean} expanded
     */
    getTaskGroups(project, taskGroupId, expanded) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    taskGroupId: taskGroupId
                };
                let queryValues = {
                    expanded: expanded,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "6c08ffbf-dbf1-4f9a-94e5-a1cbd47005e7", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskGroup, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.TaskGroup} taskGroup
     * @param {string} project - Project ID or project name
     */
    updateTaskGroup(taskGroup, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "6c08ffbf-dbf1-4f9a-94e5-a1cbd47005e7", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, taskGroup, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskGroup, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} taskId
     */
    deleteTaskDefinition(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    taskId: taskId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "60aac929-f0cd-4bc8-9ce4-6b30e8f1b1bd", routeValues);
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
     * @param {string} taskId
     * @param {string} versionString
     * @param {string[]} visibility
     * @param {boolean} scopeLocal
     */
    getTaskContentZip(taskId, versionString, visibility, scopeLocal) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    taskId: taskId,
                    versionString: versionString
                };
                let queryValues = {
                    visibility: visibility,
                    scopeLocal: scopeLocal,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "60aac929-f0cd-4bc8-9ce4-6b30e8f1b1bd", routeValues, queryValues);
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
     * @param {string} taskId
     * @param {string} versionString
     * @param {string[]} visibility
     * @param {boolean} scopeLocal
     */
    getTaskDefinition(taskId, versionString, visibility, scopeLocal) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    taskId: taskId,
                    versionString: versionString
                };
                let queryValues = {
                    visibility: visibility,
                    scopeLocal: scopeLocal,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "60aac929-f0cd-4bc8-9ce4-6b30e8f1b1bd", routeValues, queryValues);
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
     * @param {string} taskId
     * @param {string[]} visibility
     * @param {boolean} scopeLocal
     */
    getTaskDefinitions(taskId, visibility, scopeLocal) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    taskId: taskId
                };
                let queryValues = {
                    visibility: visibility,
                    scopeLocal: scopeLocal,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "60aac929-f0cd-4bc8-9ce4-6b30e8f1b1bd", routeValues, queryValues);
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
     * @param {number} poolId
     * @param {number} agentId
     * @param {string} currentState
     */
    updateAgentUpdateState(poolId, agentId, currentState) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    agentId: agentId
                };
                let queryValues = {
                    currentState: currentState,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "8cc1b02b-ae49-4516-b5ad-4f9b29967c30", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgent, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {{ [key: string] : string; }} userCapabilities
     * @param {number} poolId
     * @param {number} agentId
     */
    updateAgentUserCapabilities(userCapabilities, poolId, agentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    poolId: poolId,
                    agentId: agentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "30ba3ada-fedf-4da8-bbb5-dacf2f82e176", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, userCapabilities, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.TaskAgent, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.VariableGroup} group
     * @param {string} project - Project ID or project name
     */
    addVariableGroup(group, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "f5b09dd5-9d54-45a1-8b5a-1c8287d634cc", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, group, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.VariableGroup, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} groupId
     */
    deleteVariableGroup(project, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    groupId: groupId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "f5b09dd5-9d54-45a1-8b5a-1c8287d634cc", routeValues);
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
     * @param {string} project - Project ID or project name
     * @param {number} groupId
     */
    getVariableGroup(project, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    groupId: groupId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "f5b09dd5-9d54-45a1-8b5a-1c8287d634cc", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.VariableGroup, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {string} groupName
     * @param {TaskAgentInterfaces.VariableGroupActionFilter} actionFilter
     */
    getVariableGroups(project, groupName, actionFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    groupName: groupName,
                    actionFilter: actionFilter,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "f5b09dd5-9d54-45a1-8b5a-1c8287d634cc", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.VariableGroup, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number[]} groupIds
     */
    getVariableGroupsById(project, groupIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    groupIds: groupIds && groupIds.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "f5b09dd5-9d54-45a1-8b5a-1c8287d634cc", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.VariableGroup, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.VariableGroup} group
     * @param {string} project - Project ID or project name
     * @param {number} groupId
     */
    updateVariableGroup(group, project, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    groupId: groupId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "f5b09dd5-9d54-45a1-8b5a-1c8287d634cc", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, group, options);
                    let ret = this.formatResponse(res.result, TaskAgentInterfaces.TypeInfo.VariableGroup, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TaskAgentInterfaces.AadOauthTokenRequest} authenticationRequest
     */
    acquireAccessToken(authenticationRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "9c63205e-3a0f-42a0-ad88-095200f13607", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, authenticationRequest, options);
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
     * @param {string} tenantId
     * @param {string} redirectUri
     * @param {TaskAgentInterfaces.AadLoginPromptOption} promptOption
     */
    createAadOAuthRequest(tenantId, redirectUri, promptOption) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    tenantId: tenantId,
                    redirectUri: redirectUri,
                    promptOption: promptOption,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "9c63205e-3a0f-42a0-ad88-095200f13607", routeValues, queryValues);
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
     */
    getVstsAadTenantId() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "distributedtask", "9c63205e-3a0f-42a0-ad88-095200f13607", routeValues);
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
exports.TaskAgentApiBase = TaskAgentApiBase;
