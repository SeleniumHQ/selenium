// Copyright 2012 Software Freedom Conservancy. All Rights Reserved.
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

/** @fileoverview Defines the safaridriver.Command class. */

goog.provide('safaridriver.Command');

goog.require('webdriver.Command');


/**
 * Describes a command to execute.
 * @param {string} id The command identifier, used to synchronize between two
 *     end points in the WebDriver wire protocol.
 * @param {(string|!webdriver.Command)} nameOrCommand Either the command name or
 *     another command to wrap.
 * @param {!Object.<*>=} opt_parameters The command parameters; ignored if
 *     {@code nameOrCommand} is a command object.
 * @constructor
 * @extends {webdriver.Command}
 */
safaridriver.Command = function(id, nameOrCommand, opt_parameters) {
  var name = goog.isString(nameOrCommand)
      ? nameOrCommand : nameOrCommand.getName();

  goog.base(this, name);

  /** @type {string} */
  this.id = id;

  this.setParameters(goog.isString(nameOrCommand)
      ? opt_parameters || {} : nameOrCommand.getParameters());
};
goog.inherits(safaridriver.Command, webdriver.Command);


/**
 * Reconstructrs a command from a JSON object.
 * @param {!Object} obj The object to reconstruct a command from.
 * @return {safaridriver.Command} The reconstructed command, or {@code null} if
 *     the object is not a valid command.
 */
safaridriver.Command.fromJSONObject = function(obj) {
  if (!goog.isString(obj['id']) ||
      !goog.isString(obj['name']) ||
      !goog.isObject(obj['parameters'])) {
    return null;
  }

  return new safaridriver.Command(obj['id'], obj['name'], obj['parameters']);
};


/** @return {string} This command's ID. */
safaridriver.Command.prototype.getId = function() {
  return this.id;
};


/**
 * Converts this command to its JSON representation.
 * @return {!Object.<*>} The JSON representation of this command.
 */
safaridriver.Command.prototype.toJSON = function() {
  return {
    'id': this.id,
    'name': this.getName(),
    'parameters': this.getParameters()
  };
};