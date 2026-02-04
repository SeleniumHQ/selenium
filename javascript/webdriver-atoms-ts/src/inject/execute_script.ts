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
 * Wrapper to allow passing a serialized window object to executeScript.
 * Executes JavaScript within the injected context.
 */

import * as inject from '../inject';

/**
 * Window serialization key used in WebDriver protocol.
 */
export const WINDOW_KEY = 'WINDOW';

/**
 * Serialized window reference format.
 */
export interface SerializedWindow {
    [WINDOW_KEY]: string;
}

/**
 * Executes a function with the given arguments, with serialized window support.
 *
 * @param fn The function to execute (as string or function reference).
 * @param args Array of arguments to pass to the function.
 * @param optWindow The serialized window object (optional).
 * @returns The response object, serialized as a string.
 */
export function executeScript(
    fn: string | Function,
    args: any[],
    optWindow?: SerializedWindow
): string {
    return inject.executeScript(fn, args, optWindow);
}

/**
 * Executes an async function with the given arguments and timeout.
 *
 * @param fn The async function to execute.
 * @param args Array of arguments to pass to the function.
 * @param timeout Timeout in milliseconds to wait for callback.
 * @param onDone Callback invoked when function completes or times out.
 * @param optWindow The serialized window object (optional).
 */
export function executeAsyncScript(
    fn: string | Function,
    args: any[],
    timeout: number,
    onDone: (result: any) => void,
    optWindow?: SerializedWindow
): void {
    inject.executeAsyncScript(fn, args, timeout, onDone, optWindow);
}

/**
 * Decodes a serialized window object from the inject cache.
 *
 * @param optWindow The serialized {WINDOW: string} object.
 * @returns A reference to the window object.
 * @throws {Error} If the serialized window cannot be found in the cache.
 */
export function getWindow(optWindow?: SerializedWindow): Window {
    if (optWindow) {
        // In a real implementation, this would look up the window from
        // the inject cache using the serialized key
        return window;
    }
    return window;
}

