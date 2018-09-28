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
const PolicyInterfaces = require("./interfaces/PolicyInterfaces");
class PolicyApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-Policy-api', options);
    }
    /**
     * Create a policy configuration of a given policy type.
     *
     * @param {PolicyInterfaces.PolicyConfiguration} configuration - The policy configuration to create.
     * @param {string} project - Project ID or project name
     * @param {number} configurationId
     */
    createPolicyConfiguration(configuration, project, configurationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    configurationId: configurationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "policy", "dad91cbe-d183-45f8-9c6e-9c1164472121", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, configuration, options);
                    let ret = this.formatResponse(res.result, PolicyInterfaces.TypeInfo.PolicyConfiguration, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Delete a policy configuration by its ID.
     *
     * @param {string} project - Project ID or project name
     * @param {number} configurationId - ID of the policy configuration to delete.
     */
    deletePolicyConfiguration(project, configurationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    configurationId: configurationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "policy", "dad91cbe-d183-45f8-9c6e-9c1164472121", routeValues);
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
     * Get a policy configuration by its ID.
     *
     * @param {string} project - Project ID or project name
     * @param {number} configurationId - ID of the policy configuration
     */
    getPolicyConfiguration(project, configurationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    configurationId: configurationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "policy", "dad91cbe-d183-45f8-9c6e-9c1164472121", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, PolicyInterfaces.TypeInfo.PolicyConfiguration, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a list of policy configurations in a project.
     *
     * @param {string} project - Project ID or project name
     * @param {string} scope - The scope on which a subset of policies is applied.
     */
    getPolicyConfigurations(project, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    scope: scope,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "policy", "dad91cbe-d183-45f8-9c6e-9c1164472121", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, PolicyInterfaces.TypeInfo.PolicyConfiguration, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update a policy configuration by its ID.
     *
     * @param {PolicyInterfaces.PolicyConfiguration} configuration - The policy configuration to update.
     * @param {string} project - Project ID or project name
     * @param {number} configurationId - ID of the existing policy configuration to be updated.
     */
    updatePolicyConfiguration(configuration, project, configurationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    configurationId: configurationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "policy", "dad91cbe-d183-45f8-9c6e-9c1164472121", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, configuration, options);
                    let ret = this.formatResponse(res.result, PolicyInterfaces.TypeInfo.PolicyConfiguration, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets the present evaluation state of a policy.
     *
     * @param {string} project - Project ID or project name
     * @param {string} evaluationId - ID of the policy evaluation to be retrieved.
     */
    getPolicyEvaluation(project, evaluationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    evaluationId: evaluationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "policy", "46aecb7a-5d2c-4647-897b-0209505a9fe4", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, PolicyInterfaces.TypeInfo.PolicyEvaluationRecord, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Requeue the policy evaluation.
     *
     * @param {string} project - Project ID or project name
     * @param {string} evaluationId - ID of the policy evaluation to be retrieved.
     */
    requeuePolicyEvaluation(project, evaluationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    evaluationId: evaluationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "policy", "46aecb7a-5d2c-4647-897b-0209505a9fe4", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, options);
                    let ret = this.formatResponse(res.result, PolicyInterfaces.TypeInfo.PolicyEvaluationRecord, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieves a list of all the policy evaluation statuses for a specific pull request.
     *
     * @param {string} project - Project ID or project name
     * @param {string} artifactId - A string which uniquely identifies the target of a policy evaluation.
     * @param {boolean} includeNotApplicable - Some policies might determine that they do not apply to a specific pull request. Setting this parameter to true will return evaluation records even for policies which don't apply to this pull request.
     * @param {number} top - The number of policy evaluation records to retrieve.
     * @param {number} skip - The number of policy evaluation records to ignore. For example, to retrieve results 101-150, set top to 50 and skip to 100.
     */
    getPolicyEvaluations(project, artifactId, includeNotApplicable, top, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    artifactId: artifactId,
                    includeNotApplicable: includeNotApplicable,
                    '$top': top,
                    '$skip': skip,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "policy", "c23ddff5-229c-4d04-a80b-0fdce9f360c8", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, PolicyInterfaces.TypeInfo.PolicyEvaluationRecord, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve a specific revision of a given policy by ID.
     *
     * @param {string} project - Project ID or project name
     * @param {number} configurationId - The policy configuration ID.
     * @param {number} revisionId - The revision ID.
     */
    getPolicyConfigurationRevision(project, configurationId, revisionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    configurationId: configurationId,
                    revisionId: revisionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "policy", "fe1e68a2-60d3-43cb-855b-85e41ae97c95", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, PolicyInterfaces.TypeInfo.PolicyConfiguration, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve all revisions for a given policy.
     *
     * @param {string} project - Project ID or project name
     * @param {number} configurationId - The policy configuration ID.
     * @param {number} top - The number of revisions to retrieve.
     * @param {number} skip - The number of revisions to ignore. For example, to retrieve results 101-150, set top to 50 and skip to 100.
     */
    getPolicyConfigurationRevisions(project, configurationId, top, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    configurationId: configurationId
                };
                let queryValues = {
                    '$top': top,
                    '$skip': skip,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "policy", "fe1e68a2-60d3-43cb-855b-85e41ae97c95", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, PolicyInterfaces.TypeInfo.PolicyConfiguration, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieve a specific policy type by ID.
     *
     * @param {string} project - Project ID or project name
     * @param {string} typeId - The policy ID.
     */
    getPolicyType(project, typeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    typeId: typeId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "policy", "44096322-2d3d-466a-bb30-d1b7de69f61f", routeValues);
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
     * Retrieve all available policy types.
     *
     * @param {string} project - Project ID or project name
     */
    getPolicyTypes(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "policy", "44096322-2d3d-466a-bb30-d1b7de69f61f", routeValues);
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
PolicyApi.RESOURCE_AREA_ID = "fb13a388-40dd-4a04-b530-013a739c72ef";
exports.PolicyApi = PolicyApi;
