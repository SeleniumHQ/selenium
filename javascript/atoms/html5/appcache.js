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
 * @fileoverview Atom to access application cache status.
 *
 */

goog.provide('bot.appcache');

goog.require('bot');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.html5');


/**
 * Returns the current state of the application cache.
 *
 * @param {Window=} opt_window The window object whose cache is checked;
 *     defaults to the main window.
 * @return {number} The state.
 */
bot.appcache.getStatus = function(opt_window) {
  var win = opt_window || bot.getWindow();

  if (bot.html5.isSupported(bot.html5.API.APPCACHE, win)) {
    return win.applicationCache.status;
  } else {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Undefined application cache');
  }
};
