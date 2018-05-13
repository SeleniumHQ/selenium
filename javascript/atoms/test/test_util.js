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
 * @fileoverview Generic testing utilities.
 */

goog.provide('bot.test');

goog.require('bot.userAgent');
goog.require('goog.userAgent');


/**
 * Whether the browser supports SVG element inline with HTML.
 *
 * @const
 * @type {boolean}
 */
bot.test.SUPPORTS_INLINE_SVG = !bot.userAgent.IE_DOC_PRE9 &&
    !bot.userAgent.ANDROID_PRE_GINGERBREAD &&
    !(goog.userAgent.GECKO && !bot.userAgent.isEngineVersion(2));


/**
 * @return {boolean} Whether the window under test has focus.
 */
bot.test.isWindowFocused = function() {
  return window.document.hasFocus();
};
