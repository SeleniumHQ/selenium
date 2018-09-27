/// <reference types="node" />
import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import TfvcInterfaces = require("./interfaces/TfvcInterfaces");
export interface ITfvcApi extends basem.ClientApiBase {
    getBranch(path: string, project?: string, includeParent?: boolean, includeChildren?: boolean): Promise<TfvcInterfaces.TfvcBranch>;
    getBranches(project?: string, includeParent?: boolean, includeChildren?: boolean, includeDeleted?: boolean, includeLinks?: boolean): Promise<TfvcInterfaces.TfvcBranch[]>;
    getBranchRefs(scopePath: string, project?: string, includeDeleted?: boolean, includeLinks?: boolean): Promise<TfvcInterfaces.TfvcBranchRef[]>;
    getChangesetChanges(id?: number, skip?: number, top?: number): Promise<TfvcInterfaces.TfvcChange[]>;
    createChangeset(changeset: TfvcInterfaces.TfvcChangeset, project?: string): Promise<TfvcInterfaces.TfvcChangesetRef>;
    getChangeset(id: number, project?: string, maxChangeCount?: number, includeDetails?: boolean, includeWorkItems?: boolean, maxCommentLength?: number, includeSourceRename?: boolean, skip?: number, top?: number, orderby?: string, searchCriteria?: TfvcInterfaces.TfvcChangesetSearchCriteria): Promise<TfvcInterfaces.TfvcChangeset>;
    getChangesets(project?: string, maxCommentLength?: number, skip?: number, top?: number, orderby?: string, searchCriteria?: TfvcInterfaces.TfvcChangesetSearchCriteria): Promise<TfvcInterfaces.TfvcChangesetRef[]>;
    getBatchedChangesets(changesetsRequestData: TfvcInterfaces.TfvcChangesetsRequestData): Promise<TfvcInterfaces.TfvcChangesetRef[]>;
    getChangesetWorkItems(id?: number): Promise<TfvcInterfaces.AssociatedWorkItem[]>;
    getItemsBatch(itemRequestData: TfvcInterfaces.TfvcItemRequestData, project?: string): Promise<TfvcInterfaces.TfvcItem[][]>;
    getItemsBatchZip(itemRequestData: TfvcInterfaces.TfvcItemRequestData, project?: string): Promise<NodeJS.ReadableStream>;
    getItem(path: string, project?: string, fileName?: string, download?: boolean, scopePath?: string, recursionLevel?: TfvcInterfaces.VersionControlRecursionType, versionDescriptor?: TfvcInterfaces.TfvcVersionDescriptor): Promise<TfvcInterfaces.TfvcItem>;
    getItemContent(path: string, project?: string, fileName?: string, download?: boolean, scopePath?: string, recursionLevel?: TfvcInterfaces.VersionControlRecursionType, versionDescriptor?: TfvcInterfaces.TfvcVersionDescriptor): Promise<NodeJS.ReadableStream>;
    getItems(project?: string, scopePath?: string, recursionLevel?: TfvcInterfaces.VersionControlRecursionType, includeLinks?: boolean, versionDescriptor?: TfvcInterfaces.TfvcVersionDescriptor): Promise<TfvcInterfaces.TfvcItem[]>;
    getItemText(path: string, project?: string, fileName?: string, download?: boolean, scopePath?: string, recursionLevel?: TfvcInterfaces.VersionControlRecursionType, versionDescriptor?: TfvcInterfaces.TfvcVersionDescriptor): Promise<NodeJS.ReadableStream>;
    getItemZip(path: string, project?: string, fileName?: string, download?: boolean, scopePath?: string, recursionLevel?: TfvcInterfaces.VersionControlRecursionType, versionDescriptor?: TfvcInterfaces.TfvcVersionDescriptor): Promise<NodeJS.ReadableStream>;
    getLabelItems(labelId: string, top?: number, skip?: number): Promise<TfvcInterfaces.TfvcItem[]>;
    getLabel(labelId: string, requestData: TfvcInterfaces.TfvcLabelRequestData, project?: string): Promise<TfvcInterfaces.TfvcLabel>;
    getLabels(requestData: TfvcInterfaces.TfvcLabelRequestData, project?: string, top?: number, skip?: number): Promise<TfvcInterfaces.TfvcLabelRef[]>;
    getShelvesetChanges(shelvesetId: string, top?: number, skip?: number): Promise<TfvcInterfaces.TfvcChange[]>;
    getShelveset(shelvesetId: string, requestData?: TfvcInterfaces.TfvcShelvesetRequestData): Promise<TfvcInterfaces.TfvcShelveset>;
    getShelvesets(requestData?: TfvcInterfaces.TfvcShelvesetRequestData, top?: number, skip?: number): Promise<TfvcInterfaces.TfvcShelvesetRef[]>;
    getShelvesetWorkItems(shelvesetId: string): Promise<TfvcInterfaces.AssociatedWorkItem[]>;
}
export declare class TfvcApi extends basem.ClientApiBase implements ITfvcApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
     * Get a single branch hierarchy at the given path with parents or children as specified.
     *
     * @param {string} path - Full path to the branch.  Default: $/ Examples: $/, $/MyProject, $/MyProject/SomeFolder.
     * @param {string} project - Project ID or project name
     * @param {boolean} includeParent - Return the parent branch, if there is one. Default: False
     * @param {boolean} includeChildren - Return child branches, if there are any. Default: False
     */
    getBranch(path: string, project?: string, includeParent?: boolean, includeChildren?: boolean): Promise<TfvcInterfaces.TfvcBranch>;
    /**
     * Get a collection of branch roots -- first-level children, branches with no parents.
     *
     * @param {string} project - Project ID or project name
     * @param {boolean} includeParent - Return the parent branch, if there is one. Default: False
     * @param {boolean} includeChildren - Return the child branches for each root branch. Default: False
     * @param {boolean} includeDeleted - Return deleted branches. Default: False
     * @param {boolean} includeLinks - Return links. Default: False
     */
    getBranches(project?: string, includeParent?: boolean, includeChildren?: boolean, includeDeleted?: boolean, includeLinks?: boolean): Promise<TfvcInterfaces.TfvcBranch[]>;
    /**
     * Get branch hierarchies below the specified scopePath
     *
     * @param {string} scopePath - Full path to the branch.  Default: $/ Examples: $/, $/MyProject, $/MyProject/SomeFolder.
     * @param {string} project - Project ID or project name
     * @param {boolean} includeDeleted - Return deleted branches. Default: False
     * @param {boolean} includeLinks - Return links. Default: False
     */
    getBranchRefs(scopePath: string, project?: string, includeDeleted?: boolean, includeLinks?: boolean): Promise<TfvcInterfaces.TfvcBranchRef[]>;
    /**
     * Retrieve Tfvc changes for a given changeset.
     *
     * @param {number} id - ID of the changeset. Default: null
     * @param {number} skip - Number of results to skip. Default: null
     * @param {number} top - The maximum number of results to return. Default: null
     */
    getChangesetChanges(id?: number, skip?: number, top?: number): Promise<TfvcInterfaces.TfvcChange[]>;
    /**
     * Create a new changeset.
     *
     * @param {TfvcInterfaces.TfvcChangeset} changeset
     * @param {string} project - Project ID or project name
     */
    createChangeset(changeset: TfvcInterfaces.TfvcChangeset, project?: string): Promise<TfvcInterfaces.TfvcChangesetRef>;
    /**
     * Retrieve a Tfvc Changeset
     *
     * @param {number} id - Changeset Id to retrieve.
     * @param {string} project - Project ID or project name
     * @param {number} maxChangeCount - Number of changes to return (maximum 100 changes) Default: 0
     * @param {boolean} includeDetails - Include policy details and check-in notes in the response. Default: false
     * @param {boolean} includeWorkItems - Include workitems. Default: false
     * @param {number} maxCommentLength - Include details about associated work items in the response. Default: null
     * @param {boolean} includeSourceRename - Include renames.  Default: false
     * @param {number} skip - Number of results to skip. Default: null
     * @param {number} top - The maximum number of results to return. Default: null
     * @param {string} orderby - Results are sorted by ID in descending order by default. Use id asc to sort by ID in ascending order.
     * @param {TfvcInterfaces.TfvcChangesetSearchCriteria} searchCriteria - Following criteria available (.itemPath, .version, .versionType, .versionOption, .author, .fromId, .toId, .fromDate, .toDate) Default: null
     */
    getChangeset(id: number, project?: string, maxChangeCount?: number, includeDetails?: boolean, includeWorkItems?: boolean, maxCommentLength?: number, includeSourceRename?: boolean, skip?: number, top?: number, orderby?: string, searchCriteria?: TfvcInterfaces.TfvcChangesetSearchCriteria): Promise<TfvcInterfaces.TfvcChangeset>;
    /**
     * Retrieve Tfvc Changesets
     *
     * @param {string} project - Project ID or project name
     * @param {number} maxCommentLength - Include details about associated work items in the response. Default: null
     * @param {number} skip - Number of results to skip. Default: null
     * @param {number} top - The maximum number of results to return. Default: null
     * @param {string} orderby - Results are sorted by ID in descending order by default. Use id asc to sort by ID in ascending order.
     * @param {TfvcInterfaces.TfvcChangesetSearchCriteria} searchCriteria - Following criteria available (.itemPath, .version, .versionType, .versionOption, .author, .fromId, .toId, .fromDate, .toDate) Default: null
     */
    getChangesets(project?: string, maxCommentLength?: number, skip?: number, top?: number, orderby?: string, searchCriteria?: TfvcInterfaces.TfvcChangesetSearchCriteria): Promise<TfvcInterfaces.TfvcChangesetRef[]>;
    /**
     * Returns changesets for a given list of changeset Ids.
     *
     * @param {TfvcInterfaces.TfvcChangesetsRequestData} changesetsRequestData - List of changeset IDs.
     */
    getBatchedChangesets(changesetsRequestData: TfvcInterfaces.TfvcChangesetsRequestData): Promise<TfvcInterfaces.TfvcChangesetRef[]>;
    /**
     * Retrieves the work items associated with a particular changeset.
     *
     * @param {number} id - ID of the changeset. Default: null
     */
    getChangesetWorkItems(id?: number): Promise<TfvcInterfaces.AssociatedWorkItem[]>;
    /**
     * Post for retrieving a set of items given a list of paths or a long path. Allows for specifying the recursionLevel and version descriptors for each path.
     *
     * @param {TfvcInterfaces.TfvcItemRequestData} itemRequestData
     * @param {string} project - Project ID or project name
     */
    getItemsBatch(itemRequestData: TfvcInterfaces.TfvcItemRequestData, project?: string): Promise<TfvcInterfaces.TfvcItem[][]>;
    /**
     * Post for retrieving a set of items given a list of paths or a long path. Allows for specifying the recursionLevel and version descriptors for each path.
     *
     * @param {TfvcInterfaces.TfvcItemRequestData} itemRequestData
     * @param {string} project - Project ID or project name
     */
    getItemsBatchZip(itemRequestData: TfvcInterfaces.TfvcItemRequestData, project?: string): Promise<NodeJS.ReadableStream>;
    /**
     * Get Item Metadata and/or Content for a single item. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content which is always returned as a download.
     *
     * @param {string} path - Version control path of an individual item to return.
     * @param {string} project - Project ID or project name
     * @param {string} fileName - file name of item returned.
     * @param {boolean} download - If true, create a downloadable attachment.
     * @param {string} scopePath - Version control path of a folder to return multiple items.
     * @param {TfvcInterfaces.VersionControlRecursionType} recursionLevel - None (just the item), or OneLevel (contents of a folder).
     * @param {TfvcInterfaces.TfvcVersionDescriptor} versionDescriptor
     */
    getItem(path: string, project?: string, fileName?: string, download?: boolean, scopePath?: string, recursionLevel?: TfvcInterfaces.VersionControlRecursionType, versionDescriptor?: TfvcInterfaces.TfvcVersionDescriptor): Promise<TfvcInterfaces.TfvcItem>;
    /**
     * Get Item Metadata and/or Content for a single item. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content which is always returned as a download.
     *
     * @param {string} path - Version control path of an individual item to return.
     * @param {string} project - Project ID or project name
     * @param {string} fileName - file name of item returned.
     * @param {boolean} download - If true, create a downloadable attachment.
     * @param {string} scopePath - Version control path of a folder to return multiple items.
     * @param {TfvcInterfaces.VersionControlRecursionType} recursionLevel - None (just the item), or OneLevel (contents of a folder).
     * @param {TfvcInterfaces.TfvcVersionDescriptor} versionDescriptor
     */
    getItemContent(path: string, project?: string, fileName?: string, download?: boolean, scopePath?: string, recursionLevel?: TfvcInterfaces.VersionControlRecursionType, versionDescriptor?: TfvcInterfaces.TfvcVersionDescriptor): Promise<NodeJS.ReadableStream>;
    /**
     * Get a list of Tfvc items
     *
     * @param {string} project - Project ID or project name
     * @param {string} scopePath - Version control path of a folder to return multiple items.
     * @param {TfvcInterfaces.VersionControlRecursionType} recursionLevel - None (just the item), or OneLevel (contents of a folder).
     * @param {boolean} includeLinks - True to include links.
     * @param {TfvcInterfaces.TfvcVersionDescriptor} versionDescriptor
     */
    getItems(project?: string, scopePath?: string, recursionLevel?: TfvcInterfaces.VersionControlRecursionType, includeLinks?: boolean, versionDescriptor?: TfvcInterfaces.TfvcVersionDescriptor): Promise<TfvcInterfaces.TfvcItem[]>;
    /**
     * Get Item Metadata and/or Content for a single item. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content which is always returned as a download.
     *
     * @param {string} path - Version control path of an individual item to return.
     * @param {string} project - Project ID or project name
     * @param {string} fileName - file name of item returned.
     * @param {boolean} download - If true, create a downloadable attachment.
     * @param {string} scopePath - Version control path of a folder to return multiple items.
     * @param {TfvcInterfaces.VersionControlRecursionType} recursionLevel - None (just the item), or OneLevel (contents of a folder).
     * @param {TfvcInterfaces.TfvcVersionDescriptor} versionDescriptor
     */
    getItemText(path: string, project?: string, fileName?: string, download?: boolean, scopePath?: string, recursionLevel?: TfvcInterfaces.VersionControlRecursionType, versionDescriptor?: TfvcInterfaces.TfvcVersionDescriptor): Promise<NodeJS.ReadableStream>;
    /**
     * Get Item Metadata and/or Content for a single item. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content which is always returned as a download.
     *
     * @param {string} path - Version control path of an individual item to return.
     * @param {string} project - Project ID or project name
     * @param {string} fileName - file name of item returned.
     * @param {boolean} download - If true, create a downloadable attachment.
     * @param {string} scopePath - Version control path of a folder to return multiple items.
     * @param {TfvcInterfaces.VersionControlRecursionType} recursionLevel - None (just the item), or OneLevel (contents of a folder).
     * @param {TfvcInterfaces.TfvcVersionDescriptor} versionDescriptor
     */
    getItemZip(path: string, project?: string, fileName?: string, download?: boolean, scopePath?: string, recursionLevel?: TfvcInterfaces.VersionControlRecursionType, versionDescriptor?: TfvcInterfaces.TfvcVersionDescriptor): Promise<NodeJS.ReadableStream>;
    /**
     * Get items under a label.
     *
     * @param {string} labelId - Unique identifier of label
     * @param {number} top - Max number of items to return
     * @param {number} skip - Number of items to skip
     */
    getLabelItems(labelId: string, top?: number, skip?: number): Promise<TfvcInterfaces.TfvcItem[]>;
    /**
     * Get a single deep label.
     *
     * @param {string} labelId - Unique identifier of label
     * @param {TfvcInterfaces.TfvcLabelRequestData} requestData - maxItemCount
     * @param {string} project - Project ID or project name
     */
    getLabel(labelId: string, requestData: TfvcInterfaces.TfvcLabelRequestData, project?: string): Promise<TfvcInterfaces.TfvcLabel>;
    /**
     * Get a collection of shallow label references.
     *
     * @param {TfvcInterfaces.TfvcLabelRequestData} requestData - labelScope, name, owner, and itemLabelFilter
     * @param {string} project - Project ID or project name
     * @param {number} top - Max number of labels to return
     * @param {number} skip - Number of labels to skip
     */
    getLabels(requestData: TfvcInterfaces.TfvcLabelRequestData, project?: string, top?: number, skip?: number): Promise<TfvcInterfaces.TfvcLabelRef[]>;
    /**
     * Get changes included in a shelveset.
     *
     * @param {string} shelvesetId - Shelveset's unique ID
     * @param {number} top - Max number of changes to return
     * @param {number} skip - Number of changes to skip
     */
    getShelvesetChanges(shelvesetId: string, top?: number, skip?: number): Promise<TfvcInterfaces.TfvcChange[]>;
    /**
     * Get a single deep shelveset.
     *
     * @param {string} shelvesetId - Shelveset's unique ID
     * @param {TfvcInterfaces.TfvcShelvesetRequestData} requestData - includeDetails, includeWorkItems, maxChangeCount, and maxCommentLength
     */
    getShelveset(shelvesetId: string, requestData?: TfvcInterfaces.TfvcShelvesetRequestData): Promise<TfvcInterfaces.TfvcShelveset>;
    /**
     * Return a collection of shallow shelveset references.
     *
     * @param {TfvcInterfaces.TfvcShelvesetRequestData} requestData - name, owner, and maxCommentLength
     * @param {number} top - Max number of shelvesets to return
     * @param {number} skip - Number of shelvesets to skip
     */
    getShelvesets(requestData?: TfvcInterfaces.TfvcShelvesetRequestData, top?: number, skip?: number): Promise<TfvcInterfaces.TfvcShelvesetRef[]>;
    /**
     * Get work items associated with a shelveset.
     *
     * @param {string} shelvesetId - Shelveset's unique ID
     */
    getShelvesetWorkItems(shelvesetId: string): Promise<TfvcInterfaces.AssociatedWorkItem[]>;
}
