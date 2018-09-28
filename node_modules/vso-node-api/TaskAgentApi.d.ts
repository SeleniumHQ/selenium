/// <reference types="node" />
import taskagentbasem = require('./TaskAgentApiBase');
import TaskAgentInterfaces = require("./interfaces/TaskAgentInterfaces");
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
export interface ITaskAgentApi extends taskagentbasem.ITaskAgentApiBase {
    uploadTaskDefinition(customHeaders: VsoBaseInterfaces.IHeaders, contentStream: NodeJS.ReadableStream, taskId: string, overwrite: boolean): Promise<void>;
}
export declare class TaskAgentApi extends taskagentbasem.TaskAgentApiBase implements ITaskAgentApi {
    private _handlers;
    private _options;
    private _fallbackClient;
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
     * @param {string} taskId
     * @param onResult callback function
     */
    deleteTaskDefinition(taskId: string): Promise<void>;
    /**
     * @param {string} taskId
     * @param {string} versionString
     * @param {string[]} visibility
     * @param {boolean} scopeLocal
     * @param onResult callback function with the resulting ArrayBuffer
     */
    getTaskContentZip(taskId: string, versionString: string, visibility: string[], scopeLocal: boolean): Promise<NodeJS.ReadableStream>;
    /**
     * @param {string} taskId
     * @param {string} versionString
     * @param {string[]} visibility
     * @param {boolean} scopeLocal
     * @param onResult callback function with the resulting TaskAgentInterfaces.TaskDefinition
     */
    getTaskDefinition(taskId: string, versionString: string, visibility: string[], scopeLocal: boolean): Promise<TaskAgentInterfaces.TaskDefinition>;
    /**
     * @param {string} taskId
     * @param {string[]} visibility
     * @param {boolean} scopeLocal
     * @param onResult callback function with the resulting TaskAgentInterfaces.TaskDefinition[]
     */
    getTaskDefinitions(taskId: string, visibility: string[], scopeLocal: boolean): Promise<TaskAgentInterfaces.TaskDefinition[]>;
    /**
     * @param {NodeJS.ReadableStream} contentStream
     * @param {string} taskId
     * @param {boolean} overwrite
     * @param onResult callback function
     */
    uploadTaskDefinition(customHeaders: VsoBaseInterfaces.IHeaders, contentStream: NodeJS.ReadableStream, taskId: string, overwrite: boolean): Promise<void>;
    private _getFallbackClient(baseUrl);
    private _getAccountUrl(collectionUrl);
}
