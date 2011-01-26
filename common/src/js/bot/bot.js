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


/**
 * Frameworks using the atoms keep track of which window or frame is currently
 * being used for command execution. This may change independently of
 * goog.global, even though this provides a sensible default value.
 *
 * @type {!Window}
 * @private
 */
bot.window_ = goog.global;


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
