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
 * @fileoverview Wrapping execute script to use a serialized window object.
 *
 */

goog.provide('webdriver.inject');

goog.require('bot.inject');
goog.require('goog.json')

webdriver.inject.executeScript = function(fn, args, opt_window) {
  var win;
  try {
    win = bot.inject.cache.getElement(
        goog.json.parse(opt_window).value.WINDOW);
  } catch (e) {
    win = window;
  }
  return bot.inject.executeScript(fn, args, true, win);
}
