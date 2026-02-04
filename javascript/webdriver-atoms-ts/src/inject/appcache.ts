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
 * Inject atoms for HTML5 AppCache access.
 *
 * Note: AppCache is deprecated and largely replaced by Service Workers.
 * This module is provided for legacy support only.
 */

import * as appcache from '../storage/appcache';

/**
 * Gets the current status of the application cache.
 *
 * @returns Stringified response object with the cache status.
 */
export function getStatus(): string {
    try {
        const status = appcache.getStatus();
        const responseObj = {
            status: 0,
            value: status
        };
        return JSON.stringify(responseObj);
    } catch (err) {
        return createErrorResponse((err as any).message || String(err));
    }
}

/**
 * Gets the manifest URL for the application cache.
 *
 * @returns Stringified response object with the manifest URL.
 */
export function getManifest(): string {
    try {
        const manifest = appcache.getManifest();
        const responseObj = {
            status: 0,
            value: manifest
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
