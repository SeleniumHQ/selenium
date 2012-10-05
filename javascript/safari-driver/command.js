// Copyright 2012 Selenium committers
// Copyright 2012 Software Freedom Conservancy
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
 * @param {!webdriver.CommandName} name The command name.
 * @param {!Object.<*>=} opt_parameters The command parameters; ignored if
 *     {@code nameOrCommand} is a command object.
 * @constructor
 * @extends {webdriver.Command}
 */
safaridriver.Command = function(id, name, opt_parameters) {
  goog.base(this, name);

  /** @type {string} */
  this.id = id;

  if (opt_parameters) {
    this.setParameters(opt_parameters);
  }
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


/** @override */
safaridriver.Command.prototype.toString = function() {
  return JSON.stringify(this);
};
