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
 * Inject atoms for session storage access.
 */

import * as sessionStorage from '../storage/session_storage';

/**
 * Sets an item in session storage.
 *
 * @param key The storage key.
 * @param value The value to store.
 * @returns Stringified response object.
 */
export function setItem(key: string, value: any): string {
    try {
        sessionStorage.setItem(key, value);
        const responseObj = {
            status: 0,
            value: null
        };
        return JSON.stringify(responseObj);
    } catch (err) {
        return createErrorResponse((err as any).message || String(err));
    }
}

/**
 * Gets an item from session storage.
 *
 * @param key The storage key.
 * @returns Stringified response object with the value.
 */
export function getItem(key: string): string {
    try {
        const value = sessionStorage.getItem(key);
        const responseObj = {
            status: 0,
            value: value
        };
        return JSON.stringify(responseObj);
    } catch (err) {
        return createErrorResponse((err as any).message || String(err));
    }
}

/**
 * Gets all keys in session storage.
 *
 * @returns Stringified response object with array of keys.
 */
export function keySet(): string {
    try {
        const keys = sessionStorage.keySet();
        const responseObj = {
            status: 0,
            value: keys
        };
        return JSON.stringify(responseObj);
    } catch (err) {
        return createErrorResponse((err as any).message || String(err));
    }
}

/**
 * Removes an item from session storage.
 *
 * @param key The storage key.
 * @returns Stringified response object.
 */
export function removeItem(key: string): string {
    try {
        sessionStorage.removeItem(key);
        const responseObj = {
            status: 0,
            value: null
        };
        return JSON.stringify(responseObj);
    } catch (err) {
        return createErrorResponse((err as any).message || String(err));
    }
}

/**
 * Clears all items from session storage.
 *
 * @returns Stringified response object.
 */
export function clear(): string {
    try {
        sessionStorage.clear();
        const responseObj = {
            status: 0,
            value: null
        };
        return JSON.stringify(responseObj);
    } catch (err) {
        return createErrorResponse((err as any).message || String(err));
    }
}

/**
 * Helper to create an error response object.
 */
function createErrorResponse(message: string): string {
    const errorObj = {
        status: 1,
        value: { message }
    };
    return JSON.stringify(errorObj);
}
