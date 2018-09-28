/// <reference types="node" />
import * as restm from 'typed-rest-client/RestClient';
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import FileContainerApiBase = require("./FileContainerApiBase");
import FileContainerInterfaces = require("./interfaces/FileContainerInterfaces");
export interface IFileContainerApi extends FileContainerApiBase.IFileContainerApiBase {
    createItem(contentStream: NodeJS.ReadableStream, uncompressedLength: number, containerId: number, itemPath: string, scope: string, options: any): Promise<FileContainerInterfaces.FileContainerItem>;
    getItem(containerId: number, scope?: string, itemPath?: string, downloadFileName?: string): Promise<restm.IRestResponse<NodeJS.ReadableStream>>;
}
export declare class FileContainerApi extends FileContainerApiBase.FileContainerApiBase implements IFileContainerApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
     * @param {number} containerId
     * @param {string} scope
     * @param {string} itemPath
     * @param {string} downloadFileName
     */
    getItem(containerId: number, scope?: string, itemPath?: string, downloadFileName?: string): Promise<restm.IRestResponse<NodeJS.ReadableStream>>;
    createItem(contentStream: NodeJS.ReadableStream, uncompressedLength: number, containerId: number, itemPath: string, scope: string, options: any): Promise<FileContainerInterfaces.FileContainerItem>;
    _createItem(customHeaders: VsoBaseInterfaces.IHeaders, contentStream: NodeJS.ReadableStream, containerId: number, itemPath: string, scope: string, onResult: (err: any, statusCode: number, Container: FileContainerInterfaces.FileContainerItem) => void): void;
}
