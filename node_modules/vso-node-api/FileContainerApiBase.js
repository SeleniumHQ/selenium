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
const FileContainerInterfaces = require("./interfaces/FileContainerInterfaces");
class FileContainerApiBase extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-FileContainer-api', options);
    }
    /**
     * Creates the specified items in in the referenced container.
     *
     * @param {VSSInterfaces.VssJsonCollectionWrapperV<FileContainerInterfaces.FileContainerItem[]>} items
     * @param {number} containerId
     * @param {string} scope - A guid representing the scope of the container. This is often the project id.
     */
    createItems(items, containerId, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    containerId: containerId
                };
                let queryValues = {
                    scope: scope,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.4", "Container", "e4f5c81e-e250-447b-9fef-bd48471bea5e", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, items, options);
                    let ret = this.formatResponse(res.result, FileContainerInterfaces.TypeInfo.FileContainerItem, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Deletes the specified items in a container.
     *
     * @param {number} containerId - Container Id.
     * @param {string} itemPath - Path to delete.
     * @param {string} scope - A guid representing the scope of the container. This is often the project id.
     */
    deleteItem(containerId, itemPath, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    containerId: containerId
                };
                let queryValues = {
                    itemPath: itemPath,
                    scope: scope,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.4", "Container", "e4f5c81e-e250-447b-9fef-bd48471bea5e", routeValues, queryValues);
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
     * Gets containers filtered by a comma separated list of artifact uris within the same scope, if not specified returns all containers
     *
     * @param {string} scope - A guid representing the scope of the container. This is often the project id.
     * @param {string} artifactUris
     */
    getContainers(scope, artifactUris) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    scope: scope,
                    artifactUris: artifactUris,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.4", "Container", "e4f5c81e-e250-447b-9fef-bd48471bea5e", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, FileContainerInterfaces.TypeInfo.FileContainer, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} containerId
     * @param {string} scope
     * @param {string} itemPath
     * @param {boolean} metadata
     * @param {string} format
     * @param {string} downloadFileName
     * @param {boolean} includeDownloadTickets
     * @param {boolean} isShallow
     */
    getItems(containerId, scope, itemPath, metadata, format, downloadFileName, includeDownloadTickets, isShallow) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    containerId: containerId
                };
                let queryValues = {
                    scope: scope,
                    itemPath: itemPath,
                    metadata: metadata,
                    '$format': format,
                    downloadFileName: downloadFileName,
                    includeDownloadTickets: includeDownloadTickets,
                    isShallow: isShallow,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.4", "Container", "e4f5c81e-e250-447b-9fef-bd48471bea5e", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, FileContainerInterfaces.TypeInfo.FileContainerItem, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
}
exports.FileContainerApiBase = FileContainerApiBase;
