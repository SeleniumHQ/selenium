"use strict";
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const buildm = require("./BuildApi");
const corem = require("./CoreApi");
const dashboardm = require("./DashboardApi");
const extmgmtm = require("./ExtensionManagementApi");
const featuremgmtm = require("./FeatureManagementApi");
const filecontainerm = require("./FileContainerApi");
const gitm = require("./GitApi");
const locationsm = require("./LocationsApi");
const notificationm = require("./NotificationApi");
const policym = require("./PolicyApi");
const profilem = require("./ProfileApi");
const projectm = require("./ProjectAnalysisApi");
const releasem = require("./ReleaseApi");
const securityrolesm = require("./SecurityRolesApi");
const taskagentm = require("./TaskAgentApi");
const taskm = require("./TaskApi");
const testm = require("./TestApi");
const tfvcm = require("./TfvcApi");
const workm = require("./WorkApi");
const workitemtrackingm = require("./WorkItemTrackingApi");
const workitemtrackingprocessm = require("./WorkItemTrackingProcessApi");
const workitemtrackingprocessdefinitionm = require("./WorkItemTrackingProcessDefinitionsApi");
const basicm = require("./handlers/basiccreds");
const bearm = require("./handlers/bearertoken");
const ntlmm = require("./handlers/ntlm");
const patm = require("./handlers/personalaccesstoken");
const rm = require("typed-rest-client/RestClient");
const vsom = require("./VsoClient");
const fs = require("fs");
const crypto = require("crypto");
/**
 * Methods to return handler objects (see handlers folder)
 */
function getBasicHandler(username, password) {
    return new basicm.BasicCredentialHandler(username, password);
}
exports.getBasicHandler = getBasicHandler;
function getNtlmHandler(username, password, workstation, domain) {
    return new ntlmm.NtlmCredentialHandler(username, password, workstation, domain);
}
exports.getNtlmHandler = getNtlmHandler;
function getBearerHandler(token) {
    return new bearm.BearerCredentialHandler(token);
}
exports.getBearerHandler = getBearerHandler;
function getPersonalAccessTokenHandler(token) {
    return new patm.PersonalAccessTokenCredentialHandler(token);
}
exports.getPersonalAccessTokenHandler = getPersonalAccessTokenHandler;
function getHandlerFromToken(token) {
    if (token.length === 52) {
        return getPersonalAccessTokenHandler(token);
    }
    else {
        return getBearerHandler(token);
    }
}
exports.getHandlerFromToken = getHandlerFromToken;
// ---------------------------------------------------------------------------
// Factory to return client apis
// When new APIs are added, a method must be added here to instantiate the API
//----------------------------------------------------------------------------
class WebApi {
    /*
     * Factory to return client apis and handlers
     * @param defaultUrl default server url to use when creating new apis from factory methods
     * @param authHandler default authentication credentials to use when creating new apis from factory methods
     */
    constructor(defaultUrl, authHandler, options) {
        this.serverUrl = defaultUrl;
        this.authHandler = authHandler;
        this.options = options || {};
        // try get proxy setting from environment variable set by VSTS-Task-Lib if there is no proxy setting in the options
        if (!this.options.proxy || !this.options.proxy.proxyUrl) {
            if (global['_vsts_task_lib_proxy']) {
                let proxyFromEnv = {
                    proxyUrl: global['_vsts_task_lib_proxy_url'],
                    proxyUsername: global['_vsts_task_lib_proxy_username'],
                    proxyPassword: this._readTaskLibSecrets(global['_vsts_task_lib_proxy_password']),
                    proxyBypassHosts: JSON.parse(global['_vsts_task_lib_proxy_bypass'] || "[]"),
                };
                this.options.proxy = proxyFromEnv;
            }
        }
        // try get cert setting from environment variable set by VSTS-Task-Lib if there is no cert setting in the options
        if (!this.options.cert) {
            if (global['_vsts_task_lib_cert']) {
                let certFromEnv = {
                    caFile: global['_vsts_task_lib_cert_ca'],
                    certFile: global['_vsts_task_lib_cert_clientcert'],
                    keyFile: global['_vsts_task_lib_cert_key'],
                    passphrase: this._readTaskLibSecrets(global['_vsts_task_lib_cert_passphrase']),
                };
                this.options.cert = certFromEnv;
            }
        }
        // try get ignore SSL error setting from environment variable set by VSTS-Task-Lib if there is no ignore SSL error setting in the options
        if (!this.options.ignoreSslError) {
            this.options.ignoreSslError = !!global['_vsts_task_lib_skip_cert_validation'];
        }
        this.rest = new rm.RestClient('vsts-node-api', null, [this.authHandler], this.options);
        this.vsoClient = new vsom.VsoClient(defaultUrl, this.rest);
    }
    /**
     *  Convenience factory to create with a bearer token.
     * @param defaultServerUrl default server url to use when creating new apis from factory methods
     * @param defaultAuthHandler default authentication credentials to use when creating new apis from factory methods
     */
    static createWithBearerToken(defaultUrl, token, options) {
        let bearerHandler = getBearerHandler(token);
        return new this(defaultUrl, bearerHandler, options);
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let res;
                    res = yield this.rest.get(this.vsoClient.resolveUrl('/_apis/connectionData'));
                    resolve(res.result);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Each factory method can take a serverUrl and a list of handlers
     * if these aren't provided, the default url and auth handler given to the constructor for this class will be used
     */
    getBuildApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, buildm.BuildApi.RESOURCE_AREA_ID);
            handlers = handlers || [this.authHandler];
            return new buildm.BuildApi(serverUrl, handlers, this.options);
        });
    }
    getCoreApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "79134c72-4a58-4b42-976c-04e7115f32bf");
            handlers = handlers || [this.authHandler];
            return new corem.CoreApi(serverUrl, handlers, this.options);
        });
    }
    getDashboardApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "31c84e0a-3ece-48fd-a29d-100849af99ba");
            handlers = handlers || [this.authHandler];
            return new dashboardm.DashboardApi(serverUrl, handlers, this.options);
        });
    }
    getExtensionManagementApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "6c2b0933-3600-42ae-bf8b-93d4f7e83594");
            handlers = handlers || [this.authHandler];
            return new extmgmtm.ExtensionManagementApi(serverUrl, handlers, this.options);
        });
    }
    getFeatureManagementApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "");
            handlers = handlers || [this.authHandler];
            return new featuremgmtm.FeatureManagementApi(serverUrl, handlers, this.options);
        });
    }
    getFileContainerApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "");
            handlers = handlers || [this.authHandler];
            return new filecontainerm.FileContainerApi(serverUrl, handlers, this.options);
        });
    }
    getGitApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, gitm.GitApi.RESOURCE_AREA_ID);
            handlers = handlers || [this.authHandler];
            return new gitm.GitApi(serverUrl, handlers, this.options);
        });
    }
    // TODO: Don't call resource area here? Will cause infinite loop?
    getLocationsApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            serverUrl = (yield serverUrl) || this.serverUrl;
            handlers = handlers || [this.authHandler];
            return new locationsm.LocationsApi(serverUrl, handlers, this.options);
        });
    }
    getNotificationApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "");
            handlers = handlers || [this.authHandler];
            return new notificationm.NotificationApi(serverUrl, handlers, this.options);
        });
    }
    getPolicyApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "fb13a388-40dd-4a04-b530-013a739c72ef");
            handlers = handlers || [this.authHandler];
            return new policym.PolicyApi(serverUrl, handlers, this.options);
        });
    }
    getProfileApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "8ccfef3d-2b87-4e99-8ccb-66e343d2daa8");
            handlers = handlers || [this.authHandler];
            return new profilem.ProfileApi(serverUrl, handlers, this.options);
        });
    }
    getProjectAnalysisApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "7658fa33-b1bf-4580-990f-fac5896773d3");
            handlers = handlers || [this.authHandler];
            return new projectm.ProjectAnalysisApi(serverUrl, handlers, this.options);
        });
    }
    getSecurityRolesApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "");
            handlers = handlers || [this.authHandler];
            return new securityrolesm.SecurityRolesApi(serverUrl, handlers, this.options);
        });
    }
    getReleaseApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "efc2f575-36ef-48e9-b672-0c6fb4a48ac5");
            handlers = handlers || [this.authHandler];
            return new releasem.ReleaseApi(serverUrl, handlers, this.options);
        });
    }
    getTaskApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "");
            handlers = handlers || [this.authHandler];
            return new taskm.TaskApi(serverUrl, handlers, this.options);
        });
    }
    getTaskAgentApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "a85b8835-c1a1-4aac-ae97-1c3d0ba72dbd");
            handlers = handlers || [this.authHandler];
            return new taskagentm.TaskAgentApi(serverUrl, handlers, this.options);
        });
    }
    getTestApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "c2aa639c-3ccc-4740-b3b6-ce2a1e1d984e");
            handlers = handlers || [this.authHandler];
            return new testm.TestApi(serverUrl, handlers, this.options);
        });
    }
    getTfvcApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "8aa40520-446d-40e6-89f6-9c9f9ce44c48");
            handlers = handlers || [this.authHandler];
            return new tfvcm.TfvcApi(serverUrl, handlers, this.options);
        });
    }
    getWorkApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "1d4f49f9-02b9-4e26-b826-2cdb6195f2a9");
            handlers = handlers || [this.authHandler];
            return new workm.WorkApi(serverUrl, handlers, this.options);
        });
    }
    getWorkItemTrackingApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, workitemtrackingm.WorkItemTrackingApi.RESOURCE_AREA_ID);
            handlers = handlers || [this.authHandler];
            return new workitemtrackingm.WorkItemTrackingApi(serverUrl, handlers, this.options);
        });
    }
    getWorkItemTrackingProcessApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "5264459e-e5e0-4bd8-b118-0985e68a4ec5");
            handlers = handlers || [this.authHandler];
            return new workitemtrackingprocessm.WorkItemTrackingProcessApi(serverUrl, handlers, this.options);
        });
    }
    getWorkItemTrackingProcessDefinitionApi(serverUrl, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Load RESOURCE_AREA_ID correctly.
            serverUrl = yield this._getResourceAreaUrl(serverUrl || this.serverUrl, "5264459e-e5e0-4bd8-b118-0985e68a4ec5");
            handlers = handlers || [this.authHandler];
            return new workitemtrackingprocessdefinitionm.WorkItemTrackingProcessDefinitionsApi(serverUrl, handlers, this.options);
        });
    }
    _getResourceAreaUrl(serverUrl, resourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!resourceId) {
                return serverUrl;
            }
            // This must be of type any, see comment just below.
            const resourceAreas = yield this._getResourceAreas();
            if (resourceAreas === undefined) {
                throw new Error((`Failed to retrieve resource areas ' + 'from server: ${serverUrl}`));
            }
            // The response type differs based on whether or not there are resource areas. When we are on prem we get:
            // {"count":0,"value":null} and when we are on VSTS we get an array of resource areas.
            // Due to this strangeness the type of resourceAreas needs to be any and we need to check .count
            // When going against vsts count will be undefined. On prem it will be 0
            if (!resourceAreas || resourceAreas.length === 0 || resourceAreas.count === 0) {
                // For on prem environments we get an empty list
                return serverUrl;
            }
            for (var resourceArea of resourceAreas) {
                if (resourceArea.id.toLowerCase() === resourceId.toLowerCase()) {
                    return resourceArea.locationUrl;
                }
            }
            throw new Error((`Could not find information for resource area ${resourceId} ' + 'from server: ${serverUrl}`));
        });
    }
    _getResourceAreas() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._resourceAreas) {
                const locationClient = yield this.getLocationsApi();
                this._resourceAreas = yield locationClient.getResourceAreas();
            }
            return this._resourceAreas;
        });
    }
    _readTaskLibSecrets(lookupKey) {
        // the lookupKey should has following format
        // base64encoded<keyFilePath>:base64encoded<encryptedContent>
        if (lookupKey && lookupKey.indexOf(':') > 0) {
            let lookupInfo = lookupKey.split(':', 2);
            // file contains encryption key
            let keyFile = new Buffer(lookupInfo[0], 'base64').toString('utf8');
            let encryptKey = new Buffer(fs.readFileSync(keyFile, 'utf8'), 'base64');
            let encryptedContent = new Buffer(lookupInfo[1], 'base64').toString('utf8');
            let decipher = crypto.createDecipher("aes-256-ctr", encryptKey);
            let decryptedContent = decipher.update(encryptedContent, 'hex', 'utf8');
            decryptedContent += decipher.final('utf8');
            return decryptedContent;
        }
    }
}
exports.WebApi = WebApi;
