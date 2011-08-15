// Copyright 2010 WebDriver committers
// Copyright 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Overall configuration of the browser automation atoms.
 *
 *
 */


goog.provide('bot');


goog.require('goog.userAgent');


/**
 * Frameworks using the atoms keep track of which window or frame is currently
 * being used for command execution. Note that "window" may not always be
 * defined (for example in firefox extensions)
 *
 * @type {!Window}
 * @private
 */
try {
  bot.window_ = window;
} catch (ignored) {
  // We only reach this place in a firefox extension.
  bot.window_ = goog.global;
}


/**
 * Returns the window currently being used for command execution.
 *
 * @return {!Window} The window for command execution.
 */
bot.getWindow = function() {
  return bot.window_;
};


/**
 * Sets the window to be used for command execution.
 *
 * @param {!Window} win The window for command execution.
 */
bot.setWindow = function(win) {
  bot.window_ = win;
};


/**
 * Returns the document of the window currently being used for
 * command execution.
 *
 * @return {!Document} The current window's document.
 */
bot.getDocument = function() {
  return bot.window_.document;
};


/**
 * @return {boolean} Whether atoms are executing in a Firefox extension.
 */
bot.isFirefoxExtension = function() {
  if (!goog.userAgent.GECKO) {
    return false;
  }

  var Components = goog.global.Components;
  try {
    // Instantiate something the way that an extension could. Use bracket
    // lookups so compiler doesn't complain about undefined properties.
    Components['classes']['@mozilla.org/uuid-generator;1']['getService'](
        Components['interfaces']['nsIUUIDGenerator']);
    return true;
  } catch (e) {
    return false;
  }
};

