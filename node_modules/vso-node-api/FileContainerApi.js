"use strict";
/*
* ---------------------------------------------------------
* Copyright(C) Microsoft Corporation. All rights reserved.
* ---------------------------------------------------------
*
* ---------------------------------------------------------
* Generated file, DO NOT EDIT
* ---------------------------------------------------------
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Licensed under the MIT license.  See LICENSE file in the project root for full license information.
const stream = require("stream");
const zlib = require("zlib");
const httpm = require("typed-rest-client//HttpClient");
const FileContainerApiBase = require("./FileContainerApiBase");
const FileContainerInterfaces = require("./interfaces/FileContainerInterfaces");
class FileContainerApi extends FileContainerApiBase.FileContainerApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, options);
    }
    /**
     * @param {number} containerId
     * @param {string} scope
     * @param {string} itemPath
     * @param {string} downloadFileName
     */
    getItem(containerId, scope, itemPath, downloadFileName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    containerId: containerId
                };
                let queryValues = {
                    scope: scope,
                    itemPath: itemPath,
                    '$format': "OctetStream",
                    downloadFileName: downloadFileName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.0-preview.4", "Container", "e4f5c81e-e250-447b-9fef-bd48471bea5e", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/octet-stream', verData.apiVersion);
                    let res = yield this.http.get(url);
                    let rres = {};
                    let statusCode = res.message.statusCode;
                    rres.statusCode = statusCode;
                    // not found leads to null obj returned
                    if (statusCode == httpm.HttpCodes.NotFound) {
                        resolve(rres);
                    }
                    if (statusCode > 299) {
                        let msg;
                        // if exception/error in body, attempt to get better error
                        let contents = yield res.readBody();
                        let obj;
                        if (contents && contents.length > 0) {
                            obj = JSON.parse(contents);
                            if (options && options.responseProcessor) {
                                rres.result = options.responseProcessor(obj);
                            }
                            else {
                                rres.result = obj;
                            }
                        }
                        if (obj && obj.message) {
                            msg = obj.message;
                        }
                        else {
                            msg = "Failed request: (" + statusCode + ") " + res.message.url;
                        }
                        reject(new Error(msg));
                    }
                    else {
                        // if the response is gzipped, unzip it
                        if (res.message.headers["content-encoding"] === "gzip") {
                            let unzipStream = zlib.createGunzip();
                            res.message.pipe(unzipStream);
                            rres.result = unzipStream;
                        }
                        else {
                            rres.result = res.message;
                        }
                        resolve(rres);
                    }
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    createItem(contentStream, uncompressedLength, containerId, itemPath, scope, options) {
        return new Promise((resolve, reject) => {
            let chunkStream = new ChunkStream(this, uncompressedLength, containerId, itemPath, scope, options);
            chunkStream.on('finish', () => {
                resolve(chunkStream.getItem());
            });
            contentStream.pipe(chunkStream);
        });
    }
    // used by ChunkStream
    _createItem(customHeaders, contentStream, containerId, itemPath, scope, onResult) {
        var routeValues = {
            containerId: containerId
        };
        var queryValues = {
            itemPath: itemPath,
            scope: scope,
        };
        customHeaders = customHeaders || {};
        customHeaders["Content-Type"] = "";
        this.vsoClient.getVersioningData("4.0-preview.4", "Container", "e4f5c81e-e250-447b-9fef-bd48471bea5e", routeValues, queryValues)
            .then((versioningData) => {
            var url = versioningData.requestUrl;
            var serializationData = { responseTypeMetadata: FileContainerInterfaces.TypeInfo.FileContainerItem, responseIsCollection: false };
            let options = this.createRequestOptions('application/octet-stream', versioningData.apiVersion);
            options.additionalHeaders = customHeaders;
            this.rest.uploadStream('PUT', url, contentStream, options)
                .then((res) => {
                let ret = this.formatResponse(res.result, FileContainerInterfaces.TypeInfo.FileContainerItem, false);
                onResult(null, res.statusCode, ret);
            })
                .catch((err) => {
                onResult(err, err.statusCode, null);
            });
        }, (error) => {
            onResult(error, error.statusCode, null);
        });
    }
}
exports.FileContainerApi = FileContainerApi;
class ChunkStream extends stream.Writable {
    constructor(api, uncompressedLength, containerId, itemPath, scope, options) {
        super();
        this._buffer = new Buffer(ChunkStream.ChunkSize);
        this._length = 0;
        this._startRange = 0;
        this._bytesToSend = 0;
        this._totalReceived = 0;
        this._api = api;
        this._options = options || {};
        this._uncompressedLength = uncompressedLength;
        this._containerId = containerId;
        this._itemPath = itemPath;
        this._scope = scope;
        this._bytesToSend = this._options.isGzipped ? this._options.compressedLength : uncompressedLength;
    }
    _write(data, encoding, callback) {
        let chunk = data;
        if (!chunk) {
            if (this._length == 0) {
                callback();
            }
            else {
                // last chunk
                this._sendChunk(callback);
            }
            return;
        }
        let newBuffer = null;
        if (this._length + chunk.length > ChunkStream.ChunkSize) {
            // overflow
            let overflowPosition = chunk.length - (ChunkStream.ChunkSize - this._length);
            chunk.copy(this._buffer, this._length, 0, overflowPosition);
            this._length += overflowPosition;
            newBuffer = chunk.slice(overflowPosition);
        }
        else {
            chunk.copy(this._buffer, this._length, 0, chunk.length);
            this._length += chunk.length;
        }
        this._totalReceived += chunk.length;
        if (this._length >= ChunkStream.ChunkSize || this._totalReceived >= this._bytesToSend) {
            this._sendChunk(callback, newBuffer);
        }
        else {
            callback();
        }
    }
    _sendChunk(callback, newBuffer) {
        let endRange = this._startRange + this._length;
        let headers = {
            "Content-Range": "bytes " + this._startRange + "-" + (endRange - 1) + "/" + this._bytesToSend,
            "Content-Length": this._length
        };
        if (this._options.isGzipped) {
            headers["Accept-Encoding"] = "gzip";
            headers["Content-Encoding"] = "gzip";
            headers["x-tfs-filelength"] = this._uncompressedLength;
        }
        this._startRange = endRange;
        this._api._createItem(headers, new BufferStream(this._buffer, this._length), this._containerId, this._itemPath, this._scope, (err, statusCode, item) => {
            if (newBuffer) {
                this._length = newBuffer.length;
                newBuffer.copy(this._buffer);
            }
            else {
                this._length = 0;
            }
            this._item = item;
            callback(err);
        });
    }
    getItem() {
        return this._item;
    }
}
ChunkStream.ChunkSize = (16 * 1024 * 1024);
class BufferStream extends stream.Readable {
    constructor(buffer, length) {
        super();
        this._position = 0;
        this._length = 0;
        this._buffer = buffer;
        this._length = length;
    }
    _read(size) {
        if (this._position >= this._length) {
            this.push(null);
            return;
        }
        let end = Math.min(this._position + size, this._length);
        this.push(this._buffer.slice(this._position, end));
        this._position = end;
    }
}
