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
 * Utility functions for accessing HTML5 AppCache.
 * Note: AppCache is deprecated but still used in some Selenium tests.
 */

/**
 * AppCache status codes as defined by the HTML5 specification.
 */
export enum AppCacheStatus {
    UNCACHED = 0,
    IDLE = 1,
    CHECKING = 2,
    DOWNLOADING = 3,
    UPDATE_READY = 4,
    OBSOLETE = 5,
}

/**
 * Gets the current status of the AppCache.
 *
 * @returns The status code of the AppCache.
 */
export function getStatus(): number {
    try {
        const appCache = (window as any).applicationCache;
        if (appCache) {
            return appCache.status;
        }
    } catch (e) {
        // AppCache not available
    }
    return AppCacheStatus.UNCACHED;
}

/**
 * Gets the manifest URL of the AppCache.
 *
 * @returns The manifest URL if AppCache is available, otherwise undefined.
 */
export function getManifest(): string | undefined {
    try {
        const htmlElement = document.documentElement;
        const manifest = htmlElement.getAttribute('manifest');
        return manifest || undefined;
    } catch (e) {
        // Error accessing manifest
    }
    return undefined;
}
