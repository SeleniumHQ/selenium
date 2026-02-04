// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview WebDriver atoms inject module.
 *
 * Provides utilities for executing scripts in the context of the web page
 * under test, with support for serialized window objects and result
 * handling.
 */

import * as inject from '../../atoms-ts/src/inject';
import { stringify } from '../../atoms-ts/src/json';
import { ResponseObject } from '../../atoms-ts/src/response';
import { ErrorCode } from '../../atoms-ts/src/error';

/**
 * JSON representation of a Window object.
 */
export interface JsonWindow {
    WINDOW: string;
}

/**
 * Wrapper to allow passing a serialized window object to executeScript.
 *
 * @param fn The function to execute (string or Function).
 * @param args Array of arguments to pass to fn.
 * @param optWindow The serialized window object to be read from the cache.
 * @returns The response object, serialized and returned in string format.
 */
export function executeScript(
    fn: string | Function,
    args: Array<any>,
    optWindow?: JsonWindow
): string {
    const win = getWindow(optWindow);
    const result = inject.executeScript(fn, args, true, win);
    return result as string;
}

/**
 * Wrapper to allow passing a serialized window object to executeAsyncScript.
 *
 * @param fn The function to execute (string or Function).
 * @param args Array of arguments to pass to fn.
 * @param timeout The timeout to wait up to in milliseconds.
 * @param onDone The function to call when the given fn invokes its callback,
 *     or when an exception or timeout occurs.
 * @param optWindow The serialized window object to be read from the cache.
 */
export function executeAsyncScript(
    fn: string | Function,
    args: Array<any>,
    timeout: number,
    onDone: (response: ResponseObject) => void,
    optWindow?: JsonWindow
): void {
    const win = getWindow(optWindow);
    const wrappedOnDone = (response: ResponseObject) => {
        onDone(response);
    };
    inject.executeAsyncScript(fn, args, timeout, wrappedOnDone, optWindow ? win : undefined);
}

/**
 * Decodes a serialized {WINDOW: string} object using the current document's
 * cache.
 *
 * @param optWindow The serialized window object to be read from the cache.
 *     If undefined, this function will trivially return the current window.
 * @returns A reference to a window.
 * @throws If the serialized window cannot be found in the current document's cache.
 */
export function getWindow(optWindow?: JsonWindow): Window {
    let win: Window;
    if (optWindow) {
        win = inject.cache.getElement(optWindow.WINDOW, document) as Window;
    } else {
        win = window;
    }
    return win;
}

/**
 * Converts a response object to a serialized string format.
 *
 * @param response The response object to serialize.
 * @returns The stringified response.
 */
export function serializeResponse(response: ResponseObject): string {
    return stringify(response);
}

/**
 * Creates a successful response with a result value.
 *
 * @param result The result value.
 * @returns A serialized ResponseObject with success status.
 */
export function success(result?: any): string {
    const response: ResponseObject = {
        status: ErrorCode.SUCCESS,
        value: result,
    };
    return stringify(response);
}

/**
 * Creates a response indicating an error occurred.
 *
 * @param error The error message or object.
 * @param statusCode Optional HTTP-like status code.
 * @returns A serialized ResponseObject with error status.
 */
export function error(error: any, statusCode?: number): string {
    const response: ResponseObject = {
        status: statusCode || ErrorCode.UNKNOWN_ERROR,
        value: {
            message: typeof error === 'string' ? error : String(error),
        },
    };
    return stringify(response);
}
