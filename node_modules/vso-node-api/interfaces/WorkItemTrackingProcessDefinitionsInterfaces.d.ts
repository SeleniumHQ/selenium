export interface BehaviorCreateModel {
    /**
     * Color
     */
    color: string;
    /**
     * Parent behavior id
     */
    inherits: string;
    /**
     * Name of the behavior
     */
    name: string;
}
export interface BehaviorModel {
    /**
     * Is the behavior abstract (i.e. can not be associated with any work item type)
     */
    abstract: boolean;
    /**
     * Color
     */
    color: string;
    /**
     * Description
     */
    description: string;
    /**
     * Behavior Id
     */
    id: string;
    /**
     * Parent behavior reference
     */
    inherits: WorkItemBehaviorReference;
    /**
     * Behavior Name
     */
    name: string;
    /**
     * Is the behavior overrides a behavior from system process
     */
    overridden: boolean;
    /**
     * Rank
     */
    rank: number;
    /**
     * Url of the behavior
     */
    url: string;
}
export interface BehaviorReplaceModel {
    /**
     * Color
     */
    color: string;
    /**
     * Behavior Name
     */
    name: string;
}
/**
 * Represent a control in the form.
 */
export interface Control {
    /**
     * Contribution for the control.
     */
    contribution: WitContribution;
    /**
     * Type of the control.
     */
    controlType: string;
    /**
     * Height of the control, for html controls.
     */
    height: number;
    /**
     * The id for the layout node.
     */
    id: string;
    /**
     * A value indicating whether this layout node has been inherited from a parent layout.  This is expected to only be only set by the combiner.
     */
    inherited: boolean;
    /**
     * A value indicating if the layout node is contribution or not.
     */
    isContribution: boolean;
    /**
     * Label for the field
     */
    label: string;
    /**
     * Inner text of the control.
     */
    metadata: string;
    order: number;
    /**
     * A value indicating whether this layout node has been overridden by a child layout.
     */
    overridden: boolean;
    /**
     * A value indicating if the control is readonly.
     */
    readOnly: boolean;
    /**
     * A value indicating if the control should be hidden or not.
     */
    visible: boolean;
    /**
     * Watermark text for the textbox.
     */
    watermark: string;
}
/**
 * Represents the extensions part of the layout
 */
export interface Extension {
    id: string;
}
export interface FieldModel {
    /**
     * Description about field
     */
    description: string;
    /**
     * ID of the field
     */
    id: string;
    /**
     * Name of the field
     */
    name: string;
    /**
     * Reference to picklist in this field
     */
    pickList: PickListMetadataModel;
    /**
     * Type of field
     */
    type: FieldType;
    /**
     * Url to the field
     */
    url: string;
}
export declare enum FieldType {
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
}
export interface FieldUpdate {
    description: string;
    id: string;
}
export interface FormLayout {
    /**
     * Gets and sets extensions list
     */
    extensions: Extension[];
    /**
     * Top level tabs of the layout.
     */
    pages: Page[];
    /**
     * Headers controls of the layout.
     */
    systemControls: Control[];
}
export declare enum GetWorkItemTypeExpand {
    None = 0,
    States = 1,
    Behaviors = 2,
    Layout = 4,
}
/**
 * Represent a group in the form that holds controls in it.
 */
export interface Group {
    /**
     * Contribution for the group.
     */
    contribution: WitContribution;
    /**
     * Controls to be put in the group.
     */
    controls: Control[];
    /**
     * The height for the contribution.
     */
    height: number;
    /**
     * The id for the layout node.
     */
    id: string;
    /**
     * A value indicating whether this layout node has been inherited from a parent layout.  This is expected to only be only set by the combiner.
     */
    inherited: boolean;
    /**
     * A value indicating if the layout node is contribution are not.
     */
    isContribution: boolean;
    /**
     * Label for the group.
     */
    label: string;
    /**
     * Order in which the group should appear in the section.
     */
    order: number;
    /**
     * A value indicating whether this layout node has been overridden by a child layout.
     */
    overridden: boolean;
    /**
     * A value indicating if the group should be hidden or not.
     */
    visible: boolean;
}
export interface HideStateModel {
    hidden: boolean;
}
export interface Page {
    /**
     * Contribution for the page.
     */
    contribution: WitContribution;
    /**
     * The id for the layout node.
     */
    id: string;
    /**
     * A value indicating whether this layout node has been inherited from a parent layout.  This is expected to only be only set by the combiner.
     */
    inherited: boolean;
    /**
     * A value indicating if the layout node is contribution are not.
     */
    isContribution: boolean;
    /**
     * The label for the page.
     */
    label: string;
    /**
     * A value indicating whether any user operations are permitted on this page and the contents of this page
     */
    locked: boolean;
    /**
     * Order in which the page should appear in the layout.
     */
    order: number;
    /**
     * A value indicating whether this layout node has been overridden by a child layout.
     */
    overridden: boolean;
    /**
     * The icon for the page.
     */
    pageType: PageType;
    /**
     * The sections of the page.
     */
    sections: Section[];
    /**
     * A value indicating if the page should be hidden or not.
     */
    visible: boolean;
}
/**
 * Type of page
 */
export declare enum PageType {
    Custom = 1,
    History = 2,
    Links = 3,
    Attachments = 4,
}
export interface PickListItemModel {
    id: string;
    value: string;
}
export interface PickListMetadataModel {
    /**
     * ID of the picklist
     */
    id: string;
    /**
     * Is input values by user only limited to suggested values
     */
    isSuggested: boolean;
    /**
     * Name of the picklist
     */
    name: string;
    /**
     * Type of picklist
     */
    type: string;
    /**
     * Url of the picklist
     */
    url: string;
}
export interface PickListModel extends PickListMetadataModel {
    /**
     * A list of PicklistItemModel
     */
    items: PickListItemModel[];
}
/**
 * A layout node holding groups together in a page
 */
export interface Section {
    groups: Group[];
    /**
     * The id for the layout node.
     */
    id: string;
    /**
     * A value indicating whether this layout node has been overridden by a child layout.
     */
    overridden: boolean;
}
export interface WitContribution {
    /**
     * The id for the contribution.
     */
    contributionId: string;
    /**
     * The height for the contribution.
     */
    height: number;
    /**
     * A dictionary holding key value pairs for contribution inputs.
     */
    inputs: {
        [key: string]: any;
    };
    /**
     * A value indicating if the contribution should be show on deleted workItem.
     */
    showOnDeletedWorkItem: boolean;
}
export interface WorkItemBehaviorReference {
    /**
     * The ID of the reference behavior
     */
    id: string;
    /**
     * The url of the reference behavior
     */
    url: string;
}
export interface WorkItemStateInputModel {
    /**
     * Color of the state
     */
    color: string;
    /**
     * Name of the state
     */
    name: string;
    /**
     * Order in which state should appear
     */
    order: number;
    /**
     * Category of the state
     */
    stateCategory: string;
}
export interface WorkItemStateResultModel {
    /**
     * Color of the state
     */
    color: string;
    /**
     * Is the state hidden
     */
    hidden: boolean;
    /**
     * The ID of the State
     */
    id: string;
    /**
     * Name of the state
     */
    name: string;
    /**
     * Order in which state should appear
     */
    order: number;
    /**
     * Category of the state
     */
    stateCategory: string;
    /**
     * Url of the state
     */
    url: string;
}
export interface WorkItemTypeBehavior {
    behavior: WorkItemBehaviorReference;
    isDefault: boolean;
    url: string;
}
/**
 * Work item type classes'
 */
export declare enum WorkItemTypeClass {
    System = 0,
    Derived = 1,
    Custom = 2,
}
export interface WorkItemTypeFieldModel {
    allowGroups: boolean;
    defaultValue: string;
    name: string;
    pickList: PickListMetadataModel;
    readOnly: boolean;
    referenceName: string;
    required: boolean;
    type: FieldType;
    url: string;
}
export interface WorkItemTypeModel {
    /**
     * Behaviors of the work item type
     */
    behaviors: WorkItemTypeBehavior[];
    /**
     * Class of the work item type
     */
    class: WorkItemTypeClass;
    /**
     * Color of the work item type
     */
    color: string;
    /**
     * Description of the work item type
     */
    description: string;
    /**
     * Icon of the work item type
     */
    icon: string;
    /**
     * The ID of the work item type
     */
    id: string;
    /**
     * Parent WIT Id/Internal ReferenceName that it inherits from
     */
    inherits: string;
    /**
     * Is work item type disabled
     */
    isDisabled: boolean;
    /**
     * Layout of the work item type
     */
    layout: FormLayout;
    /**
     * Name of the work item type
     */
    name: string;
    /**
     * States of the work item type
     */
    states: WorkItemStateResultModel[];
    /**
     * Url of the work item type
     */
    url: string;
}
export interface WorkItemTypeUpdateModel {
    /**
     * Color of the work item type
     */
    color: string;
    /**
     * Description of the work item type
     */
    description: string;
    /**
     * Icon of the work item type
     */
    icon: string;
    /**
     * Is the workitem type to be disabled
     */
    isDisabled: boolean;
}
export declare var TypeInfo: {
    FieldModel: any;
    FieldType: {
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
        };
    };
    FormLayout: any;
    GetWorkItemTypeExpand: {
        enumValues: {
            "none": number;
            "states": number;
            "behaviors": number;
            "layout": number;
        };
    };
    Page: any;
    PageType: {
        enumValues: {
            "custom": number;
            "history": number;
            "links": number;
            "attachments": number;
        };
    };
    WorkItemTypeClass: {
        enumValues: {
            "system": number;
            "derived": number;
            "custom": number;
        };
    };
    WorkItemTypeFieldModel: any;
    WorkItemTypeModel: any;
};
