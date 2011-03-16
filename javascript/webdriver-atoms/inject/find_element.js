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
 * @fileOverview Ready to inject atoms into the page.
 */

goog.provide('webdriver.inject');

goog.require('bot.inject');
goog.require('bot.locators');


/**
 * Finds an element by using the given lookup strategy.
 * @strategy {string} stategy The strategy to use to locate the element.
 * @param {string} using The locator to use.
 * @param {(Document|Element)=} opt_root The document or element to perform
 *     the search under. If not specified, will use {@code document}
 *     as the root.
 * @return {string} The script result wrapped
 *     in a JSON string as defined by the WebDriver wire protocol.
 */
webdriver.inject.findElement = function(strategy, using, opt_root) {
  var locator = {}
  locator[strategy] = using;
  return bot.inject.executeScript(bot.locators.findElement,
                           [locator, opt_root], true);
}
