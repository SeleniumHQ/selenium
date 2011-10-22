// Copyright 2011 WebDriver committers
// Copyright 2011 Google Inc.
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

/**
 * @fileoverview Provides a browser friendly definition for the NodeJS global
 * <code>process</code> object. When running in a browser, the following
 * strategies are used to emulate Node's process API:
 *
 * - process.nextTick is implemented with setTimeout(fn, 0)
 * - window.onError is configured as the global error handler. Each time an
 *   unhandled error is detected, it will be reported via the
 *   webdriver.process.UNCAUGHT_EXCEPTION event.
 * - Environment variables are loaded by parsing the current URL's query string.
 *   Variables that have more than one variable will be initialized to the JSON
 *   representation of the array of all values, otherwise the variable will be
 *   initialized to a sole string value. If a variable does not have any values,
 *   but is nonetheless present in the query string, it will be initialized to
 *   an empty string.
 *   After the initial parsing, environment variables must be queried and set
 *   through the API defined in this file.
 */

goog.provide('webdriver.process');

goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.json');


/**
 * @return {boolean} Whether the current process is Node's native process
 *     object.
 * @export
 */
webdriver.process.isNative = function() {
  return webdriver.process.IS_NATIVE_PROCESS_;
};


/**
 * Schedules a function to be executed in the next turn of the event loop. The
 * scheduled function may not be canceled.
 * @param {!Function} fn The function to execute.
 * @export
 */
webdriver.process.nextTick = function(fn) {
  webdriver.process.PROCESS_.nextTick(fn);
};


/**
 * Queries for a named environment variable.
 * @param {string} name The name of the environment variable to look up.
 * @param {string=} opt_default The default value if the named variable is not
 *     defined.
 * @return {string} The queried environment variable.
 * @export
 */
webdriver.process.getEnv = function(name, opt_default) {
  var value = webdriver.process.PROCESS_.env[name];
  return goog.isDef(value) ? value : opt_default;
};


/**
 * Sets an environment value.
 * @param {string} name The value to set.
 * @param {*} value The new value; will be coerced to a string.
 * @export
 */
webdriver.process.setEnv = function(name, value) {
  webdriver.process.PROCESS_.env[name] = value + '';
};


/**
 * Whether the current environment is using Node's native process object.
 * @type {boolean}
 * @const
 * @private
 */
webdriver.process.IS_NATIVE_PROCESS_ = typeof process !== 'undefined';


/**
 * Initializes a process object for use in a browser window.
 * @param {!Window=} opt_window The window object to initialize the process
 *     from; if not specified, will default to the current window. Should only
 *     be set for unit testing.
 * @return {!Object} The new process object.
 * @private
 */
webdriver.process.initBrowserProcess_ = function(opt_window) {
  var process = {'env': {}};

  var win = opt_window;
  if (!win && typeof window != 'undefined') {
    win = window;
  }

  // Initialize the global error handler.
  if (win) {
    var onerror = win.onerror;
    win.onerror = function(message, fileName, lineNumber) {
      // Call any existing onerror handlers.
      if (onerror) {
        onerror(message, fileName, lineNumber);
      }

      var error = new Error(message);
      error.stack = error.name + ': ' + error.message + '\n\t' + fileName +
          ':' + lineNumber;
      process.emit(webdriver.process.UNCAUGHT_EXCEPTION, error);
    };

    // Initialize the environment variable map by parsing the current URL query
    // string.
    if (win.location) {
      var data = new goog.Uri(win.location).getQueryData();
      goog.array.forEach(data.getKeys(), function(key) {
        var values = data.getValues(key);
        process.env[key] = values.length == 0 ? '' :
                           values.length == 1 ? values[0] :
                           goog.json.serialize(values);
      });
    }
  }

  // Initialize the nextTick function.
  process.nextTick = function(fn) {
    setTimeout(fn, 0);
  };

  return process;
};


/**
 * The global process object to use. Will either be Node's global
 * {@code process} object, or an approximation of it for use in a browser
 * environment.
 * @type {!Object}
 * @const
 * @private
 */
webdriver.process.PROCESS_ = webdriver.process.IS_NATIVE_PROCESS_ ? process :
    webdriver.process.initBrowserProcess_();