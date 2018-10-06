/// <reference types="node" />
import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import GitInterfaces = require("./interfaces/GitInterfaces");
import TfsCoreInterfaces = require("./interfaces/CoreInterfaces");
import VSSInterfaces = require("./interfaces/common/VSSInterfaces");
export interface IGitApi extends basem.ClientApiBase {
    createAnnotatedTag(tagObject: GitInterfaces.GitAnnotatedTag, project: string, repositoryId: string): Promise<GitInterfaces.GitAnnotatedTag>;
    getAnnotatedTag(project: string, repositoryId: string, objectId: string): Promise<GitInterfaces.GitAnnotatedTag>;
    getBlob(repositoryId: string, sha1: string, project?: string, download?: boolean, fileName?: string): Promise<GitInterfaces.GitBlobRef>;
    getBlobContent(repositoryId: string, sha1: string, project?: string, download?: boolean, fileName?: string): Promise<NodeJS.ReadableStream>;
    getBlobsZip(blobIds: string[], repositoryId: string, project?: string, filename?: string): Promise<NodeJS.ReadableStream>;
    getBlobZip(repositoryId: string, sha1: string, project?: string, download?: boolean, fileName?: string): Promise<NodeJS.ReadableStream>;
    getBranch(repositoryId: string, name: string, project?: string, baseVersionDescriptor?: GitInterfaces.GitVersionDescriptor): Promise<GitInterfaces.GitBranchStats>;
    getBranches(repositoryId: string, project?: string, baseVersionDescriptor?: GitInterfaces.GitVersionDescriptor): Promise<GitInterfaces.GitBranchStats[]>;
    getBranchStatsBatch(searchCriteria: GitInterfaces.GitQueryBranchStatsCriteria, repositoryId: string, project?: string): Promise<GitInterfaces.GitBranchStats[]>;
    getChanges(commitId: string, repositoryId: string, project?: string, top?: number, skip?: number): Promise<GitInterfaces.GitCommitChanges>;
    getCherryPickRelationships(repositoryNameOrId: string, commitId: string, project?: string, includeLinks?: boolean): Promise<GitInterfaces.GitCommitRef[]>;
    createCherryPick(cherryPickToCreate: GitInterfaces.GitAsyncRefOperationParameters, project: string, repositoryId: string): Promise<GitInterfaces.GitCherryPick>;
    getCherryPick(project: string, cherryPickId: number, repositoryId: string): Promise<GitInterfaces.GitCherryPick>;
    getCherryPickForRefName(project: string, repositoryId: string, refName: string): Promise<GitInterfaces.GitCherryPick>;
    getCommit(commitId: string, repositoryId: string, project?: string, changeCount?: number): Promise<GitInterfaces.GitCommit>;
    getCommits(repositoryId: string, searchCriteria: GitInterfaces.GitQueryCommitsCriteria, project?: string, skip?: number, top?: number): Promise<GitInterfaces.GitCommitRef[]>;
    getPushCommits(repositoryId: string, pushId: number, project?: string, top?: number, skip?: number, includeLinks?: boolean): Promise<GitInterfaces.GitCommitRef[]>;
    getCommitsBatch(searchCriteria: GitInterfaces.GitQueryCommitsCriteria, repositoryId: string, project?: string, skip?: number, top?: number, includeStatuses?: boolean): Promise<GitInterfaces.GitCommitRef[]>;
    getDeletedRepositories(project: string): Promise<GitInterfaces.GitDeletedRepository[]>;
    getForks(repositoryNameOrId: string, collectionId: string, project?: string, includeLinks?: boolean): Promise<GitInterfaces.GitRepositoryRef[]>;
    createForkSyncRequest(syncParams: GitInterfaces.GitForkSyncRequestParameters, repositoryNameOrId: string, project?: string, includeLinks?: boolean): Promise<GitInterfaces.GitForkSyncRequest>;
    getForkSyncRequest(repositoryNameOrId: string, forkSyncOperationId: number, project?: string, includeLinks?: boolean): Promise<GitInterfaces.GitForkSyncRequest>;
    getForkSyncRequests(repositoryNameOrId: string, project?: string, includeAbandoned?: boolean, includeLinks?: boolean): Promise<GitInterfaces.GitForkSyncRequest[]>;
    createImportRequest(importRequest: GitInterfaces.GitImportRequest, project: string, repositoryId: string): Promise<GitInterfaces.GitImportRequest>;
    getImportRequest(project: string, repositoryId: string, importRequestId: number): Promise<GitInterfaces.GitImportRequest>;
    queryImportRequests(project: string, repositoryId: string, includeAbandoned?: boolean): Promise<GitInterfaces.GitImportRequest[]>;
    updateImportRequest(importRequestToUpdate: GitInterfaces.GitImportRequest, project: string, repositoryId: string, importRequestId: number): Promise<GitInterfaces.GitImportRequest>;
    getItem(repositoryId: string, path: string, project?: string, scopePath?: string, recursionLevel?: GitInterfaces.VersionControlRecursionType, includeContentMetadata?: boolean, latestProcessedChange?: boolean, download?: boolean, versionDescriptor?: GitInterfaces.GitVersionDescriptor): Promise<GitInterfaces.GitItem>;
    getItemContent(repositoryId: string, path: string, project?: string, scopePath?: string, recursionLevel?: GitInterfaces.VersionControlRecursionType, includeContentMetadata?: boolean, latestProcessedChange?: boolean, download?: boolean, versionDescriptor?: GitInterfaces.GitVersionDescriptor): Promise<NodeJS.ReadableStream>;
    getItems(repositoryId: string, project?: string, scopePath?: string, recursionLevel?: GitInterfaces.VersionControlRecursionType, includeContentMetadata?: boolean, latestProcessedChange?: boolean, download?: boolean, includeLinks?: boolean, versionDescriptor?: GitInterfaces.GitVersionDescriptor): Promise<GitInterfaces.GitItem[]>;
    getItemText(repositoryId: string, path: string, project?: string, scopePath?: string, recursionLevel?: GitInterfaces.VersionControlRecursionType, includeContentMetadata?: boolean, latestProcessedChange?: boolean, download?: boolean, versionDescriptor?: GitInterfaces.GitVersionDescriptor): Promise<NodeJS.ReadableStream>;
    getItemZip(repositoryId: string, path: string, project?: string, scopePath?: string, recursionLevel?: GitInterfaces.VersionControlRecursionType, includeContentMetadata?: boolean, latestProcessedChange?: boolean, download?: boolean, versionDescriptor?: GitInterfaces.GitVersionDescriptor): Promise<NodeJS.ReadableStream>;
    getItemsBatch(requestData: GitInterfaces.GitItemRequestData, repositoryId: string, project?: string): Promise<GitInterfaces.GitItem[][]>;
    getMergeBases(repositoryNameOrId: string, commitId: string, otherCommitId: string, project?: string, otherCollectionId?: string, otherRepositoryId?: string): Promise<GitInterfaces.GitCommitRef[]>;
    createAttachment(customHeaders: any, contentStream: NodeJS.ReadableStream, fileName: string, repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.Attachment>;
    deleteAttachment(fileName: string, repositoryId: string, pullRequestId: number, project?: string): Promise<void>;
    getAttachmentContent(fileName: string, repositoryId: string, pullRequestId: number, project?: string): Promise<NodeJS.ReadableStream>;
    getAttachments(repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.Attachment[]>;
    getAttachmentZip(fileName: string, repositoryId: string, pullRequestId: number, project?: string): Promise<NodeJS.ReadableStream>;
    createLike(repositoryId: string, pullRequestId: number, threadId: number, commentId: number, project?: string): Promise<void>;
    deleteLike(repositoryId: string, pullRequestId: number, threadId: number, commentId: number, project?: string): Promise<void>;
    getLikes(repositoryId: string, pullRequestId: number, threadId: number, commentId: number, project?: string): Promise<VSSInterfaces.IdentityRef[]>;
    getPullRequestIterationCommits(repositoryId: string, pullRequestId: number, iterationId: number, project?: string): Promise<GitInterfaces.GitCommitRef[]>;
    getPullRequestCommits(repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.GitCommitRef[]>;
    getPullRequestConflict(repositoryId: string, pullRequestId: number, conflictId: number, project?: string): Promise<GitInterfaces.GitConflict>;
    getPullRequestConflicts(repositoryId: string, pullRequestId: number, project?: string, skip?: number, top?: number, includeObsolete?: boolean, excludeResolved?: boolean, onlyResolved?: boolean): Promise<GitInterfaces.GitConflict[]>;
    updatePullRequestConflict(conflict: GitInterfaces.GitConflict, repositoryId: string, pullRequestId: number, conflictId: number, project?: string): Promise<GitInterfaces.GitConflict>;
    updatePullRequestConflicts(conflictUpdates: GitInterfaces.GitConflict[], repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.GitConflictUpdateResult[]>;
    getPullRequestIterationChanges(repositoryId: string, pullRequestId: number, iterationId: number, project?: string, top?: number, skip?: number, compareTo?: number): Promise<GitInterfaces.GitPullRequestIterationChanges>;
    getPullRequestIteration(repositoryId: string, pullRequestId: number, iterationId: number, project?: string): Promise<GitInterfaces.GitPullRequestIteration>;
    getPullRequestIterations(repositoryId: string, pullRequestId: number, project?: string, includeCommits?: boolean): Promise<GitInterfaces.GitPullRequestIteration[]>;
    createPullRequestIterationStatus(status: GitInterfaces.GitPullRequestStatus, repositoryId: string, pullRequestId: number, iterationId: number, project?: string): Promise<GitInterfaces.GitPullRequestStatus>;
    deletePullRequestIterationStatus(repositoryId: string, pullRequestId: number, iterationId: number, statusId: number, project?: string): Promise<void>;
    getPullRequestIterationStatus(repositoryId: string, pullRequestId: number, iterationId: number, statusId: number, project?: string): Promise<GitInterfaces.GitPullRequestStatus>;
    getPullRequestIterationStatuses(repositoryId: string, pullRequestId: number, iterationId: number, project?: string): Promise<GitInterfaces.GitPullRequestStatus[]>;
    updatePullRequestIterationStatuses(customHeaders: any, patchDocument: VSSInterfaces.JsonPatchDocument, repositoryId: string, pullRequestId: number, iterationId: number, project?: string): Promise<void>;
    createPullRequestLabel(label: TfsCoreInterfaces.WebApiCreateTagRequestData, repositoryId: string, pullRequestId: number, project?: string, projectId?: string): Promise<TfsCoreInterfaces.WebApiTagDefinition>;
    deletePullRequestLabels(repositoryId: string, pullRequestId: number, labelIdOrName: string, project?: string, projectId?: string): Promise<void>;
    getPullRequestLabel(repositoryId: string, pullRequestId: number, labelIdOrName: string, project?: string, projectId?: string): Promise<TfsCoreInterfaces.WebApiTagDefinition>;
    getPullRequestLabels(repositoryId: string, pullRequestId: number, project?: string, projectId?: string): Promise<TfsCoreInterfaces.WebApiTagDefinition[]>;
    getPullRequestProperties(repositoryId: string, pullRequestId: number, project?: string): Promise<any>;
    updatePullRequestProperties(customHeaders: any, patchDocument: VSSInterfaces.JsonPatchDocument, repositoryId: string, pullRequestId: number, project?: string): Promise<any>;
    getPullRequestQuery(queries: GitInterfaces.GitPullRequestQuery, repositoryId: string, project?: string): Promise<GitInterfaces.GitPullRequestQuery>;
    createPullRequestReviewer(reviewer: GitInterfaces.IdentityRefWithVote, repositoryId: string, pullRequestId: number, reviewerId: string, project?: string): Promise<GitInterfaces.IdentityRefWithVote>;
    createPullRequestReviewers(reviewers: VSSInterfaces.IdentityRef[], repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.IdentityRefWithVote[]>;
    deletePullRequestReviewer(repositoryId: string, pullRequestId: number, reviewerId: string, project?: string): Promise<void>;
    getPullRequestReviewer(repositoryId: string, pullRequestId: number, reviewerId: string, project?: string): Promise<GitInterfaces.IdentityRefWithVote>;
    getPullRequestReviewers(repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.IdentityRefWithVote[]>;
    updatePullRequestReviewers(patchVotes: GitInterfaces.IdentityRefWithVote[], repositoryId: string, pullRequestId: number, project?: string): Promise<void>;
    getPullRequestById(pullRequestId: number): Promise<GitInterfaces.GitPullRequest>;
    getPullRequestsByProject(project: string, searchCriteria: GitInterfaces.GitPullRequestSearchCriteria, maxCommentLength?: number, skip?: number, top?: number): Promise<GitInterfaces.GitPullRequest[]>;
    createPullRequest(gitPullRequestToCreate: GitInterfaces.GitPullRequest, repositoryId: string, project?: string, supportsIterations?: boolean): Promise<GitInterfaces.GitPullRequest>;
    getPullRequest(repositoryId: string, pullRequestId: number, project?: string, maxCommentLength?: number, skip?: number, top?: number, includeCommits?: boolean, includeWorkItemRefs?: boolean): Promise<GitInterfaces.GitPullRequest>;
    getPullRequests(repositoryId: string, searchCriteria: GitInterfaces.GitPullRequestSearchCriteria, project?: string, maxCommentLength?: number, skip?: number, top?: number): Promise<GitInterfaces.GitPullRequest[]>;
    updatePullRequest(gitPullRequestToUpdate: GitInterfaces.GitPullRequest, repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.GitPullRequest>;
    sharePullRequest(userMessage: GitInterfaces.ShareNotificationContext, repositoryId: string, pullRequestId: number, project?: string): Promise<void>;
    createPullRequestStatus(status: GitInterfaces.GitPullRequestStatus, repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.GitPullRequestStatus>;
    deletePullRequestStatus(repositoryId: string, pullRequestId: number, statusId: number, project?: string): Promise<void>;
    getPullRequestStatus(repositoryId: string, pullRequestId: number, statusId: number, project?: string): Promise<GitInterfaces.GitPullRequestStatus>;
    getPullRequestStatuses(repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.GitPullRequestStatus[]>;
    updatePullRequestStatuses(customHeaders: any, patchDocument: VSSInterfaces.JsonPatchDocument, repositoryId: string, pullRequestId: number, project?: string): Promise<void>;
    createComment(comment: GitInterfaces.Comment, repositoryId: string, pullRequestId: number, threadId: number, project?: string): Promise<GitInterfaces.Comment>;
    deleteComment(repositoryId: string, pullRequestId: number, threadId: number, commentId: number, project?: string): Promise<void>;
    getComment(repositoryId: string, pullRequestId: number, threadId: number, commentId: number, project?: string): Promise<GitInterfaces.Comment>;
    getComments(repositoryId: string, pullRequestId: number, threadId: number, project?: string): Promise<GitInterfaces.Comment[]>;
    updateComment(comment: GitInterfaces.Comment, repositoryId: string, pullRequestId: number, threadId: number, commentId: number, project?: string): Promise<GitInterfaces.Comment>;
    createThread(commentThread: GitInterfaces.GitPullRequestCommentThread, repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.GitPullRequestCommentThread>;
    getPullRequestThread(repositoryId: string, pullRequestId: number, threadId: number, project?: string, iteration?: number, baseIteration?: number): Promise<GitInterfaces.GitPullRequestCommentThread>;
    getThreads(repositoryId: string, pullRequestId: number, project?: string, iteration?: number, baseIteration?: number): Promise<GitInterfaces.GitPullRequestCommentThread[]>;
    updateThread(commentThread: GitInterfaces.GitPullRequestCommentThread, repositoryId: string, pullRequestId: number, threadId: number, project?: string): Promise<GitInterfaces.GitPullRequestCommentThread>;
    getPullRequestWorkItems(repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.AssociatedWorkItem[]>;
    createPush(push: GitInterfaces.GitPush, repositoryId: string, project?: string): Promise<GitInterfaces.GitPush>;
    getPush(repositoryId: string, pushId: number, project?: string, includeCommits?: number, includeRefUpdates?: boolean): Promise<GitInterfaces.GitPush>;
    getPushes(repositoryId: string, project?: string, skip?: number, top?: number, searchCriteria?: GitInterfaces.GitPushSearchCriteria): Promise<GitInterfaces.GitPush[]>;
    getRefs(repositoryId: string, project?: string, filter?: string, includeLinks?: boolean, latestStatusesOnly?: boolean): Promise<GitInterfaces.GitRef[]>;
    updateRef(newRefInfo: GitInterfaces.GitRefUpdate, repositoryId: string, filter: string, project?: string, projectId?: string): Promise<GitInterfaces.GitRef>;
    updateRefs(refUpdates: GitInterfaces.GitRefUpdate[], repositoryId: string, project?: string, projectId?: string): Promise<GitInterfaces.GitRefUpdateResult[]>;
    createFavorite(favorite: GitInterfaces.GitRefFavorite, project: string): Promise<GitInterfaces.GitRefFavorite>;
    deleteRefFavorite(project: string, favoriteId: number): Promise<void>;
    getRefFavorite(project: string, favoriteId: number): Promise<GitInterfaces.GitRefFavorite>;
    getRefFavorites(project: string, repositoryId?: string, identityId?: string): Promise<GitInterfaces.GitRefFavorite[]>;
    createRepository(gitRepositoryToCreate: GitInterfaces.GitRepositoryCreateOptions, project?: string, sourceRef?: string): Promise<GitInterfaces.GitRepository>;
    deleteRepository(repositoryId: string, project?: string): Promise<void>;
    getRepositories(project?: string, includeLinks?: boolean, includeAllUrls?: boolean, includeHidden?: boolean): Promise<GitInterfaces.GitRepository[]>;
    getRepository(repositoryId: string, project?: string, includeParent?: boolean): Promise<GitInterfaces.GitRepository>;
    updateRepository(newRepositoryInfo: GitInterfaces.GitRepository, repositoryId: string, project?: string): Promise<GitInterfaces.GitRepository>;
    createRevert(revertToCreate: GitInterfaces.GitAsyncRefOperationParameters, project: string, repositoryId: string): Promise<GitInterfaces.GitRevert>;
    getRevert(project: string, revertId: number, repositoryId: string): Promise<GitInterfaces.GitRevert>;
    getRevertForRefName(project: string, repositoryId: string, refName: string): Promise<GitInterfaces.GitRevert>;
    createCommitStatus(gitCommitStatusToCreate: GitInterfaces.GitStatus, commitId: string, repositoryId: string, project?: string): Promise<GitInterfaces.GitStatus>;
    getStatuses(commitId: string, repositoryId: string, project?: string, top?: number, skip?: number, latestOnly?: boolean): Promise<GitInterfaces.GitStatus[]>;
    getSuggestions(repositoryId: string, project?: string): Promise<GitInterfaces.GitSuggestion[]>;
    getTree(repositoryId: string, sha1: string, project?: string, projectId?: string, recursive?: boolean, fileName?: string): Promise<GitInterfaces.GitTreeRef>;
    getTreeZip(repositoryId: string, sha1: string, project?: string, projectId?: string, recursive?: boolean, fileName?: string): Promise<NodeJS.ReadableStream>;
}
export declare class GitApi extends basem.ClientApiBase implements IGitApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    static readonly RESOURCE_AREA_ID: string;
    /**
     * Create an annotated tag.
     *
     * @param {GitInterfaces.GitAnnotatedTag} tagObject - Object containing details of tag to be created.
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - ID or name of the repository.
     */
    createAnnotatedTag(tagObject: GitInterfaces.GitAnnotatedTag, project: string, repositoryId: string): Promise<GitInterfaces.GitAnnotatedTag>;
    /**
     * Get an annotated tag.
     *
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - ID or name of the repository.
     * @param {string} objectId - ObjectId (Sha1Id) of tag to get.
     */
    getAnnotatedTag(project: string, repositoryId: string, objectId: string): Promise<GitInterfaces.GitAnnotatedTag>;
    /**
     * Get a single blob.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} sha1 - SHA1 hash of the file. You can get the SHA1 of a file using the “Git/Items/Get Item” endpoint.
     * @param {string} project - Project ID or project name
     * @param {boolean} download - If true, prompt for a download rather than rendering in a browser. Note: this value defaults to true if $format is zip
     * @param {string} fileName - Provide a fileName to use for a download.
     */
    getBlob(repositoryId: string, sha1: string, project?: string, download?: boolean, fileName?: string): Promise<GitInterfaces.GitBlobRef>;
    /**
     * Get a single blob.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} sha1 - SHA1 hash of the file. You can get the SHA1 of a file using the “Git/Items/Get Item” endpoint.
     * @param {string} project - Project ID or project name
     * @param {boolean} download - If true, prompt for a download rather than rendering in a browser. Note: this value defaults to true if $format is zip
     * @param {string} fileName - Provide a fileName to use for a download.
     */
    getBlobContent(repositoryId: string, sha1: string, project?: string, download?: boolean, fileName?: string): Promise<NodeJS.ReadableStream>;
    /**
     * Gets one or more blobs in a zip file download.
     *
     * @param {string[]} blobIds - Blob IDs (SHA1 hashes) to be returned in the zip file.
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {string} filename
     */
    getBlobsZip(blobIds: string[], repositoryId: string, project?: string, filename?: string): Promise<NodeJS.ReadableStream>;
    /**
     * Get a single blob.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} sha1 - SHA1 hash of the file. You can get the SHA1 of a file using the “Git/Items/Get Item” endpoint.
     * @param {string} project - Project ID or project name
     * @param {boolean} download - If true, prompt for a download rather than rendering in a browser. Note: this value defaults to true if $format is zip
     * @param {string} fileName - Provide a fileName to use for a download.
     */
    getBlobZip(repositoryId: string, sha1: string, project?: string, download?: boolean, fileName?: string): Promise<NodeJS.ReadableStream>;
    /**
     * Retrieve statistics about a single branch.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} name - Name of the branch.
     * @param {string} project - Project ID or project name
     * @param {GitInterfaces.GitVersionDescriptor} baseVersionDescriptor - Identifies the commit or branch to use as the base.
     */
    getBranch(repositoryId: string, name: string, project?: string, baseVersionDescriptor?: GitInterfaces.GitVersionDescriptor): Promise<GitInterfaces.GitBranchStats>;
    /**
     * Retrieve statistics about all branches within a repository.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {GitInterfaces.GitVersionDescriptor} baseVersionDescriptor - Identifies the commit or branch to use as the base.
     */
    getBranches(repositoryId: string, project?: string, baseVersionDescriptor?: GitInterfaces.GitVersionDescriptor): Promise<GitInterfaces.GitBranchStats[]>;
    /**
     * @param {GitInterfaces.GitQueryBranchStatsCriteria} searchCriteria
     * @param {string} repositoryId
     * @param {string} project - Project ID or project name
     */
    getBranchStatsBatch(searchCriteria: GitInterfaces.GitQueryBranchStatsCriteria, repositoryId: string, project?: string): Promise<GitInterfaces.GitBranchStats[]>;
    /**
     * Retrieve changes for a particular commit.
     *
     * @param {string} commitId - The id of the commit.
     * @param {string} repositoryId - The id or friendly name of the repository. To use the friendly name, projectId must also be specified.
     * @param {string} project - Project ID or project name
     * @param {number} top - The maximum number of changes to return.
     * @param {number} skip - The number of changes to skip.
     */
    getChanges(commitId: string, repositoryId: string, project?: string, top?: number, skip?: number): Promise<GitInterfaces.GitCommitChanges>;
    /**
     * Given a commitId, returns a list of commits that are in the same cherry-pick family.
     *
     * @param {string} repositoryNameOrId
     * @param {string} commitId
     * @param {string} project - Project ID or project name
     * @param {boolean} includeLinks
     */
    getCherryPickRelationships(repositoryNameOrId: string, commitId: string, project?: string, includeLinks?: boolean): Promise<GitInterfaces.GitCommitRef[]>;
    /**
     * Cherry pick a specific commit or commits that are associated to a pull request into a new branch.
     *
     * @param {GitInterfaces.GitAsyncRefOperationParameters} cherryPickToCreate
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - ID of the repository.
     */
    createCherryPick(cherryPickToCreate: GitInterfaces.GitAsyncRefOperationParameters, project: string, repositoryId: string): Promise<GitInterfaces.GitCherryPick>;
    /**
     * Retrieve information about a cherry pick by cherry pick Id.
     *
     * @param {string} project - Project ID or project name
     * @param {number} cherryPickId - ID of the cherry pick.
     * @param {string} repositoryId - ID of the repository.
     */
    getCherryPick(project: string, cherryPickId: number, repositoryId: string): Promise<GitInterfaces.GitCherryPick>;
    /**
     * Retrieve information about a cherry pick for a specific branch.
     *
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - ID of the repository.
     * @param {string} refName - The GitAsyncRefOperationParameters generatedRefName used for the cherry pick operation.
     */
    getCherryPickForRefName(project: string, repositoryId: string, refName: string): Promise<GitInterfaces.GitCherryPick>;
    /**
     * Retrieve a particular commit.
     *
     * @param {string} commitId - The id of the commit.
     * @param {string} repositoryId - The id or friendly name of the repository. To use the friendly name, projectId must also be specified.
     * @param {string} project - Project ID or project name
     * @param {number} changeCount - The number of changes to include in the result.
     */
    getCommit(commitId: string, repositoryId: string, project?: string, changeCount?: number): Promise<GitInterfaces.GitCommit>;
    /**
     * Retrieve git commits for a project
     *
     * @param {string} repositoryId - The id or friendly name of the repository. To use the friendly name, projectId must also be specified.
     * @param {GitInterfaces.GitQueryCommitsCriteria} searchCriteria
     * @param {string} project - Project ID or project name
     * @param {number} skip
     * @param {number} top
     */
    getCommits(repositoryId: string, searchCriteria: GitInterfaces.GitQueryCommitsCriteria, project?: string, skip?: number, top?: number): Promise<GitInterfaces.GitCommitRef[]>;
    /**
     * Retrieve a list of commits associated with a particular push.
     *
     * @param {string} repositoryId - The id or friendly name of the repository. To use the friendly name, projectId must also be specified.
     * @param {number} pushId - The id of the push.
     * @param {string} project - Project ID or project name
     * @param {number} top - The maximum number of commits to return ("get the top x commits").
     * @param {number} skip - The number of commits to skip.
     * @param {boolean} includeLinks
     */
    getPushCommits(repositoryId: string, pushId: number, project?: string, top?: number, skip?: number, includeLinks?: boolean): Promise<GitInterfaces.GitCommitRef[]>;
    /**
     * Retrieve git commits for a project matching the search criteria
     *
     * @param {GitInterfaces.GitQueryCommitsCriteria} searchCriteria - Search options
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {number} skip - Number of commits to skip.
     * @param {number} top - Maximum number of commits to return.
     * @param {boolean} includeStatuses - True to include additional commit status information.
     */
    getCommitsBatch(searchCriteria: GitInterfaces.GitQueryCommitsCriteria, repositoryId: string, project?: string, skip?: number, top?: number, includeStatuses?: boolean): Promise<GitInterfaces.GitCommitRef[]>;
    /**
     * Retrieve deleted git repositories.
     *
     * @param {string} project - Project ID or project name
     */
    getDeletedRepositories(project: string): Promise<GitInterfaces.GitDeletedRepository[]>;
    /**
     * Retrieve all forks of a repository in the collection.
     *
     * @param {string} repositoryNameOrId - The name or ID of the repository.
     * @param {string} collectionId - Team project collection ID.
     * @param {string} project - Project ID or project name
     * @param {boolean} includeLinks - True to include links.
     */
    getForks(repositoryNameOrId: string, collectionId: string, project?: string, includeLinks?: boolean): Promise<GitInterfaces.GitRepositoryRef[]>;
    /**
     * Request that another repository's refs be fetched into this one.
     *
     * @param {GitInterfaces.GitForkSyncRequestParameters} syncParams - Source repository and ref mapping.
     * @param {string} repositoryNameOrId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {boolean} includeLinks - True to include links
     */
    createForkSyncRequest(syncParams: GitInterfaces.GitForkSyncRequestParameters, repositoryNameOrId: string, project?: string, includeLinks?: boolean): Promise<GitInterfaces.GitForkSyncRequest>;
    /**
     * Get a specific fork sync operation's details.
     *
     * @param {string} repositoryNameOrId - The name or ID of the repository.
     * @param {number} forkSyncOperationId - OperationId of the sync request.
     * @param {string} project - Project ID or project name
     * @param {boolean} includeLinks - True to include links.
     */
    getForkSyncRequest(repositoryNameOrId: string, forkSyncOperationId: number, project?: string, includeLinks?: boolean): Promise<GitInterfaces.GitForkSyncRequest>;
    /**
     * Retrieve all requested fork sync operations on this repository.
     *
     * @param {string} repositoryNameOrId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {boolean} includeAbandoned - True to include abandoned requests.
     * @param {boolean} includeLinks - True to include links.
     */
    getForkSyncRequests(repositoryNameOrId: string, project?: string, includeAbandoned?: boolean, includeLinks?: boolean): Promise<GitInterfaces.GitForkSyncRequest[]>;
    /**
     * Create an import request.
     *
     * @param {GitInterfaces.GitImportRequest} importRequest - The import request to create.
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - The name or ID of the repository.
     */
    createImportRequest(importRequest: GitInterfaces.GitImportRequest, project: string, repositoryId: string): Promise<GitInterfaces.GitImportRequest>;
    /**
     * Retrieve a particular import request.
     *
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {number} importRequestId - The unique identifier for the import request.
     */
    getImportRequest(project: string, repositoryId: string, importRequestId: number): Promise<GitInterfaces.GitImportRequest>;
    /**
     * Retrieve import requests for a repository.
     *
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {boolean} includeAbandoned - True to include abandoned import requests in the results.
     */
    queryImportRequests(project: string, repositoryId: string, includeAbandoned?: boolean): Promise<GitInterfaces.GitImportRequest[]>;
    /**
     * Retry or abandon a failed import request.
     *
     * @param {GitInterfaces.GitImportRequest} importRequestToUpdate - The updated version of the import request. Currently, the only change allowed is setting the Status to Queued or Abandoned.
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {number} importRequestId - The unique identifier for the import request to update.
     */
    updateImportRequest(importRequestToUpdate: GitInterfaces.GitImportRequest, project: string, repositoryId: string, importRequestId: number): Promise<GitInterfaces.GitImportRequest>;
    /**
     * Get Item Metadata and/or Content for a single item. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content, which is always returned as a download.
     *
     * @param {string} repositoryId - The Id of the repository.
     * @param {string} path - The item path.
     * @param {string} project - Project ID or project name
     * @param {string} scopePath - The path scope.  The default is null.
     * @param {GitInterfaces.VersionControlRecursionType} recursionLevel - The recursion level of this request. The default is 'none', no recursion.
     * @param {boolean} includeContentMetadata - Set to true to include content metadata.  Default is false.
     * @param {boolean} latestProcessedChange - Set to true to include the lastest changes.  Default is false.
     * @param {boolean} download - Set to true to download the response as a file.  Default is false.
     * @param {GitInterfaces.GitVersionDescriptor} versionDescriptor - Version descriptor.  Default is null.
     */
    getItem(repositoryId: string, path: string, project?: string, scopePath?: string, recursionLevel?: GitInterfaces.VersionControlRecursionType, includeContentMetadata?: boolean, latestProcessedChange?: boolean, download?: boolean, versionDescriptor?: GitInterfaces.GitVersionDescriptor): Promise<GitInterfaces.GitItem>;
    /**
     * Get Item Metadata and/or Content for a single item. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content, which is always returned as a download.
     *
     * @param {string} repositoryId - The Id of the repository.
     * @param {string} path - The item path.
     * @param {string} project - Project ID or project name
     * @param {string} scopePath - The path scope.  The default is null.
     * @param {GitInterfaces.VersionControlRecursionType} recursionLevel - The recursion level of this request. The default is 'none', no recursion.
     * @param {boolean} includeContentMetadata - Set to true to include content metadata.  Default is false.
     * @param {boolean} latestProcessedChange - Set to true to include the lastest changes.  Default is false.
     * @param {boolean} download - Set to true to download the response as a file.  Default is false.
     * @param {GitInterfaces.GitVersionDescriptor} versionDescriptor - Version descriptor.  Default is null.
     */
    getItemContent(repositoryId: string, path: string, project?: string, scopePath?: string, recursionLevel?: GitInterfaces.VersionControlRecursionType, includeContentMetadata?: boolean, latestProcessedChange?: boolean, download?: boolean, versionDescriptor?: GitInterfaces.GitVersionDescriptor): Promise<NodeJS.ReadableStream>;
    /**
     * Get Item Metadata and/or Content for a collection of items. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content which is always returned as a download.
     *
     * @param {string} repositoryId - The Id of the repository.
     * @param {string} project - Project ID or project name
     * @param {string} scopePath - The path scope.  The default is null.
     * @param {GitInterfaces.VersionControlRecursionType} recursionLevel - The recursion level of this request. The default is 'none', no recursion.
     * @param {boolean} includeContentMetadata - Set to true to include content metadata.  Default is false.
     * @param {boolean} latestProcessedChange - Set to true to include the lastest changes.  Default is false.
     * @param {boolean} download - Set to true to download the response as a file.  Default is false.
     * @param {boolean} includeLinks - Set to true to include links to items.  Default is false.
     * @param {GitInterfaces.GitVersionDescriptor} versionDescriptor - Version descriptor.  Default is null.
     */
    getItems(repositoryId: string, project?: string, scopePath?: string, recursionLevel?: GitInterfaces.VersionControlRecursionType, includeContentMetadata?: boolean, latestProcessedChange?: boolean, download?: boolean, includeLinks?: boolean, versionDescriptor?: GitInterfaces.GitVersionDescriptor): Promise<GitInterfaces.GitItem[]>;
    /**
     * Get Item Metadata and/or Content for a single item. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content, which is always returned as a download.
     *
     * @param {string} repositoryId - The Id of the repository.
     * @param {string} path - The item path.
     * @param {string} project - Project ID or project name
     * @param {string} scopePath - The path scope.  The default is null.
     * @param {GitInterfaces.VersionControlRecursionType} recursionLevel - The recursion level of this request. The default is 'none', no recursion.
     * @param {boolean} includeContentMetadata - Set to true to include content metadata.  Default is false.
     * @param {boolean} latestProcessedChange - Set to true to include the lastest changes.  Default is false.
     * @param {boolean} download - Set to true to download the response as a file.  Default is false.
     * @param {GitInterfaces.GitVersionDescriptor} versionDescriptor - Version descriptor.  Default is null.
     */
    getItemText(repositoryId: string, path: string, project?: string, scopePath?: string, recursionLevel?: GitInterfaces.VersionControlRecursionType, includeContentMetadata?: boolean, latestProcessedChange?: boolean, download?: boolean, versionDescriptor?: GitInterfaces.GitVersionDescriptor): Promise<NodeJS.ReadableStream>;
    /**
     * Get Item Metadata and/or Content for a single item. The download parameter is to indicate whether the content should be available as a download or just sent as a stream in the response. Doesn't apply to zipped content, which is always returned as a download.
     *
     * @param {string} repositoryId - The Id of the repository.
     * @param {string} path - The item path.
     * @param {string} project - Project ID or project name
     * @param {string} scopePath - The path scope.  The default is null.
     * @param {GitInterfaces.VersionControlRecursionType} recursionLevel - The recursion level of this request. The default is 'none', no recursion.
     * @param {boolean} includeContentMetadata - Set to true to include content metadata.  Default is false.
     * @param {boolean} latestProcessedChange - Set to true to include the lastest changes.  Default is false.
     * @param {boolean} download - Set to true to download the response as a file.  Default is false.
     * @param {GitInterfaces.GitVersionDescriptor} versionDescriptor - Version descriptor.  Default is null.
     */
    getItemZip(repositoryId: string, path: string, project?: string, scopePath?: string, recursionLevel?: GitInterfaces.VersionControlRecursionType, includeContentMetadata?: boolean, latestProcessedChange?: boolean, download?: boolean, versionDescriptor?: GitInterfaces.GitVersionDescriptor): Promise<NodeJS.ReadableStream>;
    /**
     * Post for retrieving a creating a batch out of a set of items in a repo / project given a list of paths or a long path
     *
     * @param {GitInterfaces.GitItemRequestData} requestData - Request data attributes: ItemDescriptors, IncludeContentMetadata, LatestProcessedChange, IncludeLinks. ItemDescriptors: Collection of items to fetch, including path, version, and recursion level. IncludeContentMetadata: Whether to include metadata for all items LatestProcessedChange: Whether to include shallow ref to commit that last changed each item. IncludeLinks: Whether to include the _links field on the shallow references.
     * @param {string} repositoryId - The name or ID of the repository
     * @param {string} project - Project ID or project name
     */
    getItemsBatch(requestData: GitInterfaces.GitItemRequestData, repositoryId: string, project?: string): Promise<GitInterfaces.GitItem[][]>;
    /**
     * Find the merge bases of two commits, optionally across forks. If otherRepositoryId is not specified, the merge bases will only be calculated within the context of the local repositoryNameOrId.
     *
     * @param {string} repositoryNameOrId - ID or name of the local repository.
     * @param {string} commitId - First commit, usually the tip of the target branch of the potential merge.
     * @param {string} otherCommitId - Other commit, usually the tip of the source branch of the potential merge.
     * @param {string} project - Project ID or project name
     * @param {string} otherCollectionId - The collection ID where otherCommitId lives.
     * @param {string} otherRepositoryId - The repository ID where otherCommitId lives.
     */
    getMergeBases(repositoryNameOrId: string, commitId: string, otherCommitId: string, project?: string, otherCollectionId?: string, otherRepositoryId?: string): Promise<GitInterfaces.GitCommitRef[]>;
    /**
     * Attach a new file to a pull request.
     *
     * @param {NodeJS.ReadableStream} contentStream - Content to upload
     * @param {string} fileName - The name of the file.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    createAttachment(customHeaders: any, contentStream: NodeJS.ReadableStream, fileName: string, repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.Attachment>;
    /**
     * Delete a pull request attachment.
     *
     * @param {string} fileName - The name of the attachment to delete.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    deleteAttachment(fileName: string, repositoryId: string, pullRequestId: number, project?: string): Promise<void>;
    /**
     * Get the file content of a pull request attachment.
     *
     * @param {string} fileName - The name of the attachment.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    getAttachmentContent(fileName: string, repositoryId: string, pullRequestId: number, project?: string): Promise<NodeJS.ReadableStream>;
    /**
     * Get a list of files attached to a given pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    getAttachments(repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.Attachment[]>;
    /**
     * Get the file content of a pull request attachment.
     *
     * @param {string} fileName - The name of the attachment.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    getAttachmentZip(fileName: string, repositoryId: string, pullRequestId: number, project?: string): Promise<NodeJS.ReadableStream>;
    /**
     * Add a like on a comment.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - The ID of the thread that contains the comment.
     * @param {number} commentId - The ID of the comment.
     * @param {string} project - Project ID or project name
     */
    createLike(repositoryId: string, pullRequestId: number, threadId: number, commentId: number, project?: string): Promise<void>;
    /**
     * Delete a like on a comment.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - The ID of the thread that contains the comment.
     * @param {number} commentId - The ID of the comment.
     * @param {string} project - Project ID or project name
     */
    deleteLike(repositoryId: string, pullRequestId: number, threadId: number, commentId: number, project?: string): Promise<void>;
    /**
     * Get likes for a comment.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - The ID of the thread that contains the comment.
     * @param {number} commentId - The ID of the comment.
     * @param {string} project - Project ID or project name
     */
    getLikes(repositoryId: string, pullRequestId: number, threadId: number, commentId: number, project?: string): Promise<VSSInterfaces.IdentityRef[]>;
    /**
     * Get the commits for the specified iteration of a pull request.
     *
     * @param {string} repositoryId - ID or name of the repository.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} iterationId - ID of the iteration from which to get the commits.
     * @param {string} project - Project ID or project name
     */
    getPullRequestIterationCommits(repositoryId: string, pullRequestId: number, iterationId: number, project?: string): Promise<GitInterfaces.GitCommitRef[]>;
    /**
     * Get the commits for the specified pull request.
     *
     * @param {string} repositoryId - ID or name of the repository.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    getPullRequestCommits(repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.GitCommitRef[]>;
    /**
     * Retrieve one conflict for a pull request by ID
     *
     * @param {string} repositoryId
     * @param {number} pullRequestId
     * @param {number} conflictId
     * @param {string} project - Project ID or project name
     */
    getPullRequestConflict(repositoryId: string, pullRequestId: number, conflictId: number, project?: string): Promise<GitInterfaces.GitConflict>;
    /**
     * Retrieve all conflicts for a pull request
     *
     * @param {string} repositoryId
     * @param {number} pullRequestId
     * @param {string} project - Project ID or project name
     * @param {number} skip
     * @param {number} top
     * @param {boolean} includeObsolete
     * @param {boolean} excludeResolved
     * @param {boolean} onlyResolved
     */
    getPullRequestConflicts(repositoryId: string, pullRequestId: number, project?: string, skip?: number, top?: number, includeObsolete?: boolean, excludeResolved?: boolean, onlyResolved?: boolean): Promise<GitInterfaces.GitConflict[]>;
    /**
     * Update merge conflict resolution
     *
     * @param {GitInterfaces.GitConflict} conflict
     * @param {string} repositoryId
     * @param {number} pullRequestId
     * @param {number} conflictId
     * @param {string} project - Project ID or project name
     */
    updatePullRequestConflict(conflict: GitInterfaces.GitConflict, repositoryId: string, pullRequestId: number, conflictId: number, project?: string): Promise<GitInterfaces.GitConflict>;
    /**
     * Update multiple merge conflict resolutions
     *
     * @param {GitInterfaces.GitConflict[]} conflictUpdates
     * @param {string} repositoryId
     * @param {number} pullRequestId
     * @param {string} project - Project ID or project name
     */
    updatePullRequestConflicts(conflictUpdates: GitInterfaces.GitConflict[], repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.GitConflictUpdateResult[]>;
    /**
     * Retrieve the changes made in a pull request between two iterations.
     *
     * @param {string} repositoryId - The repository ID of the pull request's target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} iterationId - ID of the pull request iteration. <br /> Iteration IDs are zero-based with zero indicating the common commit between the source and target branches. Iteration one is the head of the source branch at the time the pull request is created and subsequent iterations are created when there are pushes to the source branch.
     * @param {string} project - Project ID or project name
     * @param {number} top - Optional. The number of changes to retrieve.  The default value is 100 and the maximum value is 2000.
     * @param {number} skip - Optional. The number of changes to ignore.  For example, to retrieve changes 101-150, set top 50 and skip to 100.
     * @param {number} compareTo - ID of the pull request iteration to compare against.  The default value is zero which indicates the comparison is made against the common commit between the source and target branches
     */
    getPullRequestIterationChanges(repositoryId: string, pullRequestId: number, iterationId: number, project?: string, top?: number, skip?: number, compareTo?: number): Promise<GitInterfaces.GitPullRequestIterationChanges>;
    /**
     * Get the specified iteration for a pull request.
     *
     * @param {string} repositoryId - ID or name of the repository.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} iterationId - ID of the pull request iteration to return.
     * @param {string} project - Project ID or project name
     */
    getPullRequestIteration(repositoryId: string, pullRequestId: number, iterationId: number, project?: string): Promise<GitInterfaces.GitPullRequestIteration>;
    /**
     * Get the list of iterations for the specified pull request.
     *
     * @param {string} repositoryId - ID or name of the repository.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     * @param {boolean} includeCommits - If true, include the commits associated with each iteration in the response.
     */
    getPullRequestIterations(repositoryId: string, pullRequestId: number, project?: string, includeCommits?: boolean): Promise<GitInterfaces.GitPullRequestIteration[]>;
    /**
     * Create a pull request status on the iteration. This operation will have the same result as Create status on pull request with specified iteration ID in the request body.
     *
     * @param {GitInterfaces.GitPullRequestStatus} status - Pull request status to create.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} iterationId - ID of the pull request iteration.
     * @param {string} project - Project ID or project name
     */
    createPullRequestIterationStatus(status: GitInterfaces.GitPullRequestStatus, repositoryId: string, pullRequestId: number, iterationId: number, project?: string): Promise<GitInterfaces.GitPullRequestStatus>;
    /**
     * Delete pull request iteration status.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} iterationId - ID of the pull request iteration.
     * @param {number} statusId - ID of the pull request status.
     * @param {string} project - Project ID or project name
     */
    deletePullRequestIterationStatus(repositoryId: string, pullRequestId: number, iterationId: number, statusId: number, project?: string): Promise<void>;
    /**
     * Get the specific pull request iteration status by ID. The status ID is unique within the pull request across all iterations.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} iterationId - ID of the pull request iteration.
     * @param {number} statusId - ID of the pull request status.
     * @param {string} project - Project ID or project name
     */
    getPullRequestIterationStatus(repositoryId: string, pullRequestId: number, iterationId: number, statusId: number, project?: string): Promise<GitInterfaces.GitPullRequestStatus>;
    /**
     * Get all the statuses associated with a pull request iteration.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} iterationId - ID of the pull request iteration.
     * @param {string} project - Project ID or project name
     */
    getPullRequestIterationStatuses(repositoryId: string, pullRequestId: number, iterationId: number, project?: string): Promise<GitInterfaces.GitPullRequestStatus[]>;
    /**
     * Update pull request iteration statuses collection. The only supported operation type is `remove`.
     *
     * @param {VSSInterfaces.JsonPatchDocument} patchDocument - Operations to apply to the pull request statuses in JSON Patch format.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} iterationId - ID of the pull request iteration.
     * @param {string} project - Project ID or project name
     */
    updatePullRequestIterationStatuses(customHeaders: any, patchDocument: VSSInterfaces.JsonPatchDocument, repositoryId: string, pullRequestId: number, iterationId: number, project?: string): Promise<void>;
    /**
     * Create a label for a specified pull request. The only required field is the name of the new label.
     *
     * @param {TfsCoreInterfaces.WebApiCreateTagRequestData} label - Label to assign to the pull request.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     * @param {string} projectId - Project ID or project name.
     */
    createPullRequestLabel(label: TfsCoreInterfaces.WebApiCreateTagRequestData, repositoryId: string, pullRequestId: number, project?: string, projectId?: string): Promise<TfsCoreInterfaces.WebApiTagDefinition>;
    /**
     * Removes a label from the set of those assigned to the pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} labelIdOrName - The name or ID of the label requested.
     * @param {string} project - Project ID or project name
     * @param {string} projectId - Project ID or project name.
     */
    deletePullRequestLabels(repositoryId: string, pullRequestId: number, labelIdOrName: string, project?: string, projectId?: string): Promise<void>;
    /**
     * Retrieves a single label that has been assigned to a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} labelIdOrName - The name or ID of the label requested.
     * @param {string} project - Project ID or project name
     * @param {string} projectId - Project ID or project name.
     */
    getPullRequestLabel(repositoryId: string, pullRequestId: number, labelIdOrName: string, project?: string, projectId?: string): Promise<TfsCoreInterfaces.WebApiTagDefinition>;
    /**
     * Get all the labels assigned to a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     * @param {string} projectId - Project ID or project name.
     */
    getPullRequestLabels(repositoryId: string, pullRequestId: number, project?: string, projectId?: string): Promise<TfsCoreInterfaces.WebApiTagDefinition[]>;
    /**
     * Get external properties of the pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    getPullRequestProperties(repositoryId: string, pullRequestId: number, project?: string): Promise<any>;
    /**
     * Create or update pull request external properties. The patch operation can be `add`, `replace` or `remove`. For `add` operation, the path can be empty. If the path is empty, the value must be a list of key value pairs. For `replace` operation, the path cannot be empty. If the path does not exist, the property will be added to the collection. For `remove` operation, the path cannot be empty. If the path does not exist, no action will be performed.
     *
     * @param {VSSInterfaces.JsonPatchDocument} patchDocument - Properties to add, replace or remove in JSON Patch format.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    updatePullRequestProperties(customHeaders: any, patchDocument: VSSInterfaces.JsonPatchDocument, repositoryId: string, pullRequestId: number, project?: string): Promise<any>;
    /**
     * This API is used to find what pull requests are related to a given commit.  It can be used to either find the pull request that created a particular merge commit or it can be used to find all pull requests that have ever merged a particular commit.  The input is a list of queries which each contain a list of commits. For each commit that you search against, you will get back a dictionary of commit -> pull requests.
     *
     * @param {GitInterfaces.GitPullRequestQuery} queries - The list of queries to perform.
     * @param {string} repositoryId - ID of the repository.
     * @param {string} project - Project ID or project name
     */
    getPullRequestQuery(queries: GitInterfaces.GitPullRequestQuery, repositoryId: string, project?: string): Promise<GitInterfaces.GitPullRequestQuery>;
    /**
     * Add a reviewer to a pull request or cast a vote.
     *
     * @param {GitInterfaces.IdentityRefWithVote} reviewer - Reviewer's vote.<br />If the reviewer's ID is included here, it must match the reviewerID parameter.<br />Reviewers can set their own vote with this method.  When adding other reviewers, vote must be set to zero.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} reviewerId - ID of the reviewer.
     * @param {string} project - Project ID or project name
     */
    createPullRequestReviewer(reviewer: GitInterfaces.IdentityRefWithVote, repositoryId: string, pullRequestId: number, reviewerId: string, project?: string): Promise<GitInterfaces.IdentityRefWithVote>;
    /**
     * Add reviewers to a pull request.
     *
     * @param {VSSInterfaces.IdentityRef[]} reviewers - Reviewers to add to the pull request.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    createPullRequestReviewers(reviewers: VSSInterfaces.IdentityRef[], repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.IdentityRefWithVote[]>;
    /**
     * Remove a reviewer from a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} reviewerId - ID of the reviewer to remove.
     * @param {string} project - Project ID or project name
     */
    deletePullRequestReviewer(repositoryId: string, pullRequestId: number, reviewerId: string, project?: string): Promise<void>;
    /**
     * Retrieve information about a particular reviewer on a pull request
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} reviewerId - ID of the reviewer.
     * @param {string} project - Project ID or project name
     */
    getPullRequestReviewer(repositoryId: string, pullRequestId: number, reviewerId: string, project?: string): Promise<GitInterfaces.IdentityRefWithVote>;
    /**
     * Retrieve the reviewers for a pull request
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    getPullRequestReviewers(repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.IdentityRefWithVote[]>;
    /**
     * Reset the votes of multiple reviewers on a pull request.
     *
     * @param {GitInterfaces.IdentityRefWithVote[]} patchVotes - IDs of the reviewers whose votes will be reset to zero
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request
     * @param {string} project - Project ID or project name
     */
    updatePullRequestReviewers(patchVotes: GitInterfaces.IdentityRefWithVote[], repositoryId: string, pullRequestId: number, project?: string): Promise<void>;
    /**
     * Retrieve a pull request.
     *
     * @param {number} pullRequestId - The ID of the pull request to retrieve.
     */
    getPullRequestById(pullRequestId: number): Promise<GitInterfaces.GitPullRequest>;
    /**
     * Retrieve all pull requests matching a specified criteria.
     *
     * @param {string} project - Project ID or project name
     * @param {GitInterfaces.GitPullRequestSearchCriteria} searchCriteria - Pull requests will be returned that match this search criteria.
     * @param {number} maxCommentLength - Not used.
     * @param {number} skip - The number of pull requests to ignore. For example, to retrieve results 101-150, set top to 50 and skip to 100.
     * @param {number} top - The number of pull requests to retrieve.
     */
    getPullRequestsByProject(project: string, searchCriteria: GitInterfaces.GitPullRequestSearchCriteria, maxCommentLength?: number, skip?: number, top?: number): Promise<GitInterfaces.GitPullRequest[]>;
    /**
     * Create a pull request.
     *
     * @param {GitInterfaces.GitPullRequest} gitPullRequestToCreate - The pull request to create.
     * @param {string} repositoryId - The repository ID of the pull request's target branch.
     * @param {string} project - Project ID or project name
     * @param {boolean} supportsIterations - If true, subsequent pushes to the pull request will be individually reviewable. Set this to false for large pull requests for performance reasons if this functionality is not needed.
     */
    createPullRequest(gitPullRequestToCreate: GitInterfaces.GitPullRequest, repositoryId: string, project?: string, supportsIterations?: boolean): Promise<GitInterfaces.GitPullRequest>;
    /**
     * Retrieve a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request's target branch.
     * @param {number} pullRequestId - The ID of the pull request to retrieve.
     * @param {string} project - Project ID or project name
     * @param {number} maxCommentLength - Not used.
     * @param {number} skip - Not used.
     * @param {number} top - Not used.
     * @param {boolean} includeCommits - If true, the pull request will be returned with the associated commits.
     * @param {boolean} includeWorkItemRefs - If true, the pull request will be returned with the associated work item references.
     */
    getPullRequest(repositoryId: string, pullRequestId: number, project?: string, maxCommentLength?: number, skip?: number, top?: number, includeCommits?: boolean, includeWorkItemRefs?: boolean): Promise<GitInterfaces.GitPullRequest>;
    /**
     * Retrieve all pull requests matching a specified criteria.
     *
     * @param {string} repositoryId - The repository ID of the pull request's target branch.
     * @param {GitInterfaces.GitPullRequestSearchCriteria} searchCriteria - Pull requests will be returned that match this search criteria.
     * @param {string} project - Project ID or project name
     * @param {number} maxCommentLength - Not used.
     * @param {number} skip - The number of pull requests to ignore. For example, to retrieve results 101-150, set top to 50 and skip to 100.
     * @param {number} top - The number of pull requests to retrieve.
     */
    getPullRequests(repositoryId: string, searchCriteria: GitInterfaces.GitPullRequestSearchCriteria, project?: string, maxCommentLength?: number, skip?: number, top?: number): Promise<GitInterfaces.GitPullRequest[]>;
    /**
     * Update a pull request.
     *
     * @param {GitInterfaces.GitPullRequest} gitPullRequestToUpdate - The pull request content to update.
     * @param {string} repositoryId - The repository ID of the pull request's target branch.
     * @param {number} pullRequestId - The ID of the pull request to retrieve.
     * @param {string} project - Project ID or project name
     */
    updatePullRequest(gitPullRequestToUpdate: GitInterfaces.GitPullRequest, repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.GitPullRequest>;
    /**
     * Sends an e-mail notification about a specific pull request to a set of recipients
     *
     * @param {GitInterfaces.ShareNotificationContext} userMessage
     * @param {string} repositoryId - ID of the git repository.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    sharePullRequest(userMessage: GitInterfaces.ShareNotificationContext, repositoryId: string, pullRequestId: number, project?: string): Promise<void>;
    /**
     * Create a pull request status.
     *
     * @param {GitInterfaces.GitPullRequestStatus} status - Pull request status to create.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    createPullRequestStatus(status: GitInterfaces.GitPullRequestStatus, repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.GitPullRequestStatus>;
    /**
     * Delete pull request status.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} statusId - ID of the pull request status.
     * @param {string} project - Project ID or project name
     */
    deletePullRequestStatus(repositoryId: string, pullRequestId: number, statusId: number, project?: string): Promise<void>;
    /**
     * Get the specific pull request status by ID. The status ID is unique within the pull request across all iterations.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} statusId - ID of the pull request status.
     * @param {string} project - Project ID or project name
     */
    getPullRequestStatus(repositoryId: string, pullRequestId: number, statusId: number, project?: string): Promise<GitInterfaces.GitPullRequestStatus>;
    /**
     * Get all the statuses associated with a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    getPullRequestStatuses(repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.GitPullRequestStatus[]>;
    /**
     * Update pull request statuses collection. The only supported operation type is `remove`.
     *
     * @param {VSSInterfaces.JsonPatchDocument} patchDocument - Operations to apply to the pull request statuses in JSON Patch format.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    updatePullRequestStatuses(customHeaders: any, patchDocument: VSSInterfaces.JsonPatchDocument, repositoryId: string, pullRequestId: number, project?: string): Promise<void>;
    /**
     * Create a comment on a specific thread in a pull request.
     *
     * @param {GitInterfaces.Comment} comment - The comment to create.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - ID of the thread that the desired comment is in.
     * @param {string} project - Project ID or project name
     */
    createComment(comment: GitInterfaces.Comment, repositoryId: string, pullRequestId: number, threadId: number, project?: string): Promise<GitInterfaces.Comment>;
    /**
     * Delete a comment associated with a specific thread in a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - ID of the thread that the desired comment is in.
     * @param {number} commentId - ID of the comment.
     * @param {string} project - Project ID or project name
     */
    deleteComment(repositoryId: string, pullRequestId: number, threadId: number, commentId: number, project?: string): Promise<void>;
    /**
     * Retrieve a comment associated with a specific thread in a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - ID of the thread that the desired comment is in.
     * @param {number} commentId - ID of the comment.
     * @param {string} project - Project ID or project name
     */
    getComment(repositoryId: string, pullRequestId: number, threadId: number, commentId: number, project?: string): Promise<GitInterfaces.Comment>;
    /**
     * Retrieve all comments associated with a specific thread in a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - ID of the thread.
     * @param {string} project - Project ID or project name
     */
    getComments(repositoryId: string, pullRequestId: number, threadId: number, project?: string): Promise<GitInterfaces.Comment[]>;
    /**
     * Update a comment associated with a specific thread in a pull request.
     *
     * @param {GitInterfaces.Comment} comment - The comment content that should be updated.
     * @param {string} repositoryId - The repository ID of the pull request’s target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - ID of the thread that the desired comment is in.
     * @param {number} commentId - ID of the comment to update.
     * @param {string} project - Project ID or project name
     */
    updateComment(comment: GitInterfaces.Comment, repositoryId: string, pullRequestId: number, threadId: number, commentId: number, project?: string): Promise<GitInterfaces.Comment>;
    /**
     * Create a thread in a pull request.
     *
     * @param {GitInterfaces.GitPullRequestCommentThread} commentThread - The thread to create. Thread must contain at least one comment.
     * @param {string} repositoryId - Repository ID of the pull request's target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    createThread(commentThread: GitInterfaces.GitPullRequestCommentThread, repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.GitPullRequestCommentThread>;
    /**
     * Retrieve a thread in a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request's target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - ID of the thread.
     * @param {string} project - Project ID or project name
     * @param {number} iteration - If specified, thread position will be tracked using this iteration as the right side of the diff.
     * @param {number} baseIteration - If specified, thread position will be tracked using this iteration as the left side of the diff.
     */
    getPullRequestThread(repositoryId: string, pullRequestId: number, threadId: number, project?: string, iteration?: number, baseIteration?: number): Promise<GitInterfaces.GitPullRequestCommentThread>;
    /**
     * Retrieve all threads in a pull request.
     *
     * @param {string} repositoryId - The repository ID of the pull request's target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     * @param {number} iteration - If specified, thread positions will be tracked using this iteration as the right side of the diff.
     * @param {number} baseIteration - If specified, thread positions will be tracked using this iteration as the left side of the diff.
     */
    getThreads(repositoryId: string, pullRequestId: number, project?: string, iteration?: number, baseIteration?: number): Promise<GitInterfaces.GitPullRequestCommentThread[]>;
    /**
     * Update a thread in a pull request.
     *
     * @param {GitInterfaces.GitPullRequestCommentThread} commentThread - The thread content that should be updated.
     * @param {string} repositoryId - The repository ID of the pull request's target branch.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {number} threadId - ID of the thread to update.
     * @param {string} project - Project ID or project name
     */
    updateThread(commentThread: GitInterfaces.GitPullRequestCommentThread, repositoryId: string, pullRequestId: number, threadId: number, project?: string): Promise<GitInterfaces.GitPullRequestCommentThread>;
    /**
     * Retrieve a list of work items associated with a pull request.
     *
     * @param {string} repositoryId - ID or name of the repository.
     * @param {number} pullRequestId - ID of the pull request.
     * @param {string} project - Project ID or project name
     */
    getPullRequestWorkItems(repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.AssociatedWorkItem[]>;
    /**
     * Push changes to the repository.
     *
     * @param {GitInterfaces.GitPush} push
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     */
    createPush(push: GitInterfaces.GitPush, repositoryId: string, project?: string): Promise<GitInterfaces.GitPush>;
    /**
     * Retrieves a particular push.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {number} pushId - ID of the push.
     * @param {string} project - Project ID or project name
     * @param {number} includeCommits - The number of commits to include in the result.
     * @param {boolean} includeRefUpdates - If true, include the list of refs that were updated by the push.
     */
    getPush(repositoryId: string, pushId: number, project?: string, includeCommits?: number, includeRefUpdates?: boolean): Promise<GitInterfaces.GitPush>;
    /**
     * Retrieves pushes associated with the specified repository.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {number} skip - Number of pushes to skip.
     * @param {number} top - Number of pushes to return.
     * @param {GitInterfaces.GitPushSearchCriteria} searchCriteria - Search criteria attributes: fromDate, toDate, pusherId, refName, includeRefUpdates or includeLinks. fromDate: Start date to search from. toDate: End date to search to. pusherId: Identity of the person who submitted the push. refName: Branch name to consider. includeRefUpdates: If true, include the list of refs that were updated by the push. includeLinks: Whether to include the _links field on the shallow references.
     */
    getPushes(repositoryId: string, project?: string, skip?: number, top?: number, searchCriteria?: GitInterfaces.GitPushSearchCriteria): Promise<GitInterfaces.GitPush[]>;
    /**
     * Queries the provided repository for its refs and returns them.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {string} filter - [optional] A filter to apply to the refs.
     * @param {boolean} includeLinks - [optional] Specifies if referenceLinks should be included in the result. default is false.
     * @param {boolean} latestStatusesOnly - [optional] True to include only the tip commit status for each ref. This option requires `includeStatuses` to be true. The default value is false.
     */
    getRefs(repositoryId: string, project?: string, filter?: string, includeLinks?: boolean, latestStatusesOnly?: boolean): Promise<GitInterfaces.GitRef[]>;
    /**
     * Lock or Unlock a branch.
     *
     * @param {GitInterfaces.GitRefUpdate} newRefInfo - The ref update action (lock/unlock) to perform
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} filter - The name of the branch to lock/unlock
     * @param {string} project - Project ID or project name
     * @param {string} projectId - ID or name of the team project. Optional if specifying an ID for repository.
     */
    updateRef(newRefInfo: GitInterfaces.GitRefUpdate, repositoryId: string, filter: string, project?: string, projectId?: string): Promise<GitInterfaces.GitRef>;
    /**
     * Creating, updating, or deleting refs(branches).
     *
     * @param {GitInterfaces.GitRefUpdate[]} refUpdates - List of ref updates to attempt to perform
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {string} projectId - ID or name of the team project. Optional if specifying an ID for repository.
     */
    updateRefs(refUpdates: GitInterfaces.GitRefUpdate[], repositoryId: string, project?: string, projectId?: string): Promise<GitInterfaces.GitRefUpdateResult[]>;
    /**
     * Creates a ref favorite
     *
     * @param {GitInterfaces.GitRefFavorite} favorite - The ref favorite to create.
     * @param {string} project - Project ID or project name
     */
    createFavorite(favorite: GitInterfaces.GitRefFavorite, project: string): Promise<GitInterfaces.GitRefFavorite>;
    /**
     * Deletes the refs favorite specified
     *
     * @param {string} project - Project ID or project name
     * @param {number} favoriteId - The Id of the ref favorite to delete.
     */
    deleteRefFavorite(project: string, favoriteId: number): Promise<void>;
    /**
     * Gets the refs favorite for a favorite Id.
     *
     * @param {string} project - Project ID or project name
     * @param {number} favoriteId - The Id of the requested ref favorite.
     */
    getRefFavorite(project: string, favoriteId: number): Promise<GitInterfaces.GitRefFavorite>;
    /**
     * Gets the refs favorites for a repo and an identity.
     *
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - The id of the repository.
     * @param {string} identityId - The id of the identity whose favorites are to be retrieved. If null, the requesting identity is used.
     */
    getRefFavorites(project: string, repositoryId?: string, identityId?: string): Promise<GitInterfaces.GitRefFavorite[]>;
    /**
     * Create a git repository in a team project.
     *
     * @param {GitInterfaces.GitRepositoryCreateOptions} gitRepositoryToCreate - Specify the repo name, team project and/or parent repository
     * @param {string} project - Project ID or project name
     * @param {string} sourceRef - [optional] Specify the source refs to use while creating a fork repo
     */
    createRepository(gitRepositoryToCreate: GitInterfaces.GitRepositoryCreateOptions, project?: string, sourceRef?: string): Promise<GitInterfaces.GitRepository>;
    /**
     * Delete a git repository
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     */
    deleteRepository(repositoryId: string, project?: string): Promise<void>;
    /**
     * Retrieve git repositories.
     *
     * @param {string} project - Project ID or project name
     * @param {boolean} includeLinks - [optional] True to include reference links. The default value is false.
     * @param {boolean} includeAllUrls - [optional] True to include all remote URLs. The default value is false.
     * @param {boolean} includeHidden - [optional] True to include hidden repositories. The default value is false.
     */
    getRepositories(project?: string, includeLinks?: boolean, includeAllUrls?: boolean, includeHidden?: boolean): Promise<GitInterfaces.GitRepository[]>;
    /**
     * Retrieve a git repository.
     *
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {boolean} includeParent - [optional] True to include parent repository. The default value is false.
     */
    getRepository(repositoryId: string, project?: string, includeParent?: boolean): Promise<GitInterfaces.GitRepository>;
    /**
     * Updates the Git repository with either a new repo name or a new default branch.
     *
     * @param {GitInterfaces.GitRepository} newRepositoryInfo - Specify a new repo name or a new default branch of the repository
     * @param {string} repositoryId - The name or ID of the repository.
     * @param {string} project - Project ID or project name
     */
    updateRepository(newRepositoryInfo: GitInterfaces.GitRepository, repositoryId: string, project?: string): Promise<GitInterfaces.GitRepository>;
    /**
     * Starts the operation to create a new branch which reverts changes introduced by either a specific commit or commits that are associated to a pull request.
     *
     * @param {GitInterfaces.GitAsyncRefOperationParameters} revertToCreate
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - ID of the repository.
     */
    createRevert(revertToCreate: GitInterfaces.GitAsyncRefOperationParameters, project: string, repositoryId: string): Promise<GitInterfaces.GitRevert>;
    /**
     * Retrieve information about a revert operation by revert Id.
     *
     * @param {string} project - Project ID or project name
     * @param {number} revertId - ID of the revert operation.
     * @param {string} repositoryId - ID of the repository.
     */
    getRevert(project: string, revertId: number, repositoryId: string): Promise<GitInterfaces.GitRevert>;
    /**
     * Retrieve information about a revert operation for a specific branch.
     *
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId - ID of the repository.
     * @param {string} refName - The GitAsyncRefOperationParameters generatedRefName used for the revert operation.
     */
    getRevertForRefName(project: string, repositoryId: string, refName: string): Promise<GitInterfaces.GitRevert>;
    /**
     * Create Git commit status.
     *
     * @param {GitInterfaces.GitStatus} gitCommitStatusToCreate - Git commit status object to create.
     * @param {string} commitId - ID of the Git commit.
     * @param {string} repositoryId - ID of the repository.
     * @param {string} project - Project ID or project name
     */
    createCommitStatus(gitCommitStatusToCreate: GitInterfaces.GitStatus, commitId: string, repositoryId: string, project?: string): Promise<GitInterfaces.GitStatus>;
    /**
     * Get statuses associated with the Git commit.
     *
     * @param {string} commitId - ID of the Git commit.
     * @param {string} repositoryId - ID of the repository.
     * @param {string} project - Project ID or project name
     * @param {number} top - Optional. The number of statuses to retrieve. Default is 1000.
     * @param {number} skip - Optional. The number of statuses to ignore. Default is 0. For example, to retrieve results 101-150, set top to 50 and skip to 100.
     * @param {boolean} latestOnly - The flag indicates whether to get only latest statuses grouped by `Context.Name` and `Context.Genre`.
     */
    getStatuses(commitId: string, repositoryId: string, project?: string, top?: number, skip?: number, latestOnly?: boolean): Promise<GitInterfaces.GitStatus[]>;
    /**
     * Retrieve a pull request suggestion for a particular repository or team project.
     *
     * @param {string} repositoryId - ID of the git repository.
     * @param {string} project - Project ID or project name
     */
    getSuggestions(repositoryId: string, project?: string): Promise<GitInterfaces.GitSuggestion[]>;
    /**
     * The Tree endpoint returns the collection of objects underneath the specified tree. Trees are folders in a Git repository.
     *
     * @param {string} repositoryId - Repository Id.
     * @param {string} sha1 - SHA1 hash of the tree object.
     * @param {string} project - Project ID or project name
     * @param {string} projectId - Project Id.
     * @param {boolean} recursive - Search recursively. Include trees underneath this tree. Default is false.
     * @param {string} fileName - Name to use if a .zip file is returned. Default is the object ID.
     */
    getTree(repositoryId: string, sha1: string, project?: string, projectId?: string, recursive?: boolean, fileName?: string): Promise<GitInterfaces.GitTreeRef>;
    /**
     * The Tree endpoint returns the collection of objects underneath the specified tree. Trees are folders in a Git repository.
     *
     * @param {string} repositoryId - Repository Id.
     * @param {string} sha1 - SHA1 hash of the tree object.
     * @param {string} project - Project ID or project name
     * @param {string} projectId - Project Id.
     * @param {boolean} recursive - Search recursively. Include trees underneath this tree. Default is false.
     * @param {string} fileName - Name to use if a .zip file is returned. Default is the object ID.
     */
    getTreeZip(repositoryId: string, sha1: string, project?: string, projectId?: string, recursive?: boolean, fileName?: string): Promise<NodeJS.ReadableStream>;
}
