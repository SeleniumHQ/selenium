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
const SystemInterfaces = require("../interfaces/common/System");
var BoardColumnType;
(function (BoardColumnType) {
    BoardColumnType[BoardColumnType["Incoming"] = 0] = "Incoming";
    BoardColumnType[BoardColumnType["InProgress"] = 1] = "InProgress";
    BoardColumnType[BoardColumnType["Outgoing"] = 2] = "Outgoing";
})(BoardColumnType = exports.BoardColumnType || (exports.BoardColumnType = {}));
/**
 * The behavior of the work item types that are in the work item category specified in the BugWorkItems section in the Process Configuration
 */
var BugsBehavior;
(function (BugsBehavior) {
    BugsBehavior[BugsBehavior["Off"] = 0] = "Off";
    BugsBehavior[BugsBehavior["AsRequirements"] = 1] = "AsRequirements";
    BugsBehavior[BugsBehavior["AsTasks"] = 2] = "AsTasks";
})(BugsBehavior = exports.BugsBehavior || (exports.BugsBehavior = {}));
var FieldType;
(function (FieldType) {
    FieldType[FieldType["String"] = 0] = "String";
    FieldType[FieldType["PlainText"] = 1] = "PlainText";
    FieldType[FieldType["Integer"] = 2] = "Integer";
    FieldType[FieldType["DateTime"] = 3] = "DateTime";
    FieldType[FieldType["TreePath"] = 4] = "TreePath";
    FieldType[FieldType["Boolean"] = 5] = "Boolean";
    FieldType[FieldType["Double"] = 6] = "Double";
})(FieldType = exports.FieldType || (exports.FieldType = {}));
/**
 * Enum for the various modes of identity picker
 */
var IdentityDisplayFormat;
(function (IdentityDisplayFormat) {
    /**
     * Display avatar only
     */
    IdentityDisplayFormat[IdentityDisplayFormat["AvatarOnly"] = 0] = "AvatarOnly";
    /**
     * Display Full name only
     */
    IdentityDisplayFormat[IdentityDisplayFormat["FullName"] = 1] = "FullName";
    /**
     * Display Avatar and Full name
     */
    IdentityDisplayFormat[IdentityDisplayFormat["AvatarAndFullName"] = 2] = "AvatarAndFullName";
})(IdentityDisplayFormat = exports.IdentityDisplayFormat || (exports.IdentityDisplayFormat = {}));
/**
 * Enum for the various types of plans
 */
var PlanType;
(function (PlanType) {
    PlanType[PlanType["DeliveryTimelineView"] = 0] = "DeliveryTimelineView";
})(PlanType = exports.PlanType || (exports.PlanType = {}));
/**
 * Flag for permissions a user can have for this plan.
 */
var PlanUserPermissions;
(function (PlanUserPermissions) {
    /**
     * None
     */
    PlanUserPermissions[PlanUserPermissions["None"] = 0] = "None";
    /**
     * Permission to view this plan.
     */
    PlanUserPermissions[PlanUserPermissions["View"] = 1] = "View";
    /**
     * Permission to update this plan.
     */
    PlanUserPermissions[PlanUserPermissions["Edit"] = 2] = "Edit";
    /**
     * Permission to delete this plan.
     */
    PlanUserPermissions[PlanUserPermissions["Delete"] = 4] = "Delete";
    /**
     * Permission to manage this plan.
     */
    PlanUserPermissions[PlanUserPermissions["Manage"] = 8] = "Manage";
    /**
     * Full control permission for this plan.
     */
    PlanUserPermissions[PlanUserPermissions["AllPermissions"] = 15] = "AllPermissions";
})(PlanUserPermissions = exports.PlanUserPermissions || (exports.PlanUserPermissions = {}));
var TimeFrame;
(function (TimeFrame) {
    TimeFrame[TimeFrame["Past"] = 0] = "Past";
    TimeFrame[TimeFrame["Current"] = 1] = "Current";
    TimeFrame[TimeFrame["Future"] = 2] = "Future";
})(TimeFrame = exports.TimeFrame || (exports.TimeFrame = {}));
var TimelineCriteriaStatusCode;
(function (TimelineCriteriaStatusCode) {
    /**
     * No error - filter is good.
     */
    TimelineCriteriaStatusCode[TimelineCriteriaStatusCode["OK"] = 0] = "OK";
    /**
     * One of the filter clause is invalid.
     */
    TimelineCriteriaStatusCode[TimelineCriteriaStatusCode["InvalidFilterClause"] = 1] = "InvalidFilterClause";
    /**
     * Unknown error.
     */
    TimelineCriteriaStatusCode[TimelineCriteriaStatusCode["Unknown"] = 2] = "Unknown";
})(TimelineCriteriaStatusCode = exports.TimelineCriteriaStatusCode || (exports.TimelineCriteriaStatusCode = {}));
var TimelineIterationStatusCode;
(function (TimelineIterationStatusCode) {
    /**
     * No error - iteration data is good.
     */
    TimelineIterationStatusCode[TimelineIterationStatusCode["OK"] = 0] = "OK";
    /**
     * This iteration overlaps with another iteration, no data is returned for this iteration.
     */
    TimelineIterationStatusCode[TimelineIterationStatusCode["IsOverlapping"] = 1] = "IsOverlapping";
})(TimelineIterationStatusCode = exports.TimelineIterationStatusCode || (exports.TimelineIterationStatusCode = {}));
var TimelineTeamStatusCode;
(function (TimelineTeamStatusCode) {
    /**
     * No error - all data for team is good.
     */
    TimelineTeamStatusCode[TimelineTeamStatusCode["OK"] = 0] = "OK";
    /**
     * Team does not exist or access is denied.
     */
    TimelineTeamStatusCode[TimelineTeamStatusCode["DoesntExistOrAccessDenied"] = 1] = "DoesntExistOrAccessDenied";
    /**
     * Maximum number of teams was exceeded. No team data will be returned for this team.
     */
    TimelineTeamStatusCode[TimelineTeamStatusCode["MaxTeamsExceeded"] = 2] = "MaxTeamsExceeded";
    /**
     * Maximum number of team fields (ie Area paths) have been exceeded. No team data will be returned for this team.
     */
    TimelineTeamStatusCode[TimelineTeamStatusCode["MaxTeamFieldsExceeded"] = 3] = "MaxTeamFieldsExceeded";
    /**
     * Backlog does not exist or is missing crucial information.
     */
    TimelineTeamStatusCode[TimelineTeamStatusCode["BacklogInError"] = 4] = "BacklogInError";
    /**
     * Team field value is not set for this team. No team data will be returned for this team
     */
    TimelineTeamStatusCode[TimelineTeamStatusCode["MissingTeamFieldValue"] = 5] = "MissingTeamFieldValue";
    /**
     * Team does not have a single iteration with date range.
     */
    TimelineTeamStatusCode[TimelineTeamStatusCode["NoIterationsExist"] = 6] = "NoIterationsExist";
})(TimelineTeamStatusCode = exports.TimelineTeamStatusCode || (exports.TimelineTeamStatusCode = {}));
exports.TypeInfo = {
    BacklogConfiguration: {},
    Board: {},
    BoardColumn: {},
    BoardColumnType: {
        enumValues: {
            "incoming": 0,
            "inProgress": 1,
            "outgoing": 2
        }
    },
    BugsBehavior: {
        enumValues: {
            "off": 0,
            "asRequirements": 1,
            "asTasks": 2
        }
    },
    CapacityPatch: {},
    CardFieldSettings: {},
    CardSettings: {},
    CreatePlan: {},
    DateRange: {},
    DeliveryViewData: {},
    DeliveryViewPropertyCollection: {},
    FieldInfo: {},
    FieldType: {
        enumValues: {
            "string": 0,
            "plainText": 1,
            "integer": 2,
            "dateTime": 3,
            "treePath": 4,
            "boolean": 5,
            "double": 6
        }
    },
    IdentityDisplayFormat: {
        enumValues: {
            "avatarOnly": 0,
            "fullName": 1,
            "avatarAndFullName": 2
        }
    },
    Marker: {},
    Plan: {},
    PlanMetadata: {},
    PlanType: {
        enumValues: {
            "deliveryTimelineView": 0
        }
    },
    PlanUserPermissions: {
        enumValues: {
            "none": 0,
            "view": 1,
            "edit": 2,
            "delete": 4,
            "manage": 8,
            "allPermissions": 15
        }
    },
    TeamIterationAttributes: {},
    TeamMemberCapacity: {},
    TeamSetting: {},
    TeamSettingsDaysOff: {},
    TeamSettingsDaysOffPatch: {},
    TeamSettingsIteration: {},
    TeamSettingsPatch: {},
    TimeFrame: {
        enumValues: {
            "past": 0,
            "current": 1,
            "future": 2
        }
    },
    TimelineCriteriaStatus: {},
    TimelineCriteriaStatusCode: {
        enumValues: {
            "oK": 0,
            "invalidFilterClause": 1,
            "unknown": 2
        }
    },
    TimelineIterationStatus: {},
    TimelineIterationStatusCode: {
        enumValues: {
            "oK": 0,
            "isOverlapping": 1
        }
    },
    TimelineTeamData: {},
    TimelineTeamIteration: {},
    TimelineTeamStatus: {},
    TimelineTeamStatusCode: {
        enumValues: {
            "oK": 0,
            "doesntExistOrAccessDenied": 1,
            "maxTeamsExceeded": 2,
            "maxTeamFieldsExceeded": 3,
            "backlogInError": 4,
            "missingTeamFieldValue": 5,
            "noIterationsExist": 6
        }
    },
    UpdatePlan: {},
};
exports.TypeInfo.BacklogConfiguration.fields = {
    bugsBehavior: {
        enumType: exports.TypeInfo.BugsBehavior
    }
};
exports.TypeInfo.Board.fields = {
    columns: {
        isArray: true,
        typeInfo: exports.TypeInfo.BoardColumn
    }
};
exports.TypeInfo.BoardColumn.fields = {
    columnType: {
        enumType: exports.TypeInfo.BoardColumnType
    }
};
exports.TypeInfo.CapacityPatch.fields = {
    daysOff: {
        isArray: true,
        typeInfo: exports.TypeInfo.DateRange
    }
};
exports.TypeInfo.CardFieldSettings.fields = {
    additionalFields: {
        isArray: true,
        typeInfo: exports.TypeInfo.FieldInfo
    },
    assignedToDisplayFormat: {
        enumType: exports.TypeInfo.IdentityDisplayFormat
    },
    coreFields: {
        isArray: true,
        typeInfo: exports.TypeInfo.FieldInfo
    }
};
exports.TypeInfo.CardSettings.fields = {
    fields: {
        typeInfo: exports.TypeInfo.CardFieldSettings
    }
};
exports.TypeInfo.CreatePlan.fields = {
    type: {
        enumType: exports.TypeInfo.PlanType
    }
};
exports.TypeInfo.DateRange.fields = {
    end: {
        isDate: true,
    },
    start: {
        isDate: true,
    }
};
exports.TypeInfo.DeliveryViewData.fields = {
    criteriaStatus: {
        typeInfo: exports.TypeInfo.TimelineCriteriaStatus
    },
    endDate: {
        isDate: true,
    },
    startDate: {
        isDate: true,
    },
    teams: {
        isArray: true,
        typeInfo: exports.TypeInfo.TimelineTeamData
    }
};
exports.TypeInfo.DeliveryViewPropertyCollection.fields = {
    cardSettings: {
        typeInfo: exports.TypeInfo.CardSettings
    },
    markers: {
        isArray: true,
        typeInfo: exports.TypeInfo.Marker
    }
};
exports.TypeInfo.FieldInfo.fields = {
    fieldType: {
        enumType: exports.TypeInfo.FieldType
    }
};
exports.TypeInfo.Marker.fields = {
    date: {
        isDate: true,
    }
};
exports.TypeInfo.Plan.fields = {
    createdDate: {
        isDate: true,
    },
    modifiedDate: {
        isDate: true,
    },
    type: {
        enumType: exports.TypeInfo.PlanType
    },
    userPermissions: {
        enumType: exports.TypeInfo.PlanUserPermissions
    }
};
exports.TypeInfo.PlanMetadata.fields = {
    modifiedDate: {
        isDate: true,
    },
    userPermissions: {
        enumType: exports.TypeInfo.PlanUserPermissions
    }
};
exports.TypeInfo.TeamIterationAttributes.fields = {
    finishDate: {
        isDate: true,
    },
    startDate: {
        isDate: true,
    },
    timeFrame: {
        enumType: exports.TypeInfo.TimeFrame
    }
};
exports.TypeInfo.TeamMemberCapacity.fields = {
    daysOff: {
        isArray: true,
        typeInfo: exports.TypeInfo.DateRange
    }
};
exports.TypeInfo.TeamSetting.fields = {
    backlogIteration: {
        typeInfo: exports.TypeInfo.TeamSettingsIteration
    },
    bugsBehavior: {
        enumType: exports.TypeInfo.BugsBehavior
    },
    defaultIteration: {
        typeInfo: exports.TypeInfo.TeamSettingsIteration
    },
    workingDays: {
        isArray: true,
        enumType: SystemInterfaces.TypeInfo.DayOfWeek
    }
};
exports.TypeInfo.TeamSettingsDaysOff.fields = {
    daysOff: {
        isArray: true,
        typeInfo: exports.TypeInfo.DateRange
    }
};
exports.TypeInfo.TeamSettingsDaysOffPatch.fields = {
    daysOff: {
        isArray: true,
        typeInfo: exports.TypeInfo.DateRange
    }
};
exports.TypeInfo.TeamSettingsIteration.fields = {
    attributes: {
        typeInfo: exports.TypeInfo.TeamIterationAttributes
    }
};
exports.TypeInfo.TeamSettingsPatch.fields = {
    bugsBehavior: {
        enumType: exports.TypeInfo.BugsBehavior
    },
    workingDays: {
        isArray: true,
        enumType: SystemInterfaces.TypeInfo.DayOfWeek
    }
};
exports.TypeInfo.TimelineCriteriaStatus.fields = {
    type: {
        enumType: exports.TypeInfo.TimelineCriteriaStatusCode
    }
};
exports.TypeInfo.TimelineIterationStatus.fields = {
    type: {
        enumType: exports.TypeInfo.TimelineIterationStatusCode
    }
};
exports.TypeInfo.TimelineTeamData.fields = {
    iterations: {
        isArray: true,
        typeInfo: exports.TypeInfo.TimelineTeamIteration
    },
    status: {
        typeInfo: exports.TypeInfo.TimelineTeamStatus
    }
};
exports.TypeInfo.TimelineTeamIteration.fields = {
    finishDate: {
        isDate: true,
    },
    startDate: {
        isDate: true,
    },
    status: {
        typeInfo: exports.TypeInfo.TimelineIterationStatus
    }
};
exports.TypeInfo.TimelineTeamStatus.fields = {
    type: {
        enumType: exports.TypeInfo.TimelineTeamStatusCode
    }
};
exports.TypeInfo.UpdatePlan.fields = {
    type: {
        enumType: exports.TypeInfo.PlanType
    }
};
