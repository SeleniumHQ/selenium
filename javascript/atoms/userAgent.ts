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
 * @fileoverview User agent detection utilities for Selenium atoms.
 * Browser detection patterns based on ua-parser-js (MIT license).
 */

declare const globalThis: typeof window;

/**
 * Returns the user agent string.
 */
function getUserAgentString(): string {
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    return navigator.userAgent;
  }
  return '';
}

const userAgent = getUserAgentString();

/**
 * Compares two version numbers.
 * @param version1 Version of first item.
 * @param version2 Version of second item.
 * @return 1 if version1 is higher, 0 if equal, -1 if version2 is higher.
 */
function compareVersions(
  version1: string | number,
  version2: string | number
): number {
  let order = 0;
  const v1Subs = String(version1).trim().split('.');
  const v2Subs = String(version2).trim().split('.');
  const subCount = Math.max(v1Subs.length, v2Subs.length);

  for (let subIdx = 0; order === 0 && subIdx < subCount; subIdx++) {
    let v1Sub = v1Subs[subIdx] || '';
    let v2Sub = v2Subs[subIdx] || '';

    do {
      const v1Comp = /(\d*)(\D*)(.*)/.exec(v1Sub) || ['', '', '', ''];
      const v2Comp = /(\d*)(\D*)(.*)/.exec(v2Sub) || ['', '', '', ''];

      if (v1Comp[0].length === 0 && v2Comp[0].length === 0) {
        break;
      }

      const v1CompNum = v1Comp[1].length === 0 ? 0 : parseInt(v1Comp[1], 10);
      const v2CompNum = v2Comp[1].length === 0 ? 0 : parseInt(v2Comp[1], 10);

      order =
        compareElements(v1CompNum, v2CompNum) ||
        compareElements(v1Comp[2].length === 0, v2Comp[2].length === 0) ||
        compareElements(v1Comp[2], v2Comp[2]);

      v1Sub = v1Comp[3];
      v2Sub = v2Comp[3];
    } while (order === 0);
  }

  return order;
}

/**
 * Compares elements of a version number.
 */
function compareElements(
  left: string | number | boolean,
  right: string | number | boolean
): number {
  if (left < right) {
    return -1;
  } else if (left > right) {
    return 1;
  }
  return 0;
}

// ============================================================================
// Browser Detection (patterns from ua-parser-js, MIT license)
// ============================================================================

interface BrowserInfo {
  name: string;
  version: string;
}

interface OSInfo {
  name: string;
  version: string;
}

interface EngineInfo {
  name: string;
  version: string;
}

function detectBrowser(): BrowserInfo {
  let name = '';
  let version = '';

  // Order matters - check more specific patterns first
  if (/Opera|OPR\//.test(userAgent)) {
    name = 'Opera';
    const match = /(?:Opera|OPR)[\/\s](\d+(?:\.\d+)*)/.exec(userAgent);
    version = match ? match[1] : '';
  } else if (/Edg\//.test(userAgent)) {
    name = 'Edge';
    const match = /Edg\/(\d+(?:\.\d+)*)/.exec(userAgent);
    version = match ? match[1] : '';
  } else if (/Edge\//.test(userAgent)) {
    name = 'Edge';
    const match = /Edge\/(\d+(?:\.\d+)*)/.exec(userAgent);
    version = match ? match[1] : '';
  } else if (/Firefox\//.test(userAgent) && !/Seamonkey\//.test(userAgent)) {
    name = 'Firefox';
    const match = /Firefox\/(\d+(?:\.\d+)*)/.exec(userAgent);
    version = match ? match[1] : '';
  } else if (/MSIE|Trident/.test(userAgent)) {
    name = 'IE';
    const match = /(?:MSIE |rv:)(\d+(?:\.\d+)*)/.exec(userAgent);
    version = match ? match[1] : '';
  } else if (/Chrome\//.test(userAgent) && !/Chromium\//.test(userAgent)) {
    name = 'Chrome';
    const match = /Chrome\/(\d+(?:\.\d+)*)/.exec(userAgent);
    version = match ? match[1] : '';
  } else if (/Chromium\//.test(userAgent)) {
    name = 'Chromium';
    const match = /Chromium\/(\d+(?:\.\d+)*)/.exec(userAgent);
    version = match ? match[1] : '';
  } else if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) {
    name = 'Safari';
    const match = /Version\/(\d+(?:\.\d+)*)/.exec(userAgent);
    version = match ? match[1] : '';
  } else if (/Android/.test(userAgent) && !/Chrome\//.test(userAgent)) {
    name = 'Android Browser';
    const match = /Version\/(\d+(?:\.\d+)*)/.exec(userAgent);
    version = match ? match[1] : '';
  }

  return { name, version };
}

function detectOS(): OSInfo {
  let name = '';
  let version = '';

  if (/Windows/.test(userAgent)) {
    name = 'Windows';
    const match = /Windows NT (\d+(?:\.\d+)*)/.exec(userAgent);
    version = match ? match[1] : '';
  } else if (/Android/.test(userAgent)) {
    name = 'Android';
    const match = /Android (\d+(?:\.\d+)*)/.exec(userAgent);
    version = match ? match[1] : '';
  } else if (/iPhone|iPad|iPod/.test(userAgent)) {
    name = 'iOS';
    const match = /OS (\d+[_\d]*)/.exec(userAgent);
    version = match ? match[1].replace(/_/g, '.') : '';
  } else if (/Mac OS X/.test(userAgent)) {
    name = 'Mac OS';
    const match = /Mac OS X (\d+[_\d]*)/.exec(userAgent);
    version = match ? match[1].replace(/_/g, '.') : '';
  } else if (/Linux/.test(userAgent)) {
    name = 'Linux';
  }

  return { name, version };
}

function detectEngine(): EngineInfo {
  let name = '';
  let version = '';

  if (/Trident/.test(userAgent)) {
    name = 'Trident';
    const match = /Trident\/(\d+(?:\.\d+)*)/.exec(userAgent);
    version = match ? match[1] : '';
  } else if (/Gecko\//.test(userAgent) && !/like Gecko/.test(userAgent)) {
    name = 'Gecko';
    const match = /rv:(\d+(?:\.\d+)*)/.exec(userAgent);
    version = match ? match[1] : '';
  } else if (/AppleWebKit\//.test(userAgent)) {
    name = 'WebKit';
    const match = /AppleWebKit\/(\d+(?:\.\d+)*)/.exec(userAgent);
    version = match ? match[1] : '';
  } else if (/Presto\//.test(userAgent)) {
    name = 'Presto';
    const match = /Presto\/(\d+(?:\.\d+)*)/.exec(userAgent);
    version = match ? match[1] : '';
  }

  return { name, version };
}

// Perform detection once at load time
const browser = detectBrowser();
const os = detectOS();
const engine = detectEngine();

// Browser/engine constants - these are exported for use by events.ts and others
export const IE: boolean = browser.name === 'IE';
export const GECKO: boolean = engine.name === 'Gecko';
export const WEBKIT: boolean = engine.name === 'WebKit';
export const EDGE: boolean = browser.name === 'Edge';
export const ANDROID: boolean = os.name === 'Android';

const DOCUMENT_MODE: number | undefined = (function () {
  if (typeof document !== 'undefined' && IE) {
    return (document as { documentMode?: number }).documentMode;
  }
  return undefined;
})();

function isVersionOrHigher(version: string | number): boolean {
  return compareVersions(engine.version, version) >= 0;
}

function isDocumentModeOrHigher(documentMode: number): boolean {
  return Number(DOCUMENT_MODE) >= documentMode;
}

// Product detection
const isAndroidOS = os.name === 'Android';
const isAndroidBrowser = browser.name === 'Android Browser';
const IPHONE: boolean = /iPhone|iPod/.test(userAgent);
const IPAD: boolean = /iPad/.test(userAgent);
const SAFARI: boolean = browser.name === 'Safari' && !IPHONE && !IPAD;
const CHROME: boolean = browser.name === 'Chrome' || browser.name === 'Chromium';
const FIREFOX: boolean = browser.name === 'Firefox';

/**
 * Android Operating System Version.
 */
export const ANDROID_VERSION_: string = isAndroidOS ? os.version || '0' : '0';

/**
 * Product version.
 */
const PRODUCT_VERSION: string = browser.version;

function isProductVersionOrHigher(version: string | number): boolean {
  return compareVersions(PRODUCT_VERSION, version) >= 0;
}

// ============================================================================
// Exported API - matches original bot.userAgent interface
// ============================================================================

/**
 * Whether the rendering engine version of the current browser is equal to or
 * greater than the given version.
 */
export function isEngineVersion(version: string | number): boolean {
  if (IE) {
    return compareVersions(DOCUMENT_MODE ?? 0, version) >= 0;
  }
  return isVersionOrHigher(version);
}

/**
 * Whether the product version of the current browser is equal to or greater
 * than the given version.
 */
export function isProductVersion(version: string | number): boolean {
  if (isAndroidBrowser) {
    return compareVersions(ANDROID_VERSION_, version) >= 0;
  }
  return isProductVersionOrHigher(version);
}

/**
 * Whether we are a WebExtension.
 */
export const WEBEXTENSION: boolean = (function () {
  try {
    const global = typeof globalThis !== 'undefined' ? globalThis : window;
    const chrome = (global as { chrome?: { extension?: unknown } }).chrome;
    const browserObj = (global as { browser?: { extension?: unknown } }).browser;
    return !!((chrome || browserObj)?.extension);
  } catch (e) {
    return false;
  }
})();

/**
 * Whether we are on iOS.
 */
export const IOS: boolean = IPAD || IPHONE;

/**
 * Whether we are on a mobile browser.
 */
export const MOBILE: boolean = IOS || isAndroidOS;

/**
 * Whether the current document is IE in a documentMode older than 8.
 */
export const IE_DOC_PRE8: boolean = IE && !isDocumentModeOrHigher(8);

/**
 * Whether the current document is IE in IE9 (or newer) standards mode.
 */
export const IE_DOC_9: boolean = isDocumentModeOrHigher(9);

/**
 * Whether the current document is IE in a documentMode older than 9.
 */
export const IE_DOC_PRE9: boolean = IE && !isDocumentModeOrHigher(9);

/**
 * Whether the current document is IE in IE10 (or newer) standards mode.
 */
export const IE_DOC_10: boolean = isDocumentModeOrHigher(10);

/**
 * Whether the current document is IE in a documentMode older than 10.
 */
export const IE_DOC_PRE10: boolean = IE && !isDocumentModeOrHigher(10);

/**
 * Whether the current browser is Android pre-gingerbread.
 */
export const ANDROID_PRE_GINGERBREAD: boolean =
  isAndroidOS && !isProductVersion(2.3);

/**
 * Whether the current browser is Android pre-icecreamsandwich.
 */
export const ANDROID_PRE_ICECREAMSANDWICH: boolean =
  isAndroidOS && !isProductVersion(4);

/**
 * Whether the current browser is Safari 6.
 */
export const SAFARI_6: boolean = SAFARI && isProductVersion(6);

/**
 * Whether the current browser is Windows Phone.
 */
export const WINDOWS_PHONE: boolean =
  IE && userAgent.indexOf('IEMobile') !== -1;
