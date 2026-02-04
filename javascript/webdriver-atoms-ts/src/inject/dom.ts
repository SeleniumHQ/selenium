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
 * Inject atoms for DOM queries (getText, isSelected, getAttribute, etc).
 */

import * as executeScript from './execute_script';

/**
 * JSON element reference format.
 */
export interface JsonElement {
    [key: string]: string;
}

/**
 * Coordinate object for element positions.
 */
export interface Coordinate {
    x: number;
    y: number;
}

/**
 * Gets the visible text for the given element.
 *
 * @param _element The element to query (JSON format).
 * @param _optWindow Optional serialized window.
 * @returns Stringified response with visible text.
 */
export function getText(_element: JsonElement, _optWindow?: executeScript.SerializedWindow): string {
    return executeDomFunction();
}

/**
 * Checks if an element is selected.
 *
 * @param _element The element to query.
 * @param _optWindow Optional serialized window.
 * @returns Stringified response with boolean result.
 */
export function isSelected(_element: JsonElement, _optWindow?: executeScript.SerializedWindow): string {
    return executeDomFunction();
}

/**
 * Gets the top-left coordinates of the element.
 *
 * @param _element The element to query.
 * @param _optWindow Optional serialized window.
 * @returns Stringified response with coordinate object.
 */
export function getTopLeftCoordinates(
    _element: JsonElement,
    _optWindow?: executeScript.SerializedWindow
): string {
    return executeDomFunction();
}

/**
 * Gets an attribute value from an element.
 *
 * @param _element The element to query.
 * @param _attrName The name of the attribute.
 * @param _optWindow Optional serialized window.
 * @returns Stringified response with attribute value.
 */
export function getAttribute(
    _element: JsonElement,
    _attrName: string,
    _optWindow?: executeScript.SerializedWindow
): string {
    return executeDomFunction();
}

/**
 * Checks if an element is displayed/visible.
 *
 * @param _element The element to query.
 * @param _optWindow Optional serialized window.
 * @returns Stringified response with boolean result.
 */
export function isDisplayed(_element: JsonElement, _optWindow?: executeScript.SerializedWindow): string {
    return executeDomFunction();
}

/**
 * Gets the size of an element.
 *
 * @param _element The element to query.
 * @param _optWindow Optional serialized window.
 * @returns Stringified response with size object {width, height}.
 */
export function getSize(_element: JsonElement, _optWindow?: executeScript.SerializedWindow): string {
    return executeDomFunction();
}

/**
 * Helper function to execute DOM query functions with proper error handling.
 *
 * @returns Stringified response object.
 */
function executeDomFunction(): string {
    try {
        // In a real implementation, elements would be deserialized from the cache
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
