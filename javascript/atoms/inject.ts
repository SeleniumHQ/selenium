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
 * @fileoverview Browser atom for injecting JavaScript into the page under
 * test. There is no point in using this atom directly from JavaScript.
 * Instead, it is intended to be used in its compiled form when injecting
 * script from another language (e.g. C++).
 */

import { BotError, ErrorCode } from './error';
import { stringify } from './json';

/**
 * Type definition for the WebDriver's JSON wire protocol representation
 * of a DOM element.
 * @see https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol
 */
export interface JsonElement {
  ELEMENT: string;
}

/**
 * Type definition for a cached Window object that can be referenced in
 * WebDriver's JSON wire protocol. Note, this is a non-standard
 * representation.
 */
export interface JsonWindow {
  WINDOW: string;
}

/**
 * Response object as defined by the JSON wire protocol.
 * @see https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#responses
 */
export interface ResponseObject {
  status: ErrorCode;
  value: unknown;
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
 * The property key used to store the element cache on the DOCUMENT node
 * when it is injected into the page. Since compiling each browser atom results
 * in a different symbol table, we must use this known key to access the cache.
 * This ensures the same object is used between injections of different atoms.
 */
const CACHE_KEY = '$wdc_';

/**
 * The prefix for each key stored in an cache.
 */
export const ELEMENT_KEY_PREFIX = ':wdc:';

/**
 * Gets the type of a value, similar to goog.utils.typeOf.
 */
function typeOf(value: unknown): string {
  const s = typeof value;
  if (s === 'object') {
    if (!value) {
      return 'null';
    }
    if (Array.isArray(value)) {
      return 'array';
    }
    return 'object';
  }
  return s;
}

/**
 * Checks if a value is "object-like" (an object or function).
 */
function isObject(val: unknown): val is object {
  const type = typeof val;
  return (type === 'object' && val !== null) || type === 'function';
}

/**
 * Checks if a value is array-like.
 */
function isArrayLike(val: unknown): val is ArrayLike<unknown> {
  if (!val || typeof val !== 'object') {
    return false;
  }
  const obj = val as { length?: unknown };
  if (typeof obj.length !== 'number') {
    return false;
  }
  if (typeof obj.propertyIsEnumerable !== 'function') {
    return false;
  }
  return !obj.propertyIsEnumerable('length');
}

// Type guard for objects with a specific key (checks prototype chain)
function hasKey(obj: object, key: string): boolean {
  return obj !== null && key in obj;
}

/**
 * Cache interface for the element cache stored on the document.
 */
interface ElementCache {
  nextId: number;
  [key: string]: Element | Window | number;
}

/**
 * Retrieves the cache object for the given window. Will initialize the cache
 * if it does not yet exist.
 * @param doc The document whose cache to retrieve. Defaults to the current document.
 * @return The cache object.
 */
function getCache(doc?: Document): ElementCache {
  const d = doc || document;
  let cache = (d as unknown as Record<string, ElementCache>)[CACHE_KEY];
  if (!cache) {
    cache = (d as unknown as Record<string, ElementCache>)[CACHE_KEY] = {
      nextId: Date.now(),
    };
  }
  if (!cache.nextId) {
    cache.nextId = Date.now();
  }
  return cache;
}

/**
 * Adds an element to its ownerDocument's cache.
 * @param el The element or Window object to add.
 * @return The key generated for the cached element.
 */
export function addElement(el: Element | Window): string {
  const cache = getCache((el as Element).ownerDocument);
  const existingId = Object.keys(cache).find((key) => cache[key] === el);
  if (existingId) {
    return existingId;
  }
  const id = ELEMENT_KEY_PREFIX + cache.nextId++;
  cache[id] = el;
  return id;
}

/**
 * Retrieves an element from the cache. Will verify that the element is
 * still attached to the DOM before returning.
 * @param key The element's key in the cache.
 * @param doc The document whose cache to retrieve the element from. Defaults to the current document.
 * @return The cached element.
 */
export function getElement(key: string, doc?: Document): Element | Window {
  const decodedKey = decodeURIComponent(key);
  const d = doc || document;
  const cache = getCache(d);
  if (!hasKey(cache, decodedKey)) {
    throw new BotError(
      ErrorCode.STALE_ELEMENT_REFERENCE,
      'Element does not exist in cache'
    );
  }

  const el = cache[decodedKey] as Element | Window;

  // If this is a Window check if it's closed
  if (hasKey(el as object, 'setInterval')) {
    if ((el as Window).closed) {
      delete cache[decodedKey];
      throw new BotError(ErrorCode.NO_SUCH_WINDOW, 'Window has been closed.');
    }
    return el;
  }

  // Make sure the element is still attached to the DOM before returning.
  let node: Node | null = el as Node;
  while (node) {
    if (node === d.documentElement) {
      return el;
    }
    const nodeWithHost = node as Node & { host?: Node };
    if (nodeWithHost.host && node.nodeType === 11) {
      node = nodeWithHost.host;
    } else {
      node = node.parentNode;
    }
  }
  delete cache[decodedKey];
  throw new BotError(
    ErrorCode.STALE_ELEMENT_REFERENCE,
    'Element is no longer attached to the DOM'
  );
}

/**
 * Converts an element to a JSON friendly value so that it can be
 * stringified for transmission to the injector. Values are modified as
 * follows:
 * - booleans, numbers, strings, and null are returned as is
 * - undefined values are returned as null
 * - functions are returned as a string
 * - each element in an array is recursively processed
 * - DOM Elements are wrapped in object-literals as dictated by the
 *   WebDriver wire protocol
 * - all other objects will be treated as hash-maps, and will be
 *   recursively processed for any string and number key types (all
 *   other key types are discarded as they cannot be converted to JSON).
 *
 * @param value The value to make JSON friendly.
 * @return The JSON friendly value.
 * @see https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol
 */
export function wrapValue(value: unknown): unknown {
  function wrap(val: unknown, seen: object[]): unknown {
    switch (typeOf(val)) {
      case 'string':
      case 'number':
      case 'boolean':
        return val;

      case 'function':
        return (val as () => void).toString();

      case 'array':
        return (val as unknown[]).map((v) => wrap(v, seen));

      case 'object': {
        const obj = val as Record<string, unknown>;
        if (seen.indexOf(obj) >= 0) {
          throw new BotError(
            ErrorCode.JAVASCRIPT_ERROR,
            'Recursive object cannot be transferred'
          );
        }

        // Sniff out DOM elements. We're using duck-typing instead of an
        // instanceof check since the instanceof might not always work
        // (e.g. if the value originated from another Firefox component)
        if (
          hasKey(obj, 'nodeType') &&
          (obj['nodeType'] === 1 || obj['nodeType'] === 9)
        ) {
          const ret: JsonElement = { ELEMENT: '' };
          ret[ELEMENT_KEY] = addElement(obj as unknown as Element);
          return ret;
        }

        // Check if this is a Window
        if (hasKey(obj, 'document')) {
          const ret: JsonWindow = { WINDOW: '' };
          ret[WINDOW_KEY] = addElement(obj as unknown as Window);
          return ret;
        }

        seen.push(obj);
        if (isArrayLike(val)) {
          return Array.prototype.map.call(val, (v: unknown) => wrap(v, seen));
        }

        const filtered: Record<string, unknown> = {};
        for (const key in obj) {
          if (typeof key === 'number' || typeof key === 'string') {
            filtered[key] = obj[key];
          }
        }
        const result: Record<string, unknown> = {};
        for (const key in filtered) {
          result[key] = wrap(filtered[key], seen);
        }
        return result;
      }

      default:
        return null;
    }
  }
  return wrap(value, []);
}

/**
 * Unwraps any DOM element's encoded in the given `value`.
 * @param value The value to unwrap.
 * @param doc The document whose cache to retrieve wrapped elements from. Defaults to the current document.
 * @return The unwrapped value.
 */
export function unwrapValue(value: unknown, doc?: Document): unknown {
  if (Array.isArray(value)) {
    return value.map((v) => unwrapValue(v, doc));
  } else if (isObject(value)) {
    if (typeof value === 'function') {
      return value;
    }

    const obj = value as Record<string, unknown>;
    if (hasKey(obj, ELEMENT_KEY)) {
      return getElement(obj[ELEMENT_KEY] as string, doc);
    }

    if (hasKey(obj, WINDOW_KEY)) {
      return getElement(obj[WINDOW_KEY] as string, doc);
    }

    const result: Record<string, unknown> = {};
    for (const key in obj) {
      result[key] = unwrapValue(obj[key], doc);
    }
    return result;
  }
  return value;
}

/**
 * Recompiles `fn` in the context of another window so that the
 * correct symbol table is used when the function is executed. This
 * function assumes the `fn` can be decompiled to its source using
 * `Function.prototype.toString` and that it only refers to symbols
 * defined in the target window's context.
 *
 * @param fn Either the function that should be recompiled, or a string
 *     defining the body of an anonymous function that should be compiled
 *     in the target window's context.
 * @param theWindow The window to recompile the function in.
 * @return The recompiled function.
 */
function recompileFunction(
  fn: ((...args: unknown[]) => unknown) | string,
  theWindow: Window
): (...args: unknown[]) => unknown {
  if (typeof fn === 'string') {
    try {
      return new (theWindow as unknown as Record<string, typeof Function>)[
        'Function'
      ](fn) as (...args: unknown[]) => unknown;
    } catch (ex) {
      // Try to recover if in IE5-quirks mode
      // Need to initialize the script engine on the passed-in window
      const winWithExecScript = theWindow as Window & {
        execScript?: (code: string) => void;
      };
      if (winWithExecScript.execScript) {
        winWithExecScript.execScript(';');
        return new (theWindow as unknown as Record<string, typeof Function>)[
          'Function'
        ](fn) as (...args: unknown[]) => unknown;
      }
      throw ex;
    }
  }
  return theWindow === window
    ? fn
    : (new (theWindow as unknown as Record<string, typeof Function>)['Function'](
        'return (' + fn + ').apply(null,arguments);'
      ) as (...args: unknown[]) => unknown);
}

/**
 * Wraps the response to an injected script that executed successfully so it
 * can be JSON-ified for transmission to the process that injected this
 * script.
 * @param value The script result.
 * @return The wrapped value.
 * @see https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#responses
 */
export function wrapResponse(value: unknown): ResponseObject {
  return {
    status: ErrorCode.SUCCESS,
    value: wrapValue(value),
  };
}

/**
 * Wraps a JavaScript error in an object-literal so that it can be JSON-ified
 * for transmission to the process that injected this script.
 * @param err The error to wrap.
 * @return The wrapped error object.
 * @see https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#failed-commands
 */
export function wrapError(err: Error & { code?: ErrorCode }): ResponseObject {
  return {
    status:
      hasKey(err, 'code') && typeof err.code === 'number'
        ? err.code
        : ErrorCode.UNKNOWN_ERROR,
    value: {
      message: err.message,
    },
  };
}

/**
 * Executes an injected script. This function should never be called from
 * within JavaScript itself. Instead, it is used from an external source that
 * is injecting a script for execution.
 *
 * For example, in a WebDriver Java test, one might have:
 * ```
 * Object result = ((JavascriptExecutor) driver).executeScript(
 *     "return arguments[0] + arguments[1];", 1, 2);
 * ```
 *
 * Once transmitted to the driver, this command would be injected into the
 * page for evaluation as:
 * ```
 * bot.inject.executeScript(
 *     function(){ return arguments[0] + arguments[1]; },
 *     [1, 2]);
 * ```
 *
 * The details of how this function is invoked is left to clients of this
 * library.
 *
 * @param fn Either the function to execute, or a string defining the body of
 *     an anonymous function that should be executed. This function should only
 *     contain references to symbols defined in the context of the target window.
 * @param args An array of wrapped script arguments, as defined by the WebDriver wire protocol.
 * @param stringify Whether the result should be returned as a serialized JSON string.
 * @param win The window in whose context the function should be invoked;
 *     defaults to the current window.
 * @return The result of the executed script, wrapped in a WebDriver response object.
 *     If stringify is true, the response is a JSON string.
 */
export function executeScript(
  fn: ((...args: unknown[]) => unknown) | string,
  args: unknown[],
  stringifyResult?: boolean,
  win?: Window
): ResponseObject | string {
  const theWindow = win || window;
  try {
    const func = recompileFunction(fn, theWindow);
    const unwrappedArgs = unwrapValue(args, theWindow.document) as unknown[];
    const result = func.apply(theWindow, unwrappedArgs);
    const response = wrapResponse(result);
    return stringifyResult ? stringify(response) : response;
  } catch (ex) {
    const error = ex as Error & { code?: ErrorCode };
    const response = wrapError(error);
    return stringifyResult ? stringify(response) : response;
  }
}

/**
 * Executes an injected script, which is expected to finish asynchronously
 * before the given `timeout`. When the script finishes or an error
 * occurs, the given `onDone` callback will be invoked. This callback
 * will have a single argument, a ResponseObject object.
 *
 * The script signals its completion by invoking a supplied callback given
 * as its last argument. The callback may be invoked with a single value.
 *
 * The script timeout event will be scheduled with the provided window,
 * ensuring the timeout is synchronized with that window's event queue.
 * Furthermore, asynchronous scripts do not work across new page loads; if an
 * "unload" event is fired on the window while an asynchronous script is
 * pending, the script will be aborted and an error will be returned.
 *
 * Like `executeScript`, this function should only be called from an external
 * source. It handles wrapping and unwrapping of input/output values.
 *
 * @param fn Either the function to execute, or a string defining the body of
 *     an anonymous function that should be executed. This function should only
 *     contain references to symbols defined in the context of the target window.
 * @param args An array of wrapped script arguments, as defined by the WebDriver wire protocol.
 * @param timeout The amount of time, in milliseconds, the script should be
 *     permitted to run; must be non-negative.
 * @param onDone The function to call when the given `fn` invokes its callback,
 *     or when an exception or timeout occurs. This will always be called.
 * @param stringifyResult Whether the result should be returned as a serialized JSON string.
 * @param win The window to synchronize the script with; defaults to the current window.
 */
export function executeAsyncScript(
  fn: ((...args: unknown[]) => unknown) | string,
  args: unknown[],
  timeout: number,
  onDone: (result: ResponseObject | string) => void,
  stringifyResult?: boolean,
  win?: Window
): void {
  const theWindow = win || window;
  let timeoutId: number;
  let responseSent = false;

  function sendResponse(status: ErrorCode, value: unknown): void {
    if (!responseSent) {
      theWindow.removeEventListener('unload', onunload, true);
      theWindow.clearTimeout(timeoutId);

      let response: ResponseObject;
      if (status !== ErrorCode.SUCCESS) {
        const errorValue = value as Error & { stack?: string };
        const err = new BotError(status, errorValue.message || errorValue + '');
        (err as Error & { stack?: string }).stack = errorValue.stack;
        response = wrapError(err);
      } else {
        response = wrapResponse(value);
      }
      onDone(stringifyResult ? stringify(response) : response);
      responseSent = true;
    }
  }

  function sendError(msg: string): void {
    sendResponse(ErrorCode.UNKNOWN_ERROR, { message: msg });
  }

  function onunload(): void {
    sendResponse(
      ErrorCode.UNKNOWN_ERROR,
      new Error(
        'Detected a page unload event; asynchronous script ' +
          'execution does not work across page loads.'
      )
    );
  }

  if (theWindow.closed) {
    sendError('Unable to execute script; the target window is closed.');
    return;
  }

  const func = recompileFunction(fn, theWindow);

  const unwrappedArgs = unwrapValue(args, theWindow.document) as unknown[];
  unwrappedArgs.push((result: unknown) => sendResponse(ErrorCode.SUCCESS, result));

  theWindow.addEventListener('unload', onunload, true);

  const startTime = Date.now();
  try {
    func.apply(theWindow, unwrappedArgs);

    // Register our timeout *after* the function has been invoked. This will
    // ensure we don't timeout on a function that invokes its callback after
    // a 0-based timeout.
    timeoutId = theWindow.setTimeout(() => {
      sendResponse(
        ErrorCode.SCRIPT_TIMEOUT,
        new Error(
          'Timed out waiting for asynchronous script result ' +
            'after ' +
            (Date.now() - startTime) +
            ' ms'
        )
      );
    }, Math.max(0, timeout));
  } catch (ex) {
    const error = ex as Error & { code?: ErrorCode };
    sendResponse(error.code || ErrorCode.UNKNOWN_ERROR, error);
  }
}
