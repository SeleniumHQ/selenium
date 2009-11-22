// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved.

/**
 * @fileoverview Utilities for working with JsUnit.  Writes out the JsUnit file
 * that needs to be included in every unit test.
 *
 * Testing code should not have dependencies outside of goog.testing so as to
 * reduce the chance of masking missing dependencies.
 *
 */

goog.provide('goog.testing.jsunit');

goog.require('goog.testing.TestCase');
goog.require('goog.testing.TestRunner');


/**
 * Base path for JsUnit app files, relative to Closure's base path.
 * @type {string}
 */
goog.testing.jsunit.BASE_PATH =
    '../../third_party/java/jsunit/core/app/';


/**
 * Filename for the core JS Unit script.
 * @type {string}
 */
goog.testing.jsunit.CORE_SCRIPT =
    goog.testing.jsunit.BASE_PATH + 'jsUnitCore.js';


/**
 * @define {boolean} If this code is being parsed by JsTestC, we let it disable
 * the onload handler to avoid running the test in JsTestC.
 */
goog.testing.jsunit.AUTO_RUN_ONLOAD = true;


(function() {

  // Store a reference to the window's timeout so that it can't be overridden
  // by tests.
  var realTimeout = window.setTimeout;

  // Check for JsUnit's test runner (need to check for >2.2 and <=2.2)
  if (top['JsUnitTestManager'] || top['jsUnitTestManager']) {
    // Running inside JsUnit so add support code.
    var path = goog.basePath + goog.testing.jsunit.CORE_SCRIPT;
    document.write('<script type="text/javascript" src="' +
                  path + '"></' + 'script>');

  } else {

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

    // Add an error handler to report errors that may occur during
    // initialization of the page.
    window.onerror = function(error, url, line) {
      if (typeof error == 'object') {
        // Webkit started passing an event object as the only argument to
        // window.onerror.  It doesn't contain an error message, url or line
        // number.  We therefore log as much info as we can.
        if (error.target && error.target.tagName == 'SCRIPT') {
          tr.logError('UNKNOWN ERROR: Script ' + error.target.src);
        } else {
          tr.logError('UNKNOWN ERROR: No error information available.');
        }
      } else {
        tr.logError('JS ERROR: ' + error + '\nURL: ' + url + '\nLine: ' + line);
      }
    };

    // Create an onload handler, if the test runner hasn't been initialized then
    // no test has been registered with the test runner by the test file.  We
    // then create a new test case and auto discover any tests in the global
    // scope. If this code is being parsed by JsTestC, we let it disable the
    // onload handler to avoid running the test in JsTestC.
    if (goog.testing.jsunit.AUTO_RUN_ONLOAD) {
      window.onload = function() {
        // Wait 500ms longer so that we don't interfere with Selenium.
        realTimeout(function() {
          if (!tr.initialized) {
            var test = new goog.testing.TestCase(document.title);
            test.autoDiscoverTests();
            tr.initialize(test);
          }
          tr.execute();
        }, 500);
        window.onload = null;
      };
    }
  }
})();
