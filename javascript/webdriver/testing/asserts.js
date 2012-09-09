// Copyright 2011 Software Freedom Conservancy. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Assertions and expectation utilities for use in WebDriver test
 * cases.
 */

goog.provide('webdriver.testing.asserts');
goog.provide('webdriver.testing.asserts.Matcher');

goog.require('goog.array');
goog.require('goog.string');
goog.require('webdriver.promise');



/**
 * Describes a matcher used in various assertions.
 *
 * @param {string} description A description that describes this matcher. Should
 *     complete the following sentence: "Expected ....".
 * @param {function(*):boolean} predicate A predicate function that applies this
 *     matcher to any value. Should return whether the value is a match.
 * @constructor
 */
webdriver.testing.asserts.Matcher = function(description, predicate) {

  /**
   * A description of this matcher.
   * @type {string}
   */
  this.description = description;

  /**
   * The predicate for this matcher.
   * @type {function(*):boolean}
   */
  this.predicate = predicate;
};


/**
 * Tests if a value can be used as a matcher.
 * @param {*} value The value to test.
 * @return {boolean} Whether the value can be considered a matcher object.
 */
webdriver.testing.asserts.Matcher.isMatcher = function(value) {
  return value && goog.isString(value.description) &&
      goog.isFunction(value.predicate);
};


/**
 * Applies a matcher to a given value. The return promise will be rejected if
 * the matcher does not match the value. This function has two signatures based
 * on the number of arguments:
 *
 * Two arguments:
 *   assertThat(actualValue, matcher)
 * Three arguments:
 *   assertThat(failureMessage, actualValue, matcher)
 *
 * @param {*} failureMessageOrActualValue Either a failure message or the value
 *     to apply to the given matcher.
 * @param {*} actualValueOrMatcher Either the value to apply to the given
 *     matcher, or the matcher itself.
 * @param {webdriver.testing.asserts.Matcher=} opt_matcher The matcher to use;
 *     ignored unless this function is invoked with three arguments.
 * @return {!webdriver.promise.Promise} The result of the matcher test.
 */
webdriver.testing.asserts.applyMatcher = function(
    failureMessageOrActualValue, actualValueOrMatcher, opt_matcher) {
  var args = goog.array.slice(arguments, 0);

  var message = args.length > 2 ? args.shift() : '';
  if (message) message += '\n';

  var actualValue = args.shift();
  var matcher = args.shift();

  if (!webdriver.testing.asserts.Matcher.isMatcher(matcher)) {
    throw new Error('Invalid matcher: ' + goog.typeOf(matcher));
  }

  return webdriver.promise.when(actualValue, function(value) {
    if (!matcher.predicate(value)) {
      var error = [];
      if (message) {
        error.push(message, '\n');
      }
      error.push('Expected ', matcher.description,
          '\n but was ', value, webdriver.testing.asserts.typeOf_(value));
      throw new Error(error.join(''));
    }
  });
};


/**
 * @param {*} value The value to query.
 * @return {string} The type of the value.
 * @private
 */
webdriver.testing.asserts.typeOf_ = function(value) {
  return ' (' + goog.typeOf(value) + ')';
};


/**
 * Asserts that a matcher accepts a given value. If the value is rejected by
 * the matcher, an unhandled promise will be reported to the global
 * {@link webdriver.promise.Application}.
 *
 * @param {*} failureMessageOrActualValue Either a failure message or the value
 *     to apply to the given matcher.
 * @param {*} actualValueOrMatcher Either the value to apply to the given
 *     matcher, or the matcher itself.
 * @param {webdriver.testing.asserts.Matcher=} opt_matcher The matcher to use;
 *     ignored unless this function is invoked with three arguments.
 */
webdriver.testing.asserts.assertThat = function(
    failureMessageOrActualValue, actualValueOrMatcher, opt_matcher) {
  webdriver.testing.asserts.applyMatcher.apply(null, arguments);
};


/**
 * Creates a matcher that inverts another matcher.
 * @param {!webdriver.testing.asserts.Matcher} matcher The matcher to invert.
 * @return {!webdriver.testing.asserts.Matcher} The new matcher.
 */
webdriver.testing.asserts.not = function(matcher) {
  return new webdriver.testing.asserts.Matcher('not ' + matcher.description,
      function(value) {
        return !matcher.predicate(value);
      });
};


/**
 * Creates a logical union of two matchers.
 * @param {!webdriver.testing.asserts.Matcher} a The first matcher in the union.
 * @param {!webdriver.testing.asserts.Matcher} b The second matcher in the
 *     union.
 * @return {!webdriver.testing.asserts.Matcher} The new matcher.
 */
webdriver.testing.asserts.or = function(a, b) {
  return new webdriver.testing.asserts.Matcher(
      a.description + ' or ' + b.description,
      function(value) {
        return a.predicate(value) || b.predicate(value);
      });
};


/**
 * Creates a matcher that does a strict equality (===) check.
 * @param {*} expected The expected value.
 * @return {!webdriver.testing.asserts.Matcher} The new matcher.
 */
webdriver.testing.asserts.equalTo = function(expected) {
  return new webdriver.testing.asserts.Matcher(
      'to equal ' + expected + webdriver.testing.asserts.typeOf_(expected),
      function(actual) {
        return expected === actual;
      });
};


/**
 * Creates a matcher that verifies a string contains a substring.
 * @param {string} expected The expected substring.
 * @return {!webdriver.testing.asserts.Matcher} The new matcher.
 */
webdriver.testing.asserts.contains = function(expected) {
  return new webdriver.testing.asserts.Matcher('to contain ' + expected,
      function(actual) {
        return goog.string.contains(actual, expected);
      });
};


/**
 * Creates a matcher that verifies a string matchess a regular expression.
 * @param {!RegExp} regex The regex to check against.
 * @return {!webdriver.testing.asserts.Matcher} The new matcher.
 */
webdriver.testing.asserts.matchesRegex = function(regex) {
  return new webdriver.testing.asserts.Matcher('to match regex ' + regex,
      function(value) {
        return !!value.match(regex);
      });
};


/**
 * Creates a matcher that verifies a string starts with another string.
 * @param {string} expected The expected string prefix.
 * @return {!webdriver.testing.asserts.Matcher} The new matcher.
 */
webdriver.testing.asserts.startsWith = function(expected) {
  return new webdriver.testing.asserts.Matcher(
      'to start with ' + expected,
      function(value) {
        return goog.string.startsWith(value, expected);
      });
};


goog.exportSymbol('assertThat', webdriver.testing.asserts.assertThat);
goog.exportSymbol('contains', webdriver.testing.asserts.contains);
goog.exportSymbol('equalTo', webdriver.testing.asserts.equalTo);
goog.exportSymbol('equals', webdriver.testing.asserts.equalTo);
goog.exportSymbol('is', webdriver.testing.asserts.equalTo);
goog.exportSymbol('matchesRegex', webdriver.testing.asserts.matchesRegex);
goog.exportSymbol('not', webdriver.testing.asserts.not);
goog.exportSymbol('or', webdriver.testing.asserts.or);
goog.exportSymbol('startsWith', webdriver.testing.asserts.startsWith);
