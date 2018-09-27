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
 * @fileoverview Ready to inject atoms for handling session storage.
 */

goog.provide('webdriver.atoms.inject.storage.session');

goog.require('webdriver.atoms.inject');
goog.require('webdriver.atoms.storage.session');


/**
 * Sets an item in the session storage.
 *
 * @param {string} key The key of the item.
 * @param {*} value The value of the item.
 * @return {string} The stringified result wrapped according to the wire
 *     protocol.
 */
webdriver.atoms.inject.storage.session.setItem = function(key, value) {
  return webdriver.atoms.inject.executeScript(
      webdriver.atoms.storage.session.setItem, [key, value]);
};


/**
 * Gets an item from the session storage.
 *
 * @param {string} key The key of the item.
 * @return {string} The stringified result wrapped according to the wire
 *     protocol.
 */
webdriver.atoms.inject.storage.session.getItem = function(key) {
  return webdriver.atoms.inject.executeScript(
      webdriver.atoms.storage.session.getItem, [key]);
};


/**
 * Gets the key set of the entries.
 *
 * @return {string} The stringified result wrapped according to the wire
 *     protocol.
 */
webdriver.atoms.inject.storage.session.keySet = function() {
  return webdriver.atoms.inject.executeScript(
      webdriver.atoms.storage.session.keySet, []);
};


/**
 * Removes an item in the session storage.
 *
 * @param {string} key The key of the item.
 * @return {string} The stringified result wrapped according to the wire
 *     protocol.
 */
webdriver.atoms.inject.storage.session.removeItem = function(key) {
  return webdriver.atoms.inject.executeScript(
      webdriver.atoms.storage.session.removeItem, [key]);
};


/**
 * Clears the session storage.
 *
 * @return {string} The stringified result wrapped according to the wire
 *     protocol.
 */
webdriver.atoms.inject.storage.session.clear = function() {
  return webdriver.atoms.inject.executeScript(
      webdriver.atoms.storage.session.clear, []);
};


/**
 * Gets the size of the session storage.
 *
 * @return {string} The stringified result wrapped according to the wire
 *     protocol.
 */
webdriver.atoms.inject.storage.session.size = function() {
  return webdriver.atoms.inject.executeScript(
      webdriver.atoms.storage.session.size, []);
};
