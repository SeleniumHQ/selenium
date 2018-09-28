import DistributedTaskCommonInterfaces = require("../interfaces/DistributedTaskCommonInterfaces");
import FormInputInterfaces = require("../interfaces/common/FormInputInterfaces");
import VSSInterfaces = require("../interfaces/common/VSSInterfaces");
export interface AgentArtifactDefinition {
    alias: string;
    artifactType: AgentArtifactType;
    details: string;
    name: string;
    version: string;
}
export declare enum AgentArtifactType {
    XamlBuild = 0,
    Build = 1,
    Jenkins = 2,
    FileShare = 3,
    Nuget = 4,
    TfsOnPrem = 5,
    GitHub = 6,
    TFGit = 7,
    ExternalTfsBuild = 8,
    Custom = 9,
    Tfvc = 10,
}
export interface AgentBasedDeployPhase extends DeployPhase {
    deploymentInput: AgentDeploymentInput;
}
export interface AgentDeploymentInput extends DeploymentInput {
    imageId: number;
    parallelExecution: ExecutionInput;
}
export declare enum ApprovalExecutionOrder {
    BeforeGates = 1,
    AfterSuccessfulGates = 2,
    AfterGatesAlways = 4,
}
export declare enum ApprovalFilters {
    /**
     * No approvals or approval snapshots
     */
    None = 0,
    /**
     * Manual approval steps but no approval snapshots (Use with ApprovalSnapshots for snapshots)
     */
    ManualApprovals = 1,
    /**
     * Automated approval steps but no approval snapshots (Use with ApprovalSnapshots for snapshots)
     */
    AutomatedApprovals = 2,
    /**
     * No approval steps, but approval snapshots (Use with either ManualApprovals or AutomatedApprovals for approval steps)
     */
    ApprovalSnapshots = 4,
    /**
     * All approval steps and approval snapshots
     */
    All = 7,
}
export interface ApprovalOptions {
    autoTriggeredAndPreviousEnvironmentApprovedCanBeSkipped: boolean;
    enforceIdentityRevalidation: boolean;
    executionOrder: ApprovalExecutionOrder;
    releaseCreatorCanBeApprover: boolean;
    requiredApproverCount: number;
    timeoutInMinutes: number;
}
export declare enum ApprovalStatus {
    Undefined = 0,
    Pending = 1,
    Approved = 2,
    Rejected = 4,
    Reassigned = 6,
    Canceled = 7,
    Skipped = 8,
}
export declare enum ApprovalType {
    Undefined = 0,
    PreDeploy = 1,
    PostDeploy = 2,
    All = 3,
}
export interface Artifact {
    /**
     * Gets or sets alias.
     */
    alias: string;
    /**
     * Gets or sets definition reference. e.g. {"project":{"id":"fed755ea-49c5-4399-acea-fd5b5aa90a6c","name":"myProject"},"definition":{"id":"1","name":"mybuildDefinition"},"connection":{"id":"1","name":"myConnection"}}
     */
    definitionReference: {
        [key: string]: ArtifactSourceReference;
    };
    /**
     * Gets or sets as artifact is primary or not.
     */
    isPrimary: boolean;
    sourceId: string;
    /**
     * Gets or sets type. It can have value as 'Build', 'Jenkins', 'GitHub', 'Nuget', 'Team Build (external)', 'ExternalTFSBuild', 'Git', 'TFVC', 'ExternalTfsXamlBuild'.
     */
    type: string;
}
export interface ArtifactContributionDefinition {
    artifactType: string;
    artifactTypeStreamMapping: {
        [key: string]: string;
    };
    browsableArtifactTypeMapping: {
        [key: string]: string;
    };
    dataSourceBindings: DataSourceBinding[];
    displayName: string;
    downloadTaskId: string;
    endpointTypeId: string;
    inputDescriptors: FormInputInterfaces.InputDescriptor[];
    name: string;
    uniqueSourceIdentifier: string;
}
export interface ArtifactDownloadInputBase {
    alias: string;
    artifactDownloadMode: string;
    artifactType: string;
}
export interface ArtifactFilter {
    sourceBranch: string;
    tags: string[];
    useBuildDefinitionBranch: boolean;
}
export interface ArtifactInstanceData {
    accountName: string;
    authenticationToken: string;
    tfsUrl: string;
    version: string;
}
export interface ArtifactMetadata {
    /**
     * Sets alias of artifact.
     */
    alias: string;
    /**
     * Sets instance reference of artifact. e.g. for build artifact it is build number.
     */
    instanceReference: BuildVersion;
}
export interface ArtifactProvider {
    id: number;
    name: string;
    sourceUri: string;
    version: string;
}
export interface ArtifactsDownloadInput {
    downloadInputs: ArtifactDownloadInputBase[];
}
export interface ArtifactSourceId {
    artifactTypeId: string;
    sourceIdInputs: SourceIdInput[];
}
export interface ArtifactSourceIdsQueryResult {
    artifactSourceIds: ArtifactSourceId[];
}
export interface ArtifactSourceReference {
    id: string;
    name: string;
}
export interface ArtifactSourceTrigger extends ReleaseTriggerBase {
    /**
     * Artifact source alias for Artifact Source trigger type
     */
    artifactAlias: string;
    triggerConditions: ArtifactFilter[];
}
export interface ArtifactTypeDefinition {
    displayName: string;
    inputDescriptors: FormInputInterfaces.InputDescriptor[];
    name: string;
    uniqueSourceIdentifier: string;
}
export interface ArtifactVersion {
    alias: string;
    defaultVersion: BuildVersion;
    errorMessage: string;
    sourceId: string;
    versions: BuildVersion[];
}
export interface ArtifactVersionQueryResult {
    artifactVersions: ArtifactVersion[];
}
export declare enum AuditAction {
    Add = 1,
    Update = 2,
    Delete = 3,
    Undelete = 4,
}
export declare enum AuthorizationHeaderFor {
    RevalidateApproverIdentity = 0,
    OnBehalfOf = 1,
}
export interface AutoTriggerIssue {
    issue: Issue;
    issueSource: IssueSource;
    project: ProjectReference;
    releaseDefinitionReference: ReleaseDefinitionShallowReference;
    releaseTriggerType: ReleaseTriggerType;
}
export interface AzureKeyVaultVariableGroupProviderData extends VariableGroupProviderData {
    lastRefreshedOn: Date;
    serviceEndpointId: string;
    vault: string;
}
export interface AzureKeyVaultVariableValue extends VariableValue {
    contentType: string;
    enabled: boolean;
    expires: Date;
}
export interface BaseDeploymentInput {
    condition: string;
    /**
     * Gets or sets the job cancel timeout in minutes for deployment which are cancelled by user for this release environment
     */
    jobCancelTimeoutInMinutes: number;
    overrideInputs: {
        [key: string]: string;
    };
    /**
     * Gets or sets the job execution timeout in minutes for deployment which are queued against this release environment
     */
    timeoutInMinutes: number;
}
export interface BuildArtifactDownloadInput extends ArtifactDownloadInputBase {
    artifactItems: string[];
}
export interface BuildVersion {
    commitMessage: string;
    id: string;
    name: string;
    sourceBranch: string;
    /**
     * PullRequestId or Commit Id for the Pull Request for which the release will publish status
     */
    sourcePullRequestId: string;
    sourceRepositoryId: string;
    sourceRepositoryType: string;
    sourceVersion: string;
}
/**
 * Represents a change associated with a build.
 */
export interface Change {
    /**
     * The author of the change.
     */
    author: VSSInterfaces.IdentityRef;
    /**
     * The type of change. "commit", "changeset", etc.
     */
    changeType: string;
    /**
     * The location of a user-friendly representation of the resource.
     */
    displayUri: string;
    /**
     * Something that identifies the change. For a commit, this would be the SHA1. For a TFVC changeset, this would be the changeset id.
     */
    id: string;
    /**
     * The location of the full representation of the resource.
     */
    location: string;
    /**
     * A description of the change. This might be a commit message or changeset description.
     */
    message: string;
    /**
     * The person or process that pushed the change.
     */
    pusher: string;
    /**
     * A timestamp for the change.
     */
    timestamp: Date;
}
export interface Condition {
    /**
     * Gets or sets the condition type.
     */
    conditionType: ConditionType;
    /**
     * Gets or sets the name of the condition. e.g. 'ReleaseStarted'.
     */
    name: string;
    /**
     * Gets or set value of the condition.
     */
    value: string;
}
export declare enum ConditionType {
    /**
     * The condition type is undefined.
     */
    Undefined = 0,
    /**
     * The condition type is event.
     */
    Event = 1,
    /**
     * The condition type is environment state.
     */
    EnvironmentState = 2,
    /**
     * The condition type is artifact.
     */
    Artifact = 4,
}
export interface ConfigurationVariableValue {
    /**
     * Gets or sets as variable is secret or not.
     */
    isSecret: boolean;
    /**
     * Gets or sets value of the configuration variable.
     */
    value: string;
}
export interface Consumer {
    consumerId: number;
    consumerName: string;
}
export interface ContainerImageTrigger extends ReleaseTriggerBase {
    alias: string;
}
export interface ContinuousDeploymentTriggerIssue extends AutoTriggerIssue {
    artifactType: string;
    artifactVersionId: string;
    sourceId: string;
}
export interface ControlOptions {
    alwaysRun: boolean;
    continueOnError: boolean;
    enabled: boolean;
}
export interface CustomArtifactDownloadInput extends ArtifactDownloadInputBase {
}
export interface DataSourceBinding {
    dataSourceName: string;
    endpointId: string;
    endpointUrl: string;
    parameters: {
        [key: string]: string;
    };
    resultSelector: string;
    resultTemplate: string;
    target: string;
}
export interface DefinitionEnvironmentReference {
    definitionEnvironmentId: number;
    definitionEnvironmentName: string;
    releaseDefinitionId: number;
    releaseDefinitionName: string;
}
export interface Deployment {
    /**
     * Gets links to access the deployment.
     */
    _links: any;
    /**
     * Gets attempt number.
     */
    attempt: number;
    /**
     * Gets the date on which deployment is complete.
     */
    completedOn: Date;
    /**
     * Gets the list of condition associated with deployment.
     */
    conditions: Condition[];
    /**
     * Gets release definition environment id.
     */
    definitionEnvironmentId: number;
    /**
     * Gets status of the deployment.
     */
    deploymentStatus: DeploymentStatus;
    /**
     * Gets the unique identifier for deployment.
     */
    id: number;
    /**
     * Gets the identity who last modified the deployment.
     */
    lastModifiedBy: VSSInterfaces.IdentityRef;
    /**
     * Gets the date on which deployment is last modified.
     */
    lastModifiedOn: Date;
    /**
     * Gets operation status of deployment.
     */
    operationStatus: DeploymentOperationStatus;
    /**
     * Gets list of PostDeployApprovals.
     */
    postDeployApprovals: ReleaseApproval[];
    /**
     * Gets list of PreDeployApprovals.
     */
    preDeployApprovals: ReleaseApproval[];
    /**
     * Gets the date on which deployment is queued.
     */
    queuedOn: Date;
    /**
     * Gets reason of deployment.
     */
    reason: DeploymentReason;
    /**
     * Gets the reference of release.
     */
    release: ReleaseReference;
    /**
     * Gets releaseDefinitionReference which specifies the reference of the release definition to which the deployment is associated.
     */
    releaseDefinition: ReleaseDefinitionShallowReference;
    /**
     * Gets releaseEnvironmentReference which specifies the reference of the release environment to which the deployment is associated.
     */
    releaseEnvironment: ReleaseEnvironmentShallowReference;
    /**
     * Gets the identity who requested.
     */
    requestedBy: VSSInterfaces.IdentityRef;
    /**
     * Gets the identity for whom deployment is requested.
     */
    requestedFor: VSSInterfaces.IdentityRef;
    /**
     * Gets the date on which deployment is scheduled.
     */
    scheduledDeploymentTime: Date;
    /**
     * Gets the date on which deployment is started.
     */
    startedOn: Date;
}
export interface DeploymentApprovalCompletedEvent {
    approval: ReleaseApproval;
    project: ProjectReference;
    release: Release;
}
export interface DeploymentApprovalPendingEvent {
    approval: ReleaseApproval;
    approvalOptions: ApprovalOptions;
    completedApprovals: ReleaseApproval[];
    data: {
        [key: string]: any;
    };
    deployment: Deployment;
    isMultipleRankApproval: boolean;
    pendingApprovals: ReleaseApproval[];
    project: ProjectReference;
    release: Release;
}
export interface DeploymentAttempt {
    attempt: number;
    deploymentId: number;
    /**
     * Error log to show any unexpected error that occurred during executing deploy step
     */
    errorLog: string;
    /**
     * Specifies whether deployment has started or not
     */
    hasStarted: boolean;
    id: number;
    /**
     * All the issues related to the deployment
     */
    issues: Issue[];
    job: ReleaseTask;
    lastModifiedBy: VSSInterfaces.IdentityRef;
    lastModifiedOn: Date;
    operationStatus: DeploymentOperationStatus;
    postDeploymentGates: ReleaseGates;
    preDeploymentGates: ReleaseGates;
    queuedOn: Date;
    reason: DeploymentReason;
    releaseDeployPhases: ReleaseDeployPhase[];
    requestedBy: VSSInterfaces.IdentityRef;
    requestedFor: VSSInterfaces.IdentityRef;
    runPlanId: string;
    status: DeploymentStatus;
    tasks: ReleaseTask[];
}
export interface DeploymentAuthorizationInfo {
    authorizationHeaderFor: AuthorizationHeaderFor;
    resources: string[];
    tenantId: string;
    vstsAccessTokenKey: string;
}
export declare enum DeploymentAuthorizationOwner {
    Automatic = 0,
    DeploymentSubmitter = 1,
    FirstPreDeploymentApprover = 2,
}
export interface DeploymentCompletedEvent {
    comment: string;
    data: {
        [key: string]: any;
    };
    deployment: Deployment;
    environment: ReleaseEnvironment;
    project: ProjectReference;
}
export declare enum DeploymentExpands {
    All = 0,
    DeploymentOnly = 1,
    Approvals = 2,
    Artifacts = 4,
}
export interface DeploymentInput extends BaseDeploymentInput {
    artifactsDownloadInput: ArtifactsDownloadInput;
    demands: any[];
    enableAccessToken: boolean;
    queueId: number;
    skipArtifactsDownload: boolean;
}
export interface DeploymentJob {
    job: ReleaseTask;
    tasks: ReleaseTask[];
}
export interface DeploymentManualInterventionPendingEvent {
    deployment: Deployment;
    emailRecipients: string[];
    environmentOwner: VSSInterfaces.IdentityRef;
    manualIntervention: ManualIntervention;
    project: ProjectReference;
    release: Release;
}
export declare enum DeploymentOperationStatus {
    /**
     * The deployment operation status is undefined.
     */
    Undefined = 0,
    /**
     * The deployment operation status is queued.
     */
    Queued = 1,
    /**
     * The deployment operation status is scheduled.
     */
    Scheduled = 2,
    /**
     * The deployment operation status is pending.
     */
    Pending = 4,
    /**
     * The deployment operation status is approved.
     */
    Approved = 8,
    /**
     * The deployment operation status is rejected.
     */
    Rejected = 16,
    /**
     * The deployment operation status is deferred.
     */
    Deferred = 32,
    /**
     * The deployment operation status is queued for agent.
     */
    QueuedForAgent = 64,
    /**
     * The deployment operation status is phase inprogress.
     */
    PhaseInProgress = 128,
    /**
     * The deployment operation status is phase succeeded.
     */
    PhaseSucceeded = 256,
    /**
     * The deployment operation status is phase partially succeeded.
     */
    PhasePartiallySucceeded = 512,
    /**
     * The deployment operation status is phase failed.
     */
    PhaseFailed = 1024,
    /**
     * The deployment operation status is canceled.
     */
    Canceled = 2048,
    /**
     * The deployment operation status is phase canceled.
     */
    PhaseCanceled = 4096,
    /**
     * The deployment operation status is manualintervention pending.
     */
    ManualInterventionPending = 8192,
    /**
     * The deployment operation status is queued for pipeline.
     */
    QueuedForPipeline = 16384,
    /**
     * The deployment operation status is cancelling.
     */
    Cancelling = 32768,
    /**
     * The deployment operation status is EvaluatingGates.
     */
    EvaluatingGates = 65536,
    /**
     * The deployment operation status is GateFailed.
     */
    GateFailed = 131072,
    /**
     * The deployment operation status is all.
     */
    All = 258047,
}
export interface DeploymentQueryParameters {
    artifactSourceId: string;
    artifactTypeId: string;
    artifactVersions: string[];
    deploymentsPerEnvironment: number;
    deploymentStatus: DeploymentStatus;
    environments: DefinitionEnvironmentReference[];
    expands: DeploymentExpands;
    isDeleted: boolean;
    latestDeploymentsOnly: boolean;
    maxDeploymentsPerEnvironment: number;
    maxModifiedTime: Date;
    minModifiedTime: Date;
    operationStatus: DeploymentOperationStatus;
    queryOrder: ReleaseQueryOrder;
    queryType: DeploymentsQueryType;
    sourceBranch: string;
}
export declare enum DeploymentReason {
    /**
     * The deployment reason is none.
     */
    None = 0,
    /**
     * The deployment reason is manual.
     */
    Manual = 1,
    /**
     * The deployment reason is automated.
     */
    Automated = 2,
    /**
     * The deployment reason is scheduled.
     */
    Scheduled = 4,
}
export declare enum DeploymentsQueryType {
    Regular = 1,
    FailingSince = 2,
}
export interface DeploymentStartedEvent {
    environment: ReleaseEnvironment;
    project: ProjectReference;
    release: Release;
}
export declare enum DeploymentStatus {
    /**
     * The deployment status is undefined.
     */
    Undefined = 0,
    /**
     * The deployment status is not deployed.
     */
    NotDeployed = 1,
    /**
     * The deployment status is inprogress.
     */
    InProgress = 2,
    /**
     * The deployment status is succeeded.
     */
    Succeeded = 4,
    /**
     * The deployment status is partiallysucceeded.
     */
    PartiallySucceeded = 8,
    /**
     * The deployment status is failed.
     */
    Failed = 16,
    /**
     * The deployment status is all.
     */
    All = 31,
}
export interface DeployPhase {
    name: string;
    phaseType: DeployPhaseTypes;
    rank: number;
    workflowTasks: WorkflowTask[];
}
export declare enum DeployPhaseStatus {
    Undefined = 0,
    NotStarted = 1,
    InProgress = 2,
    PartiallySucceeded = 4,
    Succeeded = 8,
    Failed = 16,
    Canceled = 32,
    Skipped = 64,
    Cancelling = 128,
}
export declare enum DeployPhaseTypes {
    Undefined = 0,
    AgentBasedDeployment = 1,
    RunOnServer = 2,
    MachineGroupBasedDeployment = 4,
}
export interface EmailRecipients {
    emailAddresses: string[];
    tfsIds: string[];
}
/**
 * Defines policy on environment queuing at Release Management side queue. We will send to Environment Runner [creating pre-deploy and other steps] only when the policies mentioned are satisfied.
 */
export interface EnvironmentExecutionPolicy {
    /**
     * This policy decides, how many environments would be with Environment Runner.
     */
    concurrencyCount: number;
    /**
     * Queue depth in the EnvironmentQueue table, this table keeps the environment entries till Environment Runner is free [as per it's policy] to take another environment for running.
     */
    queueDepthCount: number;
}
export interface EnvironmentOptions {
    autoLinkWorkItems: boolean;
    badgeEnabled: boolean;
    emailNotificationType: string;
    emailRecipients: string;
    enableAccessToken: boolean;
    publishDeploymentStatus: boolean;
    skipArtifactsDownload: boolean;
    timeoutInMinutes: number;
}
export interface EnvironmentRetentionPolicy {
    daysToKeep: number;
    releasesToKeep: number;
    retainBuild: boolean;
}
export declare enum EnvironmentStatus {
    Undefined = 0,
    NotStarted = 1,
    InProgress = 2,
    Succeeded = 4,
    Canceled = 8,
    Rejected = 16,
    Queued = 32,
    Scheduled = 64,
    PartiallySucceeded = 128,
}
export interface ExecutionInput {
    parallelExecutionType: ParallelExecutionTypes;
}
/**
 * Class to represent favorite entry
 */
export interface FavoriteItem {
    /**
     * Application specific data for the entry
     */
    data: string;
    /**
     * Unique Id of the the entry
     */
    id: string;
    /**
     * Display text for favorite entry
     */
    name: string;
    /**
     * Application specific favorite entry type. Empty or Null represents that Favorite item is a Folder
     */
    type: string;
}
export interface Folder {
    createdBy: VSSInterfaces.IdentityRef;
    createdOn: Date;
    description: string;
    lastChangedBy: VSSInterfaces.IdentityRef;
    lastChangedDate: Date;
    path: string;
}
export declare enum FolderPathQueryOrder {
    /**
     * No order
     */
    None = 0,
    /**
     * Order by folder name and path ascending.
     */
    Ascending = 1,
    /**
     * Order by folder name and path descending.
     */
    Descending = 2,
}
export declare enum GateStatus {
    None = 0,
    Pending = 1,
    InProgress = 2,
    Succeeded = 4,
    Failed = 8,
}
export interface GitArtifactDownloadInput extends ArtifactDownloadInputBase {
}
export interface GitHubArtifactDownloadInput extends ArtifactDownloadInputBase {
}
export interface Issue {
    issueType: string;
    message: string;
}
export declare enum IssueSource {
    None = 0,
    User = 1,
    System = 2,
}
export interface JenkinsArtifactDownloadInput extends ArtifactDownloadInputBase {
    artifactItems: string[];
}
export interface MachineGroupBasedDeployPhase extends DeployPhase {
    deploymentInput: MachineGroupDeploymentInput;
}
export interface MachineGroupDeploymentInput extends DeploymentInput {
    deploymentHealthOption: string;
    healthPercent: number;
    tags: string[];
}
export interface MailMessage {
    body: string;
    cC: EmailRecipients;
    inReplyTo: string;
    messageId: string;
    replyBy: Date;
    replyTo: EmailRecipients;
    sections: MailSectionType[];
    senderType: SenderType;
    subject: string;
    to: EmailRecipients;
}
export declare enum MailSectionType {
    Details = 0,
    Environments = 1,
    Issues = 2,
    TestResults = 3,
    WorkItems = 4,
    ReleaseInfo = 5,
}
export interface ManualIntervention {
    /**
     * Gets or sets the identity who should approve.
     */
    approver: VSSInterfaces.IdentityRef;
    /**
     * Gets or sets comments for approval.
     */
    comments: string;
    /**
     * Gets date on which it got created.
     */
    createdOn: Date;
    /**
     * Gets the unique identifier for manual intervention.
     */
    id: number;
    /**
     * Gets or sets instructions for approval.
     */
    instructions: string;
    /**
     * Gets date on which it got modified.
     */
    modifiedOn: Date;
    /**
     * Gets or sets the name.
     */
    name: string;
    /**
     * Gets releaseReference for manual intervention.
     */
    release: ReleaseShallowReference;
    /**
     * Gets releaseDefinitionReference for manual intervention.
     */
    releaseDefinition: ReleaseDefinitionShallowReference;
    /**
     * Gets releaseEnvironmentReference for manual intervention.
     */
    releaseEnvironment: ReleaseEnvironmentShallowReference;
    /**
     * Gets or sets the status of the manual intervention.
     */
    status: ManualInterventionStatus;
    /**
     * Get task instance identifier.
     */
    taskInstanceId: string;
    /**
     * Gets url to access the manual intervention.
     */
    url: string;
}
/**
 * Describes manual intervention status
 */
export declare enum ManualInterventionStatus {
    /**
     * The manual intervention does not have the status set.
     */
    Unknown = 0,
    /**
     * The manual intervention is pending.
     */
    Pending = 1,
    /**
     * The manual intervention is rejected.
     */
    Rejected = 2,
    /**
     * The manual intervention is approved.
     */
    Approved = 4,
    /**
     * The manual intervention is canceled.
     */
    Canceled = 8,
}
export interface ManualInterventionUpdateMetadata {
    /**
     * Sets the comment for manual intervention update.
     */
    comment: string;
    /**
     * Sets the status of the manual intervention.
     */
    status: ManualInterventionStatus;
}
export interface MappingDetails {
    mappings: {
        [key: string]: FormInputInterfaces.InputValue;
    };
}
export interface Metric {
    name: string;
    value: number;
}
export interface MultiConfigInput extends ParallelExecutionInputBase {
    multipliers: string;
}
export interface MultiMachineInput extends ParallelExecutionInputBase {
}
export interface PackageTrigger extends ReleaseTriggerBase {
    alias: string;
}
export interface ParallelExecutionInputBase extends ExecutionInput {
    continueOnError: boolean;
    maxNumberOfAgents: number;
}
export declare enum ParallelExecutionTypes {
    None = 0,
    MultiConfiguration = 1,
    MultiMachine = 2,
}
export interface PipelineProcess {
    type: PipelineProcessTypes;
}
export declare enum PipelineProcessTypes {
    Designer = 1,
    Yaml = 2,
}
export interface ProjectReference {
    /**
     * Gets the unique identifier of this field.
     */
    id: string;
    /**
     * Gets name of project.
     */
    name: string;
}
export interface PropertySelector {
    properties: string[];
    selectorType: PropertySelectorType;
}
export declare enum PropertySelectorType {
    Inclusion = 0,
    Exclusion = 1,
}
export interface QueuedReleaseData {
    projectId: string;
    queuePosition: number;
    releaseId: number;
}
export interface RealtimeReleaseEvent {
    projectId: string;
    releaseId: number;
}
export interface Release {
    /**
     * Gets links to access the release.
     */
    _links: any;
    /**
     * Gets or sets the list of artifacts.
     */
    artifacts: Artifact[];
    /**
     * Gets or sets comment.
     */
    comment: string;
    /**
     * Gets or sets the identity who created.
     */
    createdBy: VSSInterfaces.IdentityRef;
    /**
     * Gets date on which it got created.
     */
    createdOn: Date;
    /**
     * Gets revision number of definition snapshot.
     */
    definitionSnapshotRevision: number;
    /**
     * Gets or sets description of release.
     */
    description: string;
    /**
     * Gets list of environments.
     */
    environments: ReleaseEnvironment[];
    /**
     * Gets the unique identifier of this field.
     */
    id: number;
    /**
     * Whether to exclude the release from retention policies.
     */
    keepForever: boolean;
    /**
     * Gets logs container url.
     */
    logsContainerUrl: string;
    /**
     * Gets or sets the identity who modified.
     */
    modifiedBy: VSSInterfaces.IdentityRef;
    /**
     * Gets date on which it got modified.
     */
    modifiedOn: Date;
    /**
     * Gets name.
     */
    name: string;
    /**
     * Gets pool name.
     */
    poolName: string;
    /**
     * Gets or sets project reference.
     */
    projectReference: ProjectReference;
    properties: any;
    /**
     * Gets reason of release.
     */
    reason: ReleaseReason;
    /**
     * Gets releaseDefinitionReference which specifies the reference of the release definition to which this release is associated.
     */
    releaseDefinition: ReleaseDefinitionShallowReference;
    /**
     * Gets release name format.
     */
    releaseNameFormat: string;
    /**
     * Gets status.
     */
    status: ReleaseStatus;
    /**
     * Gets or sets list of tags.
     */
    tags: string[];
    triggeringArtifactAlias: string;
    url: string;
    /**
     * Gets the list of variable groups.
     */
    variableGroups: VariableGroup[];
    /**
     * Gets or sets the dictionary of variables.
     */
    variables: {
        [key: string]: ConfigurationVariableValue;
    };
}
export interface ReleaseAbandonedEvent {
    project: ProjectReference;
    release: Release;
}
export interface ReleaseApproval {
    /**
     * Gets or sets the type of approval.
     */
    approvalType: ApprovalType;
    /**
     * Gets the identity who approved.
     */
    approvedBy: VSSInterfaces.IdentityRef;
    /**
     * Gets or sets the identity who should approve.
     */
    approver: VSSInterfaces.IdentityRef;
    /**
     * Gets or sets attempt which specifies as which deployment attempt it belongs.
     */
    attempt: number;
    /**
     * Gets or sets comments for approval.
     */
    comments: string;
    /**
     * Gets date on which it got created.
     */
    createdOn: Date;
    /**
     * Gets history which specifies all approvals associated with this approval.
     */
    history: ReleaseApprovalHistory[];
    /**
     * Gets the unique identifier of this field.
     */
    id: number;
    /**
     * Gets or sets as approval is automated or not.
     */
    isAutomated: boolean;
    isNotificationOn: boolean;
    /**
     * Gets date on which it got modified.
     */
    modifiedOn: Date;
    /**
     * Gets or sets rank which specifies the order of the approval. e.g. Same rank denotes parallel approval.
     */
    rank: number;
    /**
     * Gets releaseReference which specifies the reference of the release to which this approval is associated.
     */
    release: ReleaseShallowReference;
    /**
     * Gets releaseDefinitionReference which specifies the reference of the release definition to which this approval is associated.
     */
    releaseDefinition: ReleaseDefinitionShallowReference;
    /**
     * Gets releaseEnvironmentReference which specifies the reference of the release environment to which this approval is associated.
     */
    releaseEnvironment: ReleaseEnvironmentShallowReference;
    /**
     * Gets the revision number.
     */
    revision: number;
    /**
     * Gets or sets the status of the approval.
     */
    status: ApprovalStatus;
    trialNumber: number;
    /**
     * Gets url to access the approval.
     */
    url: string;
}
export interface ReleaseApprovalHistory {
    approver: VSSInterfaces.IdentityRef;
    changedBy: VSSInterfaces.IdentityRef;
    comments: string;
    createdOn: Date;
    modifiedOn: Date;
    revision: number;
}
export interface ReleaseApprovalPendingEvent {
    approval: ReleaseApproval;
    approvalOptions: ApprovalOptions;
    completedApprovals: ReleaseApproval[];
    definitionName: string;
    deployment: Deployment;
    environmentId: number;
    environmentName: string;
    environments: ReleaseEnvironment[];
    isMultipleRankApproval: boolean;
    pendingApprovals: ReleaseApproval[];
    releaseCreator: string;
    releaseName: string;
    title: string;
    webAccessUri: string;
}
export interface ReleaseArtifact {
    artifactProvider: ArtifactProvider;
    artifactType: string;
    definitionData: string;
    definitionId: number;
    description: string;
    id: number;
    name: string;
    releaseId: number;
}
export interface ReleaseCondition extends Condition {
    result: boolean;
}
export interface ReleaseCreatedEvent {
    project: ProjectReference;
    release: Release;
}
export interface ReleaseDefinition {
    /**
     * Gets links to access the release definition.
     */
    _links: any;
    /**
     * Gets or sets the list of artifacts.
     */
    artifacts: Artifact[];
    /**
     * Gets or sets comment.
     */
    comment: string;
    /**
     * Gets or sets the identity who created.
     */
    createdBy: VSSInterfaces.IdentityRef;
    /**
     * Gets date on which it got created.
     */
    createdOn: Date;
    /**
     * Gets or sets the description.
     */
    description: string;
    /**
     * Gets or sets the list of environments.
     */
    environments: ReleaseDefinitionEnvironment[];
    /**
     * Gets the unique identifier of this field.
     */
    id: number;
    /**
     * Whether release definition is deleted.
     */
    isDeleted: boolean;
    /**
     * Gets the reference of last release.
     */
    lastRelease: ReleaseReference;
    /**
     * Gets or sets the identity who modified.
     */
    modifiedBy: VSSInterfaces.IdentityRef;
    /**
     * Gets date on which it got modified.
     */
    modifiedOn: Date;
    /**
     * Gets or sets the name.
     */
    name: string;
    /**
     * Gets or sets the path.
     */
    path: string;
    /**
     * Gets or sets pipeline process.
     */
    pipelineProcess: PipelineProcess;
    /**
     * Gets or sets properties.
     */
    properties: any;
    /**
     * Gets or sets the release name format.
     */
    releaseNameFormat: string;
    retentionPolicy: RetentionPolicy;
    /**
     * Gets the revision number.
     */
    revision: number;
    /**
     * Gets or sets source of release definition.
     */
    source: ReleaseDefinitionSource;
    /**
     * Gets or sets list of tags.
     */
    tags: string[];
    /**
     * Gets or sets the list of triggers.
     */
    triggers: ReleaseTriggerBase[];
    /**
     * Gets url to access the release definition.
     */
    url: string;
    /**
     * Gets or sets the list of variable groups.
     */
    variableGroups: number[];
    /**
     * Gets or sets the dictionary of variables.
     */
    variables: {
        [key: string]: ConfigurationVariableValue;
    };
}
export interface ReleaseDefinitionApprovals {
    approvalOptions: ApprovalOptions;
    approvals: ReleaseDefinitionApprovalStep[];
}
export interface ReleaseDefinitionApprovalStep extends ReleaseDefinitionEnvironmentStep {
    approver: VSSInterfaces.IdentityRef;
    isAutomated: boolean;
    isNotificationOn: boolean;
    rank: number;
}
export interface ReleaseDefinitionDeployStep extends ReleaseDefinitionEnvironmentStep {
    /**
     * The list of steps for this definition.
     */
    tasks: WorkflowTask[];
}
export interface ReleaseDefinitionEnvironment {
    badgeUrl: string;
    conditions: Condition[];
    demands: any[];
    deployPhases: DeployPhase[];
    deployStep: ReleaseDefinitionDeployStep;
    environmentOptions: EnvironmentOptions;
    executionPolicy: EnvironmentExecutionPolicy;
    id: number;
    name: string;
    owner: VSSInterfaces.IdentityRef;
    postDeployApprovals: ReleaseDefinitionApprovals;
    postDeploymentGates: ReleaseDefinitionGatesStep;
    preDeployApprovals: ReleaseDefinitionApprovals;
    preDeploymentGates: ReleaseDefinitionGatesStep;
    processParameters: DistributedTaskCommonInterfaces.ProcessParameters;
    properties: any;
    queueId: number;
    rank: number;
    retentionPolicy: EnvironmentRetentionPolicy;
    runOptions: {
        [key: string]: string;
    };
    schedules: ReleaseSchedule[];
    variableGroups: number[];
    variables: {
        [key: string]: ConfigurationVariableValue;
    };
}
export interface ReleaseDefinitionEnvironmentStep {
    id: number;
}
export interface ReleaseDefinitionEnvironmentSummary {
    id: number;
    lastReleases: ReleaseShallowReference[];
    name: string;
}
export interface ReleaseDefinitionEnvironmentTemplate {
    canDelete: boolean;
    category: string;
    description: string;
    environment: ReleaseDefinitionEnvironment;
    iconTaskId: string;
    iconUri: string;
    id: string;
    isDeleted: boolean;
    name: string;
}
export declare enum ReleaseDefinitionExpands {
    None = 0,
    Environments = 2,
    Artifacts = 4,
    Triggers = 8,
    Variables = 16,
    Tags = 32,
    LastRelease = 64,
}
export interface ReleaseDefinitionGate {
    tasks: WorkflowTask[];
}
export interface ReleaseDefinitionGatesOptions {
    isEnabled: boolean;
    samplingInterval: number;
    stabilizationTime: number;
    timeout: number;
}
export interface ReleaseDefinitionGatesStep {
    gates: ReleaseDefinitionGate[];
    gatesOptions: ReleaseDefinitionGatesOptions;
    id: number;
}
export declare enum ReleaseDefinitionQueryOrder {
    IdAscending = 0,
    IdDescending = 1,
    NameAscending = 2,
    NameDescending = 3,
}
export interface ReleaseDefinitionRevision {
    /**
     * Gets api-version for revision object.
     */
    apiVersion: string;
    /**
     * Gets the identity who did change.
     */
    changedBy: VSSInterfaces.IdentityRef;
    /**
     * Gets date on which it got changed.
     */
    changedDate: Date;
    /**
     * Gets type of change.
     */
    changeType: AuditAction;
    /**
     * Gets comments for revision.
     */
    comment: string;
    /**
     * Get id of the definition.
     */
    definitionId: number;
    /**
     * Gets definition url.
     */
    definitionUrl: string;
    /**
     * Get revision number of the definition.
     */
    revision: number;
}
export interface ReleaseDefinitionShallowReference {
    /**
     * Gets the links to related resources, APIs, and views for the release definition.
     */
    _links: any;
    /**
     * Gets the unique identifier of release definition.
     */
    id: number;
    /**
     * Gets or sets the name of the release definition.
     */
    name: string;
    /**
     * Gets the REST API url to access the release definition.
     */
    url: string;
}
export declare enum ReleaseDefinitionSource {
    Undefined = 0,
    RestApi = 1,
    UserInterface = 2,
    Ibiza = 4,
    PortalExtensionApi = 8,
}
export interface ReleaseDefinitionSummary {
    environments: ReleaseDefinitionEnvironmentSummary[];
    releaseDefinition: ReleaseDefinitionShallowReference;
    releases: Release[];
}
export interface ReleaseDefinitionUndeleteParameter {
    /**
     * Gets or sets comment.
     */
    comment: string;
}
export interface ReleaseDeployPhase {
    deploymentJobs: DeploymentJob[];
    errorLog: string;
    id: number;
    manualInterventions: ManualIntervention[];
    name: string;
    phaseId: string;
    phaseType: DeployPhaseTypes;
    rank: number;
    runPlanId: string;
    status: DeployPhaseStatus;
}
export interface ReleaseEnvironment {
    /**
     * Gets list of conditions.
     */
    conditions: ReleaseCondition[];
    /**
     * Gets date on which it got created.
     */
    createdOn: Date;
    /**
     * Gets definition environment id.
     */
    definitionEnvironmentId: number;
    /**
     * Gets demands.
     */
    demands: any[];
    /**
     * Gets list of deploy phases snapshot.
     */
    deployPhasesSnapshot: DeployPhase[];
    /**
     * Gets deploy steps.
     */
    deploySteps: DeploymentAttempt[];
    /**
     * Gets environment options.
     */
    environmentOptions: EnvironmentOptions;
    /**
     * Gets the unique identifier of this field.
     */
    id: number;
    /**
     * Gets date on which it got modified.
     */
    modifiedOn: Date;
    /**
     * Gets name.
     */
    name: string;
    /**
     * Gets next scheduled UTC time.
     */
    nextScheduledUtcTime: Date;
    /**
     * Gets the identity who is owner for release environment.
     */
    owner: VSSInterfaces.IdentityRef;
    /**
     * Gets list of post deploy approvals snapshot.
     */
    postApprovalsSnapshot: ReleaseDefinitionApprovals;
    /**
     * Gets list of post deploy approvals.
     */
    postDeployApprovals: ReleaseApproval[];
    postDeploymentGatesSnapshot: ReleaseDefinitionGatesStep;
    /**
     * Gets list of pre deploy approvals snapshot.
     */
    preApprovalsSnapshot: ReleaseDefinitionApprovals;
    /**
     * Gets list of pre deploy approvals.
     */
    preDeployApprovals: ReleaseApproval[];
    preDeploymentGatesSnapshot: ReleaseDefinitionGatesStep;
    /**
     * Gets process parameters.
     */
    processParameters: DistributedTaskCommonInterfaces.ProcessParameters;
    /**
     * Gets queue id.
     */
    queueId: number;
    /**
     * Gets rank.
     */
    rank: number;
    /**
     * Gets release reference which specifies the reference of the release to which this release environment is associated.
     */
    release: ReleaseShallowReference;
    /**
     * Gets the identity who created release.
     */
    releaseCreatedBy: VSSInterfaces.IdentityRef;
    /**
     * Gets releaseDefinitionReference which specifies the reference of the release definition to which this release environment is associated.
     */
    releaseDefinition: ReleaseDefinitionShallowReference;
    /**
     * Gets release description.
     */
    releaseDescription: string;
    /**
     * Gets release id.
     */
    releaseId: number;
    /**
     * Gets schedule deployment time of release environment.
     */
    scheduledDeploymentTime: Date;
    /**
     * Gets list of schedules.
     */
    schedules: ReleaseSchedule[];
    /**
     * Gets environment status.
     */
    status: EnvironmentStatus;
    /**
     * Gets time to deploy.
     */
    timeToDeploy: number;
    /**
     * Gets trigger reason.
     */
    triggerReason: string;
    /**
     * Gets the list of variable groups.
     */
    variableGroups: VariableGroup[];
    /**
     * Gets the dictionary of variables.
     */
    variables: {
        [key: string]: ConfigurationVariableValue;
    };
    /**
     * Gets list of workflow tasks.
     */
    workflowTasks: WorkflowTask[];
}
export interface ReleaseEnvironmentCompletedEvent {
    createdByName: string;
    definitionId: number;
    definitionName: string;
    environment: ReleaseEnvironment;
    environmentId: number;
    projectName: string;
    reason: DeploymentReason;
    releaseCreatedBy: VSSInterfaces.IdentityRef;
    releaseLogsUri: string;
    releaseName: string;
    status: string;
    title: string;
    webAccessUri: string;
}
export interface ReleaseEnvironmentShallowReference {
    /**
     * Gets the links to related resources, APIs, and views for the release environment.
     */
    _links: any;
    /**
     * Gets the unique identifier of release environment.
     */
    id: number;
    /**
     * Gets or sets the name of the release environment.
     */
    name: string;
    /**
     * Gets the REST API url to access the release environment.
     */
    url: string;
}
export interface ReleaseEnvironmentUpdateMetadata {
    /**
     * Gets or sets comment.
     */
    comment: string;
    /**
     * Gets or sets scheduled deployment time.
     */
    scheduledDeploymentTime: Date;
    /**
     * Gets or sets status of environment.
     */
    status: EnvironmentStatus;
}
export declare enum ReleaseExpands {
    None = 0,
    Environments = 2,
    Artifacts = 4,
    Approvals = 8,
    ManualInterventions = 16,
    Variables = 32,
    Tags = 64,
}
export interface ReleaseGates {
    deploymentJobs: DeploymentJob[];
    id: number;
    lastModifiedOn: Date;
    runPlanId: string;
    stabilizationCompletedOn: Date;
    startedOn: Date;
    status: GateStatus;
}
export declare enum ReleaseQueryOrder {
    Descending = 0,
    Ascending = 1,
}
export declare enum ReleaseReason {
    None = 0,
    Manual = 1,
    ContinuousIntegration = 2,
    Schedule = 3,
}
export interface ReleaseReference {
    /**
     * Gets links to access the release.
     */
    _links: any;
    /**
     * Gets list of artifacts.
     */
    artifacts: Artifact[];
    /**
     * Gets the identity who created.
     */
    createdBy: VSSInterfaces.IdentityRef;
    /**
     * Gets date on which it got created.
     */
    createdOn: Date;
    /**
     * Gets description.
     */
    description: string;
    /**
     * Gets the unique identifier of this field.
     */
    id: number;
    /**
     * Gets the identity who modified.
     */
    modifiedBy: VSSInterfaces.IdentityRef;
    /**
     * Gets name of release.
     */
    name: string;
    /**
     * Gets reason for release.
     */
    reason: ReleaseReason;
    /**
     * Gets release definition shallow reference.
     */
    releaseDefinition: ReleaseDefinitionShallowReference;
    url: string;
    webAccessUri: string;
}
export interface ReleaseRevision {
    changedBy: VSSInterfaces.IdentityRef;
    changedDate: Date;
    changeDetails: string;
    changeType: string;
    comment: string;
    definitionSnapshotRevision: number;
    releaseId: number;
}
export interface ReleaseSchedule {
    /**
     * Days of the week to release
     */
    daysToRelease: ScheduleDays;
    /**
     * Team Foundation Job Definition Job Id
     */
    jobId: string;
    /**
     * Local time zone hour to start
     */
    startHours: number;
    /**
     * Local time zone minute to start
     */
    startMinutes: number;
    /**
     * Time zone Id of release schedule, such as 'UTC'
     */
    timeZoneId: string;
}
export interface ReleaseSettings {
    retentionSettings: RetentionSettings;
}
export interface ReleaseShallowReference {
    /**
     * Gets the links to related resources, APIs, and views for the release.
     */
    _links: any;
    /**
     * Gets the unique identifier of release.
     */
    id: number;
    /**
     * Gets or sets the name of the release.
     */
    name: string;
    /**
     * Gets the REST API url to access the release.
     */
    url: string;
}
export interface ReleaseStartMetadata {
    /**
     * Sets list of artifact to create a release.
     */
    artifacts: ArtifactMetadata[];
    /**
     * Sets definition Id to create a release.
     */
    definitionId: number;
    /**
     * Sets description to create a release.
     */
    description: string;
    /**
     * Sets 'true' to create release in draft mode, 'false' otherwise.
     */
    isDraft: boolean;
    /**
     * Sets list of environments to manual as condition.
     */
    manualEnvironments: string[];
    properties: any;
    /**
     * Sets reason to create a release.
     */
    reason: ReleaseReason;
}
export declare enum ReleaseStatus {
    Undefined = 0,
    Draft = 1,
    Active = 2,
    Abandoned = 4,
}
export interface ReleaseTask {
    agentName: string;
    dateEnded: Date;
    dateStarted: Date;
    finishTime: Date;
    id: number;
    issues: Issue[];
    lineCount: number;
    logUrl: string;
    name: string;
    percentComplete: number;
    rank: number;
    startTime: Date;
    status: TaskStatus;
    task: WorkflowTaskReference;
    timelineRecordId: string;
}
export interface ReleaseTaskAttachment {
    _links: any;
    createdOn: Date;
    modifiedBy: string;
    modifiedOn: Date;
    name: string;
    recordId: string;
    timelineId: string;
    type: string;
}
export interface ReleaseTaskLogUpdatedEvent extends RealtimeReleaseEvent {
    environmentId: number;
    lines: string[];
    timelineRecordId: string;
}
export interface ReleaseTasksUpdatedEvent extends RealtimeReleaseEvent {
    environmentId: number;
    job: ReleaseTask;
    releaseDeployPhaseId: number;
    releaseStepId: number;
    tasks: ReleaseTask[];
}
export interface ReleaseTriggerBase {
    triggerType: ReleaseTriggerType;
}
export declare enum ReleaseTriggerType {
    Undefined = 0,
    ArtifactSource = 1,
    Schedule = 2,
    SourceRepo = 3,
    ContainerImage = 4,
    Package = 5,
    PullRequest = 6,
}
export interface ReleaseUpdatedEvent extends RealtimeReleaseEvent {
    release: Release;
}
export interface ReleaseUpdateMetadata {
    /**
     * Sets comment for release.
     */
    comment: string;
    /**
     * Set 'true' to exclude the release from retention policies.
     */
    keepForever: boolean;
    /**
     * Sets list of manual environments.
     */
    manualEnvironments: string[];
    /**
     * Sets status of the release.
     */
    status: ReleaseStatus;
}
export interface ReleaseWorkItemRef {
    assignee: string;
    id: string;
    state: string;
    title: string;
    type: string;
    url: string;
}
export interface RetentionPolicy {
    daysToKeep: number;
}
export interface RetentionSettings {
    daysToKeepDeletedReleases: number;
    defaultEnvironmentRetentionPolicy: EnvironmentRetentionPolicy;
    maximumEnvironmentRetentionPolicy: EnvironmentRetentionPolicy;
}
export interface RunOnServerDeployPhase extends DeployPhase {
    deploymentInput: ServerDeploymentInput;
}
export declare enum ScheduleDays {
    None = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 4,
    Thursday = 8,
    Friday = 16,
    Saturday = 32,
    Sunday = 64,
    All = 127,
}
export interface ScheduledReleaseTrigger extends ReleaseTriggerBase {
    /**
     * Release schedule for Scheduled Release trigger type
     */
    schedule: ReleaseSchedule;
}
export declare enum SenderType {
    ServiceAccount = 1,
    RequestingUser = 2,
}
export interface ServerDeploymentInput extends BaseDeploymentInput {
    parallelExecution: ExecutionInput;
}
export interface SourceIdInput {
    id: string;
    name: string;
}
export interface SourceRepoTrigger extends ReleaseTriggerBase {
    alias: string;
    branchFilters: string[];
}
export interface SummaryMailSection {
    htmlContent: string;
    rank: number;
    sectionType: MailSectionType;
    title: string;
}
export interface TaskOrchestrationPlanGroupReference {
    planGroup: string;
    projectId: string;
}
export interface TaskOrchestrationPlanGroupsStartedEvent {
    planGroups: TaskOrchestrationPlanGroupReference[];
}
export declare enum TaskStatus {
    Unknown = 0,
    Pending = 1,
    InProgress = 2,
    Success = 3,
    Failure = 4,
    Canceled = 5,
    Skipped = 6,
    Succeeded = 7,
    Failed = 8,
    PartiallySucceeded = 9,
}
export interface TfvcArtifactDownloadInput extends ArtifactDownloadInputBase {
}
export interface TimeZone {
    displayName: string;
    id: string;
}
export interface TimeZoneList {
    utcTimeZone: TimeZone;
    validTimeZones: TimeZone[];
}
export interface VariableGroup {
    /**
     * Gets or sets the identity who created.
     */
    createdBy: VSSInterfaces.IdentityRef;
    /**
     * Gets date on which it got created.
     */
    createdOn: Date;
    /**
     * Gets or sets description.
     */
    description: string;
    /**
     * Gets the unique identifier of this field.
     */
    id: number;
    /**
     * Gets or sets the identity who modified.
     */
    modifiedBy: VSSInterfaces.IdentityRef;
    /**
     * Gets date on which it got modified.
     */
    modifiedOn: Date;
    /**
     * Gets or sets name.
     */
    name: string;
    /**
     * Gets or sets provider data.
     */
    providerData: VariableGroupProviderData;
    /**
     * Gets or sets type.
     */
    type: string;
    variables: {
        [key: string]: VariableValue;
    };
}
export declare enum VariableGroupActionFilter {
    None = 0,
    Manage = 2,
    Use = 16,
}
export interface VariableGroupProviderData {
}
export interface VariableValue {
    isSecret: boolean;
    value: string;
}
export interface WorkflowTask {
    alwaysRun: boolean;
    condition: string;
    continueOnError: boolean;
    definitionType: string;
    enabled: boolean;
    inputs: {
        [key: string]: string;
    };
    name: string;
    overrideInputs: {
        [key: string]: string;
    };
    refName: string;
    taskId: string;
    timeoutInMinutes: number;
    version: string;
}
export interface WorkflowTaskReference {
    id: string;
    name: string;
    version: string;
}
export declare var TypeInfo: {
    AgentArtifactDefinition: any;
    AgentArtifactType: {
        enumValues: {
            "xamlBuild": number;
            "build": number;
            "jenkins": number;
            "fileShare": number;
            "nuget": number;
            "tfsOnPrem": number;
            "gitHub": number;
            "tFGit": number;
            "externalTfsBuild": number;
            "custom": number;
            "tfvc": number;
        };
    };
    AgentBasedDeployPhase: any;
    AgentDeploymentInput: any;
    ApprovalExecutionOrder: {
        enumValues: {
            "beforeGates": number;
            "afterSuccessfulGates": number;
            "afterGatesAlways": number;
        };
    };
    ApprovalFilters: {
        enumValues: {
            "none": number;
            "manualApprovals": number;
            "automatedApprovals": number;
            "approvalSnapshots": number;
            "all": number;
        };
    };
    ApprovalOptions: any;
    ApprovalStatus: {
        enumValues: {
            "undefined": number;
            "pending": number;
            "approved": number;
            "rejected": number;
            "reassigned": number;
            "canceled": number;
            "skipped": number;
        };
    };
    ApprovalType: {
        enumValues: {
            "undefined": number;
            "preDeploy": number;
            "postDeploy": number;
            "all": number;
        };
    };
    ArtifactContributionDefinition: any;
    ArtifactSourceTrigger: any;
    ArtifactTypeDefinition: any;
    AuditAction: {
        enumValues: {
            "add": number;
            "update": number;
            "delete": number;
            "undelete": number;
        };
    };
    AuthorizationHeaderFor: {
        enumValues: {
            "revalidateApproverIdentity": number;
            "onBehalfOf": number;
        };
    };
    AutoTriggerIssue: any;
    AzureKeyVaultVariableGroupProviderData: any;
    AzureKeyVaultVariableValue: any;
    Change: any;
    Condition: any;
    ConditionType: {
        enumValues: {
            "undefined": number;
            "event": number;
            "environmentState": number;
            "artifact": number;
        };
    };
    ContainerImageTrigger: any;
    ContinuousDeploymentTriggerIssue: any;
    Deployment: any;
    DeploymentApprovalCompletedEvent: any;
    DeploymentApprovalPendingEvent: any;
    DeploymentAttempt: any;
    DeploymentAuthorizationInfo: any;
    DeploymentAuthorizationOwner: {
        enumValues: {
            "automatic": number;
            "deploymentSubmitter": number;
            "firstPreDeploymentApprover": number;
        };
    };
    DeploymentCompletedEvent: any;
    DeploymentExpands: {
        enumValues: {
            "all": number;
            "deploymentOnly": number;
            "approvals": number;
            "artifacts": number;
        };
    };
    DeploymentJob: any;
    DeploymentManualInterventionPendingEvent: any;
    DeploymentOperationStatus: {
        enumValues: {
            "undefined": number;
            "queued": number;
            "scheduled": number;
            "pending": number;
            "approved": number;
            "rejected": number;
            "deferred": number;
            "queuedForAgent": number;
            "phaseInProgress": number;
            "phaseSucceeded": number;
            "phasePartiallySucceeded": number;
            "phaseFailed": number;
            "canceled": number;
            "phaseCanceled": number;
            "manualInterventionPending": number;
            "queuedForPipeline": number;
            "cancelling": number;
            "evaluatingGates": number;
            "gateFailed": number;
            "all": number;
        };
    };
    DeploymentQueryParameters: any;
    DeploymentReason: {
        enumValues: {
            "none": number;
            "manual": number;
            "automated": number;
            "scheduled": number;
        };
    };
    DeploymentsQueryType: {
        enumValues: {
            "regular": number;
            "failingSince": number;
        };
    };
    DeploymentStartedEvent: any;
    DeploymentStatus: {
        enumValues: {
            "undefined": number;
            "notDeployed": number;
            "inProgress": number;
            "succeeded": number;
            "partiallySucceeded": number;
            "failed": number;
            "all": number;
        };
    };
    DeployPhase: any;
    DeployPhaseStatus: {
        enumValues: {
            "undefined": number;
            "notStarted": number;
            "inProgress": number;
            "partiallySucceeded": number;
            "succeeded": number;
            "failed": number;
            "canceled": number;
            "skipped": number;
            "cancelling": number;
        };
    };
    DeployPhaseTypes: {
        enumValues: {
            "undefined": number;
            "agentBasedDeployment": number;
            "runOnServer": number;
            "machineGroupBasedDeployment": number;
        };
    };
    EnvironmentStatus: {
        enumValues: {
            "undefined": number;
            "notStarted": number;
            "inProgress": number;
            "succeeded": number;
            "canceled": number;
            "rejected": number;
            "queued": number;
            "scheduled": number;
            "partiallySucceeded": number;
        };
    };
    ExecutionInput: any;
    Folder: any;
    FolderPathQueryOrder: {
        enumValues: {
            "none": number;
            "ascending": number;
            "descending": number;
        };
    };
    GateStatus: {
        enumValues: {
            "none": number;
            "pending": number;
            "inProgress": number;
            "succeeded": number;
            "failed": number;
        };
    };
    IssueSource: {
        enumValues: {
            "none": number;
            "user": number;
            "system": number;
        };
    };
    MachineGroupBasedDeployPhase: any;
    MailMessage: any;
    MailSectionType: {
        enumValues: {
            "details": number;
            "environments": number;
            "issues": number;
            "testResults": number;
            "workItems": number;
            "releaseInfo": number;
        };
    };
    ManualIntervention: any;
    ManualInterventionStatus: {
        enumValues: {
            "unknown": number;
            "pending": number;
            "rejected": number;
            "approved": number;
            "canceled": number;
        };
    };
    ManualInterventionUpdateMetadata: any;
    MultiConfigInput: any;
    MultiMachineInput: any;
    PackageTrigger: any;
    ParallelExecutionInputBase: any;
    ParallelExecutionTypes: {
        enumValues: {
            "none": number;
            "multiConfiguration": number;
            "multiMachine": number;
        };
    };
    PipelineProcess: any;
    PipelineProcessTypes: {
        enumValues: {
            "designer": number;
            "yaml": number;
        };
    };
    PropertySelector: any;
    PropertySelectorType: {
        enumValues: {
            "inclusion": number;
            "exclusion": number;
        };
    };
    Release: any;
    ReleaseAbandonedEvent: any;
    ReleaseApproval: any;
    ReleaseApprovalHistory: any;
    ReleaseApprovalPendingEvent: any;
    ReleaseCondition: any;
    ReleaseCreatedEvent: any;
    ReleaseDefinition: any;
    ReleaseDefinitionApprovals: any;
    ReleaseDefinitionEnvironment: any;
    ReleaseDefinitionEnvironmentTemplate: any;
    ReleaseDefinitionExpands: {
        enumValues: {
            "none": number;
            "environments": number;
            "artifacts": number;
            "triggers": number;
            "variables": number;
            "tags": number;
            "lastRelease": number;
        };
    };
    ReleaseDefinitionQueryOrder: {
        enumValues: {
            "idAscending": number;
            "idDescending": number;
            "nameAscending": number;
            "nameDescending": number;
        };
    };
    ReleaseDefinitionRevision: any;
    ReleaseDefinitionSource: {
        enumValues: {
            "undefined": number;
            "restApi": number;
            "userInterface": number;
            "ibiza": number;
            "portalExtensionApi": number;
        };
    };
    ReleaseDefinitionSummary: any;
    ReleaseDeployPhase: any;
    ReleaseEnvironment: any;
    ReleaseEnvironmentCompletedEvent: any;
    ReleaseEnvironmentUpdateMetadata: any;
    ReleaseExpands: {
        enumValues: {
            "none": number;
            "environments": number;
            "artifacts": number;
            "approvals": number;
            "manualInterventions": number;
            "variables": number;
            "tags": number;
        };
    };
    ReleaseGates: any;
    ReleaseQueryOrder: {
        enumValues: {
            "descending": number;
            "ascending": number;
        };
    };
    ReleaseReason: {
        enumValues: {
            "none": number;
            "manual": number;
            "continuousIntegration": number;
            "schedule": number;
        };
    };
    ReleaseReference: any;
    ReleaseRevision: any;
    ReleaseSchedule: any;
    ReleaseStartMetadata: any;
    ReleaseStatus: {
        enumValues: {
            "undefined": number;
            "draft": number;
            "active": number;
            "abandoned": number;
        };
    };
    ReleaseTask: any;
    ReleaseTaskAttachment: any;
    ReleaseTasksUpdatedEvent: any;
    ReleaseTriggerBase: any;
    ReleaseTriggerType: {
        enumValues: {
            "undefined": number;
            "artifactSource": number;
            "schedule": number;
            "sourceRepo": number;
            "containerImage": number;
            "package": number;
            "pullRequest": number;
        };
    };
    ReleaseUpdatedEvent: any;
    ReleaseUpdateMetadata: any;
    RunOnServerDeployPhase: any;
    ScheduleDays: {
        enumValues: {
            "none": number;
            "monday": number;
            "tuesday": number;
            "wednesday": number;
            "thursday": number;
            "friday": number;
            "saturday": number;
            "sunday": number;
            "all": number;
        };
    };
    ScheduledReleaseTrigger: any;
    SenderType: {
        enumValues: {
            "serviceAccount": number;
            "requestingUser": number;
        };
    };
    ServerDeploymentInput: any;
    SourceRepoTrigger: any;
    SummaryMailSection: any;
    TaskStatus: {
        enumValues: {
            "unknown": number;
            "pending": number;
            "inProgress": number;
            "success": number;
            "failure": number;
            "canceled": number;
            "skipped": number;
            "succeeded": number;
            "failed": number;
            "partiallySucceeded": number;
        };
    };
    VariableGroup: any;
    VariableGroupActionFilter: {
        enumValues: {
            "none": number;
            "manage": number;
            "use": number;
        };
    };
};
