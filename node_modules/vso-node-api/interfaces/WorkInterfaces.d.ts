import SystemInterfaces = require("../interfaces/common/System");
import VSSInterfaces = require("../interfaces/common/VSSInterfaces");
import WorkItemTrackingInterfaces = require("../interfaces/WorkItemTrackingInterfaces");
export interface Activity {
    capacityPerDay: number;
    name: string;
}
export interface attribute {
}
export interface BacklogColumn {
    columnFieldReference: WorkItemTrackingInterfaces.WorkItemFieldReference;
    width: number;
}
export interface BacklogConfiguration {
    /**
     * Behavior/type field mapping
     */
    backlogFields: BacklogFields;
    /**
     * Bugs behavior
     */
    bugsBehavior: BugsBehavior;
    /**
     * Hidden Backlog
     */
    hiddenBacklogs: string[];
    /**
     * Portfolio backlog descriptors
     */
    portfolioBacklogs: BacklogLevelConfiguration[];
    /**
     * Requirement backlog
     */
    requirementBacklog: BacklogLevelConfiguration;
    /**
     * Task backlog
     */
    taskBacklog: BacklogLevelConfiguration;
    url: string;
    /**
     * Mapped states for work item types
     */
    workItemTypeMappedStates: WorkItemTypeStateInfo[];
}
export interface BacklogFields {
    /**
     * Field Type (e.g. Order, Activity) to Field Reference Name map
     */
    typeFields: {
        [key: string]: string;
    };
}
/**
 * Contract representing a backlog level
 */
export interface BacklogLevel {
    /**
     * Reference name of the corresponding WIT category
     */
    categoryReferenceName: string;
    /**
     * Plural name for the backlog level
     */
    pluralName: string;
    /**
     * Collection of work item states that are included in the plan. The server will filter to only these work item types.
     */
    workItemStates: string[];
    /**
     * Collection of valid workitem type names for the given backlog level
     */
    workItemTypes: string[];
}
export interface BacklogLevelConfiguration {
    /**
     * List of fields to include in Add Panel
     */
    addPanelFields: WorkItemTrackingInterfaces.WorkItemFieldReference[];
    /**
     * Color for the backlog level
     */
    color: string;
    /**
     * Default list of columns for the backlog
     */
    columnFields: BacklogColumn[];
    /**
     * Defaulst Work Item Type for the backlog
     */
    defaultWorkItemType: WorkItemTrackingInterfaces.WorkItemTypeReference;
    /**
     * Backlog Id (for Legacy Backlog Level from process config it can be categoryref name)
     */
    id: string;
    /**
     * Backlog Name
     */
    name: string;
    /**
     * Backlog Rank (Taskbacklog is 0)
     */
    rank: number;
    /**
     * Max number of work items to show in the given backlog
     */
    workItemCountLimit: number;
    /**
     * Work Item types participating in this backlog as known by the project/Process, can be overridden by team settings for bugs
     */
    workItemTypes: WorkItemTrackingInterfaces.WorkItemTypeReference[];
}
export interface Board extends BoardReference {
    _links: any;
    allowedMappings: {
        [key: string]: {
            [key: string]: string[];
        };
    };
    canEdit: boolean;
    columns: BoardColumn[];
    fields: BoardFields;
    isValid: boolean;
    revision: number;
    rows: BoardRow[];
}
export interface BoardCardRuleSettings {
    _links: any;
    rules: {
        [key: string]: Rule[];
    };
    url: string;
}
export interface BoardCardSettings {
    cards: {
        [key: string]: FieldSetting[];
    };
}
export interface BoardChart extends BoardChartReference {
    /**
     * The links for the resource
     */
    _links: any;
    /**
     * The settings for the resource
     */
    settings: {
        [key: string]: any;
    };
}
export interface BoardChartReference {
    /**
     * Name of the resource
     */
    name: string;
    /**
     * Full http link to the resource
     */
    url: string;
}
export interface BoardColumn {
    columnType: BoardColumnType;
    description: string;
    id: string;
    isSplit: boolean;
    itemLimit: number;
    name: string;
    stateMappings: {
        [key: string]: string;
    };
}
export declare enum BoardColumnType {
    Incoming = 0,
    InProgress = 1,
    Outgoing = 2,
}
export interface BoardFields {
    columnField: FieldReference;
    doneField: FieldReference;
    rowField: FieldReference;
}
export interface BoardReference {
    /**
     * Id of the resource
     */
    id: string;
    /**
     * Name of the resource
     */
    name: string;
    /**
     * Full http link to the resource
     */
    url: string;
}
export interface BoardRow {
    id: string;
    name: string;
}
export interface BoardSuggestedValue {
    name: string;
}
export interface BoardUserSettings {
    autoRefreshState: boolean;
}
/**
 * The behavior of the work item types that are in the work item category specified in the BugWorkItems section in the Process Configuration
 */
export declare enum BugsBehavior {
    Off = 0,
    AsRequirements = 1,
    AsTasks = 2,
}
/**
 * Expected data from PATCH
 */
export interface CapacityPatch {
    activities: Activity[];
    daysOff: DateRange[];
}
/**
 * Card settings, such as fields and rules
 */
export interface CardFieldSettings {
    /**
     * A collection of field information of additional fields on cards. The index in the collection signifies the order of the field among the additional fields. Currently unused. Should be used with User Story 691539: Card setting: additional fields
     */
    additionalFields: FieldInfo[];
    /**
     * Display format for the assigned to field
     */
    assignedToDisplayFormat: IdentityDisplayFormat;
    /**
     * A collection of field information of rendered core fields on cards.
     */
    coreFields: FieldInfo[];
    /**
     * Flag indicating whether to show assigned to field on cards. When true, AssignedToDisplayFormat will determine how the field will be displayed
     */
    showAssignedTo: boolean;
    /**
     * Flag indicating whether to show empty fields on cards
     */
    showEmptyFields: boolean;
    /**
     * Flag indicating whether to show ID on cards
     */
    showId: boolean;
    /**
     * Flag indicating whether to show state field on cards
     */
    showState: boolean;
    /**
     * Flag indicating whether to show tags on cards
     */
    showTags: boolean;
}
/**
 * Card settings, such as fields and rules
 */
export interface CardSettings {
    /**
     * A collection of settings related to rendering of fields on cards
     */
    fields: CardFieldSettings;
}
/**
 * Details about a given backlog category
 */
export interface CategoryConfiguration {
    /**
     * Name
     */
    name: string;
    /**
     * Category Reference Name
     */
    referenceName: string;
    /**
     * Work item types for the backlog category
     */
    workItemTypes: WorkItemTrackingInterfaces.WorkItemTypeReference[];
}
export interface CreatePlan {
    /**
     * Description of the plan
     */
    description: string;
    /**
     * Name of the plan to create.
     */
    name: string;
    /**
     * Plan properties.
     */
    properties: any;
    /**
     * Type of plan to create.
     */
    type: PlanType;
}
export interface DateRange {
    /**
     * End of the date range.
     */
    end: Date;
    /**
     * Start of the date range.
     */
    start: Date;
}
/**
 * Data contract for Data of Delivery View
 */
export interface DeliveryViewData extends PlanViewData {
    /**
     * Work item child id to parenet id map
     */
    childIdToParentIdMap: {
        [key: number]: number;
    };
    /**
     * Filter criteria status of the timeline
     */
    criteriaStatus: TimelineCriteriaStatus;
    /**
     * The end date of the delivery view data
     */
    endDate: Date;
    /**
     * The start date for the delivery view data
     */
    startDate: Date;
    /**
     * All the team data
     */
    teams: TimelineTeamData[];
}
/**
 * Collection of properties, specific to the DeliveryTimelineView
 */
export interface DeliveryViewPropertyCollection extends PlanPropertyCollection {
    /**
     * Card settings
     */
    cardSettings: CardSettings;
    /**
     * Field criteria
     */
    criteria: FilterClause[];
    /**
     * Markers. Will be missing/null if there are no markers.
     */
    markers: Marker[];
    /**
     * Team backlog mappings
     */
    teamBacklogMappings: TeamBacklogMapping[];
}
/**
 * Object bag storing the set of permissions relevant to this plan
 */
export interface FieldInfo {
    /**
     * The additional field display name
     */
    displayName: string;
    /**
     * The additional field type
     */
    fieldType: FieldType;
    /**
     * Indicates if the field definition is for an identity field.
     */
    isIdentity: boolean;
    /**
     * The additional field reference name
     */
    referenceName: string;
}
/**
 * An abstracted reference to a field
 */
export interface FieldReference {
    /**
     * fieldRefName for the field
     */
    referenceName: string;
    /**
     * Full http link to more information about the field
     */
    url: string;
}
export interface FieldSetting {
}
export declare enum FieldType {
    String = 0,
    PlainText = 1,
    Integer = 2,
    DateTime = 3,
    TreePath = 4,
    Boolean = 5,
    Double = 6,
}
export interface FilterClause {
    fieldName: string;
    index: number;
    logicalOperator: string;
    operator: string;
    value: string;
}
export interface FilterGroup {
    end: number;
    level: number;
    start: number;
}
/**
 * Enum for the various modes of identity picker
 */
export declare enum IdentityDisplayFormat {
    /**
     * Display avatar only
     */
    AvatarOnly = 0,
    /**
     * Display Full name only
     */
    FullName = 1,
    /**
     * Display Avatar and Full name
     */
    AvatarAndFullName = 2,
}
/**
 * Client serialization contract for Delivery Timeline Markers.
 */
export interface Marker {
    /**
     * Color associated with the marker.
     */
    color: string;
    /**
     * Where the marker should be displayed on the timeline.
     */
    date: Date;
    /**
     * Label/title for the marker.
     */
    label: string;
}
export interface Member {
    displayName: string;
    id: string;
    imageUrl: string;
    uniqueName: string;
    url: string;
}
export interface ParentChildWIMap {
    childWorkItemIds: number[];
    id: number;
    title: string;
}
/**
 * Data contract for the plan definition
 */
export interface Plan {
    /**
     * Identity that created this plan. Defaults to null for records before upgrading to ScaledAgileViewComponent4.
     */
    createdByIdentity: VSSInterfaces.IdentityRef;
    /**
     * Date when the plan was created
     */
    createdDate: Date;
    /**
     * Description of the plan
     */
    description: string;
    /**
     * Id of the plan
     */
    id: string;
    /**
     * Identity that last modified this plan. Defaults to null for records before upgrading to ScaledAgileViewComponent4.
     */
    modifiedByIdentity: VSSInterfaces.IdentityRef;
    /**
     * Date when the plan was last modified. Default to CreatedDate when the plan is first created.
     */
    modifiedDate: Date;
    /**
     * Name of the plan
     */
    name: string;
    /**
     * The PlanPropertyCollection instance associated with the plan. These are dependent on the type of the plan. For example, DeliveryTimelineView, it would be of type DeliveryViewPropertyCollection.
     */
    properties: any;
    /**
     * Revision of the plan. Used to safeguard users from overwriting each other's changes.
     */
    revision: number;
    /**
     * Type of the plan
     */
    type: PlanType;
    /**
     * The resource url to locate the plan via rest api
     */
    url: string;
    /**
     * Bit flag indicating set of permissions a user has to the plan.
     */
    userPermissions: PlanUserPermissions;
}
/**
 * Metadata about a plan definition that is stored in favorites service
 */
export interface PlanMetadata {
    /**
     * Identity of the creator of the plan
     */
    createdByIdentity: VSSInterfaces.IdentityRef;
    /**
     * Description of plan
     */
    description: string;
    /**
     * Last modified date of the plan
     */
    modifiedDate: Date;
    /**
     * Bit flag indicating set of permissions a user has to the plan.
     */
    userPermissions: PlanUserPermissions;
}
/**
 * Base class for properties of a scaled agile plan
 */
export interface PlanPropertyCollection {
}
/**
 * Enum for the various types of plans
 */
export declare enum PlanType {
    DeliveryTimelineView = 0,
}
/**
 * Flag for permissions a user can have for this plan.
 */
export declare enum PlanUserPermissions {
    /**
     * None
     */
    None = 0,
    /**
     * Permission to view this plan.
     */
    View = 1,
    /**
     * Permission to update this plan.
     */
    Edit = 2,
    /**
     * Permission to delete this plan.
     */
    Delete = 4,
    /**
     * Permission to manage this plan.
     */
    Manage = 8,
    /**
     * Full control permission for this plan.
     */
    AllPermissions = 15,
}
/**
 * Base class for plan view data contracts. Anything common goes here.
 */
export interface PlanViewData {
    id: string;
    revision: number;
}
/**
 * Process Configurations for the project
 */
export interface ProcessConfiguration {
    /**
     * Details about bug work items
     */
    bugWorkItems: CategoryConfiguration;
    /**
     * Details about portfolio backlogs
     */
    portfolioBacklogs: CategoryConfiguration[];
    /**
     * Details of requirement backlog
     */
    requirementBacklog: CategoryConfiguration;
    /**
     * Details of task backlog
     */
    taskBacklog: CategoryConfiguration;
    /**
     * Type fields for the process configuration
     */
    typeFields: {
        [key: string]: WorkItemTrackingInterfaces.WorkItemFieldReference;
    };
    url: string;
}
export interface Rule {
    clauses: FilterClause[];
    filter: string;
    isEnabled: string;
    name: string;
    settings: attribute;
}
/**
 * Mapping of teams to the corresponding work item category
 */
export interface TeamBacklogMapping {
    categoryReferenceName: string;
    teamId: string;
}
/**
 * Represents a single TeamFieldValue
 */
export interface TeamFieldValue {
    includeChildren: boolean;
    value: string;
}
/**
 * Essentially a collection of team field values
 */
export interface TeamFieldValues extends TeamSettingsDataContractBase {
    /**
     * The default team field value
     */
    defaultValue: string;
    /**
     * Shallow ref to the field being used as a team field
     */
    field: FieldReference;
    /**
     * Collection of all valid team field values
     */
    values: TeamFieldValue[];
}
/**
 * Expected data from PATCH
 */
export interface TeamFieldValuesPatch {
    defaultValue: string;
    values: TeamFieldValue[];
}
export interface TeamIterationAttributes {
    finishDate: Date;
    startDate: Date;
    timeFrame: TimeFrame;
}
/**
 * Represents capacity for a specific team member
 */
export interface TeamMemberCapacity extends TeamSettingsDataContractBase {
    /**
     * Collection of capacities associated with the team member
     */
    activities: Activity[];
    /**
     * The days off associated with the team member
     */
    daysOff: DateRange[];
    /**
     * Shallow Ref to the associated team member
     */
    teamMember: Member;
}
/**
 * Data contract for TeamSettings
 */
export interface TeamSetting extends TeamSettingsDataContractBase {
    /**
     * Backlog Iteration
     */
    backlogIteration: TeamSettingsIteration;
    /**
     * Information about categories that are visible on the backlog.
     */
    backlogVisibilities: {
        [key: string]: boolean;
    };
    /**
     * BugsBehavior (Off, AsTasks, AsRequirements, ...)
     */
    bugsBehavior: BugsBehavior;
    /**
     * Default Iteration, the iteration used when creating a new work item on the queries page.
     */
    defaultIteration: TeamSettingsIteration;
    /**
     * Default Iteration macro (if any)
     */
    defaultIterationMacro: string;
    /**
     * Days that the team is working
     */
    workingDays: SystemInterfaces.DayOfWeek[];
}
/**
 * Base class for TeamSettings data contracts. Anything common goes here.
 */
export interface TeamSettingsDataContractBase {
    /**
     * Collection of links relevant to resource
     */
    _links: any;
    /**
     * Full http link to the resource
     */
    url: string;
}
export interface TeamSettingsDaysOff extends TeamSettingsDataContractBase {
    daysOff: DateRange[];
}
export interface TeamSettingsDaysOffPatch {
    daysOff: DateRange[];
}
/**
 * Represents a shallow ref for a single iteration
 */
export interface TeamSettingsIteration extends TeamSettingsDataContractBase {
    /**
     * Attributes such as start and end date
     */
    attributes: TeamIterationAttributes;
    /**
     * Id of the resource
     */
    id: string;
    /**
     * Name of the resource
     */
    name: string;
    /**
     * Relative path of the iteration
     */
    path: string;
}
/**
 * Data contract for what we expect to receive when PATCH
 */
export interface TeamSettingsPatch {
    backlogIteration: string;
    backlogVisibilities: {
        [key: string]: boolean;
    };
    bugsBehavior: BugsBehavior;
    defaultIteration: string;
    defaultIterationMacro: string;
    workingDays: SystemInterfaces.DayOfWeek[];
}
export declare enum TimeFrame {
    Past = 0,
    Current = 1,
    Future = 2,
}
export interface TimelineCriteriaStatus {
    message: string;
    type: TimelineCriteriaStatusCode;
}
export declare enum TimelineCriteriaStatusCode {
    /**
     * No error - filter is good.
     */
    OK = 0,
    /**
     * One of the filter clause is invalid.
     */
    InvalidFilterClause = 1,
    /**
     * Unknown error.
     */
    Unknown = 2,
}
export interface TimelineIterationStatus {
    message: string;
    type: TimelineIterationStatusCode;
}
export declare enum TimelineIterationStatusCode {
    /**
     * No error - iteration data is good.
     */
    OK = 0,
    /**
     * This iteration overlaps with another iteration, no data is returned for this iteration.
     */
    IsOverlapping = 1,
}
export interface TimelineTeamData {
    /**
     * Backlog matching the mapped backlog associated with this team.
     */
    backlog: BacklogLevel;
    /**
     * The field reference names of the work item data
     */
    fieldReferenceNames: string[];
    /**
     * The id of the team
     */
    id: string;
    /**
     * Was iteration and work item data retrieved for this team. <remarks> Teams with IsExpanded false have not had their iteration, work item, and field related data queried and will never contain this data. If true then these items are queried and, if there are items in the queried range, there will be data. </remarks>
     */
    isExpanded: boolean;
    /**
     * The iteration data, including the work items, in the queried date range.
     */
    iterations: TimelineTeamIteration[];
    /**
     * The name of the team
     */
    name: string;
    /**
     * The order by field name of this team
     */
    orderByField: string;
    /**
     * The field reference names of the partially paged work items, such as ID, WorkItemType
     */
    partiallyPagedFieldReferenceNames: string[];
    /**
     * The project id the team belongs team
     */
    projectId: string;
    /**
     * Status for this team.
     */
    status: TimelineTeamStatus;
    /**
     * The team field default value
     */
    teamFieldDefaultValue: string;
    /**
     * The team field name of this team
     */
    teamFieldName: string;
    /**
     * The team field values
     */
    teamFieldValues: TeamFieldValue[];
    /**
     * Colors for the work item types.
     */
    workItemTypeColors: WorkItemColor[];
}
export interface TimelineTeamIteration {
    /**
     * The end date of the iteration
     */
    finishDate: Date;
    /**
     * The iteration name
     */
    name: string;
    /**
     * All the partially paged workitems in this iteration.
     */
    partiallyPagedWorkItems: any[][];
    /**
     * The iteration path
     */
    path: string;
    /**
     * The start date of the iteration
     */
    startDate: Date;
    /**
     * The status of this iteration
     */
    status: TimelineIterationStatus;
    /**
     * The work items that have been paged in this iteration
     */
    workItems: any[][];
}
export interface TimelineTeamStatus {
    message: string;
    type: TimelineTeamStatusCode;
}
export declare enum TimelineTeamStatusCode {
    /**
     * No error - all data for team is good.
     */
    OK = 0,
    /**
     * Team does not exist or access is denied.
     */
    DoesntExistOrAccessDenied = 1,
    /**
     * Maximum number of teams was exceeded. No team data will be returned for this team.
     */
    MaxTeamsExceeded = 2,
    /**
     * Maximum number of team fields (ie Area paths) have been exceeded. No team data will be returned for this team.
     */
    MaxTeamFieldsExceeded = 3,
    /**
     * Backlog does not exist or is missing crucial information.
     */
    BacklogInError = 4,
    /**
     * Team field value is not set for this team. No team data will be returned for this team
     */
    MissingTeamFieldValue = 5,
    /**
     * Team does not have a single iteration with date range.
     */
    NoIterationsExist = 6,
}
export interface UpdatePlan {
    /**
     * Description of the plan
     */
    description: string;
    /**
     * Name of the plan to create.
     */
    name: string;
    /**
     * Plan properties.
     */
    properties: any;
    /**
     * Revision of the plan that was updated - the value used here should match the one the server gave the client in the Plan.
     */
    revision: number;
    /**
     * Type of the plan
     */
    type: PlanType;
}
/**
 * Work item color and icon.
 */
export interface WorkItemColor {
    icon: string;
    primaryColor: string;
    workItemTypeName: string;
}
export interface WorkItemTypeStateInfo {
    /**
     * State name to state category map
     */
    states: {
        [key: string]: string;
    };
    /**
     * Work Item type name
     */
    workItemTypeName: string;
}
export declare var TypeInfo: {
    BacklogConfiguration: any;
    Board: any;
    BoardColumn: any;
    BoardColumnType: {
        enumValues: {
            "incoming": number;
            "inProgress": number;
            "outgoing": number;
        };
    };
    BugsBehavior: {
        enumValues: {
            "off": number;
            "asRequirements": number;
            "asTasks": number;
        };
    };
    CapacityPatch: any;
    CardFieldSettings: any;
    CardSettings: any;
    CreatePlan: any;
    DateRange: any;
    DeliveryViewData: any;
    DeliveryViewPropertyCollection: any;
    FieldInfo: any;
    FieldType: {
        enumValues: {
            "string": number;
            "plainText": number;
            "integer": number;
            "dateTime": number;
            "treePath": number;
            "boolean": number;
            "double": number;
        };
    };
    IdentityDisplayFormat: {
        enumValues: {
            "avatarOnly": number;
            "fullName": number;
            "avatarAndFullName": number;
        };
    };
    Marker: any;
    Plan: any;
    PlanMetadata: any;
    PlanType: {
        enumValues: {
            "deliveryTimelineView": number;
        };
    };
    PlanUserPermissions: {
        enumValues: {
            "none": number;
            "view": number;
            "edit": number;
            "delete": number;
            "manage": number;
            "allPermissions": number;
        };
    };
    TeamIterationAttributes: any;
    TeamMemberCapacity: any;
    TeamSetting: any;
    TeamSettingsDaysOff: any;
    TeamSettingsDaysOffPatch: any;
    TeamSettingsIteration: any;
    TeamSettingsPatch: any;
    TimeFrame: {
        enumValues: {
            "past": number;
            "current": number;
            "future": number;
        };
    };
    TimelineCriteriaStatus: any;
    TimelineCriteriaStatusCode: {
        enumValues: {
            "oK": number;
            "invalidFilterClause": number;
            "unknown": number;
        };
    };
    TimelineIterationStatus: any;
    TimelineIterationStatusCode: {
        enumValues: {
            "oK": number;
            "isOverlapping": number;
        };
    };
    TimelineTeamData: any;
    TimelineTeamIteration: any;
    TimelineTeamStatus: any;
    TimelineTeamStatusCode: {
        enumValues: {
            "oK": number;
            "doesntExistOrAccessDenied": number;
            "maxTeamsExceeded": number;
            "maxTeamFieldsExceeded": number;
            "backlogInError": number;
            "missingTeamFieldValue": number;
            "noIterationsExist": number;
        };
    };
    UpdatePlan: any;
};
