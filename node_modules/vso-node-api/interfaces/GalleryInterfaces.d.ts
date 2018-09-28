/**
 * How the acquisition is assigned
 */
export declare enum AcquisitionAssignmentType {
    None = 0,
    /**
     * Just assign for me
     */
    Me = 1,
    /**
     * Assign for all users in the account
     */
    All = 2,
}
export interface AcquisitionOperation {
    /**
     * State of the the AcquisitionOperation for the current user
     */
    operationState: AcquisitionOperationState;
    /**
     * AcquisitionOperationType: install, request, buy, etc...
     */
    operationType: AcquisitionOperationType;
    /**
     * Optional reason to justify current state. Typically used with Disallow state.
     */
    reason: string;
}
export declare enum AcquisitionOperationState {
    /**
     * Not allowed to use this AcquisitionOperation
     */
    Disallow = 0,
    /**
     * Allowed to use this AcquisitionOperation
     */
    Allow = 1,
    /**
     * Operation has already been completed and is no longer available
     */
    Completed = 3,
}
/**
 * Set of different types of operations that can be requested.
 */
export declare enum AcquisitionOperationType {
    /**
     * Not yet used
     */
    Get = 0,
    /**
     * Install this extension into the host provided
     */
    Install = 1,
    /**
     * Buy licenses for this extension and install into the host provided
     */
    Buy = 2,
    /**
     * Try this extension
     */
    Try = 3,
    /**
     * Request this extension for installation
     */
    Request = 4,
    /**
     * No action found
     */
    None = 5,
    /**
     * Request admins for purchasing extension
     */
    PurchaseRequest = 6,
}
/**
 * Market item acquisition options (install, buy, etc) for an installation target.
 */
export interface AcquisitionOptions {
    /**
     * Default Operation for the ItemId in this target
     */
    defaultOperation: AcquisitionOperation;
    /**
     * The item id that this options refer to
     */
    itemId: string;
    /**
     * Operations allowed for the ItemId in this target
     */
    operations: AcquisitionOperation[];
    /**
     * The target that this options refer to
     */
    target: string;
}
export interface Answers {
    /**
     * Gets or sets the vs marketplace extension name
     */
    vSMarketplaceExtensionName: string;
    /**
     * Gets or sets the vs marketplace publsiher name
     */
    vSMarketplacePublisherName: string;
}
export interface AssetDetails {
    /**
     * Gets or sets the Answers, which contains vs marketplace extension name and publisher name
     */
    answers: Answers;
    /**
     * Gets or sets the VS publisher Id
     */
    publisherNaturalIdentifier: string;
}
export interface AzurePublisher {
    azurePublisherId: string;
    publisherName: string;
}
export interface AzureRestApiRequestModel {
    /**
     * Gets or sets the Asset details
     */
    assetDetails: AssetDetails;
    /**
     * Gets or sets the asset id
     */
    assetId: string;
    /**
     * Gets or sets the asset version
     */
    assetVersion: number;
    /**
     * Gets or sets the customer support email
     */
    customerSupportEmail: string;
    /**
     * Gets or sets the integration contact email
     */
    integrationContactEmail: string;
    /**
     * Gets or sets the asset version
     */
    operation: string;
    /**
     * Gets or sets the plan identifier if any.
     */
    planId: string;
    /**
     * Gets or sets the publisher id
     */
    publisherId: string;
    /**
     * Gets or sets the resource type
     */
    type: string;
}
export interface AzureRestApiResponseModel extends AzureRestApiRequestModel {
    /**
     * Gets or sets the Asset operation status
     */
    operationStatus: RestApiResponseStatusModel;
}
/**
 * This is the set of categories in response to the get category query
 */
export interface CategoriesResult {
    categories: ExtensionCategory[];
}
/**
 * Definition of one title of a category
 */
export interface CategoryLanguageTitle {
    /**
     * The language for which the title is applicable
     */
    lang: string;
    /**
     * The language culture id of the lang parameter
     */
    lcid: number;
    /**
     * Actual title to be shown on the UI
     */
    title: string;
}
/**
 * The structure of a Concern Rather than defining a separate data structure having same fields as QnAItem, we are inheriting from the QnAItem.
 */
export interface Concern extends QnAItem {
    /**
     * Category of the concern
     */
    category: ConcernCategory;
}
export declare enum ConcernCategory {
    General = 1,
    Abusive = 2,
    Spam = 4,
}
/**
 * Stores Last Contact Date
 */
export interface CustomerLastContact {
    /**
     * account for which customer was last contacted
     */
    account: string;
    /**
     * Date on which the custoemr was last contacted
     */
    lastContactDate: Date;
}
export declare enum DraftPatchOperation {
    Publish = 1,
    Cancel = 2,
}
export declare enum DraftStateType {
    Unpublished = 1,
    Published = 2,
    Cancelled = 3,
    Error = 4,
}
export interface EventCounts {
    /**
     * Average rating on the day for extension
     */
    averageRating: number;
    /**
     * Number of times the extension was bought in hosted scenario (applies only to VSTS extensions)
     */
    buyCount: number;
    /**
     * Number of times the extension was bought in connected scenario (applies only to VSTS extensions)
     */
    connectedBuyCount: number;
    /**
     * Number of times the extension was installed in connected scenario (applies only to VSTS extensions)
     */
    connectedInstallCount: number;
    /**
     * Number of times the extension was installed
     */
    installCount: number;
    /**
     * Number of times the extension was installed as a trial (applies only to VSTS extensions)
     */
    tryCount: number;
    /**
     * Number of times the extension was uninstalled (applies only to VSTS extensions)
     */
    uninstallCount: number;
    /**
     * Number of times the extension was downloaded (applies to VSTS extensions and VSCode marketplace click installs)
     */
    webDownloadCount: number;
    /**
     * Number of detail page views
     */
    webPageViews: number;
}
/**
 * Contract for handling the extension acquisition process
 */
export interface ExtensionAcquisitionRequest {
    /**
     * How the item is being assigned
     */
    assignmentType: AcquisitionAssignmentType;
    /**
     * The id of the subscription used for purchase
     */
    billingId: string;
    /**
     * The marketplace id (publisherName.extensionName) for the item
     */
    itemId: string;
    /**
     * The type of operation, such as install, request, purchase
     */
    operationType: AcquisitionOperationType;
    /**
     * Additional properties which can be added to the request.
     */
    properties: any;
    /**
     * How many licenses should be purchased
     */
    quantity: number;
    /**
     * A list of target guids where the item should be acquired (installed, requested, etc.), such as account id
     */
    targets: string[];
}
export interface ExtensionBadge {
    description: string;
    imgUri: string;
    link: string;
}
export interface ExtensionCategory {
    /**
     * The name of the products with which this category is associated to.
     */
    associatedProducts: string[];
    categoryId: number;
    /**
     * This is the internal name for a category
     */
    categoryName: string;
    /**
     * This parameter is obsolete. Refer to LanguageTitles for langauge specific titles
     */
    language: string;
    /**
     * The list of all the titles of this category in various languages
     */
    languageTitles: CategoryLanguageTitle[];
    /**
     * This is the internal name of the parent if this is associated with a parent
     */
    parentCategoryName: string;
}
export interface ExtensionDailyStat {
    /**
     * Stores the event counts
     */
    counts: EventCounts;
    /**
     * Generic key/value pair to store extended statistics. Used for sending paid extension stats like Upgrade, Downgrade, Cancel trend etc.
     */
    extendedStats: {
        [key: string]: any;
    };
    /**
     * Timestamp of this data point
     */
    statisticDate: Date;
    /**
     * Version of the extension
     */
    version: string;
}
export interface ExtensionDailyStats {
    /**
     * List of extension statistics data points
     */
    dailyStats: ExtensionDailyStat[];
    /**
     * Id of the extension, this will never be sent back to the client. For internal use only.
     */
    extensionId: string;
    /**
     * Name of the extension
     */
    extensionName: string;
    /**
     * Name of the publisher
     */
    publisherName: string;
    /**
     * Count of stats
     */
    statCount: number;
}
export declare enum ExtensionDeploymentTechnology {
    Exe = 1,
    Msi = 2,
    Vsix = 3,
    ReferralLink = 4,
}
export interface ExtensionDraft {
    assets: ExtensionDraftAsset[];
    createdDate: Date;
    draftState: DraftStateType;
    extensionName: string;
    id: string;
    lastUpdated: Date;
    payload: ExtensionPayload;
    product: string;
    publisherName: string;
    validationErrors: {
        key: string;
        value: string;
    }[];
    validationWarnings: {
        key: string;
        value: string;
    }[];
}
export interface ExtensionDraftAsset extends ExtensionFile {
}
export interface ExtensionDraftPatch {
    extensionData: UnpackagedExtensionData;
    operation: DraftPatchOperation;
}
/**
 * Stores details of each event
 */
export interface ExtensionEvent {
    /**
     * Id which identifies each data point uniquely
     */
    id: number;
    properties: any;
    /**
     * Timestamp of when the event occurred
     */
    statisticDate: Date;
    /**
     * Version of the extension
     */
    version: string;
}
/**
 * Container object for all extension events. Stores all install and uninstall events related to an extension. The events container is generic so can store data of any type of event. New event types can be added without altering the contract.
 */
export interface ExtensionEvents {
    /**
     * Generic container for events data. The dictionary key denotes the type of event and the list contains properties related to that event
     */
    events: {
        [key: string]: ExtensionEvent[];
    };
    /**
     * Id of the extension, this will never be sent back to the client. This field will mainly be used when EMS calls into Gallery REST API to update install/uninstall events for various extensions in one go.
     */
    extensionId: string;
    /**
     * Name of the extension
     */
    extensionName: string;
    /**
     * Name of the publisher
     */
    publisherName: string;
}
export interface ExtensionFile {
    assetType: string;
    language: string;
    source: string;
}
/**
 * The FilterResult is the set of extensions that matched a particular query filter.
 */
export interface ExtensionFilterResult {
    /**
     * This is the set of appplications that matched the query filter supplied.
     */
    extensions: PublishedExtension[];
    /**
     * The PagingToken is returned from a request when more records exist that match the result than were requested or could be returned. A follow-up query with this paging token can be used to retrieve more results.
     */
    pagingToken: string;
    /**
     * This is the additional optional metadata for the given result. E.g. Total count of results which is useful in case of paged results
     */
    resultMetadata: ExtensionFilterResultMetadata[];
}
/**
 * ExtensionFilterResultMetadata is one set of metadata for the result e.g. Total count. There can be multiple metadata items for one metadata.
 */
export interface ExtensionFilterResultMetadata {
    /**
     * The metadata items for the category
     */
    metadataItems: MetadataItem[];
    /**
     * Defines the category of metadata items
     */
    metadataType: string;
}
/**
 * Represents the component pieces of an extensions fully qualified name, along with the fully qualified name.
 */
export interface ExtensionIdentifier {
    /**
     * The ExtensionName component part of the fully qualified ExtensionIdentifier
     */
    extensionName: string;
    /**
     * The PublisherName component part of the fully qualified ExtensionIdentifier
     */
    publisherName: string;
}
/**
 * Type of event
 */
export declare enum ExtensionLifecycleEventType {
    Uninstall = 1,
    Install = 2,
    Review = 3,
    Acquisition = 4,
    Sales = 5,
    Other = 999,
}
/**
 * Package that will be used to create or update a published extension
 */
export interface ExtensionPackage {
    /**
     * Base 64 encoded extension package
     */
    extensionManifest: string;
}
export interface ExtensionPayload {
    description: string;
    displayName: string;
    fileName: string;
    installationTargets: InstallationTarget[];
    isSignedByMicrosoft: boolean;
    isValid: boolean;
    metadata: {
        key: string;
        value: string;
    }[];
    type: ExtensionDeploymentTechnology;
}
/**
 * Policy with a set of permissions on extension operations
 */
export interface ExtensionPolicy {
    /**
     * Permissions on 'Install' operation
     */
    install: ExtensionPolicyFlags;
    /**
     * Permission on 'Request' operation
     */
    request: ExtensionPolicyFlags;
}
/**
 * Set of flags that can be associated with a given permission over an extension
 */
export declare enum ExtensionPolicyFlags {
    /**
     * No permission
     */
    None = 0,
    /**
     * Permission on private extensions
     */
    Private = 1,
    /**
     * Permission on public extensions
     */
    Public = 2,
    /**
     * Premission in extensions that are in preview
     */
    Preview = 4,
    /**
     * Premission in relased extensions
     */
    Released = 8,
    /**
     * Permission in 1st party extensions
     */
    FirstParty = 16,
    /**
     * Mask that defines all permissions
     */
    All = 31,
}
/**
 * An ExtensionQuery is used to search the gallery for a set of extensions that match one of many filter values.
 */
export interface ExtensionQuery {
    /**
     * When retrieving extensions with a query; frequently the caller only needs a small subset of the assets. The caller may specify a list of asset types that should be returned if the extension contains it. All other assets will not be returned.
     */
    assetTypes: string[];
    /**
     * Each filter is a unique query and will have matching set of extensions returned from the request. Each result will have the same index in the resulting array that the filter had in the incoming query.
     */
    filters: QueryFilter[];
    /**
     * The Flags are used to deterine which set of information the caller would like returned for the matched extensions.
     */
    flags: ExtensionQueryFlags;
}
/**
 * Type of extension filters that are supported in the queries.
 */
export declare enum ExtensionQueryFilterType {
    /**
     * The values are used as tags. All tags are treated as "OR" conditions with each other. There may be some value put on the number of matched tags from the query.
     */
    Tag = 1,
    /**
     * The Values are an ExtensionName or fragment that is used to match other extension names.
     */
    DisplayName = 2,
    /**
     * The Filter is one or more tokens that define what scope to return private extensions for.
     */
    Private = 3,
    /**
     * Retrieve a set of extensions based on their id's. The values should be the extension id's encoded as strings.
     */
    Id = 4,
    /**
     * The catgeory is unlike other filters. It is AND'd with the other filters instead of being a seperate query.
     */
    Category = 5,
    /**
     * Certain contribution types may be indexed to allow for query by type. User defined types can't be indexed at the moment.
     */
    ContributionType = 6,
    /**
     * Retrieve an set extension based on the name based identifier. This differs from the internal id (which is being deprecated).
     */
    Name = 7,
    /**
     * The InstallationTarget for an extension defines the target consumer for the extension. This may be something like VS, VSOnline, or VSCode
     */
    InstallationTarget = 8,
    /**
     * Query for featured extensions, no value is allowed when using the query type.
     */
    Featured = 9,
    /**
     * The SearchText provided by the user to search for extensions
     */
    SearchText = 10,
    /**
     * Query for extensions that are featured in their own category, The filterValue for this is name of category of extensions.
     */
    FeaturedInCategory = 11,
    /**
     * When retrieving extensions from a query, exclude the extensions which are having the given flags. The value specified for this filter should be a string representing the integer values of the flags to be excluded. In case of mulitple flags to be specified, a logical OR of the interger values should be given as value for this filter This should be at most one filter of this type. This only acts as a restrictive filter after. In case of having a particular flag in both IncludeWithFlags and ExcludeWithFlags, excludeFlags will remove the included extensions giving empty result for that flag.
     */
    ExcludeWithFlags = 12,
    /**
     * When retrieving extensions from a query, include the extensions which are having the given flags. The value specified for this filter should be a string representing the integer values of the flags to be included. In case of mulitple flags to be specified, a logical OR of the interger values should be given as value for this filter This should be at most one filter of this type. This only acts as a restrictive filter after. In case of having a particular flag in both IncludeWithFlags and ExcludeWithFlags, excludeFlags will remove the included extensions giving empty result for that flag. In case of multiple flags given in IncludeWithFlags in ORed fashion, extensions having any of the given flags will be included.
     */
    IncludeWithFlags = 13,
    /**
     * Fitler the extensions based on the LCID values applicable. Any extensions which are not having any LCID values will also be filtered. This is currenlty only supported for VS extensions.
     */
    Lcid = 14,
    /**
     * Filter to provide the version of the installation target. This filter will be used along with InstallationTarget filter. The value should be a valid version string. Currently supported only if search text is provided.
     */
    InstallationTargetVersion = 15,
    /**
     * Filter type for specifying a range of installation target version. The filter will be used along with InstallationTarget filter. The value should be a pair of well formed version values separated by hyphen(-). Currently supported only if search text is provided.
     */
    InstallationTargetVersionRange = 16,
    /**
     * Filter type for specifying metadata key and value to be used for filtering.
     */
    VsixMetadata = 17,
}
/**
 * Set of flags used to determine which set of information is retrieved when reading published extensions
 */
export declare enum ExtensionQueryFlags {
    /**
     * None is used to retrieve only the basic extension details.
     */
    None = 0,
    /**
     * IncludeVersions will return version information for extensions returned
     */
    IncludeVersions = 1,
    /**
     * IncludeFiles will return information about which files were found within the extension that were stored independant of the manifest. When asking for files, versions will be included as well since files are returned as a property of the versions.  These files can be retrieved using the path to the file without requiring the entire manifest be downloaded.
     */
    IncludeFiles = 2,
    /**
     * Include the Categories and Tags that were added to the extension definition.
     */
    IncludeCategoryAndTags = 4,
    /**
     * Include the details about which accounts the extension has been shared with if the extesion is a private extension.
     */
    IncludeSharedAccounts = 8,
    /**
     * Include properties associated with versions of the extension
     */
    IncludeVersionProperties = 16,
    /**
     * Excluding non-validated extensions will remove any extension versions that either are in the process of being validated or have failed validation.
     */
    ExcludeNonValidated = 32,
    /**
     * Include the set of installation targets the extension has requested.
     */
    IncludeInstallationTargets = 64,
    /**
     * Include the base uri for assets of this extension
     */
    IncludeAssetUri = 128,
    /**
     * Include the statistics associated with this extension
     */
    IncludeStatistics = 256,
    /**
     * When retrieving versions from a query, only include the latest version of the extensions that matched. This is useful when the caller doesn't need all the published versions. It will save a significant size in the returned payload.
     */
    IncludeLatestVersionOnly = 512,
    /**
     * This flag switches the asset uri to use GetAssetByName instead of CDN When this is used, values of base asset uri and base asset uri fallback are switched When this is used, source of asset files are pointed to Gallery service always even if CDN is available
     */
    UseFallbackAssetUri = 1024,
    /**
     * This flag is used to get all the metadata values associated with the extension. This is not applicable to VSTS or VSCode extensions and usage is only internal.
     */
    IncludeMetadata = 2048,
    /**
     * This flag is used to indicate to return very small data for extension reruired by VS IDE. This flag is only compatible when querying is done by VS IDE
     */
    IncludeMinimalPayloadForVsIde = 4096,
    /**
     * This flag is used to get Lcid values associated with the extension. This is not applicable to VSTS or VSCode extensions and usage is only internal
     */
    IncludeLcids = 8192,
    /**
     * AllAttributes is designed to be a mask that defines all sub-elements of the extension should be returned.  NOTE: This is not actually All flags. This is now locked to the set defined since changing this enum would be a breaking change and would change the behavior of anyone using it. Try not to use this value when making calls to the service, instead be explicit about the options required.
     */
    AllAttributes = 479,
}
/**
 * This is the set of extensions that matched a supplied query through the filters given.
 */
export interface ExtensionQueryResult {
    /**
     * For each filter supplied in the query, a filter result will be returned in the query result.
     */
    results: ExtensionFilterResult[];
}
export interface ExtensionShare {
    id: string;
    name: string;
    type: string;
}
export interface ExtensionStatistic {
    statisticName: string;
    value: number;
}
export declare enum ExtensionStatisticOperation {
    None = 0,
    Set = 1,
    Increment = 2,
    Decrement = 3,
    Delete = 4,
}
export interface ExtensionStatisticUpdate {
    extensionName: string;
    operation: ExtensionStatisticOperation;
    publisherName: string;
    statistic: ExtensionStatistic;
}
/**
 * Stats aggregation type
 */
export declare enum ExtensionStatsAggregateType {
    Daily = 1,
}
export interface ExtensionVersion {
    assetUri: string;
    badges: ExtensionBadge[];
    fallbackAssetUri: string;
    files: ExtensionFile[];
    flags: ExtensionVersionFlags;
    lastUpdated: Date;
    properties: {
        key: string;
        value: string;
    }[];
    validationResultMessage: string;
    version: string;
    versionDescription: string;
}
/**
 * Set of flags that can be associated with a given extension version. These flags apply to a specific version of the extension.
 */
export declare enum ExtensionVersionFlags {
    /**
     * No flags exist for this version.
     */
    None = 0,
    /**
     * The Validated flag for a version means the extension version has passed validation and can be used..
     */
    Validated = 1,
}
/**
 * One condition in a QueryFilter.
 */
export interface FilterCriteria {
    filterType: number;
    /**
     * The value used in the match based on the filter type.
     */
    value: string;
}
export interface InstallationTarget {
    target: string;
    targetVersion: string;
}
/**
 * Provides link details
 */
export interface Link {
    href: string;
}
/**
 * MetadataItem is one value of metadata under a given category of metadata
 */
export interface MetadataItem {
    /**
     * The count of the metadata item
     */
    count: number;
    /**
     * The name of the metadata item
     */
    name: string;
}
/**
 * Information needed for sending mail notification
 */
export interface NotificationsData {
    /**
     * Notification data needed
     */
    data: {
        [key: string]: any;
    };
    /**
     * List of users who should get the notification
     */
    identities: {
        [key: string]: any;
    };
    /**
     * Type of Mail Notification.Can be Qna , review or CustomerContact
     */
    type: NotificationTemplateType;
}
/**
 * Type of event
 */
export declare enum NotificationTemplateType {
    /**
     * Template type for Review Notification.
     */
    ReviewNotification = 1,
    /**
     * Template type for Qna Notification.
     */
    QnaNotification = 2,
    /**
     * Template type for Customer Contact Notification.
     */
    CustomerContactNotification = 3,
    /**
     * Template type for Publisher Member Notification.
     */
    PublisherMemberUpdateNotification = 4,
}
/**
 * PagingDirection is used to define which set direction to move the returned result set based on a previous query.
 */
export declare enum PagingDirection {
    /**
     * Backward will return results from earlier in the resultset.
     */
    Backward = 1,
    /**
     * Forward will return results from later in the resultset.
     */
    Forward = 2,
}
/**
 * This is the set of categories in response to the get category query
 */
export interface ProductCategoriesResult {
    categories: ProductCategory[];
}
/**
 * This is the interface object to be used by Root Categories and Category Tree APIs for Visual Studio Ide.
 */
export interface ProductCategory {
    children: ProductCategory[];
    /**
     * Indicator whether this is a leaf or there are children under this category
     */
    hasChildren: boolean;
    /**
     * Individual Guid of the Category
     */
    id: string;
    /**
     * Category Title in the requested language
     */
    title: string;
}
export interface PublishedExtension {
    categories: string[];
    deploymentType: ExtensionDeploymentTechnology;
    displayName: string;
    extensionId: string;
    extensionName: string;
    flags: PublishedExtensionFlags;
    installationTargets: InstallationTarget[];
    lastUpdated: Date;
    longDescription: string;
    /**
     * Date on which the extension was first uploaded.
     */
    publishedDate: Date;
    publisher: PublisherFacts;
    /**
     * Date on which the extension first went public.
     */
    releaseDate: Date;
    sharedWith: ExtensionShare[];
    shortDescription: string;
    statistics: ExtensionStatistic[];
    tags: string[];
    versions: ExtensionVersion[];
}
/**
 * Set of flags that can be associated with a given extension. These flags apply to all versions of the extension and not to a specific version.
 */
export declare enum PublishedExtensionFlags {
    /**
     * No flags exist for this extension.
     */
    None = 0,
    /**
     * The Disabled flag for an extension means the extension can't be changed and won't be used by consumers. The disabled flag is managed by the service and can't be supplied by the Extension Developers.
     */
    Disabled = 1,
    /**
     * BuiltIn Extension are available to all Tenants. An explicit registration is not required. This attribute is reserved and can't be supplied by Extension Developers.  BuiltIn extensions are by definition Public. There is no need to set the public flag for extensions marked BuiltIn.
     */
    BuiltIn = 2,
    /**
     * This extension has been validated by the service. The extension meets the requirements specified. This attribute is reserved and can't be supplied by the Extension Developers. Validation is a process that ensures that all contributions are well formed. They meet the requirements defined by the contribution type they are extending. Note this attribute will be updated asynchronously as the extension is validated by the developer of the contribution type. There will be restricted access to the extension while this process is performed.
     */
    Validated = 4,
    /**
     * Trusted extensions are ones that are given special capabilities. These tend to come from Microsoft and can't be published by the general public.  Note: BuiltIn extensions are always trusted.
     */
    Trusted = 8,
    /**
     * The Paid flag indicates that the commerce can be enabled for this extension. Publisher needs to setup Offer/Pricing plan in Azure. If Paid flag is set and a corresponding Offer is not available, the extension will automatically be marked as Preview. If the publisher intends to make the extension Paid in the future, it is mandatory to set the Preview flag. This is currently available only for VSTS extensions only.
     */
    Paid = 16,
    /**
     * This extension registration is public, making its visibilty open to the public. This means all tenants have the ability to install this extension. Without this flag the extension will be private and will need to be shared with the tenants that can install it.
     */
    Public = 256,
    /**
     * This extension has multiple versions active at one time and version discovery should be done usig the defined "Version Discovery" protocol to determine the version available to a specific user or tenant.  @TODO: Link to Version Discovery Protocol.
     */
    MultiVersion = 512,
    /**
     * The system flag is reserved, and cant be used by publishers.
     */
    System = 1024,
    /**
     * The Preview flag indicates that the extension is still under preview (not yet of "release" quality). These extensions may be decorated differently in the gallery and may have different policies applied to them.
     */
    Preview = 2048,
    /**
     * The Unpublished flag indicates that the extension can't be installed/downloaded. Users who have installed such an extension can continue to use the extension.
     */
    Unpublished = 4096,
    /**
     * The Trial flag indicates that the extension is in Trial version. The flag is right now being used only with respec to Visual Studio extensions.
     */
    Trial = 8192,
    /**
     * The Locked flag indicates that extension has been locked from Marketplace. Further updates/acquisitions are not allowed on the extension until this is present. This should be used along with making the extension private/unpublished.
     */
    Locked = 16384,
}
export interface Publisher {
    displayName: string;
    emailAddress: string[];
    extensions: PublishedExtension[];
    flags: PublisherFlags;
    lastUpdated: Date;
    links: PublisherLinks;
    longDescription: string;
    publisherId: string;
    publisherName: string;
    shortDescription: string;
}
/**
 * High-level information about the publisher, like id's and names
 */
export interface PublisherFacts {
    displayName: string;
    flags: PublisherFlags;
    publisherId: string;
    publisherName: string;
}
/**
 * The FilterResult is the set of publishers that matched a particular query filter.
 */
export interface PublisherFilterResult {
    /**
     * This is the set of appplications that matched the query filter supplied.
     */
    publishers: Publisher[];
}
export declare enum PublisherFlags {
    /**
     * This should never be returned, it is used to represent a publisher who's flags havent changed during update calls.
     */
    UnChanged = 1073741824,
    /**
     * No flags exist for this publisher.
     */
    None = 0,
    /**
     * The Disabled flag for a publisher means the publisher can't be changed and won't be used by consumers, this extends to extensions owned by the publisher as well. The disabled flag is managed by the service and can't be supplied by the Extension Developers.
     */
    Disabled = 1,
    /**
     * A verified publisher is one that Microsoft has done some review of and ensured the publisher meets a set of requirements. The requirements to become a verified publisher are not listed here.  They can be found in public documentation (TBD).
     */
    Verified = 2,
    /**
     * This is the set of flags that can't be supplied by the developer and is managed by the service itself.
     */
    ServiceFlags = 3,
}
export interface PublisherLinks {
    /**
     * URL for company website
     */
    company: Link;
    /**
     * URL for publisher logo if CDN is down
     */
    fallbackLogo: Link;
    /**
     * URL for publisher LinkedIn profile
     */
    linkedIn: Link;
    /**
     * CDN URL for publisher logo
     */
    logo: Link;
    /**
     * URL for publisher public profile page
     */
    profile: Link;
    /**
     * URL for source code repo
     */
    sourceCode: Link;
    /**
     * URL or email id for support
     */
    support: Link;
    /**
     * URL for Twitter handle of publisher company
     */
    twitter: Link;
}
export declare enum PublisherPermissions {
    /**
     * This gives the bearer the rights to read Publishers and Extensions.
     */
    Read = 1,
    /**
     * This gives the bearer the rights to update, delete, and share Extensions (but not the ability to create them).
     */
    UpdateExtension = 2,
    /**
     * This gives the bearer the rights to create new Publishers at the root of the namespace.
     */
    CreatePublisher = 4,
    /**
     * This gives the bearer the rights to create new Extensions within a publisher.
     */
    PublishExtension = 8,
    /**
     * Admin gives the bearer the rights to manage restricted attributes of Publishers and Extensions.
     */
    Admin = 16,
    /**
     * TrustedPartner gives the bearer the rights to publish a extensions with restricted capabilities.
     */
    TrustedPartner = 32,
    /**
     * PrivateRead is another form of read designed to allow higher privilege accessors the ability to read private extensions.
     */
    PrivateRead = 64,
    /**
     * This gives the bearer the rights to delete any extension.
     */
    DeleteExtension = 128,
    /**
     * This gives the bearer the rights edit the publisher settings.
     */
    EditSettings = 256,
    /**
     * This gives the bearer the rights to see all permissions on the publisher.
     */
    ViewPermissions = 512,
    /**
     * This gives the bearer the rights to assign permissions on the publisher.
     */
    ManagePermissions = 1024,
    /**
     * This gives the bearer the rights to delete the publisher.
     */
    DeletePublisher = 2048,
}
/**
 * An PublisherQuery is used to search the gallery for a set of publishers that match one of many filter values.
 */
export interface PublisherQuery {
    /**
     * Each filter is a unique query and will have matching set of publishers returned from the request. Each result will have the same index in the resulting array that the filter had in the incoming query.
     */
    filters: QueryFilter[];
    /**
     * The Flags are used to deterine which set of information the caller would like returned for the matched publishers.
     */
    flags: PublisherQueryFlags;
}
/**
 * Set of flags used to define the attributes requested when a publisher is returned. Some API's allow the caller to specify the level of detail needed.
 */
export declare enum PublisherQueryFlags {
    /**
     * None is used to retrieve only the basic publisher details.
     */
    None = 0,
    /**
     * Is used to include a list of basic extension details for all extensions published by the requested publisher.
     */
    IncludeExtensions = 1,
    /**
     * Is used to include email address of all the users who are marked as owners for the publisher
     */
    IncludeEmailAddress = 2,
}
/**
 * This is the set of publishers that matched a supplied query through the filters given.
 */
export interface PublisherQueryResult {
    /**
     * For each filter supplied in the query, a filter result will be returned in the query result.
     */
    results: PublisherFilterResult[];
}
/**
 * The core structure of a QnA item
 */
export interface QnAItem {
    /**
     * Time when the review was first created
     */
    createdDate: Date;
    /**
     * Unique identifier of a QnA item
     */
    id: number;
    /**
     * Get status of item
     */
    status: QnAItemStatus;
    /**
     * Text description of the QnA item
     */
    text: string;
    /**
     * Time when the review was edited/updated
     */
    updatedDate: Date;
    /**
     * User details for the item.
     */
    user: UserIdentityRef;
}
/**
 * Denotes the status of the QnA Item
 */
export declare enum QnAItemStatus {
    None = 0,
    /**
     * The UserEditable flag indicates whether the item is editable by the logged in user.
     */
    UserEditable = 1,
    /**
     * The PublisherCreated flag indicates whether the item has been created by extension publisher.
     */
    PublisherCreated = 2,
}
/**
 * A filter used to define a set of extensions to return during a query.
 */
export interface QueryFilter {
    /**
     * The filter values define the set of values in this query. They are applied based on the QueryFilterType.
     */
    criteria: FilterCriteria[];
    /**
     * The PagingDirection is applied to a paging token if one exists. If not the direction is ignored, and Forward from the start of the resultset is used. Direction should be left out of the request unless a paging token is used to help prevent future issues.
     */
    direction: PagingDirection;
    /**
     * The page number requested by the user. If not provided 1 is assumed by default.
     */
    pageNumber: number;
    /**
     * The page size defines the number of results the caller wants for this filter. The count can't exceed the overall query size limits.
     */
    pageSize: number;
    /**
     * The paging token is a distinct type of filter and the other filter fields are ignored. The paging token represents the continuation of a previously executed query. The information about where in the result and what fields are being filtered are embeded in the token.
     */
    pagingToken: string;
    /**
     * Defines the type of sorting to be applied on the results. The page slice is cut of the sorted results only.
     */
    sortBy: number;
    /**
     * Defines the order of sorting, 1 for Ascending, 2 for Descending, else default ordering based on the SortBy value
     */
    sortOrder: number;
}
/**
 * The structure of the question / thread
 */
export interface Question extends QnAItem {
    /**
     * List of answers in for the question / thread
     */
    responses: Response[];
}
export interface QuestionsResult {
    /**
     * Flag indicating if there are more QnA threads to be shown (for paging)
     */
    hasMoreQuestions: boolean;
    /**
     * List of the QnA threads
     */
    questions: Question[];
}
export interface RatingCountPerRating {
    /**
     * Rating value
     */
    rating: number;
    /**
     * Count of total ratings
     */
    ratingCount: number;
}
/**
 * The structure of a response
 */
export interface Response extends QnAItem {
}
/**
 * The status of a REST Api response status.
 */
export declare enum RestApiResponseStatus {
    /**
     * The operation is completed.
     */
    Completed = 0,
    /**
     * The operation is failed.
     */
    Failed = 1,
    /**
     * The operation is in progress.
     */
    Inprogress = 2,
    /**
     * The operation is in skipped.
     */
    Skipped = 3,
}
/**
 * REST Api Response
 */
export interface RestApiResponseStatusModel {
    /**
     * Gets or sets the operation details
     */
    operationDetails: any;
    /**
     * Gets or sets the operation id
     */
    operationId: string;
    /**
     * Gets or sets the completed status percentage
     */
    percentageCompleted: number;
    /**
     * Gets or sets the status
     */
    status: RestApiResponseStatus;
    /**
     * Gets or sets the status message
     */
    statusMessage: string;
}
export interface Review {
    /**
     * Admin Reply, if any, for this review
     */
    adminReply: ReviewReply;
    /**
     * Unique identifier of a review item
     */
    id: number;
    /**
     * Flag for soft deletion
     */
    isDeleted: boolean;
    isIgnored: boolean;
    /**
     * Version of the product for which review was submitted
     */
    productVersion: string;
    /**
     * Rating procided by the user
     */
    rating: number;
    /**
     * Reply, if any, for this review
     */
    reply: ReviewReply;
    /**
     * Text description of the review
     */
    text: string;
    /**
     * Title of the review
     */
    title: string;
    /**
     * Time when the review was edited/updated
     */
    updatedDate: Date;
    /**
     * Name of the user
     */
    userDisplayName: string;
    /**
     * Id of the user who submitted the review
     */
    userId: string;
}
/**
 * Type of operation
 */
export declare enum ReviewEventOperation {
    Create = 1,
    Update = 2,
    Delete = 3,
}
/**
 * Properties associated with Review event
 */
export interface ReviewEventProperties {
    /**
     * Operation performed on Event - Create\Update
     */
    eventOperation: ReviewEventOperation;
    /**
     * Flag to see if reply is admin reply
     */
    isAdminReply: boolean;
    /**
     * Flag to record if the reviwe is ignored
     */
    isIgnored: boolean;
    /**
     * Rating at the time of event
     */
    rating: number;
    /**
     * Reply update date
     */
    replyDate: Date;
    /**
     * Publisher reply text or admin reply text
     */
    replyText: string;
    /**
     * User who responded to the review
     */
    replyUserId: string;
    /**
     * Review Event Type - Review
     */
    resourceType: ReviewResourceType;
    /**
     * Review update date
     */
    reviewDate: Date;
    /**
     * ReviewId of the review  on which the operation is performed
     */
    reviewId: number;
    /**
     * Text in Review Text
     */
    reviewText: string;
    /**
     * User display name at the time of review
     */
    userDisplayName: string;
    /**
     * User who gave review
     */
    userId: string;
}
/**
 * Options to GetReviews query
 */
export declare enum ReviewFilterOptions {
    /**
     * No filtering, all reviews are returned (default option)
     */
    None = 0,
    /**
     * Filter out review items with empty review text
     */
    FilterEmptyReviews = 1,
    /**
     * Filter out review items with empty usernames
     */
    FilterEmptyUserNames = 2,
}
export interface ReviewPatch {
    /**
     * Denotes the patch operation type
     */
    operation: ReviewPatchOperation;
    /**
     * Use when patch operation is FlagReview
     */
    reportedConcern: UserReportedConcern;
    /**
     * Use when patch operation is EditReview
     */
    reviewItem: Review;
}
/**
 * Denotes the patch operation type
 */
export declare enum ReviewPatchOperation {
    /**
     * Flag a review
     */
    FlagReview = 1,
    /**
     * Update an existing review
     */
    UpdateReview = 2,
    /**
     * Submit a reply for a review
     */
    ReplyToReview = 3,
    /**
     * Submit an admin response
     */
    AdminResponseForReview = 4,
    /**
     * Delete an Admin Reply
     */
    DeleteAdminReply = 5,
    /**
     * Delete Publisher Reply
     */
    DeletePublisherReply = 6,
}
export interface ReviewReply {
    /**
     * Id of the reply
     */
    id: number;
    /**
     * Flag for soft deletion
     */
    isDeleted: boolean;
    /**
     * Version of the product when the reply was submitted or updated
     */
    productVersion: string;
    /**
     * Content of the reply
     */
    replyText: string;
    /**
     * Id of the review, to which this reply belongs
     */
    reviewId: number;
    /**
     * Title of the reply
     */
    title: string;
    /**
     * Date the reply was submitted or updated
     */
    updatedDate: Date;
    /**
     * Id of the user who left the reply
     */
    userId: string;
}
/**
 * Type of event
 */
export declare enum ReviewResourceType {
    Review = 1,
    PublisherReply = 2,
    AdminReply = 3,
}
export interface ReviewsResult {
    /**
     * Flag indicating if there are more reviews to be shown (for paging)
     */
    hasMoreReviews: boolean;
    /**
     * List of reviews
     */
    reviews: Review[];
    /**
     * Count of total review items
     */
    totalReviewCount: number;
}
export interface ReviewSummary {
    /**
     * Average Rating
     */
    averageRating: number;
    /**
     * Count of total ratings
     */
    ratingCount: number;
    /**
     * Split of count accross rating
     */
    ratingSplit: RatingCountPerRating[];
}
/**
 * Defines the sort order that can be defined for Extensions query
 */
export declare enum SortByType {
    /**
     * The results will be sorted by relevance in case search query is given, if no search query resutls will be provided as is
     */
    Relevance = 0,
    /**
     * The results will be sorted as per Last Updated date of the extensions with recently updated at the top
     */
    LastUpdatedDate = 1,
    /**
     * Results will be sorted Alphabetically as per the title of the extension
     */
    Title = 2,
    /**
     * Results will be sorted Alphabetically as per Publisher title
     */
    Publisher = 3,
    /**
     * Results will be sorted by Install Count
     */
    InstallCount = 4,
    /**
     * The results will be sorted as per Published date of the extensions
     */
    PublishedDate = 5,
    /**
     * The results will be sorted as per Average ratings of the extensions
     */
    AverageRating = 6,
    /**
     * The results will be sorted as per Trending Daily Score of the extensions
     */
    TrendingDaily = 7,
    /**
     * The results will be sorted as per Trending weekly Score of the extensions
     */
    TrendingWeekly = 8,
    /**
     * The results will be sorted as per Trending monthly Score of the extensions
     */
    TrendingMonthly = 9,
    /**
     * The results will be sorted as per ReleaseDate of the extensions (date on which the extension first went public)
     */
    ReleaseDate = 10,
    /**
     * The results will be sorted as per Author defined in the VSix/Metadata. If not defined, publisher name is used This is specifically needed by VS IDE, other (new and old) clients are not encouraged to use this
     */
    Author = 11,
    /**
     * The results will be sorted as per Weighted Rating of the extension.
     */
    WeightedRating = 12,
}
/**
 * Defines the sort order that can be defined for Extensions query
 */
export declare enum SortOrderType {
    /**
     * Results will be sorted in the default order as per the sorting type defined. The default varies for each type, e.g. for Relevance, default is Descnding, for Title default is Ascending etc.
     */
    Default = 0,
    /**
     * The results will be sorted in Ascending order
     */
    Ascending = 1,
    /**
     * The results will be sorted in Descending order
     */
    Descending = 2,
}
export interface UnpackagedExtensionData {
    categories: string[];
    description: string;
    displayName: string;
    draftId: string;
    extensionName: string;
    installationTargets: InstallationTarget[];
    isConvertedToMarkdown: boolean;
    pricingCategory: string;
    product: string;
    publisherName: string;
    qnAEnabled: boolean;
    referralUrl: string;
    repositoryUrl: string;
    tags: string[];
    version: string;
    vsixId: string;
}
/**
 * Represents the extension policy applied to a given user
 */
export interface UserExtensionPolicy {
    /**
     * User display name that this policy refers to
     */
    displayName: string;
    /**
     * The extension policy applied to the user
     */
    permissions: ExtensionPolicy;
    /**
     * User id that this policy refers to
     */
    userId: string;
}
/**
 * Identity reference with name and guid
 */
export interface UserIdentityRef {
    /**
     * User display name
     */
    displayName: string;
    /**
     * User VSID
     */
    id: string;
}
export interface UserReportedConcern {
    /**
     * Category of the concern
     */
    category: ConcernCategory;
    /**
     * User comment associated with the report
     */
    concernText: string;
    /**
     * Id of the review which was reported
     */
    reviewId: number;
    /**
     * Date the report was submitted
     */
    submittedDate: Date;
    /**
     * Id of the user who reported a review
     */
    userId: string;
}
export declare var TypeInfo: {
    AcquisitionAssignmentType: {
        enumValues: {
            "none": number;
            "me": number;
            "all": number;
        };
    };
    AcquisitionOperation: any;
    AcquisitionOperationState: {
        enumValues: {
            "disallow": number;
            "allow": number;
            "completed": number;
        };
    };
    AcquisitionOperationType: {
        enumValues: {
            "get": number;
            "install": number;
            "buy": number;
            "try": number;
            "request": number;
            "none": number;
            "purchaseRequest": number;
        };
    };
    AcquisitionOptions: any;
    AzureRestApiResponseModel: any;
    Concern: any;
    ConcernCategory: {
        enumValues: {
            "general": number;
            "abusive": number;
            "spam": number;
        };
    };
    CustomerLastContact: any;
    DraftPatchOperation: {
        enumValues: {
            "publish": number;
            "cancel": number;
        };
    };
    DraftStateType: {
        enumValues: {
            "unpublished": number;
            "published": number;
            "cancelled": number;
            "error": number;
        };
    };
    ExtensionAcquisitionRequest: any;
    ExtensionDailyStat: any;
    ExtensionDailyStats: any;
    ExtensionDeploymentTechnology: {
        enumValues: {
            "exe": number;
            "msi": number;
            "vsix": number;
            "referralLink": number;
        };
    };
    ExtensionDraft: any;
    ExtensionDraftPatch: any;
    ExtensionEvent: any;
    ExtensionEvents: any;
    ExtensionFilterResult: any;
    ExtensionLifecycleEventType: {
        enumValues: {
            "uninstall": number;
            "install": number;
            "review": number;
            "acquisition": number;
            "sales": number;
            "other": number;
        };
    };
    ExtensionPayload: any;
    ExtensionPolicy: any;
    ExtensionPolicyFlags: {
        enumValues: {
            "none": number;
            "private": number;
            "public": number;
            "preview": number;
            "released": number;
            "firstParty": number;
            "all": number;
        };
    };
    ExtensionQuery: any;
    ExtensionQueryFilterType: {
        enumValues: {
            "tag": number;
            "displayName": number;
            "private": number;
            "id": number;
            "category": number;
            "contributionType": number;
            "name": number;
            "installationTarget": number;
            "featured": number;
            "searchText": number;
            "featuredInCategory": number;
            "excludeWithFlags": number;
            "includeWithFlags": number;
            "lcid": number;
            "installationTargetVersion": number;
            "installationTargetVersionRange": number;
            "vsixMetadata": number;
        };
    };
    ExtensionQueryFlags: {
        enumValues: {
            "none": number;
            "includeVersions": number;
            "includeFiles": number;
            "includeCategoryAndTags": number;
            "includeSharedAccounts": number;
            "includeVersionProperties": number;
            "excludeNonValidated": number;
            "includeInstallationTargets": number;
            "includeAssetUri": number;
            "includeStatistics": number;
            "includeLatestVersionOnly": number;
            "useFallbackAssetUri": number;
            "includeMetadata": number;
            "includeMinimalPayloadForVsIde": number;
            "includeLcids": number;
            "allAttributes": number;
        };
    };
    ExtensionQueryResult: any;
    ExtensionStatisticOperation: {
        enumValues: {
            "none": number;
            "set": number;
            "increment": number;
            "decrement": number;
            "delete": number;
        };
    };
    ExtensionStatisticUpdate: any;
    ExtensionStatsAggregateType: {
        enumValues: {
            "daily": number;
        };
    };
    ExtensionVersion: any;
    ExtensionVersionFlags: {
        enumValues: {
            "none": number;
            "validated": number;
        };
    };
    NotificationsData: any;
    NotificationTemplateType: {
        enumValues: {
            "reviewNotification": number;
            "qnaNotification": number;
            "customerContactNotification": number;
            "publisherMemberUpdateNotification": number;
        };
    };
    PagingDirection: {
        enumValues: {
            "backward": number;
            "forward": number;
        };
    };
    PublishedExtension: any;
    PublishedExtensionFlags: {
        enumValues: {
            "none": number;
            "disabled": number;
            "builtIn": number;
            "validated": number;
            "trusted": number;
            "paid": number;
            "public": number;
            "multiVersion": number;
            "system": number;
            "preview": number;
            "unpublished": number;
            "trial": number;
            "locked": number;
        };
    };
    Publisher: any;
    PublisherFacts: any;
    PublisherFilterResult: any;
    PublisherFlags: {
        enumValues: {
            "unChanged": number;
            "none": number;
            "disabled": number;
            "verified": number;
            "serviceFlags": number;
        };
    };
    PublisherPermissions: {
        enumValues: {
            "read": number;
            "updateExtension": number;
            "createPublisher": number;
            "publishExtension": number;
            "admin": number;
            "trustedPartner": number;
            "privateRead": number;
            "deleteExtension": number;
            "editSettings": number;
            "viewPermissions": number;
            "managePermissions": number;
            "deletePublisher": number;
        };
    };
    PublisherQuery: any;
    PublisherQueryFlags: {
        enumValues: {
            "none": number;
            "includeExtensions": number;
            "includeEmailAddress": number;
        };
    };
    PublisherQueryResult: any;
    QnAItem: any;
    QnAItemStatus: {
        enumValues: {
            "none": number;
            "userEditable": number;
            "publisherCreated": number;
        };
    };
    QueryFilter: any;
    Question: any;
    QuestionsResult: any;
    Response: any;
    RestApiResponseStatus: {
        enumValues: {
            "completed": number;
            "failed": number;
            "inprogress": number;
            "skipped": number;
        };
    };
    RestApiResponseStatusModel: any;
    Review: any;
    ReviewEventOperation: {
        enumValues: {
            "create": number;
            "update": number;
            "delete": number;
        };
    };
    ReviewEventProperties: any;
    ReviewFilterOptions: {
        enumValues: {
            "none": number;
            "filterEmptyReviews": number;
            "filterEmptyUserNames": number;
        };
    };
    ReviewPatch: any;
    ReviewPatchOperation: {
        enumValues: {
            "flagReview": number;
            "updateReview": number;
            "replyToReview": number;
            "adminResponseForReview": number;
            "deleteAdminReply": number;
            "deletePublisherReply": number;
        };
    };
    ReviewReply: any;
    ReviewResourceType: {
        enumValues: {
            "review": number;
            "publisherReply": number;
            "adminReply": number;
        };
    };
    ReviewsResult: any;
    SortByType: {
        enumValues: {
            "relevance": number;
            "lastUpdatedDate": number;
            "title": number;
            "publisher": number;
            "installCount": number;
            "publishedDate": number;
            "averageRating": number;
            "trendingDaily": number;
            "trendingWeekly": number;
            "trendingMonthly": number;
            "releaseDate": number;
            "author": number;
            "weightedRating": number;
        };
    };
    SortOrderType: {
        enumValues: {
            "default": number;
            "ascending": number;
            "descending": number;
        };
    };
    UserExtensionPolicy: any;
    UserReportedConcern: any;
};
