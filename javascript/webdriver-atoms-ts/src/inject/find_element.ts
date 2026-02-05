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
 * Type for a locator strategy search function.
 * Takes a locator object and optional root, returns element(s) or null.
 */
type SearchFunction = (locator: Record<string, string>, root: Document | Element) => Element | Element[] | null;

/**
 * Finds a single element using the given locator strategy.
 *
 * @param strategy The locator strategy (e.g., 'id', 'css selector', 'xpath').
 * @param using The locator string/expression.
 * @param optRoot Optional root element for scoped search.
 * @param optWindow Optional serialized window.
 * @returns Stringified response object containing the found element.
 */
export function findElement(
    strategy: string,
    using: string,
    optRoot?: JsonElement,
    optWindow?: executeScript.SerializedWindow
): string {
    return performSearch_(strategy, using, locateSingleElement, optRoot, optWindow);
}

/**
 * Finds multiple elements using the given locator strategy.
 *
 * @param strategy The locator strategy.
 * @param using The locator string/expression.
 * @param optRoot Optional root element for scoped search.
 * @param optWindow Optional serialized window.
 * @returns Stringified response object containing array of found elements.
 */
export function findElements(
    strategy: string,
    using: string,
    optRoot?: JsonElement,
    optWindow?: executeScript.SerializedWindow
): string {
    return performSearch_(strategy, using, locateMultipleElements, optRoot, optWindow);
}

/**
 * Locates a single element using a locator object.
 *
 * @param locator A locator object with strategy as key and selector as value.
 * @param root The root element to search from.
 * @returns The first matching element, or null if not found.
 */
function locateSingleElement(
    locator: Record<string, string>,
    root: Document | Element
): Element | null {
    const strategy = Object.keys(locator)[0];
    const using = strategy ? locator[strategy] : undefined;

    if (!strategy || !using) {
        throw new Error('Invalid locator format');
    }

    const results = locateElements(strategy, using, root);
    if (Array.isArray(results)) {
        return results.length > 0 ? results[0] || null : null;
    }
    return results || null;
}

/**
 * Locates multiple elements using a locator object.
 *
 * @param locator A locator object with strategy as key and selector as value.
 * @param root The root element to search from.
 * @returns An array of all matching elements.
 */
function locateMultipleElements(
    locator: Record<string, string>,
    root: Document | Element
): Element[] {
    const strategy = Object.keys(locator)[0];
    const using = strategy ? locator[strategy] : undefined;

    if (!strategy || !using) {
        throw new Error('Invalid locator format');
    }

    const results = locateElements(strategy, using, root);
    if (Array.isArray(results)) {
        return results;
    }
    return results ? [results] : [];
}

/**
 * Locates elements using the given strategy and locator string.
 * Maps WebDriver locator strategies to DOM APIs.
 *
 * @param strategy The locator strategy.
 * @param using The locator string/expression.
 * @param root The root element to search from.
 * @returns An array of found elements, a single element, or null.
 * @throws If the locator strategy is unsupported.
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
 * Performs a search for one or more elements using the given search function.
 * Follows the Closure pattern for consistency.
 *
 * @param strategy The locator strategy.
 * @param target The locator string/expression.
 * @param searchFn The search function to invoke (locateSingleElement or locateMultipleElements).
 * @param optRoot Optional root element reference.
 * @param _optWindow Optional serialized window object (reserved for future use).
 * @returns Stringified JSON response object.
 */
function performSearch_(
    strategy: string,
    target: string,
    searchFn: SearchFunction,
    optRoot?: JsonElement,
    _optWindow?: executeScript.SerializedWindow
): string {
    // Build locator object with strategy as key and target as value
    const locator: Record<string, string> = {};
    locator[strategy] = target;

    try {
        // Step 1: Determine the target document (optWindow handling could be added if needed)
        const targetDoc = document;

        // Step 2: Decode the root of our search
        let root: Document | Element = targetDoc;
        if (optRoot && ELEMENT_KEY in optRoot) {
            const cachedKey = optRoot[ELEMENT_KEY];
            if (cachedKey) {
                root = getCachedElement(cachedKey, targetDoc);
            }
        }

        // Step 3: Perform the search using the provided search function
        const found = searchFn(locator, root);

        // Step 4: Encode our response
        return wrapResponse(found);
    } catch (ex) {
        return wrapError(ex);
    }
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
 * Wraps a response value in the WebDriver response format.
 * Encodes found element(s) for transmission.
 *
 * @param value The value to wrap (element, array of elements, or null).
 * @returns Stringified JSON response.
 */
function wrapResponse(value: any): string {
    let encodedValue: any;

    if (value instanceof Element) {
        encodedValue = { [ELEMENT_KEY]: cacheElement(value) };
    } else if (Array.isArray(value)) {
        encodedValue = value.map(el => ({ [ELEMENT_KEY]: cacheElement(el) }));
    } else {
        encodedValue = value;
    }

    return JSON.stringify({
        status: 0,
        value: encodedValue
    });
}

/**
 * Wraps an error in the WebDriver response format.
 *
 * @param error The error to wrap.
 * @returns Stringified JSON error response.
 */
function wrapError(error: any): string {
    const message = error instanceof Error ? error.message : String(error);
    return JSON.stringify({
        status: 7, // NoSuchElement error code
        value: {
            message: message
        }
    });
}
