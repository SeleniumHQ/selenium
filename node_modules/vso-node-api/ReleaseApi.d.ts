/// <reference types="node" />
import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import FormInputInterfaces = require("./interfaces/common/FormInputInterfaces");
import ReleaseInterfaces = require("./interfaces/ReleaseInterfaces");
export interface IReleaseApi extends basem.ClientApiBase {
    getAgentArtifactDefinitions(project: string, releaseId: number): Promise<ReleaseInterfaces.AgentArtifactDefinition[]>;
    getApprovals(project: string, assignedToFilter?: string, statusFilter?: ReleaseInterfaces.ApprovalStatus, releaseIdsFilter?: number[], typeFilter?: ReleaseInterfaces.ApprovalType, top?: number, continuationToken?: number, queryOrder?: ReleaseInterfaces.ReleaseQueryOrder, includeMyGroupApprovals?: boolean): Promise<ReleaseInterfaces.ReleaseApproval[]>;
    getApprovalHistory(project: string, approvalStepId: number): Promise<ReleaseInterfaces.ReleaseApproval>;
    getApproval(project: string, approvalId: number, includeHistory?: boolean): Promise<ReleaseInterfaces.ReleaseApproval>;
    updateReleaseApproval(approval: ReleaseInterfaces.ReleaseApproval, project: string, approvalId: number): Promise<ReleaseInterfaces.ReleaseApproval>;
    updateReleaseApprovals(approvals: ReleaseInterfaces.ReleaseApproval[], project: string): Promise<ReleaseInterfaces.ReleaseApproval[]>;
    getTaskAttachmentContent(project: string, releaseId: number, environmentId: number, attemptId: number, timelineId: string, recordId: string, type: string, name: string): Promise<NodeJS.ReadableStream>;
    getTaskAttachments(project: string, releaseId: number, environmentId: number, attemptId: number, timelineId: string, type: string): Promise<ReleaseInterfaces.ReleaseTaskAttachment[]>;
    getAutoTriggerIssues(artifactType: string, sourceId: string, artifactVersionId: string, project?: string): Promise<ReleaseInterfaces.AutoTriggerIssue[]>;
    getDeploymentBadge(projectId: string, releaseDefinitionId: number, environmentId: number, branchName?: string): Promise<string>;
    getReleaseChanges(project: string, releaseId: number, baseReleaseId?: number, top?: number): Promise<ReleaseInterfaces.Change[]>;
    getDefinitionEnvironments(project: string, taskGroupId?: string, propertyFilters?: string[]): Promise<ReleaseInterfaces.DefinitionEnvironmentReference[]>;
    createReleaseDefinition(releaseDefinition: ReleaseInterfaces.ReleaseDefinition, project: string): Promise<ReleaseInterfaces.ReleaseDefinition>;
    deleteReleaseDefinition(project: string, definitionId: number, comment?: string, forceDelete?: boolean): Promise<void>;
    getReleaseDefinition(project: string, definitionId: number, propertyFilters?: string[]): Promise<ReleaseInterfaces.ReleaseDefinition>;
    getReleaseDefinitionRevision(project: string, definitionId: number, revision: number): Promise<NodeJS.ReadableStream>;
    getReleaseDefinitions(project: string, searchText?: string, expand?: ReleaseInterfaces.ReleaseDefinitionExpands, artifactType?: string, artifactSourceId?: string, top?: number, continuationToken?: string, queryOrder?: ReleaseInterfaces.ReleaseDefinitionQueryOrder, path?: string, isExactNameMatch?: boolean, tagFilter?: string[], propertyFilters?: string[], definitionIdFilter?: string[], isDeleted?: boolean): Promise<ReleaseInterfaces.ReleaseDefinition[]>;
    undeleteReleaseDefinition(releaseDefinitionUndeleteParameter: ReleaseInterfaces.ReleaseDefinitionUndeleteParameter, project: string, definitionId: number): Promise<ReleaseInterfaces.ReleaseDefinition>;
    updateReleaseDefinition(releaseDefinition: ReleaseInterfaces.ReleaseDefinition, project: string): Promise<ReleaseInterfaces.ReleaseDefinition>;
    getDeployments(project: string, definitionId?: number, definitionEnvironmentId?: number, createdBy?: string, minModifiedTime?: Date, maxModifiedTime?: Date, deploymentStatus?: ReleaseInterfaces.DeploymentStatus, operationStatus?: ReleaseInterfaces.DeploymentOperationStatus, latestAttemptsOnly?: boolean, queryOrder?: ReleaseInterfaces.ReleaseQueryOrder, top?: number, continuationToken?: number, createdFor?: string): Promise<ReleaseInterfaces.Deployment[]>;
    getDeploymentsForMultipleEnvironments(queryParameters: ReleaseInterfaces.DeploymentQueryParameters, project: string): Promise<ReleaseInterfaces.Deployment[]>;
    getReleaseEnvironment(project: string, releaseId: number, environmentId: number): Promise<ReleaseInterfaces.ReleaseEnvironment>;
    updateReleaseEnvironment(environmentUpdateData: ReleaseInterfaces.ReleaseEnvironmentUpdateMetadata, project: string, releaseId: number, environmentId: number): Promise<ReleaseInterfaces.ReleaseEnvironment>;
    createDefinitionEnvironmentTemplate(template: ReleaseInterfaces.ReleaseDefinitionEnvironmentTemplate, project: string): Promise<ReleaseInterfaces.ReleaseDefinitionEnvironmentTemplate>;
    deleteDefinitionEnvironmentTemplate(project: string, templateId: string): Promise<void>;
    getDefinitionEnvironmentTemplate(project: string, templateId: string): Promise<ReleaseInterfaces.ReleaseDefinitionEnvironmentTemplate>;
    listDefinitionEnvironmentTemplates(project: string, isDeleted?: boolean): Promise<ReleaseInterfaces.ReleaseDefinitionEnvironmentTemplate[]>;
    undeleteReleaseDefinitionEnvironmentTemplate(project: string, templateId: string): Promise<ReleaseInterfaces.ReleaseDefinitionEnvironmentTemplate>;
    createFavorites(favoriteItems: ReleaseInterfaces.FavoriteItem[], project: string, scope: string, identityId?: string): Promise<ReleaseInterfaces.FavoriteItem[]>;
    deleteFavorites(project: string, scope: string, identityId?: string, favoriteItemIds?: string): Promise<void>;
    getFavorites(project: string, scope: string, identityId?: string): Promise<ReleaseInterfaces.FavoriteItem[]>;
    createFolder(folder: ReleaseInterfaces.Folder, project: string, path: string): Promise<ReleaseInterfaces.Folder>;
    deleteFolder(project: string, path: string): Promise<void>;
    getFolders(project: string, path?: string, queryOrder?: ReleaseInterfaces.FolderPathQueryOrder): Promise<ReleaseInterfaces.Folder[]>;
    updateFolder(folder: ReleaseInterfaces.Folder, project: string, path: string): Promise<ReleaseInterfaces.Folder>;
    getReleaseHistory(project: string, releaseId: number): Promise<ReleaseInterfaces.ReleaseRevision[]>;
    getInputValues(query: FormInputInterfaces.InputValuesQuery, project: string): Promise<FormInputInterfaces.InputValuesQuery>;
    getIssues(project: string, buildId: number, sourceId?: string): Promise<ReleaseInterfaces.AutoTriggerIssue[]>;
    getGateLog(project: string, releaseId: number, environmentId: number, gateId: number, taskId: number): Promise<NodeJS.ReadableStream>;
    getLogs(project: string, releaseId: number): Promise<NodeJS.ReadableStream>;
    getLog(project: string, releaseId: number, environmentId: number, taskId: number, attemptId?: number): Promise<NodeJS.ReadableStream>;
    getTaskLog2(project: string, releaseId: number, environmentId: number, attemptId: number, timelineId: string, taskId: number, startLine?: number, endLine?: number): Promise<NodeJS.ReadableStream>;
    getTaskLog(project: string, releaseId: number, environmentId: number, releaseDeployPhaseId: number, taskId: number, startLine?: number, endLine?: number): Promise<NodeJS.ReadableStream>;
    getManualIntervention(project: string, releaseId: number, manualInterventionId: number): Promise<ReleaseInterfaces.ManualIntervention>;
    getManualInterventions(project: string, releaseId: number): Promise<ReleaseInterfaces.ManualIntervention[]>;
    updateManualIntervention(manualInterventionUpdateMetadata: ReleaseInterfaces.ManualInterventionUpdateMetadata, project: string, releaseId: number, manualInterventionId: number): Promise<ReleaseInterfaces.ManualIntervention>;
    getMetrics(project: string, minMetricsTime?: Date): Promise<ReleaseInterfaces.Metric[]>;
    getReleaseProjects(artifactType: string, artifactSourceId: string): Promise<ReleaseInterfaces.ProjectReference[]>;
    getReleases(project?: string, definitionId?: number, definitionEnvironmentId?: number, searchText?: string, createdBy?: string, statusFilter?: ReleaseInterfaces.ReleaseStatus, environmentStatusFilter?: number, minCreatedTime?: Date, maxCreatedTime?: Date, queryOrder?: ReleaseInterfaces.ReleaseQueryOrder, top?: number, continuationToken?: number, expand?: ReleaseInterfaces.ReleaseExpands, artifactTypeId?: string, sourceId?: string, artifactVersionId?: string, sourceBranchFilter?: string, isDeleted?: boolean, tagFilter?: string[], propertyFilters?: string[], releaseIdFilter?: number[]): Promise<ReleaseInterfaces.Release[]>;
    createRelease(releaseStartMetadata: ReleaseInterfaces.ReleaseStartMetadata, project: string): Promise<ReleaseInterfaces.Release>;
    deleteRelease(project: string, releaseId: number, comment?: string): Promise<void>;
    getRelease(project: string, releaseId: number, approvalFilters?: ReleaseInterfaces.ApprovalFilters, propertyFilters?: string[]): Promise<ReleaseInterfaces.Release>;
    getReleaseDefinitionSummary(project: string, definitionId: number, releaseCount: number, includeArtifact?: boolean, definitionEnvironmentIdsFilter?: number[]): Promise<ReleaseInterfaces.ReleaseDefinitionSummary>;
    getReleaseRevision(project: string, releaseId: number, definitionSnapshotRevision: number): Promise<NodeJS.ReadableStream>;
    undeleteRelease(project: string, releaseId: number, comment: string): Promise<void>;
    updateRelease(release: ReleaseInterfaces.Release, project: string, releaseId: number): Promise<ReleaseInterfaces.Release>;
    updateReleaseResource(releaseUpdateMetadata: ReleaseInterfaces.ReleaseUpdateMetadata, project: string, releaseId: number): Promise<ReleaseInterfaces.Release>;
    getReleaseSettings(project: string): Promise<ReleaseInterfaces.ReleaseSettings>;
    updateReleaseSettings(releaseSettings: ReleaseInterfaces.ReleaseSettings, project: string): Promise<ReleaseInterfaces.ReleaseSettings>;
    getDefinitionRevision(project: string, definitionId: number, revision: number): Promise<NodeJS.ReadableStream>;
    getReleaseDefinitionHistory(project: string, definitionId: number): Promise<ReleaseInterfaces.ReleaseDefinitionRevision[]>;
    getSummaryMailSections(project: string, releaseId: number): Promise<ReleaseInterfaces.SummaryMailSection[]>;
    sendSummaryMail(mailMessage: ReleaseInterfaces.MailMessage, project: string, releaseId: number): Promise<void>;
    getSourceBranches(project: string, definitionId: number): Promise<string[]>;
    addDefinitionTag(project: string, releaseDefinitionId: number, tag: string): Promise<string[]>;
    addDefinitionTags(tags: string[], project: string, releaseDefinitionId: number): Promise<string[]>;
    deleteDefinitionTag(project: string, releaseDefinitionId: number, tag: string): Promise<string[]>;
    getDefinitionTags(project: string, releaseDefinitionId: number): Promise<string[]>;
    addReleaseTag(project: string, releaseId: number, tag: string): Promise<string[]>;
    addReleaseTags(tags: string[], project: string, releaseId: number): Promise<string[]>;
    deleteReleaseTag(project: string, releaseId: number, tag: string): Promise<string[]>;
    getReleaseTags(project: string, releaseId: number): Promise<string[]>;
    getTags(project: string): Promise<string[]>;
    getTasksForTaskGroup(project: string, releaseId: number, environmentId: number, releaseDeployPhaseId: number): Promise<ReleaseInterfaces.ReleaseTask[]>;
    getTasks2(project: string, releaseId: number, environmentId: number, attemptId: number, timelineId: string): Promise<ReleaseInterfaces.ReleaseTask[]>;
    getTasks(project: string, releaseId: number, environmentId: number, attemptId?: number): Promise<ReleaseInterfaces.ReleaseTask[]>;
    getArtifactTypeDefinitions(project: string): Promise<ReleaseInterfaces.ArtifactTypeDefinition[]>;
    getArtifactVersions(project: string, releaseDefinitionId: number): Promise<ReleaseInterfaces.ArtifactVersionQueryResult>;
    getArtifactVersionsForSources(artifacts: ReleaseInterfaces.Artifact[], project: string): Promise<ReleaseInterfaces.ArtifactVersionQueryResult>;
    getReleaseWorkItemsRefs(project: string, releaseId: number, baseReleaseId?: number, top?: number): Promise<ReleaseInterfaces.ReleaseWorkItemRef[]>;
}
export declare class ReleaseApi extends basem.ClientApiBase implements IReleaseApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    static readonly RESOURCE_AREA_ID: string;
    /**
     * Returns the artifact details that automation agent requires
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     */
    getAgentArtifactDefinitions(project: string, releaseId: number): Promise<ReleaseInterfaces.AgentArtifactDefinition[]>;
    /**
     * Get a list of approvals
     *
     * @param {string} project - Project ID or project name
     * @param {string} assignedToFilter - Approvals assigned to this user.
     * @param {ReleaseInterfaces.ApprovalStatus} statusFilter - Approvals with this status. Default is 'pending'.
     * @param {number[]} releaseIdsFilter - Approvals for release id(s) mentioned in the filter. Multiple releases can be mentioned by separating them with ',' e.g. releaseIdsFilter=1,2,3,4.
     * @param {ReleaseInterfaces.ApprovalType} typeFilter - Approval with this type.
     * @param {number} top - Number of approvals to get. Default is 50.
     * @param {number} continuationToken - Gets the approvals after the continuation token provided.
     * @param {ReleaseInterfaces.ReleaseQueryOrder} queryOrder - Gets the results in the defined order of created approvals. Default is 'descending'.
     * @param {boolean} includeMyGroupApprovals - 'true' to include my group approvals. Default is 'false'.
     */
    getApprovals(project: string, assignedToFilter?: string, statusFilter?: ReleaseInterfaces.ApprovalStatus, releaseIdsFilter?: number[], typeFilter?: ReleaseInterfaces.ApprovalType, top?: number, continuationToken?: number, queryOrder?: ReleaseInterfaces.ReleaseQueryOrder, includeMyGroupApprovals?: boolean): Promise<ReleaseInterfaces.ReleaseApproval[]>;
    /**
     * Get approval history.
     *
     * @param {string} project - Project ID or project name
     * @param {number} approvalStepId - Id of the approval.
     */
    getApprovalHistory(project: string, approvalStepId: number): Promise<ReleaseInterfaces.ReleaseApproval>;
    /**
     * Get an approval.
     *
     * @param {string} project - Project ID or project name
     * @param {number} approvalId - Id of the approval.
     * @param {boolean} includeHistory - 'true' to include history of the approval. Default is 'false'.
     */
    getApproval(project: string, approvalId: number, includeHistory?: boolean): Promise<ReleaseInterfaces.ReleaseApproval>;
    /**
     * Update status of an approval
     *
     * @param {ReleaseInterfaces.ReleaseApproval} approval - ReleaseApproval object having status, approver and comments.
     * @param {string} project - Project ID or project name
     * @param {number} approvalId - Id of the approval.
     */
    updateReleaseApproval(approval: ReleaseInterfaces.ReleaseApproval, project: string, approvalId: number): Promise<ReleaseInterfaces.ReleaseApproval>;
    /**
     * @param {ReleaseInterfaces.ReleaseApproval[]} approvals
     * @param {string} project - Project ID or project name
     */
    updateReleaseApprovals(approvals: ReleaseInterfaces.ReleaseApproval[], project: string): Promise<ReleaseInterfaces.ReleaseApproval[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} environmentId
     * @param {number} attemptId
     * @param {string} timelineId
     * @param {string} recordId
     * @param {string} type
     * @param {string} name
     */
    getTaskAttachmentContent(project: string, releaseId: number, environmentId: number, attemptId: number, timelineId: string, recordId: string, type: string, name: string): Promise<NodeJS.ReadableStream>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} environmentId
     * @param {number} attemptId
     * @param {string} timelineId
     * @param {string} type
     */
    getTaskAttachments(project: string, releaseId: number, environmentId: number, attemptId: number, timelineId: string, type: string): Promise<ReleaseInterfaces.ReleaseTaskAttachment[]>;
    /**
     * @param {string} artifactType
     * @param {string} sourceId
     * @param {string} artifactVersionId
     * @param {string} project - Project ID or project name
     */
    getAutoTriggerIssues(artifactType: string, sourceId: string, artifactVersionId: string, project?: string): Promise<ReleaseInterfaces.AutoTriggerIssue[]>;
    /**
     * Gets a badge that indicates the status of the most recent deployment for an environment.
     *
     * @param {string} projectId - The ID of the Project.
     * @param {number} releaseDefinitionId - The ID of the Release Definition.
     * @param {number} environmentId - The ID of the Environment.
     * @param {string} branchName - The name of the branch.
     */
    getDeploymentBadge(projectId: string, releaseDefinitionId: number, environmentId: number, branchName?: string): Promise<string>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} baseReleaseId
     * @param {number} top
     */
    getReleaseChanges(project: string, releaseId: number, baseReleaseId?: number, top?: number): Promise<ReleaseInterfaces.Change[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} taskGroupId
     * @param {string[]} propertyFilters
     */
    getDefinitionEnvironments(project: string, taskGroupId?: string, propertyFilters?: string[]): Promise<ReleaseInterfaces.DefinitionEnvironmentReference[]>;
    /**
     * Create a release definition
     *
     * @param {ReleaseInterfaces.ReleaseDefinition} releaseDefinition - release definition object to create.
     * @param {string} project - Project ID or project name
     */
    createReleaseDefinition(releaseDefinition: ReleaseInterfaces.ReleaseDefinition, project: string): Promise<ReleaseInterfaces.ReleaseDefinition>;
    /**
     * Delete a release definition.
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - Id of the release definition.
     * @param {string} comment - Comment for deleting a release definition.
     * @param {boolean} forceDelete - 'true' to automatically cancel any in-progress release deployments and proceed with release definition deletion . Default is 'false'.
     */
    deleteReleaseDefinition(project: string, definitionId: number, comment?: string, forceDelete?: boolean): Promise<void>;
    /**
     * Get a release definition.
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - Id of the release definition.
     * @param {string[]} propertyFilters - A comma-delimited list of extended properties to retrieve.
     */
    getReleaseDefinition(project: string, definitionId: number, propertyFilters?: string[]): Promise<ReleaseInterfaces.ReleaseDefinition>;
    /**
     * Get release definition of a given revision.
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - Id of the release definition.
     * @param {number} revision - Revision number of the release definition.
     */
    getReleaseDefinitionRevision(project: string, definitionId: number, revision: number): Promise<NodeJS.ReadableStream>;
    /**
     * Get a list of release definitions.
     *
     * @param {string} project - Project ID or project name
     * @param {string} searchText - Get release definitions with names starting with searchText.
     * @param {ReleaseInterfaces.ReleaseDefinitionExpands} expand - The properties that should be expanded in the list of Release definitions.
     * @param {string} artifactType - Release definitions with given artifactType will be returned. Values can be Build, Jenkins, GitHub, Nuget, Team Build (external), ExternalTFSBuild, Git, TFVC, ExternalTfsXamlBuild.
     * @param {string} artifactSourceId - Release definitions with given artifactSourceId will be returned. e.g. For build it would be {projectGuid}:{BuildDefinitionId}, for Jenkins it would be {JenkinsConnectionId}:{JenkinsDefinitionId}, for TfsOnPrem it would be {TfsOnPremConnectionId}:{ProjectName}:{TfsOnPremDefinitionId}. For third-party artifacts e.g. TeamCity, BitBucket you may refer 'uniqueSourceIdentifier' inside vss-extension.json at https://github.com/Microsoft/vsts-rm-extensions/blob/master/Extensions.
     * @param {number} top - Number of release definitions to get.
     * @param {string} continuationToken - Gets the release definitions after the continuation token provided.
     * @param {ReleaseInterfaces.ReleaseDefinitionQueryOrder} queryOrder - Gets the results in the defined order. Default is 'IdAscending'.
     * @param {string} path - Gets the release definitions under the specified path.
     * @param {boolean} isExactNameMatch - 'true'to gets the release definitions with exact match as specified in searchText. Default is 'false'.
     * @param {string[]} tagFilter - A comma-delimited list of tags. Only release definitions with these tags will be returned.
     * @param {string[]} propertyFilters - A comma-delimited list of extended properties to retrieve.
     * @param {string[]} definitionIdFilter - A comma-delimited list of release definitions to retrieve.
     * @param {boolean} isDeleted - 'true' to get release definitions that has been deleted. Default is 'false'
     */
    getReleaseDefinitions(project: string, searchText?: string, expand?: ReleaseInterfaces.ReleaseDefinitionExpands, artifactType?: string, artifactSourceId?: string, top?: number, continuationToken?: string, queryOrder?: ReleaseInterfaces.ReleaseDefinitionQueryOrder, path?: string, isExactNameMatch?: boolean, tagFilter?: string[], propertyFilters?: string[], definitionIdFilter?: string[], isDeleted?: boolean): Promise<ReleaseInterfaces.ReleaseDefinition[]>;
    /**
     * Undelete a release definition.
     *
     * @param {ReleaseInterfaces.ReleaseDefinitionUndeleteParameter} releaseDefinitionUndeleteParameter - Object for undelete release definition.
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - Id of the release definition to be undeleted
     */
    undeleteReleaseDefinition(releaseDefinitionUndeleteParameter: ReleaseInterfaces.ReleaseDefinitionUndeleteParameter, project: string, definitionId: number): Promise<ReleaseInterfaces.ReleaseDefinition>;
    /**
     * Update a release definition.
     *
     * @param {ReleaseInterfaces.ReleaseDefinition} releaseDefinition - Release definition object to update.
     * @param {string} project - Project ID or project name
     */
    updateReleaseDefinition(releaseDefinition: ReleaseInterfaces.ReleaseDefinition, project: string): Promise<ReleaseInterfaces.ReleaseDefinition>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} definitionId
     * @param {number} definitionEnvironmentId
     * @param {string} createdBy
     * @param {Date} minModifiedTime
     * @param {Date} maxModifiedTime
     * @param {ReleaseInterfaces.DeploymentStatus} deploymentStatus
     * @param {ReleaseInterfaces.DeploymentOperationStatus} operationStatus
     * @param {boolean} latestAttemptsOnly
     * @param {ReleaseInterfaces.ReleaseQueryOrder} queryOrder
     * @param {number} top
     * @param {number} continuationToken
     * @param {string} createdFor
     */
    getDeployments(project: string, definitionId?: number, definitionEnvironmentId?: number, createdBy?: string, minModifiedTime?: Date, maxModifiedTime?: Date, deploymentStatus?: ReleaseInterfaces.DeploymentStatus, operationStatus?: ReleaseInterfaces.DeploymentOperationStatus, latestAttemptsOnly?: boolean, queryOrder?: ReleaseInterfaces.ReleaseQueryOrder, top?: number, continuationToken?: number, createdFor?: string): Promise<ReleaseInterfaces.Deployment[]>;
    /**
     * @param {ReleaseInterfaces.DeploymentQueryParameters} queryParameters
     * @param {string} project - Project ID or project name
     */
    getDeploymentsForMultipleEnvironments(queryParameters: ReleaseInterfaces.DeploymentQueryParameters, project: string): Promise<ReleaseInterfaces.Deployment[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} environmentId
     */
    getReleaseEnvironment(project: string, releaseId: number, environmentId: number): Promise<ReleaseInterfaces.ReleaseEnvironment>;
    /**
     * Update the status of a release environment
     *
     * @param {ReleaseInterfaces.ReleaseEnvironmentUpdateMetadata} environmentUpdateData - Environment update meta data.
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {number} environmentId - Id of release environment.
     */
    updateReleaseEnvironment(environmentUpdateData: ReleaseInterfaces.ReleaseEnvironmentUpdateMetadata, project: string, releaseId: number, environmentId: number): Promise<ReleaseInterfaces.ReleaseEnvironment>;
    /**
     * Creates a definition environment template
     *
     * @param {ReleaseInterfaces.ReleaseDefinitionEnvironmentTemplate} template - Definition environment template to create
     * @param {string} project - Project ID or project name
     */
    createDefinitionEnvironmentTemplate(template: ReleaseInterfaces.ReleaseDefinitionEnvironmentTemplate, project: string): Promise<ReleaseInterfaces.ReleaseDefinitionEnvironmentTemplate>;
    /**
     * Delete a definition environment template
     *
     * @param {string} project - Project ID or project name
     * @param {string} templateId - Id of the definition environment template
     */
    deleteDefinitionEnvironmentTemplate(project: string, templateId: string): Promise<void>;
    /**
     * Gets a definition environment template
     *
     * @param {string} project - Project ID or project name
     * @param {string} templateId - Id of the definition environment template
     */
    getDefinitionEnvironmentTemplate(project: string, templateId: string): Promise<ReleaseInterfaces.ReleaseDefinitionEnvironmentTemplate>;
    /**
     * Gets a list of definition environment templates
     *
     * @param {string} project - Project ID or project name
     * @param {boolean} isDeleted - 'true' to get definition environment templates that have been deleted. Default is 'false'
     */
    listDefinitionEnvironmentTemplates(project: string, isDeleted?: boolean): Promise<ReleaseInterfaces.ReleaseDefinitionEnvironmentTemplate[]>;
    /**
     * Undelete a release definition environment template.
     *
     * @param {string} project - Project ID or project name
     * @param {string} templateId - Id of the definition environment template to be undeleted
     */
    undeleteReleaseDefinitionEnvironmentTemplate(project: string, templateId: string): Promise<ReleaseInterfaces.ReleaseDefinitionEnvironmentTemplate>;
    /**
     * @param {ReleaseInterfaces.FavoriteItem[]} favoriteItems
     * @param {string} project - Project ID or project name
     * @param {string} scope
     * @param {string} identityId
     */
    createFavorites(favoriteItems: ReleaseInterfaces.FavoriteItem[], project: string, scope: string, identityId?: string): Promise<ReleaseInterfaces.FavoriteItem[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} scope
     * @param {string} identityId
     * @param {string} favoriteItemIds
     */
    deleteFavorites(project: string, scope: string, identityId?: string, favoriteItemIds?: string): Promise<void>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} scope
     * @param {string} identityId
     */
    getFavorites(project: string, scope: string, identityId?: string): Promise<ReleaseInterfaces.FavoriteItem[]>;
    /**
     * Creates a new folder
     *
     * @param {ReleaseInterfaces.Folder} folder
     * @param {string} project - Project ID or project name
     * @param {string} path
     */
    createFolder(folder: ReleaseInterfaces.Folder, project: string, path: string): Promise<ReleaseInterfaces.Folder>;
    /**
     * Deletes a definition folder for given folder name and path and all it's existing definitions
     *
     * @param {string} project - Project ID or project name
     * @param {string} path
     */
    deleteFolder(project: string, path: string): Promise<void>;
    /**
     * Gets folders
     *
     * @param {string} project - Project ID or project name
     * @param {string} path
     * @param {ReleaseInterfaces.FolderPathQueryOrder} queryOrder
     */
    getFolders(project: string, path?: string, queryOrder?: ReleaseInterfaces.FolderPathQueryOrder): Promise<ReleaseInterfaces.Folder[]>;
    /**
     * Updates an existing folder at given  existing path
     *
     * @param {ReleaseInterfaces.Folder} folder
     * @param {string} project - Project ID or project name
     * @param {string} path
     */
    updateFolder(folder: ReleaseInterfaces.Folder, project: string, path: string): Promise<ReleaseInterfaces.Folder>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     */
    getReleaseHistory(project: string, releaseId: number): Promise<ReleaseInterfaces.ReleaseRevision[]>;
    /**
     * @param {FormInputInterfaces.InputValuesQuery} query
     * @param {string} project - Project ID or project name
     */
    getInputValues(query: FormInputInterfaces.InputValuesQuery, project: string): Promise<FormInputInterfaces.InputValuesQuery>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} buildId
     * @param {string} sourceId
     */
    getIssues(project: string, buildId: number, sourceId?: string): Promise<ReleaseInterfaces.AutoTriggerIssue[]>;
    /**
     * Gets gate logs
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {number} environmentId - Id of release environment.
     * @param {number} gateId - Id of the gate.
     * @param {number} taskId - ReleaseTask Id for the log.
     */
    getGateLog(project: string, releaseId: number, environmentId: number, gateId: number, taskId: number): Promise<NodeJS.ReadableStream>;
    /**
     * Get logs for a release Id.
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     */
    getLogs(project: string, releaseId: number): Promise<NodeJS.ReadableStream>;
    /**
     * Gets logs
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {number} environmentId - Id of release environment.
     * @param {number} taskId - ReleaseTask Id for the log.
     * @param {number} attemptId - Id of the attempt.
     */
    getLog(project: string, releaseId: number, environmentId: number, taskId: number, attemptId?: number): Promise<NodeJS.ReadableStream>;
    /**
     * Gets the task log of a release as a plain text file.
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {number} environmentId - Id of release environment.
     * @param {number} attemptId
     * @param {string} timelineId
     * @param {number} taskId - ReleaseTask Id for the log.
     * @param {number} startLine - Starting line number for logs
     * @param {number} endLine - Ending line number for logs
     */
    getTaskLog2(project: string, releaseId: number, environmentId: number, attemptId: number, timelineId: string, taskId: number, startLine?: number, endLine?: number): Promise<NodeJS.ReadableStream>;
    /**
     * Gets the task log of a release as a plain text file.
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {number} environmentId - Id of release environment.
     * @param {number} releaseDeployPhaseId - Release deploy phase Id.
     * @param {number} taskId - ReleaseTask Id for the log.
     * @param {number} startLine - Starting line number for logs
     * @param {number} endLine - Ending line number for logs
     */
    getTaskLog(project: string, releaseId: number, environmentId: number, releaseDeployPhaseId: number, taskId: number, startLine?: number, endLine?: number): Promise<NodeJS.ReadableStream>;
    /**
     * Get manual intervention for a given release and manual intervention id.
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {number} manualInterventionId - Id of the manual intervention.
     */
    getManualIntervention(project: string, releaseId: number, manualInterventionId: number): Promise<ReleaseInterfaces.ManualIntervention>;
    /**
     * List all manual interventions for a given release.
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     */
    getManualInterventions(project: string, releaseId: number): Promise<ReleaseInterfaces.ManualIntervention[]>;
    /**
     * Update manual intervention.
     *
     * @param {ReleaseInterfaces.ManualInterventionUpdateMetadata} manualInterventionUpdateMetadata - Meta data to update manual intervention.
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {number} manualInterventionId - Id of the manual intervention.
     */
    updateManualIntervention(manualInterventionUpdateMetadata: ReleaseInterfaces.ManualInterventionUpdateMetadata, project: string, releaseId: number, manualInterventionId: number): Promise<ReleaseInterfaces.ManualIntervention>;
    /**
     * @param {string} project - Project ID or project name
     * @param {Date} minMetricsTime
     */
    getMetrics(project: string, minMetricsTime?: Date): Promise<ReleaseInterfaces.Metric[]>;
    /**
     * @param {string} artifactType
     * @param {string} artifactSourceId
     */
    getReleaseProjects(artifactType: string, artifactSourceId: string): Promise<ReleaseInterfaces.ProjectReference[]>;
    /**
     * Get a list of releases
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - Releases from this release definition Id.
     * @param {number} definitionEnvironmentId
     * @param {string} searchText - Releases with names starting with searchText.
     * @param {string} createdBy - Releases created by this user.
     * @param {ReleaseInterfaces.ReleaseStatus} statusFilter - Releases that have this status.
     * @param {number} environmentStatusFilter
     * @param {Date} minCreatedTime - Releases that were created after this time.
     * @param {Date} maxCreatedTime - Releases that were created before this time.
     * @param {ReleaseInterfaces.ReleaseQueryOrder} queryOrder - Gets the results in the defined order of created date for releases. Default is descending.
     * @param {number} top - Number of releases to get. Default is 50.
     * @param {number} continuationToken - Gets the releases after the continuation token provided.
     * @param {ReleaseInterfaces.ReleaseExpands} expand - The property that should be expanded in the list of releases.
     * @param {string} artifactTypeId - Releases with given artifactTypeId will be returned. Values can be Build, Jenkins, GitHub, Nuget, Team Build (external), ExternalTFSBuild, Git, TFVC, ExternalTfsXamlBuild.
     * @param {string} sourceId - Unique identifier of the artifact used. e.g. For build it would be {projectGuid}:{BuildDefinitionId}, for Jenkins it would be {JenkinsConnectionId}:{JenkinsDefinitionId}, for TfsOnPrem it would be {TfsOnPremConnectionId}:{ProjectName}:{TfsOnPremDefinitionId}. For third-party artifacts e.g. TeamCity, BitBucket you may refer 'uniqueSourceIdentifier' inside vss-extension.json https://github.com/Microsoft/vsts-rm-extensions/blob/master/Extensions.
     * @param {string} artifactVersionId - Releases with given artifactVersionId will be returned. E.g. in case of Build artifactType, it is buildId.
     * @param {string} sourceBranchFilter - Releases with given sourceBranchFilter will be returned.
     * @param {boolean} isDeleted - Gets the soft deleted releases, if true.
     * @param {string[]} tagFilter - A comma-delimited list of tags. Only releases with these tags will be returned.
     * @param {string[]} propertyFilters - A comma-delimited list of extended properties to retrieve.
     * @param {number[]} releaseIdFilter - A comma-delimited list of releases Ids. Only releases with these Ids will be returned.
     */
    getReleases(project?: string, definitionId?: number, definitionEnvironmentId?: number, searchText?: string, createdBy?: string, statusFilter?: ReleaseInterfaces.ReleaseStatus, environmentStatusFilter?: number, minCreatedTime?: Date, maxCreatedTime?: Date, queryOrder?: ReleaseInterfaces.ReleaseQueryOrder, top?: number, continuationToken?: number, expand?: ReleaseInterfaces.ReleaseExpands, artifactTypeId?: string, sourceId?: string, artifactVersionId?: string, sourceBranchFilter?: string, isDeleted?: boolean, tagFilter?: string[], propertyFilters?: string[], releaseIdFilter?: number[]): Promise<ReleaseInterfaces.Release[]>;
    /**
     * Create a release.
     *
     * @param {ReleaseInterfaces.ReleaseStartMetadata} releaseStartMetadata - Metadata to create a release.
     * @param {string} project - Project ID or project name
     */
    createRelease(releaseStartMetadata: ReleaseInterfaces.ReleaseStartMetadata, project: string): Promise<ReleaseInterfaces.Release>;
    /**
     * Soft delete a release
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {string} comment - Comment for deleting a release.
     */
    deleteRelease(project: string, releaseId: number, comment?: string): Promise<void>;
    /**
     * Get a Release
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {ReleaseInterfaces.ApprovalFilters} approvalFilters - A filter which would allow fetching approval steps selectively based on whether it is automated, or manual. This would also decide whether we should fetch pre and post approval snapshots. Assumes All by default
     * @param {string[]} propertyFilters - A comma-delimited list of properties to include in the results.
     */
    getRelease(project: string, releaseId: number, approvalFilters?: ReleaseInterfaces.ApprovalFilters, propertyFilters?: string[]): Promise<ReleaseInterfaces.Release>;
    /**
     * Get release summary of a given definition Id.
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - Id of the definition to get release summary.
     * @param {number} releaseCount - Count of releases to be included in summary.
     * @param {boolean} includeArtifact - Include artifact details.Default is 'false'.
     * @param {number[]} definitionEnvironmentIdsFilter
     */
    getReleaseDefinitionSummary(project: string, definitionId: number, releaseCount: number, includeArtifact?: boolean, definitionEnvironmentIdsFilter?: number[]): Promise<ReleaseInterfaces.ReleaseDefinitionSummary>;
    /**
     * Get release for a given revision number.
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {number} definitionSnapshotRevision - Definition snapshot revision number.
     */
    getReleaseRevision(project: string, releaseId: number, definitionSnapshotRevision: number): Promise<NodeJS.ReadableStream>;
    /**
     * Undelete a soft deleted release.
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of release to be undeleted.
     * @param {string} comment - Any comment for undeleting.
     */
    undeleteRelease(project: string, releaseId: number, comment: string): Promise<void>;
    /**
     * Update a complete release object.
     *
     * @param {ReleaseInterfaces.Release} release - Release object for update.
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release to update.
     */
    updateRelease(release: ReleaseInterfaces.Release, project: string, releaseId: number): Promise<ReleaseInterfaces.Release>;
    /**
     * Update few properties of a release.
     *
     * @param {ReleaseInterfaces.ReleaseUpdateMetadata} releaseUpdateMetadata - Properties of release to update.
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release to update.
     */
    updateReleaseResource(releaseUpdateMetadata: ReleaseInterfaces.ReleaseUpdateMetadata, project: string, releaseId: number): Promise<ReleaseInterfaces.Release>;
    /**
     * Gets the release settings
     *
     * @param {string} project - Project ID or project name
     */
    getReleaseSettings(project: string): Promise<ReleaseInterfaces.ReleaseSettings>;
    /**
     * Updates the release settings
     *
     * @param {ReleaseInterfaces.ReleaseSettings} releaseSettings
     * @param {string} project - Project ID or project name
     */
    updateReleaseSettings(releaseSettings: ReleaseInterfaces.ReleaseSettings, project: string): Promise<ReleaseInterfaces.ReleaseSettings>;
    /**
     * Get release definition for a given definitionId and revision
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - Id of the definition.
     * @param {number} revision - Id of the revision.
     */
    getDefinitionRevision(project: string, definitionId: number, revision: number): Promise<NodeJS.ReadableStream>;
    /**
     * Get revision history for a release definition
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - Id of the definition.
     */
    getReleaseDefinitionHistory(project: string, definitionId: number): Promise<ReleaseInterfaces.ReleaseDefinitionRevision[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     */
    getSummaryMailSections(project: string, releaseId: number): Promise<ReleaseInterfaces.SummaryMailSection[]>;
    /**
     * @param {ReleaseInterfaces.MailMessage} mailMessage
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     */
    sendSummaryMail(mailMessage: ReleaseInterfaces.MailMessage, project: string, releaseId: number): Promise<void>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} definitionId
     */
    getSourceBranches(project: string, definitionId: number): Promise<string[]>;
    /**
     * Adds a tag to a definition
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseDefinitionId
     * @param {string} tag
     */
    addDefinitionTag(project: string, releaseDefinitionId: number, tag: string): Promise<string[]>;
    /**
     * Adds multiple tags to a definition
     *
     * @param {string[]} tags
     * @param {string} project - Project ID or project name
     * @param {number} releaseDefinitionId
     */
    addDefinitionTags(tags: string[], project: string, releaseDefinitionId: number): Promise<string[]>;
    /**
     * Deletes a tag from a definition
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseDefinitionId
     * @param {string} tag
     */
    deleteDefinitionTag(project: string, releaseDefinitionId: number, tag: string): Promise<string[]>;
    /**
     * Gets the tags for a definition
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseDefinitionId
     */
    getDefinitionTags(project: string, releaseDefinitionId: number): Promise<string[]>;
    /**
     * Adds a tag to a releaseId
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {string} tag
     */
    addReleaseTag(project: string, releaseId: number, tag: string): Promise<string[]>;
    /**
     * Adds tag to a release
     *
     * @param {string[]} tags
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     */
    addReleaseTags(tags: string[], project: string, releaseId: number): Promise<string[]>;
    /**
     * Deletes a tag from a release
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {string} tag
     */
    deleteReleaseTag(project: string, releaseId: number, tag: string): Promise<string[]>;
    /**
     * Gets the tags for a release
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     */
    getReleaseTags(project: string, releaseId: number): Promise<string[]>;
    /**
     * @param {string} project - Project ID or project name
     */
    getTags(project: string): Promise<string[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} environmentId
     * @param {number} releaseDeployPhaseId
     */
    getTasksForTaskGroup(project: string, releaseId: number, environmentId: number, releaseDeployPhaseId: number): Promise<ReleaseInterfaces.ReleaseTask[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} environmentId
     * @param {number} attemptId
     * @param {string} timelineId
     */
    getTasks2(project: string, releaseId: number, environmentId: number, attemptId: number, timelineId: string): Promise<ReleaseInterfaces.ReleaseTask[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} environmentId
     * @param {number} attemptId
     */
    getTasks(project: string, releaseId: number, environmentId: number, attemptId?: number): Promise<ReleaseInterfaces.ReleaseTask[]>;
    /**
     * @param {string} project - Project ID or project name
     */
    getArtifactTypeDefinitions(project: string): Promise<ReleaseInterfaces.ArtifactTypeDefinition[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseDefinitionId
     */
    getArtifactVersions(project: string, releaseDefinitionId: number): Promise<ReleaseInterfaces.ArtifactVersionQueryResult>;
    /**
     * @param {ReleaseInterfaces.Artifact[]} artifacts
     * @param {string} project - Project ID or project name
     */
    getArtifactVersionsForSources(artifacts: ReleaseInterfaces.Artifact[], project: string): Promise<ReleaseInterfaces.ArtifactVersionQueryResult>;
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} baseReleaseId
     * @param {number} top
     */
    getReleaseWorkItemsRefs(project: string, releaseId: number, baseReleaseId?: number, top?: number): Promise<ReleaseInterfaces.ReleaseWorkItemRef[]>;
}
