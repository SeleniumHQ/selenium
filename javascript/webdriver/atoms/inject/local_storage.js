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
 * @fileoverview Ready to inject atoms for handling local storage.
 */

goog.provide('webdriver.atoms.inject.storage.local');

goog.require('webdriver.atoms.inject');
goog.require('webdriver.atoms.storage.local');


/**
 * Sets an item in the local storage.
 *
 * @param {string} key The key of the item.
 * @param {*} value The value of the item.
 * @return {string} The stringified result wrapped according to the wire
 *     protocol.
 */
webdriver.atoms.inject.storage.local.setItem = function(key, value) {
  return webdriver.atoms.inject.executeScript(
      webdriver.atoms.storage.local.setItem, [key, value]);
};


/**
 * Gets an item from the local storage.
 *
 * @param {string} key The key of the item.
 * @return {string} The stringified result wrapped according to the wire
 *     protocol.
 */
webdriver.atoms.inject.storage.local.getItem = function(key) {
  return webdriver.atoms.inject.executeScript(
      webdriver.atoms.storage.local.getItem, [key]);
};


/**
 * Gets the key set of the entries.
 *
 * @return {string} The stringified result wrapped according to the wire
 *     protocol.
 */
webdriver.atoms.inject.storage.local.keySet = function() {
  return webdriver.atoms.inject.executeScript(
      webdriver.atoms.storage.local.keySet, []);
};


/**
 * Removes an item in the local storage.
 *
 * @param {string} key The key of the item.
 * @return {string} The stringified result wrapped according to the wire
 *     protocol.
 */
webdriver.atoms.inject.storage.local.removeItem = function(key) {
  return webdriver.atoms.inject.executeScript(
      webdriver.atoms.storage.local.removeItem, [key]);
};


/**
 * Clears the local storage.
 *
 * @return {string} The stringified result wrapped according to the wire
 *     protocol.
 */
webdriver.atoms.inject.storage.local.clear = function() {
  return webdriver.atoms.inject.executeScript(
      webdriver.atoms.storage.local.clear, []);
};


/**
 * Gets the size of the local storage.
 *
 * @return {string} The stringified result wrapped according to the wire
 *     protocol.
 */
webdriver.atoms.inject.storage.local.size = function() {
  return webdriver.atoms.inject.executeScript(
      webdriver.atoms.storage.local.size, []);
};
