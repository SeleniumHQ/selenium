/// <reference types="node" />
import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import TaskAgentInterfaces = require("./interfaces/TaskAgentInterfaces");
import VSSInterfaces = require("./interfaces/common/VSSInterfaces");
export interface ITaskApi extends basem.ClientApiBase {
    getPlanAttachments(scopeIdentifier: string, hubName: string, planId: string, type: string): Promise<TaskAgentInterfaces.TaskAttachment[]>;
    createAttachment(customHeaders: any, contentStream: NodeJS.ReadableStream, scopeIdentifier: string, hubName: string, planId: string, timelineId: string, recordId: string, type: string, name: string): Promise<TaskAgentInterfaces.TaskAttachment>;
    getAttachment(scopeIdentifier: string, hubName: string, planId: string, timelineId: string, recordId: string, type: string, name: string): Promise<TaskAgentInterfaces.TaskAttachment>;
    getAttachmentContent(scopeIdentifier: string, hubName: string, planId: string, timelineId: string, recordId: string, type: string, name: string): Promise<NodeJS.ReadableStream>;
    getAttachments(scopeIdentifier: string, hubName: string, planId: string, timelineId: string, recordId: string, type: string): Promise<TaskAgentInterfaces.TaskAttachment[]>;
    appendTimelineRecordFeed(lines: VSSInterfaces.VssJsonCollectionWrapperV<string[]>, scopeIdentifier: string, hubName: string, planId: string, timelineId: string, recordId: string): Promise<void>;
    appendLogContent(customHeaders: any, contentStream: NodeJS.ReadableStream, scopeIdentifier: string, hubName: string, planId: string, logId: number): Promise<TaskAgentInterfaces.TaskLog>;
    createLog(log: TaskAgentInterfaces.TaskLog, scopeIdentifier: string, hubName: string, planId: string): Promise<TaskAgentInterfaces.TaskLog>;
    getLog(scopeIdentifier: string, hubName: string, planId: string, logId: number, startLine?: number, endLine?: number): Promise<string[]>;
    getLogs(scopeIdentifier: string, hubName: string, planId: string): Promise<TaskAgentInterfaces.TaskLog[]>;
    getQueuedPlanGroups(scopeIdentifier: string, hubName: string, statusFilter?: TaskAgentInterfaces.PlanGroupStatusFilter, count?: number): Promise<TaskAgentInterfaces.TaskOrchestrationQueuedPlanGroup[]>;
    getPlan(scopeIdentifier: string, hubName: string, planId: string): Promise<TaskAgentInterfaces.TaskOrchestrationPlan>;
    getRecords(scopeIdentifier: string, hubName: string, planId: string, timelineId: string, changeId?: number): Promise<TaskAgentInterfaces.TimelineRecord[]>;
    updateRecords(records: VSSInterfaces.VssJsonCollectionWrapperV<TaskAgentInterfaces.TimelineRecord[]>, scopeIdentifier: string, hubName: string, planId: string, timelineId: string): Promise<TaskAgentInterfaces.TimelineRecord[]>;
    createTimeline(timeline: TaskAgentInterfaces.Timeline, scopeIdentifier: string, hubName: string, planId: string): Promise<TaskAgentInterfaces.Timeline>;
    deleteTimeline(scopeIdentifier: string, hubName: string, planId: string, timelineId: string): Promise<void>;
    getTimeline(scopeIdentifier: string, hubName: string, planId: string, timelineId: string, changeId?: number, includeRecords?: boolean): Promise<TaskAgentInterfaces.Timeline>;
    getTimelines(scopeIdentifier: string, hubName: string, planId: string): Promise<TaskAgentInterfaces.Timeline[]>;
}
export declare class TaskApi extends basem.ClientApiBase implements ITaskApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     * @param {string} type
     */
    getPlanAttachments(scopeIdentifier: string, hubName: string, planId: string, type: string): Promise<TaskAgentInterfaces.TaskAttachment[]>;
    /**
     * @param {NodeJS.ReadableStream} contentStream - Content to upload
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     * @param {string} timelineId
     * @param {string} recordId
     * @param {string} type
     * @param {string} name
     */
    createAttachment(customHeaders: any, contentStream: NodeJS.ReadableStream, scopeIdentifier: string, hubName: string, planId: string, timelineId: string, recordId: string, type: string, name: string): Promise<TaskAgentInterfaces.TaskAttachment>;
    /**
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     * @param {string} timelineId
     * @param {string} recordId
     * @param {string} type
     * @param {string} name
     */
    getAttachment(scopeIdentifier: string, hubName: string, planId: string, timelineId: string, recordId: string, type: string, name: string): Promise<TaskAgentInterfaces.TaskAttachment>;
    /**
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     * @param {string} timelineId
     * @param {string} recordId
     * @param {string} type
     * @param {string} name
     */
    getAttachmentContent(scopeIdentifier: string, hubName: string, planId: string, timelineId: string, recordId: string, type: string, name: string): Promise<NodeJS.ReadableStream>;
    /**
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     * @param {string} timelineId
     * @param {string} recordId
     * @param {string} type
     */
    getAttachments(scopeIdentifier: string, hubName: string, planId: string, timelineId: string, recordId: string, type: string): Promise<TaskAgentInterfaces.TaskAttachment[]>;
    /**
     * @param {VSSInterfaces.VssJsonCollectionWrapperV<string[]>} lines
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     * @param {string} timelineId
     * @param {string} recordId
     */
    appendTimelineRecordFeed(lines: VSSInterfaces.VssJsonCollectionWrapperV<string[]>, scopeIdentifier: string, hubName: string, planId: string, timelineId: string, recordId: string): Promise<void>;
    /**
     * @param {NodeJS.ReadableStream} contentStream - Content to upload
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     * @param {number} logId
     */
    appendLogContent(customHeaders: any, contentStream: NodeJS.ReadableStream, scopeIdentifier: string, hubName: string, planId: string, logId: number): Promise<TaskAgentInterfaces.TaskLog>;
    /**
     * @param {TaskAgentInterfaces.TaskLog} log
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     */
    createLog(log: TaskAgentInterfaces.TaskLog, scopeIdentifier: string, hubName: string, planId: string): Promise<TaskAgentInterfaces.TaskLog>;
    /**
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     * @param {number} logId
     * @param {number} startLine
     * @param {number} endLine
     */
    getLog(scopeIdentifier: string, hubName: string, planId: string, logId: number, startLine?: number, endLine?: number): Promise<string[]>;
    /**
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     */
    getLogs(scopeIdentifier: string, hubName: string, planId: string): Promise<TaskAgentInterfaces.TaskLog[]>;
    /**
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {TaskAgentInterfaces.PlanGroupStatusFilter} statusFilter
     * @param {number} count
     */
    getQueuedPlanGroups(scopeIdentifier: string, hubName: string, statusFilter?: TaskAgentInterfaces.PlanGroupStatusFilter, count?: number): Promise<TaskAgentInterfaces.TaskOrchestrationQueuedPlanGroup[]>;
    /**
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     */
    getPlan(scopeIdentifier: string, hubName: string, planId: string): Promise<TaskAgentInterfaces.TaskOrchestrationPlan>;
    /**
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     * @param {string} timelineId
     * @param {number} changeId
     */
    getRecords(scopeIdentifier: string, hubName: string, planId: string, timelineId: string, changeId?: number): Promise<TaskAgentInterfaces.TimelineRecord[]>;
    /**
     * @param {VSSInterfaces.VssJsonCollectionWrapperV<TaskAgentInterfaces.TimelineRecord[]>} records
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     * @param {string} timelineId
     */
    updateRecords(records: VSSInterfaces.VssJsonCollectionWrapperV<TaskAgentInterfaces.TimelineRecord[]>, scopeIdentifier: string, hubName: string, planId: string, timelineId: string): Promise<TaskAgentInterfaces.TimelineRecord[]>;
    /**
     * @param {TaskAgentInterfaces.Timeline} timeline
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     */
    createTimeline(timeline: TaskAgentInterfaces.Timeline, scopeIdentifier: string, hubName: string, planId: string): Promise<TaskAgentInterfaces.Timeline>;
    /**
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     * @param {string} timelineId
     */
    deleteTimeline(scopeIdentifier: string, hubName: string, planId: string, timelineId: string): Promise<void>;
    /**
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     * @param {string} timelineId
     * @param {number} changeId
     * @param {boolean} includeRecords
     */
    getTimeline(scopeIdentifier: string, hubName: string, planId: string, timelineId: string, changeId?: number, includeRecords?: boolean): Promise<TaskAgentInterfaces.Timeline>;
    /**
     * @param {string} scopeIdentifier - The project GUID to scope the request
     * @param {string} hubName - The name of the server hub: "build" for the Build server or "rm" for the Release Management server
     * @param {string} planId
     */
    getTimelines(scopeIdentifier: string, hubName: string, planId: string): Promise<TaskAgentInterfaces.Timeline[]>;
}
