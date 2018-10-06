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
var InheritLevel;
(function (InheritLevel) {
    InheritLevel[InheritLevel["None"] = 0] = "None";
    InheritLevel[InheritLevel["Deployment"] = 1] = "Deployment";
    InheritLevel[InheritLevel["Account"] = 2] = "Account";
    InheritLevel[InheritLevel["Collection"] = 4] = "Collection";
    InheritLevel[InheritLevel["All"] = 7] = "All";
})(InheritLevel = exports.InheritLevel || (exports.InheritLevel = {}));
var RelativeToSetting;
(function (RelativeToSetting) {
    RelativeToSetting[RelativeToSetting["Context"] = 0] = "Context";
    RelativeToSetting[RelativeToSetting["WebApplication"] = 2] = "WebApplication";
    RelativeToSetting[RelativeToSetting["FullyQualified"] = 3] = "FullyQualified";
})(RelativeToSetting = exports.RelativeToSetting || (exports.RelativeToSetting = {}));
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus[ServiceStatus["Assigned"] = 0] = "Assigned";
    ServiceStatus[ServiceStatus["Active"] = 1] = "Active";
    ServiceStatus[ServiceStatus["Moving"] = 2] = "Moving";
})(ServiceStatus = exports.ServiceStatus || (exports.ServiceStatus = {}));
exports.TypeInfo = {
    ConnectionData: {},
    InheritLevel: {
        enumValues: {
            "none": 0,
            "deployment": 1,
            "account": 2,
            "collection": 4,
            "all": 7
        }
    },
    LocationServiceData: {},
    RelativeToSetting: {
        enumValues: {
            "context": 0,
            "webApplication": 2,
            "fullyQualified": 3
        }
    },
    ServiceDefinition: {},
    ServiceStatus: {
        enumValues: {
            "assigned": 0,
            "active": 1,
            "moving": 2
        }
    },
};
exports.TypeInfo.ConnectionData.fields = {
    lastUserAccess: {
        isDate: true,
    },
    locationServiceData: {
        typeInfo: exports.TypeInfo.LocationServiceData
    }
};
exports.TypeInfo.LocationServiceData.fields = {
    serviceDefinitions: {
        isArray: true,
        typeInfo: exports.TypeInfo.ServiceDefinition
    }
};
exports.TypeInfo.ServiceDefinition.fields = {
    inheritLevel: {
        enumType: exports.TypeInfo.InheritLevel
    },
    relativeToSetting: {
        enumType: exports.TypeInfo.RelativeToSetting
    },
    status: {
        enumType: exports.TypeInfo.ServiceStatus
    }
};
