/// <reference types="node" />
import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import TestInterfaces = require("./interfaces/TestInterfaces");
import TfsCoreInterfaces = require("./interfaces/CoreInterfaces");
export interface ITestApi extends basem.ClientApiBase {
    getActionResults(project: string, runId: number, testCaseResultId: number, iterationId: number, actionPath?: string): Promise<TestInterfaces.TestActionResultModel[]>;
    createTestIterationResultAttachment(attachmentRequestModel: TestInterfaces.TestAttachmentRequestModel, project: string, runId: number, testCaseResultId: number, iterationId: number, actionPath?: string): Promise<TestInterfaces.TestAttachmentReference>;
    createTestResultAttachment(attachmentRequestModel: TestInterfaces.TestAttachmentRequestModel, project: string, runId: number, testCaseResultId: number): Promise<TestInterfaces.TestAttachmentReference>;
    getTestResultAttachmentContent(project: string, runId: number, testCaseResultId: number, attachmentId: number): Promise<NodeJS.ReadableStream>;
    getTestResultAttachments(project: string, runId: number, testCaseResultId: number): Promise<TestInterfaces.TestAttachment[]>;
    getTestResultAttachmentZip(project: string, runId: number, testCaseResultId: number, attachmentId: number): Promise<NodeJS.ReadableStream>;
    createTestRunAttachment(attachmentRequestModel: TestInterfaces.TestAttachmentRequestModel, project: string, runId: number): Promise<TestInterfaces.TestAttachmentReference>;
    getTestRunAttachmentContent(project: string, runId: number, attachmentId: number): Promise<NodeJS.ReadableStream>;
    getTestRunAttachments(project: string, runId: number): Promise<TestInterfaces.TestAttachment[]>;
    getTestRunAttachmentZip(project: string, runId: number, attachmentId: number): Promise<NodeJS.ReadableStream>;
    getBugsLinkedToTestResult(project: string, runId: number, testCaseResultId: number): Promise<TestInterfaces.WorkItemReference[]>;
    getCloneInformation(project: string, cloneOperationId: number, includeDetails?: boolean): Promise<TestInterfaces.CloneOperationInformation>;
    cloneTestPlan(cloneRequestBody: TestInterfaces.TestPlanCloneRequest, project: string, planId: number): Promise<TestInterfaces.CloneOperationInformation>;
    cloneTestSuite(cloneRequestBody: TestInterfaces.TestSuiteCloneRequest, project: string, planId: number, sourceSuiteId: number): Promise<TestInterfaces.CloneOperationInformation>;
    getBuildCodeCoverage(project: string, buildId: number, flags: number): Promise<TestInterfaces.BuildCoverage[]>;
    getCodeCoverageSummary(project: string, buildId: number, deltaBuildId?: number): Promise<TestInterfaces.CodeCoverageSummary>;
    updateCodeCoverageSummary(coverageData: TestInterfaces.CodeCoverageData, project: string, buildId: number): Promise<void>;
    getTestRunCodeCoverage(project: string, runId: number, flags: number): Promise<TestInterfaces.TestRunCoverage[]>;
    createTestConfiguration(testConfiguration: TestInterfaces.TestConfiguration, project: string): Promise<TestInterfaces.TestConfiguration>;
    deleteTestConfiguration(project: string, testConfigurationId: number): Promise<void>;
    getTestConfigurationById(project: string, testConfigurationId: number): Promise<TestInterfaces.TestConfiguration>;
    getTestConfigurations(project: string, skip?: number, top?: number, continuationToken?: string, includeAllProperties?: boolean): Promise<TestInterfaces.TestConfiguration[]>;
    updateTestConfiguration(testConfiguration: TestInterfaces.TestConfiguration, project: string, testConfigurationId: number): Promise<TestInterfaces.TestConfiguration>;
    addCustomFields(newFields: TestInterfaces.CustomTestFieldDefinition[], project: string): Promise<TestInterfaces.CustomTestFieldDefinition[]>;
    queryCustomFields(project: string, scopeFilter: TestInterfaces.CustomTestFieldScope): Promise<TestInterfaces.CustomTestFieldDefinition[]>;
    queryTestResultHistory(filter: TestInterfaces.ResultsFilter, project: string): Promise<TestInterfaces.TestResultHistory>;
    getTestIteration(project: string, runId: number, testCaseResultId: number, iterationId: number, includeActionResults?: boolean): Promise<TestInterfaces.TestIterationDetailsModel>;
    getTestIterations(project: string, runId: number, testCaseResultId: number, includeActionResults?: boolean): Promise<TestInterfaces.TestIterationDetailsModel[]>;
    getLinkedWorkItemsByQuery(workItemQuery: TestInterfaces.LinkedWorkItemsQuery, project: string): Promise<TestInterfaces.LinkedWorkItemsQueryResult[]>;
    getTestRunLogs(project: string, runId: number): Promise<TestInterfaces.TestMessageLogDetails[]>;
    getResultParameters(project: string, runId: number, testCaseResultId: number, iterationId: number, paramName?: string): Promise<TestInterfaces.TestResultParameterModel[]>;
    createTestPlan(testPlan: TestInterfaces.PlanUpdateModel, project: string): Promise<TestInterfaces.TestPlan>;
    deleteTestPlan(project: string, planId: number): Promise<void>;
    getPlanById(project: string, planId: number): Promise<TestInterfaces.TestPlan>;
    getPlans(project: string, owner?: string, skip?: number, top?: number, includePlanDetails?: boolean, filterActivePlans?: boolean): Promise<TestInterfaces.TestPlan[]>;
    updateTestPlan(planUpdateModel: TestInterfaces.PlanUpdateModel, project: string, planId: number): Promise<TestInterfaces.TestPlan>;
    getPoint(project: string, planId: number, suiteId: number, pointIds: number, witFields?: string): Promise<TestInterfaces.TestPoint>;
    getPoints(project: string, planId: number, suiteId: number, witFields?: string, configurationId?: string, testCaseId?: string, testPointIds?: string, includePointDetails?: boolean, skip?: number, top?: number): Promise<TestInterfaces.TestPoint[]>;
    updateTestPoints(pointUpdateModel: TestInterfaces.PointUpdateModel, project: string, planId: number, suiteId: number, pointIds: string): Promise<TestInterfaces.TestPoint[]>;
    getPointsByQuery(query: TestInterfaces.TestPointsQuery, project: string, skip?: number, top?: number): Promise<TestInterfaces.TestPointsQuery>;
    getTestResultDetailsForBuild(project: string, buildId: number, publishContext?: string, groupBy?: string, filter?: string, orderby?: string): Promise<TestInterfaces.TestResultsDetails>;
    getTestResultDetailsForRelease(project: string, releaseId: number, releaseEnvId: number, publishContext?: string, groupBy?: string, filter?: string, orderby?: string): Promise<TestInterfaces.TestResultsDetails>;
    publishTestResultDocument(document: TestInterfaces.TestResultDocument, project: string, runId: number): Promise<TestInterfaces.TestResultDocument>;
    getResultGroupsByBuild(project: string, buildId: number, publishContext: string, fields?: string[]): Promise<TestInterfaces.TestResultsGroupsForBuild>;
    getResultGroupsByRelease(project: string, releaseId: number, publishContext: string, releaseEnvId?: number, fields?: string[]): Promise<TestInterfaces.TestResultsGroupsForRelease>;
    getResultRetentionSettings(project: string): Promise<TestInterfaces.ResultRetentionSettings>;
    updateResultRetentionSettings(retentionSettings: TestInterfaces.ResultRetentionSettings, project: string): Promise<TestInterfaces.ResultRetentionSettings>;
    addTestResultsToTestRun(results: TestInterfaces.TestCaseResult[], project: string, runId: number): Promise<TestInterfaces.TestCaseResult[]>;
    getTestResultById(project: string, runId: number, testCaseResultId: number, detailsToInclude?: TestInterfaces.ResultDetails): Promise<TestInterfaces.TestCaseResult>;
    getTestResults(project: string, runId: number, detailsToInclude?: TestInterfaces.ResultDetails, skip?: number, top?: number, outcomes?: TestInterfaces.TestOutcome[]): Promise<TestInterfaces.TestCaseResult[]>;
    updateTestResults(results: TestInterfaces.TestCaseResult[], project: string, runId: number): Promise<TestInterfaces.TestCaseResult[]>;
    getTestResultsByQuery(query: TestInterfaces.TestResultsQuery, project: string): Promise<TestInterfaces.TestResultsQuery>;
    queryTestResultsReportForBuild(project: string, buildId: number, publishContext?: string, includeFailureDetails?: boolean, buildToCompare?: TestInterfaces.BuildReference): Promise<TestInterfaces.TestResultSummary>;
    queryTestResultsReportForRelease(project: string, releaseId: number, releaseEnvId: number, publishContext?: string, includeFailureDetails?: boolean, releaseToCompare?: TestInterfaces.ReleaseReference): Promise<TestInterfaces.TestResultSummary>;
    queryTestResultsSummaryForReleases(releases: TestInterfaces.ReleaseReference[], project: string): Promise<TestInterfaces.TestResultSummary[]>;
    queryTestSummaryByRequirement(resultsContext: TestInterfaces.TestResultsContext, project: string, workItemIds?: number[]): Promise<TestInterfaces.TestSummaryForWorkItem[]>;
    queryResultTrendForBuild(filter: TestInterfaces.TestResultTrendFilter, project: string): Promise<TestInterfaces.AggregatedDataForResultTrend[]>;
    queryResultTrendForRelease(filter: TestInterfaces.TestResultTrendFilter, project: string): Promise<TestInterfaces.AggregatedDataForResultTrend[]>;
    getTestRunStatistics(project: string, runId: number): Promise<TestInterfaces.TestRunStatistic>;
    createTestRun(testRun: TestInterfaces.RunCreateModel, project: string): Promise<TestInterfaces.TestRun>;
    deleteTestRun(project: string, runId: number): Promise<void>;
    getTestRunById(project: string, runId: number): Promise<TestInterfaces.TestRun>;
    getTestRuns(project: string, buildUri?: string, owner?: string, tmiRunId?: string, planId?: number, includeRunDetails?: boolean, automated?: boolean, skip?: number, top?: number): Promise<TestInterfaces.TestRun[]>;
    queryTestRuns(project: string, minLastUpdatedDate: Date, maxLastUpdatedDate: Date, state?: TestInterfaces.TestRunState, planIds?: number[], isAutomated?: boolean, publishContext?: TestInterfaces.TestRunPublishContext, buildIds?: number[], buildDefIds?: number[], branchName?: string, releaseIds?: number[], releaseDefIds?: number[], releaseEnvIds?: number[], releaseEnvDefIds?: number[], runTitle?: string, top?: number, continuationToken?: string): Promise<TestInterfaces.TestRun[]>;
    updateTestRun(runUpdateModel: TestInterfaces.RunUpdateModel, project: string, runId: number): Promise<TestInterfaces.TestRun>;
    createTestSession(testSession: TestInterfaces.TestSession, teamContext: TfsCoreInterfaces.TeamContext): Promise<TestInterfaces.TestSession>;
    getTestSessions(teamContext: TfsCoreInterfaces.TeamContext, period?: number, allSessions?: boolean, includeAllProperties?: boolean, source?: TestInterfaces.TestSessionSource, includeOnlyCompletedSessions?: boolean): Promise<TestInterfaces.TestSession[]>;
    updateTestSession(testSession: TestInterfaces.TestSession, teamContext: TfsCoreInterfaces.TeamContext): Promise<TestInterfaces.TestSession>;
    deleteSharedParameter(project: string, sharedParameterId: number): Promise<void>;
    deleteSharedStep(project: string, sharedStepId: number): Promise<void>;
    getSuiteEntries(project: string, suiteId: number): Promise<TestInterfaces.SuiteEntry[]>;
    reorderSuiteEntries(suiteEntries: TestInterfaces.SuiteEntryUpdateModel[], project: string, suiteId: number): Promise<TestInterfaces.SuiteEntry[]>;
    addTestCasesToSuite(project: string, planId: number, suiteId: number, testCaseIds: string): Promise<TestInterfaces.SuiteTestCase[]>;
    getTestCaseById(project: string, planId: number, suiteId: number, testCaseIds: number): Promise<TestInterfaces.SuiteTestCase>;
    getTestCases(project: string, planId: number, suiteId: number): Promise<TestInterfaces.SuiteTestCase[]>;
    removeTestCasesFromSuiteUrl(project: string, planId: number, suiteId: number, testCaseIds: string): Promise<void>;
    createTestSuite(testSuite: TestInterfaces.SuiteCreateModel, project: string, planId: number, suiteId: number): Promise<TestInterfaces.TestSuite[]>;
    deleteTestSuite(project: string, planId: number, suiteId: number): Promise<void>;
    getTestSuiteById(project: string, planId: number, suiteId: number, includeChildSuites?: boolean): Promise<TestInterfaces.TestSuite>;
    getTestSuitesForPlan(project: string, planId: number, includeSuites?: boolean, skip?: number, top?: number, asTreeView?: boolean): Promise<TestInterfaces.TestSuite[]>;
    updateTestSuite(suiteUpdateModel: TestInterfaces.SuiteUpdateModel, project: string, planId: number, suiteId: number): Promise<TestInterfaces.TestSuite>;
    getSuitesByTestCaseId(testCaseId: number): Promise<TestInterfaces.TestSuite[]>;
    deleteTestCase(project: string, testCaseId: number): Promise<void>;
    createTestSettings(testSettings: TestInterfaces.TestSettings, project: string): Promise<number>;
    deleteTestSettings(project: string, testSettingsId: number): Promise<void>;
    getTestSettingsById(project: string, testSettingsId: number): Promise<TestInterfaces.TestSettings>;
    createTestVariable(testVariable: TestInterfaces.TestVariable, project: string): Promise<TestInterfaces.TestVariable>;
    deleteTestVariable(project: string, testVariableId: number): Promise<void>;
    getTestVariableById(project: string, testVariableId: number): Promise<TestInterfaces.TestVariable>;
    getTestVariables(project: string, skip?: number, top?: number): Promise<TestInterfaces.TestVariable[]>;
    updateTestVariable(testVariable: TestInterfaces.TestVariable, project: string, testVariableId: number): Promise<TestInterfaces.TestVariable>;
    addWorkItemToTestLinks(workItemToTestLinks: TestInterfaces.WorkItemToTestLinks, project: string): Promise<TestInterfaces.WorkItemToTestLinks>;
    deleteTestMethodToWorkItemLink(project: string, testName: string, workItemId: number): Promise<boolean>;
    queryTestMethodLinkedWorkItems(project: string, testName: string): Promise<TestInterfaces.TestToWorkItemLinks>;
    queryTestResultWorkItems(project: string, workItemCategory: string, automatedTestName?: string, testCaseId?: number, maxCompleteDate?: Date, days?: number, workItemCount?: number): Promise<TestInterfaces.WorkItemReference[]>;
}
export declare class TestApi extends basem.ClientApiBase implements ITestApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     * @param {number} iterationId
     * @param {string} actionPath
     */
    getActionResults(project: string, runId: number, testCaseResultId: number, iterationId: number, actionPath?: string): Promise<TestInterfaces.TestActionResultModel[]>;
    /**
     * @param {TestInterfaces.TestAttachmentRequestModel} attachmentRequestModel
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     * @param {number} iterationId
     * @param {string} actionPath
     */
    createTestIterationResultAttachment(attachmentRequestModel: TestInterfaces.TestAttachmentRequestModel, project: string, runId: number, testCaseResultId: number, iterationId: number, actionPath?: string): Promise<TestInterfaces.TestAttachmentReference>;
    /**
     * @param {TestInterfaces.TestAttachmentRequestModel} attachmentRequestModel
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     */
    createTestResultAttachment(attachmentRequestModel: TestInterfaces.TestAttachmentRequestModel, project: string, runId: number, testCaseResultId: number): Promise<TestInterfaces.TestAttachmentReference>;
    /**
     * Returns a test result attachment
     *
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     * @param {number} attachmentId
     */
    getTestResultAttachmentContent(project: string, runId: number, testCaseResultId: number, attachmentId: number): Promise<NodeJS.ReadableStream>;
    /**
     * Returns attachment references for test result.
     *
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     */
    getTestResultAttachments(project: string, runId: number, testCaseResultId: number): Promise<TestInterfaces.TestAttachment[]>;
    /**
     * Returns a test result attachment
     *
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     * @param {number} attachmentId
     */
    getTestResultAttachmentZip(project: string, runId: number, testCaseResultId: number, attachmentId: number): Promise<NodeJS.ReadableStream>;
    /**
     * @param {TestInterfaces.TestAttachmentRequestModel} attachmentRequestModel
     * @param {string} project - Project ID or project name
     * @param {number} runId
     */
    createTestRunAttachment(attachmentRequestModel: TestInterfaces.TestAttachmentRequestModel, project: string, runId: number): Promise<TestInterfaces.TestAttachmentReference>;
    /**
     * Returns a test run attachment
     *
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} attachmentId
     */
    getTestRunAttachmentContent(project: string, runId: number, attachmentId: number): Promise<NodeJS.ReadableStream>;
    /**
     * Returns attachment references for test run.
     *
     * @param {string} project - Project ID or project name
     * @param {number} runId
     */
    getTestRunAttachments(project: string, runId: number): Promise<TestInterfaces.TestAttachment[]>;
    /**
     * Returns a test run attachment
     *
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} attachmentId
     */
    getTestRunAttachmentZip(project: string, runId: number, attachmentId: number): Promise<NodeJS.ReadableStream>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     */
    getBugsLinkedToTestResult(project: string, runId: number, testCaseResultId: number): Promise<TestInterfaces.WorkItemReference[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} cloneOperationId
     * @param {boolean} includeDetails
     */
    getCloneInformation(project: string, cloneOperationId: number, includeDetails?: boolean): Promise<TestInterfaces.CloneOperationInformation>;
    /**
     * @param {TestInterfaces.TestPlanCloneRequest} cloneRequestBody
     * @param {string} project - Project ID or project name
     * @param {number} planId
     */
    cloneTestPlan(cloneRequestBody: TestInterfaces.TestPlanCloneRequest, project: string, planId: number): Promise<TestInterfaces.CloneOperationInformation>;
    /**
     * @param {TestInterfaces.TestSuiteCloneRequest} cloneRequestBody
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {number} sourceSuiteId
     */
    cloneTestSuite(cloneRequestBody: TestInterfaces.TestSuiteCloneRequest, project: string, planId: number, sourceSuiteId: number): Promise<TestInterfaces.CloneOperationInformation>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} buildId
     * @param {number} flags
     */
    getBuildCodeCoverage(project: string, buildId: number, flags: number): Promise<TestInterfaces.BuildCoverage[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} buildId
     * @param {number} deltaBuildId
     */
    getCodeCoverageSummary(project: string, buildId: number, deltaBuildId?: number): Promise<TestInterfaces.CodeCoverageSummary>;
    /**
     * http://(tfsserver):8080/tfs/DefaultCollection/_apis/test/CodeCoverage?buildId=10 Request: Json of code coverage summary
     *
     * @param {TestInterfaces.CodeCoverageData} coverageData
     * @param {string} project - Project ID or project name
     * @param {number} buildId
     */
    updateCodeCoverageSummary(coverageData: TestInterfaces.CodeCoverageData, project: string, buildId: number): Promise<void>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} flags
     */
    getTestRunCodeCoverage(project: string, runId: number, flags: number): Promise<TestInterfaces.TestRunCoverage[]>;
    /**
     * @param {TestInterfaces.TestConfiguration} testConfiguration
     * @param {string} project - Project ID or project name
     */
    createTestConfiguration(testConfiguration: TestInterfaces.TestConfiguration, project: string): Promise<TestInterfaces.TestConfiguration>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} testConfigurationId
     */
    deleteTestConfiguration(project: string, testConfigurationId: number): Promise<void>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} testConfigurationId
     */
    getTestConfigurationById(project: string, testConfigurationId: number): Promise<TestInterfaces.TestConfiguration>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} skip
     * @param {number} top
     * @param {string} continuationToken
     * @param {boolean} includeAllProperties
     */
    getTestConfigurations(project: string, skip?: number, top?: number, continuationToken?: string, includeAllProperties?: boolean): Promise<TestInterfaces.TestConfiguration[]>;
    /**
     * @param {TestInterfaces.TestConfiguration} testConfiguration
     * @param {string} project - Project ID or project name
     * @param {number} testConfigurationId
     */
    updateTestConfiguration(testConfiguration: TestInterfaces.TestConfiguration, project: string, testConfigurationId: number): Promise<TestInterfaces.TestConfiguration>;
    /**
     * @param {TestInterfaces.CustomTestFieldDefinition[]} newFields
     * @param {string} project - Project ID or project name
     */
    addCustomFields(newFields: TestInterfaces.CustomTestFieldDefinition[], project: string): Promise<TestInterfaces.CustomTestFieldDefinition[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {TestInterfaces.CustomTestFieldScope} scopeFilter
     */
    queryCustomFields(project: string, scopeFilter: TestInterfaces.CustomTestFieldScope): Promise<TestInterfaces.CustomTestFieldDefinition[]>;
    /**
     * @param {TestInterfaces.ResultsFilter} filter
     * @param {string} project - Project ID or project name
     */
    queryTestResultHistory(filter: TestInterfaces.ResultsFilter, project: string): Promise<TestInterfaces.TestResultHistory>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     * @param {number} iterationId
     * @param {boolean} includeActionResults
     */
    getTestIteration(project: string, runId: number, testCaseResultId: number, iterationId: number, includeActionResults?: boolean): Promise<TestInterfaces.TestIterationDetailsModel>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     * @param {boolean} includeActionResults
     */
    getTestIterations(project: string, runId: number, testCaseResultId: number, includeActionResults?: boolean): Promise<TestInterfaces.TestIterationDetailsModel[]>;
    /**
     * @param {TestInterfaces.LinkedWorkItemsQuery} workItemQuery
     * @param {string} project - Project ID or project name
     */
    getLinkedWorkItemsByQuery(workItemQuery: TestInterfaces.LinkedWorkItemsQuery, project: string): Promise<TestInterfaces.LinkedWorkItemsQueryResult[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} runId
     */
    getTestRunLogs(project: string, runId: number): Promise<TestInterfaces.TestMessageLogDetails[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     * @param {number} iterationId
     * @param {string} paramName
     */
    getResultParameters(project: string, runId: number, testCaseResultId: number, iterationId: number, paramName?: string): Promise<TestInterfaces.TestResultParameterModel[]>;
    /**
     * @param {TestInterfaces.PlanUpdateModel} testPlan
     * @param {string} project - Project ID or project name
     */
    createTestPlan(testPlan: TestInterfaces.PlanUpdateModel, project: string): Promise<TestInterfaces.TestPlan>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} planId
     */
    deleteTestPlan(project: string, planId: number): Promise<void>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} planId
     */
    getPlanById(project: string, planId: number): Promise<TestInterfaces.TestPlan>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} owner
     * @param {number} skip
     * @param {number} top
     * @param {boolean} includePlanDetails
     * @param {boolean} filterActivePlans
     */
    getPlans(project: string, owner?: string, skip?: number, top?: number, includePlanDetails?: boolean, filterActivePlans?: boolean): Promise<TestInterfaces.TestPlan[]>;
    /**
     * @param {TestInterfaces.PlanUpdateModel} planUpdateModel
     * @param {string} project - Project ID or project name
     * @param {number} planId
     */
    updateTestPlan(planUpdateModel: TestInterfaces.PlanUpdateModel, project: string, planId: number): Promise<TestInterfaces.TestPlan>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {number} suiteId
     * @param {number} pointIds
     * @param {string} witFields
     */
    getPoint(project: string, planId: number, suiteId: number, pointIds: number, witFields?: string): Promise<TestInterfaces.TestPoint>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {number} suiteId
     * @param {string} witFields
     * @param {string} configurationId
     * @param {string} testCaseId
     * @param {string} testPointIds
     * @param {boolean} includePointDetails
     * @param {number} skip
     * @param {number} top
     */
    getPoints(project: string, planId: number, suiteId: number, witFields?: string, configurationId?: string, testCaseId?: string, testPointIds?: string, includePointDetails?: boolean, skip?: number, top?: number): Promise<TestInterfaces.TestPoint[]>;
    /**
     * @param {TestInterfaces.PointUpdateModel} pointUpdateModel
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {number} suiteId
     * @param {string} pointIds
     */
    updateTestPoints(pointUpdateModel: TestInterfaces.PointUpdateModel, project: string, planId: number, suiteId: number, pointIds: string): Promise<TestInterfaces.TestPoint[]>;
    /**
     * @param {TestInterfaces.TestPointsQuery} query
     * @param {string} project - Project ID or project name
     * @param {number} skip
     * @param {number} top
     */
    getPointsByQuery(query: TestInterfaces.TestPointsQuery, project: string, skip?: number, top?: number): Promise<TestInterfaces.TestPointsQuery>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} buildId
     * @param {string} publishContext
     * @param {string} groupBy
     * @param {string} filter
     * @param {string} orderby
     */
    getTestResultDetailsForBuild(project: string, buildId: number, publishContext?: string, groupBy?: string, filter?: string, orderby?: string): Promise<TestInterfaces.TestResultsDetails>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} releaseEnvId
     * @param {string} publishContext
     * @param {string} groupBy
     * @param {string} filter
     * @param {string} orderby
     */
    getTestResultDetailsForRelease(project: string, releaseId: number, releaseEnvId: number, publishContext?: string, groupBy?: string, filter?: string, orderby?: string): Promise<TestInterfaces.TestResultsDetails>;
    /**
     * @param {TestInterfaces.TestResultDocument} document
     * @param {string} project - Project ID or project name
     * @param {number} runId
     */
    publishTestResultDocument(document: TestInterfaces.TestResultDocument, project: string, runId: number): Promise<TestInterfaces.TestResultDocument>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} buildId
     * @param {string} publishContext
     * @param {string[]} fields
     */
    getResultGroupsByBuild(project: string, buildId: number, publishContext: string, fields?: string[]): Promise<TestInterfaces.TestResultsGroupsForBuild>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {string} publishContext
     * @param {number} releaseEnvId
     * @param {string[]} fields
     */
    getResultGroupsByRelease(project: string, releaseId: number, publishContext: string, releaseEnvId?: number, fields?: string[]): Promise<TestInterfaces.TestResultsGroupsForRelease>;
    /**
     * @param {string} project - Project ID or project name
     */
    getResultRetentionSettings(project: string): Promise<TestInterfaces.ResultRetentionSettings>;
    /**
     * @param {TestInterfaces.ResultRetentionSettings} retentionSettings
     * @param {string} project - Project ID or project name
     */
    updateResultRetentionSettings(retentionSettings: TestInterfaces.ResultRetentionSettings, project: string): Promise<TestInterfaces.ResultRetentionSettings>;
    /**
     * @param {TestInterfaces.TestCaseResult[]} results
     * @param {string} project - Project ID or project name
     * @param {number} runId
     */
    addTestResultsToTestRun(results: TestInterfaces.TestCaseResult[], project: string, runId: number): Promise<TestInterfaces.TestCaseResult[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     * @param {TestInterfaces.ResultDetails} detailsToInclude
     */
    getTestResultById(project: string, runId: number, testCaseResultId: number, detailsToInclude?: TestInterfaces.ResultDetails): Promise<TestInterfaces.TestCaseResult>;
    /**
     * Get Test Results for a run based on filters.
     *
     * @param {string} project - Project ID or project name
     * @param {number} runId - Test Run Id for which results need to be fetched.
     * @param {TestInterfaces.ResultDetails} detailsToInclude - enum indicates details need to be fetched.
     * @param {number} skip - Number of results to skip from beginning.
     * @param {number} top - Number of results to return. Max is 1000 when detailsToInclude is None and 100 otherwise.
     * @param {TestInterfaces.TestOutcome[]} outcomes - List of Testoutcome to filter results, comma seperated list of Testoutcome.
     */
    getTestResults(project: string, runId: number, detailsToInclude?: TestInterfaces.ResultDetails, skip?: number, top?: number, outcomes?: TestInterfaces.TestOutcome[]): Promise<TestInterfaces.TestCaseResult[]>;
    /**
     * @param {TestInterfaces.TestCaseResult[]} results
     * @param {string} project - Project ID or project name
     * @param {number} runId
     */
    updateTestResults(results: TestInterfaces.TestCaseResult[], project: string, runId: number): Promise<TestInterfaces.TestCaseResult[]>;
    /**
     * @param {TestInterfaces.TestResultsQuery} query
     * @param {string} project - Project ID or project name
     */
    getTestResultsByQuery(query: TestInterfaces.TestResultsQuery, project: string): Promise<TestInterfaces.TestResultsQuery>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} buildId
     * @param {string} publishContext
     * @param {boolean} includeFailureDetails
     * @param {TestInterfaces.BuildReference} buildToCompare
     */
    queryTestResultsReportForBuild(project: string, buildId: number, publishContext?: string, includeFailureDetails?: boolean, buildToCompare?: TestInterfaces.BuildReference): Promise<TestInterfaces.TestResultSummary>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} releaseEnvId
     * @param {string} publishContext
     * @param {boolean} includeFailureDetails
     * @param {TestInterfaces.ReleaseReference} releaseToCompare
     */
    queryTestResultsReportForRelease(project: string, releaseId: number, releaseEnvId: number, publishContext?: string, includeFailureDetails?: boolean, releaseToCompare?: TestInterfaces.ReleaseReference): Promise<TestInterfaces.TestResultSummary>;
    /**
     * @param {TestInterfaces.ReleaseReference[]} releases
     * @param {string} project - Project ID or project name
     */
    queryTestResultsSummaryForReleases(releases: TestInterfaces.ReleaseReference[], project: string): Promise<TestInterfaces.TestResultSummary[]>;
    /**
     * @param {TestInterfaces.TestResultsContext} resultsContext
     * @param {string} project - Project ID or project name
     * @param {number[]} workItemIds
     */
    queryTestSummaryByRequirement(resultsContext: TestInterfaces.TestResultsContext, project: string, workItemIds?: number[]): Promise<TestInterfaces.TestSummaryForWorkItem[]>;
    /**
     * @param {TestInterfaces.TestResultTrendFilter} filter
     * @param {string} project - Project ID or project name
     */
    queryResultTrendForBuild(filter: TestInterfaces.TestResultTrendFilter, project: string): Promise<TestInterfaces.AggregatedDataForResultTrend[]>;
    /**
     * @param {TestInterfaces.TestResultTrendFilter} filter
     * @param {string} project - Project ID or project name
     */
    queryResultTrendForRelease(filter: TestInterfaces.TestResultTrendFilter, project: string): Promise<TestInterfaces.AggregatedDataForResultTrend[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} runId
     */
    getTestRunStatistics(project: string, runId: number): Promise<TestInterfaces.TestRunStatistic>;
    /**
     * @param {TestInterfaces.RunCreateModel} testRun
     * @param {string} project - Project ID or project name
     */
    createTestRun(testRun: TestInterfaces.RunCreateModel, project: string): Promise<TestInterfaces.TestRun>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} runId
     */
    deleteTestRun(project: string, runId: number): Promise<void>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} runId
     */
    getTestRunById(project: string, runId: number): Promise<TestInterfaces.TestRun>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} buildUri
     * @param {string} owner
     * @param {string} tmiRunId
     * @param {number} planId
     * @param {boolean} includeRunDetails
     * @param {boolean} automated
     * @param {number} skip
     * @param {number} top
     */
    getTestRuns(project: string, buildUri?: string, owner?: string, tmiRunId?: string, planId?: number, includeRunDetails?: boolean, automated?: boolean, skip?: number, top?: number): Promise<TestInterfaces.TestRun[]>;
    /**
     * Query Test Runs based on filters.
     *
     * @param {string} project - Project ID or project name
     * @param {Date} minLastUpdatedDate - Minimum Last Modified Date of run to be queried (Mandatory).
     * @param {Date} maxLastUpdatedDate - Maximum Last Modified Date of run to be queried (Mandatory, difference between min and max date can be atmost 7 days).
     * @param {TestInterfaces.TestRunState} state - Current state of the Runs to be queried.
     * @param {number[]} planIds - Plan Ids of the Runs to be queried, comma seperated list of valid ids.
     * @param {boolean} isAutomated - Automation type of the Runs to be queried.
     * @param {TestInterfaces.TestRunPublishContext} publishContext - PublishContext of the Runs to be queried.
     * @param {number[]} buildIds - Build Ids of the Runs to be queried, comma seperated list of valid ids.
     * @param {number[]} buildDefIds - Build Definition Ids of the Runs to be queried, comma seperated list of valid ids.
     * @param {string} branchName - Source Branch name of the Runs to be queried.
     * @param {number[]} releaseIds - Release Ids of the Runs to be queried, comma seperated list of valid ids.
     * @param {number[]} releaseDefIds - Release Definition Ids of the Runs to be queried, comma seperated list of valid ids.
     * @param {number[]} releaseEnvIds - Release Environment Ids of the Runs to be queried, comma seperated list of valid ids.
     * @param {number[]} releaseEnvDefIds - Release Environment Definition Ids of the Runs to be queried, comma seperated list of valid ids.
     * @param {string} runTitle - Run Title of the Runs to be queried.
     * @param {number} top - Number of runs to be queried. Limit is 100
     * @param {string} continuationToken - continuationToken received from previous batch or null for first batch.
     */
    queryTestRuns(project: string, minLastUpdatedDate: Date, maxLastUpdatedDate: Date, state?: TestInterfaces.TestRunState, planIds?: number[], isAutomated?: boolean, publishContext?: TestInterfaces.TestRunPublishContext, buildIds?: number[], buildDefIds?: number[], branchName?: string, releaseIds?: number[], releaseDefIds?: number[], releaseEnvIds?: number[], releaseEnvDefIds?: number[], runTitle?: string, top?: number, continuationToken?: string): Promise<TestInterfaces.TestRun[]>;
    /**
     * @param {TestInterfaces.RunUpdateModel} runUpdateModel
     * @param {string} project - Project ID or project name
     * @param {number} runId
     */
    updateTestRun(runUpdateModel: TestInterfaces.RunUpdateModel, project: string, runId: number): Promise<TestInterfaces.TestRun>;
    /**
     * @param {TestInterfaces.TestSession} testSession
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    createTestSession(testSession: TestInterfaces.TestSession, teamContext: TfsCoreInterfaces.TeamContext): Promise<TestInterfaces.TestSession>;
    /**
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {number} period
     * @param {boolean} allSessions
     * @param {boolean} includeAllProperties
     * @param {TestInterfaces.TestSessionSource} source
     * @param {boolean} includeOnlyCompletedSessions
     */
    getTestSessions(teamContext: TfsCoreInterfaces.TeamContext, period?: number, allSessions?: boolean, includeAllProperties?: boolean, source?: TestInterfaces.TestSessionSource, includeOnlyCompletedSessions?: boolean): Promise<TestInterfaces.TestSession[]>;
    /**
     * @param {TestInterfaces.TestSession} testSession
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    updateTestSession(testSession: TestInterfaces.TestSession, teamContext: TfsCoreInterfaces.TeamContext): Promise<TestInterfaces.TestSession>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} sharedParameterId
     */
    deleteSharedParameter(project: string, sharedParameterId: number): Promise<void>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} sharedStepId
     */
    deleteSharedStep(project: string, sharedStepId: number): Promise<void>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} suiteId
     */
    getSuiteEntries(project: string, suiteId: number): Promise<TestInterfaces.SuiteEntry[]>;
    /**
     * @param {TestInterfaces.SuiteEntryUpdateModel[]} suiteEntries
     * @param {string} project - Project ID or project name
     * @param {number} suiteId
     */
    reorderSuiteEntries(suiteEntries: TestInterfaces.SuiteEntryUpdateModel[], project: string, suiteId: number): Promise<TestInterfaces.SuiteEntry[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {number} suiteId
     * @param {string} testCaseIds
     */
    addTestCasesToSuite(project: string, planId: number, suiteId: number, testCaseIds: string): Promise<TestInterfaces.SuiteTestCase[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {number} suiteId
     * @param {number} testCaseIds
     */
    getTestCaseById(project: string, planId: number, suiteId: number, testCaseIds: number): Promise<TestInterfaces.SuiteTestCase>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {number} suiteId
     */
    getTestCases(project: string, planId: number, suiteId: number): Promise<TestInterfaces.SuiteTestCase[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {number} suiteId
     * @param {string} testCaseIds
     */
    removeTestCasesFromSuiteUrl(project: string, planId: number, suiteId: number, testCaseIds: string): Promise<void>;
    /**
     * @param {TestInterfaces.SuiteCreateModel} testSuite
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {number} suiteId
     */
    createTestSuite(testSuite: TestInterfaces.SuiteCreateModel, project: string, planId: number, suiteId: number): Promise<TestInterfaces.TestSuite[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {number} suiteId
     */
    deleteTestSuite(project: string, planId: number, suiteId: number): Promise<void>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {number} suiteId
     * @param {boolean} includeChildSuites
     */
    getTestSuiteById(project: string, planId: number, suiteId: number, includeChildSuites?: boolean): Promise<TestInterfaces.TestSuite>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {boolean} includeSuites
     * @param {number} skip
     * @param {number} top
     * @param {boolean} asTreeView
     */
    getTestSuitesForPlan(project: string, planId: number, includeSuites?: boolean, skip?: number, top?: number, asTreeView?: boolean): Promise<TestInterfaces.TestSuite[]>;
    /**
     * @param {TestInterfaces.SuiteUpdateModel} suiteUpdateModel
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {number} suiteId
     */
    updateTestSuite(suiteUpdateModel: TestInterfaces.SuiteUpdateModel, project: string, planId: number, suiteId: number): Promise<TestInterfaces.TestSuite>;
    /**
     * @param {number} testCaseId
     */
    getSuitesByTestCaseId(testCaseId: number): Promise<TestInterfaces.TestSuite[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} testCaseId
     */
    deleteTestCase(project: string, testCaseId: number): Promise<void>;
    /**
     * @param {TestInterfaces.TestSettings} testSettings
     * @param {string} project - Project ID or project name
     */
    createTestSettings(testSettings: TestInterfaces.TestSettings, project: string): Promise<number>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} testSettingsId
     */
    deleteTestSettings(project: string, testSettingsId: number): Promise<void>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} testSettingsId
     */
    getTestSettingsById(project: string, testSettingsId: number): Promise<TestInterfaces.TestSettings>;
    /**
     * @param {TestInterfaces.TestVariable} testVariable
     * @param {string} project - Project ID or project name
     */
    createTestVariable(testVariable: TestInterfaces.TestVariable, project: string): Promise<TestInterfaces.TestVariable>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} testVariableId
     */
    deleteTestVariable(project: string, testVariableId: number): Promise<void>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} testVariableId
     */
    getTestVariableById(project: string, testVariableId: number): Promise<TestInterfaces.TestVariable>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} skip
     * @param {number} top
     */
    getTestVariables(project: string, skip?: number, top?: number): Promise<TestInterfaces.TestVariable[]>;
    /**
     * @param {TestInterfaces.TestVariable} testVariable
     * @param {string} project - Project ID or project name
     * @param {number} testVariableId
     */
    updateTestVariable(testVariable: TestInterfaces.TestVariable, project: string, testVariableId: number): Promise<TestInterfaces.TestVariable>;
    /**
     * @param {TestInterfaces.WorkItemToTestLinks} workItemToTestLinks
     * @param {string} project - Project ID or project name
     */
    addWorkItemToTestLinks(workItemToTestLinks: TestInterfaces.WorkItemToTestLinks, project: string): Promise<TestInterfaces.WorkItemToTestLinks>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} testName
     * @param {number} workItemId
     */
    deleteTestMethodToWorkItemLink(project: string, testName: string, workItemId: number): Promise<boolean>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} testName
     */
    queryTestMethodLinkedWorkItems(project: string, testName: string): Promise<TestInterfaces.TestToWorkItemLinks>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} workItemCategory
     * @param {string} automatedTestName
     * @param {number} testCaseId
     * @param {Date} maxCompleteDate
     * @param {number} days
     * @param {number} workItemCount
     */
    queryTestResultWorkItems(project: string, workItemCategory: string, automatedTestName?: string, testCaseId?: number, maxCompleteDate?: Date, days?: number, workItemCount?: number): Promise<TestInterfaces.WorkItemReference[]>;
}
