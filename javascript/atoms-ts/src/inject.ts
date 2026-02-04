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
 * Browser atom for injecting JavaScript into the page under test.
 * Provides utilities for wrapping/unwrapping values, executing scripts,
 * and maintaining a cache of DOM elements across injections.
 *
 * This is intended to be used in compiled form when injecting script from
 * another language (e.g., WebDriver client libraries).
 */

import { WebDriverError, ErrorCode } from './error';
import { stringify } from './json';
import { ResponseObject } from './response';
import { getWindow } from './bot';

/**
 * JSON representation of a DOM element as per the WebDriver wire protocol.
 * @example
 * { ELEMENT: "element-key-123" }
 */
export interface JsonElement {
    ELEMENT: string;
}

/**
 * JSON representation of a Window object (non-standard WebDriver representation).
 * @example
 * { WINDOW: "window-key-456" }
 */
export interface JsonWindow {
    WINDOW: string;
}

/**
 * Key used to identify DOM elements in the WebDriver wire protocol.
 * @see https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol
 */
export const ELEMENT_KEY = 'ELEMENT';

/**
 * Key used to identify Window objects in the WebDriver wire protocol.
 */
export const WINDOW_KEY = 'WINDOW';

/**
 * Cache namespace for storing element references.
 */
export namespace cache {
    const CACHE_KEY = '$wdc_';
    export const ELEMENT_KEY_PREFIX = ':wdc:';

    /**
     * Gets or creates the element cache for a document.
     *
     * @param optDoc Optional document to cache from. Defaults to current document.
     * @returns The cache object mapping keys to elements/windows
     */
    function getCache(optDoc?: Document): Record<string, any> {
        const doc = optDoc || document;
        const docRecord = doc as Record<string, any>;
        let cache = docRecord[CACHE_KEY];

        if (!cache) {
            cache = docRecord[CACHE_KEY] = {
                nextId: Date.now(),
            };
        }

        // Ensure nextId is valid (not NaN)
        if (typeof cache.nextId !== 'number' || isNaN(cache.nextId)) {
            cache.nextId = Date.now();
        }

        return cache;
    }

    /**
     * Adds an element or window to the cache.
     *
     * @param el The element or window to cache
     * @returns The generated cache key
     */
    export function addElement(el: Element | Window): string {
        const doc = (el as any).ownerDocument || document;
        const cacheObj = getCache(doc);

        // Check if already cached
        for (const [key, value] of Object.entries(cacheObj)) {
            if (value === el) {
                return key;
            }
        }

        // Generate new key
        const id = `${ELEMENT_KEY_PREFIX}${cacheObj.nextId++}`;
        cacheObj[id] = el;
        return id;
    }

    /**
     * Retrieves an element from the cache.
     * Verifies the element is still attached to the DOM (or window is open).
     *
     * @param key The cache key for the element
     * @param optDoc Optional document to cache from
     * @returns The cached element or window
     * @throws WebDriverError if element is stale or window is closed
     */
    export function getElement(key: string, optDoc?: Document): Element | Window {
        const decodedKey = decodeURIComponent(key);
        const doc = optDoc || document;
        const cacheObj = getCache(doc);

        if (!(decodedKey in cacheObj)) {
            throw new WebDriverError(
                ErrorCode.STALE_ELEMENT_REFERENCE,
                'Element does not exist in cache'
            );
        }

        const el = cacheObj[decodedKey] as any;

        // Check if this is a Window object (has setInterval method)
        if (typeof el?.setInterval === 'function') {
            if (el.closed) {
                delete cacheObj[decodedKey];
                throw new WebDriverError(ErrorCode.NO_SUCH_WINDOW, 'Window has been closed.');
            }
            return el;
        }

        // For elements, verify still attached to DOM
        let node: any = el;
        while (node) {
            if (node === doc.documentElement) {
                return el;
            }
            // Handle shadow DOM
            if (node.host && node.nodeType === 11) {
                node = node.host;
            }
            node = node.parentNode;
        }

        delete cacheObj[decodedKey];
        throw new WebDriverError(
            ErrorCode.STALE_ELEMENT_REFERENCE,
            'Element is no longer attached to the DOM'
        );
    }
}

/**
 * Converts a value to a JSON-friendly format suitable for WebDriver wire protocol.
 * Wraps DOM elements and windows in special objects, recursively processes arrays/objects.
 *
 * @param value The value to wrap
 * @returns The JSON-friendly value
 * @throws WebDriverError if a recursive structure is detected
 *
 * @example
 * wrapValue(document.body)  // { ELEMENT: ":wdc:123" }
 * wrapValue([1, 2, 3])      // [1, 2, 3]
 * wrapValue({ a: 1 })       // { a: 1 }
 */
export function wrapValue(value: unknown): unknown {
    const seen: any[] = [];

    function wrap(val: unknown): unknown {
        const type = typeof val;

        // Primitive types
        if (type === 'string' || type === 'number' || type === 'boolean') {
            return val;
        }
        if (type === 'function') {
            return (val as Function).toString();
        }
        if (val === null || val === undefined) {
            return null;
        }

        // Arrays
        if (Array.isArray(val)) {
            return val.map((v) => wrap(v));
        }

        // Objects
        if (type === 'object') {
            const obj = val as Record<string, any>;

            // Check for cycles
            if (seen.includes(obj)) {
                throw new WebDriverError(
                    ErrorCode.JAVASCRIPT_ERROR,
                    'Recursive object cannot be transferred'
                );
            }

            // Detect DOM elements
            if ('nodeType' in obj) {
                if (
                    obj.nodeType === 1 || // Node.ELEMENT_NODE
                    obj.nodeType === 9 // Node.DOCUMENT_NODE
                ) {
                    return {
                        [ELEMENT_KEY]: cache.addElement(obj as Element),
                    };
                }
            }

            // Detect Windows
            if ('document' in obj && 'window' in obj) {
                return {
                    [WINDOW_KEY]: cache.addElement(obj as Window),
                };
            }

            // Process object
            seen.push(obj);
            const result: Record<string, unknown> = {};
            for (const [key, v] of Object.entries(obj)) {
                if (typeof key === 'string' || typeof key === 'number') {
                    result[key] = wrap(v);
                }
            }
            return result;
        }

        return null;
    }

    return wrap(value);
}

/**
 * Unwraps values from the WebDriver wire protocol format.
 * Replaces cached element/window references with actual DOM objects.
 *
 * @param value The value to unwrap
 * @param optDoc Optional document to retrieve cached elements from
 * @returns The unwrapped value with actual DOM references
 */
export function unwrapValue(value: unknown, optDoc?: Document): unknown {
    if (Array.isArray(value)) {
        return value.map((v) => unwrapValue(v, optDoc));
    }

    if (typeof value !== 'object' || value === null) {
        return value;
    }

    const obj = value as Record<string, unknown>;

    // Check for cached element
    if (ELEMENT_KEY in obj) {
        return cache.getElement(String(obj[ELEMENT_KEY]), optDoc);
    }

    // Check for cached window
    if (WINDOW_KEY in obj) {
        return cache.getElement(String(obj[WINDOW_KEY]), optDoc);
    }

    // Recursively unwrap object
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
        result[key] = unwrapValue(val, optDoc);
    }
    return result;
}

/**
 * Recompiles a function in the context of another window.
 * Ensures the function uses the target window's symbol table.
 *
 * @param fn The function or function body string
 * @param theWindow The window to compile in
 * @returns The recompiled function
 */
function recompileFunction(fn: Function | string, theWindow: Window): Function {
    const winRecord = theWindow as Record<string, any>;
    if (typeof fn === 'string') {
        try {
            return new winRecord['Function'](fn);
        } catch {
            // For IE quirks mode, try pre-initializing the script engine
            if (winRecord.execScript) {
                winRecord.execScript(';');
                return new winRecord['Function'](fn);
            }
            throw new Error('Failed to compile function in target window');
        }
    }

    // If function is already in the target window, return it
    if (theWindow === window) {
        return fn;
    }

    // Otherwise, wrap it for execution in the target context
    return new winRecord['Function'](
        'return (' + fn.toString() + ').apply(null,arguments);'
    );
}

/**
 * Executes an injected script in a target window.
 *
 * @param fn The function or function body string to execute
 * @param args Array of script arguments (wrapped per WebDriver protocol)
 * @param optStringify Whether to return result as JSON string
 * @param optWindow Optional window to execute in. Defaults to current window.
 * @returns Response object with status and wrapped value, or JSON string if stringify=true
 *
 * @example
 * executeScript("return arguments[0] + arguments[1]", [1, 2])
 * // Returns: { status: 0, value: 3 }
 */
export function executeScript(
    fn: Function | string,
    args: unknown[],
    optStringify?: boolean,
    optWindow?: Window
): ResponseObject | string {
    const win = optWindow || getWindow();
    let result: ResponseObject;

    try {
        const compiledFn = recompileFunction(fn, win);
        const unwrappedArgs = unwrapValue(args, win.document) as unknown[];
        const scriptResult = compiledFn.apply(null, unwrappedArgs);
        result = wrapResponse(scriptResult);
    } catch (error) {
        result = wrapError(error as Error);
    }

    return optStringify ? stringify(result) : result;
}

/**
 * Executes an injected async script that completes via callback.
 *
 * The script receives a callback as its last argument and must invoke it
 * to signal completion. A timeout ensures the callback fires if the script
 * doesn't complete within the specified time.
 *
 * @param fn The async function or function body string
 * @param args Array of script arguments (callback is added automatically)
 * @param timeout Maximum time in milliseconds to wait for completion
 * @param onDone Callback invoked when script completes with ResponseObject
 * @param optWindow Optional window to execute in
 */
export function executeAsyncScript(
    fn: Function | string,
    args: unknown[],
    timeout: number,
    onDone: (response: ResponseObject) => void,
    optWindow?: Window
): void {
    const win = optWindow || getWindow();
    let timedOut = false;
    let finished = false;

    const timeoutId = win.setTimeout(() => {
        timedOut = true;
        if (!finished) {
            finished = true;
            onDone(wrapError(new Error('Script execution timed out')));
        }
    }, timeout);

    const callback = (result: unknown) => {
        if (!timedOut) {
            win.clearTimeout(timeoutId);
        }
        if (!finished) {
            finished = true;
            onDone(wrapResponse(result));
        }
    };

    try {
        const compiledFn = recompileFunction(fn, win);
        const unwrappedArgs = unwrapValue(args, win.document) as unknown[];
        unwrappedArgs.push(callback);
        compiledFn.apply(null, unwrappedArgs);
    } catch (error) {
        if (!finished) {
            finished = true;
            onDone(wrapError(error as Error));
        }
    }
}

/**
 * Wraps a script result in a success response object.
 *
 * @param value The script result value
 * @returns Response object with SUCCESS status and wrapped value
 */
export function wrapResponse(value: unknown): ResponseObject {
    return {
        status: ErrorCode.SUCCESS,
        value: wrapValue(value),
    };
}

/**
 * Wraps an error in a response object suitable for transmission.
 *
 * @param err The error to wrap
 * @returns Response object with error status and message
 */
export function wrapError(err: unknown): ResponseObject {
    let statusCode = ErrorCode.UNKNOWN_ERROR;
    let message = '';

    if (err instanceof Error) {
        message = err.message;
        if ('code' in err) {
            const code = (err as any).code;
            if (typeof code === 'number') {
                statusCode = code;
            }
        }
    } else if (typeof err === 'object' && err !== null) {
        const errObj = err as Record<string, any>;
        if (typeof errObj.code === 'number') {
            statusCode = errObj.code;
        }
        message = String(errObj.message || err);
    } else {
        message = String(err);
    }

    return {
        status: statusCode,
        value: {
            message,
        },
    };
}
