/**
 * @fileoverview Defines the CommandRegistry class.
 */

goog.provide('safaridriver.CommandRegistry');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('webdriver.promise.Deferred');


/**
 * A registry used to coordinate dispatching commands to handlers that may be
 * defined in modules which may not yet be loaded.
 * @constructor
 */
safaridriver.CommandRegistry = function() {

  /**
   * @type {!Object.<!webdriver.CommandName, string>}
   * @private
   */
  this.commandNameToModuleId_ = {};

  /**
   * @type {!Object.<!webdriver.CommandName, safaridriver.CommandHandler>}
   * @private
   */
  this.commandNameToHandler_ = {};

  /**
   * @type {!Object}
   * @private
   */
  this.modules_ = {};
};
goog.addSingletonGetter(safaridriver.CommandRegistry);


/**
 * Registers a module that defines the handlers for a group of commands. Will
 * ensure this module has fully loaded before executing any of the enclosed
 * commands.
 * @param {string} moduleId The module ID.
 * @param {!Array.<!webdriver.CommandName>} commands List of commands handled
 *     by the defined module.
 * @return {!safaridriver.CommandRegistry} A self reference.
 */
safaridriver.CommandRegistry.prototype.registerModule = function(moduleId,
    commands) {
  goog.asserts.assert(!this.modules_[moduleId],
      'The module ID %s has already been registered', moduleId);

  goog.array.forEach(commands, function(command) {
    var otherModule = this.commandNameToModuleId_[command];
    goog.asserts.assert(!otherModule,
        'The command %s was previously registered to the %s module',
        command, otherModule);
    this.commandNameToModuleId_[command] = moduleId;
  }, this);

  this.modules_[moduleId] = 1;
  return this;
};


/**
 * Defines a command handler.
 * @param {!webdriver.CommandName} commandName The name of the command.
 * @param {!safaridriver.CommandHandler} handlerFn The handler function.
 * @return {!safaridriver.CommandRegistry} A self reference.
 */
safaridriver.CommandRegistry.prototype.defineCommand = function(commandName,
    handlerFn) {
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
safaridriver.CommandRegistry.prototype.execute = function(
    command, contextObject) {
  var d = new webdriver.promise.Deferred();
  var module = this.commandNameToModuleId_[command.getName()];
  // TODO(jleyba): Handle module loading
//  if (module) {
//  }
  this.executeInternal_(command, contextObject, d);
  return d.promise;
};


/**
 * Executes a command.
 * @param {!safaridriver.Command} command The command to execute.
 * @param {!Object} contextObject An additional object to pass to the command
 *     handler to provide additional context (e.g. a session ID).
 * @param {!webdriver.promise.Deferred} deferred A deferred object to resolve
 *     with the command response.
 * @private
 */
safaridriver.CommandRegistry.prototype.executeInternal_ = function(
    command, contextObject, deferred) {
  var handler = this.commandNameToHandler_[command.getName()];
  if (handler) {
    try {
      webdriver.promise.when(handler(command, contextObject),
          deferred.resolve, deferred.reject);
    } catch (ex) {
      deferred.reject(ex);
    }
  } else {
    deferred.reject(Error('Unknown command: ' + command));
  }
};
