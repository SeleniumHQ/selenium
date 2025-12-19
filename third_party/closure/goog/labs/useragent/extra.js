// Copyright 2019 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Provides extra checks for user agent that are not reflected in
 * the standard user agent checks. This includes runtime heuristics to determine
 * the true environment on browsers that present a different user agent to
 * appear to be running in a different environment.
 */

goog.module('goog.labs.userAgent.extra');

const browser = goog.require('goog.labs.userAgent.browser');
const platform = goog.require('goog.labs.userAgent.platform');

/**
 * Checks whether the browser appears to be Safari desktop running on a mobile
 * device. Starting with iPadOS 13 this is the default for non-mini iPads
 * running at >=2/3 of the screen. The user agent is otherwise indistinguishable
 * from Mac Safari. The user can also force desktop on other devices.
 *
 * @return {boolean} Whether the runtime heuristics thinks this is Desktop
 * Safari on a non-desktop device.
 */
function isSafariDesktopOnMobile() {
  return browser.isSafari() && platform.isMacintosh() &&
      goog.global.navigator.maxTouchPoints > 0;
}

exports = {isSafariDesktopOnMobile};
