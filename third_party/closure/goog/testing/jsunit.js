// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for working with JsUnit.  Writes out the JsUnit file
 * that needs to be included in every unit test.
 *
 * Testing code should not have dependencies outside of goog.testing so as to
 * reduce the chance of masking missing dependencies.
 *
 */

goog.setTestOnly('goog.testing.jsunit');
goog.provide('goog.testing.jsunit');

goog.require('goog.dom.TagName');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.TestRunner');


/**
 * @define {boolean} If this code is being parsed by JsTestC, we let it disable
 * the onload handler to avoid running the test in JsTestC.
 */
goog.define('goog.testing.jsunit.AUTO_RUN_ONLOAD', true);


/**
 * @define {number} Sets a delay in milliseconds after the window onload event
 * and running the tests. Used to prevent interference with Selenium and give
 * tests with asynchronous operations time to finish loading.
 */
goog.define('goog.testing.jsunit.AUTO_RUN_DELAY_IN_MS', 500);


(function() {
  // Only allow one global test runner to be created on a page.
  if (goog.global['G_testRunner'] instanceof goog.testing.TestRunner) {
    return;
  }

  // Increases the maximum number of stack frames in Google Chrome from the
  // default 10 to 50 to get more useful stack traces.
  Error.stackTraceLimit = 50;

  // Store a reference to the window's timeout so that it can't be overridden
  // by tests.
  /** @type {!Function} */
  var realTimeout = window.setTimeout;

  // Create a test runner.
  var tr = new goog.testing.TestRunner();

  // Export it so that it can be queried by Selenium and tests that use a
  // compiled test runner.
  goog.exportSymbol('G_testRunner', tr);
  goog.exportSymbol('G_testRunner.initialize', tr.initialize);
  goog.exportSymbol('G_testRunner.isInitialized', tr.isInitialized);
  goog.exportSymbol('G_testRunner.isFinished', tr.isFinished);
  goog.exportSymbol('G_testRunner.isSuccess', tr.isSuccess);
  goog.exportSymbol('G_testRunner.getReport', tr.getReport);
  goog.exportSymbol('G_testRunner.getRunTime', tr.getRunTime);
  goog.exportSymbol('G_testRunner.getNumFilesLoaded', tr.getNumFilesLoaded);
  goog.exportSymbol('G_testRunner.setStrict', tr.setStrict);
  goog.exportSymbol('G_testRunner.logTestFailure', tr.logTestFailure);
  goog.exportSymbol('G_testRunner.getTestResults', tr.getTestResults);
  goog.exportSymbol(
      'G_testRunner.getTestResultsAsJson', tr.getTestResultsAsJson);

  // Export debug as a global function for JSUnit compatibility.  This just
  // calls log on the current test case.
  if (!goog.global['debug']) {
    goog.exportSymbol('debug', goog.bind(tr.log, tr));
  }

  // If the application has defined a global error filter, set it now.  This
  // allows users who use a base test include to set the error filter before
  // the testing code is loaded.
  if (goog.global['G_errorFilter']) {
    tr.setErrorFilter(goog.global['G_errorFilter']);
  }

  var maybeGetStack = function(error) {
    if (typeof error == 'object') {
      var stack = error.stack;
      if (stack && typeof stack == 'string') {
        // non-empty string
        return stack;
      }
    }
    return '';
  };

  // Add an error handler to report errors that may occur during
  // initialization of the page.
  var onerror = window.onerror;
  window.onerror = function(messageOrEvent, url, line) {
    // TODO(johnlenz): fix this function parameters once the "onerror"
    // definition has been corrected.
    // colno and errObj were added later.
    var colno = arguments[3];
    var errObj = arguments[4];
    // Call any existing onerror handlers, except our boot handler.
    if (onerror && onerror != window["__onerror_at_boot"]) {
      onerror.apply(window, arguments);
    }
    var stack = maybeGetStack(errObj || messageOrEvent);
    if (stack) {
      tr.logError(stack);
    } else if (typeof messageOrEvent == 'object') {
      var error = messageOrEvent;
      // Some older webkit browsers pass an event object as the only argument
      // to window.onerror.  It doesn't contain an error message, url or line
      // number.  We therefore log as much info as we can.
      if (error.target && error.target.tagName == goog.dom.TagName.SCRIPT) {
        tr.logError('UNKNOWN ERROR: Script ' + error.target.src);
      } else {
        tr.logError('UNKNOWN ERROR: No error information available.');
      }
    } else {
      // Add the column if it is available, older browsers won't have it.
      var colstr = colno != null ? '\nColumn: ' + colno : '';
      tr.logError(
          'JS ERROR: ' + messageOrEvent + '\nURL: ' + url + '\nLine: ' + line +
          colstr);
    }
  };

  /**
   * The onerror handler that may have been set by the test runner.
   *  @type {?function(string, string=, number=, number=, Object=)}
   */
  window["__onerror_at_boot"] = window["__onerror_at_boot"] || null;
  /**
   * The arguments for any call to window.onerror occuring before this point.
   * @type {Array<!Array<?>>} */
  window["__errors_since_boot"] = window["__errors_since_boot"] || null;

  if (window["__onerror_at_boot"]) {
    if (window['__errors_since_boot']) {
      for (var i = 0; i < window['__errors_since_boot'].length; i++) {
        var args = window['__errors_since_boot'][i];
        window.onerror.apply(window, args);
      }
    }
    // http://perfectionkills.com/understanding-delete/#ie_bugs
    window["__onerror_at_boot"] = null;
  }

  // Create an onload handler, if the test runner hasn't been initialized then
  // no test has been registered with the test runner by the test file.  We
  // then create a new test case and auto discover any tests in the global
  // scope. If this code is being parsed by JsTestC, we let it disable the
  // onload handler to avoid running the test in JsTestC.
  if (goog.testing.jsunit.AUTO_RUN_ONLOAD) {
    var onload = window.onload;
    window.onload = function(e) {
      // Call any existing onload handlers.
      if (onload) {
        onload(e);
      }
      // Wait so that we don't interfere with WebDriver.
      realTimeout(function() {
        if (!tr.initialized) {
          var testCase = new goog.testing.TestCase(document.title);
          goog.testing.TestCase.initializeTestRunner(testCase);
        }
        tr.execute();
      }, goog.testing.jsunit.AUTO_RUN_DELAY_IN_MS);
      window.onload = null;
    };
  }
})();
