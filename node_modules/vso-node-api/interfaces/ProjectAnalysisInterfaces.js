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
var AggregationType;
(function (AggregationType) {
    AggregationType[AggregationType["Hourly"] = 0] = "Hourly";
    AggregationType[AggregationType["Daily"] = 1] = "Daily";
})(AggregationType = exports.AggregationType || (exports.AggregationType = {}));
var ResultPhase;
(function (ResultPhase) {
    ResultPhase[ResultPhase["Preliminary"] = 0] = "Preliminary";
    ResultPhase[ResultPhase["Full"] = 1] = "Full";
})(ResultPhase = exports.ResultPhase || (exports.ResultPhase = {}));
exports.TypeInfo = {
    AggregationType: {
        enumValues: {
            "hourly": 0,
            "daily": 1
        }
    },
    CodeChangeTrendItem: {},
    ProjectActivityMetrics: {},
    ProjectLanguageAnalytics: {},
    RepositoryActivityMetrics: {},
    RepositoryLanguageAnalytics: {},
    ResultPhase: {
        enumValues: {
            "preliminary": 0,
            "full": 1
        }
    },
};
exports.TypeInfo.CodeChangeTrendItem.fields = {
    time: {
        isDate: true,
    }
};
exports.TypeInfo.ProjectActivityMetrics.fields = {
    codeChangesTrend: {
        isArray: true,
        typeInfo: exports.TypeInfo.CodeChangeTrendItem
    }
};
exports.TypeInfo.ProjectLanguageAnalytics.fields = {
    repositoryLanguageAnalytics: {
        isArray: true,
        typeInfo: exports.TypeInfo.RepositoryLanguageAnalytics
    },
    resultPhase: {
        enumType: exports.TypeInfo.ResultPhase
    }
};
exports.TypeInfo.RepositoryActivityMetrics.fields = {
    codeChangesTrend: {
        isArray: true,
        typeInfo: exports.TypeInfo.CodeChangeTrendItem
    }
};
exports.TypeInfo.RepositoryLanguageAnalytics.fields = {
    resultPhase: {
        enumType: exports.TypeInfo.ResultPhase
    },
    updatedTime: {
        isDate: true,
    }
};
