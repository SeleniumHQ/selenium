import FormInputInterfaces = require("../interfaces/common/FormInputInterfaces");
import VSSInterfaces = require("../interfaces/common/VSSInterfaces");
export interface ActorFilter extends RoleBasedFilter {
}
export interface ActorNotificationReason extends NotificationReason {
    matchedRoles: string[];
}
export interface ArtifactFilter extends BaseSubscriptionFilter {
    artifactId: string;
    artifactType: string;
    artifactUri: string;
    type: string;
}
export interface BaseSubscriptionFilter {
    eventType: string;
    type: string;
}
export interface BatchNotificationOperation {
    notificationOperation: NotificationOperation;
    notificationQueryConditions: NotificationQueryCondition[];
}
export interface BlockFilter extends RoleBasedFilter {
}
export interface BlockSubscriptionChannel {
    type: string;
}
export interface EmailHtmlSubscriptionChannel extends SubscriptionChannelWithAddress {
    type: string;
}
export interface EmailPlaintextSubscriptionChannel extends SubscriptionChannelWithAddress {
    type: string;
}
/**
 * Describes the subscription evaluation operation status.
 */
export declare enum EvaluationOperationStatus {
    /**
     * The operation object does not have the status set.
     */
    NotSet = 0,
    /**
     * The operation has been queued.
     */
    Queued = 1,
    /**
     * The operation is in progress.
     */
    InProgress = 2,
    /**
     * The operation was cancelled by the user.
     */
    Cancelled = 3,
    /**
     * The operation completed successfully.
     */
    Succeeded = 4,
    /**
     * The operation completed with a failure.
     */
    Failed = 5,
    /**
     * The operation timed out.
     */
    TimedOut = 6,
    /**
     * The operation could not be found.
     */
    NotFound = 7,
}
export interface EventBacklogStatus {
    maxUnprocessedEventAgeMs: number;
    publisher: string;
    timeSinceLastProcessedEventMs: number;
    unprocessedEvents: number;
}
/**
 * Set of flags used to determine which set of information is retrieved when querying for event publishers
 */
export declare enum EventPublisherQueryFlags {
    None = 0,
    /**
     * Include event types from the remote services too
     */
    IncludeRemoteServices = 2,
}
/**
 * Encapsulates events result properties. It defines the total number of events used and the number of matched events.
 */
export interface EventsEvaluationResult {
    /**
     * Count of events evaluated.
     */
    count: number;
    /**
     * Count of matched events.
     */
    matchedCount: number;
}
/**
 * Set of flags used to determine which set of information is retrieved when querying for eventtypes
 */
export declare enum EventTypeQueryFlags {
    None = 0,
    /**
     * IncludeFields will include all fields and their types
     */
    IncludeFields = 1,
}
export interface ExpressionFilter extends BaseSubscriptionFilter {
    criteria: ExpressionFilterModel;
    type: string;
}
/**
 * Subscription Filter Clause represents a single clause in a subscription filter e.g. If the subscription has the following criteria "Project Name = [Current Project] AND Assigned To = [Me] it will be represented as two Filter Clauses Clause 1: Index = 1, Logical Operator: NULL  , FieldName = 'Project Name', Operator = '=', Value = '[Current Project]' Clause 2: Index = 2, Logical Operator: 'AND' , FieldName = 'Assigned To' , Operator = '=', Value = '[Me]'
 */
export interface ExpressionFilterClause {
    fieldName: string;
    /**
     * The order in which this clause appeared in the filter query
     */
    index: number;
    /**
     * Logical Operator 'AND', 'OR' or NULL (only for the first clause in the filter)
     */
    logicalOperator: string;
    operator: string;
    value: string;
}
/**
 * Represents a hierarchy of SubscritionFilterClauses that have been grouped together through either adding a group in the WebUI or using parethesis in the Subscription condition string
 */
export interface ExpressionFilterGroup {
    /**
     * The index of the last FilterClause in this group
     */
    end: number;
    /**
     * Level of the group, since groups can be nested for each nested group the level will increase by 1
     */
    level: number;
    /**
     * The index of the first FilterClause in this group
     */
    start: number;
}
export interface ExpressionFilterModel {
    /**
     * Flat list of clauses in this subscription
     */
    clauses: ExpressionFilterClause[];
    /**
     * Grouping of clauses in the subscription
     */
    groups: ExpressionFilterGroup[];
    /**
     * Max depth of the Subscription tree
     */
    maxGroupLevel: number;
}
export interface FieldInputValues extends FormInputInterfaces.InputValues {
    operators: number[];
}
export interface FieldValuesQuery extends FormInputInterfaces.InputValuesQuery {
    inputValues: FieldInputValues[];
    scope: string;
}
export interface GroupSubscriptionChannel extends SubscriptionChannelWithAddress {
    type: string;
}
export interface ISubscriptionChannel {
    type: string;
}
export interface ISubscriptionFilter {
    eventType: string;
    type: string;
}
export interface MessageQueueSubscriptionChannel {
    type: string;
}
export interface NotificationBacklogStatus {
    channel: string;
    maxUnprocessedNotificationAgeMs: number;
    publisher: string;
    timeSinceLastProcessedNotificationMs: number;
    unprocessedNotifications: number;
}
export interface NotificationEventBacklogStatus {
    eventBacklogStatus: EventBacklogStatus[];
    notificationBacklogStatus: NotificationBacklogStatus[];
}
/**
 * Encapsulates the properties of a filterable field. A filterable field is a field in an event that can used to filter notifications for a certain event type.
 */
export interface NotificationEventField {
    /**
     * Gets or sets the type of this field.
     */
    fieldType: NotificationEventFieldType;
    /**
     * Gets or sets the unique identifier of this field.
     */
    id: string;
    /**
     * Gets or sets the name of this field.
     */
    name: string;
    /**
     * Gets or sets the path to the field in the event object. This path can be either Json Path or XPath, depending on if the event will be serialized into Json or XML
     */
    path: string;
    /**
     * Gets or sets the scopes that this field supports. If not specified then the event type scopes apply.
     */
    supportedScopes: string[];
}
/**
 * Encapsulates the properties of a field type. It includes a unique id for the operator and a localized string for display name
 */
export interface NotificationEventFieldOperator {
    /**
     * Gets or sets the display name of an operator
     */
    displayName: string;
    /**
     * Gets or sets the id of an operator
     */
    id: string;
}
/**
 * Encapsulates the properties of a field type. It describes the data type of a field, the operators it support and how to populate it in the UI
 */
export interface NotificationEventFieldType {
    /**
     * Gets or sets the unique identifier of this field type.
     */
    id: string;
    operatorConstraints: OperatorConstraint[];
    /**
     * Gets or sets the list of operators that this type supports.
     */
    operators: NotificationEventFieldOperator[];
    subscriptionFieldType: SubscriptionFieldType;
    /**
     * Gets or sets the value definition of this field like the getValuesMethod and template to display in the UI
     */
    value: ValueDefinition;
}
/**
 * Encapsulates the properties of a notification event publisher.
 */
export interface NotificationEventPublisher {
    id: string;
    subscriptionManagementInfo: SubscriptionManagement;
    url: string;
}
/**
 * Encapsulates the properties of an event role.  An event Role is used for role based subscription for example for a buildCompletedEvent, one role is request by field
 */
export interface NotificationEventRole {
    /**
     * Gets or sets an Id for that role, this id is used by the event.
     */
    id: string;
    /**
     * Gets or sets the Name for that role, this name is used for UI display.
     */
    name: string;
    /**
     * Gets or sets whether this role can be a group or just an individual user
     */
    supportsGroups: boolean;
}
/**
 * Encapsulates the properties of an event type. It defines the fields, that can be used for filtering, for that event type.
 */
export interface NotificationEventType {
    category: NotificationEventTypeCategory;
    /**
     * Gets or sets the color representing this event type. Example: rgb(128,245,211) or #fafafa
     */
    color: string;
    customSubscriptionsAllowed: boolean;
    eventPublisher: NotificationEventPublisher;
    fields: {
        [key: string]: NotificationEventField;
    };
    hasInitiator: boolean;
    /**
     * Gets or sets the icon representing this event type. Can be a URL or a CSS class. Example: css://some-css-class
     */
    icon: string;
    /**
     * Gets or sets the unique identifier of this event definition.
     */
    id: string;
    /**
     * Gets or sets the name of this event definition.
     */
    name: string;
    roles: NotificationEventRole[];
    /**
     * Gets or sets the scopes that this event type supports
     */
    supportedScopes: string[];
    /**
     * Gets or sets the rest end point to get this event type details (fields, fields types)
     */
    url: string;
}
/**
 * Encapsulates the properties of a category. A category will be used by the UI to group event types
 */
export interface NotificationEventTypeCategory {
    /**
     * Gets or sets the unique identifier of this category.
     */
    id: string;
    /**
     * Gets or sets the friendly name of this category.
     */
    name: string;
}
export declare enum NotificationOperation {
    None = 0,
    SuspendUnprocessed = 1,
}
export interface NotificationQueryCondition {
    eventInitiator: string;
    eventType: string;
    subscriber: string;
    subscriptionId: string;
}
export interface NotificationReason {
    notificationReasonType: NotificationReasonType;
    targetIdentities: VSSInterfaces.IdentityRef[];
}
export declare enum NotificationReasonType {
    Unknown = 0,
    Follows = 1,
    Personal = 2,
    PersonalAlias = 3,
    DirectMember = 4,
    IndirectMember = 5,
    GroupAlias = 6,
    SubscriptionAlias = 7,
    SingleRole = 8,
    DirectMemberGroupRole = 9,
    InDirectMemberGroupRole = 10,
    AliasMemberGroupRole = 11,
}
/**
 * Encapsulates notifications result properties. It defines the number of notifications and the recipients of notifications.
 */
export interface NotificationsEvaluationResult {
    /**
     * Count of generated notifications
     */
    count: number;
}
export interface NotificationStatistic {
    date: Date;
    hitCount: number;
    path: string;
    type: NotificationStatisticType;
    user: VSSInterfaces.IdentityRef;
}
export interface NotificationStatisticsQuery {
    conditions: NotificationStatisticsQueryConditions[];
}
export interface NotificationStatisticsQueryConditions {
    endDate: Date;
    hitCountMinimum: number;
    path: string;
    startDate: Date;
    type: NotificationStatisticType;
    user: VSSInterfaces.IdentityRef;
}
export declare enum NotificationStatisticType {
    NotificationBySubscription = 0,
    EventsByEventType = 1,
    NotificationByEventType = 2,
    EventsByEventTypePerUser = 3,
    NotificationByEventTypePerUser = 4,
    Events = 5,
    Notifications = 6,
    NotificationFailureBySubscription = 7,
    UnprocessedRangeStart = 100,
    UnprocessedEventsByPublisher = 101,
    UnprocessedEventDelayByPublisher = 102,
    UnprocessedNotificationsByChannelByPublisher = 103,
    UnprocessedNotificationDelayByChannelByPublisher = 104,
    DelayRangeStart = 200,
    TotalPipelineTime = 201,
    NotificationPipelineTime = 202,
    EventPipelineTime = 203,
    HourlyRangeStart = 1000,
    HourlyNotificationBySubscription = 1001,
    HourlyEventsByEventTypePerUser = 1002,
    HourlyEvents = 1003,
    HourlyNotifications = 1004,
    HourlyUnprocessedEventsByPublisher = 1101,
    HourlyUnprocessedEventDelayByPublisher = 1102,
    HourlyUnprocessedNotificationsByChannelByPublisher = 1103,
    HourlyUnprocessedNotificationDelayByChannelByPublisher = 1104,
    HourlyTotalPipelineTime = 1201,
    HourlyNotificationPipelineTime = 1202,
    HourlyEventPipelineTime = 1203,
}
/**
 * A subscriber is a user or group that has the potential to receive notifications.
 */
export interface NotificationSubscriber {
    /**
     * Indicates how the subscriber should be notified by default.
     */
    deliveryPreference: NotificationSubscriberDeliveryPreference;
    flags: SubscriberFlags;
    /**
     * Identifier of the subscriber.
     */
    id: string;
    /**
     * Preferred email address of the subscriber. A null or empty value indicates no preferred email address has been set.
     */
    preferredEmailAddress: string;
}
/**
 * Delivery preference for a subscriber. Indicates how the subscriber should be notified.
 */
export declare enum NotificationSubscriberDeliveryPreference {
    None = 0,
    /**
     * Deliver notifications to the subscriber's preferred email address.
     */
    PreferredEmailAddress = 1,
    EachMember = 2,
    NoDelivery = -1,
    NotSet = -2147483648,
}
/**
 * Updates to a subscriber. Typically used to change (or set) a preferred email address or default delivery preference.
 */
export interface NotificationSubscriberUpdateParameters {
    /**
     * New delivery preference for the subscriber (indicates how the subscriber should be notified).
     */
    deliveryPreference: NotificationSubscriberDeliveryPreference;
    /**
     * New preferred email address for the subscriber. Specify an empty string to clear the current address.
     */
    preferredEmailAddress: string;
}
/**
 * A subscription defines criteria for matching events and how the subscription's subscriber should be notified about those events.
 */
export interface NotificationSubscription {
    /**
     * Links to related resources, APIs, and views for the subscription.
     */
    _links: any;
    /**
     * Admin-managed settings for the subscription. Only applies when the subscriber is a group.
     */
    adminSettings: SubscriptionAdminSettings;
    /**
     * Channel for delivering notifications triggered by the subscription.
     */
    channel: ISubscriptionChannel;
    /**
     * Description of the subscription. Typically describes filter criteria which helps identity the subscription.
     */
    description: string;
    /**
     * Diagnostics for this subscription.
     */
    diagnostics: SubscriptionDiagnostics;
    /**
     * Any extra properties like detailed description for different contexts, user/group contexts
     */
    extendedProperties: {
        [key: string]: string;
    };
    /**
     * Matching criteria for the subscription. ExpressionFilter
     */
    filter: ISubscriptionFilter;
    /**
     * Read-only indicators that further describe the subscription.
     */
    flags: SubscriptionFlags;
    /**
     * Subscription identifier.
     */
    id: string;
    /**
     * User that last modified (or created) the subscription.
     */
    lastModifiedBy: VSSInterfaces.IdentityRef;
    /**
     * Date when the subscription was last modified. If the subscription has not been updated since it was created, this value will indicate when the subscription was created.
     */
    modifiedDate: Date;
    /**
     * The permissions the user have for this subscriptions.
     */
    permissions: SubscriptionPermissions;
    /**
     * The container in which events must be published from in order to be matched by the subscription. If empty, the scope is the current host (typically an account or project collection). For example, a subscription scoped to project A will not produce notifications for events published from project B.
     */
    scope: SubscriptionScope;
    /**
     * Status of the subscription. Typically indicates whether the subscription is enabled or not.
     */
    status: SubscriptionStatus;
    /**
     * Message that provides more details about the status of the subscription.
     */
    statusMessage: string;
    /**
     * User or group that will receive notifications for events matching the subscription's filter criteria.
     */
    subscriber: VSSInterfaces.IdentityRef;
    /**
     * REST API URL of the subscriotion.
     */
    url: string;
    /**
     * User-managed settings for the subscription. Only applies when the subscriber is a group. Typically used to indicate whether the calling user is opted in or out of a group subscription.
     */
    userSettings: SubscriptionUserSettings;
}
/**
 * Parameters for creating a new subscription. A subscription defines criteria for matching events and how the subscription's subscriber should be notified about those events.
 */
export interface NotificationSubscriptionCreateParameters {
    /**
     * Channel for delivering notifications triggered by the new subscription.
     */
    channel: ISubscriptionChannel;
    /**
     * Brief description for the new subscription. Typically describes filter criteria which helps identity the subscription.
     */
    description: string;
    /**
     * Matching criteria for the new subscription. ExpressionFilter
     */
    filter: ISubscriptionFilter;
    /**
     * The container in which events must be published from in order to be matched by the new subscription. If not specified, defaults to the current host (typically an account or project collection). For example, a subscription scoped to project A will not produce notifications for events published from project B.
     */
    scope: SubscriptionScope;
    /**
     * User or group that will receive notifications for events matching the subscription's filter criteria. If not specified, defaults to the calling user.
     */
    subscriber: VSSInterfaces.IdentityRef;
}
export interface NotificationSubscriptionTemplate {
    description: string;
    filter: ISubscriptionFilter;
    id: string;
    notificationEventInformation: NotificationEventType;
    type: SubscriptionTemplateType;
}
/**
 * Parameters for updating an existing subscription. A subscription defines criteria for matching events and how the subscription's subscriber should be notified about those events. Note: only the fields to be updated should be set.
 */
export interface NotificationSubscriptionUpdateParameters {
    /**
     * Admin-managed settings for the subscription. Only applies to subscriptions where the subscriber is a group.
     */
    adminSettings: SubscriptionAdminSettings;
    /**
     * Channel for delivering notifications triggered by the subscription.
     */
    channel: ISubscriptionChannel;
    /**
     * Updated description for the subscription. Typically describes filter criteria which helps identity the subscription.
     */
    description: string;
    /**
     * Matching criteria for the subscription. ExpressionFilter
     */
    filter: ISubscriptionFilter;
    /**
     * The container in which events must be published from in order to be matched by the new subscription. If not specified, defaults to the current host (typically the current account or project collection). For example, a subscription scoped to project A will not produce notifications for events published from project B.
     */
    scope: SubscriptionScope;
    /**
     * Updated status for the subscription. Typically used to enable or disable a subscription.
     */
    status: SubscriptionStatus;
    /**
     * Optional message that provides more details about the updated status.
     */
    statusMessage: string;
    /**
     * User-managed settings for the subscription. Only applies to subscriptions where the subscriber is a group. Typically used to opt-in or opt-out a user from a group subscription.
     */
    userSettings: SubscriptionUserSettings;
}
export interface NotificationTracing extends NotificationTracingSetParameters {
    /**
     * Trace until the specified end date.
     */
    endDate: Date;
    /**
     * The maximum number of result details to trace.
     */
    maxTracedEntries: number;
    /**
     * The date and time tracing started.
     */
    startDate: Date;
    /**
     * Trace until remaining count reaches 0.
     */
    tracedEntries: number;
}
export interface NotificationTracingSetParameters {
    enabled: boolean;
}
/**
 * Encapsulates the properties of an operator constraint. An operator constraint defines if some operator is available only for specific scope like a project scope.
 */
export interface OperatorConstraint {
    operator: string;
    /**
     * Gets or sets the list of scopes that this type supports.
     */
    supportedScopes: string[];
}
export interface RoleBasedFilter extends ExpressionFilter {
    exclusions: string[];
    inclusions: string[];
}
export interface ServiceBusSubscriptionChannel {
    type: string;
}
export interface ServiceHooksSubscriptionChannel {
    type: string;
}
export interface SoapSubscriptionChannel extends SubscriptionChannelWithAddress {
    type: string;
}
export declare enum SubscriberFlags {
    None = 0,
    /**
     * Subscriber's delivery preferences could be updated
     */
    DeliveryPreferencesEditable = 2,
    /**
     * Subscriber's delivery preferences supports email delivery
     */
    SupportsPreferredEmailAddressDelivery = 4,
    /**
     * Subscriber's delivery preferences supports individual members delivery(group expansion)
     */
    SupportsEachMemberDelivery = 8,
    /**
     * Subscriber's delivery preferences supports no delivery
     */
    SupportsNoDelivery = 16,
    /**
     * Subscriber is a user
     */
    IsUser = 32,
    /**
     * Subscriber is a group
     */
    IsGroup = 64,
    /**
     * Subscriber is a team
     */
    IsTeam = 128,
}
/**
 * Admin-managed settings for a group subscription.
 */
export interface SubscriptionAdminSettings {
    /**
     * If true, members of the group subscribed to the associated subscription cannot opt (choose not to get notified)
     */
    blockUserOptOut: boolean;
}
export interface SubscriptionChannelWithAddress {
    address: string;
    type: string;
    useCustomAddress: boolean;
}
export interface SubscriptionDiagnostics {
    /**
     * Optional. Contol the tracing
     */
    notificationTracing: NotificationTracing;
}
/**
 * Encapsulates the properties of a SubscriptionEvaluationRequest. It defines the subscription to be evaluated and time interval for events used in evaluation.
 */
export interface SubscriptionEvaluationRequest {
    /**
     * The min created date for the events used for matching in UTC. Use all events created since this date
     */
    minEventsCreatedDate: Date;
    /**
     * User or group that will receive notifications for events matching the subscription's filter criteria. If not specified, defaults to the calling user.
     */
    subscriptionCreateParameters: NotificationSubscriptionCreateParameters;
}
/**
 * Ecapsulates the subscription evaluation results. It defines the Date Interval that was used, number of events evaluated and events and notifications results
 */
export interface SubscriptionEvaluationResult {
    /**
     * Subscription evaluation job status
     */
    evaluationJobStatus: EvaluationOperationStatus;
    /**
     * Subscription evaluation events results.
     */
    events: EventsEvaluationResult;
    /**
     * The requestId which is the subscription evaluation jobId
     */
    id: string;
    /**
     * Subscription evaluation  notification results.
     */
    notifications: NotificationsEvaluationResult;
}
/**
 * Encapsulates the subscription evaluation settings needed for the UI
 */
export interface SubscriptionEvaluationSettings {
    /**
     * Indicates whether subscription evaluation before saving is enabled or not
     */
    enabled: boolean;
    /**
     * Time interval to check on subscription evaluation job in seconds
     */
    interval: number;
    /**
     * Threshold on the number of notifications for considering a subscription too noisy
     */
    threshold: number;
    /**
     * Time out for the subscription evaluation check in seconds
     */
    timeOut: number;
}
export declare enum SubscriptionFieldType {
    String = 1,
    Integer = 2,
    DateTime = 3,
    PlainText = 5,
    Html = 7,
    TreePath = 8,
    History = 9,
    Double = 10,
    Guid = 11,
    Boolean = 12,
    Identity = 13,
    PicklistInteger = 14,
    PicklistString = 15,
    PicklistDouble = 16,
    TeamProject = 17,
}
/**
 * Read-only indicators that further describe the subscription.
 */
export declare enum SubscriptionFlags {
    /**
     * None
     */
    None = 0,
    /**
     * Subscription's subscriber is a group, not a user
     */
    GroupSubscription = 1,
    /**
     * Subscription is contributed and not persisted. This means certain fields of the subscription, like Filter, are read-only.
     */
    ContributedSubscription = 2,
    /**
     * A user that is member of the subscription's subscriber group can opt in/out of the subscription.
     */
    CanOptOut = 4,
    /**
     * If the subscriber is a group, is it a team.
     */
    TeamSubscription = 8,
}
/**
 * Encapsulates the properties needed to manage subscriptions, opt in and out of subscriptions.
 */
export interface SubscriptionManagement {
    serviceInstanceType: string;
    url: string;
}
/**
 * The permissions that a user has to a certain subscription
 */
export declare enum SubscriptionPermissions {
    /**
     * None
     */
    None = 0,
    /**
     * full view of description, filters, etc. Not limited.
     */
    View = 1,
    /**
     * update subscription
     */
    Edit = 2,
    /**
     * delete subscription
     */
    Delete = 4,
}
/**
 * Notification subscriptions query input.
 */
export interface SubscriptionQuery {
    /**
     * One or more conditions to query on. If more than 2 conditions are specified, the combined results of each condition is returned (i.e. conditions are logically OR'ed).
     */
    conditions: SubscriptionQueryCondition[];
    /**
     * Flags the refine the types of subscriptions that will be returned from the query.
     */
    queryFlags: SubscriptionQueryFlags;
}
/**
 * Conditions a subscription must match to qualify for the query result set. Not all fields are required. A subscription must match all conditions specified in order to qualify for the result set.
 */
export interface SubscriptionQueryCondition {
    /**
     * Filter conditions that matching subscriptions must have. Typically only the filter's type and event type are used for matching.
     */
    filter: ISubscriptionFilter;
    /**
     * Flags to specify the the type subscriptions to query for.
     */
    flags: SubscriptionFlags;
    /**
     * Scope that matching subscriptions must have.
     */
    scope: string;
    /**
     * ID of the subscriber (user or group) that matching subscriptions must be subscribed to.
     */
    subscriberId: string;
    /**
     * ID of the subscription to query for.
     */
    subscriptionId: string;
}
/**
 * Flags that influence the result set of a subscription query.
 */
export declare enum SubscriptionQueryFlags {
    None = 0,
    /**
     * Include subscriptions with invalid subscribers.
     */
    IncludeInvalidSubscriptions = 2,
    /**
     * Include subscriptions marked for deletion.
     */
    IncludeDeletedSubscriptions = 4,
    /**
     * Include the full filter details with each subscription.
     */
    IncludeFilterDetails = 8,
    /**
     * For a subscription the caller does not have permission to view, return basic (non-confidential) information.
     */
    AlwaysReturnBasicInformation = 16,
}
/**
 * A resource, typically an account or project, in which events are published from.
 */
export interface SubscriptionScope extends VSSInterfaces.EventScope {
}
/**
 * Subscription status values. A value greater than or equal to zero indicates the subscription is enabled. A negative value indicates the subscription is disabled.
 */
export declare enum SubscriptionStatus {
    /**
     * Subscription is disabled because it generated a high volume of notifications.
     */
    JailedByNotificationsVolume = -200,
    /**
     * Subscription is disabled and will be deleted.
     */
    PendingDeletion = -100,
    /**
     * Subscription is disabled service due to failures.
     */
    DisabledBySystem = -9,
    /**
     * Subscription is disabled because the identity is no longer active
     */
    DisabledInactiveIdentity = -8,
    /**
     * Subscription is disabled because message queue is not supported.
     */
    DisabledMessageQueueNotSupported = -7,
    /**
     * Subscription is disabled because its subscriber is unknown.
     */
    DisabledMissingIdentity = -6,
    /**
     * Subscription is disabled because it has an invalid role expression.
     */
    DisabledInvalidRoleExpression = -5,
    /**
     * Subscription is disabled because it has an invalid filter expression.
     */
    DisabledInvalidPathClause = -4,
    /**
     * Subscription is disabled because it is a duplicate of a default subscription.
     */
    DisabledAsDuplicateOfDefault = -3,
    /**
     * Subscription is disabled by an administrator, not the subscription's subscriber.
     */
    DisabledByAdmin = -2,
    /**
     * Subscription is disabled, typically by the owner of the subscription, and will not produce any notifications.
     */
    Disabled = -1,
    /**
     * Subscription is active.
     */
    Enabled = 0,
    /**
     * Subscription is active, but is on probation due to failed deliveries or other issues with the subscription.
     */
    EnabledOnProbation = 1,
}
/**
 * Set of flags used to determine which set of templates is retrieved when querying for subscription templates
 */
export declare enum SubscriptionTemplateQueryFlags {
    None = 0,
    /**
     * Include user templates
     */
    IncludeUser = 1,
    /**
     * Include group templates
     */
    IncludeGroup = 2,
    /**
     * Include user and group templates
     */
    IncludeUserAndGroup = 4,
    /**
     * Include the event type details like the fields and operators
     */
    IncludeEventTypeInformation = 22,
}
export declare enum SubscriptionTemplateType {
    User = 0,
    Team = 1,
    Both = 2,
    None = 3,
}
/**
 * User-managed settings for a group subscription.
 */
export interface SubscriptionUserSettings {
    /**
     * Indicates whether the user will receive notifications for the associated group subscription.
     */
    optedOut: boolean;
}
export interface UnsupportedFilter extends BaseSubscriptionFilter {
    type: string;
}
export interface UnsupportedSubscriptionChannel {
    type: string;
}
export interface UserSubscriptionChannel extends SubscriptionChannelWithAddress {
    type: string;
}
export interface UserSystemSubscriptionChannel extends SubscriptionChannelWithAddress {
    type: string;
}
/**
 * Encapsulates the properties of a field value definition. It has the information needed to retrieve the list of possible values for a certain field and how to handle that field values in the UI. This information includes what type of object this value represents, which property to use for UI display and which property to use for saving the subscription
 */
export interface ValueDefinition {
    /**
     * Gets or sets the data source.
     */
    dataSource: FormInputInterfaces.InputValue[];
    /**
     * Gets or sets the rest end point.
     */
    endPoint: string;
    /**
     * Gets or sets the result template.
     */
    resultTemplate: string;
}
export declare var TypeInfo: {
    ActorNotificationReason: any;
    BatchNotificationOperation: any;
    EvaluationOperationStatus: {
        enumValues: {
            "notSet": number;
            "queued": number;
            "inProgress": number;
            "cancelled": number;
            "succeeded": number;
            "failed": number;
            "timedOut": number;
            "notFound": number;
        };
    };
    EventPublisherQueryFlags: {
        enumValues: {
            "none": number;
            "includeRemoteServices": number;
        };
    };
    EventTypeQueryFlags: {
        enumValues: {
            "none": number;
            "includeFields": number;
        };
    };
    NotificationEventField: any;
    NotificationEventFieldType: any;
    NotificationEventType: any;
    NotificationOperation: {
        enumValues: {
            "none": number;
            "suspendUnprocessed": number;
        };
    };
    NotificationReason: any;
    NotificationReasonType: {
        enumValues: {
            "unknown": number;
            "follows": number;
            "personal": number;
            "personalAlias": number;
            "directMember": number;
            "indirectMember": number;
            "groupAlias": number;
            "subscriptionAlias": number;
            "singleRole": number;
            "directMemberGroupRole": number;
            "inDirectMemberGroupRole": number;
            "aliasMemberGroupRole": number;
        };
    };
    NotificationStatistic: any;
    NotificationStatisticsQuery: any;
    NotificationStatisticsQueryConditions: any;
    NotificationStatisticType: {
        enumValues: {
            "notificationBySubscription": number;
            "eventsByEventType": number;
            "notificationByEventType": number;
            "eventsByEventTypePerUser": number;
            "notificationByEventTypePerUser": number;
            "events": number;
            "notifications": number;
            "notificationFailureBySubscription": number;
            "unprocessedRangeStart": number;
            "unprocessedEventsByPublisher": number;
            "unprocessedEventDelayByPublisher": number;
            "unprocessedNotificationsByChannelByPublisher": number;
            "unprocessedNotificationDelayByChannelByPublisher": number;
            "delayRangeStart": number;
            "totalPipelineTime": number;
            "notificationPipelineTime": number;
            "eventPipelineTime": number;
            "hourlyRangeStart": number;
            "hourlyNotificationBySubscription": number;
            "hourlyEventsByEventTypePerUser": number;
            "hourlyEvents": number;
            "hourlyNotifications": number;
            "hourlyUnprocessedEventsByPublisher": number;
            "hourlyUnprocessedEventDelayByPublisher": number;
            "hourlyUnprocessedNotificationsByChannelByPublisher": number;
            "hourlyUnprocessedNotificationDelayByChannelByPublisher": number;
            "hourlyTotalPipelineTime": number;
            "hourlyNotificationPipelineTime": number;
            "hourlyEventPipelineTime": number;
        };
    };
    NotificationSubscriber: any;
    NotificationSubscriberDeliveryPreference: {
        enumValues: {
            "none": number;
            "preferredEmailAddress": number;
            "eachMember": number;
            "noDelivery": number;
            "notSet": number;
        };
    };
    NotificationSubscriberUpdateParameters: any;
    NotificationSubscription: any;
    NotificationSubscriptionTemplate: any;
    NotificationSubscriptionUpdateParameters: any;
    NotificationTracing: any;
    SubscriberFlags: {
        enumValues: {
            "none": number;
            "deliveryPreferencesEditable": number;
            "supportsPreferredEmailAddressDelivery": number;
            "supportsEachMemberDelivery": number;
            "supportsNoDelivery": number;
            "isUser": number;
            "isGroup": number;
            "isTeam": number;
        };
    };
    SubscriptionDiagnostics: any;
    SubscriptionEvaluationRequest: any;
    SubscriptionEvaluationResult: any;
    SubscriptionFieldType: {
        enumValues: {
            "string": number;
            "integer": number;
            "dateTime": number;
            "plainText": number;
            "html": number;
            "treePath": number;
            "history": number;
            "double": number;
            "guid": number;
            "boolean": number;
            "identity": number;
            "picklistInteger": number;
            "picklistString": number;
            "picklistDouble": number;
            "teamProject": number;
        };
    };
    SubscriptionFlags: {
        enumValues: {
            "none": number;
            "groupSubscription": number;
            "contributedSubscription": number;
            "canOptOut": number;
            "teamSubscription": number;
        };
    };
    SubscriptionPermissions: {
        enumValues: {
            "none": number;
            "view": number;
            "edit": number;
            "delete": number;
        };
    };
    SubscriptionQuery: any;
    SubscriptionQueryCondition: any;
    SubscriptionQueryFlags: {
        enumValues: {
            "none": number;
            "includeInvalidSubscriptions": number;
            "includeDeletedSubscriptions": number;
            "includeFilterDetails": number;
            "alwaysReturnBasicInformation": number;
        };
    };
    SubscriptionStatus: {
        enumValues: {
            "jailedByNotificationsVolume": number;
            "pendingDeletion": number;
            "disabledBySystem": number;
            "disabledInactiveIdentity": number;
            "disabledMessageQueueNotSupported": number;
            "disabledMissingIdentity": number;
            "disabledInvalidRoleExpression": number;
            "disabledInvalidPathClause": number;
            "disabledAsDuplicateOfDefault": number;
            "disabledByAdmin": number;
            "disabled": number;
            "enabled": number;
            "enabledOnProbation": number;
        };
    };
    SubscriptionTemplateQueryFlags: {
        enumValues: {
            "none": number;
            "includeUser": number;
            "includeGroup": number;
            "includeUserAndGroup": number;
            "includeEventTypeInformation": number;
        };
    };
    SubscriptionTemplateType: {
        enumValues: {
            "user": number;
            "team": number;
            "both": number;
            "none": number;
        };
    };
};
