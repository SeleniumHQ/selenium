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
 * Element cache for storing references during a single script execution.
 * Maps cache keys to DOM elements.
 */
const elementCache = new Map<string, Element>();
let cacheKeyCounter = 0;

/**
 * Cache key constants to match WebDriver protocol.
 */
const ELEMENT_KEY = 'element-6066-11e4-a52e-4f735466cecf';

/**
 * Stores an element in the cache and returns its key.
 *
 * @param element The element to cache.
 * @returns A unique cache key for the element.
 */
function cacheElement(element: Element): string {
    const key = String(cacheKeyCounter++);
    elementCache.set(key, element);
    return key;
}

/**
 * Retrieves a cached element by its key.
 *
 * @param key The cache key.
 * @param doc The document context (used for validation).
 * @returns The cached element.
 * @throws If the element is not found or is stale.
 */
function getCachedElement(key: string, doc: Document): Element {
    const element = elementCache.get(key);
    if (!element || element.ownerDocument !== doc) {
        throw new Error(`Element with id ${key} is not found; either the element is no longer attached to the DOM, or the page has been refreshed`);
    }
    // Check if element is still in the DOM
    if (!doc.body?.contains(element)) {
        throw new Error(`Element with id ${key} is not in the current document`);
    }
    return element;
}

/**
 * Locates elements using the given strategy and locator string.
 *
 * @param strategy The locator strategy (id, name, class name, tag name, css selector, xpath, link text, partial link text).
 * @param using The locator string/expression.
 * @param root The root element to search from (usually document or a specific element).
 * @returns An array of found elements, or a single element, or null.
 * @throws If the locator strategy is invalid or the search fails.
 */
function locateElements(
    strategy: string,
    using: string,
    root: Document | Element
): Element | Element[] | null {
    const searchRoot = root instanceof Document ? root.documentElement : root;

    switch (strategy) {
        case 'id':
            return root instanceof Document
                ? root.getElementById(using) || null
                : (root.querySelector(`#${CSS.escape(using)}`) || null);

        case 'name': {
            const nameElements = root instanceof Document
                ? root.getElementsByName(using)
                : (root as Element).querySelectorAll(`[name="${CSS.escape(using)}"]`);
            return Array.from(nameElements);
        }

        case 'class name':
            return Array.from((searchRoot as Element).getElementsByClassName(using));

        case 'tag name':
            return Array.from((searchRoot as Element).getElementsByTagName(using));

        case 'css selector':
            return Array.from((searchRoot as Element).querySelectorAll(using));

        case 'xpath':
            return evaluateXPath(using, root);

        case 'link text':
            return findLinksByText(using, searchRoot, false);

        case 'partial link text':
            return findLinksByText(using, searchRoot, true);

        default:
            throw new Error(`Unsupported locator strategy: ${strategy}`);
    }
}

/**
 * Evaluates an XPath expression.
 *
 * @param xpath The XPath expression.
 * @param context The context node.
 * @returns Array of matching elements.
 */
function evaluateXPath(xpath: string, context: Document | Element): Element[] {
    const doc = context instanceof Document ? context : context.ownerDocument;

    try {
        const result = doc.evaluate(
            xpath,
            context instanceof Document ? doc : context,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
        const elements: Element[] = [];
        for (let i = 0; i < result.snapshotLength; i++) {
            const node = result.snapshotItem(i);
            if (node?.nodeType === Node.ELEMENT_NODE) {
                elements.push(node as Element);
            }
        }
        return elements;
    } catch (e) {
        throw new Error(`Invalid XPath selector: ${xpath}`);
    }
}

/**
 * Finds link elements by their text content.
 *
 * @param text The text to search for.
 * @param root The root element.
 * @param partial If true, matches partial text.
 * @returns Array of matching link elements.
 */
function findLinksByText(text: string, root: Element, partial: boolean): Element[] {
    const links = Array.from(root.getElementsByTagName('a'));
    return links.filter(link => {
        const linkText = link.textContent || '';
        return partial ? linkText.includes(text) : linkText.trim() === text;
    });
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
        // Step 1: Determine the target window and root element
        const targetDoc = document;

        // Step 2: Deserialize optRoot from the inject cache if provided
        let root: Document | Element = targetDoc;
        if (_optRoot && ELEMENT_KEY in _optRoot) {
            const cachedKey = _optRoot[ELEMENT_KEY];
            if (cachedKey) {
                root = getCachedElement(cachedKey, targetDoc);
            }
        }

        // Step 3: Use the strategy and using to locate elements
        const found = locateElements(strategy, using, root);

        // Step 4: Serialize found elements and cache them, return their cache keys
        let value: any;
        if (searchType === 'findElement') {
            if (found instanceof Element) {
                value = { [ELEMENT_KEY]: cacheElement(found) };
            } else if (Array.isArray(found) && found.length > 0) {
                const elem = found[0];
                if (elem) {
                    value = { [ELEMENT_KEY]: cacheElement(elem) };
                } else {
                    value = null;
                }
            } else {
                value = null;
            }
        } else {
            // findElements
            const elements = Array.isArray(found) ? found : found instanceof Element ? [found] : [];
            value = elements.map(el => ({ [ELEMENT_KEY]: cacheElement(el) }));
        }

        return JSON.stringify({
            status: 0,
            value: value
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return JSON.stringify({
            status: 7, // NoSuchElement error code
            value: {
                message: message
            }
        });
    }
}
