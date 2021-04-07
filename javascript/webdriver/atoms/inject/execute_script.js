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
 * @fileoverview Wrapping execute script to use a serialized window object.
 *
 */

goog.provide('webdriver.atoms.inject');

goog.require('bot.inject');
goog.require('bot.inject.cache');


/**
 * Wrapper to allow passing a serialized window object to executeScript.
 *
 * @param {!(string|Function)} fn The function to execute.
 * @param {Array.<*>} args Array of arguments to pass to fn.
 * @param {{WINDOW: string}=} opt_window The serialized window object to be
 *     read from the cache.
 * @return {string} The response object, serialized and returned in string
 *     format.
 */
webdriver.atoms.inject.executeScript = function(fn, args, opt_window) {
  return /**@type {string}*/(bot.inject.executeScript(fn, args, true,
      webdriver.atoms.inject.getWindow(opt_window)));
};


/**
 *
 * @param {!(string|Function)} fn The function to execute.
 * @param {Array.<*>} args Array of arguments to pass to fn.
 * @param {number} timeout The timeout to wait up to in millis.
 * @param {function(string)|function(!bot.response.ResponseObject)} onDone
 *     The function to call when the given `fn` invokes its callback,
 *     or when an exception or timeout occurs. This will always be called.
 * @param {{WINDOW: string}=} opt_window The serialized window
 *     object to be read from the cache.
 */
webdriver.atoms.inject.executeAsyncScript =
    function(fn, args, timeout, onDone, opt_window) {
  bot.inject.executeAsyncScript(
      fn, args, timeout, onDone, true,
      webdriver.atoms.inject.getWindow(opt_window));
};


/**
 * Decodes a serialized {WINDOW: string} object using the current document's
 * cache.
 *
 * @param {{WINDOW: string}=} opt_window The serialized window object to be
 *     read from the cache. If undefined, this function will trivially return
 *     the current window.
 * @return {!Window} A reference to a window.
 * @throws {bot.Error} If the serialized window cannot be found in the current
 *     document's cache.
 */
webdriver.atoms.inject.getWindow = function(opt_window) {
  var win;
  if (opt_window) {
    win = bot.inject.cache.getElement(opt_window[bot.inject.WINDOW_KEY]);
  } else {
    win = window;
  }
  return /**@type {!Window}*/(win);
};
