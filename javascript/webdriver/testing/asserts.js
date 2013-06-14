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
goog.provide('webdriver.testing.asserts.RegExpMatcher');

goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.labs.testing.AnyOfMatcher');
goog.require('goog.labs.testing.ContainsStringMatcher');
goog.require('goog.labs.testing.EqualsMatcher');
goog.require('goog.labs.testing.EqualToMatcher');
goog.require('goog.labs.testing.IsNotMatcher');
goog.require('goog.labs.testing.ObjectEqualsMatcher');
goog.require('goog.labs.testing.Matcher');
goog.require('goog.labs.testing.RegexMatcher');
goog.require('goog.labs.testing.StartsWithMatcher');
goog.require('goog.labs.testing.assertThat');
goog.require('webdriver.promise');



/**
 * Asserts that a matcher accepts a given value.  This function has two
 * signatures based on the number of arguments:
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
 * @return {!webdriver.promise.Promise} The assertion result.
 */
webdriver.testing.asserts.assertThat = function(
    failureMessageOrActualValue, actualValueOrMatcher, opt_matcher) {
  var args = goog.array.slice(arguments, 0);

  var message = args.length > 2 ? args.shift() : '';
  if (message) message += '\n';

  var actualValue = args.shift();
  var matcher = args.shift();

  return webdriver.promise.when(actualValue, function(value) {
    goog.labs.testing.assertThat(value, matcher, message);
  });
};


/**
 * Creates an equality matcher.
 * @param {*} expected The expected value.
 * @return {!goog.labs.testing.Matcher} The new matcher.
 */
webdriver.testing.asserts.equalTo = function(expected) {
  if (goog.isString(expected)) {
    return new goog.labs.testing.EqualsMatcher(expected);
  } else if (goog.isNumber(expected)) {
    return new goog.labs.testing.EqualToMatcher(expected);
  } else {
    return new goog.labs.testing.ObjectEqualsMatcher(expected);
  }
};


goog.exportSymbol('assertThat', webdriver.testing.asserts.assertThat);
// Mappings for goog.labs.testing matcher functions to the legacy
// webdriver.testing.asserts matchers.
goog.exportSymbol('contains', containsString);
goog.exportSymbol('equalTo', webdriver.testing.asserts.equalTo);
goog.exportSymbol('equals', webdriver.testing.asserts.equalTo);
goog.exportSymbol('is', webdriver.testing.asserts.equalTo);
goog.exportSymbol('not', isNot);
goog.exportSymbol('or', anyOf);
