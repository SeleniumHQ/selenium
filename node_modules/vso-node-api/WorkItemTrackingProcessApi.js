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
const WorkItemTrackingProcessInterfaces = require("./interfaces/WorkItemTrackingProcessInterfaces");
class WorkItemTrackingProcessApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-WorkItemTracking-api', options);
    }
    /**
     * Returns a behavior of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} behaviorRefName - Reference name of the behavior
     * @param {WorkItemTrackingProcessInterfaces.GetBehaviorsExpand} expand
     */
    getBehavior(processId, behaviorRefName, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    behaviorRefName: behaviorRefName
                };
                let queryValues = {
                    '$expand': expand,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "d1800200-f184-4e75-a5f2-ad0b04b4373e", routeValues, queryValues);
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
     * Returns a list of all behaviors in the process.
     *
     * @param {string} processId - The ID of the process
     * @param {WorkItemTrackingProcessInterfaces.GetBehaviorsExpand} expand
     */
    getBehaviors(processId, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId
                };
                let queryValues = {
                    '$expand': expand,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "d1800200-f184-4e75-a5f2-ad0b04b4373e", routeValues, queryValues);
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
     * Returns a list of all fields in a process.
     *
     * @param {string} processId - The ID of the process
     */
    getFields(processId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "7a0e7a1a-0b34-4ae0-9744-0aaffb7d0ed1", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessInterfaces.TypeInfo.FieldModel, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Returns a list of all fields in a work item type.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    getWorkItemTypeFields(processId, witRefName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "bc0ad8dc-e3f3-46b0-b06c-5bf861793196", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessInterfaces.TypeInfo.FieldModel, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Creates a process.
     *
     * @param {WorkItemTrackingProcessInterfaces.CreateProcessModel} createRequest
     */
    createProcess(createRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "02cc6a73-5cfb-427d-8c8e-b49fb086e8af", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, createRequest, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessInterfaces.TypeInfo.ProcessModel, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Removes a process of a specific ID.
     *
     * @param {string} processTypeId
     */
    deleteProcess(processTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processTypeId: processTypeId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "02cc6a73-5cfb-427d-8c8e-b49fb086e8af", routeValues);
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
     * Returns a single process of a specified ID.
     *
     * @param {string} processTypeId
     * @param {WorkItemTrackingProcessInterfaces.GetProcessExpandLevel} expand
     */
    getProcessById(processTypeId, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processTypeId: processTypeId
                };
                let queryValues = {
                    '$expand': expand,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "02cc6a73-5cfb-427d-8c8e-b49fb086e8af", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessInterfaces.TypeInfo.ProcessModel, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Returns a list of all processes.
     *
     * @param {WorkItemTrackingProcessInterfaces.GetProcessExpandLevel} expand
     */
    getProcesses(expand) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    '$expand': expand,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "02cc6a73-5cfb-427d-8c8e-b49fb086e8af", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessInterfaces.TypeInfo.ProcessModel, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Updates a process of a specific ID.
     *
     * @param {WorkItemTrackingProcessInterfaces.UpdateProcessModel} updateRequest
     * @param {string} processTypeId
     */
    updateProcess(updateRequest, processTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processTypeId: processTypeId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "02cc6a73-5cfb-427d-8c8e-b49fb086e8af", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, updateRequest, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessInterfaces.TypeInfo.ProcessModel, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Adds a rule to work item type in the process.
     *
     * @param {WorkItemTrackingProcessInterfaces.FieldRuleModel} fieldRule
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    addWorkItemTypeRule(fieldRule, processId, witRefName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "76fe3432-d825-479d-a5f6-983bbb78b4f3", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, fieldRule, options);
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
     * Removes a rule from the work item type in the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} ruleId - The ID of the rule
     */
    deleteWorkItemTypeRule(processId, witRefName, ruleId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    ruleId: ruleId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "76fe3432-d825-479d-a5f6-983bbb78b4f3", routeValues);
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
     * Returns a single rule in the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} ruleId - The ID of the rule
     */
    getWorkItemTypeRule(processId, witRefName, ruleId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    ruleId: ruleId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "76fe3432-d825-479d-a5f6-983bbb78b4f3", routeValues);
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
     * Returns a list of all rules in the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    getWorkItemTypeRules(processId, witRefName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "76fe3432-d825-479d-a5f6-983bbb78b4f3", routeValues);
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
     * Updates a rule in the work item type of the process.
     *
     * @param {WorkItemTrackingProcessInterfaces.FieldRuleModel} fieldRule
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} ruleId - The ID of the rule
     */
    updateWorkItemTypeRule(fieldRule, processId, witRefName, ruleId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    ruleId: ruleId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "76fe3432-d825-479d-a5f6-983bbb78b4f3", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, fieldRule, options);
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
     * Returns a single state definition in a work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} stateId - The ID of the state
     */
    getStateDefinition(processId, witRefName, stateId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    stateId: stateId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "31015d57-2dff-4a46-adb3-2fb4ee3dcec9", routeValues);
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
     * Returns a list of all state definitions in a work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    getStateDefinitions(processId, witRefName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "31015d57-2dff-4a46-adb3-2fb4ee3dcec9", routeValues);
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
     * Returns a single work item type in a process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {WorkItemTrackingProcessInterfaces.GetWorkItemTypeExpand} expand
     */
    getWorkItemType(processId, witRefName, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName
                };
                let queryValues = {
                    '$expand': expand,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "e2e9d1a6-432d-4062-8870-bfcb8c324ad7", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessInterfaces.TypeInfo.WorkItemTypeModel, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Returns a list of all work item types in a process.
     *
     * @param {string} processId - The ID of the process
     * @param {WorkItemTrackingProcessInterfaces.GetWorkItemTypeExpand} expand
     */
    getWorkItemTypes(processId, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId
                };
                let queryValues = {
                    '$expand': expand,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processes", "e2e9d1a6-432d-4062-8870-bfcb8c324ad7", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessInterfaces.TypeInfo.WorkItemTypeModel, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
}
exports.WorkItemTrackingProcessApi = WorkItemTrackingProcessApi;
