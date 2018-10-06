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
const WorkItemTrackingProcessDefinitionsInterfaces = require("./interfaces/WorkItemTrackingProcessDefinitionsInterfaces");
class WorkItemTrackingProcessDefinitionsApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-WorkItemTracking-api', options);
    }
    /**
     * Creates a single behavior in the given process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.BehaviorCreateModel} behavior
     * @param {string} processId - The ID of the process
     */
    createBehavior(behavior, processId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "47a651f4-fb70-43bf-b96b-7c0ba947142b", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, behavior, options);
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
     * Removes a behavior in the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} behaviorId - The ID of the behavior
     */
    deleteBehavior(processId, behaviorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    behaviorId: behaviorId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "47a651f4-fb70-43bf-b96b-7c0ba947142b", routeValues);
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
     * Returns a single behavior in the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} behaviorId - The ID of the behavior
     */
    getBehavior(processId, behaviorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    behaviorId: behaviorId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "47a651f4-fb70-43bf-b96b-7c0ba947142b", routeValues);
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
     */
    getBehaviors(processId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "47a651f4-fb70-43bf-b96b-7c0ba947142b", routeValues);
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
     * Replaces a behavior in the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.BehaviorReplaceModel} behaviorData
     * @param {string} processId - The ID of the process
     * @param {string} behaviorId - The ID of the behavior
     */
    replaceBehavior(behaviorData, processId, behaviorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    behaviorId: behaviorId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "47a651f4-fb70-43bf-b96b-7c0ba947142b", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, behaviorData, options);
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
     * Creates a control in a group
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Control} control - The control
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} groupId - The ID of the group to add the control to
     */
    addControlToGroup(control, processId, witRefName, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    groupId: groupId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "e2e3166a-627a-4e9b-85b2-d6a097bbd731", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, control, options);
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
     * Updates a control on the work item form
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Control} control - The updated control
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} groupId - The ID of the group
     * @param {string} controlId - The ID of the control
     */
    editControl(control, processId, witRefName, groupId, controlId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    groupId: groupId,
                    controlId: controlId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "e2e3166a-627a-4e9b-85b2-d6a097bbd731", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, control, options);
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
     * Removes a control from the work item form
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} groupId - The ID of the group
     * @param {string} controlId - The ID of the control to remove
     */
    removeControlFromGroup(processId, witRefName, groupId, controlId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    groupId: groupId,
                    controlId: controlId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "e2e3166a-627a-4e9b-85b2-d6a097bbd731", routeValues);
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
     * Moves a control to a new group
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Control} control - The control
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} groupId - The ID of the group to move the control to
     * @param {string} controlId - The id of the control
     * @param {string} removeFromGroupId - The group to remove the control from
     */
    setControlInGroup(control, processId, witRefName, groupId, controlId, removeFromGroupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    groupId: groupId,
                    controlId: controlId
                };
                let queryValues = {
                    removeFromGroupId: removeFromGroupId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "e2e3166a-627a-4e9b-85b2-d6a097bbd731", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, control, options);
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
     * Creates a single field in the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.FieldModel} field
     * @param {string} processId - The ID of the process
     */
    createField(field, processId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "f36c66c7-911d-4163-8938-d3c5d0d7f5aa", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, field, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessDefinitionsInterfaces.TypeInfo.FieldModel, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Updates a given field in the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.FieldUpdate} field
     * @param {string} processId - The ID of the process
     */
    updateField(field, processId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "f36c66c7-911d-4163-8938-d3c5d0d7f5aa", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, field, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessDefinitionsInterfaces.TypeInfo.FieldModel, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Adds a group to the work item form
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Group} group - The group
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} pageId - The ID of the page to add the group to
     * @param {string} sectionId - The ID of the section to add the group to
     */
    addGroup(group, processId, witRefName, pageId, sectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    pageId: pageId,
                    sectionId: sectionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "2617828b-e850-4375-a92a-04855704d4c3", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, group, options);
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
     * Updates a group in the work item form
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Group} group - The updated group
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} pageId - The ID of the page the group is in
     * @param {string} sectionId - The ID of the section the group is in
     * @param {string} groupId - The ID of the group
     */
    editGroup(group, processId, witRefName, pageId, sectionId, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    pageId: pageId,
                    sectionId: sectionId,
                    groupId: groupId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "2617828b-e850-4375-a92a-04855704d4c3", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, group, options);
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
     * Removes a group from the work item form
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} pageId - The ID of the page the group is in
     * @param {string} sectionId - The ID of the section to the group is in
     * @param {string} groupId - The ID of the group
     */
    removeGroup(processId, witRefName, pageId, sectionId, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    pageId: pageId,
                    sectionId: sectionId,
                    groupId: groupId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "2617828b-e850-4375-a92a-04855704d4c3", routeValues);
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
     * Moves a group to a different page and section
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Group} group - The updated group
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} pageId - The ID of the page the group is in
     * @param {string} sectionId - The ID of the section the group is in
     * @param {string} groupId - The ID of the group
     * @param {string} removeFromPageId - ID of the page to remove the group from
     * @param {string} removeFromSectionId - ID of the section to remove the group from
     */
    setGroupInPage(group, processId, witRefName, pageId, sectionId, groupId, removeFromPageId, removeFromSectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    pageId: pageId,
                    sectionId: sectionId,
                    groupId: groupId
                };
                let queryValues = {
                    removeFromPageId: removeFromPageId,
                    removeFromSectionId: removeFromSectionId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "2617828b-e850-4375-a92a-04855704d4c3", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, group, options);
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
     * Moves a group to a different section
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Group} group - The updated group
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} pageId - The ID of the page the group is in
     * @param {string} sectionId - The ID of the section the group is in
     * @param {string} groupId - The ID of the group
     * @param {string} removeFromSectionId - ID of the section to remove the group from
     */
    setGroupInSection(group, processId, witRefName, pageId, sectionId, groupId, removeFromSectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    pageId: pageId,
                    sectionId: sectionId,
                    groupId: groupId
                };
                let queryValues = {
                    removeFromSectionId: removeFromSectionId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "2617828b-e850-4375-a92a-04855704d4c3", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, group, options);
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
     * Gets the form layout
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    getFormLayout(processId, witRefName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "3eacc80a-ddca-4404-857a-6331aac99063", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessDefinitionsInterfaces.TypeInfo.FormLayout, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Returns meta data of the picklist.
     *
     */
    getListsMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "b45cc931-98e3-44a1-b1cd-2e8e9c6dc1c6", routeValues);
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
     * Creates a picklist.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.PickListModel} picklist
     */
    createList(picklist) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "0b6179e2-23ce-46b2-b094-2ffa5ee70286", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, picklist, options);
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
     * Removes a picklist.
     *
     * @param {string} listId - The ID of the list
     */
    deleteList(listId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    listId: listId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "0b6179e2-23ce-46b2-b094-2ffa5ee70286", routeValues);
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
     * Returns a picklist.
     *
     * @param {string} listId - The ID of the list
     */
    getList(listId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    listId: listId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "0b6179e2-23ce-46b2-b094-2ffa5ee70286", routeValues);
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
     * Updates a list.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.PickListModel} picklist
     * @param {string} listId - The ID of the list
     */
    updateList(picklist, listId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    listId: listId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "0b6179e2-23ce-46b2-b094-2ffa5ee70286", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, picklist, options);
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
     * Adds a page to the work item form
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Page} page - The page
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    addPage(page, processId, witRefName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "1b4ac126-59b2-4f37-b4df-0a48ba807edb", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, page, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessDefinitionsInterfaces.TypeInfo.Page, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Updates a page on the work item form
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Page} page - The page
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    editPage(page, processId, witRefName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "1b4ac126-59b2-4f37-b4df-0a48ba807edb", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, page, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessDefinitionsInterfaces.TypeInfo.Page, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Removes a page from the work item form
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} pageId - The ID of the page
     */
    removePage(processId, witRefName, pageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    pageId: pageId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "1b4ac126-59b2-4f37-b4df-0a48ba807edb", routeValues);
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
     * Creates a state definition in the work item type of the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateInputModel} stateModel
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    createStateDefinition(stateModel, processId, witRefName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "4303625d-08f4-4461-b14b-32c65bba5599", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, stateModel, options);
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
     * Removes a state definition in the work item type of the process.
     *
     * @param {string} processId - ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} stateId - ID of the state
     */
    deleteStateDefinition(processId, witRefName, stateId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    stateId: stateId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "4303625d-08f4-4461-b14b-32c65bba5599", routeValues);
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
     * Returns a state definition in the work item type of the process.
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
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "4303625d-08f4-4461-b14b-32c65bba5599", routeValues);
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
     * Returns a list of all state definitions in the work item type of the process.
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
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "4303625d-08f4-4461-b14b-32c65bba5599", routeValues);
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
     * Hides a state definition in the work item type of the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.HideStateModel} hideStateModel
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} stateId - The ID of the state
     */
    hideStateDefinition(hideStateModel, processId, witRefName, stateId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    stateId: stateId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "4303625d-08f4-4461-b14b-32c65bba5599", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, hideStateModel, options);
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
     * Updates a given state definition in the work item type of the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateInputModel} stateModel
     * @param {string} processId - ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} stateId - ID of the state
     */
    updateStateDefinition(stateModel, processId, witRefName, stateId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName,
                    stateId: stateId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "4303625d-08f4-4461-b14b-32c65bba5599", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, stateModel, options);
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
     * Adds a behavior to the work item type of the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeBehavior} behavior
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForBehaviors - Work item type reference name for the behavior
     */
    addBehaviorToWorkItemType(behavior, processId, witRefNameForBehaviors) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefNameForBehaviors: witRefNameForBehaviors
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "921dfb88-ef57-4c69-94e5-dd7da2d7031d", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, behavior, options);
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
     * Returns a behavior for the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForBehaviors - Work item type reference name for the behavior
     * @param {string} behaviorRefName - The reference name of the behavior
     */
    getBehaviorForWorkItemType(processId, witRefNameForBehaviors, behaviorRefName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefNameForBehaviors: witRefNameForBehaviors,
                    behaviorRefName: behaviorRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "921dfb88-ef57-4c69-94e5-dd7da2d7031d", routeValues);
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
     * Returns a list of all behaviors for the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForBehaviors - Work item type reference name for the behavior
     */
    getBehaviorsForWorkItemType(processId, witRefNameForBehaviors) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefNameForBehaviors: witRefNameForBehaviors
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "921dfb88-ef57-4c69-94e5-dd7da2d7031d", routeValues);
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
     * Removes a behavior for the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForBehaviors - Work item type reference name for the behavior
     * @param {string} behaviorRefName - The reference name of the behavior
     */
    removeBehaviorFromWorkItemType(processId, witRefNameForBehaviors, behaviorRefName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefNameForBehaviors: witRefNameForBehaviors,
                    behaviorRefName: behaviorRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "921dfb88-ef57-4c69-94e5-dd7da2d7031d", routeValues);
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
     * Updates a behavior for the work item type of the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeBehavior} behavior
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForBehaviors - Work item type reference name for the behavior
     */
    updateBehaviorToWorkItemType(behavior, processId, witRefNameForBehaviors) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefNameForBehaviors: witRefNameForBehaviors
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "921dfb88-ef57-4c69-94e5-dd7da2d7031d", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, behavior, options);
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
     * Creates a work item type in the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeModel} workItemType
     * @param {string} processId - The ID of the process
     */
    createWorkItemType(workItemType, processId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "1ce0acad-4638-49c3-969c-04aa65ba6bea", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, workItemType, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessDefinitionsInterfaces.TypeInfo.WorkItemTypeModel, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Removes a work itewm type in the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    deleteWorkItemType(processId, witRefName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "1ce0acad-4638-49c3-969c-04aa65ba6bea", routeValues);
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
     * Returns a work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.GetWorkItemTypeExpand} expand
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
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "1ce0acad-4638-49c3-969c-04aa65ba6bea", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessDefinitionsInterfaces.TypeInfo.WorkItemTypeModel, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Returns a list of all work item types in the process.
     *
     * @param {string} processId - The ID of the process
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.GetWorkItemTypeExpand} expand
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
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "1ce0acad-4638-49c3-969c-04aa65ba6bea", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessDefinitionsInterfaces.TypeInfo.WorkItemTypeModel, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Updates a work item type of the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeUpdateModel} workItemTypeUpdate
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    updateWorkItemType(workItemTypeUpdate, processId, witRefName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefName: witRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "1ce0acad-4638-49c3-969c-04aa65ba6bea", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, workItemTypeUpdate, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessDefinitionsInterfaces.TypeInfo.WorkItemTypeModel, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Adds a field to the work item type in the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeFieldModel} field
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForFields - Work item type reference name for the field
     */
    addFieldToWorkItemType(field, processId, witRefNameForFields) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefNameForFields: witRefNameForFields
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "976713b4-a62e-499e-94dc-eeb869ea9126", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, field, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessDefinitionsInterfaces.TypeInfo.WorkItemTypeFieldModel, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retuens a single field in the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForFields - Work item type reference name for fields
     * @param {string} fieldRefName - The reference name of the field
     */
    getWorkItemTypeField(processId, witRefNameForFields, fieldRefName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefNameForFields: witRefNameForFields,
                    fieldRefName: fieldRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "976713b4-a62e-499e-94dc-eeb869ea9126", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessDefinitionsInterfaces.TypeInfo.WorkItemTypeFieldModel, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Returns a list of all fields in the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForFields - Work item type reference name for fields
     */
    getWorkItemTypeFields(processId, witRefNameForFields) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefNameForFields: witRefNameForFields
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "976713b4-a62e-499e-94dc-eeb869ea9126", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkItemTrackingProcessDefinitionsInterfaces.TypeInfo.WorkItemTypeFieldModel, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Removes a field in the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForFields - Work item type reference name for fields
     * @param {string} fieldRefName - The reference name of the field
     */
    removeFieldFromWorkItemType(processId, witRefNameForFields, fieldRefName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    processId: processId,
                    witRefNameForFields: witRefNameForFields,
                    fieldRefName: fieldRefName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "processDefinitions", "976713b4-a62e-499e-94dc-eeb869ea9126", routeValues);
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
}
exports.WorkItemTrackingProcessDefinitionsApi = WorkItemTrackingProcessDefinitionsApi;
