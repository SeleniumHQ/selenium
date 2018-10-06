import TfsCoreInterfaces = require("../interfaces/CoreInterfaces");
import VSSInterfaces = require("../interfaces/common/VSSInterfaces");
export interface AssociatedWorkItem {
    assignedTo: string;
    /**
     * Id of associated the work item.
     */
    id: number;
    state: string;
    title: string;
    /**
     * REST Url of the work item.
     */
    url: string;
    webUrl: string;
    workItemType: string;
}
export interface AsyncGitOperationNotification {
    operationId: number;
}
export interface AsyncRefOperationCommitLevelEventNotification extends AsyncGitOperationNotification {
    commitId: string;
}
export interface AsyncRefOperationCompletedNotification extends AsyncGitOperationNotification {
    newRefName: string;
}
export interface AsyncRefOperationConflictNotification extends AsyncRefOperationCommitLevelEventNotification {
}
export interface AsyncRefOperationGeneralFailureNotification extends AsyncGitOperationNotification {
}
export interface AsyncRefOperationProgressNotification extends AsyncRefOperationCommitLevelEventNotification {
    progress: number;
}
export interface AsyncRefOperationTimeoutNotification extends AsyncGitOperationNotification {
}
/**
 * Meta data for a file attached to an artifact.
 */
export interface Attachment {
    /**
     * Links to other related objects.
     */
    _links: any;
    /**
     * The person that uploaded this attachment.
     */
    author: VSSInterfaces.IdentityRef;
    /**
     * Content hash of on-disk representation of file content. Its calculated by the server by using SHA1 hash function.
     */
    contentHash: string;
    /**
     * The time the attachment was uploaded.
     */
    createdDate: Date;
    /**
     * The description of the attachment.
     */
    description: string;
    /**
     * The display name of the attachment. Can't be null or empty.
     */
    displayName: string;
    /**
     * Id of the attachment.
     */
    id: number;
    /**
     * Extended properties.
     */
    properties: any;
    /**
     * The url to download the content of the attachment.
     */
    url: string;
}
/**
 * Real time event (SignalR) for an auto-complete update on a pull request
 */
export interface AutoCompleteUpdatedEvent extends RealTimePullRequestEvent {
}
/**
 * Real time event (SignalR) for a source/target branch update on a pull request
 */
export interface BranchUpdatedEvent extends RealTimePullRequestEvent {
    /**
     * If true, the source branch of the pull request was updated
     */
    isSourceUpdate: boolean;
}
export interface Change<T> {
    /**
     * The type of change that was made to the item.
     */
    changeType: VersionControlChangeType;
    /**
     * Current version.
     */
    item: T;
    /**
     * Content of the item after the change.
     */
    newContent: ItemContent;
    /**
     * Path of the item on the server.
     */
    sourceServerItem: string;
    /**
     * URL to retrieve the item.
     */
    url: string;
}
export interface ChangeCountDictionary {
}
export interface ChangeList<T> {
    allChangesIncluded: boolean;
    changeCounts: {
        [key: number]: number;
    };
    changes: Change<T>[];
    comment: string;
    commentTruncated: boolean;
    creationDate: Date;
    notes: CheckinNote[];
    owner: string;
    ownerDisplayName: string;
    ownerId: string;
    sortDate: Date;
    version: string;
}
/**
 * Criteria used in a search for change lists
 */
export interface ChangeListSearchCriteria {
    /**
     * If provided, a version descriptor to compare against base
     */
    compareVersion: string;
    /**
     * If true, don't include delete history entries
     */
    excludeDeletes: boolean;
    /**
     * Whether or not to follow renames for the given item being queried
     */
    followRenames: boolean;
    /**
     * If provided, only include history entries created after this date (string)
     */
    fromDate: string;
    /**
     * If provided, a version descriptor for the earliest change list to include
     */
    fromVersion: string;
    /**
     * Path of item to search under. If the itemPaths memebr is used then it will take precedence over this.
     */
    itemPath: string;
    /**
     * List of item paths to search under. If this member is used then itemPath will be ignored.
     */
    itemPaths: string[];
    /**
     * Version of the items to search
     */
    itemVersion: string;
    /**
     * Number of results to skip (used when clicking more...)
     */
    skip: number;
    /**
     * If provided, only include history entries created before this date (string)
     */
    toDate: string;
    /**
     * If provided, the maximum number of history entries to return
     */
    top: number;
    /**
     * If provided, a version descriptor for the latest change list to include
     */
    toVersion: string;
    /**
     * Alias or display name of user who made the changes
     */
    user: string;
}
export interface CheckinNote {
    name: string;
    value: string;
}
/**
 * Represents a comment which is one of potentially many in a comment thread.
 */
export interface Comment {
    /**
     * Links to other related objects.
     */
    _links: any;
    /**
     * The author of the comment.
     */
    author: VSSInterfaces.IdentityRef;
    /**
     * The comment type at the time of creation.
     */
    commentType: CommentType;
    /**
     * The comment content.
     */
    content: string;
    /**
     * The comment ID. IDs start at 1 and are unique to a pull request.
     */
    id: number;
    /**
     * Whether or not this comment was soft-deleted.
     */
    isDeleted: boolean;
    /**
     * The date the comment's content was last updated.
     */
    lastContentUpdatedDate: Date;
    /**
     * The date the comment was last updated.
     */
    lastUpdatedDate: Date;
    /**
     * The ID of the parent comment. This is used for replies.
     */
    parentCommentId: number;
    /**
     * The date the comment was first published.
     */
    publishedDate: Date;
    /**
     * A list of the users who have liked this comment.
     */
    usersLiked: VSSInterfaces.IdentityRef[];
}
/**
 * Comment iteration context is used to identify which diff was being viewed when the thread was created.
 */
export interface CommentIterationContext {
    /**
     * The iteration of the file on the left side of the diff when the thread was created. If this value is equal to SecondComparingIteration, then this version is the common commit between the source and target branches of the pull request.
     */
    firstComparingIteration: number;
    /**
     * The iteration of the file on the right side of the diff when the thread was created.
     */
    secondComparingIteration: number;
}
export interface CommentPosition {
    /**
     * The line number of a thread's position. Starts at 1.
     */
    line: number;
    /**
     * The character offset of a thread's position inside of a line. Starts at 0.
     */
    offset: number;
}
/**
 * Represents a comment thread of a pull request. A thread contains meta data about the file it was left on along with one or more comments (an initial comment and the subsequent replies).
 */
export interface CommentThread {
    /**
     * Links to other related objects.
     */
    _links: any;
    /**
     * A list of the comments.
     */
    comments: Comment[];
    /**
     * The comment thread id.
     */
    id: number;
    /**
     * Specify if the thread is deleted which happens when all comments are deleted.
     */
    isDeleted: boolean;
    /**
     * The time this thread was last updated.
     */
    lastUpdatedDate: Date;
    /**
     * Optional properties associated with the thread as a collection of key-value pairs.
     */
    properties: any;
    /**
     * The time this thread was published.
     */
    publishedDate: Date;
    /**
     * The status of the comment thread.
     */
    status: CommentThreadStatus;
    /**
     * Specify thread context such as position in left/right file.
     */
    threadContext: CommentThreadContext;
}
export interface CommentThreadContext {
    /**
     * File path relative to the root of the repository. It's up to the client to use any path format.
     */
    filePath: string;
    /**
     * Position of last character of the thread's span in left file.
     */
    leftFileEnd: CommentPosition;
    /**
     * Position of first character of the thread's span in left file.
     */
    leftFileStart: CommentPosition;
    /**
     * Position of last character of the thread's span in right file.
     */
    rightFileEnd: CommentPosition;
    /**
     * Position of first character of the thread's span in right file.
     */
    rightFileStart: CommentPosition;
}
/**
 * The status of a comment thread.
 */
export declare enum CommentThreadStatus {
    /**
     * The thread status is unknown.
     */
    Unknown = 0,
    /**
     * The thread status is active.
     */
    Active = 1,
    /**
     * The thread status is resolved as fixed.
     */
    Fixed = 2,
    /**
     * The thread status is resolved as won't fix.
     */
    WontFix = 3,
    /**
     * The thread status is closed.
     */
    Closed = 4,
    /**
     * The thread status is resolved as by design.
     */
    ByDesign = 5,
    /**
     * The thread status is pending.
     */
    Pending = 6,
}
/**
 * Comment tracking criteria is used to identify which iteration context the thread has been tracked to (if any) along with some detail about the original position and filename.
 */
export interface CommentTrackingCriteria {
    /**
     * The iteration of the file on the left side of the diff that the thread will be tracked to. Threads were tracked if this is greater than 0.
     */
    firstComparingIteration: number;
    /**
     * Original filepath the thread was created on before tracking. This will be different than the current thread filepath if the file in question was renamed in a later iteration.
     */
    origFilePath: string;
    /**
     * Original position of last character of the thread's span in left file.
     */
    origLeftFileEnd: CommentPosition;
    /**
     * Original position of first character of the thread's span in left file.
     */
    origLeftFileStart: CommentPosition;
    /**
     * Original position of last character of the thread's span in right file.
     */
    origRightFileEnd: CommentPosition;
    /**
     * Original position of first character of the thread's span in right file.
     */
    origRightFileStart: CommentPosition;
    /**
     * The iteration of the file on the right side of the diff that the thread will be tracked to. Threads were tracked if this is greater than 0.
     */
    secondComparingIteration: number;
}
/**
 * The type of a comment.
 */
export declare enum CommentType {
    /**
     * The comment type is not known.
     */
    Unknown = 0,
    /**
     * This is a regular user comment.
     */
    Text = 1,
    /**
     * The comment comes as a result of a code change.
     */
    CodeChange = 2,
    /**
     * The comment represents a system message.
     */
    System = 3,
}
/**
 * Real time event (SignalR) for a completion errors on a pull request
 */
export interface CompletionErrorsEvent extends RealTimePullRequestEvent {
    /**
     * The error message associated with the completion error
     */
    errorMessage: string;
}
/**
 * Real time event (SignalR) for a discussions update on a pull request
 */
export interface DiscussionsUpdatedEvent extends RealTimePullRequestEvent {
}
export interface FileContentMetadata {
    contentType: string;
    encoding: number;
    extension: string;
    fileName: string;
    isBinary: boolean;
    isImage: boolean;
    vsLink: string;
}
/**
 * A Git annotated tag.
 */
export interface GitAnnotatedTag {
    /**
     * The tagging Message
     */
    message: string;
    /**
     * The name of the annotated tag.
     */
    name: string;
    /**
     * The objectId (Sha1Id) of the tag.
     */
    objectId: string;
    /**
     * User info and date of tagging.
     */
    taggedBy: GitUserDate;
    /**
     * Tagged git object.
     */
    taggedObject: GitObject;
    url: string;
}
/**
 * Current status of the asynchronous operation.
 */
export declare enum GitAsyncOperationStatus {
    /**
     * The operation is waiting in a queue and has not yet started.
     */
    Queued = 1,
    /**
     * The operation is currently in progress.
     */
    InProgress = 2,
    /**
     * The operation has completed.
     */
    Completed = 3,
    /**
     * The operation has failed. Check for an error message.
     */
    Failed = 4,
    /**
     * The operation has been abandoned.
     */
    Abandoned = 5,
}
export interface GitAsyncRefOperation {
    _links: any;
    detailedStatus: GitAsyncRefOperationDetail;
    parameters: GitAsyncRefOperationParameters;
    status: GitAsyncOperationStatus;
    /**
     * A URL that can be used to make further requests for status about the operation
     */
    url: string;
}
/**
 * Information about the progress of a cherry pick or revert operation.
 */
export interface GitAsyncRefOperationDetail {
    /**
     * Indicates if there was a conflict generated when trying to cherry pick or revert the changes.
     */
    conflict: boolean;
    /**
     * The current commit from the list of commits that are being cherry picked or reverted.
     */
    currentCommitId: string;
    /**
     * Detailed information about why the cherry pick or revert failed to complete.
     */
    failureMessage: string;
    /**
     * A number between 0 and 1 indicating the percent complete of the operation.
     */
    progress: number;
    /**
     * Provides a status code that indicates the reason the cherry pick or revert failed.
     */
    status: GitAsyncRefOperationFailureStatus;
    /**
     * Indicates if the operation went beyond the maximum time allowed for a cherry pick or revert operation.
     */
    timedout: boolean;
}
export declare enum GitAsyncRefOperationFailureStatus {
    /**
     * No status
     */
    None = 0,
    /**
     * Indicates that the ref update request could not be completed because the ref name presented in the request was not valid.
     */
    InvalidRefName = 1,
    /**
     * The ref update could not be completed because, in case-insensitive mode, the ref name conflicts with an existing, differently-cased ref name.
     */
    RefNameConflict = 2,
    /**
     * The ref update request could not be completed because the user lacks the permission to create a branch
     */
    CreateBranchPermissionRequired = 3,
    /**
     * The ref update request could not be completed because the user lacks write permissions required to write this ref
     */
    WritePermissionRequired = 4,
    /**
     * Target branch was deleted after Git async operation started
     */
    TargetBranchDeleted = 5,
    /**
     * Git object is too large to materialize into memory
     */
    GitObjectTooLarge = 6,
    /**
     * Identity who authorized the operation was not found
     */
    OperationIndentityNotFound = 7,
    /**
     * Async operation was not found
     */
    AsyncOperationNotFound = 8,
    /**
     * Unexpected failure
     */
    Other = 9,
}
/**
 * Parameters that are provided in the request body when requesting to cherry pick or revert.
 */
export interface GitAsyncRefOperationParameters {
    /**
     * Proposed target branch name for the cherry pick or revert operation.
     */
    generatedRefName: string;
    /**
     * The target branch for the cherry pick or revert operation.
     */
    ontoRefName: string;
    /**
     * The git repository for the cherry pick or revert operation.
     */
    repository: GitRepository;
    /**
     * Details about the source of the cherry pick or revert operation (e.g. A pull request or a specific commit).
     */
    source: GitAsyncRefOperationSource;
}
/**
 * GitAsyncRefOperationSource specifies the pull request or list of commits to use when making a cherry pick and revert operation request. Only one should be provided.
 */
export interface GitAsyncRefOperationSource {
    /**
     * A list of commits to cherry pick or revert
     */
    commitList: GitCommitRef[];
    /**
     * Id of the pull request to cherry pick or revert
     */
    pullRequestId: number;
}
export interface GitBaseVersionDescriptor extends GitVersionDescriptor {
    /**
     * Version string identifier (name of tag/branch, SHA1 of commit)
     */
    baseVersion: string;
    /**
     * Version options - Specify additional modifiers to version (e.g Previous)
     */
    baseVersionOptions: GitVersionOptions;
    /**
     * Version type (branch, tag, or commit). Determines how Id is interpreted
     */
    baseVersionType: GitVersionType;
}
export interface GitBlobRef {
    _links: any;
    /**
     * SHA1 hash of git object
     */
    objectId: string;
    /**
     * Size of blob content (in bytes)
     */
    size: number;
    url: string;
}
/**
 * Ahead and behind counts for a particular ref.
 */
export interface GitBranchStats {
    /**
     * Number of commits ahead.
     */
    aheadCount: number;
    /**
     * Number of commits behind.
     */
    behindCount: number;
    /**
     * Current commit.
     */
    commit: GitCommitRef;
    /**
     * True if this is the result for the base version.
     */
    isBaseVersion: boolean;
    /**
     * Name of the ref.
     */
    name: string;
}
export interface GitChange extends Change<GitItem> {
    /**
     * ID of the change within the group of changes.
     */
    changeId: number;
    /**
     * New Content template to be used when pushing new changes.
     */
    newContentTemplate: GitTemplate;
    /**
     * Original path of item if different from current path.
     */
    originalPath: string;
}
/**
 * This object is returned from Cherry Pick operations and provides the id and status of the operation
 */
export interface GitCherryPick extends GitAsyncRefOperation {
    cherryPickId: number;
}
export interface GitCommit extends GitCommitRef {
    push: GitPushRef;
    treeId: string;
}
export interface GitCommitChanges {
    changeCounts: ChangeCountDictionary;
    changes: GitChange[];
}
export interface GitCommitDiffs {
    aheadCount: number;
    allChangesIncluded: boolean;
    baseCommit: string;
    behindCount: number;
    changeCounts: {
        [key: number]: number;
    };
    changes: GitChange[];
    commonCommit: string;
    targetCommit: string;
}
/**
 * Provides properties that describe a Git commit and associated metadata.
 */
export interface GitCommitRef {
    /**
     * A collection of related REST reference links.
     */
    _links: any;
    /**
     * Author of the commit.
     */
    author: GitUserDate;
    /**
     * Counts of the types of changes (edits, deletes, etc.) included with the commit.
     */
    changeCounts: ChangeCountDictionary;
    /**
     * An enumeration of the changes included with the commit.
     */
    changes: GitChange[];
    /**
     * Comment or message of the commit.
     */
    comment: string;
    /**
     * Indicates if the comment is truncated from the full Git commit comment message.
     */
    commentTruncated: boolean;
    /**
     * ID (SHA-1) of the commit.
     */
    commitId: string;
    /**
     * Committer of the commit.
     */
    committer: GitUserDate;
    /**
     * An enumeration of the parent commit IDs for this commit.
     */
    parents: string[];
    /**
     * Remote URL path to the commit.
     */
    remoteUrl: string;
    /**
     * A list of status metadata from services and extensions that may associate additional information to the commit.
     */
    statuses: GitStatus[];
    /**
     * REST URL for this resource.
     */
    url: string;
    /**
     * A list of workitems associated with this commit.
     */
    workItems: VSSInterfaces.ResourceRef[];
}
export interface GitCommitToCreate {
    baseRef: GitRef;
    comment: string;
    pathActions: GitPathAction[];
}
export interface GitConflict {
    _links: any;
    conflictId: number;
    conflictPath: string;
    conflictType: GitConflictType;
    mergeBaseCommit: GitCommitRef;
    mergeOrigin: GitMergeOriginRef;
    mergeSourceCommit: GitCommitRef;
    mergeTargetCommit: GitCommitRef;
    resolutionError: GitResolutionError;
    resolutionStatus: GitResolutionStatus;
    resolvedBy: VSSInterfaces.IdentityRef;
    resolvedDate: Date;
    url: string;
}
/**
 * Data object for AddAdd conflict
 */
export interface GitConflictAddAdd extends GitConflict {
    resolution: GitResolutionMergeContent;
    sourceBlob: GitBlobRef;
    targetBlob: GitBlobRef;
}
/**
 * Data object for RenameAdd conflict
 */
export interface GitConflictAddRename extends GitConflict {
    baseBlob: GitBlobRef;
    resolution: GitResolutionPathConflict;
    sourceBlob: GitBlobRef;
    targetBlob: GitBlobRef;
    targetOriginalPath: string;
}
/**
 * Data object for EditDelete conflict
 */
export interface GitConflictDeleteEdit extends GitConflict {
    baseBlob: GitBlobRef;
    resolution: GitResolutionPickOneAction;
    targetBlob: GitBlobRef;
}
/**
 * Data object for RenameDelete conflict
 */
export interface GitConflictDeleteRename extends GitConflict {
    baseBlob: GitBlobRef;
    resolution: GitResolutionPickOneAction;
    targetBlob: GitBlobRef;
    targetNewPath: string;
}
/**
 * Data object for FileDirectory conflict
 */
export interface GitConflictDirectoryFile extends GitConflict {
    resolution: GitResolutionPathConflict;
    sourceTree: GitTreeRef;
    targetBlob: GitBlobRef;
}
/**
 * Data object for DeleteEdit conflict
 */
export interface GitConflictEditDelete extends GitConflict {
    baseBlob: GitBlobRef;
    resolution: GitResolutionPickOneAction;
    sourceBlob: GitBlobRef;
}
/**
 * Data object for EditEdit conflict
 */
export interface GitConflictEditEdit extends GitConflict {
    baseBlob: GitBlobRef;
    resolution: GitResolutionMergeContent;
    sourceBlob: GitBlobRef;
    targetBlob: GitBlobRef;
}
/**
 * Data object for DirectoryFile conflict
 */
export interface GitConflictFileDirectory extends GitConflict {
    resolution: GitResolutionPathConflict;
    sourceBlob: GitBlobRef;
    targetTree: GitTreeRef;
}
/**
 * Data object for Rename1to2 conflict
 */
export interface GitConflictRename1to2 extends GitConflict {
    baseBlob: GitBlobRef;
    resolution: GitResolutionRename1to2;
    sourceBlob: GitBlobRef;
    sourceNewPath: string;
    targetBlob: GitBlobRef;
    targetNewPath: string;
}
/**
 * Data object for Rename2to1 conflict
 */
export interface GitConflictRename2to1 extends GitConflict {
    resolution: GitResolutionPathConflict;
    sourceNewBlob: GitBlobRef;
    sourceOriginalBlob: GitBlobRef;
    sourceOriginalPath: string;
    targetNewBlob: GitBlobRef;
    targetOriginalBlob: GitBlobRef;
    targetOriginalPath: string;
}
/**
 * Data object for AddRename conflict
 */
export interface GitConflictRenameAdd extends GitConflict {
    baseBlob: GitBlobRef;
    resolution: GitResolutionPathConflict;
    sourceBlob: GitBlobRef;
    sourceOriginalPath: string;
    targetBlob: GitBlobRef;
}
/**
 * Data object for DeleteRename conflict
 */
export interface GitConflictRenameDelete extends GitConflict {
    baseBlob: GitBlobRef;
    resolution: GitResolutionPickOneAction;
    sourceBlob: GitBlobRef;
    sourceNewPath: string;
}
/**
 * Data object for RenameRename conflict
 */
export interface GitConflictRenameRename extends GitConflict {
    baseBlob: GitBlobRef;
    originalPath: string;
    resolution: GitResolutionMergeContent;
    sourceBlob: GitBlobRef;
    targetBlob: GitBlobRef;
}
/**
 * The type of a merge conflict.
 */
export declare enum GitConflictType {
    /**
     * No conflict
     */
    None = 0,
    /**
     * Added on source and target; content differs
     */
    AddAdd = 1,
    /**
     * Added on source and rename destination on target
     */
    AddRename = 2,
    /**
     * Deleted on source and edited on target
     */
    DeleteEdit = 3,
    /**
     * Deleted on source and renamed on target
     */
    DeleteRename = 4,
    /**
     * Path is a directory on source and a file on target
     */
    DirectoryFile = 5,
    /**
     * Children of directory which has DirectoryFile or FileDirectory conflict
     */
    DirectoryChild = 6,
    /**
     * Edited on source and deleted on target
     */
    EditDelete = 7,
    /**
     * Edited on source and target; content differs
     */
    EditEdit = 8,
    /**
     * Path is a file on source and a directory on target
     */
    FileDirectory = 9,
    /**
     * Same file renamed on both source and target; destination paths differ
     */
    Rename1to2 = 10,
    /**
     * Different files renamed to same destination path on both source and target
     */
    Rename2to1 = 11,
    /**
     * Rename destination on source and new file on target
     */
    RenameAdd = 12,
    /**
     * Renamed on source and deleted on target
     */
    RenameDelete = 13,
    /**
     * Rename destination on both source and target; content differs
     */
    RenameRename = 14,
}
export interface GitConflictUpdateResult {
    /**
     * Conflict ID that was provided by input
     */
    conflictId: number;
    /**
     * Reason for failing
     */
    customMessage: string;
    /**
     * New state of the conflict after updating
     */
    updatedConflict: GitConflict;
    /**
     * Status of the update on the server
     */
    updateStatus: GitConflictUpdateStatus;
}
/**
 * Represents the possible outcomes from a request to update a pull request conflict
 */
export declare enum GitConflictUpdateStatus {
    /**
     * Indicates that pull request conflict update request was completed successfully
     */
    Succeeded = 0,
    /**
     * Indicates that the update request did not fit the expected data contract
     */
    BadRequest = 1,
    /**
     * Indicates that the requested resolution was not valid
     */
    InvalidResolution = 2,
    /**
     * Indicates that the conflict in the update request was not a supported conflict type
     */
    UnsupportedConflictType = 3,
    /**
     * Indicates that the conflict could not be found
     */
    NotFound = 4,
}
export interface GitDeletedRepository {
    createdDate: Date;
    deletedBy: VSSInterfaces.IdentityRef;
    deletedDate: Date;
    id: string;
    name: string;
    project: TfsCoreInterfaces.TeamProjectReference;
}
export interface GitFilePathsCollection {
    commitId: string;
    paths: string[];
    url: string;
}
/**
 * Status information about a requested fork operation.
 */
export interface GitForkOperationStatusDetail {
    /**
     * All valid steps for the forking process
     */
    allSteps: string[];
    /**
     * Index into AllSteps for the current step
     */
    currentStep: number;
    /**
     * Error message if the operation failed.
     */
    errorMessage: string;
}
/**
 * Information about a fork ref.
 */
export interface GitForkRef extends GitRef {
    /**
     * The repository ID of the fork.
     */
    repository: GitRepository;
}
/**
 * Request to sync data between two forks.
 */
export interface GitForkSyncRequest {
    /**
     * Collection of related links
     */
    _links: any;
    detailedStatus: GitForkOperationStatusDetail;
    /**
     * Unique identifier for the operation.
     */
    operationId: number;
    /**
     * Fully-qualified identifier for the source repository.
     */
    source: GlobalGitRepositoryKey;
    /**
     * If supplied, the set of ref mappings to use when performing a "sync" or create. If missing, all refs will be synchronized.
     */
    sourceToTargetRefs: SourceToTargetRef[];
    status: GitAsyncOperationStatus;
}
/**
 * Parameters for creating a fork request
 */
export interface GitForkSyncRequestParameters {
    /**
     * Fully-qualified identifier for the source repository.
     */
    source: GlobalGitRepositoryKey;
    /**
     * If supplied, the set of ref mappings to use when performing a "sync" or create. If missing, all refs will be synchronized.
     */
    sourceToTargetRefs: SourceToTargetRef[];
}
/**
 * Accepted types of version
 */
export declare enum GitHistoryMode {
    /**
     * The history mode used by `git log`. This is the default.
     */
    SimplifiedHistory = 0,
    /**
     * The history mode used by `git log --first-parent`
     */
    FirstParent = 1,
    /**
     * The history mode used by `git log --full-history`
     */
    FullHistory = 2,
    /**
     * The history mode used by `git log --full-history --simplify-merges`
     */
    FullHistorySimplifyMerges = 3,
}
export interface GitImportFailedEvent {
    sourceRepositoryName: string;
    targetRepository: GitRepository;
}
/**
 * Parameter for creating a git import request when source is Git version control
 */
export interface GitImportGitSource {
    /**
     * Tells if this is a sync request or not
     */
    overwrite: boolean;
    /**
     * Url for the source repo
     */
    url: string;
}
/**
 * A request to import data from a remote source control system.
 */
export interface GitImportRequest {
    /**
     * Links to related resources.
     */
    _links: any;
    /**
     * Detailed status of the import, including the current step and an error message, if applicable.
     */
    detailedStatus: GitImportStatusDetail;
    /**
     * The unique identifier for this import request.
     */
    importRequestId: number;
    /**
     * Parameters for creating the import request.
     */
    parameters: GitImportRequestParameters;
    /**
     * The target repository for this import.
     */
    repository: GitRepository;
    /**
     * Current status of the import.
     */
    status: GitAsyncOperationStatus;
    /**
     * A link back to this import request resource.
     */
    url: string;
}
/**
 * Parameters for creating an import request
 */
export interface GitImportRequestParameters {
    /**
     * Option to delete service endpoint when import is done
     */
    deleteServiceEndpointAfterImportIsDone: boolean;
    /**
     * Source for importing git repository
     */
    gitSource: GitImportGitSource;
    /**
     * Service Endpoint for connection to external endpoint
     */
    serviceEndpointId: string;
    /**
     * Source for importing tfvc repository
     */
    tfvcSource: GitImportTfvcSource;
}
/**
 * Additional status information about an import request.
 */
export interface GitImportStatusDetail {
    /**
     * All valid steps for the import process
     */
    allSteps: string[];
    /**
     * Index into AllSteps for the current step
     */
    currentStep: number;
    /**
     * Error message if the operation failed.
     */
    errorMessage: string;
}
export interface GitImportSucceededEvent {
    sourceRepositoryName: string;
    targetRepository: GitRepository;
}
/**
 * Parameter for creating a git import request when source is tfvc version control
 */
export interface GitImportTfvcSource {
    /**
     * Set true to import History, false otherwise
     */
    importHistory: boolean;
    /**
     * Get history for last n days (max allowed value is 180 days)
     */
    importHistoryDurationInDays: number;
    /**
     * Path which we want to import (this can be copied from Path Control in Explorer)
     */
    path: string;
}
export interface GitItem extends ItemModel {
    /**
     * SHA1 of commit item was fetched at
     */
    commitId: string;
    /**
     * Type of object (Commit, Tree, Blob, Tag, ...)
     */
    gitObjectType: GitObjectType;
    /**
     * Shallow ref to commit that last changed this item Only populated if latestProcessedChange is requested May not be accurate if latest change is not yet cached
     */
    latestProcessedChange: GitCommitRef;
    /**
     * Git object id
     */
    objectId: string;
    /**
     * Git object id
     */
    originalObjectId: string;
}
export interface GitItemDescriptor {
    /**
     * Path to item
     */
    path: string;
    /**
     * Specifies whether to include children (OneLevel), all descendants (Full), or None
     */
    recursionLevel: VersionControlRecursionType;
    /**
     * Version string (interpretation based on VersionType defined in subclass
     */
    version: string;
    /**
     * Version modifiers (e.g. previous)
     */
    versionOptions: GitVersionOptions;
    /**
     * How to interpret version (branch,tag,commit)
     */
    versionType: GitVersionType;
}
export interface GitItemRequestData {
    /**
     * Whether to include metadata for all items
     */
    includeContentMetadata: boolean;
    /**
     * Whether to include the _links field on the shallow references
     */
    includeLinks: boolean;
    /**
     * Collection of items to fetch, including path, version, and recursion level
     */
    itemDescriptors: GitItemDescriptor[];
    /**
     * Whether to include shallow ref to commit that last changed each item
     */
    latestProcessedChange: boolean;
}
export interface GitLastChangeItem {
    /**
     * Gets or sets the commit Id this item was modified most recently for the provided version.
     */
    commitId: string;
    /**
     * Gets or sets the path of the item.
     */
    path: string;
}
export interface GitLastChangeTreeItems {
    /**
     * The list of commits referenced by Items, if they were requested.
     */
    commits: GitCommitRef[];
    /**
     * The last change of items.
     */
    items: GitLastChangeItem[];
    /**
     * The last explored time, in case the result is not comprehensive. Null otherwise.
     */
    lastExploredTime: Date;
}
export interface GitMergeOriginRef {
    pullRequestId: number;
}
/**
 * Git object identifier and type information.
 */
export interface GitObject {
    /**
     * Object Id (Sha1Id).
     */
    objectId: string;
    /**
     * Type of object (Commit, Tree, Blob, Tag)
     */
    objectType: GitObjectType;
}
export declare enum GitObjectType {
    Bad = 0,
    Commit = 1,
    Tree = 2,
    Blob = 3,
    Tag = 4,
    Ext2 = 5,
    OfsDelta = 6,
    RefDelta = 7,
}
export interface GitPathAction {
    action: GitPathActions;
    base64Content: string;
    path: string;
    rawTextContent: string;
    targetPath: string;
}
export declare enum GitPathActions {
    None = 0,
    Edit = 1,
    Delete = 2,
    Add = 3,
    Rename = 4,
}
export interface GitPathToItemsCollection {
    items: {
        [key: string]: GitItem[];
    };
}
/**
 * Represents all the data associated with a pull request.
 */
export interface GitPullRequest {
    /**
     * Links to other related objects.
     */
    _links: any;
    /**
     * A string which uniquely identifies this pull request. To generate an artifact ID for a pull request, use this template: ```vstfs:///Git/PullRequestId/{projectId}/{repositoryId}/{pullRequestId}```
     */
    artifactId: string;
    /**
     * If set, auto-complete is enabled for this pull request and this is the identity that enabled it.
     */
    autoCompleteSetBy: VSSInterfaces.IdentityRef;
    /**
     * The user who closed the pull request.
     */
    closedBy: VSSInterfaces.IdentityRef;
    /**
     * The date when the pull request was closed (completed, abandoned, or merged externally).
     */
    closedDate: Date;
    /**
     * The code review ID of the pull request. Used internally.
     */
    codeReviewId: number;
    /**
     * The commits contained in the pull request.
     */
    commits: GitCommitRef[];
    /**
     * Options which affect how the pull request will be merged when it is completed.
     */
    completionOptions: GitPullRequestCompletionOptions;
    /**
     * The most recent date at which the pull request entered the queue to be completed. Used internally.
     */
    completionQueueTime: Date;
    /**
     * The identity of the user who created the pull request.
     */
    createdBy: VSSInterfaces.IdentityRef;
    /**
     * The date when the pull request was created.
     */
    creationDate: Date;
    /**
     * The description of the pull request.
     */
    description: string;
    /**
     * If this is a PR from a fork this will contain information about its source.
     */
    forkSource: GitForkRef;
    /**
     * The labels associated with the pull request.
     */
    labels: TfsCoreInterfaces.WebApiTagDefinition[];
    /**
     * The commit of the most recent pull request merge. If empty, the most recent merge is in progress or was unsuccessful.
     */
    lastMergeCommit: GitCommitRef;
    /**
     * The commit at the head of the source branch at the time of the last pull request merge.
     */
    lastMergeSourceCommit: GitCommitRef;
    /**
     * The commit at the head of the target branch at the time of the last pull request merge.
     */
    lastMergeTargetCommit: GitCommitRef;
    /**
     * If set, pull request merge failed for this reason.
     */
    mergeFailureMessage: string;
    /**
     * The type of failure (if any) of the pull request merge.
     */
    mergeFailureType: PullRequestMergeFailureType;
    /**
     * The ID of the job used to run the pull request merge. Used internally.
     */
    mergeId: string;
    /**
     * Options used when the pull request merge runs. These are separate from completion options since completion happens only once and a new merge will run every time the source branch of the pull request changes.
     */
    mergeOptions: GitPullRequestMergeOptions;
    /**
     * The current status of the pull request merge.
     */
    mergeStatus: PullRequestAsyncStatus;
    /**
     * The ID of the pull request.
     */
    pullRequestId: number;
    /**
     * Used internally.
     */
    remoteUrl: string;
    /**
     * The repository containing the target branch of the pull request.
     */
    repository: GitRepository;
    /**
     * A list of reviewers on the pull request along with the state of their votes.
     */
    reviewers: IdentityRefWithVote[];
    /**
     * The name of the source branch of the pull request.
     */
    sourceRefName: string;
    /**
     * The status of the pull request.
     */
    status: PullRequestStatus;
    /**
     * If true, this pull request supports multiple iterations. Iteration support means individual pushes to the source branch of the pull request can be reviewed and comments left in one iteration will be tracked across future iterations.
     */
    supportsIterations: boolean;
    /**
     * The name of the target branch of the pull request.
     */
    targetRefName: string;
    /**
     * The title of the pull request.
     */
    title: string;
    /**
     * Used internally.
     */
    url: string;
    /**
     * Any work item references associated with this pull request.
     */
    workItemRefs: VSSInterfaces.ResourceRef[];
}
/**
 * Change made in a pull request.
 */
export interface GitPullRequestChange extends GitChange {
    /**
     * ID used to track files through multiple changes.
     */
    changeTrackingId: number;
}
/**
 * Represents a comment thread of a pull request. A thread contains meta data about the file it was left on (if any) along with one or more comments (an initial comment and the subsequent replies).
 */
export interface GitPullRequestCommentThread extends CommentThread {
    /**
     * Extended context information unique to pull requests
     */
    pullRequestThreadContext: GitPullRequestCommentThreadContext;
}
/**
 * Comment thread context contains details about what diffs were being viewed at the time of thread creation and whether or not the thread has been tracked from that original diff.
 */
export interface GitPullRequestCommentThreadContext {
    /**
     * Used to track a comment across iterations. This value can be found by looking at the iteration's changes list. Must be set for pull requests with iteration support. Otherwise, it's not required for 'legacy' pull requests.
     */
    changeTrackingId: number;
    /**
     * The iteration context being viewed when the thread was created.
     */
    iterationContext: CommentIterationContext;
    /**
     * The criteria used to track this thread. If this property is filled out when the thread is returned, then the thread has been tracked from its original location using the given criteria.
     */
    trackingCriteria: CommentTrackingCriteria;
}
/**
 * Preferences about how the pull request should be completed.
 */
export interface GitPullRequestCompletionOptions {
    /**
     * If true, policies will be explicitly bypassed while the pull request is completed.
     */
    bypassPolicy: boolean;
    /**
     * If policies are bypassed, this reason is stored as to why bypass was used.
     */
    bypassReason: string;
    /**
     * If true, the source branch of the pull request will be deleted after completion.
     */
    deleteSourceBranch: boolean;
    /**
     * If set, this will be used as the commit message of the merge commit.
     */
    mergeCommitMessage: string;
    /**
     * If true, the commits in the pull request will be squash-merged into the specified target branch on completion.
     */
    squashMerge: boolean;
    /**
     * If true, we will attempt to transition any work items linked to the pull request into the next logical state (i.e. Active -> Resolved)
     */
    transitionWorkItems: boolean;
    /**
     * If true, the current completion attempt was triggered via auto-complete. Used internally.
     */
    triggeredByAutoComplete: boolean;
}
/**
 * Provides properties that describe a Git pull request iteration. Iterations are created as a result of creating and pushing updates to a pull request.
 */
export interface GitPullRequestIteration {
    /**
     * A collection of related REST reference links.
     */
    _links: any;
    /**
     * Author of the pull request iteration.
     */
    author: VSSInterfaces.IdentityRef;
    /**
     * Changes included with the pull request iteration.
     */
    changeList: GitPullRequestChange[];
    /**
     * The commits included with the pull request iteration.
     */
    commits: GitCommitRef[];
    /**
     * The first common Git commit of the source and target refs.
     */
    commonRefCommit: GitCommitRef;
    /**
     * The creation date of the pull request iteration.
     */
    createdDate: Date;
    /**
     * Description of the pull request iteration.
     */
    description: string;
    /**
     * Indicates if the Commits property contains a truncated list of commits in this pull request iteration.
     */
    hasMoreCommits: boolean;
    /**
     * ID of the pull request iteration. Iterations are created as a result of creating and pushing updates to a pull request.
     */
    id: number;
    /**
     * The Git push information associated with this pull request iteration.
     */
    push: GitPushRef;
    /**
     * The reason for which the pull request iteration was created.
     */
    reason: IterationReason;
    /**
     * The source Git commit of this iteration.
     */
    sourceRefCommit: GitCommitRef;
    /**
     * The target Git commit of this iteration.
     */
    targetRefCommit: GitCommitRef;
    /**
     * The updated date of the pull request iteration.
     */
    updatedDate: Date;
}
/**
 * Collection of changes made in a pull request.
 */
export interface GitPullRequestIterationChanges {
    /**
     * Changes made in the iteration.
     */
    changeEntries: GitPullRequestChange[];
    /**
     * Value to specify as skip to get the next page of changes.  This will be zero if there are no more changes.
     */
    nextSkip: number;
    /**
     * Value to specify as top to get the next page of changes.  This will be zero if there are no more changes.
     */
    nextTop: number;
}
/**
 * The options which are used when a pull request merge is created.
 */
export interface GitPullRequestMergeOptions {
    /**
     * If true, rename detection will not be performed during the merge.
     */
    disableRenames: boolean;
}
/**
 * A set of pull request queries and their results.
 */
export interface GitPullRequestQuery {
    /**
     * The queries to perform.
     */
    queries: GitPullRequestQueryInput[];
    /**
     * The results of the queries. This matches the QueryInputs list so Results[n] are the results of QueryInputs[n]. Each entry in the list is a dictionary of commit->pull requests.
     */
    results: {
        [key: string]: GitPullRequest[];
    }[];
}
/**
 * Pull request query input parameters.
 */
export interface GitPullRequestQueryInput {
    /**
     * The list of commit IDs to search for.
     */
    items: string[];
    /**
     * The type of query to perform.
     */
    type: GitPullRequestQueryType;
}
/**
 * Accepted types of pull request queries.
 */
export declare enum GitPullRequestQueryType {
    /**
     * No query type set.
     */
    NotSet = 0,
    /**
     * Search for pull requests that created the supplied merge commits.
     */
    LastMergeCommit = 1,
    /**
     * Search for pull requests that merged the suppliest commits.
     */
    Commit = 2,
}
export interface GitPullRequestReviewFileContentInfo {
    _links: any;
    /**
     * The file change path.
     */
    path: string;
    /**
     * Content hash of on-disk representation of file content. Its calculated by the client by using SHA1 hash function. Ensure that uploaded file has same encoding as in source control.
     */
    sHA1Hash: string;
}
export declare enum GitPullRequestReviewFileType {
    ChangeEntry = 0,
    Attachment = 1,
}
/**
 * Pull requests can be searched for matching this criteria.
 */
export interface GitPullRequestSearchCriteria {
    /**
     * If set, search for pull requests that were created by this identity.
     */
    creatorId: string;
    /**
     * Whether to include the _links field on the shallow references
     */
    includeLinks: boolean;
    /**
     * If set, search for pull requests whose target branch is in this repository.
     */
    repositoryId: string;
    /**
     * If set, search for pull requests that have this identity as a reviewer.
     */
    reviewerId: string;
    /**
     * If set, search for pull requests from this branch.
     */
    sourceRefName: string;
    /**
     * If set, search for pull requests whose source branch is in this repository.
     */
    sourceRepositoryId: string;
    /**
     * If set, search for pull requests that are in this state.
     */
    status: PullRequestStatus;
    /**
     * If set, search for pull requests into this branch.
     */
    targetRefName: string;
}
/**
 * This class contains the metadata of a service/extension posting pull request status. Status can be associated with a pull request or an iteration.
 */
export interface GitPullRequestStatus extends GitStatus {
    /**
     * ID of the iteration to associate status with. Minimum value is 1.
     */
    iterationId: number;
    /**
     * Custom properties of the status.
     */
    properties: any;
}
export interface GitPush extends GitPushRef {
    commits: GitCommitRef[];
    refUpdates: GitRefUpdate[];
    repository: GitRepository;
}
export interface GitPushEventData {
    afterId: string;
    beforeId: string;
    branch: string;
    commits: GitCommit[];
    repository: GitRepository;
}
export interface GitPushRef {
    _links: any;
    date: Date;
    pushCorrelationId: string;
    pushedBy: VSSInterfaces.IdentityRef;
    pushId: number;
    url: string;
}
export interface GitPushSearchCriteria {
    fromDate: Date;
    /**
     * Whether to include the _links field on the shallow references
     */
    includeLinks: boolean;
    includeRefUpdates: boolean;
    pusherId: string;
    refName: string;
    toDate: Date;
}
export interface GitQueryBranchStatsCriteria {
    baseCommit: GitVersionDescriptor;
    targetCommits: GitVersionDescriptor[];
}
export interface GitQueryCommitsCriteria {
    /**
     * Number of entries to skip
     */
    $skip: number;
    /**
     * Maximum number of entries to retrieve
     */
    $top: number;
    /**
     * Alias or display name of the author
     */
    author: string;
    /**
     * If provided, the earliest commit in the graph to search
     */
    compareVersion: GitVersionDescriptor;
    /**
     * If true, don't include delete history entries
     */
    excludeDeletes: boolean;
    /**
     * If provided, a lower bound for filtering commits alphabetically
     */
    fromCommitId: string;
    /**
     * If provided, only include history entries created after this date (string)
     */
    fromDate: string;
    /**
     * What Git history mode should be used. This only applies to the search criteria when Ids = null.
     */
    historyMode: GitHistoryMode;
    /**
     * If provided, specifies the exact commit ids of the commits to fetch. May not be combined with other parameters.
     */
    ids: string[];
    /**
     * Whether to include the _links field on the shallow references
     */
    includeLinks: boolean;
    /**
     * Whether to include linked work items
     */
    includeWorkItems: boolean;
    /**
     * Path of item to search under
     */
    itemPath: string;
    /**
     * If provided, identifies the commit or branch to search
     */
    itemVersion: GitVersionDescriptor;
    /**
     * If provided, an upper bound for filtering commits alphabetically
     */
    toCommitId: string;
    /**
     * If provided, only include history entries created before this date (string)
     */
    toDate: string;
    /**
     * Alias or display name of the committer
     */
    user: string;
}
export interface GitQueryRefsCriteria {
    /**
     * List of commit Ids to be searched
     */
    commitIds: string[];
    /**
     * List of complete or partial names for refs to be searched
     */
    refNames: string[];
    /**
     * Type of search on refNames, if provided
     */
    searchType: GitRefSearchType;
}
export interface GitRef {
    _links: any;
    isLocked: boolean;
    isLockedBy: VSSInterfaces.IdentityRef;
    name: string;
    objectId: string;
    peeledObjectId: string;
    statuses: GitStatus[];
    url: string;
}
export interface GitRefFavorite {
    _links: any;
    id: number;
    identityId: string;
    name: string;
    repositoryId: string;
    type: RefFavoriteType;
    url: string;
}
/**
 * Search type on ref name
 */
export declare enum GitRefSearchType {
    Exact = 0,
    StartsWith = 1,
    Contains = 2,
}
export interface GitRefUpdate {
    isLocked: boolean;
    name: string;
    newObjectId: string;
    oldObjectId: string;
    repositoryId: string;
}
/**
 * Enumerates the modes under which ref updates can be written to their repositories.
 */
export declare enum GitRefUpdateMode {
    /**
     * Indicates the Git protocol model where any refs that can be updated will be updated, but any failures will not prevent other updates from succeeding.
     */
    BestEffort = 0,
    /**
     * Indicates that all ref updates must succeed or none will succeed. All ref updates will be atomically written. If any failure is encountered, previously successful updates will be rolled back and the entire operation will fail.
     */
    AllOrNone = 1,
}
export interface GitRefUpdateResult {
    /**
     * Custom message for the result object For instance, Reason for failing.
     */
    customMessage: string;
    /**
     * Whether the ref is locked or not
     */
    isLocked: boolean;
    /**
     * Ref name
     */
    name: string;
    /**
     * New object ID
     */
    newObjectId: string;
    /**
     * Old object ID
     */
    oldObjectId: string;
    /**
     * Name of the plugin that rejected the updated.
     */
    rejectedBy: string;
    /**
     * Repository ID
     */
    repositoryId: string;
    /**
     * True if the ref update succeeded, false otherwise
     */
    success: boolean;
    /**
     * Status of the update from the TFS server.
     */
    updateStatus: GitRefUpdateStatus;
}
/**
 * Represents the possible outcomes from a request to update a ref in a repository.
 */
export declare enum GitRefUpdateStatus {
    /**
     * Indicates that the ref update request was completed successfully.
     */
    Succeeded = 0,
    /**
     * Indicates that the ref update request could not be completed because part of the graph would be disconnected by this change, and the caller does not have ForcePush permission on the repository.
     */
    ForcePushRequired = 1,
    /**
     * Indicates that the ref update request could not be completed because the old object ID presented in the request was not the object ID of the ref when the database attempted the update. The most likely scenario is that the caller lost a race to update the ref.
     */
    StaleOldObjectId = 2,
    /**
     * Indicates that the ref update request could not be completed because the ref name presented in the request was not valid.
     */
    InvalidRefName = 3,
    /**
     * The request was not processed
     */
    Unprocessed = 4,
    /**
     * The ref update request could not be completed because the new object ID for the ref could not be resolved to a commit object (potentially through any number of tags)
     */
    UnresolvableToCommit = 5,
    /**
     * The ref update request could not be completed because the user lacks write permissions required to write this ref
     */
    WritePermissionRequired = 6,
    /**
     * The ref update request could not be completed because the user lacks note creation permissions required to write this note
     */
    ManageNotePermissionRequired = 7,
    /**
     * The ref update request could not be completed because the user lacks the permission to create a branch
     */
    CreateBranchPermissionRequired = 8,
    /**
     * The ref update request could not be completed because the user lacks the permission to create a tag
     */
    CreateTagPermissionRequired = 9,
    /**
     * The ref update could not be completed because it was rejected by the plugin.
     */
    RejectedByPlugin = 10,
    /**
     * The ref update could not be completed because the ref is locked by another user.
     */
    Locked = 11,
    /**
     * The ref update could not be completed because, in case-insensitive mode, the ref name conflicts with an existing, differently-cased ref name.
     */
    RefNameConflict = 12,
    /**
     * The ref update could not be completed because it was rejected by policy.
     */
    RejectedByPolicy = 13,
    /**
     * Indicates that the ref update request was completed successfully, but the ref doesn't actually exist so no changes were made.  This should only happen during deletes.
     */
    SucceededNonExistentRef = 14,
    /**
     * Indicates that the ref update request was completed successfully, but the passed-in ref was corrupt - as in, the old object ID was bad.  This should only happen during deletes.
     */
    SucceededCorruptRef = 15,
}
export interface GitRepository {
    _links: any;
    defaultBranch: string;
    id: string;
    /**
     * True if the repository was created as a fork
     */
    isFork: boolean;
    name: string;
    parentRepository: GitRepositoryRef;
    project: TfsCoreInterfaces.TeamProjectReference;
    remoteUrl: string;
    sshUrl: string;
    url: string;
    validRemoteUrls: string[];
}
export interface GitRepositoryCreateOptions {
    name: string;
    parentRepository: GitRepositoryRef;
    project: TfsCoreInterfaces.TeamProjectReference;
}
export interface GitRepositoryRef {
    /**
     * Team Project Collection where this Fork resides
     */
    collection: TfsCoreInterfaces.TeamProjectCollectionReference;
    id: string;
    /**
     * True if the repository was created as a fork
     */
    isFork: boolean;
    name: string;
    project: TfsCoreInterfaces.TeamProjectReference;
    remoteUrl: string;
    sshUrl: string;
    url: string;
}
export interface GitRepositoryStats {
    activePullRequestsCount: number;
    branchesCount: number;
    commitsCount: number;
    repositoryId: string;
}
export interface GitResolution {
}
/**
 * The type of a merge conflict.
 */
export declare enum GitResolutionError {
    /**
     * No error
     */
    None = 0,
    /**
     * User set a blob id for resolving a content merge, but blob was not found in repo during application
     */
    MergeContentNotFound = 1,
    /**
     * Attempted to resolve a conflict by moving a file to another path, but path was already in use
     */
    PathInUse = 2,
    /**
     * No error
     */
    InvalidPath = 3,
    /**
     * GitResolutionAction was set to an unrecognized value
     */
    UnknownAction = 4,
    /**
     * GitResolutionMergeType was set to an unrecognized value
     */
    UnknownMergeType = 5,
    /**
     * Any error for which a more specific code doesn't apply
     */
    OtherError = 255,
}
export interface GitResolutionMergeContent extends GitResolution {
    mergeType: GitResolutionMergeType;
    userMergedBlob: GitBlobRef;
    userMergedContent: number[];
}
export declare enum GitResolutionMergeType {
    Undecided = 0,
    TakeSourceContent = 1,
    TakeTargetContent = 2,
    AutoMerged = 3,
    UserMerged = 4,
}
export interface GitResolutionPathConflict extends GitResolution {
    action: GitResolutionPathConflictAction;
    renamePath: string;
}
export declare enum GitResolutionPathConflictAction {
    Undecided = 0,
    KeepSourceRenameTarget = 1,
    KeepSourceDeleteTarget = 2,
    KeepTargetRenameSource = 3,
    KeepTargetDeleteSource = 4,
}
export interface GitResolutionPickOneAction extends GitResolution {
    action: GitResolutionWhichAction;
}
export interface GitResolutionRename1to2 extends GitResolutionMergeContent {
    action: GitResolutionRename1to2Action;
}
export declare enum GitResolutionRename1to2Action {
    Undecided = 0,
    KeepSourcePath = 1,
    KeepTargetPath = 2,
    KeepBothFiles = 3,
}
/**
 * Resolution status of a conflict.
 */
export declare enum GitResolutionStatus {
    Unresolved = 0,
    PartiallyResolved = 1,
    Resolved = 2,
}
export declare enum GitResolutionWhichAction {
    Undecided = 0,
    PickSourceAction = 1,
    PickTargetAction = 2,
}
export interface GitRevert extends GitAsyncRefOperation {
    revertId: number;
}
/**
 * This class contains the metadata of a service/extension posting a status.
 */
export interface GitStatus {
    /**
     * Reference links.
     */
    _links: any;
    /**
     * Context of the status.
     */
    context: GitStatusContext;
    /**
     * Identity that created the status.
     */
    createdBy: VSSInterfaces.IdentityRef;
    /**
     * Creation date and time of the status.
     */
    creationDate: Date;
    /**
     * Status description. Typically describes current state of the status.
     */
    description: string;
    /**
     * Status identifier.
     */
    id: number;
    /**
     * State of the status.
     */
    state: GitStatusState;
    /**
     * URL with status details.
     */
    targetUrl: string;
    /**
     * Last update date and time of the status.
     */
    updatedDate: Date;
}
/**
 * Status context that uniquely identifies the status.
 */
export interface GitStatusContext {
    /**
     * Genre of the status. Typically name of the service/tool generating the status, can be empty.
     */
    genre: string;
    /**
     * Name identifier of the status, cannot be null or empty.
     */
    name: string;
}
/**
 * State of the status.
 */
export declare enum GitStatusState {
    /**
     * Status state not set. Default state.
     */
    NotSet = 0,
    /**
     * Status pending.
     */
    Pending = 1,
    /**
     * Status succeeded.
     */
    Succeeded = 2,
    /**
     * Status failed.
     */
    Failed = 3,
    /**
     * Status with an error.
     */
    Error = 4,
    /**
     * Status is not applicable to the target object.
     */
    NotApplicable = 5,
}
/**
 * An object describing the git suggestion.  Git suggestions are currently limited to suggested pull requests.
 */
export interface GitSuggestion {
    /**
     * Specific properties describing the suggestion.
     */
    properties: {
        [key: string]: any;
    };
    /**
     * The type of suggestion (e.g. pull request).
     */
    type: string;
}
export interface GitTargetVersionDescriptor extends GitVersionDescriptor {
    /**
     * Version string identifier (name of tag/branch, SHA1 of commit)
     */
    targetVersion: string;
    /**
     * Version options - Specify additional modifiers to version (e.g Previous)
     */
    targetVersionOptions: GitVersionOptions;
    /**
     * Version type (branch, tag, or commit). Determines how Id is interpreted
     */
    targetVersionType: GitVersionType;
}
export interface GitTemplate {
    /**
     * Name of the Template
     */
    name: string;
    /**
     * Type of the Template
     */
    type: string;
}
export interface GitTreeDiff {
    /**
     * ObjectId of the base tree of this diff.
     */
    baseTreeId: string;
    /**
     * List of tree entries that differ between the base and target tree.  Renames and object type changes are returned as a delete for the old object and add for the new object.  If a continuation token is returned in the response header, some tree entries are yet to be processed and may yeild more diff entries. If the continuation token is not returned all the diff entries have been included in this response.
     */
    diffEntries: GitTreeDiffEntry[];
    /**
     * ObjectId of the target tree of this diff.
     */
    targetTreeId: string;
    /**
     * REST Url to this resource.
     */
    url: string;
}
export interface GitTreeDiffEntry {
    /**
     * SHA1 hash of the object in the base tree, if it exists. Will be null in case of adds.
     */
    baseObjectId: string;
    /**
     * Type of change that affected this entry.
     */
    changeType: VersionControlChangeType;
    /**
     * Object type of the tree entry. Blob, Tree or Commit("submodule")
     */
    objectType: GitObjectType;
    /**
     * Relative path in base and target trees.
     */
    path: string;
    /**
     * SHA1 hash of the object in the target tree, if it exists. Will be null in case of deletes.
     */
    targetObjectId: string;
}
export interface GitTreeDiffResponse {
    /**
     * The HTTP client methods find the continuation token header in the response and populate this field.
     */
    continuationToken: string[];
    treeDiff: GitTreeDiff;
}
export interface GitTreeEntryRef {
    /**
     * Blob or tree
     */
    gitObjectType: GitObjectType;
    /**
     * Mode represented as octal string
     */
    mode: string;
    /**
     * SHA1 hash of git object
     */
    objectId: string;
    /**
     * Path relative to parent tree object
     */
    relativePath: string;
    /**
     * Size of content
     */
    size: number;
    /**
     * url to retrieve tree or blob
     */
    url: string;
}
export interface GitTreeRef {
    _links: any;
    /**
     * SHA1 hash of git object
     */
    objectId: string;
    /**
     * Sum of sizes of all children
     */
    size: number;
    /**
     * Blobs and trees under this tree
     */
    treeEntries: GitTreeEntryRef[];
    /**
     * Url to tree
     */
    url: string;
}
/**
 * User info and date for Git operations.
 */
export interface GitUserDate {
    /**
     * Date of the Git operation.
     */
    date: Date;
    /**
     * Email address of the user performing the Git operation.
     */
    email: string;
    /**
     * Name of the user performing the Git operation.
     */
    name: string;
}
export interface GitVersionDescriptor {
    /**
     * Version string identifier (name of tag/branch, SHA1 of commit)
     */
    version: string;
    /**
     * Version options - Specify additional modifiers to version (e.g Previous)
     */
    versionOptions: GitVersionOptions;
    /**
     * Version type (branch, tag, or commit). Determines how Id is interpreted
     */
    versionType: GitVersionType;
}
/**
 * Accepted types of version options
 */
export declare enum GitVersionOptions {
    /**
     * Not specified
     */
    None = 0,
    /**
     * Commit that changed item prior to the current version
     */
    PreviousChange = 1,
    /**
     * First parent of commit (HEAD^)
     */
    FirstParent = 2,
}
/**
 * Accepted types of version
 */
export declare enum GitVersionType {
    /**
     * Interpret the version as a branch name
     */
    Branch = 0,
    /**
     * Interpret the version as a tag name
     */
    Tag = 1,
    /**
     * Interpret the version as a commit ID (SHA1)
     */
    Commit = 2,
}
/**
 * Reference to a workitem from a Git/PullRequest context.
 */
export interface GitWorkItemRef extends VSSInterfaces.ResourceRef {
}
/**
 * Globally unique key for a repository.
 */
export interface GlobalGitRepositoryKey {
    /**
     * Team Project Collection ID of the collection for the repository.
     */
    collectionId: string;
    /**
     * Team Project ID of the project for the repository.
     */
    projectId: string;
    /**
     * ID of the repository.
     */
    repositoryId: string;
}
export interface HistoryEntry<T> {
    /**
     * The Change list (changeset/commit/shelveset) for this point in history
     */
    changeList: ChangeList<T>;
    /**
     * The change made to the item from this change list (only relevant for File history, not folders)
     */
    itemChangeType: VersionControlChangeType;
    /**
     * The path of the item at this point in history (only relevant for File history, not folders)
     */
    serverItem: string;
}
/**
 * Identity information including a vote on a pull request.
 */
export interface IdentityRefWithVote extends VSSInterfaces.IdentityRef {
    /**
     * Indicates if this is a required reviewer for this pull request. <br /> Branches can have policies that require particular reviewers are required for pull requests.
     */
    isRequired: boolean;
    /**
     * URL to retrieve information about this identity
     */
    reviewerUrl: string;
    /**
     * Vote on a pull request:<br /> 10 - approved 5 - approved with suggestions 0 - no vote -5 - waiting for author -10 - rejected
     */
    vote: number;
    /**
     * Groups or teams that that this reviewer contributed to. <br /> Groups and teams can be reviewers on pull requests but can not vote directly.  When a member of the group or team votes, that vote is rolled up into the group or team vote.  VotedFor is a list of such votes.
     */
    votedFor: IdentityRefWithVote[];
}
export interface ImportRepositoryValidation {
    gitSource: GitImportGitSource;
    password: string;
    tfvcSource: GitImportTfvcSource;
    username: string;
}
export interface IncludedGitCommit {
    commitId: string;
    commitTime: Date;
    parentCommitIds: string[];
    repositoryId: string;
}
export interface ItemContent {
    content: string;
    contentType: ItemContentType;
}
export declare enum ItemContentType {
    RawText = 0,
    Base64Encoded = 1,
}
/**
 * Optional details to include when returning an item model
 */
export interface ItemDetailsOptions {
    /**
     * If true, include metadata about the file type
     */
    includeContentMetadata: boolean;
    /**
     * Specifies whether to include children (OneLevel), all descendants (Full) or None for folder items
     */
    recursionLevel: VersionControlRecursionType;
}
export interface ItemModel {
    _links: any;
    contentMetadata: FileContentMetadata;
    isFolder: boolean;
    isSymLink: boolean;
    path: string;
    url: string;
}
/**
 * The reason for which the pull request iteration was created.
 */
export declare enum IterationReason {
    Push = 0,
    ForcePush = 1,
    Create = 2,
    Rebase = 4,
    Unknown = 8,
}
/**
 * Real time event (SignalR) for updated labels on a pull request
 */
export interface LabelsUpdatedEvent extends RealTimePullRequestEvent {
}
/**
 * Real time event (SignalR) for a merge completed on a pull request
 */
export interface MergeCompletedEvent extends RealTimePullRequestEvent {
}
/**
 * Real time event (SignalR) for a policy evaluation update on a pull request
 */
export interface PolicyEvaluationUpdatedEvent extends RealTimePullRequestEvent {
}
/**
 * The status of a pull request merge.
 */
export declare enum PullRequestAsyncStatus {
    /**
     * Status is not set. Default state.
     */
    NotSet = 0,
    /**
     * Pull request merge is queued.
     */
    Queued = 1,
    /**
     * Pull request merge failed due to conflicts.
     */
    Conflicts = 2,
    /**
     * Pull request merge succeeded.
     */
    Succeeded = 3,
    /**
     * Pull request merge rejected by policy.
     */
    RejectedByPolicy = 4,
    /**
     * Pull request merge failed.
     */
    Failure = 5,
}
/**
 * Real time event (SignalR) for pull request creation
 */
export interface PullRequestCreatedEvent extends RealTimePullRequestEvent {
}
/**
 * The specific type of a pull request merge failure.
 */
export declare enum PullRequestMergeFailureType {
    /**
     * Type is not set. Default type.
     */
    None = 0,
    /**
     * Pull request merge failure type unknown.
     */
    Unknown = 1,
    /**
     * Pull request merge failed due to case mismatch.
     */
    CaseSensitive = 2,
    /**
     * Pull request merge failed due to an object being too large.
     */
    ObjectTooLarge = 3,
}
/**
 * Status of a pull request.
 */
export declare enum PullRequestStatus {
    /**
     * Status not set. Default state.
     */
    NotSet = 0,
    /**
     * Pull request is active.
     */
    Active = 1,
    /**
     * Pull request is abandoned.
     */
    Abandoned = 2,
    /**
     * Pull request is completed.
     */
    Completed = 3,
    /**
     * Used in pull request search criterias to include all statuses.
     */
    All = 4,
}
/**
 * Initial config contract sent to extensions creating tabs on the pull request page
 */
export interface PullRequestTabExtensionConfig {
    pullRequestId: number;
    repositoryId: string;
}
/**
 * Base contract for a real time pull request event (SignalR)
 */
export interface RealTimePullRequestEvent {
    /**
     * The id of this event. Can be used to track send/receive state between client and server.
     */
    eventId: string;
    /**
     * The id of the pull request this event was generated for.
     */
    pullRequestId: number;
}
export declare enum RefFavoriteType {
    Invalid = 0,
    Folder = 1,
    Ref = 2,
}
/**
 * Real time event (SignalR) for an update to reviewers on a pull request
 */
export interface ReviewersUpdatedEvent extends RealTimePullRequestEvent {
}
/**
 * Real time event (SignalR) for reviewer votes being reset on a pull request
 */
export interface ReviewersVotesResetEvent extends RealTimePullRequestEvent {
}
/**
 * Real time event (SignalR) for a reviewer vote update on a pull request
 */
export interface ReviewerVoteUpdatedEvent extends RealTimePullRequestEvent {
}
/**
 * Context used while sharing a pull request.
 */
export interface ShareNotificationContext {
    /**
     * Optional user note or message.
     */
    message: string;
    /**
     * Identities of users who will receive a share notification.
     */
    receivers: VSSInterfaces.IdentityRef[];
}
export interface SourceToTargetRef {
    /**
     * The source ref to copy. For example, refs/heads/master.
     */
    sourceRef: string;
    /**
     * The target ref to update. For example, refs/heads/master.
     */
    targetRef: string;
}
/**
 * Real time event (SignalR) for an added status on a pull request
 */
export interface StatusAddedEvent extends RealTimePullRequestEvent {
}
/**
 * Real time event (SignalR) for deleted statuses on a pull request
 */
export interface StatusesDeletedEvent extends RealTimePullRequestEvent {
}
/**
 * Real time event (SignalR) for a status update on a pull request
 */
export interface StatusUpdatedEvent extends RealTimePullRequestEvent {
}
/**
 * Represents a Supported IDE entity.
 */
export interface SupportedIde {
    /**
     * The download URL for the IDE.
     */
    downloadUrl: string;
    /**
     * The type of the IDE.
     */
    ideType: SupportedIdeType;
    /**
     * The name of the IDE.
     */
    name: string;
    /**
     * The URL to open the protocol handler for the IDE.
     */
    protocolHandlerUrl: string;
    /**
     * A list of SupportedPlatforms.
     */
    supportedPlatforms: string[];
}
/**
 * Enumeration that represents the types of IDEs supported.
 */
export declare enum SupportedIdeType {
    Unknown = 0,
    AndroidStudio = 1,
    AppCode = 2,
    CLion = 3,
    DataGrip = 4,
    Eclipse = 13,
    IntelliJ = 5,
    MPS = 6,
    PhpStorm = 7,
    PyCharm = 8,
    RubyMine = 9,
    Tower = 10,
    VisualStudio = 11,
    WebStorm = 12,
}
export interface TfvcBranch extends TfvcBranchRef {
    /**
     * List of children for the branch.
     */
    children: TfvcBranch[];
    /**
     * List of branch mappings.
     */
    mappings: TfvcBranchMapping[];
    /**
     * Path of the branch's parent.
     */
    parent: TfvcShallowBranchRef;
    /**
     * List of paths of the related branches.
     */
    relatedBranches: TfvcShallowBranchRef[];
}
export interface TfvcBranchMapping {
    /**
     * Depth of the branch.
     */
    depth: string;
    /**
     * Server item for the branch.
     */
    serverItem: string;
    /**
     * Type of the branch.
     */
    type: string;
}
export interface TfvcBranchRef extends TfvcShallowBranchRef {
    /**
     * A collection of REST reference links.
     */
    _links: any;
    /**
     * Creation date of the branch.
     */
    createdDate: Date;
    /**
     * Description of the branch.
     */
    description: string;
    /**
     * Is the branch deleted?
     */
    isDeleted: boolean;
    /**
     * Alias or display name of user
     */
    owner: VSSInterfaces.IdentityRef;
    /**
     * URL to retrieve the item.
     */
    url: string;
}
export interface TfvcChange extends Change<TfvcItem> {
    /**
     * List of merge sources in case of rename or branch creation.
     */
    mergeSources: TfvcMergeSource[];
    /**
     * Version at which a (shelved) change was pended against
     */
    pendingVersion: number;
}
export interface TfvcChangeset extends TfvcChangesetRef {
    /**
     * Account Id of the changeset.
     */
    accountId: string;
    /**
     * List of associated changes.
     */
    changes: TfvcChange[];
    /**
     * Checkin Notes for the changeset.
     */
    checkinNotes: CheckinNote[];
    /**
     * Collection Id of the changeset.
     */
    collectionId: string;
    /**
     * Are more changes available.
     */
    hasMoreChanges: boolean;
    /**
     * Policy Override for the changeset.
     */
    policyOverride: TfvcPolicyOverrideInfo;
    /**
     * Team Project Ids for the changeset.
     */
    teamProjectIds: string[];
    /**
     * List of work items associated with the changeset.
     */
    workItems: AssociatedWorkItem[];
}
export interface TfvcChangesetRef {
    /**
     * A collection of REST reference links.
     */
    _links: any;
    /**
     * Alias or display name of user
     */
    author: VSSInterfaces.IdentityRef;
    /**
     * Id of the changeset.
     */
    changesetId: number;
    /**
     * Alias or display name of user
     */
    checkedInBy: VSSInterfaces.IdentityRef;
    /**
     * Comment for the changeset.
     */
    comment: string;
    /**
     * Was the Comment result truncated?
     */
    commentTruncated: boolean;
    /**
     * Creation date of the changeset.
     */
    createdDate: Date;
    /**
     * URL to retrieve the item.
     */
    url: string;
}
/**
 * Criteria used in a search for change lists
 */
export interface TfvcChangesetSearchCriteria {
    /**
     * Alias or display name of user who made the changes
     */
    author: string;
    /**
     * Whether or not to follow renames for the given item being queried
     */
    followRenames: boolean;
    /**
     * If provided, only include changesets created after this date (string) Think of a better name for this.
     */
    fromDate: string;
    /**
     * If provided, only include changesets after this changesetID
     */
    fromId: number;
    /**
     * Whether to include the _links field on the shallow references
     */
    includeLinks: boolean;
    /**
     * Path of item to search under
     */
    itemPath: string;
    /**
     * If provided, only include changesets created before this date (string) Think of a better name for this.
     */
    toDate: string;
    /**
     * If provided, a version descriptor for the latest change list to include
     */
    toId: number;
}
export interface TfvcChangesetsRequestData {
    /**
     * List of changeset Ids.
     */
    changesetIds: number[];
    /**
     * Length of the comment.
     */
    commentLength: number;
    /**
     * Whether to include the _links field on the shallow references
     */
    includeLinks: boolean;
}
export interface TfvcCheckinEventData {
    changeset: TfvcChangeset;
    project: TfsCoreInterfaces.TeamProjectReference;
}
export interface TfvcHistoryEntry extends HistoryEntry<TfvcItem> {
    /**
     * The encoding of the item at this point in history (only relevant for File history, not folders)
     */
    encoding: number;
    /**
     * The file id of the item at this point in history (only relevant for File history, not folders)
     */
    fileId: number;
}
export interface TfvcItem extends ItemModel {
    changeDate: Date;
    deletionId: number;
    /**
     * MD5 hash as a base 64 string, applies to files only.
     */
    hashValue: string;
    isBranch: boolean;
    isPendingChange: boolean;
    /**
     * The size of the file, if applicable.
     */
    size: number;
    version: number;
}
/**
 * Item path and Version descriptor properties
 */
export interface TfvcItemDescriptor {
    path: string;
    recursionLevel: VersionControlRecursionType;
    version: string;
    versionOption: TfvcVersionOption;
    versionType: TfvcVersionType;
}
export interface TfvcItemRequestData {
    /**
     * If true, include metadata about the file type
     */
    includeContentMetadata: boolean;
    /**
     * Whether to include the _links field on the shallow references
     */
    includeLinks: boolean;
    itemDescriptors: TfvcItemDescriptor[];
}
export interface TfvcLabel extends TfvcLabelRef {
    items: TfvcItem[];
}
export interface TfvcLabelRef {
    _links: any;
    description: string;
    id: number;
    labelScope: string;
    modifiedDate: Date;
    name: string;
    owner: VSSInterfaces.IdentityRef;
    url: string;
}
export interface TfvcLabelRequestData {
    /**
     * Whether to include the _links field on the shallow references
     */
    includeLinks: boolean;
    itemLabelFilter: string;
    labelScope: string;
    maxItemCount: number;
    name: string;
    owner: string;
}
export interface TfvcMergeSource {
    /**
     * Indicates if this a rename source. If false, it is a merge source.
     */
    isRename: boolean;
    /**
     * The server item of the merge source
     */
    serverItem: string;
    /**
     * Start of the version range
     */
    versionFrom: number;
    /**
     * End of the version range
     */
    versionTo: number;
}
export interface TfvcPolicyFailureInfo {
    message: string;
    policyName: string;
}
export interface TfvcPolicyOverrideInfo {
    comment: string;
    policyFailures: TfvcPolicyFailureInfo[];
}
export interface TfvcShallowBranchRef {
    /**
     * Path for the branch.
     */
    path: string;
}
/**
 * This is the deep shelveset class
 */
export interface TfvcShelveset extends TfvcShelvesetRef {
    changes: TfvcChange[];
    notes: CheckinNote[];
    policyOverride: TfvcPolicyOverrideInfo;
    workItems: AssociatedWorkItem[];
}
/**
 * This is the shallow shelveset class
 */
export interface TfvcShelvesetRef {
    _links: any;
    comment: string;
    commentTruncated: boolean;
    createdDate: Date;
    id: string;
    name: string;
    owner: VSSInterfaces.IdentityRef;
    url: string;
}
export interface TfvcShelvesetRequestData {
    /**
     * Whether to include policyOverride and notes Only applies when requesting a single deep shelveset
     */
    includeDetails: boolean;
    /**
     * Whether to include the _links field on the shallow references. Does not apply when requesting a single deep shelveset object. Links will always be included in the deep shelveset.
     */
    includeLinks: boolean;
    /**
     * Whether to include workItems
     */
    includeWorkItems: boolean;
    /**
     * Max number of changes to include
     */
    maxChangeCount: number;
    /**
     * Max length of comment
     */
    maxCommentLength: number;
    /**
     * Shelveset's name
     */
    name: string;
    /**
     * Owner's ID. Could be a name or a guid.
     */
    owner: string;
}
export interface TfvcVersionDescriptor {
    version: string;
    versionOption: TfvcVersionOption;
    versionType: TfvcVersionType;
}
export declare enum TfvcVersionOption {
    None = 0,
    Previous = 1,
    UseRename = 2,
}
export declare enum TfvcVersionType {
    None = 0,
    Changeset = 1,
    Shelveset = 2,
    Change = 3,
    Date = 4,
    Latest = 5,
    Tip = 6,
    MergeSource = 7,
}
/**
 * Real time event (SignalR) for a title/description update on a pull request
 */
export interface TitleDescriptionUpdatedEvent extends RealTimePullRequestEvent {
}
export interface UpdateRefsRequest {
    refUpdateRequests: GitRefUpdate[];
    updateMode: GitRefUpdateMode;
}
export declare enum VersionControlChangeType {
    None = 0,
    Add = 1,
    Edit = 2,
    Encoding = 4,
    Rename = 8,
    Delete = 16,
    Undelete = 32,
    Branch = 64,
    Merge = 128,
    Lock = 256,
    Rollback = 512,
    SourceRename = 1024,
    TargetRename = 2048,
    Property = 4096,
    All = 8191,
}
export interface VersionControlProjectInfo {
    defaultSourceControlType: TfsCoreInterfaces.SourceControlTypes;
    project: TfsCoreInterfaces.TeamProjectReference;
    supportsGit: boolean;
    supportsTFVC: boolean;
}
export declare enum VersionControlRecursionType {
    /**
     * Only return the specified item.
     */
    None = 0,
    /**
     * Return the specified item and its direct children.
     */
    OneLevel = 1,
    /**
     * Return the specified item and its direct children, as well as recursive chains of nested child folders that only contain a single folder.
     */
    OneLevelPlusNestedEmptyFolders = 4,
    /**
     * Return specified item and all descendants
     */
    Full = 120,
}
export declare var TypeInfo: {
    Attachment: any;
    Change: any;
    ChangeList: any;
    Comment: any;
    CommentThread: any;
    CommentThreadStatus: {
        enumValues: {
            "unknown": number;
            "active": number;
            "fixed": number;
            "wontFix": number;
            "closed": number;
            "byDesign": number;
            "pending": number;
        };
    };
    CommentType: {
        enumValues: {
            "unknown": number;
            "text": number;
            "codeChange": number;
            "system": number;
        };
    };
    GitAnnotatedTag: any;
    GitAsyncOperationStatus: {
        enumValues: {
            "queued": number;
            "inProgress": number;
            "completed": number;
            "failed": number;
            "abandoned": number;
        };
    };
    GitAsyncRefOperation: any;
    GitAsyncRefOperationDetail: any;
    GitAsyncRefOperationFailureStatus: {
        enumValues: {
            "none": number;
            "invalidRefName": number;
            "refNameConflict": number;
            "createBranchPermissionRequired": number;
            "writePermissionRequired": number;
            "targetBranchDeleted": number;
            "gitObjectTooLarge": number;
            "operationIndentityNotFound": number;
            "asyncOperationNotFound": number;
            "other": number;
        };
    };
    GitAsyncRefOperationParameters: any;
    GitAsyncRefOperationSource: any;
    GitBaseVersionDescriptor: any;
    GitBranchStats: any;
    GitChange: any;
    GitCherryPick: any;
    GitCommit: any;
    GitCommitChanges: any;
    GitCommitDiffs: any;
    GitCommitRef: any;
    GitCommitToCreate: any;
    GitConflict: any;
    GitConflictAddAdd: any;
    GitConflictAddRename: any;
    GitConflictDeleteEdit: any;
    GitConflictDeleteRename: any;
    GitConflictDirectoryFile: any;
    GitConflictEditDelete: any;
    GitConflictEditEdit: any;
    GitConflictFileDirectory: any;
    GitConflictRename1to2: any;
    GitConflictRename2to1: any;
    GitConflictRenameAdd: any;
    GitConflictRenameDelete: any;
    GitConflictRenameRename: any;
    GitConflictType: {
        enumValues: {
            "none": number;
            "addAdd": number;
            "addRename": number;
            "deleteEdit": number;
            "deleteRename": number;
            "directoryFile": number;
            "directoryChild": number;
            "editDelete": number;
            "editEdit": number;
            "fileDirectory": number;
            "rename1to2": number;
            "rename2to1": number;
            "renameAdd": number;
            "renameDelete": number;
            "renameRename": number;
        };
    };
    GitConflictUpdateResult: any;
    GitConflictUpdateStatus: {
        enumValues: {
            "succeeded": number;
            "badRequest": number;
            "invalidResolution": number;
            "unsupportedConflictType": number;
            "notFound": number;
        };
    };
    GitDeletedRepository: any;
    GitForkRef: any;
    GitForkSyncRequest: any;
    GitHistoryMode: {
        enumValues: {
            "simplifiedHistory": number;
            "firstParent": number;
            "fullHistory": number;
            "fullHistorySimplifyMerges": number;
        };
    };
    GitImportFailedEvent: any;
    GitImportRequest: any;
    GitImportSucceededEvent: any;
    GitItem: any;
    GitItemDescriptor: any;
    GitItemRequestData: any;
    GitLastChangeTreeItems: any;
    GitObject: any;
    GitObjectType: {
        enumValues: {
            "bad": number;
            "commit": number;
            "tree": number;
            "blob": number;
            "tag": number;
            "ext2": number;
            "ofsDelta": number;
            "refDelta": number;
        };
    };
    GitPathAction: any;
    GitPathActions: {
        enumValues: {
            "none": number;
            "edit": number;
            "delete": number;
            "add": number;
            "rename": number;
        };
    };
    GitPathToItemsCollection: any;
    GitPullRequest: any;
    GitPullRequestChange: any;
    GitPullRequestCommentThread: any;
    GitPullRequestIteration: any;
    GitPullRequestIterationChanges: any;
    GitPullRequestQuery: any;
    GitPullRequestQueryInput: any;
    GitPullRequestQueryType: {
        enumValues: {
            "notSet": number;
            "lastMergeCommit": number;
            "commit": number;
        };
    };
    GitPullRequestReviewFileType: {
        enumValues: {
            "changeEntry": number;
            "attachment": number;
        };
    };
    GitPullRequestSearchCriteria: any;
    GitPullRequestStatus: any;
    GitPush: any;
    GitPushEventData: any;
    GitPushRef: any;
    GitPushSearchCriteria: any;
    GitQueryBranchStatsCriteria: any;
    GitQueryCommitsCriteria: any;
    GitQueryRefsCriteria: any;
    GitRef: any;
    GitRefFavorite: any;
    GitRefSearchType: {
        enumValues: {
            "exact": number;
            "startsWith": number;
            "contains": number;
        };
    };
    GitRefUpdateMode: {
        enumValues: {
            "bestEffort": number;
            "allOrNone": number;
        };
    };
    GitRefUpdateResult: any;
    GitRefUpdateStatus: {
        enumValues: {
            "succeeded": number;
            "forcePushRequired": number;
            "staleOldObjectId": number;
            "invalidRefName": number;
            "unprocessed": number;
            "unresolvableToCommit": number;
            "writePermissionRequired": number;
            "manageNotePermissionRequired": number;
            "createBranchPermissionRequired": number;
            "createTagPermissionRequired": number;
            "rejectedByPlugin": number;
            "locked": number;
            "refNameConflict": number;
            "rejectedByPolicy": number;
            "succeededNonExistentRef": number;
            "succeededCorruptRef": number;
        };
    };
    GitRepository: any;
    GitRepositoryCreateOptions: any;
    GitRepositoryRef: any;
    GitResolutionError: {
        enumValues: {
            "none": number;
            "mergeContentNotFound": number;
            "pathInUse": number;
            "invalidPath": number;
            "unknownAction": number;
            "unknownMergeType": number;
            "otherError": number;
        };
    };
    GitResolutionMergeContent: any;
    GitResolutionMergeType: {
        enumValues: {
            "undecided": number;
            "takeSourceContent": number;
            "takeTargetContent": number;
            "autoMerged": number;
            "userMerged": number;
        };
    };
    GitResolutionPathConflict: any;
    GitResolutionPathConflictAction: {
        enumValues: {
            "undecided": number;
            "keepSourceRenameTarget": number;
            "keepSourceDeleteTarget": number;
            "keepTargetRenameSource": number;
            "keepTargetDeleteSource": number;
        };
    };
    GitResolutionPickOneAction: any;
    GitResolutionRename1to2: any;
    GitResolutionRename1to2Action: {
        enumValues: {
            "undecided": number;
            "keepSourcePath": number;
            "keepTargetPath": number;
            "keepBothFiles": number;
        };
    };
    GitResolutionStatus: {
        enumValues: {
            "unresolved": number;
            "partiallyResolved": number;
            "resolved": number;
        };
    };
    GitResolutionWhichAction: {
        enumValues: {
            "undecided": number;
            "pickSourceAction": number;
            "pickTargetAction": number;
        };
    };
    GitRevert: any;
    GitStatus: any;
    GitStatusState: {
        enumValues: {
            "notSet": number;
            "pending": number;
            "succeeded": number;
            "failed": number;
            "error": number;
            "notApplicable": number;
        };
    };
    GitTargetVersionDescriptor: any;
    GitTreeDiff: any;
    GitTreeDiffEntry: any;
    GitTreeDiffResponse: any;
    GitTreeEntryRef: any;
    GitTreeRef: any;
    GitUserDate: any;
    GitVersionDescriptor: any;
    GitVersionOptions: {
        enumValues: {
            "none": number;
            "previousChange": number;
            "firstParent": number;
        };
    };
    GitVersionType: {
        enumValues: {
            "branch": number;
            "tag": number;
            "commit": number;
        };
    };
    HistoryEntry: any;
    IncludedGitCommit: any;
    ItemContent: any;
    ItemContentType: {
        enumValues: {
            "rawText": number;
            "base64Encoded": number;
        };
    };
    ItemDetailsOptions: any;
    IterationReason: {
        enumValues: {
            "push": number;
            "forcePush": number;
            "create": number;
            "rebase": number;
            "unknown": number;
        };
    };
    PullRequestAsyncStatus: {
        enumValues: {
            "notSet": number;
            "queued": number;
            "conflicts": number;
            "succeeded": number;
            "rejectedByPolicy": number;
            "failure": number;
        };
    };
    PullRequestMergeFailureType: {
        enumValues: {
            "none": number;
            "unknown": number;
            "caseSensitive": number;
            "objectTooLarge": number;
        };
    };
    PullRequestStatus: {
        enumValues: {
            "notSet": number;
            "active": number;
            "abandoned": number;
            "completed": number;
            "all": number;
        };
    };
    RefFavoriteType: {
        enumValues: {
            "invalid": number;
            "folder": number;
            "ref": number;
        };
    };
    SupportedIde: any;
    SupportedIdeType: {
        enumValues: {
            "unknown": number;
            "androidStudio": number;
            "appCode": number;
            "cLion": number;
            "dataGrip": number;
            "eclipse": number;
            "intelliJ": number;
            "mPS": number;
            "phpStorm": number;
            "pyCharm": number;
            "rubyMine": number;
            "tower": number;
            "visualStudio": number;
            "webStorm": number;
        };
    };
    TfvcBranch: any;
    TfvcBranchRef: any;
    TfvcChange: any;
    TfvcChangeset: any;
    TfvcChangesetRef: any;
    TfvcCheckinEventData: any;
    TfvcHistoryEntry: any;
    TfvcItem: any;
    TfvcItemDescriptor: any;
    TfvcItemRequestData: any;
    TfvcLabel: any;
    TfvcLabelRef: any;
    TfvcShelveset: any;
    TfvcShelvesetRef: any;
    TfvcVersionDescriptor: any;
    TfvcVersionOption: {
        enumValues: {
            "none": number;
            "previous": number;
            "useRename": number;
        };
    };
    TfvcVersionType: {
        enumValues: {
            "none": number;
            "changeset": number;
            "shelveset": number;
            "change": number;
            "date": number;
            "latest": number;
            "tip": number;
            "mergeSource": number;
        };
    };
    UpdateRefsRequest: any;
    VersionControlChangeType: {
        enumValues: {
            "none": number;
            "add": number;
            "edit": number;
            "encoding": number;
            "rename": number;
            "delete": number;
            "undelete": number;
            "branch": number;
            "merge": number;
            "lock": number;
            "rollback": number;
            "sourceRename": number;
            "targetRename": number;
            "property": number;
            "all": number;
        };
    };
    VersionControlProjectInfo: any;
    VersionControlRecursionType: {
        enumValues: {
            "none": number;
            "oneLevel": number;
            "oneLevelPlusNestedEmptyFolders": number;
            "full": number;
        };
    };
};
