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
 * @fileoverview Element locator functions for finding elements by various strategies.
 */

import * as classNameLocator from './strategies/className';
import * as cssLocator from './strategies/css';
import * as idLocator from './strategies/id';
import * as linkTextLocator from './strategies/linkText';
import * as nameLocator from './strategies/name';
import * as relativeLocator from './strategies/relative';
import * as tagNameLocator from './strategies/tagName';
import * as xpathLocator from './strategies/xpath';

/**
 * Type definition for a locator strategy.
 * Each strategy has a 'single' method to find one element and 'many' to find multiple.
 */
export interface LocatorStrategy {
    single: (selector: string, root: Document | Element) => Element | null;
    many: (selector: string, root: Document | Element) => Element[];
}

/**
 * Map of available locator strategies.
 * @private
 */
const STRATEGIES_: Record<string, LocatorStrategy> = {
    'className': classNameLocator as unknown as LocatorStrategy,
    'class name': classNameLocator as unknown as LocatorStrategy,

    'css': cssLocator as unknown as LocatorStrategy,
    'css selector': cssLocator as unknown as LocatorStrategy,

    'relative': relativeLocator as unknown as LocatorStrategy,

    'id': idLocator as unknown as LocatorStrategy,

    'linkText': {
        single: (selector, root) => linkTextLocator.single(selector, root),
        many: (selector, root) => linkTextLocator.many(selector, root),
    },
    'link text': {
        single: (selector, root) => linkTextLocator.single(selector, root),
        many: (selector, root) => linkTextLocator.many(selector, root),
    },

    'name': nameLocator as unknown as LocatorStrategy,

    'partialLinkText': {
        single: (selector, root) => linkTextLocator.singlePartial(selector, root),
        many: (selector, root) => linkTextLocator.manyPartial(selector, root),
    },
    'partial link text': {
        single: (selector, root) => linkTextLocator.singlePartial(selector, root),
        many: (selector, root) => linkTextLocator.manyPartial(selector, root),
    },

    'tagName': tagNameLocator as unknown as LocatorStrategy,
    'tag name': tagNameLocator as unknown as LocatorStrategy,

    'xpath': xpathLocator as unknown as LocatorStrategy,
};

/**
 * Add or override an existing strategy for locating elements.
 *
 * @param name The name of the strategy.
 * @param strategy The strategy to use.
 */
export function add(name: string, strategy: LocatorStrategy): void {
    STRATEGIES_[name] = strategy;
}

/**
 * Returns one key from an object that is not present in Object.prototype.
 *
 * @param target The object to pick a key from.
 * @returns The key or null if the object is empty.
 * @private
 */
function getOnlyKey(target: Record<string, unknown>): string | null {
    for (const k in target) {
        if (Object.prototype.hasOwnProperty.call(target, k)) {
            return k;
        }
    }
    return null;
}

/**
 * Find the first element in the DOM matching the target.
 * The target object should have a single key indicating the locator strategy.
 *
 * Example: {id: 'foo'} finds the first element with ID 'foo'.
 *
 * @param target The selector to search for.
 * @param optRoot The node from which to start the search (defaults to document).
 * @returns The first matching element, or null if not found.
 * @throws Error if the locator strategy is unsupported.
 */
export function findElement(
    target: Record<string, string>,
    optRoot?: Document | Element
): Element | null {
    const key = getOnlyKey(target);

    if (key) {
        const strategy = STRATEGIES_[key];
        if (strategy && typeof strategy.single === 'function') {
            const root = optRoot || document;
            const value = target[key];
            if (value !== undefined) {
                return strategy.single(value, root);
            }
        }
    }

    throw new Error(`Unsupported locator strategy: ${key}`);
}

/**
 * Find all elements in the DOM matching the target.
 * The target object should have a single key indicating the locator strategy.
 *
 * Example: {name: 'foo'} finds all elements with name attribute equal to 'foo'.
 *
 * @param target The selector to search for.
 * @param optRoot The node from which to start the search (defaults to document).
 * @returns An array of all matching elements.
 * @throws Error if the locator strategy is unsupported.
 */
export function findElements(
    target: Record<string, string>,
    optRoot?: Document | Element
): Element[] {
    const key = getOnlyKey(target);

    if (key) {
        const strategy = STRATEGIES_[key];
        if (strategy && typeof strategy.many === 'function') {
            const root = optRoot || document;
            const value = target[key];
            if (value !== undefined) {
                return strategy.many(value, root);
            }
        }
    }

    throw new Error(`Unsupported locator strategy: ${key}`);
}
