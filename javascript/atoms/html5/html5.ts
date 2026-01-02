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
 * @fileoverview Helper function to determine which HTML5 features are
 * supported by browsers.
 */

import { getWindow } from '../bot';
import { BotError, ErrorCode } from '../error';
import { isEngineVersion, isProductVersion } from '../userAgent';

// Browser detection
const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const IS_IE = /MSIE|Trident/.test(userAgent);
const IS_SAFARI = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
const IS_ANDROID = /Android/.test(userAgent);
const IS_WINDOWS = /Windows/.test(userAgent);

/**
 * Identifier for supported HTML5 API in Webdriver.
 */
export enum API {
  APPCACHE = 'appcache',
  BROWSER_CONNECTION = 'browser_connection',
  DATABASE = 'database',
  GEOLOCATION = 'location',
  LOCAL_STORAGE = 'local_storage',
  SESSION_STORAGE = 'session_storage',
  VIDEO = 'video',
  AUDIO = 'audio',
  CANVAS = 'canvas',
}

/**
 * True if the current browser is IE version 8 or earlier.
 */
const IS_IE8_OR_EARLIER = IS_IE && !isEngineVersion(9);

/**
 * True if the current browser is Safari version 4 or earlier.
 */
const IS_SAFARI4_OR_EARLIER = IS_SAFARI && !isProductVersion(5);

/**
 * True if the browser is Android version 2.2 (Froyo) or earlier.
 */
const IS_ANDROID_FROYO_OR_EARLIER = IS_ANDROID && !isProductVersion(2.3);

/**
 * True if the current browser is Safari 5 on Windows.
 */
const IS_SAFARI_WINDOWS =
  IS_WINDOWS && IS_SAFARI && isProductVersion(4) && !isProductVersion(6);

/**
 * Checks if the browser supports an HTML5 feature.
 */
export function isSupported(api: API, opt_window?: Window): boolean {
  const win = opt_window || getWindow();

  switch (api) {
    case API.APPCACHE:
      // IE8 does not support application cache, though the APIs exist.
      if (IS_IE8_OR_EARLIER) {
        return false;
      }
      return (win as Window & { applicationCache?: unknown }).applicationCache != null;

    case API.BROWSER_CONNECTION:
      return win.navigator != null && win.navigator.onLine != null;

    case API.DATABASE:
      // Safari4 database API does not allow writes.
      if (IS_SAFARI4_OR_EARLIER) {
        return false;
      }
      // Android Froyo does not support database, though the APIs exist.
      if (IS_ANDROID_FROYO_OR_EARLIER) {
        return false;
      }
      return (win as Window & { openDatabase?: unknown }).openDatabase != null;

    case API.GEOLOCATION:
      // Safari 4,5 on Windows do not support geolocation, see:
      // https://discussions.apple.com/thread/3547900
      if (IS_SAFARI_WINDOWS) {
        return false;
      }
      return win.navigator != null && win.navigator.geolocation != null;

    case API.LOCAL_STORAGE:
      // IE8 does not support local storage, though the APIs exist.
      if (IS_IE8_OR_EARLIER) {
        return false;
      }
      return win.localStorage != null;

    case API.SESSION_STORAGE:
      // IE8 does not support session storage, though the APIs exist.
      if (IS_IE8_OR_EARLIER) {
        return false;
      }
      return (
        win.sessionStorage != null &&
        // To avoid browsers that only support this API partially
        // like some versions of FF.
        win.sessionStorage.clear != null
      );

    default:
      throw new BotError(
        ErrorCode.UNKNOWN_ERROR,
        'Unsupported API identifier provided as parameter'
      );
  }
}
