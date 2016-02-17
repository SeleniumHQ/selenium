// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Parallel closure_test_suite test file. This test is not
 * intended to be ran or depended on directly.
 *
 */

goog.module('goog.testing.parallelClosureTestSuite');
goog.setTestOnly('goog.testing.parallelClosureTestSuite');

var Promise = goog.require('goog.Promise');
var events = goog.require('goog.events');
var MultiTestRunner = goog.require('goog.testing.MultiTestRunner');
var TestCase = goog.require('goog.testing.TestCase');
var jsunit = goog.require('goog.testing.jsunit');
var testSuite = goog.require('goog.testing.testSuite');

var testRunner;


/**
 * @typedef {{
 *   totalTests: number,
 *   totalFailures: number,
 *   failureReports: string,
 *   allResults: !Object<string, !Array<string>>
 * }}
 */
var ParallelTestResults;


/**
 * Processes the test results returned from MultiTestRunner and creates a
 * consolidated result object that the test runner understands.
 * @param {!Array<!Object<string,!Array<string>>>} testResults The list of
 *     individual test results from MultiTestRunner.
 * @return {!ParallelTestResults} Flattened test report for all tests.
 */
function processAllTestResults(testResults) {
  var totalTests = 0;
  var totalFailed = 0;
  var allResults = {};
  var failureReports = '';

  for (var i = 0; i < testResults.length; i++) {
    var result = testResults[i];
    for (var testName in result) {
      totalTests++;
      allResults[testName] = result[testName];
      var failures = result[testName];
      if (failures.length) {
        totalFailed++;
        for (var j = 0; j < failures.length; j++) {
          failureReports += failures[j] + '\n';
        }
      }
    }
  }

  return {
    totalTests: totalTests,
    totalFailures: totalFailed,
    failureReports: failureReports,
    allResults: allResults
  };
}

var testObj = {
  setUpPage: function() {
    // G_parallelTestRunner is exported in gen_parallel_test_html.py.
    var timeout = goog.global['G_parallelTestRunner']['testTimeout'];
    var allTests = goog.global['G_parallelTestRunner']['allTests'];
    var parallelFrames = goog.global['G_parallelTestRunner']['parallelFrames'];
    var parallelTimeout =
        goog.global['G_parallelTestRunner']['parallelTimeout'];

    // Create a test runner and render it.
    testRunner = new MultiTestRunner()
                     .setName(document.title)
                     .setBasePath('/google3/')
                     .setPoolSize(parallelFrames)
                     .setStatsBucketSizes(5, 500)
                     .setTimeout(timeout * 1000)
                     .addTests(allTests);

    testRunner.render(document.getElementById('runner'));

    // There's only a single test method that runs all the tests, so this
    // promiseTimeout is effectively the timeout of the entire test suite
    TestCase.getActiveTestCase().promiseTimeout = parallelTimeout * 1000;

    // Return testRunner for testing purposes.
    return testRunner;
  },

  testRunAllTests: function() {
    var failurePromise = new Promise(function(resolve, reject) {
      events.listen(testRunner, 'testsFinished', resolve);
    });

    testRunner.start();

    var allResults = {};
    // TestPoller.java invokes this to get test results for sponge. We override
    // it and return the results of each individual test instead of the
    // containing "testRunAllTests".
    window['G_testRunner']['getTestResults'] = function() {
      return allResults;
    };

    return failurePromise.then(function(failures) {
      var testResults = processAllTestResults(failures['allTestResults']);
      allResults = testResults.allResults;
      if (testResults.totalFailures) {
        fail(
            testResults.totalFailures + ' of ' + testResults.totalTests +
            ' test(s) failed!\n\n' + testResults.failureReports);
      }
    });
  }
};

// G_parallelTestRunner should only be present when being run from a parallel
// closure_test_suite target. If it's not present, we're including this file
// to be unit tested.
if (goog.global['G_parallelTestRunner']) {
  testSuite(testObj);
}

// Export test methods/vars so they can also be tested.
testObj['processAllTestResults'] = processAllTestResults;
exports = testObj;
