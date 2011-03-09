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

goog.provide('webdriver.iphone');

goog.require('bot.ErrorCode');
goog.require('bot.inject');
goog.require('bot.script');
goog.require('goog.json');



/**
 * Executes a random snippet of JavaScript that defines the body of a function
 * to invoke. This function is intended to be wrapped inside
 * {@code bot.inject.executeScript} as a JavaScript atom.
 * @param {string} script A string defining the body of the function
 *     to invoke.
 * @param {!Array.<*>} args The list of arguments to pass to the script.
 * @param {number} timeout The amount of time, in milliseconds, the script
 *     should be permitted to run. If {@code timeout < 0}, the script will
 *     be considered synchronous and expetected to immediately return a result.
 */
webdriver.iphone.executeAsyncScript = function(script, args, timeout) {
  function sendResponse(status, value) {
    window.location.href = 'webdriver://executeAsyncScript?' +
        goog.json.serialize({
          'status': status,
          'value': bot.inject.wrapValue(value)
        });
  }

  bot.script.execute(script, args, timeout,
      /*onSuccess=*/function(value) {
        sendResponse(bot.ErrorCode.SUCCESS, value);
      },
      /*onFailure=*/function(err) {
        sendResponse(err.code || bot.ErrorCode.UNKNOWN_ERROR, {
          'message': err.message
        });
      });
};
