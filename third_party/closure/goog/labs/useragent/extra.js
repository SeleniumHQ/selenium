/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Provides extra checks for user agent that are not reflected in
 * the standard user agent checks. This includes runtime heuristics to determine
 * the true environment on browsers that present a different user agent to
 * appear to be running in a different environment.
 */

goog.module('goog.labs.userAgent.extra');

const platform = goog.require('goog.labs.userAgent.platform');

/**
 * Checks whether the browser appears to be a desktop-class running on a mobile
 * device. Starting with iPadOS 13 this is the default for non-mini iPads
 * running at >=2/3 of the screen. The user agent is otherwise indistinguishable
 * from Mac Safari. The user can also force desktop on other devices. This logic
 * previously also checked for Safari, however other iOS browsers have since
 * adopted the same behavior.
 *
 * @return {boolean} Whether the runtime heuristics thinks this is Desktop
 * Safari on a non-desktop device.
 */
function isSafariDesktopOnMobile() {
  return platform.isMacintosh() && goog.global.navigator.maxTouchPoints > 0;
}

exports = {isSafariDesktopOnMobile};
