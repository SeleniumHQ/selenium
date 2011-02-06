/** @license
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * @fileoverview Base class for all WebDriver command processors.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.AbstractCommandProcessor');

goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.object');
goog.require('webdriver.CommandName');
goog.require('webdriver.Future');
goog.require('webdriver.Response');
goog.require('webdriver.Response.Code');
goog.require('webdriver.WebElement');
goog.require('webdriver.timing');


/**
 * Base class for all WebDriver command processors.
 * @constructor
 * @extends {goog.Disposable}
 */
webdriver.AbstractCommandProcessor = function() {
  goog.Disposable.call(this);
};
goog.inherits(webdriver.AbstractCommandProcessor, goog.Disposable);


/**
 * Updates a {@code webdriver.Command} instance so that any parameters that
 * are {@code webdriver.Future} values are converted to their asynchronously set
 * values.
 * @param {webdriver.Command} command The command object to modify.
 * @throws If an attempt is made to fetch the value of a
 *     {@code webdriver.Future} that hasn't been computed yet.
 * @private
 */
webdriver.AbstractCommandProcessor.resolveFutureParams_ = function(
    command) {
  function getValue(obj) {
    if (obj instanceof webdriver.Future) {
      return obj.getValue();
    } else if (goog.isFunction(obj) ||
               obj instanceof webdriver.WebElement) {
      return obj;
    } else if (goog.isObject(obj)) {
      goog.object.forEach(obj, function(value, key) {
        if (value instanceof webdriver.Future) {
          obj[key] = getValue(value);
        }
      });
    }
    return obj;
  }

  command.parameters = goog.object.map(command.parameters, function(param) {
    if (goog.isArray(param)) {
      return goog.array.map(param, getValue);
    } else {
      return getValue(param);
    }
  });
};


/**
 * Executes a command.
 * @param {webdriver.Command} command The command to execute.
 */
webdriver.AbstractCommandProcessor.prototype.execute = function(command) {
  var driver = command.getDriver();
  webdriver.AbstractCommandProcessor.resolveFutureParams_(command);
  var parameters = command.getParameters();
  switch (command.getName()) {
    case webdriver.CommandName.SLEEP:
      var ms = parameters['ms'];
      webdriver.timing.setTimeout(function() {
        command.setResponse(new webdriver.Response(
            webdriver.Response.Code.SUCCESS, ms));
      }, ms);
      break;

    case webdriver.CommandName.WAIT:
    case webdriver.CommandName.FUNCTION:
      try {
        var result = parameters['function'].apply(null, parameters['args']);
        command.setResponse(new webdriver.Response(
            webdriver.Response.Code.SUCCESS, result));
      } catch (ex) {
        command.setResponse(new webdriver.Response(
            webdriver.Response.Code.UNHANDLED_ERROR, ex));
      }
      break;

    default:
      try {
        this.dispatchDriverCommand(command);
      } catch (ex) {
        command.setResponse(new webdriver.Response(
            webdriver.Response.Code.UNHANDLED_ERROR, ex));
      }
      break;
  }
};


/**
 * Sends a command to be executed by a browser driver. This method must be
 * implemented by each subclass.
 * @param {webdriver.Command} command The command to execute.
 * @protected
 */
webdriver.AbstractCommandProcessor.prototype.dispatchDriverCommand =
    goog.abstractMethod;
