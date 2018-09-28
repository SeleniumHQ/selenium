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
 * identifies the scope of dashboard storage and permissions.
 */
var DashboardScope;
(function (DashboardScope) {
    DashboardScope[DashboardScope["Collection_User"] = 0] = "Collection_User";
    DashboardScope[DashboardScope["Project_Team"] = 1] = "Project_Team";
})(DashboardScope = exports.DashboardScope || (exports.DashboardScope = {}));
var GroupMemberPermission;
(function (GroupMemberPermission) {
    GroupMemberPermission[GroupMemberPermission["None"] = 0] = "None";
    GroupMemberPermission[GroupMemberPermission["Edit"] = 1] = "Edit";
    GroupMemberPermission[GroupMemberPermission["Manage"] = 2] = "Manage";
    GroupMemberPermission[GroupMemberPermission["ManagePermissions"] = 3] = "ManagePermissions";
})(GroupMemberPermission = exports.GroupMemberPermission || (exports.GroupMemberPermission = {}));
var TeamDashboardPermission;
(function (TeamDashboardPermission) {
    TeamDashboardPermission[TeamDashboardPermission["None"] = 0] = "None";
    TeamDashboardPermission[TeamDashboardPermission["Read"] = 1] = "Read";
    TeamDashboardPermission[TeamDashboardPermission["Create"] = 2] = "Create";
    TeamDashboardPermission[TeamDashboardPermission["Edit"] = 4] = "Edit";
    TeamDashboardPermission[TeamDashboardPermission["Delete"] = 8] = "Delete";
    TeamDashboardPermission[TeamDashboardPermission["ManagePermissions"] = 16] = "ManagePermissions";
})(TeamDashboardPermission = exports.TeamDashboardPermission || (exports.TeamDashboardPermission = {}));
/**
 * data contract required for the widget to function in a webaccess area or page.
 */
var WidgetScope;
(function (WidgetScope) {
    WidgetScope[WidgetScope["Collection_User"] = 0] = "Collection_User";
    WidgetScope[WidgetScope["Project_Team"] = 1] = "Project_Team";
})(WidgetScope = exports.WidgetScope || (exports.WidgetScope = {}));
exports.TypeInfo = {
    DashboardGroup: {},
    DashboardScope: {
        enumValues: {
            "collection_User": 0,
            "project_Team": 1
        }
    },
    GroupMemberPermission: {
        enumValues: {
            "none": 0,
            "edit": 1,
            "manage": 2,
            "managePermissions": 3
        }
    },
    TeamDashboardPermission: {
        enumValues: {
            "none": 0,
            "read": 1,
            "create": 2,
            "edit": 4,
            "delete": 8,
            "managePermissions": 16
        }
    },
    WidgetMetadata: {},
    WidgetMetadataResponse: {},
    WidgetScope: {
        enumValues: {
            "collection_User": 0,
            "project_Team": 1
        }
    },
    WidgetTypesResponse: {},
};
exports.TypeInfo.DashboardGroup.fields = {
    permission: {
        enumType: exports.TypeInfo.GroupMemberPermission
    },
    teamDashboardPermission: {
        enumType: exports.TypeInfo.TeamDashboardPermission
    }
};
exports.TypeInfo.WidgetMetadata.fields = {
    supportedScopes: {
        isArray: true,
        enumType: exports.TypeInfo.WidgetScope
    }
};
exports.TypeInfo.WidgetMetadataResponse.fields = {
    widgetMetadata: {
        typeInfo: exports.TypeInfo.WidgetMetadata
    }
};
exports.TypeInfo.WidgetTypesResponse.fields = {
    widgetTypes: {
        isArray: true,
        typeInfo: exports.TypeInfo.WidgetMetadata
    }
};
