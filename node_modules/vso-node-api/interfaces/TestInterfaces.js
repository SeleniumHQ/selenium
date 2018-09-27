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
const TfsCoreInterfaces = require("../interfaces/CoreInterfaces");
/**
 * The types of test attachments.
 */
var AttachmentType;
(function (AttachmentType) {
    AttachmentType[AttachmentType["GeneralAttachment"] = 0] = "GeneralAttachment";
    AttachmentType[AttachmentType["AfnStrip"] = 1] = "AfnStrip";
    AttachmentType[AttachmentType["BugFilingData"] = 2] = "BugFilingData";
    AttachmentType[AttachmentType["CodeCoverage"] = 3] = "CodeCoverage";
    AttachmentType[AttachmentType["IntermediateCollectorData"] = 4] = "IntermediateCollectorData";
    AttachmentType[AttachmentType["RunConfig"] = 5] = "RunConfig";
    AttachmentType[AttachmentType["TestImpactDetails"] = 6] = "TestImpactDetails";
    AttachmentType[AttachmentType["TmiTestRunDeploymentFiles"] = 7] = "TmiTestRunDeploymentFiles";
    AttachmentType[AttachmentType["TmiTestRunReverseDeploymentFiles"] = 8] = "TmiTestRunReverseDeploymentFiles";
    AttachmentType[AttachmentType["TmiTestResultDetail"] = 9] = "TmiTestResultDetail";
    AttachmentType[AttachmentType["TmiTestRunSummary"] = 10] = "TmiTestRunSummary";
    AttachmentType[AttachmentType["ConsoleLog"] = 11] = "ConsoleLog";
})(AttachmentType = exports.AttachmentType || (exports.AttachmentType = {}));
var CloneOperationState;
(function (CloneOperationState) {
    CloneOperationState[CloneOperationState["Failed"] = 2] = "Failed";
    CloneOperationState[CloneOperationState["InProgress"] = 1] = "InProgress";
    CloneOperationState[CloneOperationState["Queued"] = 0] = "Queued";
    CloneOperationState[CloneOperationState["Succeeded"] = 3] = "Succeeded";
})(CloneOperationState = exports.CloneOperationState || (exports.CloneOperationState = {}));
/**
 * Used to choose which coverage data is returned by a QueryXXXCoverage() call.
 */
var CoverageQueryFlags;
(function (CoverageQueryFlags) {
    /**
     * If set, the Coverage.Modules property will be populated.
     */
    CoverageQueryFlags[CoverageQueryFlags["Modules"] = 1] = "Modules";
    /**
     * If set, the ModuleCoverage.Functions properties will be populated.
     */
    CoverageQueryFlags[CoverageQueryFlags["Functions"] = 2] = "Functions";
    /**
     * If set, the ModuleCoverage.CoverageData field will be populated.
     */
    CoverageQueryFlags[CoverageQueryFlags["BlockData"] = 4] = "BlockData";
})(CoverageQueryFlags = exports.CoverageQueryFlags || (exports.CoverageQueryFlags = {}));
var CustomTestFieldScope;
(function (CustomTestFieldScope) {
    CustomTestFieldScope[CustomTestFieldScope["None"] = 0] = "None";
    CustomTestFieldScope[CustomTestFieldScope["TestRun"] = 1] = "TestRun";
    CustomTestFieldScope[CustomTestFieldScope["TestResult"] = 2] = "TestResult";
    CustomTestFieldScope[CustomTestFieldScope["System"] = 4] = "System";
    CustomTestFieldScope[CustomTestFieldScope["All"] = 7] = "All";
})(CustomTestFieldScope = exports.CustomTestFieldScope || (exports.CustomTestFieldScope = {}));
var CustomTestFieldType;
(function (CustomTestFieldType) {
    CustomTestFieldType[CustomTestFieldType["Bit"] = 2] = "Bit";
    CustomTestFieldType[CustomTestFieldType["DateTime"] = 4] = "DateTime";
    CustomTestFieldType[CustomTestFieldType["Int"] = 8] = "Int";
    CustomTestFieldType[CustomTestFieldType["Float"] = 6] = "Float";
    CustomTestFieldType[CustomTestFieldType["String"] = 12] = "String";
    CustomTestFieldType[CustomTestFieldType["Guid"] = 14] = "Guid";
})(CustomTestFieldType = exports.CustomTestFieldType || (exports.CustomTestFieldType = {}));
var ResultDetails;
(function (ResultDetails) {
    ResultDetails[ResultDetails["None"] = 0] = "None";
    ResultDetails[ResultDetails["Iterations"] = 1] = "Iterations";
    ResultDetails[ResultDetails["WorkItems"] = 2] = "WorkItems";
})(ResultDetails = exports.ResultDetails || (exports.ResultDetails = {}));
/**
 * The top level entity that is being cloned as part of a Clone operation
 */
var ResultObjectType;
(function (ResultObjectType) {
    ResultObjectType[ResultObjectType["TestSuite"] = 0] = "TestSuite";
    ResultObjectType[ResultObjectType["TestPlan"] = 1] = "TestPlan";
})(ResultObjectType = exports.ResultObjectType || (exports.ResultObjectType = {}));
/**
 * Represents the state of an ITestConfiguration object.
 */
var TestConfigurationState;
(function (TestConfigurationState) {
    /**
     * The configuration can be used for new test runs.
     */
    TestConfigurationState[TestConfigurationState["Active"] = 1] = "Active";
    /**
     * The configuration has been retired and should not be used for new test runs.
     */
    TestConfigurationState[TestConfigurationState["Inactive"] = 2] = "Inactive";
})(TestConfigurationState = exports.TestConfigurationState || (exports.TestConfigurationState = {}));
var TestOutcome;
(function (TestOutcome) {
    /**
     * Only used during an update to preserve the existing value.
     */
    TestOutcome[TestOutcome["Unspecified"] = 0] = "Unspecified";
    /**
     * Test has not been completed, or the test type does not report pass/failure.
     */
    TestOutcome[TestOutcome["None"] = 1] = "None";
    /**
     * Test was executed w/o any issues.
     */
    TestOutcome[TestOutcome["Passed"] = 2] = "Passed";
    /**
     * Test was executed, but there were issues. Issues may involve exceptions or failed assertions.
     */
    TestOutcome[TestOutcome["Failed"] = 3] = "Failed";
    /**
     * Test has completed, but we can't say if it passed or failed. May be used for aborted tests...
     */
    TestOutcome[TestOutcome["Inconclusive"] = 4] = "Inconclusive";
    /**
     * The test timed out
     */
    TestOutcome[TestOutcome["Timeout"] = 5] = "Timeout";
    /**
     * Test was aborted. This was not caused by a user gesture, but rather by a framework decision.
     */
    TestOutcome[TestOutcome["Aborted"] = 6] = "Aborted";
    /**
     * Test had it chance for been executed but was not, as ITestElement.IsRunnable == false.
     */
    TestOutcome[TestOutcome["Blocked"] = 7] = "Blocked";
    /**
     * Test was not executed. This was caused by a user gesture - e.g. user hit stop button.
     */
    TestOutcome[TestOutcome["NotExecuted"] = 8] = "NotExecuted";
    /**
     * To be used by Run level results. This is not a failure.
     */
    TestOutcome[TestOutcome["Warning"] = 9] = "Warning";
    /**
     * There was a system error while we were trying to execute a test.
     */
    TestOutcome[TestOutcome["Error"] = 10] = "Error";
    /**
     * Test is Not Applicable for execution.
     */
    TestOutcome[TestOutcome["NotApplicable"] = 11] = "NotApplicable";
    /**
     * Test is paused.
     */
    TestOutcome[TestOutcome["Paused"] = 12] = "Paused";
    /**
     * Test is currently executing. Added this for TCM charts
     */
    TestOutcome[TestOutcome["InProgress"] = 13] = "InProgress";
    /**
     * Test is not impacted. Added fot TIA.
     */
    TestOutcome[TestOutcome["NotImpacted"] = 14] = "NotImpacted";
    TestOutcome[TestOutcome["MaxValue"] = 14] = "MaxValue";
})(TestOutcome = exports.TestOutcome || (exports.TestOutcome = {}));
var TestResultsContextType;
(function (TestResultsContextType) {
    TestResultsContextType[TestResultsContextType["Build"] = 1] = "Build";
    TestResultsContextType[TestResultsContextType["Release"] = 2] = "Release";
})(TestResultsContextType = exports.TestResultsContextType || (exports.TestResultsContextType = {}));
/**
 * The types of publish context for run.
 */
var TestRunPublishContext;
(function (TestRunPublishContext) {
    /**
     * Run is published for Build Context.
     */
    TestRunPublishContext[TestRunPublishContext["Build"] = 1] = "Build";
    /**
     * Run is published for Release Context.
     */
    TestRunPublishContext[TestRunPublishContext["Release"] = 2] = "Release";
    /**
     * Run is published for any Context.
     */
    TestRunPublishContext[TestRunPublishContext["All"] = 3] = "All";
})(TestRunPublishContext = exports.TestRunPublishContext || (exports.TestRunPublishContext = {}));
/**
 * The types of states for test run.
 */
var TestRunState;
(function (TestRunState) {
    /**
     * Only used during an update to preserve the existing value.
     */
    TestRunState[TestRunState["Unspecified"] = 0] = "Unspecified";
    /**
     * The run is still being created.  No tests have started yet.
     */
    TestRunState[TestRunState["NotStarted"] = 1] = "NotStarted";
    /**
     * Tests are running.
     */
    TestRunState[TestRunState["InProgress"] = 2] = "InProgress";
    /**
     * All tests have completed or been skipped.
     */
    TestRunState[TestRunState["Completed"] = 3] = "Completed";
    /**
     * Run is stopped and remaing tests have been aborted
     */
    TestRunState[TestRunState["Aborted"] = 4] = "Aborted";
    /**
     * Run is currently initializing This is a legacy state and should not be used any more
     */
    TestRunState[TestRunState["Waiting"] = 5] = "Waiting";
    /**
     * Run requires investigation because of a test point failure This is a legacy state and should not be used any more
     */
    TestRunState[TestRunState["NeedsInvestigation"] = 6] = "NeedsInvestigation";
})(TestRunState = exports.TestRunState || (exports.TestRunState = {}));
/**
 * The types of sub states for test run. It gives the user more info about the test run beyond the high level test run state
 */
var TestRunSubstate;
(function (TestRunSubstate) {
    TestRunSubstate[TestRunSubstate["None"] = 0] = "None";
    TestRunSubstate[TestRunSubstate["CreatingEnvironment"] = 1] = "CreatingEnvironment";
    TestRunSubstate[TestRunSubstate["RunningTests"] = 2] = "RunningTests";
    TestRunSubstate[TestRunSubstate["CanceledByUser"] = 3] = "CanceledByUser";
    TestRunSubstate[TestRunSubstate["AbortedBySystem"] = 4] = "AbortedBySystem";
    TestRunSubstate[TestRunSubstate["TimedOut"] = 5] = "TimedOut";
    TestRunSubstate[TestRunSubstate["PendingAnalysis"] = 6] = "PendingAnalysis";
    TestRunSubstate[TestRunSubstate["Analyzed"] = 7] = "Analyzed";
    TestRunSubstate[TestRunSubstate["CancellationInProgress"] = 8] = "CancellationInProgress";
})(TestRunSubstate = exports.TestRunSubstate || (exports.TestRunSubstate = {}));
/**
 * Represents the state of the test session.
 */
var TestSessionSource;
(function (TestSessionSource) {
    /**
     * Source of test session uncertain as it is stale
     */
    TestSessionSource[TestSessionSource["Unknown"] = 0] = "Unknown";
    /**
     * The session was created from Microsoft Test Manager exploratory desktop tool.
     */
    TestSessionSource[TestSessionSource["XTDesktop"] = 1] = "XTDesktop";
    /**
     * The session was created from feedback client.
     */
    TestSessionSource[TestSessionSource["FeedbackDesktop"] = 2] = "FeedbackDesktop";
    /**
     * The session was created from browser extension.
     */
    TestSessionSource[TestSessionSource["XTWeb"] = 3] = "XTWeb";
    /**
     * The session was created from browser extension.
     */
    TestSessionSource[TestSessionSource["FeedbackWeb"] = 4] = "FeedbackWeb";
    /**
     * The session was created from web access using Microsoft Test Manager exploratory desktop tool.
     */
    TestSessionSource[TestSessionSource["XTDesktop2"] = 5] = "XTDesktop2";
    /**
     * To show sessions from all supported sources.
     */
    TestSessionSource[TestSessionSource["SessionInsightsForAll"] = 6] = "SessionInsightsForAll";
})(TestSessionSource = exports.TestSessionSource || (exports.TestSessionSource = {}));
/**
 * Represents the state of the test session.
 */
var TestSessionState;
(function (TestSessionState) {
    /**
     * Only used during an update to preserve the existing value.
     */
    TestSessionState[TestSessionState["Unspecified"] = 0] = "Unspecified";
    /**
     * The session is still being created.
     */
    TestSessionState[TestSessionState["NotStarted"] = 1] = "NotStarted";
    /**
     * The session is running.
     */
    TestSessionState[TestSessionState["InProgress"] = 2] = "InProgress";
    /**
     * The session has paused.
     */
    TestSessionState[TestSessionState["Paused"] = 3] = "Paused";
    /**
     * The session has completed.
     */
    TestSessionState[TestSessionState["Completed"] = 4] = "Completed";
    /**
     * This is required for Feedback session which are declined
     */
    TestSessionState[TestSessionState["Declined"] = 5] = "Declined";
})(TestSessionState = exports.TestSessionState || (exports.TestSessionState = {}));
exports.TypeInfo = {
    AggregatedDataForResultTrend: {},
    AggregatedResultsAnalysis: {},
    AggregatedResultsByOutcome: {},
    AttachmentType: {
        enumValues: {
            "generalAttachment": 0,
            "afnStrip": 1,
            "bugFilingData": 2,
            "codeCoverage": 3,
            "intermediateCollectorData": 4,
            "runConfig": 5,
            "testImpactDetails": 6,
            "tmiTestRunDeploymentFiles": 7,
            "tmiTestRunReverseDeploymentFiles": 8,
            "tmiTestResultDetail": 9,
            "tmiTestRunSummary": 10,
            "consoleLog": 11
        }
    },
    BatchResponse: {},
    CloneOperationInformation: {},
    CloneOperationState: {
        enumValues: {
            "failed": 2,
            "inProgress": 1,
            "queued": 0,
            "succeeded": 3
        }
    },
    CoverageQueryFlags: {
        enumValues: {
            "modules": 1,
            "functions": 2,
            "blockData": 4
        }
    },
    CustomTestFieldDefinition: {},
    CustomTestFieldScope: {
        enumValues: {
            "none": 0,
            "testRun": 1,
            "testResult": 2,
            "system": 4,
            "all": 7
        }
    },
    CustomTestFieldType: {
        enumValues: {
            "bit": 2,
            "dateTime": 4,
            "int": 8,
            "float": 6,
            "string": 12,
            "guid": 14
        }
    },
    FailingSince: {},
    LastResultDetails: {},
    Response: {},
    ResultDetails: {
        enumValues: {
            "none": 0,
            "iterations": 1,
            "workItems": 2
        }
    },
    ResultObjectType: {
        enumValues: {
            "testSuite": 0,
            "testPlan": 1
        }
    },
    ResultRetentionSettings: {},
    ResultsFilter: {},
    ResultUpdateRequestModel: {},
    RunUpdateModel: {},
    TestActionResultModel: {},
    TestAttachment: {},
    TestCaseResult: {},
    TestConfiguration: {},
    TestConfigurationState: {
        enumValues: {
            "active": 1,
            "inactive": 2
        }
    },
    TestFailuresAnalysis: {},
    TestIterationDetailsModel: {},
    TestMessageLogDetails: {},
    TestOutcome: {
        enumValues: {
            "unspecified": 0,
            "none": 1,
            "passed": 2,
            "failed": 3,
            "inconclusive": 4,
            "timeout": 5,
            "aborted": 6,
            "blocked": 7,
            "notExecuted": 8,
            "warning": 9,
            "error": 10,
            "notApplicable": 11,
            "paused": 12,
            "inProgress": 13,
            "notImpacted": 14,
            "maxValue": 14
        }
    },
    TestPlan: {},
    TestPlanCloneRequest: {},
    TestPlanHubData: {},
    TestPlansWithSelection: {},
    TestPoint: {},
    TestPointsQuery: {},
    TestResultHistory: {},
    TestResultHistoryDetailsForGroup: {},
    TestResultModelBase: {},
    TestResultsContext: {},
    TestResultsContextType: {
        enumValues: {
            "build": 1,
            "release": 2
        }
    },
    TestResultsDetails: {},
    TestResultsDetailsForGroup: {},
    TestResultsQuery: {},
    TestResultSummary: {},
    TestResultTrendFilter: {},
    TestRun: {},
    TestRunPublishContext: {
        enumValues: {
            "build": 1,
            "release": 2,
            "all": 3
        }
    },
    TestRunState: {
        enumValues: {
            "unspecified": 0,
            "notStarted": 1,
            "inProgress": 2,
            "completed": 3,
            "aborted": 4,
            "waiting": 5,
            "needsInvestigation": 6
        }
    },
    TestRunSubstate: {
        enumValues: {
            "none": 0,
            "creatingEnvironment": 1,
            "runningTests": 2,
            "canceledByUser": 3,
            "abortedBySystem": 4,
            "timedOut": 5,
            "pendingAnalysis": 6,
            "analyzed": 7,
            "cancellationInProgress": 8
        }
    },
    TestSession: {},
    TestSessionExploredWorkItemReference: {},
    TestSessionSource: {
        enumValues: {
            "unknown": 0,
            "xTDesktop": 1,
            "feedbackDesktop": 2,
            "xTWeb": 3,
            "feedbackWeb": 4,
            "xTDesktop2": 5,
            "sessionInsightsForAll": 6
        }
    },
    TestSessionState: {
        enumValues: {
            "unspecified": 0,
            "notStarted": 1,
            "inProgress": 2,
            "paused": 3,
            "completed": 4,
            "declined": 5
        }
    },
    TestSuite: {},
    TestSummaryForWorkItem: {},
};
exports.TypeInfo.AggregatedDataForResultTrend.fields = {
    resultsByOutcome: {
        isDictionary: true,
        dictionaryKeyEnumType: exports.TypeInfo.TestOutcome,
        dictionaryValueTypeInfo: exports.TypeInfo.AggregatedResultsByOutcome
    },
    testResultsContext: {
        typeInfo: exports.TypeInfo.TestResultsContext
    }
};
exports.TypeInfo.AggregatedResultsAnalysis.fields = {
    notReportedResultsByOutcome: {
        isDictionary: true,
        dictionaryKeyEnumType: exports.TypeInfo.TestOutcome,
        dictionaryValueTypeInfo: exports.TypeInfo.AggregatedResultsByOutcome
    },
    previousContext: {
        typeInfo: exports.TypeInfo.TestResultsContext
    },
    resultsByOutcome: {
        isDictionary: true,
        dictionaryKeyEnumType: exports.TypeInfo.TestOutcome,
        dictionaryValueTypeInfo: exports.TypeInfo.AggregatedResultsByOutcome
    }
};
exports.TypeInfo.AggregatedResultsByOutcome.fields = {
    outcome: {
        enumType: exports.TypeInfo.TestOutcome
    }
};
exports.TypeInfo.BatchResponse.fields = {
    responses: {
        isArray: true,
        typeInfo: exports.TypeInfo.Response
    },
};
exports.TypeInfo.CloneOperationInformation.fields = {
    completionDate: {
        isDate: true,
    },
    creationDate: {
        isDate: true,
    },
    resultObjectType: {
        enumType: exports.TypeInfo.ResultObjectType
    },
    state: {
        enumType: exports.TypeInfo.CloneOperationState
    }
};
exports.TypeInfo.CustomTestFieldDefinition.fields = {
    fieldType: {
        enumType: exports.TypeInfo.CustomTestFieldType
    },
    scope: {
        enumType: exports.TypeInfo.CustomTestFieldScope
    }
};
exports.TypeInfo.FailingSince.fields = {
    date: {
        isDate: true,
    }
};
exports.TypeInfo.LastResultDetails.fields = {
    dateCompleted: {
        isDate: true,
    }
};
exports.TypeInfo.Response.fields = {};
exports.TypeInfo.ResultRetentionSettings.fields = {
    lastUpdatedDate: {
        isDate: true,
    }
};
exports.TypeInfo.ResultsFilter.fields = {
    maxCompleteDate: {
        isDate: true,
    },
    testResultsContext: {
        typeInfo: exports.TypeInfo.TestResultsContext
    }
};
exports.TypeInfo.ResultUpdateRequestModel.fields = {
    actionResultDeletes: {
        isArray: true,
        typeInfo: exports.TypeInfo.TestActionResultModel
    },
    actionResults: {
        isArray: true,
        typeInfo: exports.TypeInfo.TestActionResultModel
    }
};
exports.TypeInfo.RunUpdateModel.fields = {
    logEntries: {
        isArray: true,
        typeInfo: exports.TypeInfo.TestMessageLogDetails
    },
    substate: {
        enumType: exports.TypeInfo.TestRunSubstate
    }
};
exports.TypeInfo.TestActionResultModel.fields = {
    completedDate: {
        isDate: true,
    },
    startedDate: {
        isDate: true,
    }
};
exports.TypeInfo.TestAttachment.fields = {
    attachmentType: {
        enumType: exports.TypeInfo.AttachmentType
    },
    createdDate: {
        isDate: true,
    }
};
exports.TypeInfo.TestCaseResult.fields = {
    completedDate: {
        isDate: true,
    },
    createdDate: {
        isDate: true,
    },
    failingSince: {
        typeInfo: exports.TypeInfo.FailingSince
    },
    iterationDetails: {
        isArray: true,
        typeInfo: exports.TypeInfo.TestIterationDetailsModel
    },
    lastUpdatedDate: {
        isDate: true,
    },
    startedDate: {
        isDate: true,
    }
};
exports.TypeInfo.TestConfiguration.fields = {
    lastUpdatedDate: {
        isDate: true,
    },
    state: {
        enumType: exports.TypeInfo.TestConfigurationState
    }
};
exports.TypeInfo.TestFailuresAnalysis.fields = {
    previousContext: {
        typeInfo: exports.TypeInfo.TestResultsContext
    }
};
exports.TypeInfo.TestIterationDetailsModel.fields = {
    actionResults: {
        isArray: true,
        typeInfo: exports.TypeInfo.TestActionResultModel
    },
    completedDate: {
        isDate: true,
    },
    startedDate: {
        isDate: true,
    }
};
exports.TypeInfo.TestMessageLogDetails.fields = {
    dateCreated: {
        isDate: true,
    }
};
exports.TypeInfo.TestPlan.fields = {
    endDate: {
        isDate: true,
    },
    startDate: {
        isDate: true,
    },
    updatedDate: {
        isDate: true,
    }
};
exports.TypeInfo.TestPlanCloneRequest.fields = {
    destinationTestPlan: {
        typeInfo: exports.TypeInfo.TestPlan
    }
};
exports.TypeInfo.TestPlanHubData.fields = {
    testPlan: {
        typeInfo: exports.TypeInfo.TestPlan
    },
    testPoints: {
        isArray: true,
        typeInfo: exports.TypeInfo.TestPoint
    },
    testSuites: {
        isArray: true,
        typeInfo: exports.TypeInfo.TestSuite
    }
};
exports.TypeInfo.TestPlansWithSelection.fields = {
    plans: {
        isArray: true,
        typeInfo: exports.TypeInfo.TestPlan
    }
};
exports.TypeInfo.TestPoint.fields = {
    lastResultDetails: {
        typeInfo: exports.TypeInfo.LastResultDetails
    },
    lastUpdatedDate: {
        isDate: true,
    }
};
exports.TypeInfo.TestPointsQuery.fields = {
    points: {
        isArray: true,
        typeInfo: exports.TypeInfo.TestPoint
    }
};
exports.TypeInfo.TestResultHistory.fields = {
    resultsForGroup: {
        isArray: true,
        typeInfo: exports.TypeInfo.TestResultHistoryDetailsForGroup
    }
};
exports.TypeInfo.TestResultHistoryDetailsForGroup.fields = {
    latestResult: {
        typeInfo: exports.TypeInfo.TestCaseResult
    }
};
exports.TypeInfo.TestResultModelBase.fields = {
    completedDate: {
        isDate: true,
    },
    startedDate: {
        isDate: true,
    }
};
exports.TypeInfo.TestResultsContext.fields = {
    contextType: {
        enumType: exports.TypeInfo.TestResultsContextType
    }
};
exports.TypeInfo.TestResultsDetails.fields = {
    resultsForGroup: {
        isArray: true,
        typeInfo: exports.TypeInfo.TestResultsDetailsForGroup
    }
};
exports.TypeInfo.TestResultsDetailsForGroup.fields = {
    results: {
        isArray: true,
        typeInfo: exports.TypeInfo.TestCaseResult
    },
    resultsCountByOutcome: {
        isDictionary: true,
        dictionaryKeyEnumType: exports.TypeInfo.TestOutcome,
        dictionaryValueTypeInfo: exports.TypeInfo.AggregatedResultsByOutcome
    }
};
exports.TypeInfo.TestResultsQuery.fields = {
    results: {
        isArray: true,
        typeInfo: exports.TypeInfo.TestCaseResult
    },
    resultsFilter: {
        typeInfo: exports.TypeInfo.ResultsFilter
    }
};
exports.TypeInfo.TestResultSummary.fields = {
    aggregatedResultsAnalysis: {
        typeInfo: exports.TypeInfo.AggregatedResultsAnalysis
    },
    teamProject: {
        typeInfo: TfsCoreInterfaces.TypeInfo.TeamProjectReference
    },
    testFailures: {
        typeInfo: exports.TypeInfo.TestFailuresAnalysis
    },
    testResultsContext: {
        typeInfo: exports.TypeInfo.TestResultsContext
    }
};
exports.TypeInfo.TestResultTrendFilter.fields = {
    maxCompleteDate: {
        isDate: true,
    }
};
exports.TypeInfo.TestRun.fields = {
    completedDate: {
        isDate: true,
    },
    createdDate: {
        isDate: true,
    },
    dueDate: {
        isDate: true,
    },
    lastUpdatedDate: {
        isDate: true,
    },
    startedDate: {
        isDate: true,
    },
    substate: {
        enumType: exports.TypeInfo.TestRunSubstate
    }
};
exports.TypeInfo.TestSession.fields = {
    endDate: {
        isDate: true,
    },
    lastUpdatedDate: {
        isDate: true,
    },
    source: {
        enumType: exports.TypeInfo.TestSessionSource
    },
    startDate: {
        isDate: true,
    },
    state: {
        enumType: exports.TypeInfo.TestSessionState
    }
};
exports.TypeInfo.TestSessionExploredWorkItemReference.fields = {
    endTime: {
        isDate: true,
    },
    startTime: {
        isDate: true,
    }
};
exports.TypeInfo.TestSuite.fields = {
    children: {
        isArray: true,
        typeInfo: exports.TypeInfo.TestSuite
    },
    lastPopulatedDate: {
        isDate: true,
    },
    lastUpdatedDate: {
        isDate: true,
    }
};
exports.TypeInfo.TestSummaryForWorkItem.fields = {
    summary: {
        typeInfo: exports.TypeInfo.AggregatedDataForResultTrend
    }
};
