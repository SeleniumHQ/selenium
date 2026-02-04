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
 * Utility functions for accessing HTML5 localStorage.
 * These functions are wrappers around the localStorage API.
 */

/**
 * Sets the value of a key/value pair in localStorage.
 *
 * @param key The key of the item.
 * @param value The value of the item.
 * @throws If localStorage is not available or quota exceeded.
 */
export function setItem(key: string, value: string): void {
    try {
        window.localStorage.setItem(key, value);
    } catch (e) {
        // Handle quota exceeded and other errors
        throw e;
    }
}

/**
 * Gets the value of a key from localStorage.
 *
 * @param key The key of the item.
 * @returns The value if present in localStorage, otherwise null.
 */
export function getItem(key: string): string | null {
    try {
        return window.localStorage.getItem(key);
    } catch (e) {
        // Handle access errors (e.g., private browsing mode)
        return null;
    }
}

/**
 * Gets all keys stored in localStorage.
 *
 * @returns Array of all stored keys.
 */
export function keySet(): string[] {
    const keys: string[] = [];
    try {
        for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
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
 * Removes an item with the given key from localStorage.
 *
 * @param key The key of the item to remove.
 * @returns The removed value if present, otherwise null.
 */
export function removeItem(key: string): string | null {
    try {
        const value = window.localStorage.getItem(key);
        window.localStorage.removeItem(key);
        return value;
    } catch (e) {
        // Handle access errors
        return null;
    }
}

/**
 * Removes all items from localStorage.
 */
export function clear(): void {
    try {
        window.localStorage.clear();
    } catch (e) {
        // Handle access errors
    }
}

/**
 * Gets the number of items in localStorage.
 *
 * @returns The number of key/value pairs.
 */
export function size(): number {
    try {
        return window.localStorage.length;
    } catch (e) {
        // Handle access errors
        return 0;
    }
}

/**
 * Gets the key at the given index in localStorage.
 *
 * @param index The index of the key/value pair.
 * @returns The key at the given index, or null if index is out of bounds.
 */
export function key(index: number): string | null {
    try {
        return window.localStorage.key(index);
    } catch (e) {
        // Handle access errors
        return null;
    }
}
