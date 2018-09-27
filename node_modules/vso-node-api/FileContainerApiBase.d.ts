import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import FileContainerInterfaces = require("./interfaces/FileContainerInterfaces");
import VSSInterfaces = require("./interfaces/common/VSSInterfaces");
export interface IFileContainerApiBase extends basem.ClientApiBase {
    createItems(items: VSSInterfaces.VssJsonCollectionWrapperV<FileContainerInterfaces.FileContainerItem[]>, containerId: number, scope?: string): Promise<FileContainerInterfaces.FileContainerItem[]>;
    deleteItem(containerId: number, itemPath: string, scope?: string): Promise<void>;
    getContainers(scope?: string, artifactUris?: string): Promise<FileContainerInterfaces.FileContainer[]>;
    getItems(containerId: number, scope?: string, itemPath?: string, metadata?: boolean, format?: string, downloadFileName?: string, includeDownloadTickets?: boolean, isShallow?: boolean): Promise<FileContainerInterfaces.FileContainerItem[]>;
}
export declare class FileContainerApiBase extends basem.ClientApiBase implements IFileContainerApiBase {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
     * Creates the specified items in in the referenced container.
     *
     * @param {VSSInterfaces.VssJsonCollectionWrapperV<FileContainerInterfaces.FileContainerItem[]>} items
     * @param {number} containerId
     * @param {string} scope - A guid representing the scope of the container. This is often the project id.
     */
    createItems(items: VSSInterfaces.VssJsonCollectionWrapperV<FileContainerInterfaces.FileContainerItem[]>, containerId: number, scope?: string): Promise<FileContainerInterfaces.FileContainerItem[]>;
    /**
     * Deletes the specified items in a container.
     *
     * @param {number} containerId - Container Id.
     * @param {string} itemPath - Path to delete.
     * @param {string} scope - A guid representing the scope of the container. This is often the project id.
     */
    deleteItem(containerId: number, itemPath: string, scope?: string): Promise<void>;
    /**
     * Gets containers filtered by a comma separated list of artifact uris within the same scope, if not specified returns all containers
     *
     * @param {string} scope - A guid representing the scope of the container. This is often the project id.
     * @param {string} artifactUris
     */
    getContainers(scope?: string, artifactUris?: string): Promise<FileContainerInterfaces.FileContainer[]>;
    /**
     * @param {number} containerId
     * @param {string} scope
     * @param {string} itemPath
     * @param {boolean} metadata
     * @param {string} format
     * @param {string} downloadFileName
     * @param {boolean} includeDownloadTickets
     * @param {boolean} isShallow
     */
    getItems(containerId: number, scope?: string, itemPath?: string, metadata?: boolean, format?: string, downloadFileName?: string, includeDownloadTickets?: boolean, isShallow?: boolean): Promise<FileContainerInterfaces.FileContainerItem[]>;
}
