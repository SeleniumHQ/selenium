import DistributedTaskCommonInterfaces = require("../interfaces/DistributedTaskCommonInterfaces");
import FormInputInterfaces = require("../interfaces/common/FormInputInterfaces");
import VSSInterfaces = require("../interfaces/common/VSSInterfaces");
export declare enum AadLoginPromptOption {
    /**
     * Do not provide a prompt option
     */
    NoOption = 0,
    /**
     * Force the user to login again.
     */
    Login = 1,
    /**
     * Force the user to select which account they are logging in with instead of automatically picking the user up from the session state. NOTE: This does not work for switching bewtween the variants of a dual-homed user.
     */
    SelectAccount = 2,
    /**
     * Force the user to login again.  Ignore current authentication state and force the user to authenticate again. This option should be used instead of Login.
     */
    FreshLogin = 3,
}
export interface AadOauthTokenRequest {
    refresh: boolean;
    resource: string;
    tenantId: string;
    token: string;
}
export interface AadOauthTokenResult {
    accessToken: string;
    refreshTokenCache: string;
}
export interface AgentChangeEvent {
    agent: TaskAgent;
    eventType: string;
    pool: TaskAgentPoolReference;
    poolId: number;
    timeStamp: Date;
}
export interface AgentJobRequestMessage extends JobRequestMessage {
    lockedUntil: Date;
    lockToken: string;
    requestId: number;
    tasks: TaskInstance[];
}
export interface AgentMigrationMessage {
    accessToken: string;
}
export interface AgentPoolEvent {
    eventType: string;
    pool: TaskAgentPool;
}
export interface AgentQueueEvent {
    eventType: string;
    queue: TaskAgentQueue;
}
export interface AgentQueuesEvent {
    eventType: string;
    queues: TaskAgentQueue[];
}
export interface AgentRefreshMessage {
    agentId: number;
    targetVersion: string;
    timeout: any;
}
export interface AgentRequestEvent {
    eventType: string;
    planId: string;
    poolId: number;
    reservedAgentId: number;
    result: TaskResult;
    timeStamp: Date;
}
export declare enum AuditAction {
    Add = 1,
    Update = 2,
    Delete = 3,
}
export interface AuthorizationHeader {
    name: string;
    value: string;
}
export interface AzureSpnOperationStatus {
    state: string;
    statusMessage: string;
}
export interface AzureSubscription {
    displayName: string;
    subscriptionId: string;
    subscriptionTenantId: string;
    subscriptionTenantName: string;
}
export interface AzureSubscriptionQueryResult {
    errorMessage: string;
    value: AzureSubscription[];
}
export interface DataSource {
    endpointUrl: string;
    name: string;
    resultSelector: string;
}
export interface DataSourceBinding extends DistributedTaskCommonInterfaces.DataSourceBindingBase {
}
export interface DataSourceDetails {
    dataSourceName: string;
    dataSourceUrl: string;
    parameters: {
        [key: string]: string;
    };
    resultSelector: string;
}
export interface DependencyBinding {
    key: string;
    value: string;
}
export interface DependencyData {
    input: string;
    map: {
        key: string;
        value: {
            key: string;
            value: string;
        }[];
    }[];
}
export interface DependsOn {
    input: string;
    map: DependencyBinding[];
}
export interface DeploymentGroup extends DeploymentGroupReference {
    machineCount: number;
    machines: DeploymentMachine[];
}
export declare enum DeploymentGroupActionFilter {
    None = 0,
    Manage = 2,
    Use = 16,
}
export declare enum DeploymentGroupExpands {
    None = 0,
    Machines = 2,
}
export interface DeploymentGroupReference {
    id: number;
    name: string;
    pool: TaskAgentPoolReference;
    project: ProjectReference;
}
export interface DeploymentMachine {
    agent: TaskAgentReference;
    tags: string[];
}
export interface DeploymentMachineGroup extends DeploymentMachineGroupReference {
    machines: DeploymentMachine[];
    size: number;
}
export interface DeploymentMachineGroupReference {
    id: number;
    name: string;
    pool: TaskAgentPoolReference;
    project: ProjectReference;
}
export interface DeploymentMachinesChangeEvent {
    machineGroupReference: DeploymentGroupReference;
    machines: DeploymentMachine[];
}
export interface EndpointAuthorization {
    parameters: {
        [key: string]: string;
    };
    scheme: string;
}
export interface EndpointUrl {
    dependsOn: DependsOn;
    displayName: string;
    helpText: string;
    isVisible: string;
    value: string;
}
export interface HelpLink {
    text: string;
    url: string;
}
export interface InputValidationItem {
    isValid: boolean;
    reason: string;
    type: string;
    value: string;
}
export interface InputValidationRequest {
    inputs: {
        [key: string]: InputValidationItem;
    };
}
export interface Issue {
    category: string;
    data: {
        [key: string]: string;
    };
    message: string;
    type: IssueType;
}
export declare enum IssueType {
    Error = 1,
    Warning = 2,
}
export interface JobAssignedEvent extends JobEvent {
    request: TaskAgentJobRequest;
}
export interface JobCancelMessage {
    jobId: string;
    timeout: any;
}
export interface JobCompletedEvent extends JobEvent {
    outputVariables: {
        [key: string]: VariableValue;
    };
    requestId: number;
    result: TaskResult;
}
/**
 * Represents the context of variables and vectors for a job request.
 */
export interface JobEnvironment {
    endpoints: ServiceEndpoint[];
    mask: MaskHint[];
    options: {
        [key: string]: JobOption;
    };
    secureFiles: SecureFile[];
    /**
     * Gets or sets the endpoint used for communicating back to the calling service.
     */
    systemConnection: ServiceEndpoint;
    variables: {
        [key: string]: string;
    };
}
export interface JobEvent {
    jobId: string;
    name: string;
}
export interface JobEventConfig {
    timeout: string;
}
export interface JobEventsConfig {
    jobAssigned: JobEventConfig;
    jobCompleted: JobEventConfig;
    jobStarted: JobEventConfig;
}
/**
 * Represents an option that may affect the way an agent runs the job.
 */
export interface JobOption {
    data: {
        [key: string]: string;
    };
    /**
     * Gets the id of the option.
     */
    id: string;
}
export interface JobRequestMessage {
    environment: JobEnvironment;
    jobId: string;
    jobName: string;
    messageType: string;
    plan: TaskOrchestrationPlanReference;
    timeline: TimelineReference;
}
export interface JobStartedEvent extends JobEvent {
}
export declare enum MachineGroupActionFilter {
    None = 0,
    Manage = 2,
    Use = 16,
}
export interface MaskHint {
    type: MaskType;
    value: string;
}
export declare enum MaskType {
    Variable = 1,
    Regex = 2,
}
/**
 * Represents a downloadable package.
 */
export interface PackageMetadata {
    /**
     * The date the package was created
     */
    createdOn: Date;
    /**
     * A direct link to download the package.
     */
    downloadUrl: string;
    /**
     * The UI uses this to display instructions, i.e. "unzip MyAgent.zip"
     */
    filename: string;
    /**
     * MD5 hash as a base64 string
     */
    hashValue: string;
    /**
     * A link to documentation
     */
    infoUrl: string;
    /**
     * The platform (win7, linux, etc.)
     */
    platform: string;
    /**
     * The type of package (e.g. "agent")
     */
    type: string;
    /**
     * The package version.
     */
    version: PackageVersion;
}
export interface PackageVersion {
    major: number;
    minor: number;
    patch: number;
}
export interface PlanEnvironment {
    mask: MaskHint[];
    options: {
        [key: string]: JobOption;
    };
    variables: {
        [key: string]: string;
    };
}
export declare enum PlanGroupStatusFilter {
    Running = 1,
    Queued = 2,
    All = 3,
}
export interface ProjectReference {
    id: string;
    name: string;
}
export interface ResultTransformationDetails {
    resultTemplate: string;
}
export interface SecureFile {
    createdBy: VSSInterfaces.IdentityRef;
    createdOn: Date;
    id: string;
    modifiedBy: VSSInterfaces.IdentityRef;
    modifiedOn: Date;
    name: string;
    properties: {
        [key: string]: string;
    };
    ticket: string;
}
export declare enum SecureFileActionFilter {
    None = 0,
    Manage = 2,
    Use = 16,
}
export interface SendJobResponse {
    events: JobEventsConfig;
    variables: {
        [key: string]: string;
    };
}
export interface ServerExecutionDefinition {
    events: JobEventsConfig;
}
export interface ServerJobRequestMessage extends JobRequestMessage {
    taskDefinition: TaskDefinition;
    taskInstance: TaskInstance;
}
/**
 * Represents an endpoint which may be used by an orchestration job.
 */
export interface ServiceEndpoint {
    administratorsGroup: VSSInterfaces.IdentityRef;
    /**
     * Gets or sets the authorization data for talking to the endpoint.
     */
    authorization: EndpointAuthorization;
    /**
     * The Gets or sets Identity reference for the user who created the Service endpoint
     */
    createdBy: VSSInterfaces.IdentityRef;
    data: {
        [key: string]: string;
    };
    /**
     * Gets or Sets description of endpoint
     */
    description: string;
    groupScopeId: string;
    /**
     * Gets or sets the identifier of this endpoint.
     */
    id: string;
    /**
     * EndPoint state indictor
     */
    isReady: boolean;
    /**
     * Gets or sets the friendly name of the endpoint.
     */
    name: string;
    /**
     * Error message during creation/deletion of endpoint
     */
    operationStatus: any;
    readersGroup: VSSInterfaces.IdentityRef;
    /**
     * Gets or sets the type of the endpoint.
     */
    type: string;
    /**
     * Gets or sets the url of the endpoint.
     */
    url: string;
}
export interface ServiceEndpointAuthenticationScheme {
    authorizationHeaders: AuthorizationHeader[];
    displayName: string;
    inputDescriptors: FormInputInterfaces.InputDescriptor[];
    scheme: string;
}
export interface ServiceEndpointDetails {
    authorization: EndpointAuthorization;
    data: {
        [key: string]: string;
    };
    type: string;
    url: string;
}
export interface ServiceEndpointRequest {
    dataSourceDetails: DataSourceDetails;
    resultTransformationDetails: ResultTransformationDetails;
    serviceEndpointDetails: ServiceEndpointDetails;
}
export interface ServiceEndpointRequestResult {
    errorMessage: string;
    result: any;
    statusCode: string;
}
export interface ServiceEndpointType {
    authenticationSchemes: ServiceEndpointAuthenticationScheme[];
    dataSources: DataSource[];
    dependencyData: DependencyData[];
    description: string;
    displayName: string;
    endpointUrl: EndpointUrl;
    helpLink: HelpLink;
    helpMarkDown: string;
    iconUrl: string;
    inputDescriptors: FormInputInterfaces.InputDescriptor[];
    name: string;
}
export interface TaskAgent extends TaskAgentReference {
    /**
     * Gets the request which is currently assigned to this agent.
     */
    assignedRequest: TaskAgentJobRequest;
    /**
     * Gets or sets the authorization information for this agent.
     */
    authorization: TaskAgentAuthorization;
    /**
     * Gets the date on which this agent was created.
     */
    createdOn: Date;
    /**
     * Gets or sets the maximum job parallelism allowed on this host.
     */
    maxParallelism: number;
    /**
     * Gets the pending update for this agent.
     */
    pendingUpdate: TaskAgentUpdate;
    properties: any;
    /**
     * Gets the date on which the last connectivity status change occurred.
     */
    statusChangedOn: Date;
    systemCapabilities: {
        [key: string]: string;
    };
    userCapabilities: {
        [key: string]: string;
    };
}
/**
 * Provides data necessary for authorizing the agent using OAuth 2.0 authentication flows.
 */
export interface TaskAgentAuthorization {
    /**
     * Gets or sets the endpoint used to obtain access tokens from the configured token service.
     */
    authorizationUrl: string;
    /**
     * Gets or sets the client identifier for this agent.
     */
    clientId: string;
    /**
     * Gets or sets the public key used to verify the identity of this agent.
     */
    publicKey: TaskAgentPublicKey;
}
export interface TaskAgentJobRequest {
    assignTime: Date;
    data: {
        [key: string]: string;
    };
    definition: TaskOrchestrationOwner;
    demands: any[];
    finishTime: Date;
    hostId: string;
    jobId: string;
    jobName: string;
    lockedUntil: Date;
    matchedAgents: TaskAgentReference[];
    owner: TaskOrchestrationOwner;
    planId: string;
    planType: string;
    queueTime: Date;
    receiveTime: Date;
    requestId: number;
    reservedAgent: TaskAgentReference;
    result: TaskResult;
    scopeId: string;
    serviceOwner: string;
}
/**
 * Provides a contract for receiving messages from the task orchestrator.
 */
export interface TaskAgentMessage {
    /**
     * Gets or sets the body of the message. If the IV property is provided the body will need to be decrypted using the TaskAgentSession.EncryptionKey value in addition to the IV.
     */
    body: string;
    /**
     * Gets or sets the intialization vector used to encrypt this message.
     */
    iV: number[];
    /**
     * Gets or sets the message identifier.
     */
    messageId: number;
    /**
     * Gets or sets the message type, describing the data contract found in TaskAgentMessage.Body.
     */
    messageType: string;
}
export interface TaskAgentPool extends TaskAgentPoolReference {
    /**
     * Gets the administrators group for this agent pool.
     */
    administratorsGroup: VSSInterfaces.IdentityRef;
    /**
     * Gets or sets a value indicating whether or not a queue should be automatically provisioned for each project collection or not.
     */
    autoProvision: boolean;
    /**
     * Gets the identity who created this pool. The creator of the pool is automatically added into the administrators group for the pool on creation.
     */
    createdBy: VSSInterfaces.IdentityRef;
    /**
     * Gets the date/time of the pool creation.
     */
    createdOn: Date;
    /**
     * Gets the scope identifier for groups/roles which are owned by this pool.
     */
    groupScopeId: string;
    properties: any;
    /**
     * Gets a value indicating whether or not roles have been provisioned for this pool.
     */
    provisioned: boolean;
    /**
     * Gets the service accounts group for this agent pool.
     */
    serviceAccountsGroup: VSSInterfaces.IdentityRef;
    /**
     * Gets the current size of the pool.
     */
    size: number;
}
export declare enum TaskAgentPoolActionFilter {
    None = 0,
    Manage = 2,
    Use = 16,
}
export interface TaskAgentPoolMaintenanceDefinition {
    /**
     * Enable maintenance
     */
    enabled: boolean;
    /**
     * Id
     */
    id: number;
    /**
     * Maintenance job timeout per agent
     */
    jobTimeoutInMinutes: number;
    /**
     * Max percentage of agents within a pool running maintenance job at given time
     */
    maxConcurrentAgentsPercentage: number;
    options: TaskAgentPoolMaintenanceOptions;
    /**
     * Pool reference for the maintenance definition
     */
    pool: TaskAgentPoolReference;
    retentionPolicy: TaskAgentPoolMaintenanceRetentionPolicy;
    scheduleSetting: TaskAgentPoolMaintenanceSchedule;
}
export interface TaskAgentPoolMaintenanceJob {
    /**
     * The maintenance definition for the maintenance job
     */
    definitionId: number;
    /**
     * The total error counts during the maintenance job
     */
    errorCount: number;
    /**
     * Time that the maintenance job was completed
     */
    finishTime: Date;
    /**
     * Id of the maintenance job
     */
    jobId: number;
    /**
     * The log download url for the maintenance job
     */
    logsDownloadUrl: string;
    /**
     * Orchestration/Plan Id for the maintenance job
     */
    orchestrationId: string;
    /**
     * Pool reference for the maintenance job
     */
    pool: TaskAgentPoolReference;
    /**
     * Time that the maintenance job was queued
     */
    queueTime: Date;
    /**
     * The identity that queued the maintenance job
     */
    requestedBy: VSSInterfaces.IdentityRef;
    /**
     * The maintenance job result
     */
    result: TaskAgentPoolMaintenanceJobResult;
    /**
     * Time that the maintenance job was started
     */
    startTime: Date;
    /**
     * Status of the maintenance job
     */
    status: TaskAgentPoolMaintenanceJobStatus;
    targetAgents: TaskAgentReference[];
    /**
     * The total warning counts during the maintenance job
     */
    warningCount: number;
}
export declare enum TaskAgentPoolMaintenanceJobResult {
    Succeeded = 1,
    Failed = 2,
    Canceled = 4,
}
export declare enum TaskAgentPoolMaintenanceJobStatus {
    InProgress = 1,
    Completed = 2,
    Cancelling = 4,
    Queued = 8,
}
export interface TaskAgentPoolMaintenanceOptions {
    /**
     * time to consider a System.DefaultWorkingDirectory is stale
     */
    workingDirectoryExpirationInDays: number;
}
export interface TaskAgentPoolMaintenanceRetentionPolicy {
    /**
     * Number of records to keep for maintenance job executed with this definition.
     */
    numberOfHistoryRecordsToKeep: number;
}
export interface TaskAgentPoolMaintenanceSchedule {
    /**
     * Days for a build (flags enum for days of the week)
     */
    daysToBuild: TaskAgentPoolMaintenanceScheduleDays;
    /**
     * The Job Id of the Scheduled job that will queue the pool maintenance job.
     */
    scheduleJobId: string;
    /**
     * Local timezone hour to start
     */
    startHours: number;
    /**
     * Local timezone minute to start
     */
    startMinutes: number;
    /**
     * Time zone of the build schedule (string representation of the time zone id)
     */
    timeZoneId: string;
}
export declare enum TaskAgentPoolMaintenanceScheduleDays {
    /**
     * Do not run.
     */
    None = 0,
    /**
     * Run on Monday.
     */
    Monday = 1,
    /**
     * Run on Tuesday.
     */
    Tuesday = 2,
    /**
     * Run on Wednesday.
     */
    Wednesday = 4,
    /**
     * Run on Thursday.
     */
    Thursday = 8,
    /**
     * Run on Friday.
     */
    Friday = 16,
    /**
     * Run on Saturday.
     */
    Saturday = 32,
    /**
     * Run on Sunday.
     */
    Sunday = 64,
    /**
     * Run on all days of the week.
     */
    All = 127,
}
export interface TaskAgentPoolReference {
    id: number;
    /**
     * Gets or sets a value indicating whether or not this pool is managed by the service.
     */
    isHosted: boolean;
    name: string;
    /**
     * Gets or sets the type of the pool
     */
    poolType: TaskAgentPoolType;
    scope: string;
}
export declare enum TaskAgentPoolType {
    Automation = 1,
    Deployment = 2,
}
/**
 * Represents the public key portion of an RSA asymmetric key.
 */
export interface TaskAgentPublicKey {
    /**
     * Gets or sets the exponent for the public key.
     */
    exponent: number[];
    /**
     * Gets or sets the modulus for the public key.
     */
    modulus: number[];
}
export interface TaskAgentQueue {
    groupScopeId: string;
    id: number;
    name: string;
    pool: TaskAgentPoolReference;
    projectId: string;
    provisioned: boolean;
}
export declare enum TaskAgentQueueActionFilter {
    None = 0,
    Manage = 2,
    Use = 16,
}
export interface TaskAgentReference {
    _links: any;
    /**
     * Gets or sets a value indicating whether or not this agent should be enabled for job execution.
     */
    enabled: boolean;
    /**
     * Gets the identifier of the agent.
     */
    id: number;
    /**
     * Gets the name of the agent.
     */
    name: string;
    /**
     * Gets the current connectivity status of the agent.
     */
    status: TaskAgentStatus;
    /**
     * Gets the version of the agent.
     */
    version: string;
}
/**
 * Represents a session for performing message exchanges from an agent.
 */
export interface TaskAgentSession {
    /**
     * Gets or sets the agent which is the target of the session.
     */
    agent: TaskAgentReference;
    /**
     * Gets the key used to encrypt message traffic for this session.
     */
    encryptionKey: TaskAgentSessionKey;
    /**
     * Gets or sets the owner name of this session. Generally this will be the machine of origination.
     */
    ownerName: string;
    /**
     * Gets the unique identifier for this session.
     */
    sessionId: string;
    systemCapabilities: {
        [key: string]: string;
    };
}
/**
 * Represents a symmetric key used for message-level encryption for communication sent to an agent.
 */
export interface TaskAgentSessionKey {
    /**
     * Gets or sets a value indicating whether or not the key value is encrypted. If this value is true, the property should be decrypted using the RSA key exchanged with the server during registration.
     */
    encrypted: boolean;
    /**
     * Gets or sets the symmetric key value.
     */
    value: number[];
}
export declare enum TaskAgentStatus {
    Offline = 1,
    Online = 2,
}
export interface TaskAgentUpdate {
    /**
     * The current state of this agent update
     */
    currentState: string;
    /**
     * The identity that request the agent update
     */
    requestedBy: VSSInterfaces.IdentityRef;
    /**
     * Gets the date on which this agent update was requested.
     */
    requestTime: Date;
    /**
     * Gets or sets the source agent version of the agent update
     */
    sourceVersion: PackageVersion;
    /**
     * Gets or sets the target agent version of the agent update
     */
    targetVersion: PackageVersion;
}
export interface TaskAttachment {
    _links: any;
    createdOn: Date;
    lastChangedBy: string;
    lastChangedOn: Date;
    name: string;
    recordId: string;
    timelineId: string;
    type: string;
}
export interface TaskChangeEvent {
}
export interface TaskDefinition {
    agentExecution: TaskExecution;
    author: string;
    category: string;
    contentsUploaded: boolean;
    contributionIdentifier: string;
    contributionVersion: string;
    dataSourceBindings: DataSourceBinding[];
    definitionType: string;
    demands: any[];
    description: string;
    disabled: boolean;
    execution: {
        [key: string]: any;
    };
    friendlyName: string;
    groups: TaskGroupDefinition[];
    helpMarkDown: string;
    hostType: string;
    iconUrl: string;
    id: string;
    inputs: TaskInputDefinition[];
    instanceNameFormat: string;
    minimumAgentVersion: string;
    name: string;
    packageLocation: string;
    packageType: string;
    preview: boolean;
    releaseNotes: string;
    runsOn: string[];
    serverOwned: boolean;
    sourceDefinitions: TaskSourceDefinition[];
    sourceLocation: string;
    version: TaskVersion;
    visibility: string[];
}
export interface TaskDefinitionEndpoint {
    /**
     * An ID that identifies a service connection to be used for authenticating endpoint requests.
     */
    connectionId: string;
    /**
     * An Json based keyselector to filter response returned by fetching the endpoint Url.A Json based keyselector must be prefixed with "jsonpath:". KeySelector can be used to specify the filter to get the keys for the values specified with Selector.  The following keyselector defines an Json for extracting nodes named 'ServiceName'.  endpoint.KeySelector = "jsonpath://ServiceName";
     */
    keySelector: string;
    /**
     * The scope as understood by Connected Services. Essentialy, a project-id for now.
     */
    scope: string;
    /**
     * An XPath/Json based selector to filter response returned by fetching the endpoint Url. An XPath based selector must be prefixed with the string "xpath:". A Json based selector must be prefixed with "jsonpath:".  The following selector defines an XPath for extracting nodes named 'ServiceName'.  endpoint.Selector = "xpath://ServiceName";
     */
    selector: string;
    /**
     * TaskId that this endpoint belongs to.
     */
    taskId: string;
    /**
     * URL to GET.
     */
    url: string;
}
export interface TaskDefinitionReference {
    definitionType: string;
    id: string;
    versionSpec: string;
}
export declare enum TaskDefinitionStatus {
    Preinstalled = 1,
    ReceivedInstallOrUpdate = 2,
    Installed = 3,
    ReceivedUninstall = 4,
    Uninstalled = 5,
    RequestedUpdate = 6,
    Updated = 7,
    AlreadyUpToDate = 8,
    InlineUpdateReceived = 9,
}
export interface TaskExecution {
    /**
     * The utility task to run.  Specifying this means that this task definition is simply a meta task to call another task. This is useful for tasks that call utility tasks like powershell and commandline
     */
    execTask: TaskReference;
    /**
     * If a task is going to run code, then this provides the type/script etc... information by platform. For example, it might look like. net45: { typeName: "Microsoft.TeamFoundation.Automation.Tasks.PowerShellTask", assemblyName: "Microsoft.TeamFoundation.Automation.Tasks.PowerShell.dll" } net20: { typeName: "Microsoft.TeamFoundation.Automation.Tasks.PowerShellTask", assemblyName: "Microsoft.TeamFoundation.Automation.Tasks.PowerShell.dll" } java: { jar: "powershelltask.tasks.automation.teamfoundation.microsoft.com", } node: { script: "powershellhost.js", }
     */
    platformInstructions: {
        [key: string]: {
            [key: string]: string;
        };
    };
}
export interface TaskGroup extends TaskDefinition {
    comment: string;
    createdBy: VSSInterfaces.IdentityRef;
    createdOn: Date;
    modifiedBy: VSSInterfaces.IdentityRef;
    modifiedOn: Date;
    owner: string;
    revision: number;
    tasks: TaskGroupStep[];
}
export interface TaskGroupDefinition {
    displayName: string;
    isExpanded: boolean;
    name: string;
    tags: string[];
    visibleRule: string;
}
export interface TaskGroupRevision {
    changedBy: VSSInterfaces.IdentityRef;
    changedDate: Date;
    changeType: AuditAction;
    comment: string;
    fileId: number;
    revision: number;
    taskGroupId: string;
}
export interface TaskGroupStep {
    alwaysRun: boolean;
    continueOnError: boolean;
    displayName: string;
    enabled: boolean;
    inputs: {
        [key: string]: string;
    };
    task: TaskDefinitionReference;
    timeoutInMinutes: number;
}
export interface TaskHubLicenseDetails {
    enterpriseUsersCount: number;
    freeLicenseCount: number;
    hasLicenseCountEverUpdated: boolean;
    hostedAgentMinutesFreeCount: number;
    hostedAgentMinutesUsedCount: number;
    msdnUsersCount: number;
    purchasedHostedLicenseCount: number;
    purchasedLicenseCount: number;
    totalLicenseCount: number;
}
export interface TaskInputDefinition extends DistributedTaskCommonInterfaces.TaskInputDefinitionBase {
}
export interface TaskInstance extends TaskReference {
    alwaysRun: boolean;
    condition: string;
    continueOnError: boolean;
    displayName: string;
    enabled: boolean;
    instanceId: string;
    timeoutInMinutes: number;
}
export interface TaskLog extends TaskLogReference {
    createdOn: Date;
    indexLocation: string;
    lastChangedOn: Date;
    lineCount: number;
    path: string;
}
export interface TaskLogReference {
    id: number;
    location: string;
}
export interface TaskOrchestrationContainer extends TaskOrchestrationItem {
    children: TaskOrchestrationItem[];
    continueOnError: boolean;
    data: {
        [key: string]: string;
    };
    maxConcurrency: number;
    parallel: boolean;
    rollback: TaskOrchestrationContainer;
}
export interface TaskOrchestrationItem {
    itemType: TaskOrchestrationItemType;
}
export declare enum TaskOrchestrationItemType {
    Container = 0,
    Job = 1,
}
export interface TaskOrchestrationJob extends TaskOrchestrationItem {
    demands: any[];
    executeAs: VSSInterfaces.IdentityRef;
    executionMode: string;
    executionTimeout: any;
    instanceId: string;
    name: string;
    tasks: TaskInstance[];
    variables: {
        [key: string]: string;
    };
}
export interface TaskOrchestrationOwner {
    _links: any;
    id: number;
    name: string;
}
export interface TaskOrchestrationPlan extends TaskOrchestrationPlanReference {
    environment: PlanEnvironment;
    finishTime: Date;
    implementation: TaskOrchestrationContainer;
    planGroup: string;
    requestedById: string;
    requestedForId: string;
    result: TaskResult;
    resultCode: string;
    startTime: Date;
    state: TaskOrchestrationPlanState;
    timeline: TimelineReference;
}
export interface TaskOrchestrationPlanReference {
    artifactLocation: string;
    artifactUri: string;
    definition: TaskOrchestrationOwner;
    owner: TaskOrchestrationOwner;
    planId: string;
    planType: string;
    scopeIdentifier: string;
    version: number;
}
export declare enum TaskOrchestrationPlanState {
    InProgress = 1,
    Queued = 2,
    Completed = 4,
}
export interface TaskOrchestrationQueuedPlan {
    assignTime: Date;
    definition: TaskOrchestrationOwner;
    owner: TaskOrchestrationOwner;
    planGroup: string;
    planId: string;
    poolId: number;
    queuePosition: number;
    queueTime: Date;
    scopeIdentifier: string;
}
export interface TaskOrchestrationQueuedPlanGroup {
    definition: TaskOrchestrationOwner;
    owner: TaskOrchestrationOwner;
    planGroup: string;
    plans: TaskOrchestrationQueuedPlan[];
    project: ProjectReference;
    queuePosition: number;
}
export interface TaskPackageMetadata {
    /**
     * Gets the name of the package.
     */
    type: string;
    /**
     * Gets the url of the package.
     */
    url: string;
    /**
     * Gets the version of the package.
     */
    version: string;
}
export interface TaskReference {
    id: string;
    inputs: {
        [key: string]: string;
    };
    name: string;
    version: string;
}
export declare enum TaskResult {
    Succeeded = 0,
    SucceededWithIssues = 1,
    Failed = 2,
    Canceled = 3,
    Skipped = 4,
    Abandoned = 5,
}
export interface TaskSourceDefinition extends DistributedTaskCommonInterfaces.TaskSourceDefinitionBase {
}
export interface TaskVersion {
    isTest: boolean;
    major: number;
    minor: number;
    patch: number;
}
export interface Timeline extends TimelineReference {
    lastChangedBy: string;
    lastChangedOn: Date;
    records: TimelineRecord[];
}
export interface TimelineRecord {
    changeId: number;
    currentOperation: string;
    details: TimelineReference;
    errorCount: number;
    finishTime: Date;
    id: string;
    issues: Issue[];
    lastModified: Date;
    location: string;
    log: TaskLogReference;
    name: string;
    order: number;
    parentId: string;
    percentComplete: number;
    result: TaskResult;
    resultCode: string;
    startTime: Date;
    state: TimelineRecordState;
    task: TaskReference;
    type: string;
    warningCount: number;
    workerName: string;
}
export declare enum TimelineRecordState {
    Pending = 0,
    InProgress = 1,
    Completed = 2,
}
export interface TimelineReference {
    changeId: number;
    id: string;
    location: string;
}
export interface VariableGroup {
    createdBy: VSSInterfaces.IdentityRef;
    createdOn: Date;
    description: string;
    id: number;
    modifiedBy: VSSInterfaces.IdentityRef;
    modifiedOn: Date;
    name: string;
    variables: {
        [key: string]: VariableValue;
    };
}
export declare enum VariableGroupActionFilter {
    None = 0,
    Manage = 2,
    Use = 16,
}
export interface VariableValue {
    isSecret: boolean;
    value: string;
}
export declare var TypeInfo: {
    AadLoginPromptOption: {
        enumValues: {
            "noOption": number;
            "login": number;
            "selectAccount": number;
            "freshLogin": number;
        };
    };
    AgentChangeEvent: any;
    AgentJobRequestMessage: any;
    AgentPoolEvent: any;
    AgentQueueEvent: any;
    AgentQueuesEvent: any;
    AgentRequestEvent: any;
    AuditAction: {
        enumValues: {
            "add": number;
            "update": number;
            "delete": number;
        };
    };
    DeploymentGroup: any;
    DeploymentGroupActionFilter: {
        enumValues: {
            "none": number;
            "manage": number;
            "use": number;
        };
    };
    DeploymentGroupExpands: {
        enumValues: {
            "none": number;
            "machines": number;
        };
    };
    DeploymentGroupReference: any;
    DeploymentMachine: any;
    DeploymentMachineGroup: any;
    DeploymentMachineGroupReference: any;
    DeploymentMachinesChangeEvent: any;
    Issue: any;
    IssueType: {
        enumValues: {
            "error": number;
            "warning": number;
        };
    };
    JobAssignedEvent: any;
    JobCompletedEvent: any;
    JobEnvironment: any;
    JobRequestMessage: any;
    MachineGroupActionFilter: {
        enumValues: {
            "none": number;
            "manage": number;
            "use": number;
        };
    };
    MaskHint: any;
    MaskType: {
        enumValues: {
            "variable": number;
            "regex": number;
        };
    };
    PackageMetadata: any;
    PlanEnvironment: any;
    PlanGroupStatusFilter: {
        enumValues: {
            "running": number;
            "queued": number;
            "all": number;
        };
    };
    SecureFile: any;
    SecureFileActionFilter: {
        enumValues: {
            "none": number;
            "manage": number;
            "use": number;
        };
    };
    ServerJobRequestMessage: any;
    ServiceEndpointAuthenticationScheme: any;
    ServiceEndpointRequestResult: any;
    ServiceEndpointType: any;
    TaskAgent: any;
    TaskAgentJobRequest: any;
    TaskAgentPool: any;
    TaskAgentPoolActionFilter: {
        enumValues: {
            "none": number;
            "manage": number;
            "use": number;
        };
    };
    TaskAgentPoolMaintenanceDefinition: any;
    TaskAgentPoolMaintenanceJob: any;
    TaskAgentPoolMaintenanceJobResult: {
        enumValues: {
            "succeeded": number;
            "failed": number;
            "canceled": number;
        };
    };
    TaskAgentPoolMaintenanceJobStatus: {
        enumValues: {
            "inProgress": number;
            "completed": number;
            "cancelling": number;
            "queued": number;
        };
    };
    TaskAgentPoolMaintenanceSchedule: any;
    TaskAgentPoolMaintenanceScheduleDays: {
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
    TaskAgentPoolReference: any;
    TaskAgentPoolType: {
        enumValues: {
            "automation": number;
            "deployment": number;
        };
    };
    TaskAgentQueue: any;
    TaskAgentQueueActionFilter: {
        enumValues: {
            "none": number;
            "manage": number;
            "use": number;
        };
    };
    TaskAgentReference: any;
    TaskAgentSession: any;
    TaskAgentStatus: {
        enumValues: {
            "offline": number;
            "online": number;
        };
    };
    TaskAgentUpdate: any;
    TaskAttachment: any;
    TaskDefinitionStatus: {
        enumValues: {
            "preinstalled": number;
            "receivedInstallOrUpdate": number;
            "installed": number;
            "receivedUninstall": number;
            "uninstalled": number;
            "requestedUpdate": number;
            "updated": number;
            "alreadyUpToDate": number;
            "inlineUpdateReceived": number;
        };
    };
    TaskGroup: any;
    TaskGroupRevision: any;
    TaskLog: any;
    TaskOrchestrationContainer: any;
    TaskOrchestrationItem: any;
    TaskOrchestrationItemType: {
        enumValues: {
            "container": number;
            "job": number;
        };
    };
    TaskOrchestrationJob: any;
    TaskOrchestrationPlan: any;
    TaskOrchestrationPlanState: {
        enumValues: {
            "inProgress": number;
            "queued": number;
            "completed": number;
        };
    };
    TaskOrchestrationQueuedPlan: any;
    TaskOrchestrationQueuedPlanGroup: any;
    TaskResult: {
        enumValues: {
            "succeeded": number;
            "succeededWithIssues": number;
            "failed": number;
            "canceled": number;
            "skipped": number;
            "abandoned": number;
        };
    };
    Timeline: any;
    TimelineRecord: any;
    TimelineRecordState: {
        enumValues: {
            "pending": number;
            "inProgress": number;
            "completed": number;
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
