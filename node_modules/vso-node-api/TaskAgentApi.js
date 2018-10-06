"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const taskagentbasem = require("./TaskAgentApiBase");
const url = require("url");
class TaskAgentApi extends taskagentbasem.TaskAgentApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, options);
        // hang on to the handlers in case we need to fall back to an account-level client
        this._handlers = handlers;
        this._options = options;
    }
    /**
     * @param {string} taskId
     * @param onResult callback function
     */
    deleteTaskDefinition(taskId) {
        let promise = this.vsoClient.beginGetLocation("distributedtask", "60aac929-f0cd-4bc8-9ce4-6b30e8f1b1bd")
            .then((location) => {
            if (location) {
                // the resource exists at the url we were given. go!
                return super.deleteTaskDefinition(taskId);
            }
            else {
                // this is the case when the server doesn't support collection-level task definitions
                var fallbackClient = this._getFallbackClient(this.baseUrl);
                if (!fallbackClient) {
                    // couldn't convert
                    throw new Error("Failed to find api location for area: distributedtask id: 60aac929-f0cd-4bc8-9ce4-6b30e8f1b1bd");
                }
                else {
                    // use the fallback client 
                    return fallbackClient.deleteTaskDefinition(taskId);
                }
            }
        });
        return promise;
    }
    /**
     * @param {string} taskId
     * @param {string} versionString
     * @param {string[]} visibility
     * @param {boolean} scopeLocal
     * @param onResult callback function with the resulting ArrayBuffer
     */
    getTaskContentZip(taskId, versionString, visibility, scopeLocal) {
        let promise = this.vsoClient.beginGetLocation("distributedtask", "60aac929-f0cd-4bc8-9ce4-6b30e8f1b1bd")
            .then((location) => {
            if (location) {
                // the resource exists at the url we were given. go!
                return super.getTaskContentZip(taskId, versionString, visibility, scopeLocal);
            }
            else {
                // this is the case when the server doesn't support collection-level task definitions
                var fallbackClient = this._getFallbackClient(this.baseUrl);
                if (!fallbackClient) {
                    // couldn't convert
                    throw new Error("Failed to find api location for area: distributedtask id: 60aac929-f0cd-4bc8-9ce4-6b30e8f1b1bd");
                }
                else {
                    // use the fallback client 
                    return fallbackClient.getTaskContentZip(taskId, versionString, visibility, scopeLocal);
                }
            }
        });
        return promise;
    }
    /**
     * @param {string} taskId
     * @param {string} versionString
     * @param {string[]} visibility
     * @param {boolean} scopeLocal
     * @param onResult callback function with the resulting TaskAgentInterfaces.TaskDefinition
     */
    getTaskDefinition(taskId, versionString, visibility, scopeLocal) {
        let promise = this.vsoClient.beginGetLocation("distributedtask", "60aac929-f0cd-4bc8-9ce4-6b30e8f1b1bd")
            .then((location) => {
            if (location) {
                // the resource exists at the url we were given. go!
                return super.getTaskDefinition(taskId, versionString, visibility, scopeLocal);
            }
            else {
                // this is the case when the server doesn't support collection-level task definitions
                var fallbackClient = this._getFallbackClient(this.baseUrl);
                if (!fallbackClient) {
                    // couldn't convert
                    throw new Error("Failed to find api location for area: distributedtask id: 60aac929-f0cd-4bc8-9ce4-6b30e8f1b1bd");
                }
                else {
                    // use the fallback client 
                    return fallbackClient.getTaskDefinition(taskId, versionString, visibility, scopeLocal);
                }
            }
        });
        return promise;
    }
    /**
     * @param {string} taskId
     * @param {string[]} visibility
     * @param {boolean} scopeLocal
     * @param onResult callback function with the resulting TaskAgentInterfaces.TaskDefinition[]
     */
    getTaskDefinitions(taskId, visibility, scopeLocal) {
        let promise = this.vsoClient.beginGetLocation("distributedtask", "60aac929-f0cd-4bc8-9ce4-6b30e8f1b1bd")
            .then((location) => {
            if (location) {
                // the resource exists at the url we were given. go!
                return super.getTaskDefinitions(taskId, visibility, scopeLocal);
            }
            else {
                // this is the case when the server doesn't support collection-level task definitions
                var fallbackClient = this._getFallbackClient(this.baseUrl);
                if (!fallbackClient) {
                    // couldn't convert
                    throw new Error("Failed to find api location for area: distributedtask id: 60aac929-f0cd-4bc8-9ce4-6b30e8f1b1bd");
                }
                else {
                    // use the fallback client 
                    return fallbackClient.getTaskDefinitions(taskId, visibility, scopeLocal);
                }
            }
        });
        return promise;
    }
    /**
     * @param {NodeJS.ReadableStream} contentStream
     * @param {string} taskId
     * @param {boolean} overwrite
     * @param onResult callback function
     */
    uploadTaskDefinition(customHeaders, contentStream, taskId, overwrite) {
        return __awaiter(this, void 0, void 0, function* () {
            let routeValues = {
                taskId: taskId
            };
            let queryValues = {
                overwrite: overwrite,
            };
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                customHeaders = customHeaders || {};
                customHeaders["Content-Type"] = "application/octet-stream";
                try {
                    let verData = yield this.vsoClient.getVersioningData("3.0-preview.1", "distributedtask", "60aac929-f0cd-4bc8-9ce4-6b30e8f1b1bd", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    options.additionalHeaders = customHeaders;
                    let res;
                    res = yield this.rest.uploadStream("POST", url, contentStream, options);
                    resolve(res.result);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    _getFallbackClient(baseUrl) {
        if (!this._fallbackClient) {
            var accountUrl = this._getAccountUrl(baseUrl);
            if (accountUrl) {
                this._fallbackClient = new TaskAgentApi(accountUrl, this._handlers, this._options);
            }
        }
        return this._fallbackClient;
    }
    _getAccountUrl(collectionUrl) {
        // converts a collection URL to an account URL
        // returns null if the conversion can't be made
        var purl = url.parse(collectionUrl);
        if (!purl.protocol || !purl.host) {
            return null;
        }
        var accountUrl = purl.protocol + '//' + purl.host;
        // purl.path is something like /DefaultCollection or /tfs/DefaultCollection or /DefaultCollection/
        var splitPath = purl.path.split('/').slice(1);
        if (splitPath.length === 0 || (splitPath.length === 1 && splitPath[0] === '')) {
            return null;
        }
        // if the first segment of the path is tfs, the second is the collection. if the url ends in / there will be a third, empty entry
        if (splitPath[0] === 'tfs' && (splitPath.length === 2 || (splitPath.length === 3 && splitPath[2].length === 0))) {
            //on prem
            accountUrl += '/' + 'tfs';
        }
        else if (splitPath.length === 2 && splitPath[0] === '') {
            // /DefaultCollection/
            return accountUrl;
        }
        else if (splitPath.length > 1) {
            return null;
        }
        return accountUrl;
    }
}
exports.TaskAgentApi = TaskAgentApi;
