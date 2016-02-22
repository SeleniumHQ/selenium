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
 * @fileoverview Module definition for commands that interact with a DOM
 * element in the context of the page under test.
 */

goog.provide('safaridriver.inject.page.element');

goog.require('goog.object');
goog.require('safaridriver.inject.CommandRegistry');
goog.require('safaridriver.inject.page');
goog.require('safaridriver.inject.page.modules');
goog.require('webdriver.CommandName');
goog.require('webdriver.atoms.element');


/**
 * @param {!safaridriver.Command} command The command to execute.
 * @private
 */
safaridriver.inject.page.element.sendKeysToElement_ = function(command) {
  safaridriver.inject.page.execute(webdriver.atoms.element.type, [
    command.getParameter('id'),
    command.getParameter('value')
  ]);
};


goog.scope(function() {
var CommandName = webdriver.CommandName;
var commands = safaridriver.inject.page.element;
var moduleId = safaridriver.inject.page.modules.Id;

safaridriver.inject.CommandRegistry.getInstance()
    .defineModule(moduleId.ELEMENT, goog.object.create(
        CommandName.SEND_KEYS_TO_ELEMENT, commands.sendKeysToElement_));
});  // goog.scope
