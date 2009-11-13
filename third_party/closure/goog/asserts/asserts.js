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

// Copyright 2008 Google Inc. All Rights Reserved.

/**
 * @fileoverview Utilities to check the preconditions, postconditions and
 * invariants runtime.
 *
 * Methods in this package should be given special treatment by the compiler
 * for type-inference. For example, <code>goog.asserts.assert(foo)</code>
 * will restrict <code>foo</code> to a truthy value.
 *
 */

goog.provide('goog.asserts');

// TODO: Add return values for all these functions, so that they
// can be chained like:
// eatNumber(goog.asserts.isNumber(foo));
// for more lisp-y asserts.

/**
 * Checks if the condition evaluates to true if goog.DEBUG is true.
 * @param {*} condition The condition to check.
 * @param {string} opt_message Error message in case of failure.
 * @throws {Error} Assertion failed, the condition evaluates to false.
 */
goog.asserts.assert = function(condition, opt_message) {
  if (goog.DEBUG && !condition) {
    throw Error('Assertion failed' + (opt_message ? ': ' + opt_message : ''));
  }
};


/**
 * Fails if goog.DEBUG is true. This function is useful in case when we want
 * to add a check in the unreachable area like switch-case statement:
 *
 * <pre>
 *  switch(type) {
 *    case FOO: doSomething(); break;
 *    case BAR: doSomethingElse(); break;
 *    default: goog.assert.fail('Unrecognized type: ' + type);
 *      // We have only 2 types - "default:" section is unreachable code.
 *  }
 * </pre>
 *
 * @param {string} opt_message Error message for failure.
 * @throws {Error} Failure.
 */
goog.asserts.fail = function(opt_message) {
  if (goog.DEBUG) {
    throw Error('Failure' + (opt_message ? ': ' + opt_message : ''));
  }
};


/**
 * Checks if the value is a number if goog.DEBUG is true.
 * @param {*} value The value to check.
 * @param {string} opt_message Error message in case of failure.
 * @throws {Error} Assertion failed, the condition evaluates to false.
 */
goog.asserts.assertNumber = function(value, opt_message) {
  goog.asserts.assert(goog.isNumber(value), opt_message);
};


/**
 * Checks if the value is a string if goog.DEBUG is true.
 * @param {*} value The value to check.
 * @param {string} opt_message Error message in case of failure.
 * @throws {Error} Assertion failed, the condition evaluates to false.
 */
goog.asserts.assertString = function(value, opt_message) {
  goog.asserts.assert(goog.isString(value), opt_message);
};


/**
 * Checks if the value is a function if goog.DEBUG is true.
 * @param {*} value The value to check.
 * @param {string} opt_message Error message in case of failure.
 * @throws {Error} Assertion failed, the condition evaluates to false.
 */
goog.asserts.assertFunction = function(value, opt_message) {
  goog.asserts.assert(goog.isFunction(value), opt_message);
};


/**
 * Checks if the value is an Object if goog.DEBUG is true.
 * @param {*} value The value to check.
 * @param {string} opt_message Error message in case of failure.
 * @throws {Error} Assertion failed, the condition evaluates to false.
 */
goog.asserts.assertObject = function(value, opt_message) {
  goog.asserts.assert(goog.isObject(value), opt_message);
};


/**
 * Checks if the value is an instance of the user-defined type if
 * goog.DEBUG is true.
 * @param {*} value The value to check.
 * @param {!Function} type A user-defined constructor.
 * @param {string} opt_message Error message in case of failure.
 * @throws {Error} Assertion failed, the condition evaluates to false.
 */
goog.asserts.assertInstanceof = function(value, type, opt_message) {
  goog.asserts.assert(value instanceof type, opt_message);
};
