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
const GalleryInterfaces = require("../interfaces/GalleryInterfaces");
/**
 * How the acquisition is assigned
 */
var AcquisitionAssignmentType;
(function (AcquisitionAssignmentType) {
    AcquisitionAssignmentType[AcquisitionAssignmentType["None"] = 0] = "None";
    /**
     * Just assign for me
     */
    AcquisitionAssignmentType[AcquisitionAssignmentType["Me"] = 1] = "Me";
    /**
     * Assign for all users in the account
     */
    AcquisitionAssignmentType[AcquisitionAssignmentType["All"] = 2] = "All";
})(AcquisitionAssignmentType = exports.AcquisitionAssignmentType || (exports.AcquisitionAssignmentType = {}));
var AcquisitionOperationState;
(function (AcquisitionOperationState) {
    /**
     * Not allowed to use this AcquisitionOperation
     */
    AcquisitionOperationState[AcquisitionOperationState["Disallow"] = 0] = "Disallow";
    /**
     * Allowed to use this AcquisitionOperation
     */
    AcquisitionOperationState[AcquisitionOperationState["Allow"] = 1] = "Allow";
    /**
     * Operation has already been completed and is no longer available
     */
    AcquisitionOperationState[AcquisitionOperationState["Completed"] = 3] = "Completed";
})(AcquisitionOperationState = exports.AcquisitionOperationState || (exports.AcquisitionOperationState = {}));
/**
 * Set of different types of operations that can be requested.
 */
var AcquisitionOperationType;
(function (AcquisitionOperationType) {
    /**
     * Not yet used
     */
    AcquisitionOperationType[AcquisitionOperationType["Get"] = 0] = "Get";
    /**
     * Install this extension into the host provided
     */
    AcquisitionOperationType[AcquisitionOperationType["Install"] = 1] = "Install";
    /**
     * Buy licenses for this extension and install into the host provided
     */
    AcquisitionOperationType[AcquisitionOperationType["Buy"] = 2] = "Buy";
    /**
     * Try this extension
     */
    AcquisitionOperationType[AcquisitionOperationType["Try"] = 3] = "Try";
    /**
     * Request this extension for installation
     */
    AcquisitionOperationType[AcquisitionOperationType["Request"] = 4] = "Request";
    /**
     * No action found
     */
    AcquisitionOperationType[AcquisitionOperationType["None"] = 5] = "None";
    /**
     * Request admins for purchasing extension
     */
    AcquisitionOperationType[AcquisitionOperationType["PurchaseRequest"] = 6] = "PurchaseRequest";
})(AcquisitionOperationType = exports.AcquisitionOperationType || (exports.AcquisitionOperationType = {}));
/**
 * Represents different ways of including contributions based on licensing
 */
var ContributionLicensingBehaviorType;
(function (ContributionLicensingBehaviorType) {
    /**
     * Default value - only include the contribution if the user is licensed for the extension
     */
    ContributionLicensingBehaviorType[ContributionLicensingBehaviorType["OnlyIfLicensed"] = 0] = "OnlyIfLicensed";
    /**
     * Only include the contribution if the user is NOT licensed for the extension
     */
    ContributionLicensingBehaviorType[ContributionLicensingBehaviorType["OnlyIfUnlicensed"] = 1] = "OnlyIfUnlicensed";
    /**
     * Always include the contribution regardless of whether or not the user is licensed for the extension
     */
    ContributionLicensingBehaviorType[ContributionLicensingBehaviorType["AlwaysInclude"] = 2] = "AlwaysInclude";
})(ContributionLicensingBehaviorType = exports.ContributionLicensingBehaviorType || (exports.ContributionLicensingBehaviorType = {}));
/**
 * The type of value used for a property
 */
var ContributionPropertyType;
(function (ContributionPropertyType) {
    /**
     * Contribution type is unknown (value may be anything)
     */
    ContributionPropertyType[ContributionPropertyType["Unknown"] = 0] = "Unknown";
    /**
     * Value is a string
     */
    ContributionPropertyType[ContributionPropertyType["String"] = 1] = "String";
    /**
     * Value is a Uri
     */
    ContributionPropertyType[ContributionPropertyType["Uri"] = 2] = "Uri";
    /**
     * Value is a GUID
     */
    ContributionPropertyType[ContributionPropertyType["Guid"] = 4] = "Guid";
    /**
     * Value is True or False
     */
    ContributionPropertyType[ContributionPropertyType["Boolean"] = 8] = "Boolean";
    /**
     * Value is an integer
     */
    ContributionPropertyType[ContributionPropertyType["Integer"] = 16] = "Integer";
    /**
     * Value is a double
     */
    ContributionPropertyType[ContributionPropertyType["Double"] = 32] = "Double";
    /**
     * Value is a DateTime object
     */
    ContributionPropertyType[ContributionPropertyType["DateTime"] = 64] = "DateTime";
    /**
     * Value is a generic Dictionary/JObject/property bag
     */
    ContributionPropertyType[ContributionPropertyType["Dictionary"] = 128] = "Dictionary";
    /**
     * Value is an array
     */
    ContributionPropertyType[ContributionPropertyType["Array"] = 256] = "Array";
    /**
     * Value is an arbitrary/custom object
     */
    ContributionPropertyType[ContributionPropertyType["Object"] = 512] = "Object";
})(ContributionPropertyType = exports.ContributionPropertyType || (exports.ContributionPropertyType = {}));
/**
 * Options that control the contributions to include in a query
 */
var ContributionQueryOptions;
(function (ContributionQueryOptions) {
    ContributionQueryOptions[ContributionQueryOptions["None"] = 0] = "None";
    /**
     * Include the direct contributions that have the ids queried.
     */
    ContributionQueryOptions[ContributionQueryOptions["IncludeSelf"] = 16] = "IncludeSelf";
    /**
     * Include the contributions that directly target the contributions queried.
     */
    ContributionQueryOptions[ContributionQueryOptions["IncludeChildren"] = 32] = "IncludeChildren";
    /**
     * Include the contributions from the entire sub-tree targetting the contributions queried.
     */
    ContributionQueryOptions[ContributionQueryOptions["IncludeSubTree"] = 96] = "IncludeSubTree";
    /**
     * Include the contribution being queried as well as all contributions that target them recursively.
     */
    ContributionQueryOptions[ContributionQueryOptions["IncludeAll"] = 112] = "IncludeAll";
    /**
     * Some callers may want the entire tree back without constraint evaluation being performed.
     */
    ContributionQueryOptions[ContributionQueryOptions["IgnoreConstraints"] = 256] = "IgnoreConstraints";
})(ContributionQueryOptions = exports.ContributionQueryOptions || (exports.ContributionQueryOptions = {}));
/**
 * Set of flags applied to extensions that are relevant to contribution consumers
 */
var ExtensionFlags;
(function (ExtensionFlags) {
    /**
     * A built-in extension is installed for all VSTS accounts by default
     */
    ExtensionFlags[ExtensionFlags["BuiltIn"] = 1] = "BuiltIn";
    /**
     * The extension comes from a fully-trusted publisher
     */
    ExtensionFlags[ExtensionFlags["Trusted"] = 2] = "Trusted";
})(ExtensionFlags = exports.ExtensionFlags || (exports.ExtensionFlags = {}));
/**
 * Represents the state of an extension request
 */
var ExtensionRequestState;
(function (ExtensionRequestState) {
    /**
     * The request has been opened, but not yet responded to
     */
    ExtensionRequestState[ExtensionRequestState["Open"] = 0] = "Open";
    /**
     * The request was accepted (extension installed or license assigned)
     */
    ExtensionRequestState[ExtensionRequestState["Accepted"] = 1] = "Accepted";
    /**
     * The request was rejected (extension not installed or license not assigned)
     */
    ExtensionRequestState[ExtensionRequestState["Rejected"] = 2] = "Rejected";
})(ExtensionRequestState = exports.ExtensionRequestState || (exports.ExtensionRequestState = {}));
var ExtensionRequestUpdateType;
(function (ExtensionRequestUpdateType) {
    ExtensionRequestUpdateType[ExtensionRequestUpdateType["Created"] = 1] = "Created";
    ExtensionRequestUpdateType[ExtensionRequestUpdateType["Approved"] = 2] = "Approved";
    ExtensionRequestUpdateType[ExtensionRequestUpdateType["Rejected"] = 3] = "Rejected";
    ExtensionRequestUpdateType[ExtensionRequestUpdateType["Deleted"] = 4] = "Deleted";
})(ExtensionRequestUpdateType = exports.ExtensionRequestUpdateType || (exports.ExtensionRequestUpdateType = {}));
/**
 * States of an extension Note:  If you add value to this enum, you need to do 2 other things.  First add the back compat enum in value src\Vssf\Sdk\Server\Contributions\InstalledExtensionMessage.cs.  Second, you can not send the new value on the message bus.  You need to remove it from the message bus event prior to being sent.
 */
var ExtensionStateFlags;
(function (ExtensionStateFlags) {
    /**
     * No flags set
     */
    ExtensionStateFlags[ExtensionStateFlags["None"] = 0] = "None";
    /**
     * Extension is disabled
     */
    ExtensionStateFlags[ExtensionStateFlags["Disabled"] = 1] = "Disabled";
    /**
     * Extension is a built in
     */
    ExtensionStateFlags[ExtensionStateFlags["BuiltIn"] = 2] = "BuiltIn";
    /**
     * Extension has multiple versions
     */
    ExtensionStateFlags[ExtensionStateFlags["MultiVersion"] = 4] = "MultiVersion";
    /**
     * Extension is not installed.  This is for builtin extensions only and can not otherwise be set.
     */
    ExtensionStateFlags[ExtensionStateFlags["UnInstalled"] = 8] = "UnInstalled";
    /**
     * Error performing version check
     */
    ExtensionStateFlags[ExtensionStateFlags["VersionCheckError"] = 16] = "VersionCheckError";
    /**
     * Trusted extensions are ones that are given special capabilities. These tend to come from Microsoft and can't be published by the general public.  Note: BuiltIn extensions are always trusted.
     */
    ExtensionStateFlags[ExtensionStateFlags["Trusted"] = 32] = "Trusted";
    /**
     * Extension is currently in an error state
     */
    ExtensionStateFlags[ExtensionStateFlags["Error"] = 64] = "Error";
    /**
     * Extension scopes have changed and the extension requires re-authorization
     */
    ExtensionStateFlags[ExtensionStateFlags["NeedsReauthorization"] = 128] = "NeedsReauthorization";
    /**
     * Error performing auto-upgrade. For example, if the new version has demands not supported the extension cannot be auto-upgraded.
     */
    ExtensionStateFlags[ExtensionStateFlags["AutoUpgradeError"] = 256] = "AutoUpgradeError";
    /**
     * Extension is currently in a warning state, that can cause a degraded experience. The degraded experience can be caused for example by some installation issues detected such as implicit demands not supported.
     */
    ExtensionStateFlags[ExtensionStateFlags["Warning"] = 512] = "Warning";
})(ExtensionStateFlags = exports.ExtensionStateFlags || (exports.ExtensionStateFlags = {}));
var ExtensionUpdateType;
(function (ExtensionUpdateType) {
    ExtensionUpdateType[ExtensionUpdateType["Installed"] = 1] = "Installed";
    ExtensionUpdateType[ExtensionUpdateType["Uninstalled"] = 2] = "Uninstalled";
    ExtensionUpdateType[ExtensionUpdateType["Enabled"] = 3] = "Enabled";
    ExtensionUpdateType[ExtensionUpdateType["Disabled"] = 4] = "Disabled";
    ExtensionUpdateType[ExtensionUpdateType["VersionUpdated"] = 5] = "VersionUpdated";
    ExtensionUpdateType[ExtensionUpdateType["ActionRequired"] = 6] = "ActionRequired";
    ExtensionUpdateType[ExtensionUpdateType["ActionResolved"] = 7] = "ActionResolved";
})(ExtensionUpdateType = exports.ExtensionUpdateType || (exports.ExtensionUpdateType = {}));
/**
 * Installation issue type (Warning, Error)
 */
var InstalledExtensionStateIssueType;
(function (InstalledExtensionStateIssueType) {
    /**
     * Represents an installation warning, for example an implicit demand not supported
     */
    InstalledExtensionStateIssueType[InstalledExtensionStateIssueType["Warning"] = 0] = "Warning";
    /**
     * Represents an installation error, for example an explicit demand not supported
     */
    InstalledExtensionStateIssueType[InstalledExtensionStateIssueType["Error"] = 1] = "Error";
})(InstalledExtensionStateIssueType = exports.InstalledExtensionStateIssueType || (exports.InstalledExtensionStateIssueType = {}));
exports.TypeInfo = {
    AcquisitionAssignmentType: {
        enumValues: {
            "none": 0,
            "me": 1,
            "all": 2
        }
    },
    AcquisitionOperation: {},
    AcquisitionOperationState: {
        enumValues: {
            "disallow": 0,
            "allow": 1,
            "completed": 3
        }
    },
    AcquisitionOperationType: {
        enumValues: {
            "get": 0,
            "install": 1,
            "buy": 2,
            "try": 3,
            "request": 4,
            "none": 5,
            "purchaseRequest": 6
        }
    },
    AcquisitionOptions: {},
    ContributionLicensingBehaviorType: {
        enumValues: {
            "onlyIfLicensed": 0,
            "onlyIfUnlicensed": 1,
            "alwaysInclude": 2
        }
    },
    ContributionNodeQuery: {},
    ContributionPropertyDescription: {},
    ContributionPropertyType: {
        enumValues: {
            "unknown": 0,
            "string": 1,
            "uri": 2,
            "guid": 4,
            "boolean": 8,
            "integer": 16,
            "double": 32,
            "dateTime": 64,
            "dictionary": 128,
            "array": 256,
            "object": 512
        }
    },
    ContributionQueryOptions: {
        enumValues: {
            "none": 0,
            "includeSelf": 16,
            "includeChildren": 32,
            "includeSubTree": 96,
            "includeAll": 112,
            "ignoreConstraints": 256
        }
    },
    ContributionType: {},
    ExtensionAcquisitionRequest: {},
    ExtensionAuditLog: {},
    ExtensionAuditLogEntry: {},
    ExtensionEvent: {},
    ExtensionFlags: {
        enumValues: {
            "builtIn": 1,
            "trusted": 2
        }
    },
    ExtensionLicensing: {},
    ExtensionManifest: {},
    ExtensionRequest: {},
    ExtensionRequestEvent: {},
    ExtensionRequestsEvent: {},
    ExtensionRequestState: {
        enumValues: {
            "open": 0,
            "accepted": 1,
            "rejected": 2
        }
    },
    ExtensionRequestUpdateType: {
        enumValues: {
            "created": 1,
            "approved": 2,
            "rejected": 3,
            "deleted": 4
        }
    },
    ExtensionState: {},
    ExtensionStateFlags: {
        enumValues: {
            "none": 0,
            "disabled": 1,
            "builtIn": 2,
            "multiVersion": 4,
            "unInstalled": 8,
            "versionCheckError": 16,
            "trusted": 32,
            "error": 64,
            "needsReauthorization": 128,
            "autoUpgradeError": 256,
            "warning": 512
        }
    },
    ExtensionUpdateType: {
        enumValues: {
            "installed": 1,
            "uninstalled": 2,
            "enabled": 3,
            "disabled": 4,
            "versionUpdated": 5,
            "actionRequired": 6,
            "actionResolved": 7
        }
    },
    InstalledExtension: {},
    InstalledExtensionState: {},
    InstalledExtensionStateIssue: {},
    InstalledExtensionStateIssueType: {
        enumValues: {
            "warning": 0,
            "error": 1
        }
    },
    LicensingOverride: {},
    RequestedExtension: {},
};
exports.TypeInfo.AcquisitionOperation.fields = {
    operationState: {
        enumType: exports.TypeInfo.AcquisitionOperationState
    },
    operationType: {
        enumType: exports.TypeInfo.AcquisitionOperationType
    }
};
exports.TypeInfo.AcquisitionOptions.fields = {
    defaultOperation: {
        typeInfo: exports.TypeInfo.AcquisitionOperation
    },
    operations: {
        isArray: true,
        typeInfo: exports.TypeInfo.AcquisitionOperation
    }
};
exports.TypeInfo.ContributionNodeQuery.fields = {
    queryOptions: {
        enumType: exports.TypeInfo.ContributionQueryOptions
    }
};
exports.TypeInfo.ContributionPropertyDescription.fields = {
    type: {
        enumType: exports.TypeInfo.ContributionPropertyType
    }
};
exports.TypeInfo.ContributionType.fields = {
    properties: {
        isDictionary: true,
        dictionaryValueTypeInfo: exports.TypeInfo.ContributionPropertyDescription
    }
};
exports.TypeInfo.ExtensionAcquisitionRequest.fields = {
    assignmentType: {
        enumType: exports.TypeInfo.AcquisitionAssignmentType
    },
    operationType: {
        enumType: exports.TypeInfo.AcquisitionOperationType
    }
};
exports.TypeInfo.ExtensionAuditLog.fields = {
    entries: {
        isArray: true,
        typeInfo: exports.TypeInfo.ExtensionAuditLogEntry
    }
};
exports.TypeInfo.ExtensionAuditLogEntry.fields = {
    auditDate: {
        isDate: true,
    }
};
exports.TypeInfo.ExtensionEvent.fields = {
    extension: {
        typeInfo: GalleryInterfaces.TypeInfo.PublishedExtension
    },
    updateType: {
        enumType: exports.TypeInfo.ExtensionUpdateType
    }
};
exports.TypeInfo.ExtensionLicensing.fields = {
    overrides: {
        isArray: true,
        typeInfo: exports.TypeInfo.LicensingOverride
    }
};
exports.TypeInfo.ExtensionManifest.fields = {
    contributionTypes: {
        isArray: true,
        typeInfo: exports.TypeInfo.ContributionType
    },
    licensing: {
        typeInfo: exports.TypeInfo.ExtensionLicensing
    }
};
exports.TypeInfo.ExtensionRequest.fields = {
    requestDate: {
        isDate: true,
    },
    requestState: {
        enumType: exports.TypeInfo.ExtensionRequestState
    },
    resolveDate: {
        isDate: true,
    }
};
exports.TypeInfo.ExtensionRequestEvent.fields = {
    extension: {
        typeInfo: GalleryInterfaces.TypeInfo.PublishedExtension
    },
    request: {
        typeInfo: exports.TypeInfo.ExtensionRequest
    },
    updateType: {
        enumType: exports.TypeInfo.ExtensionRequestUpdateType
    }
};
exports.TypeInfo.ExtensionRequestsEvent.fields = {
    extension: {
        typeInfo: GalleryInterfaces.TypeInfo.PublishedExtension
    },
    requests: {
        isArray: true,
        typeInfo: exports.TypeInfo.ExtensionRequest
    },
    updateType: {
        enumType: exports.TypeInfo.ExtensionRequestUpdateType
    }
};
exports.TypeInfo.ExtensionState.fields = {
    flags: {
        enumType: exports.TypeInfo.ExtensionStateFlags
    },
    installationIssues: {
        isArray: true,
        typeInfo: exports.TypeInfo.InstalledExtensionStateIssue
    },
    lastUpdated: {
        isDate: true,
    },
    lastVersionCheck: {
        isDate: true,
    }
};
exports.TypeInfo.InstalledExtension.fields = {
    contributionTypes: {
        isArray: true,
        typeInfo: exports.TypeInfo.ContributionType
    },
    flags: {
        enumType: exports.TypeInfo.ExtensionFlags
    },
    installState: {
        typeInfo: exports.TypeInfo.InstalledExtensionState
    },
    lastPublished: {
        isDate: true,
    },
    licensing: {
        typeInfo: exports.TypeInfo.ExtensionLicensing
    }
};
exports.TypeInfo.InstalledExtensionState.fields = {
    flags: {
        enumType: exports.TypeInfo.ExtensionStateFlags
    },
    installationIssues: {
        isArray: true,
        typeInfo: exports.TypeInfo.InstalledExtensionStateIssue
    },
    lastUpdated: {
        isDate: true,
    }
};
exports.TypeInfo.InstalledExtensionStateIssue.fields = {
    type: {
        enumType: exports.TypeInfo.InstalledExtensionStateIssueType
    }
};
exports.TypeInfo.LicensingOverride.fields = {
    behavior: {
        enumType: exports.TypeInfo.ContributionLicensingBehaviorType
    }
};
exports.TypeInfo.RequestedExtension.fields = {
    extensionRequests: {
        isArray: true,
        typeInfo: exports.TypeInfo.ExtensionRequest
    }
};
