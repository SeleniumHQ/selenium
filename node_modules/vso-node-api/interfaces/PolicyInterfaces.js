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
 * Status of a policy which is running against a specific pull request.
 */
var PolicyEvaluationStatus;
(function (PolicyEvaluationStatus) {
    /**
     * The policy is either queued to run, or is waiting for some event before progressing.
     */
    PolicyEvaluationStatus[PolicyEvaluationStatus["Queued"] = 0] = "Queued";
    /**
     * The policy is currently running.
     */
    PolicyEvaluationStatus[PolicyEvaluationStatus["Running"] = 1] = "Running";
    /**
     * The policy has been fulfilled for this pull request.
     */
    PolicyEvaluationStatus[PolicyEvaluationStatus["Approved"] = 2] = "Approved";
    /**
     * The policy has rejected this pull request.
     */
    PolicyEvaluationStatus[PolicyEvaluationStatus["Rejected"] = 3] = "Rejected";
    /**
     * The policy does not apply to this pull request.
     */
    PolicyEvaluationStatus[PolicyEvaluationStatus["NotApplicable"] = 4] = "NotApplicable";
    /**
     * The policy has encountered an unexpected error.
     */
    PolicyEvaluationStatus[PolicyEvaluationStatus["Broken"] = 5] = "Broken";
})(PolicyEvaluationStatus = exports.PolicyEvaluationStatus || (exports.PolicyEvaluationStatus = {}));
exports.TypeInfo = {
    PolicyConfiguration: {},
    PolicyEvaluationRecord: {},
    PolicyEvaluationStatus: {
        enumValues: {
            "queued": 0,
            "running": 1,
            "approved": 2,
            "rejected": 3,
            "notApplicable": 4,
            "broken": 5
        }
    },
};
exports.TypeInfo.PolicyConfiguration.fields = {
    createdDate: {
        isDate: true,
    }
};
exports.TypeInfo.PolicyEvaluationRecord.fields = {
    completedDate: {
        isDate: true,
    },
    configuration: {
        typeInfo: exports.TypeInfo.PolicyConfiguration
    },
    startedDate: {
        isDate: true,
    },
    status: {
        enumType: exports.TypeInfo.PolicyEvaluationStatus
    }
};
