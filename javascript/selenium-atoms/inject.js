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
 * @fileoverview Defines a wrapper around {@link bot.inject.executeScript} so it
 * can be invoked via Selenium RC.
 */

goog.provide('core.inject');

goog.require('bot.dom');
goog.require('bot.inject');
goog.require('core.firefox');
goog.require('goog.array');
goog.require('goog.json');
goog.require('goog.object');


/**
 * @param {!{script:string, args:!Array.<*>}} json The executeScript parameters
 *     in the form of a JSON object.
 * @param {Window=} opt_window The window to execute the script in. Defaults to
 *     the window running this script.
 * @return {string} The stringified response object.
 * @see bot.inject.executeScript
 */
core.inject.executeScript = function(json, opt_window) {
  var result = bot.inject.executeScript(json['script'],
      core.inject.removeElementIdPrefix_(json['args']),
      false, opt_window || window);
  result = core.inject.addElementIdPrefix_(result);
  return goog.json.serialize(result);
};


/**
 * Adapts {@link bot.inject.executeScript} for use with Selenium RC. This
 * function is not exposed as a public API - instead it is intended to be called
 * by the Selenium-backed WebDriver via {@code Selenium.prototype.getEval}.
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
 * @see bot.inject.executeAsyncScript
 */
core.inject.executeAsyncScript = function(json) {
  var isDone = false, result;

  // The terminationCondition is invoked in the context of an AccessorResult
  // object.  When the script finishes, this function will marshal the results
  // to the AccessorResult object, which Selenium Core interacts with.
  var terminationCondition = /** @this {AccessorResult} */function() {
    if (isDone) {
      this.result = result;
    }
    return isDone;
  };

  // When running in Firefox chrome mode, any DOM elements in the script result
  // will be wrapped with a XPCNativeWrapper or XrayWrapper. We need to
  // intercept the result and make sure it is "unwrapped" before returning to
  // bot.inject.executeAsyncScript.  The function below is in terms of the
  // arguments object only to avoid defining new local values that would be
  // available to the script via closure, but we know the following to be true:
  //   let n = arguments.length, then
  //   arguments[n - 1] -> The "real" async callback. This is provided by the
  //                       bot.inject.executeAsyncScript atom.
  //   arguments[n - 2] -> Our "unwrapper" callback that we give to the user
  //                       script. This is injected via an argument because it
  //                       needs access to variables in this window's scope,
  //                       while the execution context will be
  //                       selenium.browserbot.getCurrentWindow().
  //   arguments[n - 3] -> The user script as a string.
  //   arguments[0..n - 3] -> The user supplier arguments.
  var scriptFn = function() {
    new Function(arguments[arguments.length - 3]).apply(null,
        (function(args) {
          var realCallback = args[args.length - 1];
          var unwrapperCallback = args[args.length - 2];
          Array.prototype.splice.apply(args, [args.length - 3, 3]);
          args.push(function(result) {
            unwrapperCallback(result, realCallback);
          });
          return args;
        })(Array.prototype.slice.apply(arguments, [0])));
  };

  var args = core.inject.removeElementIdPrefix_(json['args']);
  args.push(json['script'], function(scriptResult, realCallback) {
    // bot.inject.executeAsyncScript creates the realCallback, so we capture
    // it through arguments magic in our scriptFn wrapper above. In here, we
    // unwrap any XPCNativeWrappers in the scriptResult, then hand it over to
    // realCallback. This must all be done in this script so the unwrapped
    // result stays in the same context as realCallback.
    scriptResult = core.inject.unwrapResultValue_(scriptResult);
    realCallback(scriptResult);
  });

  bot.inject.executeAsyncScript(scriptFn, args,
      json['timeout'],
      function(value) {
        isDone = true;
        result = core.inject.addElementIdPrefix_(value);
        result = goog.json.serialize(result);
      }, false, selenium.browserbot.getCurrentWindow());

  // Since this function is invoked via getEval(), we need to ensure the
  // returned result, which is wrapped in an |AccessorResult|, has the expected
  // fields.  selenium-executionloop will detect the terminationCondition and
  // enter a loop polling for script to terminate and its result.
  return {'terminationCondition': terminationCondition};
};


/**
 * @param {*} value The value to unwrap.
 * @return {*} The unwrapped value.
 * @private
 */
core.inject.unwrapResultValue_ = function(value) {
  switch (goog.typeOf(value)) {
    case 'array':
      return goog.array.map(value, core.inject.unwrapResultValue_);
    case 'object':
      if (bot.dom.isElement(value)) {
        return core.firefox.unwrap(value);
      }
      return goog.object.map(value, core.inject.unwrapResultValue_);
    default:
      return core.firefox.unwrap(value);
  }
};


/**
 * Prefix applied to cached element IDs so that they may be used with normal
 * Selenium commands.
 * @type {string}
 * @const
 */
core.inject.ELEMENT_ID_PREFIX = 'stored=';


/**
 * @param {*} value The value to scrub.
 * @return {*} The scrubbed value.
 * @private
 */
core.inject.removeElementIdPrefix_ = function(value) {
  if (goog.isArray(value)) {
    return goog.array.map(/**@type {IArrayLike}*/ (value),
        core.inject.removeElementIdPrefix_ );
  } else if (value && goog.isObject(value) && !goog.isFunction(value)) {
    if (goog.object.containsKey(value, bot.inject.ELEMENT_KEY)) {
      var id = value[bot.inject.ELEMENT_KEY];
      if (id.substring(0, core.inject.ELEMENT_ID_PREFIX.length) ===
          core.inject.ELEMENT_ID_PREFIX) {
        value[bot.inject.ELEMENT_KEY] =
            id.substring(core.inject.ELEMENT_ID_PREFIX.length);
        return value;
      }
      return goog.object.map(value, core.inject.removeElementIdPrefix_);
    }
  }
  return value;
};


/**
 * @param {*} value The value to update.
 * @return {*} The updated value.
 * @private
 */
core.inject.addElementIdPrefix_ = function(value) {
  if (goog.isArray(value)) {
    return goog.array.map(/**@type {IArrayLike}*/ (value),
        core.inject.addElementIdPrefix_ );
  } else if (value && goog.isObject(value) && !goog.isFunction(value)) {
    if (goog.object.containsKey(value, bot.inject.ELEMENT_KEY)) {
      value[bot.inject.ELEMENT_KEY] =
          core.inject.ELEMENT_ID_PREFIX + value[bot.inject.ELEMENT_KEY];
      return value;
    }
    return goog.object.map(value, core.inject.addElementIdPrefix_);
  }
  return value;
};
