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
goog.provide('goog.testing.JsTdTestCaseAdapter');

goog.require('goog.async.run');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');


/**
 * @param {string} testCaseName The name of the test case.
 * @param {boolean} condition A condition to determine whether to run the tests.
 * @param {?=} opt_proto An optional prototype object for the test case.
 * @return {!Function}
 * @private
 */
goog.testing.JsTdTestCaseAdapter.TestCaseFactory_ = function(
    testCaseName, condition, opt_proto) {
  /** @constructor */
  var T = function() {};
  if (opt_proto) T.prototype = opt_proto;
  T.displayName = testCaseName;

  goog.async.run(function() {
    var t = condition ? new T() : {};
    var testCase = new goog.testing.TestCase(testCaseName);
    testCase.shouldRunTests = function() { return condition; };
    testCase.setTestObj(t);
    goog.testing.TestCase.initializeTestRunner(testCase);
  });

  return T;
};

// --- conditionally add polyfills for the basic JSTD API ---


/**
 * @param {string} testCaseName The name of the test case.
 * @param {?=} opt_proto An optional prototype object for the test case.
 * @return {!Function}
 * @suppress {duplicate}
 */
var TestCase = TestCase || function(testCaseName, opt_proto) {
  return goog.testing.JsTdTestCaseAdapter.TestCaseFactory_(
      testCaseName, true, opt_proto);
};


/**
 * @param {string} testCaseName The name of the test case.
 * @param {boolean} condition A condition to determine whether to run the tests.
 * @param {?=} opt_proto An optional prototype object for the test case.
 * @return {!Function}
 * @suppress {duplicate}
 */
var ConditionalTestCase =
    ConditionalTestCase || function(testCaseName, condition, opt_proto) {
      return goog.testing.JsTdTestCaseAdapter.TestCaseFactory_(
          testCaseName, condition, opt_proto);
    };


// TODO(johnlenz): AsyncTestCase and AsyncConditionalTestCase are
// placeholders for an implementation that actually understands the
// JsTestDriver AsyncTestCases which are non-trivial:
// see https://code.google.com/p/js-test-driver/wiki/AsyncTestCase


/**
 * @param {string} testCaseName The name of the test case.
 * @param {?=} opt_proto An optional prototype object for the test case.
 * @return {!Function}
 * @suppress {duplicate}
 */
var AsyncTestCase = AsyncTestCase || TestCase;


/**
 * @param {string} testCaseName The name of the test case.
 * @param {boolean} condition A condition to determine whether to run the tests.
 * @param {?=} opt_proto An optional prototype object for the test case.
 * @return {!Function}
 * @suppress {duplicate}
 */
var AsyncConditionalTestCase = AsyncConditionalTestCase || ConditionalTestCase;


// The API is also available under the jstestdriver namespace.

var jstestdriver = jstestdriver || {};
if (!jstestdriver.testCaseManager) {
  /** A jstestdriver API polyfill. */
  jstestdriver.testCaseManager = {
    TestCase: TestCase,
    ConditionalTestCase: ConditionalTestCase,
    AsyncTestCase: AsyncTestCase,
    AsyncConditionalTestCase: AsyncConditionalTestCase
  };
}
