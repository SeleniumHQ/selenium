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
 * @fileoverview Conditionally add "adapter" methods to allow JSTD test cases
 * to run under the Closure Test Runner.  The goal is to allow tests
 * to function regardless of the environment they are running under to allow
 * them to transition to the Closure test runner and allow JSTD runner to be
 * deprecated.
 */
goog.setTestOnly('goog.testing.JsTdTestCaseAdapter');
goog.provide('goog.testing.JsTdTestCaseAdapter');

goog.require('goog.async.run');
goog.require('goog.functions');
goog.require('goog.testing.JsTdAsyncWrapper');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');


/**
 * @param {string} testCaseName The name of the test case.
 * @param {function(): boolean} condition A condition to determine whether to
 *     run the tests.
 * @param {?=} opt_proto An optional prototype object for the test case.
 * @param {boolean=} opt_isAsync Whether this test is an async test using the
 *     JSTD testing queue.
 * @return {!Function}
 * @private
 */
goog.testing.JsTdTestCaseAdapter.TestCaseFactory_ = function(
    testCaseName, condition, opt_proto, opt_isAsync) {
  /** @constructor */
  var T = function() {};
  if (opt_proto) T.prototype = opt_proto;
  T.displayName = testCaseName;

  goog.async.run(function() {
    var t = new T();
    if (opt_isAsync) {
      t = goog.testing.JsTdAsyncWrapper.convertToAsyncTestObj(t);
    }
    var testCase = new goog.testing.TestCase(testCaseName);
    testCase.shouldRunTests = condition;
    testCase.setTestObj(t);
    goog.testing.TestCase.initializeTestRunner(testCase);
  });

  return T;
};


/**
 * @param {string} testCaseName The name of the test case.
 * @param {?=} opt_proto An optional prototype object for the test case.
 * @return {!Function}
 * @private
 */
goog.testing.JsTdTestCaseAdapter.TestCase_ = function(testCaseName, opt_proto) {
  return goog.testing.JsTdTestCaseAdapter.TestCaseFactory_(
      testCaseName, goog.functions.TRUE, opt_proto);
};


/**
 * @param {string} testCaseName The name of the test case.
 * @param {function(): boolean} condition A condition to determine whether to
 *     run the tests.
 * @param {?=} opt_proto An optional prototype object for the test case.
 * @return {!Function}
 * @private
 */
goog.testing.JsTdTestCaseAdapter.ConditionalTestCase_ = function(
    testCaseName, condition, opt_proto) {
  return goog.testing.JsTdTestCaseAdapter.TestCaseFactory_(
      testCaseName, condition, opt_proto);
};


/**
 * @param {string} testCaseName The name of the test case.
 * @param {?=} opt_proto An optional prototype object for the test case.
 * @return {!Function}
 * @private
 */
goog.testing.JsTdTestCaseAdapter.AsyncTestCase_ = function(
    testCaseName, opt_proto) {
  return goog.testing.JsTdTestCaseAdapter.TestCaseFactory_(
      testCaseName, goog.functions.TRUE, opt_proto, true);
};


/**
 * @param {string} testCaseName The name of the test case.
 * @param {function(): boolean} condition A condition to determine whether to
 *     run the tests.
 * @param {?=} opt_proto An optional prototype object for the test case.
 * @return {!Function}
 * @private
 */
goog.testing.JsTdTestCaseAdapter.AsyncConditionalTestCase_ = function(
    testCaseName, condition, opt_proto) {
  return goog.testing.JsTdTestCaseAdapter.TestCaseFactory_(
      testCaseName, condition, opt_proto, true);
};


// --- conditionally add polyfills for the basic JSTD API ---


/** @suppress {duplicate} */
var TestCase = TestCase || goog.testing.JsTdTestCaseAdapter.TestCase_;


/** @suppress {duplicate} */
var ConditionalTestCase = ConditionalTestCase ||
    goog.testing.JsTdTestCaseAdapter.ConditionalTestCase_;


/** @suppress {duplicate} */
var AsyncTestCase =
    AsyncTestCase || goog.testing.JsTdTestCaseAdapter.AsyncTestCase_;


/** @suppress {duplicate} */
var AsyncConditionalTestCase = AsyncConditionalTestCase ||
    goog.testing.JsTdTestCaseAdapter.AsyncConditionalTestCase_;


/** @suppress {duplicate} */
var ConditionalAsyncTestCase = ConditionalAsyncTestCase ||
    goog.testing.JsTdTestCaseAdapter.AsyncConditionalTestCase_;


// The API is also available under the jstestdriver namespace.

/** @suppress {duplicate} */
var jstestdriver = jstestdriver || {};
if (!jstestdriver.testCaseManager) {
  /** A jstestdriver API polyfill. */
  jstestdriver.testCaseManager = {
    TestCase: TestCase,
    ConditionalTestCase: ConditionalTestCase,
    AsyncTestCase: AsyncTestCase,
    AsyncConditionalTestCase: AsyncConditionalTestCase,
    ConditionalAsyncTestCase: ConditionalAsyncTestCase
  };
}
