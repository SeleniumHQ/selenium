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
 * @fileoverview Defines a message for requesting a module's source code from
 * the SafariDriver extension.
 */

goog.provide('safaridriver.message.LoadModule');

goog.require('safaridriver.message');
goog.require('safaridriver.message.Message');



/**
 * Message sent to the extension requesting the source for a lazily loaded
 * JS module.
 * @param {string} moduleId ID of the module to load.
 * @constructor
 * @extends {safaridriver.message.Message}
 */
safaridriver.message.LoadModule = function(moduleId) {
  goog.base(this, safaridriver.message.LoadModule.TYPE);
  this.setField('module', moduleId);
};
goog.inherits(safaridriver.message.LoadModule, safaridriver.message.Message);


/**
 * @type {string}
 * @const
 */
safaridriver.message.LoadModule.TYPE = 'loadModule';


/**
 * @param {!Object.<*>} data The data object to convert.
 * @return {!safaridriver.message.LoadModule} The new message.
 * @throws {Error} If the data object does not define a valid message.
 * @private
 */
safaridriver.message.LoadModule.fromData_ = function(data) {
  var module = data['module'];
  if (!goog.isString(module)) {
    throw safaridriver.message.throwInvalidMessageError(data);
  }
  return new safaridriver.message.LoadModule(module);
};


/** @return {string} The module ID. */
safaridriver.message.LoadModule.prototype.getModuleId = function() {
  return /** @type {string} */ (this.getField('module'));
};


/** @override */
safaridriver.message.LoadModule.prototype.send = function() {
  throw Error('This message may only be sent synchronously.');
};


safaridriver.message.registerMessageType(
    safaridriver.message.LoadModule.TYPE,
    safaridriver.message.LoadModule.fromData_);
