/*
 * ---------------------------------------------------------
 * Copyright(C) Microsoft Corporation. All rights reserved.
 * ---------------------------------------------------------
 *
 * ---------------------------------------------------------
 * Generated file, DO NOT EDIT
 * ---------------------------------------------------------
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Enumeration of the options that can be passed in on Connect.
 */
var ConnectOptions;
(function (ConnectOptions) {
    /**
     * Retrieve no optional data.
     */
    ConnectOptions[ConnectOptions["None"] = 0] = "None";
    /**
     * Includes information about AccessMappings and ServiceDefinitions.
     */
    ConnectOptions[ConnectOptions["IncludeServices"] = 1] = "IncludeServices";
    /**
     * Includes the last user access for this host.
     */
    ConnectOptions[ConnectOptions["IncludeLastUserAccess"] = 2] = "IncludeLastUserAccess";
    /**
     * This is only valid on the deployment host and when true. Will only return inherited definitions.
     */
    ConnectOptions[ConnectOptions["IncludeInheritedDefinitionsOnly"] = 4] = "IncludeInheritedDefinitionsOnly";
    /**
     * When true will only return non inherited definitions. Only valid at non-deployment host.
     */
    ConnectOptions[ConnectOptions["IncludeNonInheritedDefinitionsOnly"] = 8] = "IncludeNonInheritedDefinitionsOnly";
})(ConnectOptions = exports.ConnectOptions || (exports.ConnectOptions = {}));
var JWTAlgorithm;
(function (JWTAlgorithm) {
    JWTAlgorithm[JWTAlgorithm["None"] = 0] = "None";
    JWTAlgorithm[JWTAlgorithm["HS256"] = 1] = "HS256";
    JWTAlgorithm[JWTAlgorithm["RS256"] = 2] = "RS256";
})(JWTAlgorithm = exports.JWTAlgorithm || (exports.JWTAlgorithm = {}));
var Operation;
(function (Operation) {
    Operation[Operation["Add"] = 0] = "Add";
    Operation[Operation["Remove"] = 1] = "Remove";
    Operation[Operation["Replace"] = 2] = "Replace";
    Operation[Operation["Move"] = 3] = "Move";
    Operation[Operation["Copy"] = 4] = "Copy";
    Operation[Operation["Test"] = 5] = "Test";
})(Operation = exports.Operation || (exports.Operation = {}));
exports.TypeInfo = {
    ConnectOptions: {
        enumValues: {
            "none": 0,
            "includeServices": 1,
            "includeLastUserAccess": 2,
            "includeInheritedDefinitionsOnly": 4,
            "includeNonInheritedDefinitionsOnly": 8
        }
    },
    JsonPatchOperation: {},
    JWTAlgorithm: {
        enumValues: {
            "none": 0,
            "hS256": 1,
            "rS256": 2
        }
    },
    Operation: {
        enumValues: {
            "add": 0,
            "remove": 1,
            "replace": 2,
            "move": 3,
            "copy": 4,
            "test": 5
        }
    },
};
exports.TypeInfo.JsonPatchOperation.fields = {
    op: {
        enumType: exports.TypeInfo.Operation
    }
};
