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


// Load Closure's predefined matchers.
goog.require('goog.labs.testing.AllOfMatcher');
goog.require('goog.labs.testing.AnyOfMatcher');
goog.require('goog.labs.testing.AnythingMatcher');
goog.require('goog.labs.testing.CloseToMatcher');
goog.require('goog.labs.testing.ContainsStringMatcher');
goog.require('goog.labs.testing.EndsWithMatcher');
goog.require('goog.labs.testing.GreaterThanEqualToMatcher');
goog.require('goog.labs.testing.GreaterThanMatcher');
goog.require('goog.labs.testing.LessThanEqualToMatcher');
goog.require('goog.labs.testing.LessThanMatcher');
goog.require('goog.labs.testing.InstanceOfMatcher');
goog.require('goog.labs.testing.IsNotMatcher');
goog.require('goog.labs.testing.IsNullMatcher');
goog.require('goog.labs.testing.IsNullOrUndefinedMatcher');
goog.require('goog.labs.testing.IsUndefinedMatcher');
goog.require('goog.labs.testing.RegexMatcher');
goog.require('goog.labs.testing.StartsWithMatcher');


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
exports.allOf = function(var_args) {
  var matchers = goog.array.toArray(arguments);
  return new goog.labs.testing.AllOfMatcher(matchers);
};
exports.and = exports.allOf;


/**
 * Creates a matcher that accepts a value if and only if at least one of its
 * component matchers accepts the value.
 * @param {...!goog.labs.testing.Matcher} var_args The matchers to apply.
 * @return {!goog.labs.testing.Matcher} The new matcher.
 */
exports.anyOf = function(var_args) {
  var matchers = goog.array.toArray(arguments);
  return new goog.labs.testing.AnyOfMatcher(matchers);
};
exports.or = exports.anyOf;


/**
 * @return {!goog.labs.testing.Matcher} A matcher that will accept any input
 *     value.
 */
exports.anything = function() {
  return new goog.labs.testing.AnythingMatcher();
};


/**
 * Returns the input matcher; can be used to improve readability.
 * Example:
 *   assertThat(foo, is(instanceofClass(Foo)));
 *
 * @param {!goog.labs.testing.Matcher} matcher The matcher to wrap.
 * @return {!goog.labs.testing.Matcher} The wrapped matcher.
 */
exports.is = function(matcher) {
  return matcher;
};


/**
 * Creates a matcher that negates the result of another.
 * @param {!goog.labs.testing.Matcher} matcher The matcher to negate.
 * @return {!goog.labs.testing.Matcher} The new matcher.
 */
exports.isNot = function(matcher) {
  return new goog.labs.testing.IsNotMatcher(matcher);
};
exports.not = exports.isNot;


/**
 * @param {number} expectedValue The expected value.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts values greater
 *     than the given value.
 */
exports.greaterThan = function(expectedValue) {
  return new goog.labs.testing.GreaterThanMatcher(expectedValue);
};


/**
 * @param {number} expectedValue The expected value.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts values greater
 *     than or equal to the given value.
 */
exports.greaterThanEqualTo = function(expectedValue) {
  return new goog.labs.testing.GreaterThanEqualToMatcher(expectedValue);
};


/**
 * @param {number} expectedValue The expected value.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts values less
 *     than the given value.
 */
exports.lessThan = function(expectedValue) {
  return new goog.labs.testing.LessThanMatcher(expectedValue);
};


/**
 * @param {number} expectedValue The expected value.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts values less
 *     than or equal to the given value.
 */
exports.lessThanEqualTo = function(expectedValue) {
  return new goog.labs.testing.LessThanEqualToMatcher(expectedValue);
};


/**
 * @param {number} value The expected value.
 * @param {number} range The maximum allowed difference from the expected
 *     value.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts numbers within
 *     a given range of the expected value.
 */
exports.closeTo = function(value, range) {
  return new goog.labs.testing.CloseToMatcher(value, range);
};


/**
 * @param {!Function} ctor The constructor for the expected class.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts objects that
 *     are an instance of the given class.
 */
exports.instanceOfClass = function(ctor) {
  return new goog.labs.testing.InstanceOfMatcher(ctor);
};


/**
 * @return {!goog.labs.testing.Matcher} A matcher that accepts null values.
 */
exports.isNull = function() {
  return new goog.labs.testing.IsNullMatcher();
};


/**
 * @return {!goog.labs.testing.Matcher} A matcher that accepts null undefined
 *     or values.
 */
exports.isNullOrUndefined = function() {
  return new goog.labs.testing.IsNullOrUndefinedMatcher();
};


/**
 * @return {!goog.labs.testing.Matcher} A matcher that accepts undefined
 *     values.
 */
exports.isUndefined = function() {
  return new goog.labs.testing.IsUndefinedMatcher();
};


/**
 * @param {string} substring The expected substring.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts strings
 *     containing the given substring.
 */
exports.containsString = function(substring) {
  return new goog.labs.testing.ContainsStringMatcher(substring);
};


/**
 * @param {string} expectedSuffix The expected string suffix.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts strings ending
 *     with the given suffix.
 */
exports.endsWith = function(expectedSuffix) {
  return new goog.labs.testing.EndsWithMatcher(expectedSuffix);
};


/**
 * @param {!RegExp} regex The regex to test against.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts strings matching
 *     the given regex.
 */
exports.matchesRegex = function(regex) {
  return new goog.labs.testing.RegexMatcher(regex);
};


/**
 * @param {string} expectedPrefix The expected string prefix.
 * @return {!goog.labs.testing.Matcher} A matcher that accepts strings starting
 *     with the given prefix.
 */
exports.startsWith = function(expectedPrefix) {
  return new goog.labs.testing.StartsWithMatcher(expectedPrefix);
};


/**
 * @param {*} expectedValue The expected value.
 * @return {!goog.labs.testing.Matcher} The new matcher.
 */
exports.equalTo = asserts.equalTo;
exports.equals = asserts.equalTo;
