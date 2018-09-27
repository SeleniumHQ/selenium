"use strict";
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
Object.defineProperty(exports, "__esModule", { value: true });
class BearerCredentialHandler {
    constructor(token) {
        this.token = token;
    }
    // currently implements pre-authorization
    // TODO: support preAuth = false where it hooks on 401
    prepareRequest(options) {
        options.headers['Authorization'] = 'Bearer ' + this.token;
        options.headers['X-TFS-FedAuthRedirect'] = 'Suppress';
    }
    // This handler cannot handle 401
    canHandleAuthentication(res) {
        return false;
    }
    handleAuthentication(httpClient, protocol, options, objs, finalCallback) {
    }
}
exports.BearerCredentialHandler = BearerCredentialHandler;
