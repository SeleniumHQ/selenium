/*
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
 * @fileoverview Defines a command processor that uses a browser
 * extension/plugin object available to the Javascript on the page.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.LocalCommandProcessor');

goog.require('webdriver.Context');
goog.require('webdriver.Response');


/**
 * Command processor that uses a browser extension/plugin exposed to the page
 * for executing WebDriver commands.
 * @constructor
 */
webdriver.LocalCommandProcessor = function() {
  // TODO(jmleyba): IE, Chrome, et al. support
  this.cp_ = goog.global['__webDriverCommandProcessor'];
};


/**
 * Executes a command.
 * @param {webdriver.Command} command Describes the command to execute.
 * @param {function} callbackFn The function to call once a response has been
 *     received for the command.
 */
webdriver.LocalCommandProcessor.prototype.execute = function(command,
                                                             callbackFn) {
  var jsonCommand = {
    'commandName': command.info.methodName,
    'context': command.context,
    'parameters': command.parameters,
    'callbackFn': function(rawResponse) {
      var response = new webdriver.Response(
          command,
          rawResponse['isError'],
          webdriver.Context.fromString(rawResponse['context']),
          rawResponse['response']);
      // Execute callback in a timeout so any errors in the callback do not get
      // covered up by the try-catch below (the controlling WebDriver instance
      // should catch callback errors on its own).
      window.setTimeout(goog.bind(callbackFn, null, response), 0);
    }
  };

  if (command.elementId) {
    jsonCommand['elementId'] = command.elementId;
  }

  try {
    this.cp_.execute({'wrappedJSObject': jsonCommand});
  } catch (ex) {
    callbackFn(new webdriver.Response(command, true, command.context, ex));
  }
};
