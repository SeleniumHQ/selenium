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
 * @fileoverview Ready to inject atoms for handling session storage.
 */

goog.provide('webdriver.atoms.inject.storage.session');

goog.require('bot.inject');
goog.require('webdriver.atoms.storage.session');


/**
 * Sets an item in the session storage.
 *
 * @param {string} key The key of the item.
 * @param {*} value The value of the item.
 * @return {!bot.response.ResponseObject} The result wrapped according
 *     to the wire protocol.
 */
webdriver.atoms.inject.storage.session.setItem = function(key, value) {
  return bot.inject.executeScript(webdriver.atoms.storage.session.setItem,
      [key, value], true);
};


/**
 * Gets an item from the session storage.
 *
 * @param {string} key The key of the item.
 * @return {!bot.response.ResponseObject} The result wrapped according
 *     to the wire protocol.
 */
webdriver.atoms.inject.storage.session.getItem = function(key) {
  return bot.inject.executeScript(webdriver.atoms.storage.session.getItem,
      [key], true);
};


/**
 * Gets the key set of the entries.
 *
 * @return {!bot.response.ResponseObject} The result wrapped according
 *     to the wire protocol.
 */
webdriver.atoms.inject.storage.session.keySet = function() {
  return bot.inject.executeScript(webdriver.atoms.storage.session.keySet,
      [], true);
};


/**
 * Removes an item in the session storage.
 *
 * @param {string} key The key of the item.
 * @return {!bot.response.ResponseObject} The result wrapped according
 *     to the wire protocol.
 */
webdriver.atoms.inject.storage.session.removeItem = function(key) {
  return bot.inject.executeScript(webdriver.atoms.storage.session.removeItem,
      [key], true);
};


/**
 * Clears the session storage.
 *
 * @return {!bot.response.ResponseObject} The result wrapped according
 *     to the wire protocol.
 */
webdriver.atoms.inject.storage.session.clear = function() {
  return bot.inject.executeScript(webdriver.atoms.storage.session.clear,
      [], true);
};


/**
 * Gets the size of the session storage.
 *
 * @return {!bot.response.ResponseObject} The result wrapped according
 *     to the wire protocol.
 */
webdriver.atoms.inject.storage.session.size = function() {
  return bot.inject.executeScript(webdriver.atoms.storage.session.size,
      [], true);
};
