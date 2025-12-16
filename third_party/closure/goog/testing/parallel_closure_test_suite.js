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

const MultiTestRunner = goog.require('goog.testing.MultiTestRunner');
const Promise = goog.require('goog.Promise');
const TestCase = goog.require('goog.testing.TestCase');
const asserts = goog.require('goog.asserts');
const events = goog.require('goog.events');
const json = goog.require('goog.json');
const testSuite = goog.require('goog.testing.testSuite');

/** @type {?MultiTestRunner} */
let testRunner = null;


/**
 * @typedef {{
 *   totalTests: number,
 *   totalFailures: number,
 *   failureReports: string,
 *   allResults: !Object<string, !Array<string>>
 * }}
 */
let ParallelTestResults;


/**
 * Processes the test results returned from MultiTestRunner and creates a
 * consolidated result object that the test runner understands.
 * @param {!Array<!Object<string,!Array<string>>>} testResults The list of
 *     individual test results from MultiTestRunner.
 * @return {!ParallelTestResults} Flattened test report for all tests.
 */
function processAllTestResults(testResults) {
  let totalTests = 0;
  let totalFailed = 0;
  const allResults = {};
  let failureReports = '';

  for (let i = 0; i < testResults.length; i++) {
    const result = testResults[i];
    for (const testName in result) {
      totalTests++;
      allResults[testName] = result[testName];
      const failures = result[testName];
      if (failures.length) {
        totalFailed++;
        for (let j = 0; j < failures.length; j++) {
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

const testObj = {
  setUpPage: function() {
    // G_parallelTestRunner is exported in gen_parallel_test_html.py.
    const timeout = goog.global['G_parallelTestRunner']['testTimeout'];
    const allTests = goog.global['G_parallelTestRunner']['allTests'];
    const parallelFrames =
        goog.global['G_parallelTestRunner']['parallelFrames'];
    const parallelTimeout =
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
    asserts.assert(testRunner, 'Was "setUpPage" called?');

    const failurePromise = new Promise(function(resolve, reject) {
      events.listen(testRunner, 'testsFinished', resolve);
    });

    testRunner.start();

    let allResults = {};
    // TestPoller.java invokes this to get test results for sponge. We override
    // it and return the results of each individual test instead of the
    // containing "testRunAllTests".
    window['G_testRunner']['getTestResults'] = function() {
      return allResults;
    };

    window['G_testRunner']['getTestResultsAsJson'] = function() {
      return json.serialize(allResults);
    };

    return failurePromise.then(function(failures) {
      const testResults = processAllTestResults(failures['allTestResults']);
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
