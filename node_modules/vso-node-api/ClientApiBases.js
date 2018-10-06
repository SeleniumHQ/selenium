"use strict";
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
Object.defineProperty(exports, "__esModule", { value: true });
const vsom = require("./VsoClient");
const serm = require("./Serialization");
const rm = require("typed-rest-client/RestClient");
const hm = require("typed-rest-client/HttpClient");
class ClientApiBase {
    constructor(baseUrl, handlers, userAgent, options) {
        this.baseUrl = baseUrl;
        this.http = new hm.HttpClient(userAgent, handlers, options);
        this.rest = new rm.RestClient(userAgent, null, handlers, options);
        this.vsoClient = new vsom.VsoClient(baseUrl, this.rest);
        this.userAgent = userAgent;
    }
    createAcceptHeader(type, apiVersion) {
        return type + (apiVersion ? (';api-version=' + apiVersion) : '');
    }
    createRequestOptions(type, apiVersion) {
        let options = {};
        options.acceptHeader = this.createAcceptHeader(type, apiVersion);
        return options;
    }
    formatResponse(data, responseTypeMetadata, isCollection) {
        let serializationData = {
            responseTypeMetadata: responseTypeMetadata,
            responseIsCollection: isCollection
        };
        let deserializedResult = serm.ContractSerializer.deserialize(data, serializationData.responseTypeMetadata, false, serializationData.responseIsCollection);
        return deserializedResult;
    }
}
exports.ClientApiBase = ClientApiBase;
