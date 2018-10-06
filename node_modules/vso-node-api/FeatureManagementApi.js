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
const FeatureManagementInterfaces = require("./interfaces/FeatureManagementInterfaces");
class FeatureManagementApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-FeatureManagement-api', options);
    }
    /**
     * Get a specific feature by its id
     *
     * @param {string} featureId - The contribution id of the feature
     */
    getFeature(featureId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    featureId: featureId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "FeatureManagement", "c4209f25-7a27-41dd-9f04-06080c7b6afd", routeValues);
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
     * Get a list of all defined features
     *
     * @param {string} targetContributionId - Optional target contribution. If null/empty, return all features. If specified include the features that target the specified contribution.
     */
    getFeatures(targetContributionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    targetContributionId: targetContributionId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "FeatureManagement", "c4209f25-7a27-41dd-9f04-06080c7b6afd", routeValues, queryValues);
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
     * Get the state of the specified feature for the given user/all-users scope
     *
     * @param {string} featureId - Contribution id of the feature
     * @param {string} userScope - User-Scope at which to get the value. Should be "me" for the current user or "host" for all users.
     */
    getFeatureState(featureId, userScope) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    featureId: featureId,
                    userScope: userScope
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "FeatureManagement", "98911314-3f9b-4eaf-80e8-83900d8e85d9", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, FeatureManagementInterfaces.TypeInfo.ContributedFeatureState, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Set the state of a feature
     *
     * @param {FeatureManagementInterfaces.ContributedFeatureState} feature - Posted feature state object. Should specify the effective value.
     * @param {string} featureId - Contribution id of the feature
     * @param {string} userScope - User-Scope at which to set the value. Should be "me" for the current user or "host" for all users.
     * @param {string} reason - Reason for changing the state
     * @param {string} reasonCode - Short reason code
     */
    setFeatureState(feature, featureId, userScope, reason, reasonCode) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    featureId: featureId,
                    userScope: userScope
                };
                let queryValues = {
                    reason: reason,
                    reasonCode: reasonCode,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "FeatureManagement", "98911314-3f9b-4eaf-80e8-83900d8e85d9", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, feature, options);
                    let ret = this.formatResponse(res.result, FeatureManagementInterfaces.TypeInfo.ContributedFeatureState, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get the state of the specified feature for the given named scope
     *
     * @param {string} featureId - Contribution id of the feature
     * @param {string} userScope - User-Scope at which to get the value. Should be "me" for the current user or "host" for all users.
     * @param {string} scopeName - Scope at which to get the feature setting for (e.g. "project" or "team")
     * @param {string} scopeValue - Value of the scope (e.g. the project or team id)
     */
    getFeatureStateForScope(featureId, userScope, scopeName, scopeValue) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    featureId: featureId,
                    userScope: userScope,
                    scopeName: scopeName,
                    scopeValue: scopeValue
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "FeatureManagement", "dd291e43-aa9f-4cee-8465-a93c78e414a4", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, FeatureManagementInterfaces.TypeInfo.ContributedFeatureState, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Set the state of a feature at a specific scope
     *
     * @param {FeatureManagementInterfaces.ContributedFeatureState} feature - Posted feature state object. Should specify the effective value.
     * @param {string} featureId - Contribution id of the feature
     * @param {string} userScope - User-Scope at which to set the value. Should be "me" for the current user or "host" for all users.
     * @param {string} scopeName - Scope at which to get the feature setting for (e.g. "project" or "team")
     * @param {string} scopeValue - Value of the scope (e.g. the project or team id)
     * @param {string} reason - Reason for changing the state
     * @param {string} reasonCode - Short reason code
     */
    setFeatureStateForScope(feature, featureId, userScope, scopeName, scopeValue, reason, reasonCode) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    featureId: featureId,
                    userScope: userScope,
                    scopeName: scopeName,
                    scopeValue: scopeValue
                };
                let queryValues = {
                    reason: reason,
                    reasonCode: reasonCode,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "FeatureManagement", "dd291e43-aa9f-4cee-8465-a93c78e414a4", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, feature, options);
                    let ret = this.formatResponse(res.result, FeatureManagementInterfaces.TypeInfo.ContributedFeatureState, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get the effective state for a list of feature ids
     *
     * @param {FeatureManagementInterfaces.ContributedFeatureStateQuery} query - Features to query along with current scope values
     */
    queryFeatureStates(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "FeatureManagement", "2b4486ad-122b-400c-ae65-17b6672c1f9d", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, query, options);
                    let ret = this.formatResponse(res.result, FeatureManagementInterfaces.TypeInfo.ContributedFeatureStateQuery, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get the states of the specified features for the default scope
     *
     * @param {FeatureManagementInterfaces.ContributedFeatureStateQuery} query - Query describing the features to query.
     * @param {string} userScope
     */
    queryFeatureStatesForDefaultScope(query, userScope) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    userScope: userScope
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "FeatureManagement", "3f810f28-03e2-4239-b0bc-788add3005e5", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, query, options);
                    let ret = this.formatResponse(res.result, FeatureManagementInterfaces.TypeInfo.ContributedFeatureStateQuery, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get the states of the specified features for the specific named scope
     *
     * @param {FeatureManagementInterfaces.ContributedFeatureStateQuery} query - Query describing the features to query.
     * @param {string} userScope
     * @param {string} scopeName
     * @param {string} scopeValue
     */
    queryFeatureStatesForNamedScope(query, userScope, scopeName, scopeValue) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    userScope: userScope,
                    scopeName: scopeName,
                    scopeValue: scopeValue
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "FeatureManagement", "f29e997b-c2da-4d15-8380-765788a1a74c", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, query, options);
                    let ret = this.formatResponse(res.result, FeatureManagementInterfaces.TypeInfo.ContributedFeatureStateQuery, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
}
exports.FeatureManagementApi = FeatureManagementApi;
