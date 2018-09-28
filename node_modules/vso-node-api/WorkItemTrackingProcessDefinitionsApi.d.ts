import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import WorkItemTrackingProcessDefinitionsInterfaces = require("./interfaces/WorkItemTrackingProcessDefinitionsInterfaces");
export interface IWorkItemTrackingProcessDefinitionsApi extends basem.ClientApiBase {
    createBehavior(behavior: WorkItemTrackingProcessDefinitionsInterfaces.BehaviorCreateModel, processId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.BehaviorModel>;
    deleteBehavior(processId: string, behaviorId: string): Promise<void>;
    getBehavior(processId: string, behaviorId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.BehaviorModel>;
    getBehaviors(processId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.BehaviorModel[]>;
    replaceBehavior(behaviorData: WorkItemTrackingProcessDefinitionsInterfaces.BehaviorReplaceModel, processId: string, behaviorId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.BehaviorModel>;
    addControlToGroup(control: WorkItemTrackingProcessDefinitionsInterfaces.Control, processId: string, witRefName: string, groupId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Control>;
    editControl(control: WorkItemTrackingProcessDefinitionsInterfaces.Control, processId: string, witRefName: string, groupId: string, controlId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Control>;
    removeControlFromGroup(processId: string, witRefName: string, groupId: string, controlId: string): Promise<void>;
    setControlInGroup(control: WorkItemTrackingProcessDefinitionsInterfaces.Control, processId: string, witRefName: string, groupId: string, controlId: string, removeFromGroupId?: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Control>;
    createField(field: WorkItemTrackingProcessDefinitionsInterfaces.FieldModel, processId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.FieldModel>;
    updateField(field: WorkItemTrackingProcessDefinitionsInterfaces.FieldUpdate, processId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.FieldModel>;
    addGroup(group: WorkItemTrackingProcessDefinitionsInterfaces.Group, processId: string, witRefName: string, pageId: string, sectionId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Group>;
    editGroup(group: WorkItemTrackingProcessDefinitionsInterfaces.Group, processId: string, witRefName: string, pageId: string, sectionId: string, groupId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Group>;
    removeGroup(processId: string, witRefName: string, pageId: string, sectionId: string, groupId: string): Promise<void>;
    setGroupInPage(group: WorkItemTrackingProcessDefinitionsInterfaces.Group, processId: string, witRefName: string, pageId: string, sectionId: string, groupId: string, removeFromPageId: string, removeFromSectionId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Group>;
    setGroupInSection(group: WorkItemTrackingProcessDefinitionsInterfaces.Group, processId: string, witRefName: string, pageId: string, sectionId: string, groupId: string, removeFromSectionId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Group>;
    getFormLayout(processId: string, witRefName: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.FormLayout>;
    getListsMetadata(): Promise<WorkItemTrackingProcessDefinitionsInterfaces.PickListMetadataModel[]>;
    createList(picklist: WorkItemTrackingProcessDefinitionsInterfaces.PickListModel): Promise<WorkItemTrackingProcessDefinitionsInterfaces.PickListModel>;
    deleteList(listId: string): Promise<void>;
    getList(listId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.PickListModel>;
    updateList(picklist: WorkItemTrackingProcessDefinitionsInterfaces.PickListModel, listId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.PickListModel>;
    addPage(page: WorkItemTrackingProcessDefinitionsInterfaces.Page, processId: string, witRefName: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Page>;
    editPage(page: WorkItemTrackingProcessDefinitionsInterfaces.Page, processId: string, witRefName: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Page>;
    removePage(processId: string, witRefName: string, pageId: string): Promise<void>;
    createStateDefinition(stateModel: WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateInputModel, processId: string, witRefName: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateResultModel>;
    deleteStateDefinition(processId: string, witRefName: string, stateId: string): Promise<void>;
    getStateDefinition(processId: string, witRefName: string, stateId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateResultModel>;
    getStateDefinitions(processId: string, witRefName: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateResultModel[]>;
    hideStateDefinition(hideStateModel: WorkItemTrackingProcessDefinitionsInterfaces.HideStateModel, processId: string, witRefName: string, stateId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateResultModel>;
    updateStateDefinition(stateModel: WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateInputModel, processId: string, witRefName: string, stateId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateResultModel>;
    addBehaviorToWorkItemType(behavior: WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeBehavior, processId: string, witRefNameForBehaviors: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeBehavior>;
    getBehaviorForWorkItemType(processId: string, witRefNameForBehaviors: string, behaviorRefName: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeBehavior>;
    getBehaviorsForWorkItemType(processId: string, witRefNameForBehaviors: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeBehavior[]>;
    removeBehaviorFromWorkItemType(processId: string, witRefNameForBehaviors: string, behaviorRefName: string): Promise<void>;
    updateBehaviorToWorkItemType(behavior: WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeBehavior, processId: string, witRefNameForBehaviors: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeBehavior>;
    createWorkItemType(workItemType: WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeModel, processId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeModel>;
    deleteWorkItemType(processId: string, witRefName: string): Promise<void>;
    getWorkItemType(processId: string, witRefName: string, expand?: WorkItemTrackingProcessDefinitionsInterfaces.GetWorkItemTypeExpand): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeModel>;
    getWorkItemTypes(processId: string, expand?: WorkItemTrackingProcessDefinitionsInterfaces.GetWorkItemTypeExpand): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeModel[]>;
    updateWorkItemType(workItemTypeUpdate: WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeUpdateModel, processId: string, witRefName: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeModel>;
    addFieldToWorkItemType(field: WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeFieldModel, processId: string, witRefNameForFields: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeFieldModel>;
    getWorkItemTypeField(processId: string, witRefNameForFields: string, fieldRefName: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeFieldModel>;
    getWorkItemTypeFields(processId: string, witRefNameForFields: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeFieldModel[]>;
    removeFieldFromWorkItemType(processId: string, witRefNameForFields: string, fieldRefName: string): Promise<void>;
}
export declare class WorkItemTrackingProcessDefinitionsApi extends basem.ClientApiBase implements IWorkItemTrackingProcessDefinitionsApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
     * Creates a single behavior in the given process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.BehaviorCreateModel} behavior
     * @param {string} processId - The ID of the process
     */
    createBehavior(behavior: WorkItemTrackingProcessDefinitionsInterfaces.BehaviorCreateModel, processId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.BehaviorModel>;
    /**
     * Removes a behavior in the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} behaviorId - The ID of the behavior
     */
    deleteBehavior(processId: string, behaviorId: string): Promise<void>;
    /**
     * Returns a single behavior in the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} behaviorId - The ID of the behavior
     */
    getBehavior(processId: string, behaviorId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.BehaviorModel>;
    /**
     * Returns a list of all behaviors in the process.
     *
     * @param {string} processId - The ID of the process
     */
    getBehaviors(processId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.BehaviorModel[]>;
    /**
     * Replaces a behavior in the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.BehaviorReplaceModel} behaviorData
     * @param {string} processId - The ID of the process
     * @param {string} behaviorId - The ID of the behavior
     */
    replaceBehavior(behaviorData: WorkItemTrackingProcessDefinitionsInterfaces.BehaviorReplaceModel, processId: string, behaviorId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.BehaviorModel>;
    /**
     * Creates a control in a group
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Control} control - The control
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} groupId - The ID of the group to add the control to
     */
    addControlToGroup(control: WorkItemTrackingProcessDefinitionsInterfaces.Control, processId: string, witRefName: string, groupId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Control>;
    /**
     * Updates a control on the work item form
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Control} control - The updated control
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} groupId - The ID of the group
     * @param {string} controlId - The ID of the control
     */
    editControl(control: WorkItemTrackingProcessDefinitionsInterfaces.Control, processId: string, witRefName: string, groupId: string, controlId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Control>;
    /**
     * Removes a control from the work item form
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} groupId - The ID of the group
     * @param {string} controlId - The ID of the control to remove
     */
    removeControlFromGroup(processId: string, witRefName: string, groupId: string, controlId: string): Promise<void>;
    /**
     * Moves a control to a new group
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Control} control - The control
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} groupId - The ID of the group to move the control to
     * @param {string} controlId - The id of the control
     * @param {string} removeFromGroupId - The group to remove the control from
     */
    setControlInGroup(control: WorkItemTrackingProcessDefinitionsInterfaces.Control, processId: string, witRefName: string, groupId: string, controlId: string, removeFromGroupId?: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Control>;
    /**
     * Creates a single field in the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.FieldModel} field
     * @param {string} processId - The ID of the process
     */
    createField(field: WorkItemTrackingProcessDefinitionsInterfaces.FieldModel, processId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.FieldModel>;
    /**
     * Updates a given field in the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.FieldUpdate} field
     * @param {string} processId - The ID of the process
     */
    updateField(field: WorkItemTrackingProcessDefinitionsInterfaces.FieldUpdate, processId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.FieldModel>;
    /**
     * Adds a group to the work item form
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Group} group - The group
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} pageId - The ID of the page to add the group to
     * @param {string} sectionId - The ID of the section to add the group to
     */
    addGroup(group: WorkItemTrackingProcessDefinitionsInterfaces.Group, processId: string, witRefName: string, pageId: string, sectionId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Group>;
    /**
     * Updates a group in the work item form
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Group} group - The updated group
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} pageId - The ID of the page the group is in
     * @param {string} sectionId - The ID of the section the group is in
     * @param {string} groupId - The ID of the group
     */
    editGroup(group: WorkItemTrackingProcessDefinitionsInterfaces.Group, processId: string, witRefName: string, pageId: string, sectionId: string, groupId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Group>;
    /**
     * Removes a group from the work item form
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} pageId - The ID of the page the group is in
     * @param {string} sectionId - The ID of the section to the group is in
     * @param {string} groupId - The ID of the group
     */
    removeGroup(processId: string, witRefName: string, pageId: string, sectionId: string, groupId: string): Promise<void>;
    /**
     * Moves a group to a different page and section
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Group} group - The updated group
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} pageId - The ID of the page the group is in
     * @param {string} sectionId - The ID of the section the group is in
     * @param {string} groupId - The ID of the group
     * @param {string} removeFromPageId - ID of the page to remove the group from
     * @param {string} removeFromSectionId - ID of the section to remove the group from
     */
    setGroupInPage(group: WorkItemTrackingProcessDefinitionsInterfaces.Group, processId: string, witRefName: string, pageId: string, sectionId: string, groupId: string, removeFromPageId: string, removeFromSectionId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Group>;
    /**
     * Moves a group to a different section
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Group} group - The updated group
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} pageId - The ID of the page the group is in
     * @param {string} sectionId - The ID of the section the group is in
     * @param {string} groupId - The ID of the group
     * @param {string} removeFromSectionId - ID of the section to remove the group from
     */
    setGroupInSection(group: WorkItemTrackingProcessDefinitionsInterfaces.Group, processId: string, witRefName: string, pageId: string, sectionId: string, groupId: string, removeFromSectionId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Group>;
    /**
     * Gets the form layout
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    getFormLayout(processId: string, witRefName: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.FormLayout>;
    /**
     * Returns meta data of the picklist.
     *
     */
    getListsMetadata(): Promise<WorkItemTrackingProcessDefinitionsInterfaces.PickListMetadataModel[]>;
    /**
     * Creates a picklist.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.PickListModel} picklist
     */
    createList(picklist: WorkItemTrackingProcessDefinitionsInterfaces.PickListModel): Promise<WorkItemTrackingProcessDefinitionsInterfaces.PickListModel>;
    /**
     * Removes a picklist.
     *
     * @param {string} listId - The ID of the list
     */
    deleteList(listId: string): Promise<void>;
    /**
     * Returns a picklist.
     *
     * @param {string} listId - The ID of the list
     */
    getList(listId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.PickListModel>;
    /**
     * Updates a list.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.PickListModel} picklist
     * @param {string} listId - The ID of the list
     */
    updateList(picklist: WorkItemTrackingProcessDefinitionsInterfaces.PickListModel, listId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.PickListModel>;
    /**
     * Adds a page to the work item form
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Page} page - The page
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    addPage(page: WorkItemTrackingProcessDefinitionsInterfaces.Page, processId: string, witRefName: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Page>;
    /**
     * Updates a page on the work item form
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.Page} page - The page
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    editPage(page: WorkItemTrackingProcessDefinitionsInterfaces.Page, processId: string, witRefName: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.Page>;
    /**
     * Removes a page from the work item form
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} pageId - The ID of the page
     */
    removePage(processId: string, witRefName: string, pageId: string): Promise<void>;
    /**
     * Creates a state definition in the work item type of the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateInputModel} stateModel
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    createStateDefinition(stateModel: WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateInputModel, processId: string, witRefName: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateResultModel>;
    /**
     * Removes a state definition in the work item type of the process.
     *
     * @param {string} processId - ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} stateId - ID of the state
     */
    deleteStateDefinition(processId: string, witRefName: string, stateId: string): Promise<void>;
    /**
     * Returns a state definition in the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} stateId - The ID of the state
     */
    getStateDefinition(processId: string, witRefName: string, stateId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateResultModel>;
    /**
     * Returns a list of all state definitions in the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    getStateDefinitions(processId: string, witRefName: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateResultModel[]>;
    /**
     * Hides a state definition in the work item type of the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.HideStateModel} hideStateModel
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} stateId - The ID of the state
     */
    hideStateDefinition(hideStateModel: WorkItemTrackingProcessDefinitionsInterfaces.HideStateModel, processId: string, witRefName: string, stateId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateResultModel>;
    /**
     * Updates a given state definition in the work item type of the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateInputModel} stateModel
     * @param {string} processId - ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} stateId - ID of the state
     */
    updateStateDefinition(stateModel: WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateInputModel, processId: string, witRefName: string, stateId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemStateResultModel>;
    /**
     * Adds a behavior to the work item type of the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeBehavior} behavior
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForBehaviors - Work item type reference name for the behavior
     */
    addBehaviorToWorkItemType(behavior: WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeBehavior, processId: string, witRefNameForBehaviors: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeBehavior>;
    /**
     * Returns a behavior for the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForBehaviors - Work item type reference name for the behavior
     * @param {string} behaviorRefName - The reference name of the behavior
     */
    getBehaviorForWorkItemType(processId: string, witRefNameForBehaviors: string, behaviorRefName: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeBehavior>;
    /**
     * Returns a list of all behaviors for the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForBehaviors - Work item type reference name for the behavior
     */
    getBehaviorsForWorkItemType(processId: string, witRefNameForBehaviors: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeBehavior[]>;
    /**
     * Removes a behavior for the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForBehaviors - Work item type reference name for the behavior
     * @param {string} behaviorRefName - The reference name of the behavior
     */
    removeBehaviorFromWorkItemType(processId: string, witRefNameForBehaviors: string, behaviorRefName: string): Promise<void>;
    /**
     * Updates a behavior for the work item type of the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeBehavior} behavior
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForBehaviors - Work item type reference name for the behavior
     */
    updateBehaviorToWorkItemType(behavior: WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeBehavior, processId: string, witRefNameForBehaviors: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeBehavior>;
    /**
     * Creates a work item type in the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeModel} workItemType
     * @param {string} processId - The ID of the process
     */
    createWorkItemType(workItemType: WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeModel, processId: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeModel>;
    /**
     * Removes a work itewm type in the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    deleteWorkItemType(processId: string, witRefName: string): Promise<void>;
    /**
     * Returns a work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.GetWorkItemTypeExpand} expand
     */
    getWorkItemType(processId: string, witRefName: string, expand?: WorkItemTrackingProcessDefinitionsInterfaces.GetWorkItemTypeExpand): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeModel>;
    /**
     * Returns a list of all work item types in the process.
     *
     * @param {string} processId - The ID of the process
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.GetWorkItemTypeExpand} expand
     */
    getWorkItemTypes(processId: string, expand?: WorkItemTrackingProcessDefinitionsInterfaces.GetWorkItemTypeExpand): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeModel[]>;
    /**
     * Updates a work item type of the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeUpdateModel} workItemTypeUpdate
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    updateWorkItemType(workItemTypeUpdate: WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeUpdateModel, processId: string, witRefName: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeModel>;
    /**
     * Adds a field to the work item type in the process.
     *
     * @param {WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeFieldModel} field
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForFields - Work item type reference name for the field
     */
    addFieldToWorkItemType(field: WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeFieldModel, processId: string, witRefNameForFields: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeFieldModel>;
    /**
     * Retuens a single field in the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForFields - Work item type reference name for fields
     * @param {string} fieldRefName - The reference name of the field
     */
    getWorkItemTypeField(processId: string, witRefNameForFields: string, fieldRefName: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeFieldModel>;
    /**
     * Returns a list of all fields in the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForFields - Work item type reference name for fields
     */
    getWorkItemTypeFields(processId: string, witRefNameForFields: string): Promise<WorkItemTrackingProcessDefinitionsInterfaces.WorkItemTypeFieldModel[]>;
    /**
     * Removes a field in the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefNameForFields - Work item type reference name for fields
     * @param {string} fieldRefName - The reference name of the field
     */
    removeFieldFromWorkItemType(processId: string, witRefNameForFields: string, fieldRefName: string): Promise<void>;
}
