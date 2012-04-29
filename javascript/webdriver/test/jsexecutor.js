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

goog.provide('webdriver.test.JsExecutor');

goog.require('bot.action');
goog.require('bot.inject');
goog.require('bot.locators');
goog.require('webdriver.CommandName');


/**
 * @constructor
 * @implements {webdriver.CommandExecutor}
 */
webdriver.test.JsExecutor = function() {
};


/** @override */
webdriver.test.JsExecutor.prototype.execute = function(command, callback) {
  var fn = webdriver.test.JsExecutor.COMMAND_MAP_[command.getName()];
  if (!fn) {
    callback(Error('Unsupported command: ' + command.getName()));
  } else {
    fn(command.getParameters(), callback);
  }
};


/**
 * Maps command names to the functions which execute them.
 * @type {!Object.<function(!Object,
 *                          function(Error, !bot.response.ResponseObject=))>}
 * @const
 * @private
 */
webdriver.test.JsExecutor.COMMAND_MAP_ = (function() {
  var map = {};
  map[webdriver.CommandName.EXECUTE_SCRIPT] = function(parameters, callback) {
    executeScript(parameters['script'], parameters['args'], callback);
  };

  map[webdriver.CommandName.CLICK_ELEMENT] = function(parameters, callback) {
    executeScript(bot.action.click, [parameters['id']], callback);
  };

  map[webdriver.CommandName.FIND_ELEMENT] = function(parameters, callback) {
    var locator = {};
    locator[parameters['using']] = parameters['value'];
    executeScript(bot.locators.findElement, [locator], callback);
  };

  map[webdriver.CommandName.FIND_ELEMENTS] = function(parameters, callback) {
    var locator = {};
    locator[parameters['using']] = parameters['value'];
    executeScript(bot.locators.findElements, [locator], callback);
  };

  return map;

  function executeScript(script, args, callback) {
    var error, result;
    try {
      result = bot.inject.executeScript(script, args, false, bot.getWindow());
    } catch (ex) {
      error = ex;
    }
    callback(error, result);
  }
})();
