/// <reference types="node" />
import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import BuildInterfaces = require("./interfaces/BuildInterfaces");
import VSSInterfaces = require("./interfaces/common/VSSInterfaces");
export interface IBuildApi extends basem.ClientApiBase {
    createArtifact(artifact: BuildInterfaces.BuildArtifact, buildId: number, project?: string): Promise<BuildInterfaces.BuildArtifact>;
    getArtifact(buildId: number, artifactName: string, project?: string): Promise<BuildInterfaces.BuildArtifact>;
    getArtifactContentZip(buildId: number, artifactName: string, project?: string): Promise<NodeJS.ReadableStream>;
    getArtifacts(buildId: number, project?: string): Promise<BuildInterfaces.BuildArtifact[]>;
    getBadge(project: string, definitionId: number, branchName?: string): Promise<string>;
    listBranches(project: string, providerName: string, serviceEndpointId?: string, repository?: string): Promise<string[]>;
    getBuildBadge(project: string, repoType: string, repoId?: string, branchName?: string): Promise<BuildInterfaces.BuildBadge>;
    getBuildBadgeData(project: string, repoType: string, repoId?: string, branchName?: string): Promise<string>;
    deleteBuild(buildId: number, project?: string): Promise<void>;
    getBuild(buildId: number, project?: string, propertyFilters?: string): Promise<BuildInterfaces.Build>;
    getBuilds(project?: string, definitions?: number[], queues?: number[], buildNumber?: string, minTime?: Date, maxTime?: Date, requestedFor?: string, reasonFilter?: BuildInterfaces.BuildReason, statusFilter?: BuildInterfaces.BuildStatus, resultFilter?: BuildInterfaces.BuildResult, tagFilters?: string[], properties?: string[], top?: number, continuationToken?: string, maxBuildsPerDefinition?: number, deletedFilter?: BuildInterfaces.QueryDeletedOption, queryOrder?: BuildInterfaces.BuildQueryOrder, branchName?: string, buildIds?: number[], repositoryId?: string, repositoryType?: string): Promise<BuildInterfaces.Build[]>;
    queueBuild(build: BuildInterfaces.Build, project?: string, ignoreWarnings?: boolean, checkInTicket?: string): Promise<BuildInterfaces.Build>;
    updateBuild(build: BuildInterfaces.Build, buildId: number, project?: string): Promise<BuildInterfaces.Build>;
    updateBuilds(builds: BuildInterfaces.Build[], project?: string): Promise<BuildInterfaces.Build[]>;
    getBuildChanges(project: string, buildId: number, continuationToken?: string, top?: number, includeSourceChange?: boolean): Promise<BuildInterfaces.Change[]>;
    getChangesBetweenBuilds(project: string, fromBuildId?: number, toBuildId?: number, top?: number): Promise<BuildInterfaces.Change[]>;
    getBuildController(controllerId: number): Promise<BuildInterfaces.BuildController>;
    getBuildControllers(name?: string): Promise<BuildInterfaces.BuildController[]>;
    createDefinition(definition: BuildInterfaces.BuildDefinition, project?: string, definitionToCloneId?: number, definitionToCloneRevision?: number): Promise<BuildInterfaces.BuildDefinition>;
    deleteDefinition(definitionId: number, project?: string): Promise<void>;
    getDefinition(definitionId: number, project?: string, revision?: number, minMetricsTime?: Date, propertyFilters?: string[], includeLatestBuilds?: boolean): Promise<BuildInterfaces.BuildDefinition>;
    getDefinitions(project?: string, name?: string, repositoryId?: string, repositoryType?: string, queryOrder?: BuildInterfaces.DefinitionQueryOrder, top?: number, continuationToken?: string, minMetricsTime?: Date, definitionIds?: number[], path?: string, builtAfter?: Date, notBuiltAfter?: Date, includeAllProperties?: boolean, includeLatestBuilds?: boolean, taskIdFilter?: string): Promise<BuildInterfaces.BuildDefinitionReference[]>;
    updateDefinition(definition: BuildInterfaces.BuildDefinition, definitionId: number, project?: string, secretsSourceDefinitionId?: number, secretsSourceDefinitionRevision?: number): Promise<BuildInterfaces.BuildDefinition>;
    createFolder(folder: BuildInterfaces.Folder, project: string, path: string): Promise<BuildInterfaces.Folder>;
    deleteFolder(project: string, path: string): Promise<void>;
    getFolders(project: string, path?: string, queryOrder?: BuildInterfaces.FolderQueryOrder): Promise<BuildInterfaces.Folder[]>;
    updateFolder(folder: BuildInterfaces.Folder, project: string, path: string): Promise<BuildInterfaces.Folder>;
    getBuildLog(project: string, buildId: number, logId: number, startLine?: number, endLine?: number): Promise<NodeJS.ReadableStream>;
    getBuildLogLines(project: string, buildId: number, logId: number, startLine?: number, endLine?: number): Promise<string[]>;
    getBuildLogs(project: string, buildId: number): Promise<BuildInterfaces.BuildLog[]>;
    getBuildLogsZip(project: string, buildId: number): Promise<NodeJS.ReadableStream>;
    getProjectMetrics(project: string, metricAggregationType?: string, minMetricsTime?: Date): Promise<BuildInterfaces.BuildMetric[]>;
    getDefinitionMetrics(project: string, definitionId: number, minMetricsTime?: Date): Promise<BuildInterfaces.BuildMetric[]>;
    getBuildOptionDefinitions(project?: string): Promise<BuildInterfaces.BuildOptionDefinition[]>;
    getBuildProperties(project: string, buildId: number, filter?: string[]): Promise<any>;
    updateBuildProperties(customHeaders: any, document: VSSInterfaces.JsonPatchDocument, project: string, buildId: number): Promise<any>;
    getDefinitionProperties(project: string, definitionId: number, filter?: string[]): Promise<any>;
    updateDefinitionProperties(customHeaders: any, document: VSSInterfaces.JsonPatchDocument, project: string, definitionId: number): Promise<any>;
    getBuildReport(project: string, buildId: number, type?: string): Promise<BuildInterfaces.BuildReportMetadata>;
    getBuildReportHtmlContent(project: string, buildId: number, type?: string): Promise<NodeJS.ReadableStream>;
    listRepositories(project: string, providerName: string, serviceEndpointId?: string, repository?: string): Promise<BuildInterfaces.SourceRepository[]>;
    getResourceUsage(): Promise<BuildInterfaces.BuildResourceUsage>;
    getDefinitionRevisions(project: string, definitionId: number): Promise<BuildInterfaces.BuildDefinitionRevision[]>;
    getBuildSettings(): Promise<BuildInterfaces.BuildSettings>;
    updateBuildSettings(settings: BuildInterfaces.BuildSettings): Promise<BuildInterfaces.BuildSettings>;
    listSourceProviders(project: string): Promise<BuildInterfaces.SourceProviderAttributes[]>;
    addBuildTag(project: string, buildId: number, tag: string): Promise<string[]>;
    addBuildTags(tags: string[], project: string, buildId: number): Promise<string[]>;
    deleteBuildTag(project: string, buildId: number, tag: string): Promise<string[]>;
    getBuildTags(project: string, buildId: number): Promise<string[]>;
    addDefinitionTag(project: string, definitionId: number, tag: string): Promise<string[]>;
    addDefinitionTags(tags: string[], project: string, definitionId: number): Promise<string[]>;
    deleteDefinitionTag(project: string, definitionId: number, tag: string): Promise<string[]>;
    getDefinitionTags(project: string, definitionId: number, revision?: number): Promise<string[]>;
    getTags(project: string): Promise<string[]>;
    deleteTemplate(project: string, templateId: string): Promise<void>;
    getTemplate(project: string, templateId: string): Promise<BuildInterfaces.BuildDefinitionTemplate>;
    getTemplates(project: string): Promise<BuildInterfaces.BuildDefinitionTemplate[]>;
    saveTemplate(template: BuildInterfaces.BuildDefinitionTemplate, project: string, templateId: string): Promise<BuildInterfaces.BuildDefinitionTemplate>;
    getBuildTimeline(project: string, buildId: number, timelineId?: string, changeId?: number, planId?: string): Promise<BuildInterfaces.Timeline>;
    listWebhooks(project: string, providerName: string, serviceEndpointId?: string, repository?: string): Promise<BuildInterfaces.RepositoryWebhook[]>;
    getBuildWorkItemsRefs(project: string, buildId: number, top?: number): Promise<VSSInterfaces.ResourceRef[]>;
    getBuildWorkItemsRefsFromCommits(commitIds: string[], project: string, buildId: number, top?: number): Promise<VSSInterfaces.ResourceRef[]>;
    getWorkItemsBetweenBuilds(project: string, fromBuildId: number, toBuildId: number, top?: number): Promise<VSSInterfaces.ResourceRef[]>;
}
export declare class BuildApi extends basem.ClientApiBase implements IBuildApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    static readonly RESOURCE_AREA_ID: string;
    /**
     * Associates an artifact with a build.
     *
     * @param {BuildInterfaces.BuildArtifact} artifact - The artifact.
     * @param {number} buildId - The ID of the build.
     * @param {string} project - Project ID or project name
     */
    createArtifact(artifact: BuildInterfaces.BuildArtifact, buildId: number, project?: string): Promise<BuildInterfaces.BuildArtifact>;
    /**
     * Gets a specific artifact for a build.
     *
     * @param {number} buildId - The ID of the build.
     * @param {string} artifactName - The name of the artifact.
     * @param {string} project - Project ID or project name
     */
    getArtifact(buildId: number, artifactName: string, project?: string): Promise<BuildInterfaces.BuildArtifact>;
    /**
     * Gets a specific artifact for a build.
     *
     * @param {number} buildId - The ID of the build.
     * @param {string} artifactName - The name of the artifact.
     * @param {string} project - Project ID or project name
     */
    getArtifactContentZip(buildId: number, artifactName: string, project?: string): Promise<NodeJS.ReadableStream>;
    /**
     * Gets all artifacts for a build.
     *
     * @param {number} buildId - The ID of the build.
     * @param {string} project - Project ID or project name
     */
    getArtifacts(buildId: number, project?: string): Promise<BuildInterfaces.BuildArtifact[]>;
    /**
     * Gets a badge that indicates the status of the most recent build for a definition.
     *
     * @param {string} project - The project ID or name.
     * @param {number} definitionId - The ID of the definition.
     * @param {string} branchName - The name of the branch.
     */
    getBadge(project: string, definitionId: number, branchName?: string): Promise<string>;
    /**
     * Gets a list of branches for the given source code repository.
     *
     * @param {string} project - Project ID or project name
     * @param {string} providerName - The name of the source provider.
     * @param {string} serviceEndpointId - If specified, the ID of the service endpoint to query. Can only be omitted for providers that do not use service endpoints, e.g. TFVC or TFGit.
     * @param {string} repository - If specified, the vendor-specific identifier or the name of the repository to get branches. Can only be omitted for providers that do not support multiple repositories.
     */
    listBranches(project: string, providerName: string, serviceEndpointId?: string, repository?: string): Promise<string[]>;
    /**
     * Gets a badge that indicates the status of the most recent build for the specified branch.
     *
     * @param {string} project - Project ID or project name
     * @param {string} repoType - The repository type.
     * @param {string} repoId - The repository ID.
     * @param {string} branchName - The branch name.
     */
    getBuildBadge(project: string, repoType: string, repoId?: string, branchName?: string): Promise<BuildInterfaces.BuildBadge>;
    /**
     * Gets a badge that indicates the status of the most recent build for the specified branch.
     *
     * @param {string} project - Project ID or project name
     * @param {string} repoType - The repository type.
     * @param {string} repoId - The repository ID.
     * @param {string} branchName - The branch name.
     */
    getBuildBadgeData(project: string, repoType: string, repoId?: string, branchName?: string): Promise<string>;
    /**
     * Deletes a build.
     *
     * @param {number} buildId - The ID of the build.
     * @param {string} project - Project ID or project name
     */
    deleteBuild(buildId: number, project?: string): Promise<void>;
    /**
     * Gets a build.
     *
     * @param {number} buildId - The ID of the build.
     * @param {string} project - Project ID or project name
     * @param {string} propertyFilters - A comma-delimited list of properties to include in the results.
     */
    getBuild(buildId: number, project?: string, propertyFilters?: string): Promise<BuildInterfaces.Build>;
    /**
     * Gets a list of builds.
     *
     * @param {string} project - Project ID or project name
     * @param {number[]} definitions - A comma-delimited list of definition IDs. If specified, filters to builds for these definitions.
     * @param {number[]} queues - A comma-delimited list of queue IDs. If specified, filters to builds that ran against these queues.
     * @param {string} buildNumber - If specified, filters to builds that match this build number. Append * to do a prefix search.
     * @param {Date} minTime - If specified, filters to builds that finished/started/queued after this date based on the queryOrder specified.
     * @param {Date} maxTime - If specified, filters to builds that finished/started/queued before this date based on the queryOrder specified.
     * @param {string} requestedFor - If specified, filters to builds requested for the specified user.
     * @param {BuildInterfaces.BuildReason} reasonFilter - If specified, filters to builds that match this reason.
     * @param {BuildInterfaces.BuildStatus} statusFilter - If specified, filters to builds that match this status.
     * @param {BuildInterfaces.BuildResult} resultFilter - If specified, filters to builds that match this result.
     * @param {string[]} tagFilters - A comma-delimited list of tags. If specified, filters to builds that have the specified tags.
     * @param {string[]} properties - A comma-delimited list of properties to retrieve.
     * @param {number} top - The maximum number of builds to return.
     * @param {string} continuationToken - A continuation token, returned by a previous call to this method, that can be used to return the next set of builds.
     * @param {number} maxBuildsPerDefinition - The maximum number of builds to return per definition.
     * @param {BuildInterfaces.QueryDeletedOption} deletedFilter - Indicates whether to exclude, include, or only return deleted builds.
     * @param {BuildInterfaces.BuildQueryOrder} queryOrder - The order in which builds should be returned.
     * @param {string} branchName - If specified, filters to builds that built branches that built this branch.
     * @param {number[]} buildIds - A comma-delimited list that specifies the IDs of builds to retrieve.
     * @param {string} repositoryId - If specified, filters to builds that built from this repository.
     * @param {string} repositoryType - If specified, filters to builds that built from repositories of this type.
     */
    getBuilds(project?: string, definitions?: number[], queues?: number[], buildNumber?: string, minTime?: Date, maxTime?: Date, requestedFor?: string, reasonFilter?: BuildInterfaces.BuildReason, statusFilter?: BuildInterfaces.BuildStatus, resultFilter?: BuildInterfaces.BuildResult, tagFilters?: string[], properties?: string[], top?: number, continuationToken?: string, maxBuildsPerDefinition?: number, deletedFilter?: BuildInterfaces.QueryDeletedOption, queryOrder?: BuildInterfaces.BuildQueryOrder, branchName?: string, buildIds?: number[], repositoryId?: string, repositoryType?: string): Promise<BuildInterfaces.Build[]>;
    /**
     * Queues a build
     *
     * @param {BuildInterfaces.Build} build
     * @param {string} project - Project ID or project name
     * @param {boolean} ignoreWarnings
     * @param {string} checkInTicket
     */
    queueBuild(build: BuildInterfaces.Build, project?: string, ignoreWarnings?: boolean, checkInTicket?: string): Promise<BuildInterfaces.Build>;
    /**
     * Updates a build.
     *
     * @param {BuildInterfaces.Build} build - The build.
     * @param {number} buildId - The ID of the build.
     * @param {string} project - Project ID or project name
     */
    updateBuild(build: BuildInterfaces.Build, buildId: number, project?: string): Promise<BuildInterfaces.Build>;
    /**
     * Updates multiple builds.
     *
     * @param {BuildInterfaces.Build[]} builds - The builds to update.
     * @param {string} project - Project ID or project name
     */
    updateBuilds(builds: BuildInterfaces.Build[], project?: string): Promise<BuildInterfaces.Build[]>;
    /**
     * Gets the changes associated with a build.
     *
     * @param {string} project - Project ID or project name
     * @param {number} buildId - The build ID.
     * @param {string} continuationToken
     * @param {number} top - The maximum number of changes to return.
     * @param {boolean} includeSourceChange
     */
    getBuildChanges(project: string, buildId: number, continuationToken?: string, top?: number, includeSourceChange?: boolean): Promise<BuildInterfaces.Change[]>;
    /**
     * Gets the changes made to the repository between two given builds.
     *
     * @param {string} project - Project ID or project name
     * @param {number} fromBuildId - The ID of the first build.
     * @param {number} toBuildId - The ID of the last build.
     * @param {number} top - The maximum number of changes to return.
     */
    getChangesBetweenBuilds(project: string, fromBuildId?: number, toBuildId?: number, top?: number): Promise<BuildInterfaces.Change[]>;
    /**
     * Gets a controller
     *
     * @param {number} controllerId
     */
    getBuildController(controllerId: number): Promise<BuildInterfaces.BuildController>;
    /**
     * Gets controller, optionally filtered by name
     *
     * @param {string} name
     */
    getBuildControllers(name?: string): Promise<BuildInterfaces.BuildController[]>;
    /**
     * Creates a new definition.
     *
     * @param {BuildInterfaces.BuildDefinition} definition - The definition.
     * @param {string} project - Project ID or project name
     * @param {number} definitionToCloneId
     * @param {number} definitionToCloneRevision
     */
    createDefinition(definition: BuildInterfaces.BuildDefinition, project?: string, definitionToCloneId?: number, definitionToCloneRevision?: number): Promise<BuildInterfaces.BuildDefinition>;
    /**
     * Deletes a definition and all associated builds.
     *
     * @param {number} definitionId - The ID of the definition.
     * @param {string} project - Project ID or project name
     */
    deleteDefinition(definitionId: number, project?: string): Promise<void>;
    /**
     * Gets a definition, optionally at a specific revision.
     *
     * @param {number} definitionId - The ID of the definition.
     * @param {string} project - Project ID or project name
     * @param {number} revision - The revision number to retrieve. If this is not specified, the latest version will be returned.
     * @param {Date} minMetricsTime - If specified, indicates the date from which metrics should be included.
     * @param {string[]} propertyFilters - A comma-delimited list of properties to include in the results.
     * @param {boolean} includeLatestBuilds
     */
    getDefinition(definitionId: number, project?: string, revision?: number, minMetricsTime?: Date, propertyFilters?: string[], includeLatestBuilds?: boolean): Promise<BuildInterfaces.BuildDefinition>;
    /**
     * Gets a list of definitions.
     *
     * @param {string} project - Project ID or project name
     * @param {string} name - If specified, filters to definitions whose names match this pattern.
     * @param {string} repositoryId - A repository ID. If specified, filters to definitions that use this repository.
     * @param {string} repositoryType - If specified, filters to definitions that have a repository of this type.
     * @param {BuildInterfaces.DefinitionQueryOrder} queryOrder - Indicates the order in which definitions should be returned.
     * @param {number} top - The maximum number of definitions to return.
     * @param {string} continuationToken - A continuation token, returned by a previous call to this method, that can be used to return the next set of definitions.
     * @param {Date} minMetricsTime - If specified, indicates the date from which metrics should be included.
     * @param {number[]} definitionIds - A comma-delimited list that specifies the IDs of definitions to retrieve.
     * @param {string} path - If specified, filters to definitions under this folder.
     * @param {Date} builtAfter - If specified, filters to definitions that have builds after this date.
     * @param {Date} notBuiltAfter - If specified, filters to definitions that do not have builds after this date.
     * @param {boolean} includeAllProperties - Indicates whether the full definitions should be returned. By default, shallow representations of the definitions are returned.
     * @param {boolean} includeLatestBuilds - Indicates whether to return the latest and latest completed builds for this definition.
     * @param {string} taskIdFilter - If specified, filters to definitions that use the specified task.
     */
    getDefinitions(project?: string, name?: string, repositoryId?: string, repositoryType?: string, queryOrder?: BuildInterfaces.DefinitionQueryOrder, top?: number, continuationToken?: string, minMetricsTime?: Date, definitionIds?: number[], path?: string, builtAfter?: Date, notBuiltAfter?: Date, includeAllProperties?: boolean, includeLatestBuilds?: boolean, taskIdFilter?: string): Promise<BuildInterfaces.BuildDefinitionReference[]>;
    /**
     * Updates an existing definition.
     *
     * @param {BuildInterfaces.BuildDefinition} definition - The new version of the defintion.
     * @param {number} definitionId - The ID of the definition.
     * @param {string} project - Project ID or project name
     * @param {number} secretsSourceDefinitionId
     * @param {number} secretsSourceDefinitionRevision
     */
    updateDefinition(definition: BuildInterfaces.BuildDefinition, definitionId: number, project?: string, secretsSourceDefinitionId?: number, secretsSourceDefinitionRevision?: number): Promise<BuildInterfaces.BuildDefinition>;
    /**
     * Creates a new folder.
     *
     * @param {BuildInterfaces.Folder} folder - The folder.
     * @param {string} project - Project ID or project name
     * @param {string} path - The full path of the folder.
     */
    createFolder(folder: BuildInterfaces.Folder, project: string, path: string): Promise<BuildInterfaces.Folder>;
    /**
     * Deletes a definition folder. Definitions and their corresponding builds will also be deleted.
     *
     * @param {string} project - Project ID or project name
     * @param {string} path - The full path to the folder.
     */
    deleteFolder(project: string, path: string): Promise<void>;
    /**
     * Gets a list of build definition folders.
     *
     * @param {string} project - Project ID or project name
     * @param {string} path - The path to start with.
     * @param {BuildInterfaces.FolderQueryOrder} queryOrder - The order in which folders should be returned.
     */
    getFolders(project: string, path?: string, queryOrder?: BuildInterfaces.FolderQueryOrder): Promise<BuildInterfaces.Folder[]>;
    /**
     * Updates an existing folder at given  existing path
     *
     * @param {BuildInterfaces.Folder} folder - The new version of the folder.
     * @param {string} project - Project ID or project name
     * @param {string} path - The full path to the folder.
     */
    updateFolder(folder: BuildInterfaces.Folder, project: string, path: string): Promise<BuildInterfaces.Folder>;
    /**
     * Gets an individual log file for a build.
     *
     * @param {string} project - Project ID or project name
     * @param {number} buildId - The ID of the build.
     * @param {number} logId - The ID of the log file.
     * @param {number} startLine - The start line.
     * @param {number} endLine - The end line.
     */
    getBuildLog(project: string, buildId: number, logId: number, startLine?: number, endLine?: number): Promise<NodeJS.ReadableStream>;
    /**
     * Gets an individual log file for a build.
     *
     * @param {string} project - Project ID or project name
     * @param {number} buildId - The ID of the build.
     * @param {number} logId - The ID of the log file.
     * @param {number} startLine - The start line.
     * @param {number} endLine - The end line.
     */
    getBuildLogLines(project: string, buildId: number, logId: number, startLine?: number, endLine?: number): Promise<string[]>;
    /**
     * Gets the logs for a build.
     *
     * @param {string} project - Project ID or project name
     * @param {number} buildId - The ID of the build.
     */
    getBuildLogs(project: string, buildId: number): Promise<BuildInterfaces.BuildLog[]>;
    /**
     * Gets the logs for a build.
     *
     * @param {string} project - Project ID or project name
     * @param {number} buildId - The ID of the build.
     */
    getBuildLogsZip(project: string, buildId: number): Promise<NodeJS.ReadableStream>;
    /**
     * Gets build metrics for a project.
     *
     * @param {string} project - Project ID or project name
     * @param {string} metricAggregationType - The aggregation type to use (hourly, daily).
     * @param {Date} minMetricsTime - The date from which to calculate metrics.
     */
    getProjectMetrics(project: string, metricAggregationType?: string, minMetricsTime?: Date): Promise<BuildInterfaces.BuildMetric[]>;
    /**
     * Gets build metrics for a definition.
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - The ID of the definition.
     * @param {Date} minMetricsTime - The date from which to calculate metrics.
     */
    getDefinitionMetrics(project: string, definitionId: number, minMetricsTime?: Date): Promise<BuildInterfaces.BuildMetric[]>;
    /**
     * Gets all build definition options supported by the system.
     *
     * @param {string} project - Project ID or project name
     */
    getBuildOptionDefinitions(project?: string): Promise<BuildInterfaces.BuildOptionDefinition[]>;
    /**
     * Gets properties for a build.
     *
     * @param {string} project - Project ID or project name
     * @param {number} buildId - The ID of the build.
     * @param {string[]} filter - A comma-delimited list of properties. If specified, filters to these specific properties.
     */
    getBuildProperties(project: string, buildId: number, filter?: string[]): Promise<any>;
    /**
     * Updates properties for a build.
     *
     * @param {VSSInterfaces.JsonPatchDocument} document - A json-patch document describing the properties to update.
     * @param {string} project - Project ID or project name
     * @param {number} buildId - The ID of the build.
     */
    updateBuildProperties(customHeaders: any, document: VSSInterfaces.JsonPatchDocument, project: string, buildId: number): Promise<any>;
    /**
     * Gets properties for a definition.
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - The ID of the definition.
     * @param {string[]} filter - A comma-delimited list of properties. If specified, filters to these specific properties.
     */
    getDefinitionProperties(project: string, definitionId: number, filter?: string[]): Promise<any>;
    /**
     * Updates properties for a definition.
     *
     * @param {VSSInterfaces.JsonPatchDocument} document - A json-patch document describing the properties to update.
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - The ID of the definition.
     */
    updateDefinitionProperties(customHeaders: any, document: VSSInterfaces.JsonPatchDocument, project: string, definitionId: number): Promise<any>;
    /**
     * Gets a build report.
     *
     * @param {string} project - Project ID or project name
     * @param {number} buildId - The ID of the build.
     * @param {string} type
     */
    getBuildReport(project: string, buildId: number, type?: string): Promise<BuildInterfaces.BuildReportMetadata>;
    /**
     * Gets a build report.
     *
     * @param {string} project - Project ID or project name
     * @param {number} buildId - The ID of the build.
     * @param {string} type
     */
    getBuildReportHtmlContent(project: string, buildId: number, type?: string): Promise<NodeJS.ReadableStream>;
    /**
     * Gets a list of source code repositories.
     *
     * @param {string} project - Project ID or project name
     * @param {string} providerName - The name of the source provider.
     * @param {string} serviceEndpointId - If specified, the ID of the service endpoint to query. Can only be omitted for providers that do not use service endpoints, e.g. TFVC or TFGit.
     * @param {string} repository - If specified, the vendor-specific identifier or the name of a single repository to get.
     */
    listRepositories(project: string, providerName: string, serviceEndpointId?: string, repository?: string): Promise<BuildInterfaces.SourceRepository[]>;
    /**
     * Gets information about build resources in the system.
     *
     */
    getResourceUsage(): Promise<BuildInterfaces.BuildResourceUsage>;
    /**
     * Gets all revisions of a definition.
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - The ID of the definition.
     */
    getDefinitionRevisions(project: string, definitionId: number): Promise<BuildInterfaces.BuildDefinitionRevision[]>;
    /**
     * Gets the build settings.
     *
     */
    getBuildSettings(): Promise<BuildInterfaces.BuildSettings>;
    /**
     * Updates the build settings.
     *
     * @param {BuildInterfaces.BuildSettings} settings - The new settings.
     */
    updateBuildSettings(settings: BuildInterfaces.BuildSettings): Promise<BuildInterfaces.BuildSettings>;
    /**
     * Get a list of source providers and their capabilities.
     *
     * @param {string} project - Project ID or project name
     */
    listSourceProviders(project: string): Promise<BuildInterfaces.SourceProviderAttributes[]>;
    /**
     * Adds a tag to a build.
     *
     * @param {string} project - Project ID or project name
     * @param {number} buildId - The ID of the build.
     * @param {string} tag - The tag to add.
     */
    addBuildTag(project: string, buildId: number, tag: string): Promise<string[]>;
    /**
     * Adds tags to a build.
     *
     * @param {string[]} tags - The tags to add.
     * @param {string} project - Project ID or project name
     * @param {number} buildId - The ID of the build.
     */
    addBuildTags(tags: string[], project: string, buildId: number): Promise<string[]>;
    /**
     * Removes a tag from a build.
     *
     * @param {string} project - Project ID or project name
     * @param {number} buildId - The ID of the build.
     * @param {string} tag - The tag to remove.
     */
    deleteBuildTag(project: string, buildId: number, tag: string): Promise<string[]>;
    /**
     * Gets the tags for a build.
     *
     * @param {string} project - Project ID or project name
     * @param {number} buildId - The ID of the build.
     */
    getBuildTags(project: string, buildId: number): Promise<string[]>;
    /**
     * Adds a tag to a definition
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - The ID of the definition.
     * @param {string} tag - The tag to add.
     */
    addDefinitionTag(project: string, definitionId: number, tag: string): Promise<string[]>;
    /**
     * Adds multiple tags to a definition.
     *
     * @param {string[]} tags - The tags to add.
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - The ID of the definition.
     */
    addDefinitionTags(tags: string[], project: string, definitionId: number): Promise<string[]>;
    /**
     * Removes a tag from a definition.
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - The ID of the definition.
     * @param {string} tag - The tag to remove.
     */
    deleteDefinitionTag(project: string, definitionId: number, tag: string): Promise<string[]>;
    /**
     * Gets the tags for a definition.
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - The ID of the definition.
     * @param {number} revision - The definition revision number. If not specified, uses the latest revision of the definition.
     */
    getDefinitionTags(project: string, definitionId: number, revision?: number): Promise<string[]>;
    /**
     * Gets a list of all build and definition tags in the project.
     *
     * @param {string} project - Project ID or project name
     */
    getTags(project: string): Promise<string[]>;
    /**
     * Deletes a build definition template.
     *
     * @param {string} project - Project ID or project name
     * @param {string} templateId - The ID of the template.
     */
    deleteTemplate(project: string, templateId: string): Promise<void>;
    /**
     * Gets a specific build definition template.
     *
     * @param {string} project - Project ID or project name
     * @param {string} templateId - The ID of the requested template.
     */
    getTemplate(project: string, templateId: string): Promise<BuildInterfaces.BuildDefinitionTemplate>;
    /**
     * Gets all definition templates.
     *
     * @param {string} project - Project ID or project name
     */
    getTemplates(project: string): Promise<BuildInterfaces.BuildDefinitionTemplate[]>;
    /**
     * Updates an existing build definition template.
     *
     * @param {BuildInterfaces.BuildDefinitionTemplate} template - The new version of the template.
     * @param {string} project - Project ID or project name
     * @param {string} templateId - The ID of the template.
     */
    saveTemplate(template: BuildInterfaces.BuildDefinitionTemplate, project: string, templateId: string): Promise<BuildInterfaces.BuildDefinitionTemplate>;
    /**
     * Gets a timeline for a build.
     *
     * @param {string} project - Project ID or project name
     * @param {number} buildId - The ID of the build.
     * @param {string} timelineId - The ID of the timeline. If not specified, uses the main timeline for the plan.
     * @param {number} changeId
     * @param {string} planId - The ID of the plan. If not specified, uses the primary plan for the build.
     */
    getBuildTimeline(project: string, buildId: number, timelineId?: string, changeId?: number, planId?: string): Promise<BuildInterfaces.Timeline>;
    /**
     * Gets a list of webhooks installed in the given source code repository.
     *
     * @param {string} project - Project ID or project name
     * @param {string} providerName - The name of the source provider.
     * @param {string} serviceEndpointId - If specified, the ID of the service endpoint to query. Can only be omitted for providers that do not use service endpoints, e.g. TFVC or TFGit.
     * @param {string} repository - If specified, the vendor-specific identifier or the name of the repository to get webhooks. Can only be omitted for providers that do not support multiple repositories.
     */
    listWebhooks(project: string, providerName: string, serviceEndpointId?: string, repository?: string): Promise<BuildInterfaces.RepositoryWebhook[]>;
    /**
     * Gets the work items associated with a build.
     *
     * @param {string} project - Project ID or project name
     * @param {number} buildId - The ID of the build.
     * @param {number} top - The maximum number of work items to return.
     */
    getBuildWorkItemsRefs(project: string, buildId: number, top?: number): Promise<VSSInterfaces.ResourceRef[]>;
    /**
     * Gets the work items associated with a build, filtered to specific commits.
     *
     * @param {string[]} commitIds - A comma-delimited list of commit IDs.
     * @param {string} project - Project ID or project name
     * @param {number} buildId - The ID of the build.
     * @param {number} top - The maximum number of work items to return, or the number of commits to consider if no commit IDs are specified.
     */
    getBuildWorkItemsRefsFromCommits(commitIds: string[], project: string, buildId: number, top?: number): Promise<VSSInterfaces.ResourceRef[]>;
    /**
     * Gets all the work items between two builds.
     *
     * @param {string} project - Project ID or project name
     * @param {number} fromBuildId - The ID of the first build.
     * @param {number} toBuildId - The ID of the last build.
     * @param {number} top - The maximum number of work items to return.
     */
    getWorkItemsBetweenBuilds(project: string, fromBuildId: number, toBuildId: number, top?: number): Promise<VSSInterfaces.ResourceRef[]>;
}
