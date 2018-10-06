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
var FieldType;
(function (FieldType) {
    FieldType[FieldType["String"] = 1] = "String";
    FieldType[FieldType["Integer"] = 2] = "Integer";
    FieldType[FieldType["DateTime"] = 3] = "DateTime";
    FieldType[FieldType["PlainText"] = 5] = "PlainText";
    FieldType[FieldType["Html"] = 7] = "Html";
    FieldType[FieldType["TreePath"] = 8] = "TreePath";
    FieldType[FieldType["History"] = 9] = "History";
    FieldType[FieldType["Double"] = 10] = "Double";
    FieldType[FieldType["Guid"] = 11] = "Guid";
    FieldType[FieldType["Boolean"] = 12] = "Boolean";
    FieldType[FieldType["Identity"] = 13] = "Identity";
    FieldType[FieldType["PicklistInteger"] = 14] = "PicklistInteger";
    FieldType[FieldType["PicklistString"] = 15] = "PicklistString";
    FieldType[FieldType["PicklistDouble"] = 16] = "PicklistDouble";
})(FieldType = exports.FieldType || (exports.FieldType = {}));
var GetBehaviorsExpand;
(function (GetBehaviorsExpand) {
    GetBehaviorsExpand[GetBehaviorsExpand["None"] = 0] = "None";
    GetBehaviorsExpand[GetBehaviorsExpand["Fields"] = 1] = "Fields";
})(GetBehaviorsExpand = exports.GetBehaviorsExpand || (exports.GetBehaviorsExpand = {}));
var GetProcessExpandLevel;
(function (GetProcessExpandLevel) {
    GetProcessExpandLevel[GetProcessExpandLevel["None"] = 0] = "None";
    GetProcessExpandLevel[GetProcessExpandLevel["Projects"] = 1] = "Projects";
})(GetProcessExpandLevel = exports.GetProcessExpandLevel || (exports.GetProcessExpandLevel = {}));
var GetWorkItemTypeExpand;
(function (GetWorkItemTypeExpand) {
    GetWorkItemTypeExpand[GetWorkItemTypeExpand["None"] = 0] = "None";
    GetWorkItemTypeExpand[GetWorkItemTypeExpand["States"] = 1] = "States";
    GetWorkItemTypeExpand[GetWorkItemTypeExpand["Behaviors"] = 2] = "Behaviors";
    GetWorkItemTypeExpand[GetWorkItemTypeExpand["Layout"] = 4] = "Layout";
})(GetWorkItemTypeExpand = exports.GetWorkItemTypeExpand || (exports.GetWorkItemTypeExpand = {}));
var PageType;
(function (PageType) {
    PageType[PageType["Custom"] = 1] = "Custom";
    PageType[PageType["History"] = 2] = "History";
    PageType[PageType["Links"] = 3] = "Links";
    PageType[PageType["Attachments"] = 4] = "Attachments";
})(PageType = exports.PageType || (exports.PageType = {}));
var ProcessClass;
(function (ProcessClass) {
    ProcessClass[ProcessClass["System"] = 0] = "System";
    ProcessClass[ProcessClass["Derived"] = 1] = "Derived";
    ProcessClass[ProcessClass["Custom"] = 2] = "Custom";
})(ProcessClass = exports.ProcessClass || (exports.ProcessClass = {}));
var WorkItemTypeClass;
(function (WorkItemTypeClass) {
    WorkItemTypeClass[WorkItemTypeClass["System"] = 0] = "System";
    WorkItemTypeClass[WorkItemTypeClass["Derived"] = 1] = "Derived";
    WorkItemTypeClass[WorkItemTypeClass["Custom"] = 2] = "Custom";
})(WorkItemTypeClass = exports.WorkItemTypeClass || (exports.WorkItemTypeClass = {}));
exports.TypeInfo = {
    FieldModel: {},
    FieldType: {
        enumValues: {
            "string": 1,
            "integer": 2,
            "dateTime": 3,
            "plainText": 5,
            "html": 7,
            "treePath": 8,
            "history": 9,
            "double": 10,
            "guid": 11,
            "boolean": 12,
            "identity": 13,
            "picklistInteger": 14,
            "picklistString": 15,
            "picklistDouble": 16
        }
    },
    FormLayout: {},
    GetBehaviorsExpand: {
        enumValues: {
            "none": 0,
            "fields": 1
        }
    },
    GetProcessExpandLevel: {
        enumValues: {
            "none": 0,
            "projects": 1
        }
    },
    GetWorkItemTypeExpand: {
        enumValues: {
            "none": 0,
            "states": 1,
            "behaviors": 2,
            "layout": 4
        }
    },
    Page: {},
    PageType: {
        enumValues: {
            "custom": 1,
            "history": 2,
            "links": 3,
            "attachments": 4
        }
    },
    ProcessClass: {
        enumValues: {
            "system": 0,
            "derived": 1,
            "custom": 2
        }
    },
    ProcessModel: {},
    ProcessProperties: {},
    WorkItemTypeClass: {
        enumValues: {
            "system": 0,
            "derived": 1,
            "custom": 2
        }
    },
    WorkItemTypeModel: {},
};
exports.TypeInfo.FieldModel.fields = {
    type: {
        enumType: exports.TypeInfo.FieldType
    }
};
exports.TypeInfo.FormLayout.fields = {
    pages: {
        isArray: true,
        typeInfo: exports.TypeInfo.Page
    }
};
exports.TypeInfo.Page.fields = {
    pageType: {
        enumType: exports.TypeInfo.PageType
    }
};
exports.TypeInfo.ProcessModel.fields = {
    properties: {
        typeInfo: exports.TypeInfo.ProcessProperties
    }
};
exports.TypeInfo.ProcessProperties.fields = {
    class: {
        enumType: exports.TypeInfo.ProcessClass
    }
};
exports.TypeInfo.WorkItemTypeModel.fields = {
    class: {
        enumType: exports.TypeInfo.WorkItemTypeClass
    },
    layout: {
        typeInfo: exports.TypeInfo.FormLayout
    }
};
