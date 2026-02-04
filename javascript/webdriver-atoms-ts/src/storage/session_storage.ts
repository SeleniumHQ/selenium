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
 * Utility functions for accessing HTML5 sessionStorage.
 * These functions are wrappers around the sessionStorage API.
 */

/**
 * Sets the value of a key/value pair in sessionStorage.
 *
 * @param key The key of the item.
 * @param value The value of the item.
 * @throws If sessionStorage is not available or quota exceeded.
 */
export function setItem(key: string, value: string): void {
    try {
        window.sessionStorage.setItem(key, value);
    } catch (e) {
        // Handle quota exceeded and other errors
        throw e;
    }
}

/**
 * Gets the value of a key from sessionStorage.
 *
 * @param key The key of the item.
 * @returns The value if present in sessionStorage, otherwise null.
 */
export function getItem(key: string): string | null {
    try {
        return window.sessionStorage.getItem(key);
    } catch (e) {
        // Handle access errors (e.g., private browsing mode)
        return null;
    }
}

/**
 * Gets all keys stored in sessionStorage.
 *
 * @returns Array of all stored keys.
 */
export function keySet(): string[] {
    const keys: string[] = [];
    try {
        for (let i = 0; i < window.sessionStorage.length; i++) {
            const key = window.sessionStorage.key(i);
            if (key !== null) {
                keys.push(key);
            }
        }
    } catch (e) {
        // Handle access errors
    }
    return keys;
}

/**
 * Removes an item with the given key from sessionStorage.
 *
 * @param key The key of the item to remove.
 * @returns The removed value if present, otherwise null.
 */
export function removeItem(key: string): string | null {
    try {
        const value = window.sessionStorage.getItem(key);
        window.sessionStorage.removeItem(key);
        return value;
    } catch (e) {
        // Handle access errors
        return null;
    }
}

/**
 * Removes all items from sessionStorage.
 */
export function clear(): void {
    try {
        window.sessionStorage.clear();
    } catch (e) {
        // Handle access errors
    }
}

/**
 * Gets the number of items in sessionStorage.
 *
 * @returns The number of key/value pairs.
 */
export function size(): number {
    try {
        return window.sessionStorage.length;
    } catch (e) {
        // Handle access errors
        return 0;
    }
}

/**
 * Gets the key at the given index in sessionStorage.
 *
 * @param index The index of the key/value pair.
 * @returns The key at the given index, or null if index is out of bounds.
 */
export function key(index: number): string | null {
    try {
        return window.sessionStorage.key(index);
    } catch (e) {
        // Handle access errors
        return null;
    }
}
