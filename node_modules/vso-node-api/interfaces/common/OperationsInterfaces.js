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
var OperationStatus;
(function (OperationStatus) {
    /**
     * The operation object does not have the status set.
     */
    OperationStatus[OperationStatus["NotSet"] = 0] = "NotSet";
    /**
     * The operation has been queued.
     */
    OperationStatus[OperationStatus["Queued"] = 1] = "Queued";
    /**
     * The operation is in progress.
     */
    OperationStatus[OperationStatus["InProgress"] = 2] = "InProgress";
    /**
     * The operation was cancelled by the user.
     */
    OperationStatus[OperationStatus["Cancelled"] = 3] = "Cancelled";
    /**
     * The operation completed successfully.
     */
    OperationStatus[OperationStatus["Succeeded"] = 4] = "Succeeded";
    /**
     * The operation completed with a failure.
     */
    OperationStatus[OperationStatus["Failed"] = 5] = "Failed";
})(OperationStatus = exports.OperationStatus || (exports.OperationStatus = {}));
exports.TypeInfo = {
    OperationReference: {
        fields: null
    },
    OperationStatus: {
        enumValues: {
            "notSet": 0,
            "queued": 1,
            "inProgress": 2,
            "cancelled": 3,
            "succeeded": 4,
            "failed": 5,
        }
    },
};
exports.TypeInfo.OperationReference.fields = {
    status: {
        enumType: exports.TypeInfo.OperationStatus
    },
};
