/// <reference types="node" />
import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import TaskAgentInterfaces = require("./interfaces/TaskAgentInterfaces");
import VSSInterfaces = require("./interfaces/common/VSSInterfaces");
export interface ITaskAgentApiBase extends basem.ClientApiBase {
    addAgent(agent: TaskAgentInterfaces.TaskAgent, poolId: number): Promise<TaskAgentInterfaces.TaskAgent>;
    deleteAgent(poolId: number, agentId: number): Promise<void>;
    getAgent(poolId: number, agentId: number, includeCapabilities?: boolean, includeAssignedRequest?: boolean, propertyFilters?: string[]): Promise<TaskAgentInterfaces.TaskAgent>;
    getAgents(poolId: number, agentName?: string, includeCapabilities?: boolean, includeAssignedRequest?: boolean, propertyFilters?: string[], demands?: string[]): Promise<TaskAgentInterfaces.TaskAgent[]>;
    replaceAgent(agent: TaskAgentInterfaces.TaskAgent, poolId: number, agentId: number): Promise<TaskAgentInterfaces.TaskAgent>;
    updateAgent(agent: TaskAgentInterfaces.TaskAgent, poolId: number, agentId: number): Promise<TaskAgentInterfaces.TaskAgent>;
    getAzureSubscriptions(): Promise<TaskAgentInterfaces.AzureSubscriptionQueryResult>;
    generateDeploymentGroupAccessToken(project: string, deploymentGroupId: number): Promise<string>;
    addDeploymentGroup(deploymentGroup: TaskAgentInterfaces.DeploymentGroup, project: string): Promise<TaskAgentInterfaces.DeploymentGroup>;
    deleteDeploymentGroup(project: string, deploymentGroupId: number): Promise<void>;
    getDeploymentGroup(project: string, deploymentGroupId: number, actionFilter?: TaskAgentInterfaces.DeploymentGroupActionFilter, expand?: TaskAgentInterfaces.DeploymentGroupExpands): Promise<TaskAgentInterfaces.DeploymentGroup>;
    getDeploymentGroups(project: string, name?: string, actionFilter?: TaskAgentInterfaces.DeploymentGroupActionFilter, expand?: TaskAgentInterfaces.DeploymentGroupExpands): Promise<TaskAgentInterfaces.DeploymentGroup[]>;
    updateDeploymentGroup(deploymentGroup: TaskAgentInterfaces.DeploymentGroup, project: string, deploymentGroupId: number): Promise<TaskAgentInterfaces.DeploymentGroup>;
    queryEndpoint(endpoint: TaskAgentInterfaces.TaskDefinitionEndpoint): Promise<string[]>;
    getTaskHubLicenseDetails(hubName: string, includeEnterpriseUsersCount?: boolean, includeHostedAgentMinutesCount?: boolean): Promise<TaskAgentInterfaces.TaskHubLicenseDetails>;
    updateTaskHubLicenseDetails(taskHubLicenseDetails: TaskAgentInterfaces.TaskHubLicenseDetails, hubName: string): Promise<TaskAgentInterfaces.TaskHubLicenseDetails>;
    validateInputs(inputValidationRequest: TaskAgentInterfaces.InputValidationRequest): Promise<TaskAgentInterfaces.InputValidationRequest>;
    deleteAgentRequest(poolId: number, requestId: number, lockToken: string, result?: TaskAgentInterfaces.TaskResult): Promise<void>;
    getAgentRequest(poolId: number, requestId: number): Promise<TaskAgentInterfaces.TaskAgentJobRequest>;
    getAgentRequestsForAgent(poolId: number, agentId: number, completedRequestCount?: number): Promise<TaskAgentInterfaces.TaskAgentJobRequest[]>;
    getAgentRequestsForAgents(poolId: number, agentIds?: number[], completedRequestCount?: number): Promise<TaskAgentInterfaces.TaskAgentJobRequest[]>;
    getAgentRequestsForPlan(poolId: number, planId: string, jobId?: string): Promise<TaskAgentInterfaces.TaskAgentJobRequest[]>;
    queueAgentRequest(request: TaskAgentInterfaces.TaskAgentJobRequest, poolId: number): Promise<TaskAgentInterfaces.TaskAgentJobRequest>;
    updateAgentRequest(request: TaskAgentInterfaces.TaskAgentJobRequest, poolId: number, requestId: number, lockToken: string): Promise<TaskAgentInterfaces.TaskAgentJobRequest>;
    generateDeploymentMachineGroupAccessToken(project: string, machineGroupId: number): Promise<string>;
    addDeploymentMachineGroup(machineGroup: TaskAgentInterfaces.DeploymentMachineGroup, project: string): Promise<TaskAgentInterfaces.DeploymentMachineGroup>;
    deleteDeploymentMachineGroup(project: string, machineGroupId: number): Promise<void>;
    getDeploymentMachineGroup(project: string, machineGroupId: number, actionFilter?: TaskAgentInterfaces.MachineGroupActionFilter): Promise<TaskAgentInterfaces.DeploymentMachineGroup>;
    getDeploymentMachineGroups(project: string, machineGroupName?: string, actionFilter?: TaskAgentInterfaces.MachineGroupActionFilter): Promise<TaskAgentInterfaces.DeploymentMachineGroup[]>;
    updateDeploymentMachineGroup(machineGroup: TaskAgentInterfaces.DeploymentMachineGroup, project: string, machineGroupId: number): Promise<TaskAgentInterfaces.DeploymentMachineGroup>;
    getDeploymentMachineGroupMachines(project: string, machineGroupId: number, tagFilters?: string[]): Promise<TaskAgentInterfaces.DeploymentMachine[]>;
    updateDeploymentMachineGroupMachines(deploymentMachines: TaskAgentInterfaces.DeploymentMachine[], project: string, machineGroupId: number): Promise<TaskAgentInterfaces.DeploymentMachine[]>;
    getDeploymentMachines(project: string, deploymentGroupId: number, tags?: string[]): Promise<TaskAgentInterfaces.DeploymentMachine[]>;
    updateDeploymentMachines(deploymentMachines: TaskAgentInterfaces.DeploymentMachine[], project: string, deploymentGroupId: number): Promise<TaskAgentInterfaces.DeploymentMachine[]>;
    createAgentPoolMaintenanceDefinition(definition: TaskAgentInterfaces.TaskAgentPoolMaintenanceDefinition, poolId: number): Promise<TaskAgentInterfaces.TaskAgentPoolMaintenanceDefinition>;
    deleteAgentPoolMaintenanceDefinition(poolId: number, definitionId: number): Promise<void>;
    getAgentPoolMaintenanceDefinition(poolId: number, definitionId: number): Promise<TaskAgentInterfaces.TaskAgentPoolMaintenanceDefinition>;
    getAgentPoolMaintenanceDefinitions(poolId: number): Promise<TaskAgentInterfaces.TaskAgentPoolMaintenanceDefinition[]>;
    updateAgentPoolMaintenanceDefinition(definition: TaskAgentInterfaces.TaskAgentPoolMaintenanceDefinition, poolId: number, definitionId: number): Promise<TaskAgentInterfaces.TaskAgentPoolMaintenanceDefinition>;
    deleteAgentPoolMaintenanceJob(poolId: number, jobId: number): Promise<void>;
    getAgentPoolMaintenanceJob(poolId: number, jobId: number): Promise<TaskAgentInterfaces.TaskAgentPoolMaintenanceJob>;
    getAgentPoolMaintenanceJobLogs(poolId: number, jobId: number): Promise<NodeJS.ReadableStream>;
    getAgentPoolMaintenanceJobs(poolId: number, definitionId?: number): Promise<TaskAgentInterfaces.TaskAgentPoolMaintenanceJob[]>;
    queueAgentPoolMaintenanceJob(job: TaskAgentInterfaces.TaskAgentPoolMaintenanceJob, poolId: number): Promise<TaskAgentInterfaces.TaskAgentPoolMaintenanceJob>;
    updateAgentPoolMaintenanceJob(job: TaskAgentInterfaces.TaskAgentPoolMaintenanceJob, poolId: number, jobId: number): Promise<TaskAgentInterfaces.TaskAgentPoolMaintenanceJob>;
    deleteMessage(poolId: number, messageId: number, sessionId: string): Promise<void>;
    getMessage(poolId: number, sessionId: string, lastMessageId?: number): Promise<TaskAgentInterfaces.TaskAgentMessage>;
    refreshAgent(poolId: number, agentId: number): Promise<void>;
    refreshAgents(poolId: number): Promise<void>;
    sendMessage(message: TaskAgentInterfaces.TaskAgentMessage, poolId: number, requestId: number): Promise<void>;
    getPackage(packageType: string, platform: string, version: string): Promise<TaskAgentInterfaces.PackageMetadata>;
    getPackages(packageType?: string, platform?: string, top?: number): Promise<TaskAgentInterfaces.PackageMetadata[]>;
    getAgentPoolRoles(poolId?: number): Promise<VSSInterfaces.IdentityRef[]>;
    addAgentPool(pool: TaskAgentInterfaces.TaskAgentPool): Promise<TaskAgentInterfaces.TaskAgentPool>;
    deleteAgentPool(poolId: number): Promise<void>;
    getAgentPool(poolId: number, properties?: string[], actionFilter?: TaskAgentInterfaces.TaskAgentPoolActionFilter): Promise<TaskAgentInterfaces.TaskAgentPool>;
    getAgentPools(poolName?: string, properties?: string[], poolType?: TaskAgentInterfaces.TaskAgentPoolType, actionFilter?: TaskAgentInterfaces.TaskAgentPoolActionFilter): Promise<TaskAgentInterfaces.TaskAgentPool[]>;
    updateAgentPool(pool: TaskAgentInterfaces.TaskAgentPool, poolId: number): Promise<TaskAgentInterfaces.TaskAgentPool>;
    getAgentQueueRoles(queueId?: number): Promise<VSSInterfaces.IdentityRef[]>;
    addAgentQueue(queue: TaskAgentInterfaces.TaskAgentQueue, project?: string): Promise<TaskAgentInterfaces.TaskAgentQueue>;
    createTeamProject(project?: string): Promise<void>;
    deleteAgentQueue(queueId: number, project?: string): Promise<void>;
    getAgentQueue(queueId: number, project?: string, actionFilter?: TaskAgentInterfaces.TaskAgentQueueActionFilter): Promise<TaskAgentInterfaces.TaskAgentQueue>;
    getAgentQueues(project?: string, queueName?: string, actionFilter?: TaskAgentInterfaces.TaskAgentQueueActionFilter): Promise<TaskAgentInterfaces.TaskAgentQueue[]>;
    getTaskGroupHistory(project: string, taskGroupId: string): Promise<TaskAgentInterfaces.TaskGroupRevision[]>;
    deleteSecureFile(project: string, secureFileId: string): Promise<void>;
    downloadSecureFile(project: string, secureFileId: string, ticket: string, download?: boolean): Promise<NodeJS.ReadableStream>;
    getSecureFile(project: string, secureFileId: string, includeDownloadTicket?: boolean): Promise<TaskAgentInterfaces.SecureFile>;
    getSecureFiles(project: string, namePattern?: string, includeDownloadTickets?: boolean, actionFilter?: TaskAgentInterfaces.SecureFileActionFilter): Promise<TaskAgentInterfaces.SecureFile[]>;
    getSecureFilesByIds(project: string, secureFileIds: string[], includeDownloadTickets?: boolean): Promise<TaskAgentInterfaces.SecureFile[]>;
    querySecureFilesByProperties(condition: string, project: string, namePattern?: string): Promise<TaskAgentInterfaces.SecureFile[]>;
    updateSecureFile(secureFile: TaskAgentInterfaces.SecureFile, project: string, secureFileId: string): Promise<TaskAgentInterfaces.SecureFile>;
    updateSecureFiles(secureFiles: TaskAgentInterfaces.SecureFile[], project: string): Promise<TaskAgentInterfaces.SecureFile[]>;
    uploadSecureFile(customHeaders: any, contentStream: NodeJS.ReadableStream, project: string, name: string): Promise<TaskAgentInterfaces.SecureFile>;
    executeServiceEndpointRequest(serviceEndpointRequest: TaskAgentInterfaces.ServiceEndpointRequest, project: string, endpointId: string): Promise<TaskAgentInterfaces.ServiceEndpointRequestResult>;
    queryServiceEndpoint(binding: TaskAgentInterfaces.DataSourceBinding, project: string): Promise<string[]>;
    createServiceEndpoint(endpoint: TaskAgentInterfaces.ServiceEndpoint, project: string): Promise<TaskAgentInterfaces.ServiceEndpoint>;
    deleteServiceEndpoint(project: string, endpointId: string): Promise<void>;
    getServiceEndpointDetails(project: string, endpointId: string): Promise<TaskAgentInterfaces.ServiceEndpoint>;
    getServiceEndpoints(project: string, type?: string, authSchemes?: string[], endpointIds?: string[], includeFailed?: boolean): Promise<TaskAgentInterfaces.ServiceEndpoint[]>;
    updateServiceEndpoint(endpoint: TaskAgentInterfaces.ServiceEndpoint, project: string, endpointId: string): Promise<TaskAgentInterfaces.ServiceEndpoint>;
    updateServiceEndpoints(endpoints: TaskAgentInterfaces.ServiceEndpoint[], project: string): Promise<TaskAgentInterfaces.ServiceEndpoint[]>;
    getServiceEndpointTypes(type?: string, scheme?: string): Promise<TaskAgentInterfaces.ServiceEndpointType[]>;
    createAgentSession(session: TaskAgentInterfaces.TaskAgentSession, poolId: number): Promise<TaskAgentInterfaces.TaskAgentSession>;
    deleteAgentSession(poolId: number, sessionId: string): Promise<void>;
    addTaskGroup(taskGroup: TaskAgentInterfaces.TaskGroup, project: string): Promise<TaskAgentInterfaces.TaskGroup>;
    deleteTaskGroup(project: string, taskGroupId: string): Promise<void>;
    getTaskGroupRevision(project: string, taskGroupId: string, revision: number): Promise<NodeJS.ReadableStream>;
    getTaskGroups(project: string, taskGroupId?: string, expanded?: boolean): Promise<TaskAgentInterfaces.TaskGroup[]>;
    updateTaskGroup(taskGroup: TaskAgentInterfaces.TaskGroup, project: string): Promise<TaskAgentInterfaces.TaskGroup>;
    deleteTaskDefinition(taskId: string): Promise<void>;
    getTaskContentZip(taskId: string, versionString: string, visibility?: string[], scopeLocal?: boolean): Promise<NodeJS.ReadableStream>;
    getTaskDefinition(taskId: string, versionString: string, visibility?: string[], scopeLocal?: boolean): Promise<TaskAgentInterfaces.TaskDefinition>;
    getTaskDefinitions(taskId?: string, visibility?: string[], scopeLocal?: boolean): Promise<TaskAgentInterfaces.TaskDefinition[]>;
    updateAgentUpdateState(poolId: number, agentId: number, currentState: string): Promise<TaskAgentInterfaces.TaskAgent>;
    updateAgentUserCapabilities(userCapabilities: {
        [key: string]: string;
    }, poolId: number, agentId: number): Promise<TaskAgentInterfaces.TaskAgent>;
    addVariableGroup(group: TaskAgentInterfaces.VariableGroup, project: string): Promise<TaskAgentInterfaces.VariableGroup>;
    deleteVariableGroup(project: string, groupId: number): Promise<void>;
    getVariableGroup(project: string, groupId: number): Promise<TaskAgentInterfaces.VariableGroup>;
    getVariableGroups(project: string, groupName?: string, actionFilter?: TaskAgentInterfaces.VariableGroupActionFilter): Promise<TaskAgentInterfaces.VariableGroup[]>;
    getVariableGroupsById(project: string, groupIds: number[]): Promise<TaskAgentInterfaces.VariableGroup[]>;
    updateVariableGroup(group: TaskAgentInterfaces.VariableGroup, project: string, groupId: number): Promise<TaskAgentInterfaces.VariableGroup>;
    acquireAccessToken(authenticationRequest: TaskAgentInterfaces.AadOauthTokenRequest): Promise<TaskAgentInterfaces.AadOauthTokenResult>;
    createAadOAuthRequest(tenantId: string, redirectUri: string, promptOption?: TaskAgentInterfaces.AadLoginPromptOption): Promise<string>;
    getVstsAadTenantId(): Promise<string>;
}
export declare class TaskAgentApiBase extends basem.ClientApiBase implements ITaskAgentApiBase {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
     * @param {TaskAgentInterfaces.TaskAgent} agent
     * @param {number} poolId
     */
    addAgent(agent: TaskAgentInterfaces.TaskAgent, poolId: number): Promise<TaskAgentInterfaces.TaskAgent>;
    /**
     * @param {number} poolId
     * @param {number} agentId
     */
    deleteAgent(poolId: number, agentId: number): Promise<void>;
    /**
     * @param {number} poolId
     * @param {number} agentId
     * @param {boolean} includeCapabilities
     * @param {boolean} includeAssignedRequest
     * @param {string[]} propertyFilters
     */
    getAgent(poolId: number, agentId: number, includeCapabilities?: boolean, includeAssignedRequest?: boolean, propertyFilters?: string[]): Promise<TaskAgentInterfaces.TaskAgent>;
    /**
     * @param {number} poolId
     * @param {string} agentName
     * @param {boolean} includeCapabilities
     * @param {boolean} includeAssignedRequest
     * @param {string[]} propertyFilters
     * @param {string[]} demands
     */
    getAgents(poolId: number, agentName?: string, includeCapabilities?: boolean, includeAssignedRequest?: boolean, propertyFilters?: string[], demands?: string[]): Promise<TaskAgentInterfaces.TaskAgent[]>;
    /**
     * @param {TaskAgentInterfaces.TaskAgent} agent
     * @param {number} poolId
     * @param {number} agentId
     */
    replaceAgent(agent: TaskAgentInterfaces.TaskAgent, poolId: number, agentId: number): Promise<TaskAgentInterfaces.TaskAgent>;
    /**
     * @param {TaskAgentInterfaces.TaskAgent} agent
     * @param {number} poolId
     * @param {number} agentId
     */
    updateAgent(agent: TaskAgentInterfaces.TaskAgent, poolId: number, agentId: number): Promise<TaskAgentInterfaces.TaskAgent>;
    /**
     */
    getAzureSubscriptions(): Promise<TaskAgentInterfaces.AzureSubscriptionQueryResult>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} deploymentGroupId
     */
    generateDeploymentGroupAccessToken(project: string, deploymentGroupId: number): Promise<string>;
    /**
     * @param {TaskAgentInterfaces.DeploymentGroup} deploymentGroup
     * @param {string} project - Project ID or project name
     */
    addDeploymentGroup(deploymentGroup: TaskAgentInterfaces.DeploymentGroup, project: string): Promise<TaskAgentInterfaces.DeploymentGroup>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} deploymentGroupId
     */
    deleteDeploymentGroup(project: string, deploymentGroupId: number): Promise<void>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} deploymentGroupId
     * @param {TaskAgentInterfaces.DeploymentGroupActionFilter} actionFilter
     * @param {TaskAgentInterfaces.DeploymentGroupExpands} expand
     */
    getDeploymentGroup(project: string, deploymentGroupId: number, actionFilter?: TaskAgentInterfaces.DeploymentGroupActionFilter, expand?: TaskAgentInterfaces.DeploymentGroupExpands): Promise<TaskAgentInterfaces.DeploymentGroup>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} name
     * @param {TaskAgentInterfaces.DeploymentGroupActionFilter} actionFilter
     * @param {TaskAgentInterfaces.DeploymentGroupExpands} expand
     */
    getDeploymentGroups(project: string, name?: string, actionFilter?: TaskAgentInterfaces.DeploymentGroupActionFilter, expand?: TaskAgentInterfaces.DeploymentGroupExpands): Promise<TaskAgentInterfaces.DeploymentGroup[]>;
    /**
     * @param {TaskAgentInterfaces.DeploymentGroup} deploymentGroup
     * @param {string} project - Project ID or project name
     * @param {number} deploymentGroupId
     */
    updateDeploymentGroup(deploymentGroup: TaskAgentInterfaces.DeploymentGroup, project: string, deploymentGroupId: number): Promise<TaskAgentInterfaces.DeploymentGroup>;
    /**
     * Proxy for a GET request defined by an 'endpoint'. The request is authorized using a service connection. The response is filtered using an XPath/Json based selector.
     *
     * @param {TaskAgentInterfaces.TaskDefinitionEndpoint} endpoint - Describes the URL to fetch.
     */
    queryEndpoint(endpoint: TaskAgentInterfaces.TaskDefinitionEndpoint): Promise<string[]>;
    /**
     * @param {string} hubName
     * @param {boolean} includeEnterpriseUsersCount
     * @param {boolean} includeHostedAgentMinutesCount
     */
    getTaskHubLicenseDetails(hubName: string, includeEnterpriseUsersCount?: boolean, includeHostedAgentMinutesCount?: boolean): Promise<TaskAgentInterfaces.TaskHubLicenseDetails>;
    /**
     * @param {TaskAgentInterfaces.TaskHubLicenseDetails} taskHubLicenseDetails
     * @param {string} hubName
     */
    updateTaskHubLicenseDetails(taskHubLicenseDetails: TaskAgentInterfaces.TaskHubLicenseDetails, hubName: string): Promise<TaskAgentInterfaces.TaskHubLicenseDetails>;
    /**
     * @param {TaskAgentInterfaces.InputValidationRequest} inputValidationRequest
     */
    validateInputs(inputValidationRequest: TaskAgentInterfaces.InputValidationRequest): Promise<TaskAgentInterfaces.InputValidationRequest>;
    /**
     * @param {number} poolId
     * @param {number} requestId
     * @param {string} lockToken
     * @param {TaskAgentInterfaces.TaskResult} result
     */
    deleteAgentRequest(poolId: number, requestId: number, lockToken: string, result?: TaskAgentInterfaces.TaskResult): Promise<void>;
    /**
     * @param {number} poolId
     * @param {number} requestId
     */
    getAgentRequest(poolId: number, requestId: number): Promise<TaskAgentInterfaces.TaskAgentJobRequest>;
    /**
     * @param {number} poolId
     * @param {number} agentId
     * @param {number} completedRequestCount
     */
    getAgentRequestsForAgent(poolId: number, agentId: number, completedRequestCount?: number): Promise<TaskAgentInterfaces.TaskAgentJobRequest[]>;
    /**
     * @param {number} poolId
     * @param {number[]} agentIds
     * @param {number} completedRequestCount
     */
    getAgentRequestsForAgents(poolId: number, agentIds?: number[], completedRequestCount?: number): Promise<TaskAgentInterfaces.TaskAgentJobRequest[]>;
    /**
     * @param {number} poolId
     * @param {string} planId
     * @param {string} jobId
     */
    getAgentRequestsForPlan(poolId: number, planId: string, jobId?: string): Promise<TaskAgentInterfaces.TaskAgentJobRequest[]>;
    /**
     * @param {TaskAgentInterfaces.TaskAgentJobRequest} request
     * @param {number} poolId
     */
    queueAgentRequest(request: TaskAgentInterfaces.TaskAgentJobRequest, poolId: number): Promise<TaskAgentInterfaces.TaskAgentJobRequest>;
    /**
     * @param {TaskAgentInterfaces.TaskAgentJobRequest} request
     * @param {number} poolId
     * @param {number} requestId
     * @param {string} lockToken
     */
    updateAgentRequest(request: TaskAgentInterfaces.TaskAgentJobRequest, poolId: number, requestId: number, lockToken: string): Promise<TaskAgentInterfaces.TaskAgentJobRequest>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} machineGroupId
     */
    generateDeploymentMachineGroupAccessToken(project: string, machineGroupId: number): Promise<string>;
    /**
     * @param {TaskAgentInterfaces.DeploymentMachineGroup} machineGroup
     * @param {string} project - Project ID or project name
     */
    addDeploymentMachineGroup(machineGroup: TaskAgentInterfaces.DeploymentMachineGroup, project: string): Promise<TaskAgentInterfaces.DeploymentMachineGroup>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} machineGroupId
     */
    deleteDeploymentMachineGroup(project: string, machineGroupId: number): Promise<void>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} machineGroupId
     * @param {TaskAgentInterfaces.MachineGroupActionFilter} actionFilter
     */
    getDeploymentMachineGroup(project: string, machineGroupId: number, actionFilter?: TaskAgentInterfaces.MachineGroupActionFilter): Promise<TaskAgentInterfaces.DeploymentMachineGroup>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} machineGroupName
     * @param {TaskAgentInterfaces.MachineGroupActionFilter} actionFilter
     */
    getDeploymentMachineGroups(project: string, machineGroupName?: string, actionFilter?: TaskAgentInterfaces.MachineGroupActionFilter): Promise<TaskAgentInterfaces.DeploymentMachineGroup[]>;
    /**
     * @param {TaskAgentInterfaces.DeploymentMachineGroup} machineGroup
     * @param {string} project - Project ID or project name
     * @param {number} machineGroupId
     */
    updateDeploymentMachineGroup(machineGroup: TaskAgentInterfaces.DeploymentMachineGroup, project: string, machineGroupId: number): Promise<TaskAgentInterfaces.DeploymentMachineGroup>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} machineGroupId
     * @param {string[]} tagFilters
     */
    getDeploymentMachineGroupMachines(project: string, machineGroupId: number, tagFilters?: string[]): Promise<TaskAgentInterfaces.DeploymentMachine[]>;
    /**
     * @param {TaskAgentInterfaces.DeploymentMachine[]} deploymentMachines
     * @param {string} project - Project ID or project name
     * @param {number} machineGroupId
     */
    updateDeploymentMachineGroupMachines(deploymentMachines: TaskAgentInterfaces.DeploymentMachine[], project: string, machineGroupId: number): Promise<TaskAgentInterfaces.DeploymentMachine[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} deploymentGroupId
     * @param {string[]} tags
     */
    getDeploymentMachines(project: string, deploymentGroupId: number, tags?: string[]): Promise<TaskAgentInterfaces.DeploymentMachine[]>;
    /**
     * @param {TaskAgentInterfaces.DeploymentMachine[]} deploymentMachines
     * @param {string} project - Project ID or project name
     * @param {number} deploymentGroupId
     */
    updateDeploymentMachines(deploymentMachines: TaskAgentInterfaces.DeploymentMachine[], project: string, deploymentGroupId: number): Promise<TaskAgentInterfaces.DeploymentMachine[]>;
    /**
     * @param {TaskAgentInterfaces.TaskAgentPoolMaintenanceDefinition} definition
     * @param {number} poolId
     */
    createAgentPoolMaintenanceDefinition(definition: TaskAgentInterfaces.TaskAgentPoolMaintenanceDefinition, poolId: number): Promise<TaskAgentInterfaces.TaskAgentPoolMaintenanceDefinition>;
    /**
     * @param {number} poolId
     * @param {number} definitionId
     */
    deleteAgentPoolMaintenanceDefinition(poolId: number, definitionId: number): Promise<void>;
    /**
     * @param {number} poolId
     * @param {number} definitionId
     */
    getAgentPoolMaintenanceDefinition(poolId: number, definitionId: number): Promise<TaskAgentInterfaces.TaskAgentPoolMaintenanceDefinition>;
    /**
     * @param {number} poolId
     */
    getAgentPoolMaintenanceDefinitions(poolId: number): Promise<TaskAgentInterfaces.TaskAgentPoolMaintenanceDefinition[]>;
    /**
     * @param {TaskAgentInterfaces.TaskAgentPoolMaintenanceDefinition} definition
     * @param {number} poolId
     * @param {number} definitionId
     */
    updateAgentPoolMaintenanceDefinition(definition: TaskAgentInterfaces.TaskAgentPoolMaintenanceDefinition, poolId: number, definitionId: number): Promise<TaskAgentInterfaces.TaskAgentPoolMaintenanceDefinition>;
    /**
     * @param {number} poolId
     * @param {number} jobId
     */
    deleteAgentPoolMaintenanceJob(poolId: number, jobId: number): Promise<void>;
    /**
     * @param {number} poolId
     * @param {number} jobId
     */
    getAgentPoolMaintenanceJob(poolId: number, jobId: number): Promise<TaskAgentInterfaces.TaskAgentPoolMaintenanceJob>;
    /**
     * @param {number} poolId
     * @param {number} jobId
     */
    getAgentPoolMaintenanceJobLogs(poolId: number, jobId: number): Promise<NodeJS.ReadableStream>;
    /**
     * @param {number} poolId
     * @param {number} definitionId
     */
    getAgentPoolMaintenanceJobs(poolId: number, definitionId?: number): Promise<TaskAgentInterfaces.TaskAgentPoolMaintenanceJob[]>;
    /**
     * @param {TaskAgentInterfaces.TaskAgentPoolMaintenanceJob} job
     * @param {number} poolId
     */
    queueAgentPoolMaintenanceJob(job: TaskAgentInterfaces.TaskAgentPoolMaintenanceJob, poolId: number): Promise<TaskAgentInterfaces.TaskAgentPoolMaintenanceJob>;
    /**
     * @param {TaskAgentInterfaces.TaskAgentPoolMaintenanceJob} job
     * @param {number} poolId
     * @param {number} jobId
     */
    updateAgentPoolMaintenanceJob(job: TaskAgentInterfaces.TaskAgentPoolMaintenanceJob, poolId: number, jobId: number): Promise<TaskAgentInterfaces.TaskAgentPoolMaintenanceJob>;
    /**
     * @param {number} poolId
     * @param {number} messageId
     * @param {string} sessionId
     */
    deleteMessage(poolId: number, messageId: number, sessionId: string): Promise<void>;
    /**
     * @param {number} poolId
     * @param {string} sessionId
     * @param {number} lastMessageId
     */
    getMessage(poolId: number, sessionId: string, lastMessageId?: number): Promise<TaskAgentInterfaces.TaskAgentMessage>;
    /**
     * @param {number} poolId
     * @param {number} agentId
     */
    refreshAgent(poolId: number, agentId: number): Promise<void>;
    /**
     * @param {number} poolId
     */
    refreshAgents(poolId: number): Promise<void>;
    /**
     * @param {TaskAgentInterfaces.TaskAgentMessage} message
     * @param {number} poolId
     * @param {number} requestId
     */
    sendMessage(message: TaskAgentInterfaces.TaskAgentMessage, poolId: number, requestId: number): Promise<void>;
    /**
     * @param {string} packageType
     * @param {string} platform
     * @param {string} version
     */
    getPackage(packageType: string, platform: string, version: string): Promise<TaskAgentInterfaces.PackageMetadata>;
    /**
     * @param {string} packageType
     * @param {string} platform
     * @param {number} top
     */
    getPackages(packageType?: string, platform?: string, top?: number): Promise<TaskAgentInterfaces.PackageMetadata[]>;
    /**
     * @param {number} poolId
     */
    getAgentPoolRoles(poolId?: number): Promise<VSSInterfaces.IdentityRef[]>;
    /**
     * @param {TaskAgentInterfaces.TaskAgentPool} pool
     */
    addAgentPool(pool: TaskAgentInterfaces.TaskAgentPool): Promise<TaskAgentInterfaces.TaskAgentPool>;
    /**
     * @param {number} poolId
     */
    deleteAgentPool(poolId: number): Promise<void>;
    /**
     * @param {number} poolId
     * @param {string[]} properties
     * @param {TaskAgentInterfaces.TaskAgentPoolActionFilter} actionFilter
     */
    getAgentPool(poolId: number, properties?: string[], actionFilter?: TaskAgentInterfaces.TaskAgentPoolActionFilter): Promise<TaskAgentInterfaces.TaskAgentPool>;
    /**
     * @param {string} poolName
     * @param {string[]} properties
     * @param {TaskAgentInterfaces.TaskAgentPoolType} poolType
     * @param {TaskAgentInterfaces.TaskAgentPoolActionFilter} actionFilter
     */
    getAgentPools(poolName?: string, properties?: string[], poolType?: TaskAgentInterfaces.TaskAgentPoolType, actionFilter?: TaskAgentInterfaces.TaskAgentPoolActionFilter): Promise<TaskAgentInterfaces.TaskAgentPool[]>;
    /**
     * @param {TaskAgentInterfaces.TaskAgentPool} pool
     * @param {number} poolId
     */
    updateAgentPool(pool: TaskAgentInterfaces.TaskAgentPool, poolId: number): Promise<TaskAgentInterfaces.TaskAgentPool>;
    /**
     * @param {number} queueId
     */
    getAgentQueueRoles(queueId?: number): Promise<VSSInterfaces.IdentityRef[]>;
    /**
     * @param {TaskAgentInterfaces.TaskAgentQueue} queue
     * @param {string} project - Project ID or project name
     */
    addAgentQueue(queue: TaskAgentInterfaces.TaskAgentQueue, project?: string): Promise<TaskAgentInterfaces.TaskAgentQueue>;
    /**
     * @param {string} project - Project ID or project name
     */
    createTeamProject(project?: string): Promise<void>;
    /**
     * @param {number} queueId
     * @param {string} project - Project ID or project name
     */
    deleteAgentQueue(queueId: number, project?: string): Promise<void>;
    /**
     * @param {number} queueId
     * @param {string} project - Project ID or project name
     * @param {TaskAgentInterfaces.TaskAgentQueueActionFilter} actionFilter
     */
    getAgentQueue(queueId: number, project?: string, actionFilter?: TaskAgentInterfaces.TaskAgentQueueActionFilter): Promise<TaskAgentInterfaces.TaskAgentQueue>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} queueName
     * @param {TaskAgentInterfaces.TaskAgentQueueActionFilter} actionFilter
     */
    getAgentQueues(project?: string, queueName?: string, actionFilter?: TaskAgentInterfaces.TaskAgentQueueActionFilter): Promise<TaskAgentInterfaces.TaskAgentQueue[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} taskGroupId
     */
    getTaskGroupHistory(project: string, taskGroupId: string): Promise<TaskAgentInterfaces.TaskGroupRevision[]>;
    /**
     * Delete a secure file
     *
     * @param {string} project - Project ID or project name
     * @param {string} secureFileId - The unique secure file Id
     */
    deleteSecureFile(project: string, secureFileId: string): Promise<void>;
    /**
     * Download a secure file by Id
     *
     * @param {string} project - Project ID or project name
     * @param {string} secureFileId - The unique secure file Id
     * @param {string} ticket - A valid download ticket
     * @param {boolean} download - If download is true, the file is sent as attachement in the response body. If download is false, the response body contains the file stream.
     */
    downloadSecureFile(project: string, secureFileId: string, ticket: string, download?: boolean): Promise<NodeJS.ReadableStream>;
    /**
     * Get a secure file
     *
     * @param {string} project - Project ID or project name
     * @param {string} secureFileId - The unique secure file Id
     * @param {boolean} includeDownloadTicket - If includeDownloadTicket is true and the caller has permissions, a download ticket is included in the response.
     */
    getSecureFile(project: string, secureFileId: string, includeDownloadTicket?: boolean): Promise<TaskAgentInterfaces.SecureFile>;
    /**
     * Get secure files
     *
     * @param {string} project - Project ID or project name
     * @param {string} namePattern - Name of the secure file to match. Can include wildcards to match multiple files.
     * @param {boolean} includeDownloadTickets - If includeDownloadTickets is true and the caller has permissions, a download ticket for each secure file is included in the response.
     * @param {TaskAgentInterfaces.SecureFileActionFilter} actionFilter - Filter by secure file permissions for View, Manage or Use action. Defaults to View.
     */
    getSecureFiles(project: string, namePattern?: string, includeDownloadTickets?: boolean, actionFilter?: TaskAgentInterfaces.SecureFileActionFilter): Promise<TaskAgentInterfaces.SecureFile[]>;
    /**
     * Get secure files
     *
     * @param {string} project - Project ID or project name
     * @param {string[]} secureFileIds - A list of secure file Ids
     * @param {boolean} includeDownloadTickets - If includeDownloadTickets is true and the caller has permissions, a download ticket for each secure file is included in the response.
     */
    getSecureFilesByIds(project: string, secureFileIds: string[], includeDownloadTickets?: boolean): Promise<TaskAgentInterfaces.SecureFile[]>;
    /**
     * Query secure files using a name pattern and a condition on file properties.
     *
     * @param {string} condition - The main condition syntax is described [here](https://go.microsoft.com/fwlink/?linkid=842996). Use the *property('property-name')* function to access the value of the specified property of a secure file. It returns null if the property is not set. E.g. ``` and( eq( property('devices'), '2' ), in( property('provisioning profile type'), 'ad hoc', 'development' ) ) ```
     * @param {string} project - Project ID or project name
     * @param {string} namePattern - Name of the secure file to match. Can include wildcards to match multiple files.
     */
    querySecureFilesByProperties(condition: string, project: string, namePattern?: string): Promise<TaskAgentInterfaces.SecureFile[]>;
    /**
     * Update the name or properties of an existing secure file
     *
     * @param {TaskAgentInterfaces.SecureFile} secureFile - The secure file with updated name and/or properties
     * @param {string} project - Project ID or project name
     * @param {string} secureFileId - The unique secure file Id
     */
    updateSecureFile(secureFile: TaskAgentInterfaces.SecureFile, project: string, secureFileId: string): Promise<TaskAgentInterfaces.SecureFile>;
    /**
     * Update properties and/or names of a set of secure files. Files are identified by their IDs. Properties provided override the existing one entirely, i.e. do not merge.
     *
     * @param {TaskAgentInterfaces.SecureFile[]} secureFiles - A list of secure file objects. Only three field must be populated Id, Name, and Properties. The rest of fields in the object are ignored.
     * @param {string} project - Project ID or project name
     */
    updateSecureFiles(secureFiles: TaskAgentInterfaces.SecureFile[], project: string): Promise<TaskAgentInterfaces.SecureFile[]>;
    /**
     * Upload a secure file, include the file stream in the request body
     *
     * @param {NodeJS.ReadableStream} contentStream - Content to upload
     * @param {string} project - Project ID or project name
     * @param {string} name - Name of the file to upload
     */
    uploadSecureFile(customHeaders: any, contentStream: NodeJS.ReadableStream, project: string, name: string): Promise<TaskAgentInterfaces.SecureFile>;
    /**
     * @param {TaskAgentInterfaces.ServiceEndpointRequest} serviceEndpointRequest
     * @param {string} project - Project ID or project name
     * @param {string} endpointId
     */
    executeServiceEndpointRequest(serviceEndpointRequest: TaskAgentInterfaces.ServiceEndpointRequest, project: string, endpointId: string): Promise<TaskAgentInterfaces.ServiceEndpointRequestResult>;
    /**
     * Proxy for a GET request defined by an service endpoint. The request is authorized using a data source in service endpoint. The response is filtered using an XPath/Json based selector.
     *
     * @param {TaskAgentInterfaces.DataSourceBinding} binding - Describes the data source to fetch.
     * @param {string} project - Project ID or project name
     */
    queryServiceEndpoint(binding: TaskAgentInterfaces.DataSourceBinding, project: string): Promise<string[]>;
    /**
     * @param {TaskAgentInterfaces.ServiceEndpoint} endpoint
     * @param {string} project - Project ID or project name
     */
    createServiceEndpoint(endpoint: TaskAgentInterfaces.ServiceEndpoint, project: string): Promise<TaskAgentInterfaces.ServiceEndpoint>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} endpointId
     */
    deleteServiceEndpoint(project: string, endpointId: string): Promise<void>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} endpointId
     */
    getServiceEndpointDetails(project: string, endpointId: string): Promise<TaskAgentInterfaces.ServiceEndpoint>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} type
     * @param {string[]} authSchemes
     * @param {string[]} endpointIds
     * @param {boolean} includeFailed
     */
    getServiceEndpoints(project: string, type?: string, authSchemes?: string[], endpointIds?: string[], includeFailed?: boolean): Promise<TaskAgentInterfaces.ServiceEndpoint[]>;
    /**
     * @param {TaskAgentInterfaces.ServiceEndpoint} endpoint
     * @param {string} project - Project ID or project name
     * @param {string} endpointId
     */
    updateServiceEndpoint(endpoint: TaskAgentInterfaces.ServiceEndpoint, project: string, endpointId: string): Promise<TaskAgentInterfaces.ServiceEndpoint>;
    /**
     * @param {TaskAgentInterfaces.ServiceEndpoint[]} endpoints
     * @param {string} project - Project ID or project name
     */
    updateServiceEndpoints(endpoints: TaskAgentInterfaces.ServiceEndpoint[], project: string): Promise<TaskAgentInterfaces.ServiceEndpoint[]>;
    /**
     * @param {string} type
     * @param {string} scheme
     */
    getServiceEndpointTypes(type?: string, scheme?: string): Promise<TaskAgentInterfaces.ServiceEndpointType[]>;
    /**
     * @param {TaskAgentInterfaces.TaskAgentSession} session
     * @param {number} poolId
     */
    createAgentSession(session: TaskAgentInterfaces.TaskAgentSession, poolId: number): Promise<TaskAgentInterfaces.TaskAgentSession>;
    /**
     * @param {number} poolId
     * @param {string} sessionId
     */
    deleteAgentSession(poolId: number, sessionId: string): Promise<void>;
    /**
     * @param {TaskAgentInterfaces.TaskGroup} taskGroup
     * @param {string} project - Project ID or project name
     */
    addTaskGroup(taskGroup: TaskAgentInterfaces.TaskGroup, project: string): Promise<TaskAgentInterfaces.TaskGroup>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} taskGroupId
     */
    deleteTaskGroup(project: string, taskGroupId: string): Promise<void>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} taskGroupId
     * @param {number} revision
     */
    getTaskGroupRevision(project: string, taskGroupId: string, revision: number): Promise<NodeJS.ReadableStream>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} taskGroupId
     * @param {boolean} expanded
     */
    getTaskGroups(project: string, taskGroupId?: string, expanded?: boolean): Promise<TaskAgentInterfaces.TaskGroup[]>;
    /**
     * @param {TaskAgentInterfaces.TaskGroup} taskGroup
     * @param {string} project - Project ID or project name
     */
    updateTaskGroup(taskGroup: TaskAgentInterfaces.TaskGroup, project: string): Promise<TaskAgentInterfaces.TaskGroup>;
    /**
     * @param {string} taskId
     */
    deleteTaskDefinition(taskId: string): Promise<void>;
    /**
     * @param {string} taskId
     * @param {string} versionString
     * @param {string[]} visibility
     * @param {boolean} scopeLocal
     */
    getTaskContentZip(taskId: string, versionString: string, visibility?: string[], scopeLocal?: boolean): Promise<NodeJS.ReadableStream>;
    /**
     * @param {string} taskId
     * @param {string} versionString
     * @param {string[]} visibility
     * @param {boolean} scopeLocal
     */
    getTaskDefinition(taskId: string, versionString: string, visibility?: string[], scopeLocal?: boolean): Promise<TaskAgentInterfaces.TaskDefinition>;
    /**
     * @param {string} taskId
     * @param {string[]} visibility
     * @param {boolean} scopeLocal
     */
    getTaskDefinitions(taskId?: string, visibility?: string[], scopeLocal?: boolean): Promise<TaskAgentInterfaces.TaskDefinition[]>;
    /**
     * @param {number} poolId
     * @param {number} agentId
     * @param {string} currentState
     */
    updateAgentUpdateState(poolId: number, agentId: number, currentState: string): Promise<TaskAgentInterfaces.TaskAgent>;
    /**
     * @param {{ [key: string] : string; }} userCapabilities
     * @param {number} poolId
     * @param {number} agentId
     */
    updateAgentUserCapabilities(userCapabilities: {
        [key: string]: string;
    }, poolId: number, agentId: number): Promise<TaskAgentInterfaces.TaskAgent>;
    /**
     * @param {TaskAgentInterfaces.VariableGroup} group
     * @param {string} project - Project ID or project name
     */
    addVariableGroup(group: TaskAgentInterfaces.VariableGroup, project: string): Promise<TaskAgentInterfaces.VariableGroup>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} groupId
     */
    deleteVariableGroup(project: string, groupId: number): Promise<void>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} groupId
     */
    getVariableGroup(project: string, groupId: number): Promise<TaskAgentInterfaces.VariableGroup>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} groupName
     * @param {TaskAgentInterfaces.VariableGroupActionFilter} actionFilter
     */
    getVariableGroups(project: string, groupName?: string, actionFilter?: TaskAgentInterfaces.VariableGroupActionFilter): Promise<TaskAgentInterfaces.VariableGroup[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number[]} groupIds
     */
    getVariableGroupsById(project: string, groupIds: number[]): Promise<TaskAgentInterfaces.VariableGroup[]>;
    /**
     * @param {TaskAgentInterfaces.VariableGroup} group
     * @param {string} project - Project ID or project name
     * @param {number} groupId
     */
    updateVariableGroup(group: TaskAgentInterfaces.VariableGroup, project: string, groupId: number): Promise<TaskAgentInterfaces.VariableGroup>;
    /**
     * @param {TaskAgentInterfaces.AadOauthTokenRequest} authenticationRequest
     */
    acquireAccessToken(authenticationRequest: TaskAgentInterfaces.AadOauthTokenRequest): Promise<TaskAgentInterfaces.AadOauthTokenResult>;
    /**
     * @param {string} tenantId
     * @param {string} redirectUri
     * @param {TaskAgentInterfaces.AadLoginPromptOption} promptOption
     */
    createAadOAuthRequest(tenantId: string, redirectUri: string, promptOption?: TaskAgentInterfaces.AadLoginPromptOption): Promise<string>;
    /**
     */
    getVstsAadTenantId(): Promise<string>;
}
