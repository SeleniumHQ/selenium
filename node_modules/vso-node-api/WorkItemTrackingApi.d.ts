/// <reference types="node" />
import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import TfsCoreInterfaces = require("./interfaces/CoreInterfaces");
import VSSInterfaces = require("./interfaces/common/VSSInterfaces");
import WorkItemTrackingInterfaces = require("./interfaces/WorkItemTrackingInterfaces");
export interface IWorkItemTrackingApi extends basem.ClientApiBase {
    getAccountMyWorkData(queryOption?: WorkItemTrackingInterfaces.QueryOption): Promise<WorkItemTrackingInterfaces.AccountMyWorkResult>;
    getRecentActivityData(): Promise<WorkItemTrackingInterfaces.AccountRecentActivityWorkItemModel[]>;
    getRecentMentions(): Promise<WorkItemTrackingInterfaces.AccountRecentMentionWorkItemModel[]>;
    getWorkArtifactLinkTypes(): Promise<WorkItemTrackingInterfaces.WorkArtifactLink[]>;
    queryWorkItemsForArtifactUris(artifactUriQuery: WorkItemTrackingInterfaces.ArtifactUriQuery): Promise<WorkItemTrackingInterfaces.ArtifactUriQueryResult>;
    createAttachment(customHeaders: any, contentStream: NodeJS.ReadableStream, fileName?: string, uploadType?: string, areaPath?: string): Promise<WorkItemTrackingInterfaces.AttachmentReference>;
    getAttachmentContent(id: string, fileName?: string): Promise<NodeJS.ReadableStream>;
    getAttachmentZip(id: string, fileName?: string): Promise<NodeJS.ReadableStream>;
    getRootNodes(project: string, depth?: number): Promise<WorkItemTrackingInterfaces.WorkItemClassificationNode[]>;
    createOrUpdateClassificationNode(postedNode: WorkItemTrackingInterfaces.WorkItemClassificationNode, project: string, structureGroup: WorkItemTrackingInterfaces.TreeStructureGroup, path?: string): Promise<WorkItemTrackingInterfaces.WorkItemClassificationNode>;
    deleteClassificationNode(project: string, structureGroup: WorkItemTrackingInterfaces.TreeStructureGroup, path?: string, reclassifyId?: number): Promise<void>;
    getClassificationNode(project: string, structureGroup: WorkItemTrackingInterfaces.TreeStructureGroup, path?: string, depth?: number): Promise<WorkItemTrackingInterfaces.WorkItemClassificationNode>;
    updateClassificationNode(postedNode: WorkItemTrackingInterfaces.WorkItemClassificationNode, project: string, structureGroup: WorkItemTrackingInterfaces.TreeStructureGroup, path?: string): Promise<WorkItemTrackingInterfaces.WorkItemClassificationNode>;
    getComment(id: number, revision: number): Promise<WorkItemTrackingInterfaces.WorkItemComment>;
    getComments(id: number, fromRevision?: number, top?: number, order?: WorkItemTrackingInterfaces.CommentSortOrder): Promise<WorkItemTrackingInterfaces.WorkItemComments>;
    deleteField(fieldNameOrRefName: string, project?: string): Promise<void>;
    getField(fieldNameOrRefName: string, project?: string): Promise<WorkItemTrackingInterfaces.WorkItemField>;
    getFields(project?: string, expand?: WorkItemTrackingInterfaces.GetFieldsExpand): Promise<WorkItemTrackingInterfaces.WorkItemField[]>;
    updateField(workItemField: WorkItemTrackingInterfaces.WorkItemField, fieldNameOrRefName: string, project?: string): Promise<void>;
    createQuery(postedQuery: WorkItemTrackingInterfaces.QueryHierarchyItem, project: string, query: string): Promise<WorkItemTrackingInterfaces.QueryHierarchyItem>;
    deleteQuery(project: string, query: string): Promise<void>;
    getQueries(project: string, expand?: WorkItemTrackingInterfaces.QueryExpand, depth?: number, includeDeleted?: boolean): Promise<WorkItemTrackingInterfaces.QueryHierarchyItem[]>;
    getQuery(project: string, query: string, expand?: WorkItemTrackingInterfaces.QueryExpand, depth?: number, includeDeleted?: boolean): Promise<WorkItemTrackingInterfaces.QueryHierarchyItem>;
    searchQueries(project: string, filter: string, top?: number, expand?: WorkItemTrackingInterfaces.QueryExpand, includeDeleted?: boolean): Promise<WorkItemTrackingInterfaces.QueryHierarchyItemsResult>;
    updateQuery(queryUpdate: WorkItemTrackingInterfaces.QueryHierarchyItem, project: string, query: string, undeleteDescendants?: boolean): Promise<WorkItemTrackingInterfaces.QueryHierarchyItem>;
    destroyWorkItem(id: number, project?: string): Promise<void>;
    getDeletedWorkItem(id: number, project?: string): Promise<WorkItemTrackingInterfaces.WorkItemDelete>;
    getDeletedWorkItemReferences(project?: string): Promise<WorkItemTrackingInterfaces.WorkItemReference[]>;
    getDeletedWorkItems(ids: number[], project?: string): Promise<WorkItemTrackingInterfaces.WorkItemDeleteReference[]>;
    restoreWorkItem(payload: WorkItemTrackingInterfaces.WorkItemDeleteUpdate, id: number, project?: string): Promise<WorkItemTrackingInterfaces.WorkItemDelete>;
    getRevision(id: number, revisionNumber: number, expand?: WorkItemTrackingInterfaces.WorkItemExpand): Promise<WorkItemTrackingInterfaces.WorkItem>;
    getRevisions(id: number, top?: number, skip?: number, expand?: WorkItemTrackingInterfaces.WorkItemExpand): Promise<WorkItemTrackingInterfaces.WorkItem[]>;
    evaluateRulesOnField(ruleEngineInput: WorkItemTrackingInterfaces.FieldsToEvaluate): Promise<void>;
    createTemplate(template: WorkItemTrackingInterfaces.WorkItemTemplate, teamContext: TfsCoreInterfaces.TeamContext): Promise<WorkItemTrackingInterfaces.WorkItemTemplate>;
    getTemplates(teamContext: TfsCoreInterfaces.TeamContext, workitemtypename?: string): Promise<WorkItemTrackingInterfaces.WorkItemTemplateReference[]>;
    deleteTemplate(teamContext: TfsCoreInterfaces.TeamContext, templateId: string): Promise<void>;
    getTemplate(teamContext: TfsCoreInterfaces.TeamContext, templateId: string): Promise<WorkItemTrackingInterfaces.WorkItemTemplate>;
    replaceTemplate(templateContent: WorkItemTrackingInterfaces.WorkItemTemplate, teamContext: TfsCoreInterfaces.TeamContext, templateId: string): Promise<WorkItemTrackingInterfaces.WorkItemTemplate>;
    getUpdate(id: number, updateNumber: number): Promise<WorkItemTrackingInterfaces.WorkItemUpdate>;
    getUpdates(id: number, top?: number, skip?: number): Promise<WorkItemTrackingInterfaces.WorkItemUpdate[]>;
    queryByWiql(wiql: WorkItemTrackingInterfaces.Wiql, teamContext?: TfsCoreInterfaces.TeamContext, timePrecision?: boolean, top?: number): Promise<WorkItemTrackingInterfaces.WorkItemQueryResult>;
    queryById(id: string, teamContext?: TfsCoreInterfaces.TeamContext, timePrecision?: boolean): Promise<WorkItemTrackingInterfaces.WorkItemQueryResult>;
    getWorkItemIconJson(icon: string, color?: string, v?: number): Promise<WorkItemTrackingInterfaces.WorkItemIcon>;
    getWorkItemIcons(): Promise<WorkItemTrackingInterfaces.WorkItemIcon[]>;
    getWorkItemIconSvg(icon: string, color?: string, v?: number): Promise<NodeJS.ReadableStream>;
    getReportingLinks(project?: string, types?: string[], continuationToken?: string, startDateTime?: Date): Promise<WorkItemTrackingInterfaces.ReportingWorkItemLinksBatch>;
    getRelationType(relation: string): Promise<WorkItemTrackingInterfaces.WorkItemRelationType>;
    getRelationTypes(): Promise<WorkItemTrackingInterfaces.WorkItemRelationType[]>;
    readReportingRevisionsGet(project?: string, fields?: string[], types?: string[], continuationToken?: string, startDateTime?: Date, includeIdentityRef?: boolean, includeDeleted?: boolean, includeTagRef?: boolean, includeLatestOnly?: boolean, expand?: WorkItemTrackingInterfaces.ReportingRevisionsExpand, includeDiscussionChangesOnly?: boolean, maxPageSize?: number): Promise<WorkItemTrackingInterfaces.ReportingWorkItemRevisionsBatch>;
    readReportingRevisionsPost(filter: WorkItemTrackingInterfaces.ReportingWorkItemRevisionsFilter, project?: string, continuationToken?: string, startDateTime?: Date, expand?: WorkItemTrackingInterfaces.ReportingRevisionsExpand): Promise<WorkItemTrackingInterfaces.ReportingWorkItemRevisionsBatch>;
    deleteWorkItem(id: number, destroy?: boolean): Promise<WorkItemTrackingInterfaces.WorkItemDelete>;
    getWorkItem(id: number, fields?: string[], asOf?: Date, expand?: WorkItemTrackingInterfaces.WorkItemExpand): Promise<WorkItemTrackingInterfaces.WorkItem>;
    getWorkItems(ids: number[], fields?: string[], asOf?: Date, expand?: WorkItemTrackingInterfaces.WorkItemExpand, errorPolicy?: WorkItemTrackingInterfaces.WorkItemErrorPolicy): Promise<WorkItemTrackingInterfaces.WorkItem[]>;
    updateWorkItem(customHeaders: any, document: VSSInterfaces.JsonPatchDocument, id: number, validateOnly?: boolean, bypassRules?: boolean, suppressNotifications?: boolean): Promise<WorkItemTrackingInterfaces.WorkItem>;
    createWorkItem(customHeaders: any, document: VSSInterfaces.JsonPatchDocument, project: string, type: string, validateOnly?: boolean, bypassRules?: boolean, suppressNotifications?: boolean): Promise<WorkItemTrackingInterfaces.WorkItem>;
    getWorkItemTemplate(project: string, type: string, fields?: string, asOf?: Date, expand?: WorkItemTrackingInterfaces.WorkItemExpand): Promise<WorkItemTrackingInterfaces.WorkItem>;
    getWorkItemStateColors(projectNames: string[]): Promise<WorkItemTrackingInterfaces.ProjectWorkItemStateColors[]>;
    getWorkItemNextStatesOnCheckinAction(ids: number[], action?: string): Promise<WorkItemTrackingInterfaces.WorkItemNextStateOnTransition[]>;
    getWorkItemTypeCategories(project: string): Promise<WorkItemTrackingInterfaces.WorkItemTypeCategory[]>;
    getWorkItemTypeCategory(project: string, category: string): Promise<WorkItemTrackingInterfaces.WorkItemTypeCategory>;
    getWorkItemTypeColors(projectNames: string[]): Promise<{
        key: string;
        value: WorkItemTrackingInterfaces.WorkItemTypeColor[];
    }[]>;
    getWorkItemTypeColorAndIcons(projectNames: string[]): Promise<{
        key: string;
        value: WorkItemTrackingInterfaces.WorkItemTypeColorAndIcon[];
    }[]>;
    getWorkItemType(project: string, type: string): Promise<WorkItemTrackingInterfaces.WorkItemType>;
    getWorkItemTypes(project: string): Promise<WorkItemTrackingInterfaces.WorkItemType[]>;
    getWorkItemTypeField(project: string, type: string, field: string, expand?: WorkItemTrackingInterfaces.WorkItemTypeFieldsExpandLevel): Promise<WorkItemTrackingInterfaces.WorkItemTypeFieldInstance>;
    getWorkItemTypeFields(project: string, type: string, expand?: WorkItemTrackingInterfaces.WorkItemTypeFieldsExpandLevel): Promise<WorkItemTrackingInterfaces.WorkItemTypeFieldInstance[]>;
    getWorkItemTypeStates(project: string, type: string): Promise<WorkItemTrackingInterfaces.WorkItemStateColor[]>;
    exportWorkItemTypeDefinition(project?: string, type?: string, exportGlobalLists?: boolean): Promise<WorkItemTrackingInterfaces.WorkItemTypeTemplate>;
    updateWorkItemTypeDefinition(updateModel: WorkItemTrackingInterfaces.WorkItemTypeTemplateUpdateModel, project?: string): Promise<WorkItemTrackingInterfaces.ProvisioningResult>;
}
export declare class WorkItemTrackingApi extends basem.ClientApiBase implements IWorkItemTrackingApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    static readonly RESOURCE_AREA_ID: string;
    /**
     * INTERNAL ONLY: USED BY ACCOUNT MY WORK PAGE. This returns Doing, Done, Follows and activity work items details.
     *
     * @param {WorkItemTrackingInterfaces.QueryOption} queryOption
     */
    getAccountMyWorkData(queryOption?: WorkItemTrackingInterfaces.QueryOption): Promise<WorkItemTrackingInterfaces.AccountMyWorkResult>;
    /**
     * INTERNAL ONLY: USED BY ACCOUNT MY WORK PAGE. This returns Doing, Done, Follows and activity work items details.
     *
     */
    getRecentActivityData(): Promise<WorkItemTrackingInterfaces.AccountRecentActivityWorkItemModel[]>;
    /**
     * INTERNAL ONLY: USED BY ACCOUNT MY WORK PAGE.
     *
     */
    getRecentMentions(): Promise<WorkItemTrackingInterfaces.AccountRecentMentionWorkItemModel[]>;
    /**
     * Get the list of work item tracking outbound artifact link types.
     *
     */
    getWorkArtifactLinkTypes(): Promise<WorkItemTrackingInterfaces.WorkArtifactLink[]>;
    /**
     * Queries work items linked to a given list of artifact URI.
     *
     * @param {WorkItemTrackingInterfaces.ArtifactUriQuery} artifactUriQuery - Defines a list of artifact URI for querying work items.
     */
    queryWorkItemsForArtifactUris(artifactUriQuery: WorkItemTrackingInterfaces.ArtifactUriQuery): Promise<WorkItemTrackingInterfaces.ArtifactUriQueryResult>;
    /**
     * Uploads an attachment.
     *
     * @param {NodeJS.ReadableStream} contentStream - Content to upload
     * @param {string} fileName - The name of the file
     * @param {string} uploadType - Attachment upload type: Simple or Chunked
     * @param {string} areaPath - Target project Area Path
     */
    createAttachment(customHeaders: any, contentStream: NodeJS.ReadableStream, fileName?: string, uploadType?: string, areaPath?: string): Promise<WorkItemTrackingInterfaces.AttachmentReference>;
    /**
     * Downloads an attachment.
     *
     * @param {string} id - Attachment ID
     * @param {string} fileName - Name of the file
     */
    getAttachmentContent(id: string, fileName?: string): Promise<NodeJS.ReadableStream>;
    /**
     * Downloads an attachment.
     *
     * @param {string} id - Attachment ID
     * @param {string} fileName - Name of the file
     */
    getAttachmentZip(id: string, fileName?: string): Promise<NodeJS.ReadableStream>;
    /**
     * Gets root classification nodes under the project.
     *
     * @param {string} project - Project ID or project name
     * @param {number} depth - Depth of children to fetch.
     */
    getRootNodes(project: string, depth?: number): Promise<WorkItemTrackingInterfaces.WorkItemClassificationNode[]>;
    /**
     * Create new or update an existing classification node.
     *
     * @param {WorkItemTrackingInterfaces.WorkItemClassificationNode} postedNode - Node to create or update.
     * @param {string} project - Project ID or project name
     * @param {WorkItemTrackingInterfaces.TreeStructureGroup} structureGroup - Structure group of the classification node, area or iteration.
     * @param {string} path - Path of the classification node.
     */
    createOrUpdateClassificationNode(postedNode: WorkItemTrackingInterfaces.WorkItemClassificationNode, project: string, structureGroup: WorkItemTrackingInterfaces.TreeStructureGroup, path?: string): Promise<WorkItemTrackingInterfaces.WorkItemClassificationNode>;
    /**
     * Delete an existing classification node.
     *
     * @param {string} project - Project ID or project name
     * @param {WorkItemTrackingInterfaces.TreeStructureGroup} structureGroup - Structure group of the classification node, area or iteration.
     * @param {string} path - Path of the classification node.
     * @param {number} reclassifyId - Id of the target classification node for reclassification.
     */
    deleteClassificationNode(project: string, structureGroup: WorkItemTrackingInterfaces.TreeStructureGroup, path?: string, reclassifyId?: number): Promise<void>;
    /**
     * Gets the classification node for a given node path.
     *
     * @param {string} project - Project ID or project name
     * @param {WorkItemTrackingInterfaces.TreeStructureGroup} structureGroup - Structure group of the classification node, area or iteration.
     * @param {string} path - Path of the classification node.
     * @param {number} depth - Depth of children to fetch.
     */
    getClassificationNode(project: string, structureGroup: WorkItemTrackingInterfaces.TreeStructureGroup, path?: string, depth?: number): Promise<WorkItemTrackingInterfaces.WorkItemClassificationNode>;
    /**
     * Update an existing classification node.
     *
     * @param {WorkItemTrackingInterfaces.WorkItemClassificationNode} postedNode - Node to create or update.
     * @param {string} project - Project ID or project name
     * @param {WorkItemTrackingInterfaces.TreeStructureGroup} structureGroup - Structure group of the classification node, area or iteration.
     * @param {string} path - Path of the classification node.
     */
    updateClassificationNode(postedNode: WorkItemTrackingInterfaces.WorkItemClassificationNode, project: string, structureGroup: WorkItemTrackingInterfaces.TreeStructureGroup, path?: string): Promise<WorkItemTrackingInterfaces.WorkItemClassificationNode>;
    /**
     * Gets a comment for a work item at the specified revision.
     *
     * @param {number} id - Work item id
     * @param {number} revision - Revision for which the comment need to be fetched
     */
    getComment(id: number, revision: number): Promise<WorkItemTrackingInterfaces.WorkItemComment>;
    /**
     * Gets the specified number of comments for a work item from the specified revision.
     *
     * @param {number} id - Work item id
     * @param {number} fromRevision - Revision from which comments are to be fetched
     * @param {number} top - The number of comments to return
     * @param {WorkItemTrackingInterfaces.CommentSortOrder} order - Ascending or descending by revision id
     */
    getComments(id: number, fromRevision?: number, top?: number, order?: WorkItemTrackingInterfaces.CommentSortOrder): Promise<WorkItemTrackingInterfaces.WorkItemComments>;
    /**
     * Deletes the field.
     *
     * @param {string} fieldNameOrRefName - Field simple name or reference name
     * @param {string} project - Project ID or project name
     */
    deleteField(fieldNameOrRefName: string, project?: string): Promise<void>;
    /**
     * Gets information on a specific field.
     *
     * @param {string} fieldNameOrRefName - Field simple name or reference name
     * @param {string} project - Project ID or project name
     */
    getField(fieldNameOrRefName: string, project?: string): Promise<WorkItemTrackingInterfaces.WorkItemField>;
    /**
     * Returns information for all fields.
     *
     * @param {string} project - Project ID or project name
     * @param {WorkItemTrackingInterfaces.GetFieldsExpand} expand - Use ExtensionFields to include extension fields, otherwise exclude them. Unless the feature flag for this parameter is enabled, extension fields are always included.
     */
    getFields(project?: string, expand?: WorkItemTrackingInterfaces.GetFieldsExpand): Promise<WorkItemTrackingInterfaces.WorkItemField[]>;
    /**
     * Updates the field.
     *
     * @param {WorkItemTrackingInterfaces.WorkItemField} workItemField - New field definition
     * @param {string} fieldNameOrRefName - Field simple name or reference name
     * @param {string} project - Project ID or project name
     */
    updateField(workItemField: WorkItemTrackingInterfaces.WorkItemField, fieldNameOrRefName: string, project?: string): Promise<void>;
    /**
     * Creates a query, or moves a query.
     *
     * @param {WorkItemTrackingInterfaces.QueryHierarchyItem} postedQuery - The query to create.
     * @param {string} project - Project ID or project name
     * @param {string} query - The parent path for the query to create.
     */
    createQuery(postedQuery: WorkItemTrackingInterfaces.QueryHierarchyItem, project: string, query: string): Promise<WorkItemTrackingInterfaces.QueryHierarchyItem>;
    /**
     * Delete a query or a folder
     *
     * @param {string} project - Project ID or project name
     * @param {string} query - ID or path of the query or folder to delete.
     */
    deleteQuery(project: string, query: string): Promise<void>;
    /**
     * Gets the root queries and their children
     *
     * @param {string} project - Project ID or project name
     * @param {WorkItemTrackingInterfaces.QueryExpand} expand - Include the query string (wiql), clauses, query result columns, and sort options in the results.
     * @param {number} depth - In the folder of queries, return child queries and folders to this depth.
     * @param {boolean} includeDeleted - Include deleted queries and folders
     */
    getQueries(project: string, expand?: WorkItemTrackingInterfaces.QueryExpand, depth?: number, includeDeleted?: boolean): Promise<WorkItemTrackingInterfaces.QueryHierarchyItem[]>;
    /**
     * Retrieves an individual query and its children
     *
     * @param {string} project - Project ID or project name
     * @param {string} query
     * @param {WorkItemTrackingInterfaces.QueryExpand} expand - Include the query string (wiql), clauses, query result columns, and sort options in the results.
     * @param {number} depth - In the folder of queries, return child queries and folders to this depth.
     * @param {boolean} includeDeleted - Include deleted queries and folders
     */
    getQuery(project: string, query: string, expand?: WorkItemTrackingInterfaces.QueryExpand, depth?: number, includeDeleted?: boolean): Promise<WorkItemTrackingInterfaces.QueryHierarchyItem>;
    /**
     * Searches all queries the user has access to in the current project
     *
     * @param {string} project - Project ID or project name
     * @param {string} filter - The text to filter the queries with.
     * @param {number} top - The number of queries to return (Default is 50 and maximum is 200).
     * @param {WorkItemTrackingInterfaces.QueryExpand} expand
     * @param {boolean} includeDeleted - Include deleted queries and folders
     */
    searchQueries(project: string, filter: string, top?: number, expand?: WorkItemTrackingInterfaces.QueryExpand, includeDeleted?: boolean): Promise<WorkItemTrackingInterfaces.QueryHierarchyItemsResult>;
    /**
     * Update a query or a folder. This allows you to update, rename and move queries and folders.
     *
     * @param {WorkItemTrackingInterfaces.QueryHierarchyItem} queryUpdate - The query to update.
     * @param {string} project - Project ID or project name
     * @param {string} query - The path for the query to update.
     * @param {boolean} undeleteDescendants - Undelete the children of this folder.
     */
    updateQuery(queryUpdate: WorkItemTrackingInterfaces.QueryHierarchyItem, project: string, query: string, undeleteDescendants?: boolean): Promise<WorkItemTrackingInterfaces.QueryHierarchyItem>;
    /**
     * Destroys the specified work item permanently from the Recycle Bin. This action can not be undone.
     *
     * @param {number} id - ID of the work item to be destroyed permanently
     * @param {string} project - Project ID or project name
     */
    destroyWorkItem(id: number, project?: string): Promise<void>;
    /**
     * Gets a deleted work item from Recycle Bin.
     *
     * @param {number} id - ID of the work item to be returned
     * @param {string} project - Project ID or project name
     */
    getDeletedWorkItem(id: number, project?: string): Promise<WorkItemTrackingInterfaces.WorkItemDelete>;
    /**
     * Gets a list of the IDs and the URLs of the deleted the work items in the Recycle Bin.
     *
     * @param {string} project - Project ID or project name
     */
    getDeletedWorkItemReferences(project?: string): Promise<WorkItemTrackingInterfaces.WorkItemReference[]>;
    /**
     * Gets the work items from the recycle bin, whose IDs have been specified in the parameters
     *
     * @param {number[]} ids - Comma separated list of IDs of the deleted work items to be returned
     * @param {string} project - Project ID or project name
     */
    getDeletedWorkItems(ids: number[], project?: string): Promise<WorkItemTrackingInterfaces.WorkItemDeleteReference[]>;
    /**
     * Restores the deleted work item from Recycle Bin.
     *
     * @param {WorkItemTrackingInterfaces.WorkItemDeleteUpdate} payload - Paylod with instructions to update the IsDeleted flag to false
     * @param {number} id - ID of the work item to be restored
     * @param {string} project - Project ID or project name
     */
    restoreWorkItem(payload: WorkItemTrackingInterfaces.WorkItemDeleteUpdate, id: number, project?: string): Promise<WorkItemTrackingInterfaces.WorkItemDelete>;
    /**
     * Returns a fully hydrated work item for the requested revision
     *
     * @param {number} id
     * @param {number} revisionNumber
     * @param {WorkItemTrackingInterfaces.WorkItemExpand} expand
     */
    getRevision(id: number, revisionNumber: number, expand?: WorkItemTrackingInterfaces.WorkItemExpand): Promise<WorkItemTrackingInterfaces.WorkItem>;
    /**
     * Returns the list of fully hydrated work item revisions, paged.
     *
     * @param {number} id
     * @param {number} top
     * @param {number} skip
     * @param {WorkItemTrackingInterfaces.WorkItemExpand} expand
     */
    getRevisions(id: number, top?: number, skip?: number, expand?: WorkItemTrackingInterfaces.WorkItemExpand): Promise<WorkItemTrackingInterfaces.WorkItem[]>;
    /**
     * Validates the fields values.
     *
     * @param {WorkItemTrackingInterfaces.FieldsToEvaluate} ruleEngineInput
     */
    evaluateRulesOnField(ruleEngineInput: WorkItemTrackingInterfaces.FieldsToEvaluate): Promise<void>;
    /**
     * Creates a template
     *
     * @param {WorkItemTrackingInterfaces.WorkItemTemplate} template - Template contents
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    createTemplate(template: WorkItemTrackingInterfaces.WorkItemTemplate, teamContext: TfsCoreInterfaces.TeamContext): Promise<WorkItemTrackingInterfaces.WorkItemTemplate>;
    /**
     * Gets template
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} workitemtypename - Optional, When specified returns templates for given Work item type.
     */
    getTemplates(teamContext: TfsCoreInterfaces.TeamContext, workitemtypename?: string): Promise<WorkItemTrackingInterfaces.WorkItemTemplateReference[]>;
    /**
     * Deletes the template with given id
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} templateId - Template id
     */
    deleteTemplate(teamContext: TfsCoreInterfaces.TeamContext, templateId: string): Promise<void>;
    /**
     * Gets the template with specified id
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} templateId - Template Id
     */
    getTemplate(teamContext: TfsCoreInterfaces.TeamContext, templateId: string): Promise<WorkItemTrackingInterfaces.WorkItemTemplate>;
    /**
     * Replace template contents
     *
     * @param {WorkItemTrackingInterfaces.WorkItemTemplate} templateContent - Template contents to replace with
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} templateId - Template id
     */
    replaceTemplate(templateContent: WorkItemTrackingInterfaces.WorkItemTemplate, teamContext: TfsCoreInterfaces.TeamContext, templateId: string): Promise<WorkItemTrackingInterfaces.WorkItemTemplate>;
    /**
     * Returns a single update for a work item
     *
     * @param {number} id
     * @param {number} updateNumber
     */
    getUpdate(id: number, updateNumber: number): Promise<WorkItemTrackingInterfaces.WorkItemUpdate>;
    /**
     * Returns a the deltas between work item revisions
     *
     * @param {number} id
     * @param {number} top
     * @param {number} skip
     */
    getUpdates(id: number, top?: number, skip?: number): Promise<WorkItemTrackingInterfaces.WorkItemUpdate[]>;
    /**
     * Gets the results of the query given its WIQL.
     *
     * @param {WorkItemTrackingInterfaces.Wiql} wiql - The query containing the WIQL.
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {boolean} timePrecision - Whether or not to use time precision.
     * @param {number} top - The max number of results to return.
     */
    queryByWiql(wiql: WorkItemTrackingInterfaces.Wiql, teamContext?: TfsCoreInterfaces.TeamContext, timePrecision?: boolean, top?: number): Promise<WorkItemTrackingInterfaces.WorkItemQueryResult>;
    /**
     * Gets the results of the query given the query ID.
     *
     * @param {string} id - The query ID.
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {boolean} timePrecision - Whether or not to use time precision.
     */
    queryById(id: string, teamContext?: TfsCoreInterfaces.TeamContext, timePrecision?: boolean): Promise<WorkItemTrackingInterfaces.WorkItemQueryResult>;
    /**
     * Get a work item icon given the friendly name and icon color.
     *
     * @param {string} icon - The name of the icon
     * @param {string} color - The 6-digit hex color for the icon
     * @param {number} v - The version of the icon (used only for cache invalidation)
     */
    getWorkItemIconJson(icon: string, color?: string, v?: number): Promise<WorkItemTrackingInterfaces.WorkItemIcon>;
    /**
     * Get a list of all work item icons.
     *
     */
    getWorkItemIcons(): Promise<WorkItemTrackingInterfaces.WorkItemIcon[]>;
    /**
     * Get a work item icon given the friendly name and icon color.
     *
     * @param {string} icon - The name of the icon
     * @param {string} color - The 6-digit hex color for the icon
     * @param {number} v - The version of the icon (used only for cache invalidation)
     */
    getWorkItemIconSvg(icon: string, color?: string, v?: number): Promise<NodeJS.ReadableStream>;
    /**
     * Get a batch of work item links
     *
     * @param {string} project - Project ID or project name
     * @param {string[]} types - A list of types to filter the results to specific work item types. Omit this parameter to get work item links of all work item types.
     * @param {string} continuationToken - Specifies the continuationToken to start the batch from. Omit this parameter to get the first batch of links.
     * @param {Date} startDateTime - Date/time to use as a starting point for link changes. Only link changes that occurred after that date/time will be returned. Cannot be used in conjunction with 'watermark' parameter.
     */
    getReportingLinks(project?: string, types?: string[], continuationToken?: string, startDateTime?: Date): Promise<WorkItemTrackingInterfaces.ReportingWorkItemLinksBatch>;
    /**
     * Gets the work item relation type definition.
     *
     * @param {string} relation - The relation name
     */
    getRelationType(relation: string): Promise<WorkItemTrackingInterfaces.WorkItemRelationType>;
    /**
     * Gets the work item relation types.
     *
     */
    getRelationTypes(): Promise<WorkItemTrackingInterfaces.WorkItemRelationType[]>;
    /**
     * Get a batch of work item revisions with the option of including deleted items
     *
     * @param {string} project - Project ID or project name
     * @param {string[]} fields - A list of fields to return in work item revisions. Omit this parameter to get all reportable fields.
     * @param {string[]} types - A list of types to filter the results to specific work item types. Omit this parameter to get work item revisions of all work item types.
     * @param {string} continuationToken - Specifies the watermark to start the batch from. Omit this parameter to get the first batch of revisions.
     * @param {Date} startDateTime - Date/time to use as a starting point for revisions, all revisions will occur after this date/time. Cannot be used in conjunction with 'watermark' parameter.
     * @param {boolean} includeIdentityRef - Return an identity reference instead of a string value for identity fields.
     * @param {boolean} includeDeleted - Specify if the deleted item should be returned.
     * @param {boolean} includeTagRef - Specify if the tag objects should be returned for System.Tags field.
     * @param {boolean} includeLatestOnly - Return only the latest revisions of work items, skipping all historical revisions
     * @param {WorkItemTrackingInterfaces.ReportingRevisionsExpand} expand - Return all the fields in work item revisions, including long text fields which are not returned by default
     * @param {boolean} includeDiscussionChangesOnly - Return only the those revisions of work items, where only history field was changed
     * @param {number} maxPageSize - The maximum number of results to return in this batch
     */
    readReportingRevisionsGet(project?: string, fields?: string[], types?: string[], continuationToken?: string, startDateTime?: Date, includeIdentityRef?: boolean, includeDeleted?: boolean, includeTagRef?: boolean, includeLatestOnly?: boolean, expand?: WorkItemTrackingInterfaces.ReportingRevisionsExpand, includeDiscussionChangesOnly?: boolean, maxPageSize?: number): Promise<WorkItemTrackingInterfaces.ReportingWorkItemRevisionsBatch>;
    /**
     * Get a batch of work item revisions. This request may be used if your list of fields is large enough that it may run the URL over the length limit.
     *
     * @param {WorkItemTrackingInterfaces.ReportingWorkItemRevisionsFilter} filter - An object that contains request settings: field filter, type filter, identity format
     * @param {string} project - Project ID or project name
     * @param {string} continuationToken - Specifies the watermark to start the batch from. Omit this parameter to get the first batch of revisions.
     * @param {Date} startDateTime - Date/time to use as a starting point for revisions, all revisions will occur after this date/time. Cannot be used in conjunction with 'watermark' parameter.
     * @param {WorkItemTrackingInterfaces.ReportingRevisionsExpand} expand
     */
    readReportingRevisionsPost(filter: WorkItemTrackingInterfaces.ReportingWorkItemRevisionsFilter, project?: string, continuationToken?: string, startDateTime?: Date, expand?: WorkItemTrackingInterfaces.ReportingRevisionsExpand): Promise<WorkItemTrackingInterfaces.ReportingWorkItemRevisionsBatch>;
    /**
     * Deletes the specified work item and sends it to the Recycle Bin, so that it can be restored back, if required. Optionally, if the destroy parameter has been set to true, it destroys the work item permanently.
     *
     * @param {number} id - ID of the work item to be deleted
     * @param {boolean} destroy - Optional parameter, if set to true, the work item is deleted permanently
     */
    deleteWorkItem(id: number, destroy?: boolean): Promise<WorkItemTrackingInterfaces.WorkItemDelete>;
    /**
     * Returns a single work item.
     *
     * @param {number} id - The work item id
     * @param {string[]} fields - Comma-separated list of requested fields
     * @param {Date} asOf - AsOf UTC date time string
     * @param {WorkItemTrackingInterfaces.WorkItemExpand} expand - The expand parameters for work item attributes
     */
    getWorkItem(id: number, fields?: string[], asOf?: Date, expand?: WorkItemTrackingInterfaces.WorkItemExpand): Promise<WorkItemTrackingInterfaces.WorkItem>;
    /**
     * Returns a list of work items.
     *
     * @param {number[]} ids - The comma-separated list of requested work item ids
     * @param {string[]} fields - Comma-separated list of requested fields
     * @param {Date} asOf - AsOf UTC date time string
     * @param {WorkItemTrackingInterfaces.WorkItemExpand} expand - The expand parameters for work item attributes
     * @param {WorkItemTrackingInterfaces.WorkItemErrorPolicy} errorPolicy - The flag to control error policy in a bulk get work items request
     */
    getWorkItems(ids: number[], fields?: string[], asOf?: Date, expand?: WorkItemTrackingInterfaces.WorkItemExpand, errorPolicy?: WorkItemTrackingInterfaces.WorkItemErrorPolicy): Promise<WorkItemTrackingInterfaces.WorkItem[]>;
    /**
     * Updates a single work item.
     *
     * @param {VSSInterfaces.JsonPatchDocument} document - The JSON Patch document representing the update
     * @param {number} id - The id of the work item to update
     * @param {boolean} validateOnly - Indicate if you only want to validate the changes without saving the work item
     * @param {boolean} bypassRules - Do not enforce the work item type rules on this update
     * @param {boolean} suppressNotifications - Do not fire any notifications for this change
     */
    updateWorkItem(customHeaders: any, document: VSSInterfaces.JsonPatchDocument, id: number, validateOnly?: boolean, bypassRules?: boolean, suppressNotifications?: boolean): Promise<WorkItemTrackingInterfaces.WorkItem>;
    /**
     * Creates a single work item.
     *
     * @param {VSSInterfaces.JsonPatchDocument} document - The JSON Patch document representing the work item
     * @param {string} project - Project ID or project name
     * @param {string} type - The work item type of the work item to create
     * @param {boolean} validateOnly - Indicate if you only want to validate the changes without saving the work item
     * @param {boolean} bypassRules - Do not enforce the work item type rules on this update
     * @param {boolean} suppressNotifications - Do not fire any notifications for this change
     */
    createWorkItem(customHeaders: any, document: VSSInterfaces.JsonPatchDocument, project: string, type: string, validateOnly?: boolean, bypassRules?: boolean, suppressNotifications?: boolean): Promise<WorkItemTrackingInterfaces.WorkItem>;
    /**
     * Returns a single work item from a template.
     *
     * @param {string} project - Project ID or project name
     * @param {string} type - The work item type name
     * @param {string} fields - Comma-separated list of requested fields
     * @param {Date} asOf - AsOf UTC date time string
     * @param {WorkItemTrackingInterfaces.WorkItemExpand} expand - The expand parameters for work item attributes
     */
    getWorkItemTemplate(project: string, type: string, fields?: string, asOf?: Date, expand?: WorkItemTrackingInterfaces.WorkItemExpand): Promise<WorkItemTrackingInterfaces.WorkItem>;
    /**
     * INTERNAL ONLY: It will be used for My account work experience. Get the work item type state color for multiple projects
     *
     * @param {string[]} projectNames
     */
    getWorkItemStateColors(projectNames: string[]): Promise<WorkItemTrackingInterfaces.ProjectWorkItemStateColors[]>;
    /**
     * Returns the next state on the given work item IDs.
     *
     * @param {number[]} ids - list of work item ids
     * @param {string} action - possible actions. Currently only supports checkin
     */
    getWorkItemNextStatesOnCheckinAction(ids: number[], action?: string): Promise<WorkItemTrackingInterfaces.WorkItemNextStateOnTransition[]>;
    /**
     * Returns a the deltas between work item revisions.
     *
     * @param {string} project - Project ID or project name
     */
    getWorkItemTypeCategories(project: string): Promise<WorkItemTrackingInterfaces.WorkItemTypeCategory[]>;
    /**
     * Returns a the deltas between work item revisions.
     *
     * @param {string} project - Project ID or project name
     * @param {string} category - The category name
     */
    getWorkItemTypeCategory(project: string, category: string): Promise<WorkItemTrackingInterfaces.WorkItemTypeCategory>;
    /**
     * INTERNAL ONLY: It will be used for My account work experience. Get the wit type color for multiple projects
     *
     * @param {string[]} projectNames
     */
    getWorkItemTypeColors(projectNames: string[]): Promise<{
        key: string;
        value: WorkItemTrackingInterfaces.WorkItemTypeColor[];
    }[]>;
    /**
     * INTERNAL ONLY: It is used for color and icon providers. Get the wit type color for multiple projects
     *
     * @param {string[]} projectNames
     */
    getWorkItemTypeColorAndIcons(projectNames: string[]): Promise<{
        key: string;
        value: WorkItemTrackingInterfaces.WorkItemTypeColorAndIcon[];
    }[]>;
    /**
     * Returns a work item type definition.
     *
     * @param {string} project - Project ID or project name
     * @param {string} type - Work item type name
     */
    getWorkItemType(project: string, type: string): Promise<WorkItemTrackingInterfaces.WorkItemType>;
    /**
     * Returns the list of work item types
     *
     * @param {string} project - Project ID or project name
     */
    getWorkItemTypes(project: string): Promise<WorkItemTrackingInterfaces.WorkItemType[]>;
    /**
     * Get field of a work item type.
     *
     * @param {string} project - Project ID or project name
     * @param {string} type - Work item type
     * @param {string} field
     * @param {WorkItemTrackingInterfaces.WorkItemTypeFieldsExpandLevel} expand - Expand level for the API response. Properties: to include allowedvalues, default value, isRequired etc. as a part of response; None: to skip these properties.
     */
    getWorkItemTypeField(project: string, type: string, field: string, expand?: WorkItemTrackingInterfaces.WorkItemTypeFieldsExpandLevel): Promise<WorkItemTrackingInterfaces.WorkItemTypeFieldInstance>;
    /**
     * Get a list of fields for a work Item type.
     *
     * @param {string} project - Project ID or project name
     * @param {string} type - Work item type.
     * @param {WorkItemTrackingInterfaces.WorkItemTypeFieldsExpandLevel} expand - Expand level for the API response. Properties: to include allowedvalues, default value, isRequired etc. as a part of response; None: to skip these properties.
     */
    getWorkItemTypeFields(project: string, type: string, expand?: WorkItemTrackingInterfaces.WorkItemTypeFieldsExpandLevel): Promise<WorkItemTrackingInterfaces.WorkItemTypeFieldInstance[]>;
    /**
     * Returns the state names and colors for a work item type.
     *
     * @param {string} project - Project ID or project name
     * @param {string} type - The state name
     */
    getWorkItemTypeStates(project: string, type: string): Promise<WorkItemTrackingInterfaces.WorkItemStateColor[]>;
    /**
     * Export work item type
     *
     * @param {string} project - Project ID or project name
     * @param {string} type
     * @param {boolean} exportGlobalLists
     */
    exportWorkItemTypeDefinition(project?: string, type?: string, exportGlobalLists?: boolean): Promise<WorkItemTrackingInterfaces.WorkItemTypeTemplate>;
    /**
     * Add/updates a work item type
     *
     * @param {WorkItemTrackingInterfaces.WorkItemTypeTemplateUpdateModel} updateModel
     * @param {string} project - Project ID or project name
     */
    updateWorkItemTypeDefinition(updateModel: WorkItemTrackingInterfaces.WorkItemTypeTemplateUpdateModel, project?: string): Promise<WorkItemTrackingInterfaces.ProvisioningResult>;
}
