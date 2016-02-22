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
 * @fileoverview Command utilities for the injected script.
 */

goog.provide('safaridriver.inject.commands.util');


/**
 * Ensures the provided command's element is encoded as a WebElement JSON
 * object, as defined by the WebDriver wire protocol.
 * @param {!safaridriver.Command} command The command to modify.
 * @return {!safaridriver.Command} The modified command.
 */
safaridriver.inject.commands.util.prepareElementCommand = function(command) {
  var element = command.getParameter('id');
  if (goog.isDef(element) && !goog.isObject(element)) {
    command.setParameter('id', {
      'ELEMENT': element
    });
  }
  return command;
};


/**
 * Executes a command in the context of the current page.
 * @param {!safaridriver.Command} command The command to execute.
 * @param {!safaridriver.inject.Tab} tab A reference to the tab issuing this
 *     command.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with the
 *     {@link bot.response.ResponseObject} from the page.
 * @throws {Error} If there is an error while sending the command to the page.
 */
safaridriver.inject.commands.util.executeInPage = function(command, tab) {
  command = safaridriver.inject.commands.util.prepareElementCommand(command);
  return tab.executeInPage(command);
};
