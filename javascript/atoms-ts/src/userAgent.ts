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
 * Browser and platform detection utilities for the Selenium Atoms.
 * All WebDriver-supported browsers are modern and have the features needed
 * by Selenium. This module provides detection for browser capabilities.
 */

/**
 * Compares two version strings lexicographically.
 * Returns -1 if a < b, 0 if a == b, 1 if a > b.
 *
 * @param a First version string (e.g., "10.0")
 * @param b Second version string (e.g., "9.0")
 * @returns Comparison result
 */
function compareVersions(a: string, b: string): number {
    const aParts = a.split('.');
    const bParts = b.split('.');
    const maxLength = Math.max(aParts.length, bParts.length);

    for (let i = 0; i < maxLength; i++) {
        const aPart = parseInt(aParts[i] ?? '0', 10);
        const bPart = parseInt(bParts[i] ?? '0', 10);

        if (aPart < bPart) {
            return -1;
        }
        if (aPart > bPart) {
            return 1;
        }
    }

    return 0;
}

/**
 * Detects Android version from the user agent string.
 * Parses the Android version from patterns like "Android 10.0".
 *
 * @returns Android version string, or '0' if not Android
 */
function detectAndroidVersion(): string {
    // Check if running on Android
    if (!navigator.userAgent.toLowerCase().includes('android')) {
        return '0';
    }

    const match = /Android\s+([0-9\.]+)/.exec(navigator.userAgent);
    return match ? match[1] : '0';
}

/**
 * Detects whether the current environment is a WebExtension.
 * Checks for the presence of chrome or browser extension APIs.
 *
 * @returns true if running in a WebExtension context
 */
function detectWebExtension(): boolean {
    try {
        // Use typeof to avoid ReferenceErrors in non-extension contexts
        const global = globalThis as Record<string, unknown>;
        const chrome = global.chrome as Record<string, unknown> | undefined;
        const browser = global.browser as Record<string, unknown> | undefined;

        return !!(chrome?.extension || browser?.extension);
    } catch {
        return false;
    }
}

// Browser Detection

/**
 * Whether the current user agent is Safari.
 */
export const IS_SAFARI = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

/**
 * Whether the current user agent is Chrome.
 */
export const IS_CHROME = /Chrome/.test(navigator.userAgent);

/**
 * Whether the current user agent is Firefox.
 */
export const IS_FIREFOX = /Firefox/.test(navigator.userAgent);

/**
 * Whether the current user agent is Gecko (Firefox engine).
 */
export const IS_GECKO = IS_FIREFOX;

/**
 * Whether the current user agent is Edge (Chromium-based).
 */
export const IS_EDGE = /Edg/.test(navigator.userAgent);

/**
 * Whether the current user agent is Internet Explorer.
 * IE is no longer supported, but kept for reference.
 */
export const IS_IE = /Trident|MSIE/.test(navigator.userAgent);

// Platform Detection

/**
 * Whether the current platform is iOS (iPhone or iPad).
 */
export const IS_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

/**
 * Whether the current platform is iPad.
 */
export const IS_IPAD = /iPad/.test(navigator.userAgent);

/**
 * Whether the current platform is iPhone.
 */
export const IS_IPHONE = /iPhone/.test(navigator.userAgent);

/**
 * Whether the current platform is Android.
 */
export const IS_ANDROID = /Android/.test(navigator.userAgent);

/**
 * Whether the current platform is Windows.
 */
export const IS_WINDOWS = /Win/.test(navigator.platform);

/**
 * Whether the current platform is macOS.
 */
export const IS_MAC = /Mac/.test(navigator.platform);

/**
 * Whether the rendering engine is WebKit.
 */
export const IS_WEBKIT = /AppleWebKit/.test(navigator.userAgent);

/**
 * The detected Android Operating System version.
 */
export const ANDROID_VERSION = detectAndroidVersion();

/**
 * Whether the current platform is mobile (iOS or Android).
 */
export const IS_MOBILE = IS_IOS || IS_ANDROID;

// Environment Detection

/**
 * Whether we are running in a WebExtension (Firefox extension, Chrome extension, etc).
 * WebExtensions do not have access to the window.navigator object.
 */
export const IS_WEBEXTENSION = detectWebExtension();

/**
 * Returns whether the browser engine version is equal to or greater than
 * the given version.
 *
 * For Chromium-based browsers, compares the user agent version.
 * For Firefox, compares the user agent version.
 * For Safari, compares the user agent version.
 *
 * @param version The version to compare against (e.g., "10.0")
 * @returns true if the engine version >= the given version
 *
 * @example
 * isEngineVersion('90') // true if browser engine is 90 or higher
 */
export function isEngineVersion(version: string | number): boolean {
    const versionStr = String(version);
    const userAgent = navigator.userAgent;

    // Extract version based on browser
    let detectedVersion: string | null = null;

    if (IS_CHROME) {
        const match = /Chrome\/([0-9.]+)/.exec(userAgent);
        detectedVersion = match ? match[1] : null;
    } else if (IS_FIREFOX) {
        const match = /Firefox\/([0-9.]+)/.exec(userAgent);
        detectedVersion = match ? match[1] : null;
    } else if (IS_SAFARI) {
        const match = /Version\/([0-9.]+)/.exec(userAgent);
        detectedVersion = match ? match[1] : null;
    } else if (IS_EDGE) {
        const match = /Edg\/([0-9.]+)/.exec(userAgent);
        detectedVersion = match ? match[1] : null;
    }

    if (!detectedVersion) {
        return false;
    }

    return compareVersions(detectedVersion, versionStr) >= 0;
}

/**
 * Returns whether the browser product version is equal to or greater than
 * the given version.
 *
 * On Android, always compares against the OS version.
 * On other platforms, uses the browser version.
 *
 * @param version The version to compare against (e.g., "10.0")
 * @returns true if the product version >= the given version
 *
 * @example
 * isProductVersion('14') // true on Android 14+
 */
export function isProductVersion(version: string | number): boolean {
    const versionStr = String(version);

    if (IS_ANDROID) {
        return compareVersions(ANDROID_VERSION, versionStr) >= 0;
    }

    // For other platforms, use engine version
    return isEngineVersion(versionStr);
}
