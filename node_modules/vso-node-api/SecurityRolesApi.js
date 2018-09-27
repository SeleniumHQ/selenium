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
const SecurityRolesInterfaces = require("./interfaces/SecurityRolesInterfaces");
class SecurityRolesApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-SecurityRoles-api', options);
    }
    /**
     * @param {string} scopeId
     * @param {string} resourceId
     */
    getRoleAssignments(scopeId, resourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    scopeId: scopeId,
                    resourceId: resourceId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "securityroles", "9461c234-c84c-4ed2-b918-2f0f92ad0a35", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, SecurityRolesInterfaces.TypeInfo.RoleAssignment, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} scopeId
     * @param {string} resourceId
     * @param {string} identityId
     */
    removeRoleAssignment(scopeId, resourceId, identityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    scopeId: scopeId,
                    resourceId: resourceId,
                    identityId: identityId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "securityroles", "9461c234-c84c-4ed2-b918-2f0f92ad0a35", routeValues);
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
     * @param {string[]} identityIds
     * @param {string} scopeId
     * @param {string} resourceId
     */
    removeRoleAssignments(identityIds, scopeId, resourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    scopeId: scopeId,
                    resourceId: resourceId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "securityroles", "9461c234-c84c-4ed2-b918-2f0f92ad0a35", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, identityIds, options);
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
     * @param {SecurityRolesInterfaces.UserRoleAssignmentRef} roleAssignment
     * @param {string} scopeId
     * @param {string} resourceId
     * @param {string} identityId
     */
    setRoleAssignment(roleAssignment, scopeId, resourceId, identityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    scopeId: scopeId,
                    resourceId: resourceId,
                    identityId: identityId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "securityroles", "9461c234-c84c-4ed2-b918-2f0f92ad0a35", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, roleAssignment, options);
                    let ret = this.formatResponse(res.result, SecurityRolesInterfaces.TypeInfo.RoleAssignment, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {SecurityRolesInterfaces.UserRoleAssignmentRef[]} roleAssignments
     * @param {string} scopeId
     * @param {string} resourceId
     */
    setRoleAssignments(roleAssignments, scopeId, resourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    scopeId: scopeId,
                    resourceId: resourceId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "securityroles", "9461c234-c84c-4ed2-b918-2f0f92ad0a35", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, roleAssignments, options);
                    let ret = this.formatResponse(res.result, SecurityRolesInterfaces.TypeInfo.RoleAssignment, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} scopeId
     */
    getRoleDefinitions(scopeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    scopeId: scopeId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.2-preview.1", "securityroles", "f4cc9a86-453c-48d2-b44d-d3bd5c105f4f", routeValues);
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
exports.SecurityRolesApi = SecurityRolesApi;
