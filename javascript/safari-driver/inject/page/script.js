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
 * @fileoverview Module definition for executing client scripts in the context
 * of the page under test.
 */

goog.provide('safaridriver.inject.page.script');

goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('goog.object');
goog.require('safaridriver.dom');
goog.require('safaridriver.inject.CommandRegistry');
goog.require('safaridriver.inject.Encoder');
goog.require('safaridriver.inject.page.modules');
goog.require('webdriver.CommandName');
goog.require('webdriver.promise');


/**
 * Handles an executeScript command.
 * @param {!safaridriver.Command} command The command to execute.
 * @return {*} The script result.
 * @private
 */
safaridriver.inject.page.script.executeScript_ = function(command) {
  // TODO: clean-up bot.inject.executeScript so it doesn't pull in so many
  // extra dependencies.
  var fn = new Function(command.getParameter('script'));
  var args = /** @type {!Array.<*>} */ (command.getParameter('args'));
  args = /** @type {!Array} */ (safaridriver.inject.Encoder.decode(args));
  return fn.apply(window, args);
};


/**
 * Handles an executeAsyncScript command.
 * @param {!safaridriver.Command} command The command to execute.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with
 *     the script result.
 * @private
 */
safaridriver.inject.page.script.executeAsyncScript_ = function(command) {
  var response = new webdriver.promise.Deferred();

  var script = /** @type {string} */ (command.getParameter('script'));
  var scriptFn = new Function(script);

  var args = command.getParameter('args');
  args = /** @type {!Array} */ (safaridriver.inject.Encoder.decode(args));
  // The last argument for an async script is the callback that triggers the
  // response.
  args.push(function(value) {
    safaridriver.dom.call(window, 'clearTimeout', timeoutId);
    if (response.isPending()) {
      response.fulfill(value);
    }
  });

  var startTime = goog.now();
  scriptFn.apply(window, args);

  // Register our timeout *after* the function has been invoked. This will
  // ensure we don't timeout on a function that invokes its callback after a
  // 0-based timeout:
  // var scriptFn = function(callback) {
  //   setTimeout(callback, 0);
  // };
  var timeout = /** @type {number} */ (command.getParameter('timeout'));
  var timeoutId = safaridriver.dom.call(window, 'setTimeout', function() {
    if (response.isPending()) {
      response.reject(new bot.Error(bot.ErrorCode.SCRIPT_TIMEOUT,
          'Timed out waiting for an asynchronous script result after ' +
              (goog.now() - startTime) + ' ms'));
    }
  }, Math.max(0, timeout));

  return response.promise;
};


goog.scope(function() {
var CommandName = webdriver.CommandName;
var commands = safaridriver.inject.page.script;
var moduleId = safaridriver.inject.page.modules.Id;

safaridriver.inject.CommandRegistry.getInstance()
    .defineModule(moduleId.SCRIPT, goog.object.create(
        CommandName.EXECUTE_SCRIPT, commands.executeScript_,
        CommandName.EXECUTE_ASYNC_SCRIPT, commands.executeAsyncScript_));
});  // goog.scope
