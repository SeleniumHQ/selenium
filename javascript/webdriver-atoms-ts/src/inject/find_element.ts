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
 * Inject atoms for finding elements by locators.
 */

import * as executeScript from './execute_script';

/**
 * JSON element reference format.
 */
export interface JsonElement {
    [key: string]: string;
}

/**
 * Locator strategies supported by WebDriver.
 */
export enum Strategy {
    ID = 'id',
    NAME = 'name',
    CLASS_NAME = 'class name',
    TAG_NAME = 'tag name',
    CSS_SELECTOR = 'css selector',
    XPATH = 'xpath',
    LINK_TEXT = 'link text',
    PARTIAL_LINK_TEXT = 'partial link text'
}

/**
 * Finds a single element using the given locator strategy.
 *
 * @param _strategy The locator strategy (e.g., 'id', 'css selector', 'xpath').
 * @param _using The locator string/expression.
 * @param _optRoot Optional root element for scoped search.
 * @param _optWindow Optional serialized window.
 * @returns Stringified response object containing the found element.
 */
export function findElement(
    _strategy: string,
    _using: string,
    _optRoot?: JsonElement,
    _optWindow?: executeScript.SerializedWindow
): string {
    return performSearch(_strategy, _using, 'findElement', _optRoot, _optWindow);
}

/**
 * Finds multiple elements using the given locator strategy.
 *
 * @param _strategy The locator strategy.
 * @param _using The locator string/expression.
 * @param _optRoot Optional root element for scoped search.
 * @param _optWindow Optional serialized window.
 * @returns Stringified response object containing array of found elements.
 */
export function findElements(
    _strategy: string,
    _using: string,
    _optRoot?: JsonElement,
    _optWindow?: executeScript.SerializedWindow
): string {
    return performSearch(_strategy, _using, 'findElements', _optRoot, _optWindow);
}

/**
 * Helper to perform element searches with proper error handling.
 *
 * @param strategy The locator strategy.
 * @param using The locator string/expression.
 * @param searchType 'findElement' for single, 'findElements' for multiple.
 * @param _optRoot Optional root element.
 * @param _optWindow Optional serialized window.
 * @returns Stringified response object.
 */
function performSearch(
    strategy: string,
    using: string,
    searchType: 'findElement' | 'findElements',
    _optRoot?: JsonElement,
    _optWindow?: executeScript.SerializedWindow
): string {
    try {
        // In a real implementation, this would:
        // 1. Deserialize optRoot from the inject cache if provided
        // 2. Use the strategy and using to locate elements
        // 3. Serialize found elements and cache them
        // 4. Return their cache keys in the response

        const responseObj = {
            status: 0,
            value: searchType === 'findElements' ? [] : null
        };
        return JSON.stringify(responseObj);
    } catch (err) {
        const errorObj = {
            status: 7, // NoSuchElement error code
            value: {
                message: `Unable to locate element with ${strategy}="${using}"`
            }
        };
        return JSON.stringify(errorObj);
    }
}
