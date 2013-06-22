// Copyright 2013 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines an assertion library that simplifies writing
 * assertions against promised values.
 *
 * ---------------------------------------------------------------------------
 * NOTE: This module is considered experimental and is subject to change,
 * or removal, at any time!
 * ---------------------------------------------------------------------------
 *
 * Sample usage:
 *
 * var driver = new webdriver.Builder().build();
 * driver.get('http://www.google.com');
 *
 * assertThat(driver.getTitle(), equals('Google'));
 */

var base = require('../_base'),
    goog = base.require('goog'),
    asserts = base.require('webdriver.testing.asserts');


// Load Closure's predefined matchers. This will define the factory functions
// in Closure's global context.
base.require('goog.labs.testing.AllOfMatcher');
base.require('goog.labs.testing.AnyOfMatcher');
base.require('goog.labs.testing.AnythingMatcher');
base.require('goog.labs.testing.CloseToMatcher');
base.require('goog.labs.testing.ContainsStringMatcher');
base.require('goog.labs.testing.EndsWithMatcher');
base.require('goog.labs.testing.GreaterThanEqualToMatcher');
base.require('goog.labs.testing.GreaterThanMatcher');
base.require('goog.labs.testing.LessThanEqualToMatcher');
base.require('goog.labs.testing.LessThanMatcher');
base.require('goog.labs.testing.InstanceOfMatcher');
base.require('goog.labs.testing.IsNotMatcher');
base.require('goog.labs.testing.IsNullMatcher');
base.require('goog.labs.testing.IsNullOrUndefinedMatcher');
base.require('goog.labs.testing.IsUndefinedMatcher');
base.require('goog.labs.testing.RegexMatcher');
base.require('goog.labs.testing.StartsWithMatcher');


// PUBLIC API


/**
 * Asserts that a matcher accepts a given value.
 * @param {*} value The value to apply a matcher to. If this value is a
 *     promise, will wait for the promise to resolve before applying the
 *     matcher.
 * @param {!goog.labs.testing.Matcher} matcher The matcher to apply.
 * @param {string=} opt_message An optional error message.
 * @return {!webdriver.promise.Promise} The assertion result.
 */
exports.assertThat = asserts.assertThat;


/**
 * Creates a matcher that accepts a value if and only if all of its component
 * matchers accept the value.
 * @param {...!goog.labs.testing.Matcher} var_args The matchers to apply.
 * @return {!goog.labs.testing.Matcher} The new matcher.
 */
exports.allOf = goog.global.allOf;


/**
 * Creates a matcher that accepts a value if and only if at least one of its
 * component matchers accepts the value.
 * @param {...!goog.labs.testing.Matcher} var_args The matchers to apply.
 * @return {!goog.labs.testing.Matcher} The new matcher.
 */
exports.anyOf = goog.global.anyOf;
exports.or = goog.global.anyOf;


/**
 * @return {!goog.labs.testing.Matcher} A matcher that will accept any input
 *     value.
 */
exports.anything = goog.global.anything;


/**
 * Returns the input matcher; can be used to improve readability.
 * Example:
 *   assertThat(foo, is(instanceofClass(Foo)));
 *
 * @param {!goog.labs.testing.Matcher} matcher The matcher to wrap.
 * @return {!goog.labs.testing.Matcher} The wrapped matcher.
 */
exports.is = goog.global.is;


/**
 * Creates a matcher that negates the result of another.
 * @param {!goog.labs.testing.Matcher} matcher The matcher to negate.
 * @return {!goog.labs.testing.Matcher} The new matcher.
 */
exports.isNot = goog.global.isNot;
exports.not = goog.global.isNot;


/**
 * @param {number} expectedValue The expected value.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts values greater
 *     than the given value.
 */
exports.greaterThan = goog.global.greaterThan;


/**
 * @param {number} expectedValue The expected value.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts values greater
 *     than or equal to the given value.
 */
exports.greaterThanEqualTo = goog.global.greaterThanEqualTo;


/**
 * @param {number} expectedValue The expected value.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts values less
 *     than the given value.
 */
exports.lessThan = goog.global.lessThan;


/**
 * @param {number} expectedValue The expected value.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts values less
 *     than or equal to the given value.
 */
exports.lessThanEqualTo = goog.global.lessThanEqualTo;


/**
 * @param {number} value The expected value.
 * @param {number} range The maximum allowed difference from the expected
 *     value.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts numbers within
 *     a given range of the expected value.
 */
exports.closeTo = goog.global.closeTo;


/**
 * @param {!Function} ctor The constructor for the expected class.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts objects that
 *     are an instance of the given class.
 */
exports.instanceOfClass = goog.global.instanceOfClass;


/**
 * @return {!goog.labs.testing.Matcher} A matcher that accepts null values.
 */
exports.isNull = goog.global.isNull;


/**
 * @return {!goog.labs.testing.Matcher} A matcher that accepts null undefined
 *     or values.
 */
exports.isNullOrUndefined = goog.global.isNullOrUndefined;


/**
 * @return {!goog.labs.testing.Matcher} A matcher that accepts undefined
 *     values.
 */
exports.isUndefined = goog.global.isUndefined;


/**
 * @param {string} substring The expected substring.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts strings
 *     containing the given substring.
 */
exports.containsString = goog.global.containsString;


/**
 * @param {string} expectedSuffix The expected string suffix.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts strings ending
 *     with the given suffix.
 */
exports.endsWith = goog.global.endsWith;


/**
 * @param {!RegExp} regex The regex to test against.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts strings matching
 *     the given regex.
 */
exports.matchesRegex = goog.global.matchesRegex;


/**
 * @param {string} expectedPrefix The expected string prefix.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts strings starting
 *     with the given prefix.
 */
exports.startsWith = goog.global.startsWith;


/**
 * @param {*} expectedValue The expected value.
 * @return {!goog.labs.testing.Matcher} The new matcher.
 */
exports.equalTo = asserts.equalTo;
exports.equals = asserts.equalTo;
