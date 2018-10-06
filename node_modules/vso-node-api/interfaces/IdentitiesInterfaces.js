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
var FrameworkIdentityType;
(function (FrameworkIdentityType) {
    FrameworkIdentityType[FrameworkIdentityType["None"] = 0] = "None";
    FrameworkIdentityType[FrameworkIdentityType["ServiceIdentity"] = 1] = "ServiceIdentity";
    FrameworkIdentityType[FrameworkIdentityType["AggregateIdentity"] = 2] = "AggregateIdentity";
    FrameworkIdentityType[FrameworkIdentityType["ImportedIdentity"] = 3] = "ImportedIdentity";
})(FrameworkIdentityType = exports.FrameworkIdentityType || (exports.FrameworkIdentityType = {}));
var GroupScopeType;
(function (GroupScopeType) {
    GroupScopeType[GroupScopeType["Generic"] = 0] = "Generic";
    GroupScopeType[GroupScopeType["ServiceHost"] = 1] = "ServiceHost";
    GroupScopeType[GroupScopeType["TeamProject"] = 2] = "TeamProject";
})(GroupScopeType = exports.GroupScopeType || (exports.GroupScopeType = {}));
var QueryMembership;
(function (QueryMembership) {
    /**
     * Query will not return any membership data
     */
    QueryMembership[QueryMembership["None"] = 0] = "None";
    /**
     * Query will return only direct membership data
     */
    QueryMembership[QueryMembership["Direct"] = 1] = "Direct";
    /**
     * Query will return expanded membership data
     */
    QueryMembership[QueryMembership["Expanded"] = 2] = "Expanded";
    /**
     * Query will return expanded up membership data (parents only)
     */
    QueryMembership[QueryMembership["ExpandedUp"] = 3] = "ExpandedUp";
    /**
     * Query will return expanded down membership data (children only)
     */
    QueryMembership[QueryMembership["ExpandedDown"] = 4] = "ExpandedDown";
})(QueryMembership = exports.QueryMembership || (exports.QueryMembership = {}));
var ReadIdentitiesOptions;
(function (ReadIdentitiesOptions) {
    ReadIdentitiesOptions[ReadIdentitiesOptions["None"] = 0] = "None";
    ReadIdentitiesOptions[ReadIdentitiesOptions["FilterIllegalMemberships"] = 1] = "FilterIllegalMemberships";
})(ReadIdentitiesOptions = exports.ReadIdentitiesOptions || (exports.ReadIdentitiesOptions = {}));
exports.TypeInfo = {
    CreateScopeInfo: {},
    FrameworkIdentityInfo: {},
    FrameworkIdentityType: {
        enumValues: {
            "none": 0,
            "serviceIdentity": 1,
            "aggregateIdentity": 2,
            "importedIdentity": 3
        }
    },
    GroupScopeType: {
        enumValues: {
            "generic": 0,
            "serviceHost": 1,
            "teamProject": 2
        }
    },
    IdentityBatchInfo: {},
    IdentityScope: {},
    IdentitySnapshot: {},
    QueryMembership: {
        enumValues: {
            "none": 0,
            "direct": 1,
            "expanded": 2,
            "expandedUp": 3,
            "expandedDown": 4
        }
    },
    ReadIdentitiesOptions: {
        enumValues: {
            "none": 0,
            "filterIllegalMemberships": 1
        }
    },
};
exports.TypeInfo.CreateScopeInfo.fields = {
    scopeType: {
        enumType: exports.TypeInfo.GroupScopeType
    }
};
exports.TypeInfo.FrameworkIdentityInfo.fields = {
    identityType: {
        enumType: exports.TypeInfo.FrameworkIdentityType
    }
};
exports.TypeInfo.IdentityBatchInfo.fields = {
    queryMembership: {
        enumType: exports.TypeInfo.QueryMembership
    }
};
exports.TypeInfo.IdentityScope.fields = {
    scopeType: {
        enumType: exports.TypeInfo.GroupScopeType
    }
};
exports.TypeInfo.IdentitySnapshot.fields = {
    scopes: {
        isArray: true,
        typeInfo: exports.TypeInfo.IdentityScope
    }
};
