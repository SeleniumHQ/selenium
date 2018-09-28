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
const LocationsInterfaces = require("./interfaces/LocationsInterfaces");
class LocationsApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-Locations-api', options);
    }
    /**
     * This was copied and adapted from TeamFoundationConnectionService.Connect()
     *
     * @param {VSSInterfaces.ConnectOptions} connectOptions
     * @param {number} lastChangeId - Obsolete 32-bit LastChangeId
     * @param {number} lastChangeId64 - Non-truncated 64-bit LastChangeId
     */
    getConnectionData(connectOptions, lastChangeId, lastChangeId64) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    connectOptions: connectOptions,
                    lastChangeId: lastChangeId,
                    lastChangeId64: lastChangeId64,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Location", "00d9565f-ed9c-4a06-9a50-00e7896ccab4", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, LocationsInterfaces.TypeInfo.ConnectionData, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} areaId
     * @param {string} organizationName
     * @param {string} accountName
     */
    getResourceArea(areaId, organizationName, accountName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    areaId: areaId
                };
                let queryValues = {
                    organizationName: organizationName,
                    accountName: accountName,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Location", "e81700f7-3be2-46de-8624-2eb35882fcaa", routeValues, queryValues);
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
     * @param {string} areaId
     * @param {string} hostId
     */
    getResourceAreaByHost(areaId, hostId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    areaId: areaId
                };
                let queryValues = {
                    hostId: hostId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Location", "e81700f7-3be2-46de-8624-2eb35882fcaa", routeValues, queryValues);
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
     * @param {string} organizationName
     * @param {string} accountName
     */
    getResourceAreas(organizationName, accountName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    organizationName: organizationName,
                    accountName: accountName,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Location", "e81700f7-3be2-46de-8624-2eb35882fcaa", routeValues, queryValues);
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
     * @param {string} hostId
     */
    getResourceAreasByHost(hostId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    hostId: hostId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Location", "e81700f7-3be2-46de-8624-2eb35882fcaa", routeValues, queryValues);
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
     * @param {string} serviceType
     * @param {string} identifier
     */
    deleteServiceDefinition(serviceType, identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    serviceType: serviceType,
                    identifier: identifier
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Location", "d810a47d-f4f4-4a62-a03f-fa1860585c4c", routeValues);
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
     * Finds a given service definition.
     *
     * @param {string} serviceType
     * @param {string} identifier
     * @param {boolean} allowFaultIn - If true, we will attempt to fault in a host instance mapping if in SPS.
     * @param {boolean} previewFaultIn - If true, we will calculate and return a host instance mapping, but not persist it.
     */
    getServiceDefinition(serviceType, identifier, allowFaultIn, previewFaultIn) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    serviceType: serviceType,
                    identifier: identifier
                };
                let queryValues = {
                    allowFaultIn: allowFaultIn,
                    previewFaultIn: previewFaultIn,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Location", "d810a47d-f4f4-4a62-a03f-fa1860585c4c", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, LocationsInterfaces.TypeInfo.ServiceDefinition, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} serviceType
     */
    getServiceDefinitions(serviceType) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    serviceType: serviceType
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Location", "d810a47d-f4f4-4a62-a03f-fa1860585c4c", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, LocationsInterfaces.TypeInfo.ServiceDefinition, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {VSSInterfaces.VssJsonCollectionWrapperV<LocationsInterfaces.ServiceDefinition[]>} serviceDefinitions
     */
    updateServiceDefinitions(serviceDefinitions) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Location", "d810a47d-f4f4-4a62-a03f-fa1860585c4c", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, serviceDefinitions, options);
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
exports.LocationsApi = LocationsApi;
