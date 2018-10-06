import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import WorkItemTrackingProcessInterfaces = require("./interfaces/WorkItemTrackingProcessInterfaces");
export interface IWorkItemTrackingProcessApi extends basem.ClientApiBase {
    getBehavior(processId: string, behaviorRefName: string, expand?: WorkItemTrackingProcessInterfaces.GetBehaviorsExpand): Promise<WorkItemTrackingProcessInterfaces.WorkItemBehavior>;
    getBehaviors(processId: string, expand?: WorkItemTrackingProcessInterfaces.GetBehaviorsExpand): Promise<WorkItemTrackingProcessInterfaces.WorkItemBehavior[]>;
    getFields(processId: string): Promise<WorkItemTrackingProcessInterfaces.FieldModel[]>;
    getWorkItemTypeFields(processId: string, witRefName: string): Promise<WorkItemTrackingProcessInterfaces.FieldModel[]>;
    createProcess(createRequest: WorkItemTrackingProcessInterfaces.CreateProcessModel): Promise<WorkItemTrackingProcessInterfaces.ProcessModel>;
    deleteProcess(processTypeId: string): Promise<void>;
    getProcessById(processTypeId: string, expand?: WorkItemTrackingProcessInterfaces.GetProcessExpandLevel): Promise<WorkItemTrackingProcessInterfaces.ProcessModel>;
    getProcesses(expand?: WorkItemTrackingProcessInterfaces.GetProcessExpandLevel): Promise<WorkItemTrackingProcessInterfaces.ProcessModel[]>;
    updateProcess(updateRequest: WorkItemTrackingProcessInterfaces.UpdateProcessModel, processTypeId: string): Promise<WorkItemTrackingProcessInterfaces.ProcessModel>;
    addWorkItemTypeRule(fieldRule: WorkItemTrackingProcessInterfaces.FieldRuleModel, processId: string, witRefName: string): Promise<WorkItemTrackingProcessInterfaces.FieldRuleModel>;
    deleteWorkItemTypeRule(processId: string, witRefName: string, ruleId: string): Promise<void>;
    getWorkItemTypeRule(processId: string, witRefName: string, ruleId: string): Promise<WorkItemTrackingProcessInterfaces.FieldRuleModel>;
    getWorkItemTypeRules(processId: string, witRefName: string): Promise<WorkItemTrackingProcessInterfaces.FieldRuleModel[]>;
    updateWorkItemTypeRule(fieldRule: WorkItemTrackingProcessInterfaces.FieldRuleModel, processId: string, witRefName: string, ruleId: string): Promise<WorkItemTrackingProcessInterfaces.FieldRuleModel>;
    getStateDefinition(processId: string, witRefName: string, stateId: string): Promise<WorkItemTrackingProcessInterfaces.WorkItemStateResultModel>;
    getStateDefinitions(processId: string, witRefName: string): Promise<WorkItemTrackingProcessInterfaces.WorkItemStateResultModel[]>;
    getWorkItemType(processId: string, witRefName: string, expand?: WorkItemTrackingProcessInterfaces.GetWorkItemTypeExpand): Promise<WorkItemTrackingProcessInterfaces.WorkItemTypeModel>;
    getWorkItemTypes(processId: string, expand?: WorkItemTrackingProcessInterfaces.GetWorkItemTypeExpand): Promise<WorkItemTrackingProcessInterfaces.WorkItemTypeModel[]>;
}
export declare class WorkItemTrackingProcessApi extends basem.ClientApiBase implements IWorkItemTrackingProcessApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
     * Returns a behavior of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} behaviorRefName - Reference name of the behavior
     * @param {WorkItemTrackingProcessInterfaces.GetBehaviorsExpand} expand
     */
    getBehavior(processId: string, behaviorRefName: string, expand?: WorkItemTrackingProcessInterfaces.GetBehaviorsExpand): Promise<WorkItemTrackingProcessInterfaces.WorkItemBehavior>;
    /**
     * Returns a list of all behaviors in the process.
     *
     * @param {string} processId - The ID of the process
     * @param {WorkItemTrackingProcessInterfaces.GetBehaviorsExpand} expand
     */
    getBehaviors(processId: string, expand?: WorkItemTrackingProcessInterfaces.GetBehaviorsExpand): Promise<WorkItemTrackingProcessInterfaces.WorkItemBehavior[]>;
    /**
     * Returns a list of all fields in a process.
     *
     * @param {string} processId - The ID of the process
     */
    getFields(processId: string): Promise<WorkItemTrackingProcessInterfaces.FieldModel[]>;
    /**
     * Returns a list of all fields in a work item type.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    getWorkItemTypeFields(processId: string, witRefName: string): Promise<WorkItemTrackingProcessInterfaces.FieldModel[]>;
    /**
     * Creates a process.
     *
     * @param {WorkItemTrackingProcessInterfaces.CreateProcessModel} createRequest
     */
    createProcess(createRequest: WorkItemTrackingProcessInterfaces.CreateProcessModel): Promise<WorkItemTrackingProcessInterfaces.ProcessModel>;
    /**
     * Removes a process of a specific ID.
     *
     * @param {string} processTypeId
     */
    deleteProcess(processTypeId: string): Promise<void>;
    /**
     * Returns a single process of a specified ID.
     *
     * @param {string} processTypeId
     * @param {WorkItemTrackingProcessInterfaces.GetProcessExpandLevel} expand
     */
    getProcessById(processTypeId: string, expand?: WorkItemTrackingProcessInterfaces.GetProcessExpandLevel): Promise<WorkItemTrackingProcessInterfaces.ProcessModel>;
    /**
     * Returns a list of all processes.
     *
     * @param {WorkItemTrackingProcessInterfaces.GetProcessExpandLevel} expand
     */
    getProcesses(expand?: WorkItemTrackingProcessInterfaces.GetProcessExpandLevel): Promise<WorkItemTrackingProcessInterfaces.ProcessModel[]>;
    /**
     * Updates a process of a specific ID.
     *
     * @param {WorkItemTrackingProcessInterfaces.UpdateProcessModel} updateRequest
     * @param {string} processTypeId
     */
    updateProcess(updateRequest: WorkItemTrackingProcessInterfaces.UpdateProcessModel, processTypeId: string): Promise<WorkItemTrackingProcessInterfaces.ProcessModel>;
    /**
     * Adds a rule to work item type in the process.
     *
     * @param {WorkItemTrackingProcessInterfaces.FieldRuleModel} fieldRule
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    addWorkItemTypeRule(fieldRule: WorkItemTrackingProcessInterfaces.FieldRuleModel, processId: string, witRefName: string): Promise<WorkItemTrackingProcessInterfaces.FieldRuleModel>;
    /**
     * Removes a rule from the work item type in the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} ruleId - The ID of the rule
     */
    deleteWorkItemTypeRule(processId: string, witRefName: string, ruleId: string): Promise<void>;
    /**
     * Returns a single rule in the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} ruleId - The ID of the rule
     */
    getWorkItemTypeRule(processId: string, witRefName: string, ruleId: string): Promise<WorkItemTrackingProcessInterfaces.FieldRuleModel>;
    /**
     * Returns a list of all rules in the work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    getWorkItemTypeRules(processId: string, witRefName: string): Promise<WorkItemTrackingProcessInterfaces.FieldRuleModel[]>;
    /**
     * Updates a rule in the work item type of the process.
     *
     * @param {WorkItemTrackingProcessInterfaces.FieldRuleModel} fieldRule
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} ruleId - The ID of the rule
     */
    updateWorkItemTypeRule(fieldRule: WorkItemTrackingProcessInterfaces.FieldRuleModel, processId: string, witRefName: string, ruleId: string): Promise<WorkItemTrackingProcessInterfaces.FieldRuleModel>;
    /**
     * Returns a single state definition in a work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {string} stateId - The ID of the state
     */
    getStateDefinition(processId: string, witRefName: string, stateId: string): Promise<WorkItemTrackingProcessInterfaces.WorkItemStateResultModel>;
    /**
     * Returns a list of all state definitions in a work item type of the process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     */
    getStateDefinitions(processId: string, witRefName: string): Promise<WorkItemTrackingProcessInterfaces.WorkItemStateResultModel[]>;
    /**
     * Returns a single work item type in a process.
     *
     * @param {string} processId - The ID of the process
     * @param {string} witRefName - The reference name of the work item type
     * @param {WorkItemTrackingProcessInterfaces.GetWorkItemTypeExpand} expand
     */
    getWorkItemType(processId: string, witRefName: string, expand?: WorkItemTrackingProcessInterfaces.GetWorkItemTypeExpand): Promise<WorkItemTrackingProcessInterfaces.WorkItemTypeModel>;
    /**
     * Returns a list of all work item types in a process.
     *
     * @param {string} processId - The ID of the process
     * @param {WorkItemTrackingProcessInterfaces.GetWorkItemTypeExpand} expand
     */
    getWorkItemTypes(processId: string, expand?: WorkItemTrackingProcessInterfaces.GetWorkItemTypeExpand): Promise<WorkItemTrackingProcessInterfaces.WorkItemTypeModel[]>;
}
