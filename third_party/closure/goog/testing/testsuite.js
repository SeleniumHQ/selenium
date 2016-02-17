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

goog.require('goog.labs.testing.Environment');
goog.require('goog.testing.TestCase');


/**
 * Runs the lifecycle methods (setUp, tearDown, etc.) and test* methods from
 * the given object. For use in tests that are written as JavaScript modules
 * or goog.modules.
 *
 * @param {!Object<string, function()>} obj An object with one or more test
 *     methods, and optionally a setUp and tearDown method, etc.
 */
goog.testing.testSuite = function(obj) {
  var testCase = goog.labs.testing.Environment.getTestCaseIfActive() ||
      new goog.testing.TestCase(document.title);
  testCase.setTestObj(obj);
  goog.testing.TestCase.initializeTestRunner(testCase);
};
