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

// Copyright 2009 Google Inc. All Rights Reserved.

/**
 * @fileoverview Utility methods for Protocol Buffer 2 implementation.
 */

goog.provide('goog.proto2.Util');

goog.require('goog.asserts');

/**
 * @define {boolean} Defines a PBCHECK constant that can be turned off by
 * clients of PB2. This for is clients that do not want assertion/checking
 * running even in non-COMPILED builds.
 */
goog.proto2.Util.PBCHECK = !COMPILED;

/**
 * Asserts that the given condition is true, if and only if the PBCHECK
 * flag is on.
 *
 * @param {*} condition The condition to check.
 * @param {string} opt_message Error message in case of failure.
 * @throws {Error} Assertion failed, the condition evaluates to false.
 */
goog.proto2.Util.assert = function(condition, opt_message) {
  if (goog.proto2.Util.PBCHECK) {
    goog.asserts.assert(condition, opt_message);
  }
};


/**
 * Returns true if debug assertions (checks) are on.
 *
 * @return {boolean} The value of the PBCHECK constant.
 */
goog.proto2.Util.conductChecks = function() {
  return goog.proto2.Util.PBCHECK;
};
