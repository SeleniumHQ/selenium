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
 * @fileoverview Defines the CommandRegistry class.
 */

goog.provide('safaridriver.inject.CommandRegistry');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.log');
goog.require('safaridriver.inject.util');
goog.require('webdriver.promise');


/**
 * A registry used to coordinate dispatching commands to handlers that may be
 * defined in modules which may not yet be loaded.
 * @constructor
 */
safaridriver.inject.CommandRegistry = function() {

  /** @private {goog.log.Logger} */
  this.log_ = goog.log.getLogger('safaridriver.inject.CommandRegistry');

  /** @private {!Object.<!webdriver.CommandName, string>} */
  this.commandNameToModuleId_ = {};

  /**
   * @private {!Object.<!webdriver.CommandName, safaridriver.CommandHandler>}
   */
  this.commandNameToHandler_ = {};

  /** @private {!Object.<!Array.<!webdriver.CommandName>>} */
  this.modules_ = {};

  /** @private {!Object.<boolean>} */
  this.loadedModules_ = {};
};
goog.addSingletonGetter(safaridriver.inject.CommandRegistry);


/**
 * Message target to send LoadModule messages to.
 * @private {!(SafariContentBrowserTabProxy|Window)}
 */
safaridriver.inject.CommandRegistry.prototype.messageTarget_;


/**
 * Function to call to evaluate the source of a recently loaded module.
 * @private {function(string)}
 */
safaridriver.inject.CommandRegistry.prototype.evalModuleFn_ =
    goog.nullFunction;


/**
 * Sets the message target for this instance.
 * @param {!(SafariContentBrowserTabProxy|Window)} target The new target.
 * @return {!safaridriver.inject.CommandRegistry} A self reference.
 */
safaridriver.inject.CommandRegistry.prototype.setMessageTarget = function(
    target) {
  this.messageTarget_ = target;
  return this;
};


/**
 * Sets the function to use to evaluate a loaded module's source.
 * @param {function(string)} fn The function to use.
 * @return {!safaridriver.inject.CommandRegistry} A self reference.
 */
safaridriver.inject.CommandRegistry.prototype.setEvalModuleFn = function(fn) {
  this.evalModuleFn_ = fn;
  return this;
};


/**
 * Declares a module and the commands that are expected to be defined within
 * it. The CommandRegistry will ensure this module has fully loaded before
 * attempting to execute any of the enclosed commands.
 * @param {string} moduleId The module ID.
 * @param {!Array.<!webdriver.CommandName>} commands List of commands handled
 *     by the defined module.
 * @return {!safaridriver.inject.CommandRegistry} A self reference.
 */
safaridriver.inject.CommandRegistry.prototype.declareModule = function(
    moduleId, commands) {
  goog.asserts.assert(!this.modules_[moduleId],
      'The module ID %s has already been registered', moduleId);
  goog.log.fine(this.log_, 'Declaring module: ' + moduleId);

  goog.array.forEach(commands, function(command) {
    var otherModule = this.commandNameToModuleId_[command];
    goog.asserts.assert(!otherModule,
        'The command %s was previously registered to the %s module',
        command, otherModule);
    goog.asserts.assert(!this.commandNameToHandler_[command],
        'The handler for %s has already been defined', command);
    this.commandNameToModuleId_[command] = moduleId;
  }, this);

  this.modules_[moduleId] = commands;
  this.loadedModules_[moduleId] = false;
  return this;
};


/**
 * Defines a previously declared command module.
 * @param {string} moduleId The module ID.
 * @param {!Object.<!webdriver.CommandName, !safaridriver.CommandHandler>}
 *     spec The command handler specification for this module.
 * @return {!safaridriver.inject.CommandRegistry} A self reference.
 * @throws {Error} If the provided module specification does not define a
 *     handler for every command this module was declared to contain.
 */
safaridriver.inject.CommandRegistry.prototype.defineModule = function(
    moduleId, spec) {
  var module = this.modules_[moduleId];
  goog.asserts.assert(!!module,
      'The module ID was not pre-declared: %s', moduleId);
  var defined = [];
  for (var key in spec) {
    defined.push(key);
    goog.asserts.assert(goog.array.contains(module, key),
        '%s was not declared to belong to module %s', key, moduleId);
    this.defineCommand(/** @type {!webdriver.CommandName} */ (key), spec[key]);
  }
  goog.asserts.assert(
      defined.length === module.length,
      'For module %s, not all declared commands were defined.' +
          '\nDeclared: %s\nDefined: %s', moduleId, module, defined);

  goog.log.fine(this.log_, 'Defined module: ' + moduleId);
  this.loadedModules_[moduleId] = true;
  return this;
};


/**
 * Defines a command handler.
 * @param {!webdriver.CommandName} commandName The name of the command.
 * @param {!safaridriver.CommandHandler} handlerFn The handler function.
 * @return {!safaridriver.inject.CommandRegistry} A self reference.
 */
safaridriver.inject.CommandRegistry.prototype.defineCommand = function(
    commandName, handlerFn) {
  goog.asserts.assert(!this.commandNameToHandler_[commandName],
      'The handler for %s has already been defined', commandName);
  this.commandNameToHandler_[commandName] = handlerFn;
  return this;
};


/**
 * Executes the given command, first ensuring the corresponding module has been
 * fully loaded.
 * @param {!safaridriver.Command} command The command to execute.
 * @param {!Object} contextObject An additional object to pass to the command
 *     handler to provide additional context (e.g. a session ID).
 * @return {!webdriver.promise.Promise} A promise that will be resolved with
 *     the command response.
 */
safaridriver.inject.CommandRegistry.prototype.execute = function(
    command, contextObject) {
  var commandNameToHandlerMap = this.commandNameToHandler_;

  var executeCommand = function() {
    var handler = commandNameToHandlerMap[command.getName()];
    if (handler) {
      return webdriver.promise.when(handler(command, contextObject));
    } else {
      throw Error('Unknown command: ' + command);
    }
  };

  var moduleId = this.commandNameToModuleId_[command.getName()];
  if (moduleId) {
    return this.loadModule_(moduleId).then(executeCommand);
  } else {
    try {
      return executeCommand();
    } catch (ex) {
      return webdriver.promise.rejected(ex);
    }
  }
};


/**
 * @param {string} moduleId The module ID.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when
 *    the module has been loaded.
 * @private
 */
safaridriver.inject.CommandRegistry.prototype.loadModule_ = function(moduleId) {
  if (this.loadedModules_[moduleId]) {
    return webdriver.promise.fulfilled();
  }

  return safaridriver.inject.util.loadModule(moduleId, this.messageTarget_).
      then(goog.bind(function(src) {
        this.evalModuleFn_(src);
        this.loadedModules_[moduleId] = true;
      }, this));
};
