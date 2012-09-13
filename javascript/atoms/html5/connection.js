// Copyright 2011 WebDriver committers
// Copyright 2011 Google Inc.
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
 * @fileoverview Atoms to check to connection state of a browser.
 *
 */

goog.provide('bot.connection');

goog.require('bot');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.html5');


/**
 * @return {boolean} Whether the browser currently has an internet
 *     connection.
 */
bot.connection.isOnline = function() {

  if (bot.html5.isSupported(bot.html5.API.BROWSER_CONNECTION)) {
    var win = bot.getWindow();
    return win.navigator.onLine;
  } else {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Undefined browser connection state');
  }
};
