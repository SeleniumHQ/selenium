// Copyright 2010 WebDriver committers
// Copyright 2010 Google Inc.
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

goog.provide('core.script');

goog.require('bot.script');



/**
 * Adapts {@code bot.script.execute} for use with Selenium RC. This function is
 * not exposed as a public API - instead it is intended to be called by the
 * Selenium-backed WebDriver via {@code Selenium.prototype.getEval}.
 * Consequently, function parameters are expected in the form of a JSON object,
 * which is easier to serialize when building the "getEval" command. This
 * object must have the following fields:
 * <ol>
 *   <li>script - A string for the script to execute.</li>
 *   <li>args - An array of script arguments.</li>
 *   <li>timeout - How long the script is permitted to run.</li>
 * </ol>
 *
 * @param {{script:string, args:!Array.<*>, timeout:number}} json The execute
 *     script parameters, in the form of a JSON object.
 * @return {{terminationCondition: function():boolean}} An object with a
 *     termination condition that may be polled by Selenium Core to determine
 *     when the script has finished execution.
 * @see bot.script.execute
 */
core.script.execute = function(json) {
  var isDone = false, result, failed, failureMessage;

  // The terminationCondition is invoked in the context of an AccessorResult
  // object.  When the script finishes, this function will marshal the results
  // to the AccessorResult object, which Selenium Core interacts with.
  var terminationCondition = /** @this {AccessorResult} */function() {
    if (isDone) {
      this.result = result;
      this.failed = failed;
      this.failureMessage = failureMessage;
    }
    return isDone;
  };
  bot.script.execute(json['script'], json['args'], json['timeout'],
      function(value) {
        isDone = true;
        // Selenium RC doesn't allow returning null
        result = value == null ? 'null' : value;
      },
      function(err) {
        isDone = failed = true;
        failureMessage = err.name + ' ' + err.message;
        if (err.stack) {
          failureMessage += '\n' + err.stack;
        }
      }, selenium.browserbot.getCurrentWindow());

  // Since this function is invoked via getEval(), we need to ensure the
  // returned result, which is wrapped in an |AccessorResult|, has the expected
  // fields.  selenium-executionloop will detect the terminationCondition and
  // enter a loop polling for script to terminate and its result.
  return {'terminationCondition': terminationCondition};
};
