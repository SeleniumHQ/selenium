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
 *@fileOverview Ready to inject atoms for handling local storage.
 */

goog.provide('webdriver.inject.storage.local');

goog.require('bot.inject');
goog.require('webdriver.storage.local');


/**
 * Sets an item in the local storage.
 *
 * @param {string} key The key of the item.
 * @param {*} value The value of the item.
 * @return {!bot.inject.Response} The result wrapped according
 *     to the wire protocol.
 */
webdriver.inject.storage.local.setItem = function(key, value) {
  return bot.inject.executeScript(webdriver.storage.local.setItem,
      [key, value], true);
};


/**
 * Gets an item from the local storage.
 *
 * @param {string} key The key of the item.
 * @return {!bot.inject.Response} The result wrapped according
 *     to the wire protocol.
 */
webdriver.inject.storage.local.getItem = function(key) {
  return bot.inject.executeScript(webdriver.storage.local.getItem,
      [key], true);
};


/**
 * Gets the key set of the entries.
 *
 * @return {!bot.inject.Response} The result wrapped according
 *     to the wire protocol.
 */
webdriver.inject.storage.local.keySet = function() {
  return bot.inject.executeScript(webdriver.storage.local.keySet,
      [], true);
};


/**
 * Removes an item in the local storage.
 *
 * @param {string} key The key of the item.
 * @return {!bot.inject.Response} The result wrapped according
 *     to the wire protocol.
 */
webdriver.inject.storage.local.removeItem = function(key) {
  return bot.inject.executeScript(webdriver.storage.local.removeItem,
      [key], true);
};


/**
 * Clears the local storage.
 *
 * @return {!bot.inject.Response} The result wrapped according
 *     to the wire protocol.
 */
webdriver.inject.storage.local.clear = function() {
  return bot.inject.executeScript(webdriver.storage.local.clear,
      [], true);
};


/**
 * Gets the size of the local storage.
 *
 * @return {!bot.inject.Response} The result wrapped according
 *     to the wire protocol.
 */
webdriver.inject.storage.local.size = function() {
  return bot.inject.executeScript(webdriver.storage.local.size,
      [], true);
};
