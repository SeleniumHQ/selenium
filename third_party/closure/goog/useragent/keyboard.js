// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Constants for determining keyboard support.
 */

goog.provide('goog.userAgent.keyboard');

goog.require('goog.userAgent');
goog.require('goog.userAgent.product');


/**
 * @define {boolean} Whether the user agent is running with in an environment
 * that should use Mac-based keyboard shortcuts (Meta instead of Ctrl, etc.).
 */
goog.define('goog.userAgent.keyboard.ASSUME_MAC_KEYBOARD', false);


/**
 * Determines whether Mac-based keyboard shortcuts should be used.
 * @return {boolean}
 * @private
 */
goog.userAgent.keyboard.determineMacKeyboard_ = function() {
  return goog.userAgent.MAC || goog.userAgent.product.IPAD ||
      goog.userAgent.product.IPHONE;
};


/**
 * Whether the user agent is running in an environment that uses Mac-based
 * keyboard shortcuts.
 * @type {boolean}
 */
goog.userAgent.keyboard.MAC_KEYBOARD =
    goog.userAgent.keyboard.ASSUME_MAC_KEYBOARD ||
    goog.userAgent.keyboard.determineMacKeyboard_();
