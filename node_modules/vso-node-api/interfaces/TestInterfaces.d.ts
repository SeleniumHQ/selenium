import TfsCoreInterfaces = require("../interfaces/CoreInterfaces");
import VSSInterfaces = require("../interfaces/common/VSSInterfaces");
export interface AggregatedDataForResultTrend {
    /**
     * This is tests execution duration.
     */
    duration: any;
    resultsByOutcome: {
        [key: number]: AggregatedResultsByOutcome;
    };
    testResultsContext: TestResultsContext;
    totalTests: number;
}
export interface AggregatedResultsAnalysis {
    duration: any;
    notReportedResultsByOutcome: {
        [key: number]: AggregatedResultsByOutcome;
    };
    previousContext: TestResultsContext;
    resultsByOutcome: {
        [key: number]: AggregatedResultsByOutcome;
    };
    resultsDifference: AggregatedResultsDifference;
    totalTests: number;
}
export interface AggregatedResultsByOutcome {
    count: number;
    duration: any;
    groupByField: string;
    groupByValue: any;
    outcome: TestOutcome;
    rerunResultCount: number;
}
export interface AggregatedResultsDifference {
    increaseInDuration: any;
    increaseInFailures: number;
    increaseInOtherTests: number;
    increaseInPassedTests: number;
    increaseInTotalTests: number;
}
/**
 * The types of test attachments.
 */
export declare enum AttachmentType {
    GeneralAttachment = 0,
    AfnStrip = 1,
    BugFilingData = 2,
    CodeCoverage = 3,
    IntermediateCollectorData = 4,
    RunConfig = 5,
    TestImpactDetails = 6,
    TmiTestRunDeploymentFiles = 7,
    TmiTestRunReverseDeploymentFiles = 8,
    TmiTestResultDetail = 9,
    TmiTestRunSummary = 10,
    ConsoleLog = 11,
}
export interface BatchResponse {
    error: string;
    responses: Response[];
    status: string;
}
export interface BuildConfiguration {
    branchName: string;
    buildDefinitionId: number;
    flavor: string;
    id: number;
    number: string;
    platform: string;
    project: ShallowReference;
    repositoryId: number;
    sourceVersion: string;
    uri: string;
}
export interface BuildCoverage {
    codeCoverageFileUrl: string;
    configuration: BuildConfiguration;
    lastError: string;
    modules: ModuleCoverage[];
    state: string;
}
export interface BuildReference {
    branchName: string;
    buildSystem: string;
    definitionId: number;
    id: number;
    number: string;
    repositoryId: string;
    uri: string;
}
export interface CloneOperationInformation {
    cloneStatistics: CloneStatistics;
    /**
     * If the operation is complete, the DateTime of completion. If operation is not complete, this is DateTime.MaxValue
     */
    completionDate: Date;
    /**
     * DateTime when the operation was started
     */
    creationDate: Date;
    /**
     * Shallow reference of the destination
     */
    destinationObject: ShallowReference;
    /**
     * Shallow reference of the destination
     */
    destinationPlan: ShallowReference;
    /**
     * Shallow reference of the destination
     */
    destinationProject: ShallowReference;
    /**
     * If the operation has Failed, Message contains the reason for failure. Null otherwise.
     */
    message: string;
    /**
     * The ID of the operation
     */
    opId: number;
    /**
     * The type of the object generated as a result of the Clone operation
     */
    resultObjectType: ResultObjectType;
    /**
     * Shallow reference of the source
     */
    sourceObject: ShallowReference;
    /**
     * Shallow reference of the source
     */
    sourcePlan: ShallowReference;
    /**
     * Shallow reference of the source
     */
    sourceProject: ShallowReference;
    /**
     * Current state of the operation. When State reaches Suceeded or Failed, the operation is complete
     */
    state: CloneOperationState;
    /**
     * Url for geting the clone information
     */
    url: string;
}
export declare enum CloneOperationState {
    Failed = 2,
    InProgress = 1,
    Queued = 0,
    Succeeded = 3,
}
export interface CloneOptions {
    /**
     * If set to true requirements will be cloned
     */
    cloneRequirements: boolean;
    /**
     * copy all suites from a source plan
     */
    copyAllSuites: boolean;
    /**
     * copy ancestor hieracrchy
     */
    copyAncestorHierarchy: boolean;
    /**
     * Name of the workitem type of the clone
     */
    destinationWorkItemType: string;
    /**
     * Key value pairs where the key value is overridden by the value.
     */
    overrideParameters: {
        [key: string]: string;
    };
    /**
     * Comment on the link that will link the new clone  test case to the original Set null for no comment
     */
    relatedLinkComment: string;
}
export interface CloneStatistics {
    /**
     * Number of Requirments cloned so far.
     */
    clonedRequirementsCount: number;
    /**
     * Number of shared steps cloned so far.
     */
    clonedSharedStepsCount: number;
    /**
     * Number of test cases cloned so far
     */
    clonedTestCasesCount: number;
    /**
     * Total number of requirements to be cloned
     */
    totalRequirementsCount: number;
    /**
     * Total number of test cases to be cloned
     */
    totalTestCasesCount: number;
}
/**
 * Represents the build configuration (platform, flavor) and coverage data for the build
 */
export interface CodeCoverageData {
    /**
     * Flavor of build for which data is retrieved/published
     */
    buildFlavor: string;
    /**
     * Platform of build for which data is retrieved/published
     */
    buildPlatform: string;
    /**
     * List of coverage data for the build
     */
    coverageStats: CodeCoverageStatistics[];
}
/**
 * Represents the code coverage statistics for a particular coverage label (modules, statements, blocks, etc.)
 */
export interface CodeCoverageStatistics {
    /**
     * Covered units
     */
    covered: number;
    /**
     * Delta of coverage
     */
    delta: number;
    /**
     * Is delta valid
     */
    isDeltaAvailable: boolean;
    /**
     * Label of coverage data ("Blocks", "Statements", "Modules", etc.)
     */
    label: string;
    /**
     * Position of label
     */
    position: number;
    /**
     * Total units
     */
    total: number;
}
/**
 * Represents the code coverage summary results Used to publish or retrieve code coverage summary against a build
 */
export interface CodeCoverageSummary {
    /**
     * Uri of build for which data is retrieved/published
     */
    build: ShallowReference;
    /**
     * List of coverage data and details for the build
     */
    coverageData: CodeCoverageData[];
    /**
     * Uri of build against which difference in coverage is computed
     */
    deltaBuild: ShallowReference;
}
/**
 * Used to choose which coverage data is returned by a QueryXXXCoverage() call.
 */
export declare enum CoverageQueryFlags {
    /**
     * If set, the Coverage.Modules property will be populated.
     */
    Modules = 1,
    /**
     * If set, the ModuleCoverage.Functions properties will be populated.
     */
    Functions = 2,
    /**
     * If set, the ModuleCoverage.CoverageData field will be populated.
     */
    BlockData = 4,
}
export interface CoverageStatistics {
    blocksCovered: number;
    blocksNotCovered: number;
    linesCovered: number;
    linesNotCovered: number;
    linesPartiallyCovered: number;
}
export interface CustomTestField {
    fieldName: string;
    value: any;
}
export interface CustomTestFieldDefinition {
    fieldId: number;
    fieldName: string;
    fieldType: CustomTestFieldType;
    scope: CustomTestFieldScope;
}
export declare enum CustomTestFieldScope {
    None = 0,
    TestRun = 1,
    TestResult = 2,
    System = 4,
    All = 7,
}
export declare enum CustomTestFieldType {
    Bit = 2,
    DateTime = 4,
    Int = 8,
    Float = 6,
    String = 12,
    Guid = 14,
}
/**
 * This is a temporary class to provide the details for the test run environment.
 */
export interface DtlEnvironmentDetails {
    csmContent: string;
    csmParameters: string;
    subscriptionName: string;
}
export interface FailingSince {
    build: BuildReference;
    date: Date;
    release: ReleaseReference;
}
export interface FieldDetailsForTestResults {
    /**
     * Group by field name
     */
    fieldName: string;
    /**
     * Group by field values
     */
    groupsForField: any[];
}
export interface FunctionCoverage {
    class: string;
    name: string;
    namespace: string;
    sourceFile: string;
    statistics: CoverageStatistics;
}
export interface LastResultDetails {
    dateCompleted: Date;
    duration: number;
    runBy: VSSInterfaces.IdentityRef;
}
export interface LinkedWorkItemsQuery {
    automatedTestNames: string[];
    planId: number;
    pointIds: number[];
    suiteIds: number[];
    testCaseIds: number[];
    workItemCategory: string;
}
export interface LinkedWorkItemsQueryResult {
    automatedTestName: string;
    planId: number;
    pointId: number;
    suiteId: number;
    testCaseId: number;
    workItems: WorkItemReference[];
}
export interface ModuleCoverage {
    blockCount: number;
    blockData: number[];
    functions: FunctionCoverage[];
    name: string;
    signature: string;
    signatureAge: number;
    statistics: CoverageStatistics;
}
export interface NameValuePair {
    name: string;
    value: string;
}
export interface PlanUpdateModel {
    area: ShallowReference;
    automatedTestEnvironment: TestEnvironment;
    automatedTestSettings: TestSettings;
    build: ShallowReference;
    buildDefinition: ShallowReference;
    configurationIds: number[];
    description: string;
    endDate: string;
    iteration: string;
    manualTestEnvironment: TestEnvironment;
    manualTestSettings: TestSettings;
    name: string;
    owner: VSSInterfaces.IdentityRef;
    releaseEnvironmentDefinition: ReleaseEnvironmentDefinitionReference;
    startDate: string;
    state: string;
    status: string;
}
export interface PointAssignment {
    configuration: ShallowReference;
    tester: VSSInterfaces.IdentityRef;
}
export interface PointsFilter {
    configurationNames: string[];
    testcaseIds: number[];
    testers: VSSInterfaces.IdentityRef[];
}
export interface PointUpdateModel {
    outcome: string;
    resetToActive: boolean;
    tester: VSSInterfaces.IdentityRef;
}
export interface PointWorkItemProperty {
    workItem: {
        key: string;
        value: any;
    };
}
export interface PropertyBag {
    /**
     * Generic store for test session data
     */
    bag: {
        [key: string]: string;
    };
}
export interface QueryModel {
    query: string;
}
export interface ReleaseEnvironmentDefinitionReference {
    definitionId: number;
    environmentDefinitionId: number;
}
export interface ReleaseReference {
    definitionId: number;
    environmentDefinitionId: number;
    environmentDefinitionName: string;
    environmentId: number;
    environmentName: string;
    id: number;
    name: string;
}
export interface Response {
    error: string;
    id: string;
    status: string;
    url: string;
}
export declare enum ResultDetails {
    None = 0,
    Iterations = 1,
    WorkItems = 2,
}
/**
 * The top level entity that is being cloned as part of a Clone operation
 */
export declare enum ResultObjectType {
    TestSuite = 0,
    TestPlan = 1,
}
export interface ResultRetentionSettings {
    automatedResultsRetentionDuration: number;
    lastUpdatedBy: VSSInterfaces.IdentityRef;
    lastUpdatedDate: Date;
    manualResultsRetentionDuration: number;
}
export interface ResultsFilter {
    automatedTestName: string;
    branch: string;
    groupBy: string;
    maxCompleteDate: Date;
    resultsCount: number;
    testCaseReferenceIds: number[];
    testResultsContext: TestResultsContext;
    trendDays: number;
}
export interface ResultUpdateRequestModel {
    actionResultDeletes: TestActionResultModel[];
    actionResults: TestActionResultModel[];
    parameterDeletes: TestResultParameterModel[];
    parameters: TestResultParameterModel[];
    testCaseResult: TestCaseResultUpdateModel;
}
export interface ResultUpdateResponseModel {
    revision: number;
}
export interface RunCreateModel {
    automated: boolean;
    build: ShallowReference;
    buildDropLocation: string;
    buildFlavor: string;
    buildPlatform: string;
    comment: string;
    completeDate: string;
    configurationIds: number[];
    controller: string;
    customTestFields: CustomTestField[];
    dtlAutEnvironment: ShallowReference;
    dtlTestEnvironment: ShallowReference;
    dueDate: string;
    environmentDetails: DtlEnvironmentDetails;
    errorMessage: string;
    filter: RunFilter;
    iteration: string;
    name: string;
    owner: VSSInterfaces.IdentityRef;
    plan: ShallowReference;
    pointIds: number[];
    releaseEnvironmentUri: string;
    releaseUri: string;
    runTimeout: any;
    sourceWorkflow: string;
    startDate: string;
    state: string;
    testConfigurationsMapping: string;
    testEnvironmentId: string;
    testSettings: ShallowReference;
    type: string;
}
/**
 * This class is used to provide the filters used for discovery
 */
export interface RunFilter {
    /**
     * filter for the test case sources (test containers)
     */
    sourceFilter: string;
    /**
     * filter for the test cases
     */
    testCaseFilter: string;
}
export interface RunStatistic {
    count: number;
    outcome: string;
    resolutionState: TestResolutionState;
    state: string;
}
export interface RunUpdateModel {
    build: ShallowReference;
    buildDropLocation: string;
    buildFlavor: string;
    buildPlatform: string;
    comment: string;
    completedDate: string;
    controller: string;
    deleteInProgressResults: boolean;
    dtlAutEnvironment: ShallowReference;
    dtlEnvironment: ShallowReference;
    dtlEnvironmentDetails: DtlEnvironmentDetails;
    dueDate: string;
    errorMessage: string;
    iteration: string;
    logEntries: TestMessageLogDetails[];
    name: string;
    releaseEnvironmentUri: string;
    releaseUri: string;
    sourceWorkflow: string;
    startedDate: string;
    state: string;
    substate: TestRunSubstate;
    testEnvironmentId: string;
    testSettings: ShallowReference;
}
/**
 * An abstracted reference to some other resource. This class is used to provide the build data contracts with a uniform way to reference other resources in a way that provides easy traversal through links.
 */
export interface ShallowReference {
    /**
     * Id of the resource
     */
    id: string;
    /**
     * Name of the linked resource (definition name, controller name, etc.)
     */
    name: string;
    /**
     * Full http link to the resource
     */
    url: string;
}
export interface SharedStepModel {
    id: number;
    revision: number;
}
export interface SuiteCreateModel {
    name: string;
    queryString: string;
    requirementIds: number[];
    suiteType: string;
}
export interface SuiteEntry {
    /**
     * Id of child suite in a suite
     */
    childSuiteId: number;
    /**
     * Sequence number for the test case or child suite in the suite
     */
    sequenceNumber: number;
    /**
     * Id for the suite
     */
    suiteId: number;
    /**
     * Id of a test case in a suite
     */
    testCaseId: number;
}
export interface SuiteEntryUpdateModel {
    /**
     * Id of child suite in a suite
     */
    childSuiteId: number;
    /**
     * Updated sequence number for the test case or child suite in the suite
     */
    sequenceNumber: number;
    /**
     * Id of a test case in a suite
     */
    testCaseId: number;
}
export interface SuiteTestCase {
    pointAssignments: PointAssignment[];
    testCase: WorkItemReference;
}
export interface SuiteUpdateModel {
    defaultConfigurations: ShallowReference[];
    defaultTesters: ShallowReference[];
    inheritDefaultConfigurations: boolean;
    name: string;
    parent: ShallowReference;
    queryString: string;
}
export interface TestActionResultModel extends TestResultModelBase {
    actionPath: string;
    iterationId: number;
    sharedStepModel: SharedStepModel;
    /**
     * This is step Id of test case. For shared step, it is step Id of shared step in test case workitem; step Id in shared step. Example: TestCase workitem has two steps: 1) Normal step with Id = 1 2) Shared Step with Id = 2. Inside shared step: a) Normal Step with Id = 1 Value for StepIdentifier for First step: "1" Second step: "2;1"
     */
    stepIdentifier: string;
    url: string;
}
export interface TestAttachment {
    attachmentType: AttachmentType;
    comment: string;
    createdDate: Date;
    fileName: string;
    id: number;
    url: string;
}
export interface TestAttachmentReference {
    id: number;
    url: string;
}
export interface TestAttachmentRequestModel {
    attachmentType: string;
    comment: string;
    fileName: string;
    stream: string;
}
export interface TestCaseResult {
    afnStripId: number;
    area: ShallowReference;
    associatedBugs: ShallowReference[];
    automatedTestId: string;
    automatedTestName: string;
    automatedTestStorage: string;
    automatedTestType: string;
    automatedTestTypeId: string;
    build: ShallowReference;
    buildReference: BuildReference;
    comment: string;
    completedDate: Date;
    computerName: string;
    configuration: ShallowReference;
    createdDate: Date;
    customFields: CustomTestField[];
    durationInMs: number;
    errorMessage: string;
    failingSince: FailingSince;
    failureType: string;
    id: number;
    iterationDetails: TestIterationDetailsModel[];
    lastUpdatedBy: VSSInterfaces.IdentityRef;
    lastUpdatedDate: Date;
    outcome: string;
    owner: VSSInterfaces.IdentityRef;
    priority: number;
    project: ShallowReference;
    release: ShallowReference;
    releaseReference: ReleaseReference;
    resetCount: number;
    resolutionState: string;
    resolutionStateId: number;
    revision: number;
    runBy: VSSInterfaces.IdentityRef;
    stackTrace: string;
    startedDate: Date;
    state: string;
    testCase: ShallowReference;
    testCaseReferenceId: number;
    testCaseTitle: string;
    testPlan: ShallowReference;
    testPoint: ShallowReference;
    testRun: ShallowReference;
    testSuite: ShallowReference;
    url: string;
}
export interface TestCaseResultAttachmentModel {
    id: number;
    iterationId: number;
    name: string;
    size: number;
    url: string;
}
export interface TestCaseResultIdentifier {
    testResultId: number;
    testRunId: number;
}
export interface TestCaseResultUpdateModel {
    associatedWorkItems: number[];
    automatedTestTypeId: string;
    comment: string;
    completedDate: string;
    computerName: string;
    customFields: CustomTestField[];
    durationInMs: string;
    errorMessage: string;
    failureType: string;
    outcome: string;
    owner: VSSInterfaces.IdentityRef;
    resolutionState: string;
    runBy: VSSInterfaces.IdentityRef;
    stackTrace: string;
    startedDate: string;
    state: string;
    testCasePriority: string;
    testResult: ShallowReference;
}
export interface TestConfiguration {
    /**
     * Area of the configuration
     */
    area: ShallowReference;
    /**
     * Description of the configuration
     */
    description: string;
    /**
     * Id of the configuration
     */
    id: number;
    /**
     * Is the configuration a default for the test plans
     */
    isDefault: boolean;
    /**
     * Last Updated By  Reference
     */
    lastUpdatedBy: VSSInterfaces.IdentityRef;
    /**
     * Last Updated Data
     */
    lastUpdatedDate: Date;
    /**
     * Name of the configuration
     */
    name: string;
    /**
     * Project to which the configuration belongs
     */
    project: ShallowReference;
    /**
     * Revision of the the configuration
     */
    revision: number;
    /**
     * State of the configuration
     */
    state: TestConfigurationState;
    /**
     * Url of Configuration Resource
     */
    url: string;
    /**
     * Dictionary of Test Variable, Selected Value
     */
    values: NameValuePair[];
}
/**
 * Represents the state of an ITestConfiguration object.
 */
export declare enum TestConfigurationState {
    /**
     * The configuration can be used for new test runs.
     */
    Active = 1,
    /**
     * The configuration has been retired and should not be used for new test runs.
     */
    Inactive = 2,
}
export interface TestEnvironment {
    environmentId: string;
    environmentName: string;
}
export interface TestFailureDetails {
    count: number;
    testResults: TestCaseResultIdentifier[];
}
export interface TestFailuresAnalysis {
    existingFailures: TestFailureDetails;
    fixedTests: TestFailureDetails;
    newFailures: TestFailureDetails;
    previousContext: TestResultsContext;
}
export interface TestIterationDetailsModel {
    actionResults: TestActionResultModel[];
    attachments: TestCaseResultAttachmentModel[];
    comment: string;
    completedDate: Date;
    durationInMs: number;
    errorMessage: string;
    id: number;
    outcome: string;
    parameters: TestResultParameterModel[];
    startedDate: Date;
    url: string;
}
/**
 * An abstracted reference to some other resource. This class is used to provide the build data contracts with a uniform way to reference other resources in a way that provides easy traversal through links.
 */
export interface TestMessageLogDetails {
    /**
     * Date when the resource is created
     */
    dateCreated: Date;
    /**
     * Id of the resource
     */
    entryId: number;
    /**
     * Message of the resource
     */
    message: string;
}
export interface TestMethod {
    container: string;
    name: string;
}
/**
 * Class representing a reference to an operation.
 */
export interface TestOperationReference {
    id: string;
    status: string;
    url: string;
}
export declare enum TestOutcome {
    /**
     * Only used during an update to preserve the existing value.
     */
    Unspecified = 0,
    /**
     * Test has not been completed, or the test type does not report pass/failure.
     */
    None = 1,
    /**
     * Test was executed w/o any issues.
     */
    Passed = 2,
    /**
     * Test was executed, but there were issues. Issues may involve exceptions or failed assertions.
     */
    Failed = 3,
    /**
     * Test has completed, but we can't say if it passed or failed. May be used for aborted tests...
     */
    Inconclusive = 4,
    /**
     * The test timed out
     */
    Timeout = 5,
    /**
     * Test was aborted. This was not caused by a user gesture, but rather by a framework decision.
     */
    Aborted = 6,
    /**
     * Test had it chance for been executed but was not, as ITestElement.IsRunnable == false.
     */
    Blocked = 7,
    /**
     * Test was not executed. This was caused by a user gesture - e.g. user hit stop button.
     */
    NotExecuted = 8,
    /**
     * To be used by Run level results. This is not a failure.
     */
    Warning = 9,
    /**
     * There was a system error while we were trying to execute a test.
     */
    Error = 10,
    /**
     * Test is Not Applicable for execution.
     */
    NotApplicable = 11,
    /**
     * Test is paused.
     */
    Paused = 12,
    /**
     * Test is currently executing. Added this for TCM charts
     */
    InProgress = 13,
    /**
     * Test is not impacted. Added fot TIA.
     */
    NotImpacted = 14,
    MaxValue = 14,
}
export interface TestPlan {
    area: ShallowReference;
    automatedTestEnvironment: TestEnvironment;
    automatedTestSettings: TestSettings;
    build: ShallowReference;
    buildDefinition: ShallowReference;
    clientUrl: string;
    description: string;
    endDate: Date;
    id: number;
    iteration: string;
    manualTestEnvironment: TestEnvironment;
    manualTestSettings: TestSettings;
    name: string;
    owner: VSSInterfaces.IdentityRef;
    previousBuild: ShallowReference;
    project: ShallowReference;
    releaseEnvironmentDefinition: ReleaseEnvironmentDefinitionReference;
    revision: number;
    rootSuite: ShallowReference;
    startDate: Date;
    state: string;
    updatedBy: VSSInterfaces.IdentityRef;
    updatedDate: Date;
    url: string;
}
export interface TestPlanCloneRequest {
    destinationTestPlan: TestPlan;
    options: CloneOptions;
    suiteIds: number[];
}
export interface TestPlanHubData {
    selectedSuiteId: number;
    testPlan: TestPlan;
    testPoints: TestPoint[];
    testSuites: TestSuite[];
    totalTestPoints: number;
}
export interface TestPlansWithSelection {
    lastSelectedPlan: number;
    lastSelectedSuite: number;
    plans: TestPlan[];
}
export interface TestPoint {
    assignedTo: VSSInterfaces.IdentityRef;
    automated: boolean;
    comment: string;
    configuration: ShallowReference;
    failureType: string;
    id: number;
    lastResolutionStateId: number;
    lastResult: ShallowReference;
    lastResultDetails: LastResultDetails;
    lastResultState: string;
    lastRunBuildNumber: string;
    lastTestRun: ShallowReference;
    lastUpdatedBy: VSSInterfaces.IdentityRef;
    lastUpdatedDate: Date;
    outcome: string;
    revision: number;
    state: string;
    suite: ShallowReference;
    testCase: WorkItemReference;
    testPlan: ShallowReference;
    url: string;
    workItemProperties: any[];
}
export interface TestPointsQuery {
    orderBy: string;
    points: TestPoint[];
    pointsFilter: PointsFilter;
    witFields: string[];
}
export interface TestResolutionState {
    id: number;
    name: string;
    project: ShallowReference;
}
export interface TestResultCreateModel {
    area: ShallowReference;
    associatedWorkItems: number[];
    automatedTestId: string;
    automatedTestName: string;
    automatedTestStorage: string;
    automatedTestType: string;
    automatedTestTypeId: string;
    comment: string;
    completedDate: string;
    computerName: string;
    configuration: ShallowReference;
    customFields: CustomTestField[];
    durationInMs: string;
    errorMessage: string;
    failureType: string;
    outcome: string;
    owner: VSSInterfaces.IdentityRef;
    resolutionState: string;
    runBy: VSSInterfaces.IdentityRef;
    stackTrace: string;
    startedDate: string;
    state: string;
    testCase: ShallowReference;
    testCasePriority: string;
    testCaseTitle: string;
    testPoint: ShallowReference;
}
export interface TestResultDocument {
    operationReference: TestOperationReference;
    payload: TestResultPayload;
}
export interface TestResultHistory {
    groupByField: string;
    resultsForGroup: TestResultHistoryDetailsForGroup[];
}
export interface TestResultHistoryDetailsForGroup {
    groupByValue: any;
    latestResult: TestCaseResult;
}
export interface TestResultModelBase {
    comment: string;
    completedDate: Date;
    durationInMs: number;
    errorMessage: string;
    outcome: string;
    startedDate: Date;
}
export interface TestResultParameterModel {
    actionPath: string;
    iterationId: number;
    parameterName: string;
    /**
     * This is step Id of test case. For shared step, it is step Id of shared step in test case workitem; step Id in shared step. Example: TestCase workitem has two steps: 1) Normal step with Id = 1 2) Shared Step with Id = 2. Inside shared step: a) Normal Step with Id = 1 Value for StepIdentifier for First step: "1" Second step: "2;1"
     */
    stepIdentifier: string;
    url: string;
    value: string;
}
export interface TestResultPayload {
    comment: string;
    name: string;
    stream: string;
}
export interface TestResultsContext {
    build: BuildReference;
    contextType: TestResultsContextType;
    release: ReleaseReference;
}
export declare enum TestResultsContextType {
    Build = 1,
    Release = 2,
}
export interface TestResultsDetails {
    groupByField: string;
    resultsForGroup: TestResultsDetailsForGroup[];
}
export interface TestResultsDetailsForGroup {
    groupByValue: any;
    results: TestCaseResult[];
    resultsCountByOutcome: {
        [key: number]: AggregatedResultsByOutcome;
    };
}
export interface TestResultsGroupsForBuild {
    /**
     * BuildId for which groupby result is fetched.
     */
    buildId: number;
    /**
     * The group by results
     */
    fields: FieldDetailsForTestResults[];
}
export interface TestResultsGroupsForRelease {
    /**
     * The group by results
     */
    fields: FieldDetailsForTestResults[];
    /**
     * Release Environment Id for which groupby result is fetched.
     */
    releaseEnvId: number;
    /**
     * ReleaseId for which groupby result is fetched.
     */
    releaseId: number;
}
export interface TestResultsQuery {
    fields: string[];
    results: TestCaseResult[];
    resultsFilter: ResultsFilter;
}
export interface TestResultSummary {
    aggregatedResultsAnalysis: AggregatedResultsAnalysis;
    teamProject: TfsCoreInterfaces.TeamProjectReference;
    testFailures: TestFailuresAnalysis;
    testResultsContext: TestResultsContext;
}
export interface TestResultTrendFilter {
    branchNames: string[];
    buildCount: number;
    definitionIds: number[];
    envDefinitionIds: number[];
    maxCompleteDate: Date;
    publishContext: string;
    testRunTitles: string[];
    trendDays: number;
}
export interface TestRun {
    build: ShallowReference;
    buildConfiguration: BuildConfiguration;
    comment: string;
    completedDate: Date;
    controller: string;
    createdDate: Date;
    customFields: CustomTestField[];
    dropLocation: string;
    dtlAutEnvironment: ShallowReference;
    dtlEnvironment: ShallowReference;
    dtlEnvironmentCreationDetails: DtlEnvironmentDetails;
    dueDate: Date;
    errorMessage: string;
    filter: RunFilter;
    id: number;
    incompleteTests: number;
    isAutomated: boolean;
    iteration: string;
    lastUpdatedBy: VSSInterfaces.IdentityRef;
    lastUpdatedDate: Date;
    name: string;
    notApplicableTests: number;
    owner: VSSInterfaces.IdentityRef;
    passedTests: number;
    phase: string;
    plan: ShallowReference;
    postProcessState: string;
    project: ShallowReference;
    release: ReleaseReference;
    releaseEnvironmentUri: string;
    releaseUri: string;
    revision: number;
    runStatistics: RunStatistic[];
    startedDate: Date;
    state: string;
    substate: TestRunSubstate;
    testEnvironment: TestEnvironment;
    testMessageLogId: number;
    testSettings: ShallowReference;
    totalTests: number;
    unanalyzedTests: number;
    url: string;
    webAccessUrl: string;
}
export interface TestRunCoverage {
    lastError: string;
    modules: ModuleCoverage[];
    state: string;
    testRun: ShallowReference;
}
/**
 * The types of publish context for run.
 */
export declare enum TestRunPublishContext {
    /**
     * Run is published for Build Context.
     */
    Build = 1,
    /**
     * Run is published for Release Context.
     */
    Release = 2,
    /**
     * Run is published for any Context.
     */
    All = 3,
}
/**
 * The types of states for test run.
 */
export declare enum TestRunState {
    /**
     * Only used during an update to preserve the existing value.
     */
    Unspecified = 0,
    /**
     * The run is still being created.  No tests have started yet.
     */
    NotStarted = 1,
    /**
     * Tests are running.
     */
    InProgress = 2,
    /**
     * All tests have completed or been skipped.
     */
    Completed = 3,
    /**
     * Run is stopped and remaing tests have been aborted
     */
    Aborted = 4,
    /**
     * Run is currently initializing This is a legacy state and should not be used any more
     */
    Waiting = 5,
    /**
     * Run requires investigation because of a test point failure This is a legacy state and should not be used any more
     */
    NeedsInvestigation = 6,
}
export interface TestRunStatistic {
    run: ShallowReference;
    runStatistics: RunStatistic[];
}
/**
 * The types of sub states for test run. It gives the user more info about the test run beyond the high level test run state
 */
export declare enum TestRunSubstate {
    None = 0,
    CreatingEnvironment = 1,
    RunningTests = 2,
    CanceledByUser = 3,
    AbortedBySystem = 4,
    TimedOut = 5,
    PendingAnalysis = 6,
    Analyzed = 7,
    CancellationInProgress = 8,
}
export interface TestSession {
    /**
     * Area path of the test session
     */
    area: ShallowReference;
    /**
     * Comments in the test session
     */
    comment: string;
    /**
     * Duration of the session
     */
    endDate: Date;
    /**
     * Id of the test session
     */
    id: number;
    /**
     * Last Updated By  Reference
     */
    lastUpdatedBy: VSSInterfaces.IdentityRef;
    /**
     * Last updated date
     */
    lastUpdatedDate: Date;
    /**
     * Owner of the test session
     */
    owner: VSSInterfaces.IdentityRef;
    /**
     * Project to which the test session belongs
     */
    project: ShallowReference;
    /**
     * Generic store for test session data
     */
    propertyBag: PropertyBag;
    /**
     * Revision of the test session
     */
    revision: number;
    /**
     * Source of the test session
     */
    source: TestSessionSource;
    /**
     * Start date
     */
    startDate: Date;
    /**
     * State of the test session
     */
    state: TestSessionState;
    /**
     * Title of the test session
     */
    title: string;
    /**
     * Url of Test Session Resource
     */
    url: string;
}
export interface TestSessionExploredWorkItemReference extends TestSessionWorkItemReference {
    /**
     * Workitem references of workitems filed as a part of the current workitem exploration.
     */
    associatedWorkItems: TestSessionWorkItemReference[];
    /**
     * Time when exploration of workitem ended.
     */
    endTime: Date;
    /**
     * Time when explore of workitem was started.
     */
    startTime: Date;
}
/**
 * Represents the state of the test session.
 */
export declare enum TestSessionSource {
    /**
     * Source of test session uncertain as it is stale
     */
    Unknown = 0,
    /**
     * The session was created from Microsoft Test Manager exploratory desktop tool.
     */
    XTDesktop = 1,
    /**
     * The session was created from feedback client.
     */
    FeedbackDesktop = 2,
    /**
     * The session was created from browser extension.
     */
    XTWeb = 3,
    /**
     * The session was created from browser extension.
     */
    FeedbackWeb = 4,
    /**
     * The session was created from web access using Microsoft Test Manager exploratory desktop tool.
     */
    XTDesktop2 = 5,
    /**
     * To show sessions from all supported sources.
     */
    SessionInsightsForAll = 6,
}
/**
 * Represents the state of the test session.
 */
export declare enum TestSessionState {
    /**
     * Only used during an update to preserve the existing value.
     */
    Unspecified = 0,
    /**
     * The session is still being created.
     */
    NotStarted = 1,
    /**
     * The session is running.
     */
    InProgress = 2,
    /**
     * The session has paused.
     */
    Paused = 3,
    /**
     * The session has completed.
     */
    Completed = 4,
    /**
     * This is required for Feedback session which are declined
     */
    Declined = 5,
}
export interface TestSessionWorkItemReference {
    /**
     * Id of the workitem
     */
    id: number;
    /**
     * Type of the workitem
     */
    type: string;
}
/**
 * Represents the test settings of the run. Used to create test settings and fetch test settings
 */
export interface TestSettings {
    /**
     * Area path required to create test settings
     */
    areaPath: string;
    /**
     * Description of the test settings. Used in create test settings.
     */
    description: string;
    /**
     * Indicates if the tests settings is public or private.Used in create test settings.
     */
    isPublic: boolean;
    /**
     * Xml string of machine roles. Used in create test settings.
     */
    machineRoles: string;
    /**
     * Test settings content.
     */
    testSettingsContent: string;
    /**
     * Test settings id.
     */
    testSettingsId: number;
    /**
     * Test settings name.
     */
    testSettingsName: string;
}
export interface TestSuite {
    areaUri: string;
    children: TestSuite[];
    defaultConfigurations: ShallowReference[];
    defaultTesters: ShallowReference[];
    id: number;
    inheritDefaultConfigurations: boolean;
    lastError: string;
    lastPopulatedDate: Date;
    lastUpdatedBy: VSSInterfaces.IdentityRef;
    lastUpdatedDate: Date;
    name: string;
    parent: ShallowReference;
    plan: ShallowReference;
    project: ShallowReference;
    queryString: string;
    requirementId: number;
    revision: number;
    state: string;
    suites: ShallowReference[];
    suiteType: string;
    testCaseCount: number;
    testCasesUrl: string;
    text: string;
    url: string;
}
export interface TestSuiteCloneRequest {
    cloneOptions: CloneOptions;
    destinationSuiteId: number;
    destinationSuiteProjectName: string;
}
export interface TestSummaryForWorkItem {
    summary: AggregatedDataForResultTrend;
    workItem: WorkItemReference;
}
export interface TestToWorkItemLinks {
    test: TestMethod;
    workItems: WorkItemReference[];
}
export interface TestVariable {
    /**
     * Description of the test variable
     */
    description: string;
    /**
     * Id of the test variable
     */
    id: number;
    /**
     * Name of the test variable
     */
    name: string;
    /**
     * Project to which the test variable belongs
     */
    project: ShallowReference;
    /**
     * Revision
     */
    revision: number;
    /**
     * Url of the test variable
     */
    url: string;
    /**
     * List of allowed values
     */
    values: string[];
}
export interface WorkItemReference {
    id: string;
    name: string;
    type: string;
    url: string;
    webUrl: string;
}
export interface WorkItemToTestLinks {
    tests: TestMethod[];
    workItem: WorkItemReference;
}
export declare var TypeInfo: {
    AggregatedDataForResultTrend: any;
    AggregatedResultsAnalysis: any;
    AggregatedResultsByOutcome: any;
    AttachmentType: {
        enumValues: {
            "generalAttachment": number;
            "afnStrip": number;
            "bugFilingData": number;
            "codeCoverage": number;
            "intermediateCollectorData": number;
            "runConfig": number;
            "testImpactDetails": number;
            "tmiTestRunDeploymentFiles": number;
            "tmiTestRunReverseDeploymentFiles": number;
            "tmiTestResultDetail": number;
            "tmiTestRunSummary": number;
            "consoleLog": number;
        };
    };
    BatchResponse: any;
    CloneOperationInformation: any;
    CloneOperationState: {
        enumValues: {
            "failed": number;
            "inProgress": number;
            "queued": number;
            "succeeded": number;
        };
    };
    CoverageQueryFlags: {
        enumValues: {
            "modules": number;
            "functions": number;
            "blockData": number;
        };
    };
    CustomTestFieldDefinition: any;
    CustomTestFieldScope: {
        enumValues: {
            "none": number;
            "testRun": number;
            "testResult": number;
            "system": number;
            "all": number;
        };
    };
    CustomTestFieldType: {
        enumValues: {
            "bit": number;
            "dateTime": number;
            "int": number;
            "float": number;
            "string": number;
            "guid": number;
        };
    };
    FailingSince: any;
    LastResultDetails: any;
    Response: any;
    ResultDetails: {
        enumValues: {
            "none": number;
            "iterations": number;
            "workItems": number;
        };
    };
    ResultObjectType: {
        enumValues: {
            "testSuite": number;
            "testPlan": number;
        };
    };
    ResultRetentionSettings: any;
    ResultsFilter: any;
    ResultUpdateRequestModel: any;
    RunUpdateModel: any;
    TestActionResultModel: any;
    TestAttachment: any;
    TestCaseResult: any;
    TestConfiguration: any;
    TestConfigurationState: {
        enumValues: {
            "active": number;
            "inactive": number;
        };
    };
    TestFailuresAnalysis: any;
    TestIterationDetailsModel: any;
    TestMessageLogDetails: any;
    TestOutcome: {
        enumValues: {
            "unspecified": number;
            "none": number;
            "passed": number;
            "failed": number;
            "inconclusive": number;
            "timeout": number;
            "aborted": number;
            "blocked": number;
            "notExecuted": number;
            "warning": number;
            "error": number;
            "notApplicable": number;
            "paused": number;
            "inProgress": number;
            "notImpacted": number;
            "maxValue": number;
        };
    };
    TestPlan: any;
    TestPlanCloneRequest: any;
    TestPlanHubData: any;
    TestPlansWithSelection: any;
    TestPoint: any;
    TestPointsQuery: any;
    TestResultHistory: any;
    TestResultHistoryDetailsForGroup: any;
    TestResultModelBase: any;
    TestResultsContext: any;
    TestResultsContextType: {
        enumValues: {
            "build": number;
            "release": number;
        };
    };
    TestResultsDetails: any;
    TestResultsDetailsForGroup: any;
    TestResultsQuery: any;
    TestResultSummary: any;
    TestResultTrendFilter: any;
    TestRun: any;
    TestRunPublishContext: {
        enumValues: {
            "build": number;
            "release": number;
            "all": number;
        };
    };
    TestRunState: {
        enumValues: {
            "unspecified": number;
            "notStarted": number;
            "inProgress": number;
            "completed": number;
            "aborted": number;
            "waiting": number;
            "needsInvestigation": number;
        };
    };
    TestRunSubstate: {
        enumValues: {
            "none": number;
            "creatingEnvironment": number;
            "runningTests": number;
            "canceledByUser": number;
            "abortedBySystem": number;
            "timedOut": number;
            "pendingAnalysis": number;
            "analyzed": number;
            "cancellationInProgress": number;
        };
    };
    TestSession: any;
    TestSessionExploredWorkItemReference: any;
    TestSessionSource: {
        enumValues: {
            "unknown": number;
            "xTDesktop": number;
            "feedbackDesktop": number;
            "xTWeb": number;
            "feedbackWeb": number;
            "xTDesktop2": number;
            "sessionInsightsForAll": number;
        };
    };
    TestSessionState: {
        enumValues: {
            "unspecified": number;
            "notStarted": number;
            "inProgress": number;
            "paused": number;
            "completed": number;
            "declined": number;
        };
    };
    TestSuite: any;
    TestSummaryForWorkItem: any;
};
