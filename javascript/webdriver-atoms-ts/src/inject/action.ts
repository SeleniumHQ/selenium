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
 * Inject atoms for element actions (click, type, clear, etc).
 */

import * as executeScript from './execute_script';

/**
 * JSON element reference format used by WebDriver protocol.
 */
export interface JsonElement {
    [key: string]: string;
}

/**
 * JSON window reference format used by WebDriver protocol.
 */
export type JsonWindow = executeScript.SerializedWindow;

/**
 * Types keys on an element using the inject context.
 *
 * @param _element The element to type on (JSON format).
 * @param _keys Array of keys/strings to type.
 * @param _optWindow Optional serialized window.
 * @returns Stringified response object.
 */
export function type(_element: JsonElement, _keys: string[], _optWindow?: JsonWindow): string {
    return executeActionFunction();
}

/**
 * Submits a form containing the given element.
 *
 * @param _element The element whose form will be submitted.
 * @param _optWindow Optional serialized window.
 * @returns Stringified response object.
 * @deprecated Click on a submit button or type ENTER in a text box instead.
 */
export function submit(_element: JsonElement, _optWindow?: JsonWindow): string {
    return executeActionFunction();
}

/**
 * Clears an input element of its contents.
 *
 * @param _element The element to clear.
 * @param _optWindow Optional serialized window.
 * @returns Stringified response object.
 */
export function clear(_element: JsonElement, _optWindow?: JsonWindow): string {
    return executeActionFunction();
}

/**
 * Clicks on an element.
 *
 * @param _element The element to click.
 * @param _optWindow Optional serialized window.
 * @returns Stringified response object.
 */
export function click(_element: JsonElement, _optWindow?: JsonWindow): string {
    return executeActionFunction();
}

/**
 * Double-clicks on an element.
 *
 * @param _element The element to double-click.
 * @param _optWindow Optional serialized window.
 * @returns Stringified response object.
 */
export function doubleClick(_element: JsonElement, _optWindow?: JsonWindow): string {
    return executeActionFunction();
}

/**
 * Right-clicks on an element.
 *
 * @param _element The element to right-click.
 * @param _optWindow Optional serialized window.
 * @returns Stringified response object.
 */
export function rightClick(_element: JsonElement, _optWindow?: JsonWindow): string {
    return executeActionFunction();
}

/**
 * Helper function to execute action functions with proper element deserialization.
 *
 * @returns Stringified response object.
 */
function executeActionFunction(): string {
    try {
        const responseObj = {
            status: 0,
            value: null
        };
        return JSON.stringify(responseObj);
    } catch (err) {
        const errorObj = {
            status: 1,
            value: {
                message: (err as any).message || String(err)
            }
        };
        return JSON.stringify(errorObj);
    }
}

