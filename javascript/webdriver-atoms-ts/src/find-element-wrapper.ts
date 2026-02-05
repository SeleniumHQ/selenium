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

import { findElements as findElementsByInjected } from './inject/find_element';
import * as relativeLocator from './locators/strategies/relative';

/**
 * Wrapper function for the find elements bundle.
 * Handles both standard locators (strategy/using format) and relative locators (RelativeBy format).
 * When used with execute_script, returns just the element array (not wrapped in a response object).
 */
(globalThis as any).__findElements__ = (locatorJson: any) => {
    try {
        // Parse if string
        const locator = typeof locatorJson === 'string' ? JSON.parse(locatorJson) : locatorJson;

        // Check if this is a RelativeBy locator
        if (locator && typeof locator === 'object' && 'relative' in locator) {
            // Use relative locator strategy
            const elements = relativeLocator.many(locator.relative, document);
            // When returning elements through execute_script, they are automatically wrapped by WebDriver
            // So we just need to return the element references
            return elements;
        } else if (locator && 'using' in locator && 'value' in locator) {
            // Standard WebDriver locator format (using, value)
            const responseStr = findElementsByInjected(locator.using, locator.value);
            const response = JSON.parse(responseStr);
            if (response.status === 0) {
                return response.value;
            } else {
                throw new Error(response.value?.message || 'Unknown error');
            }
        } else {
            throw new Error('Invalid locator format: must be either {using, value} or {relative: {root, filters}}');
        }
    } catch (e) {
        if (e instanceof Error) {
            throw e;
        }
        throw new Error(String(e));
    }
};
