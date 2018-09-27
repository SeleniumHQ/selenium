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
var RoleAccess;
(function (RoleAccess) {
    /**
     * Access has been explicitly set.
     */
    RoleAccess[RoleAccess["Assigned"] = 1] = "Assigned";
    /**
     * Access has been inherited from a higher scope.
     */
    RoleAccess[RoleAccess["Inherited"] = 2] = "Inherited";
})(RoleAccess = exports.RoleAccess || (exports.RoleAccess = {}));
exports.TypeInfo = {
    RoleAccess: {
        enumValues: {
            "assigned": 1,
            "inherited": 2
        }
    },
    RoleAssignment: {},
};
exports.TypeInfo.RoleAssignment.fields = {
    access: {
        enumType: exports.TypeInfo.RoleAccess
    },
};
