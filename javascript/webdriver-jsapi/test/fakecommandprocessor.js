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
 * @fileoverview A fake implementaiton of webdriver.AbstractCommandProcessor for
 * use in unit tests.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.FakeCommandProcessor');

goog.require('goog.structs.Map');
goog.require('goog.testing.asserts');
goog.require('webdriver.AbstractCommandProcessor');


/**
 * A fake {@code webdriver.AbstractCommandProcessor} that responds to driver
 * commands with canned responses.  If a response has not been configured for
 * a command, will respond with a default error response for an unexpected
 * command.
 * @constructor
 * @extends {webdriver.AbstractCommandProcessor}
 */
webdriver.FakeCommandProcessor = function() {
  webdriver.AbstractCommandProcessor.call(this);

  this.cannedResponses_ = new goog.structs.Map();
};
goog.inherits(webdriver.FakeCommandProcessor,
              webdriver.AbstractCommandProcessor);


/**
 * Sets the canned response for a given command. All commands with this name,
 * regardless of context, session, or parameters will get the same response.
 * @param {webdriver.CommandName} commandName The name of the command to set a
 *     response for.
 * @param {boolean} isFailure Whether the response is for a failure.
 * @param {*} value The value of the response.
 * @param {*} opt_error Any errors to include with the response; if defined and
 *     non-null, the response will automatically be a failure.
 */
webdriver.FakeCommandProcessor.prototype.setCannedResponse = function(
    commandName, code, value) {
  var response = new webdriver.Response(code, value);
  this.cannedResponses_.set(commandName, response);
};


/**
 * Clears all previously set canned response.
 */
webdriver.FakeCommandProcessor.prototype.clearCannedResponses = function() {
  this.cannedResponses_.clear();
};


/**
 * Responds to the driver command with the preset canned response. If no canned
 * response has been set for the given command, an error is thrown.
 * @param {webdriver.Command} command The command to execute.
 * @override
 */
webdriver.FakeCommandProcessor.prototype.dispatchDriverCommand = function(
    command) {
  var cannedResponse = this.cannedResponses_.get(command.name, null);
  if (!cannedResponse) {
    cannedResponse = new webdriver.Response(
        webdriver.Response.Code.UNKNOWN_COMMAND,
        Error('Unexpected command: ' + command.name));
  }
  command.setResponse(cannedResponse);
};
