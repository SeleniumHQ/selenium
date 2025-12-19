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
goog.provide('goog.testing.testSuite');
goog.setTestOnly('goog.testing.testSuite');

goog.require('goog.labs.testing.Environment');
goog.require('goog.testing.TestCase');

/**
 * @typedef {{order: (!goog.testing.TestCase.Order|undefined)}}
 */
var TestSuiteOptions;

/**
 * Runs the lifecycle methods (setUp, tearDown, etc.) and test* methods from
 * the given object. For use in tests that are written as JavaScript modules
 * or goog.modules.
 *
 * @param {!Object<string, function()|!Object>} obj An object with one or more
 *     test methods, and optional setUp, tearDown and getTestName methods. The
 *     object may also have nested Objects (named like tests, i.e.
 *     `testNestedSuite: {}`) that will be treated as nested testSuites. Any
 *     additional setUp will run after parent setUps, any additional tearDown
 *     will run before parent tearDowns. The this object refers to the object
 *     that the functions were defined on, not the full testSuite object.
 * @param {!TestSuiteOptions=} opt_options Optional options object which can
 *     be used to set the sort order for running tests.
 */
goog.testing.testSuite = function(obj, opt_options) {
  if (goog.isFunction(obj)) {
    throw new Error(
        'testSuite should be called with an object. ' +
        'Did you forget to initialize a class?');
  }

  if (goog.testing.testSuite.initialized_) {
    throw new Error('Only one TestSuite can be active');
  }
  goog.testing.testSuite.initialized_ = true;

  var testCase = goog.labs.testing.Environment.getTestCaseIfActive() ||
      new goog.testing.TestCase(document.title);
  testCase.setTestObj(obj);

  var options = opt_options || {};
  if (options.order) {
    testCase.setOrder(options.order);
  }
  goog.testing.TestCase.initializeTestRunner(testCase);
};

/**
 * True iff the testSuite has been created.
 * @private {boolean}
 */
goog.testing.testSuite.initialized_ = false;
