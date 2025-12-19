// Copyright 2017 The Closure Library Authors. All Rights Reserved.
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
 * Utilities intended for testing assertion functions.
 */

goog.module('goog.testing.safe.assertionFailure');
goog.setTestOnly();

const asserts = goog.require('goog.asserts');
const testingAsserts = goog.require('goog.testing.asserts');

/**
 * Tests that f raises exactaly one AssertionError and runs f while disabling
 * assertion errors. This is only intended to use in a few test files that is
 * guaranteed that will not affect anything for convenience. It is not intended
 * for broader consumption outside of those test files. We do not want to
 * encourage this pattern.
 *
 * @param {function():*} f function with a failing assertion.
 * @param {string=} opt_message error message the expected error should contain
 * @param {number=} opt_number of time the assertion should throw. Default is 1.
 * @return {*} the return value of f.
 */
exports.withAssertionFailure = function(f, opt_message, opt_number) {
  try {
    if (!opt_number) {
      opt_number = 1;
    }
    var assertions = 0;
    asserts.setErrorHandler(function(e) {
      asserts.assertInstanceof(
          e, asserts.AssertionError, 'A none assertion failure is thrown');
      if (opt_message) {
        testingAsserts.assertContains(opt_message, e.message);
      }
      assertions += 1;
    });
    var result = f();
    asserts.assert(
        assertions == opt_number, '%d assertion failed.', assertions);
    return result;
  } finally {
    asserts.setErrorHandler(asserts.DEFAULT_ERROR_HANDLER);
  }
};
