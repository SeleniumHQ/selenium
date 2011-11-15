// Copyright 2011 WebDriver committers
// Copyright 2011 Google Inc.
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

goog.provide('webdriver.asserts');
goog.provide('webdriver.asserts.Matcher');

goog.require('goog.array');
goog.require('webdriver.promise');


/**
 * The asserts object.
 * @type {!webdriver.EventEmitter}
 * @const
 */
webdriver.asserts = new webdriver.EventEmitter();


/**
 * Emitted when a call to {@code expectThat} fails. Will be emitted with the
 * failure error.
 * @type {string}
 * @const
 */
webdriver.asserts.EXPECTATION_FAILURE = 'expectationFailure';


/**
 * Describes a matcher used in various assertions.
 *
 * @param {string} description A description that describes this matcher. Should
 *     complete the following sentence: "Expected ...."
 * @param {function(*):boolean} predicate A predicate function that applies this
 *     matcher to any value. Should return whether the value is a match.
 */
webdriver.asserts.Matcher = function(description, predicate) {

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
webdriver.asserts.Matcher.isMatcher = function(value) {
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
 * @param {webdriver.asserts.Matcher=} opt_matcher The matcher to use; ignored
 *     unless this function is invoked with three arguments.
 * @return {!webdriver.promise.Promise} The result of the matcher test.
 */
webdriver.asserts.applyMatcher = function(failureMessageOrActualValue,
                                          actualValueOrMatcher,
                                          opt_matcher) {
  var args = goog.array.slice(arguments, 0);

  var message = args.length > 2 ? args.shift() : '';
  if (message) message += '\n';

  var actualValue = args.shift();
  var matcher = args.shift();

  if (!webdriver.asserts.Matcher.isMatcher(matcher)) {
    throw new Error('Invalid matcher: ' + goog.typeOf(matcher));
  }

  return webdriver.promise.when(actualValue, function(value) {
    if (!matcher.predicate(value)) {
      var error = [];
      if (message) {
        error.push(message, '\n');
      }
      error.push('Expected ', matcher.description,
          '\n but was ', value, webdriver.asserts.typeOf_(value));
      throw new Error(error.join(''));
    }
  });
};


/**
 * @param {*} value The value to query.
 * @return {string} The type of the value.
 */
webdriver.asserts.typeOf_ = function(value) {
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
 * @param {webdriver.asserts.Matcher=} opt_matcher The matcher to use; ignored
 *     unless this function is invoked with three arguments.
 */
webdriver.asserts.assertThat = function(failureMessageOrActualValue,
                                        actualValueOrMatcher,
                                        opt_matcher) {
  webdriver.asserts.applyMatcher.apply(null, arguments);
};


/**
 * Checks that a matcher accepts a given value. If the value is rejected by
 * the matcher, a {@link webdriver.asserts.EXPECTATION_FAILURE} event will be
 * emitted by this module.
 *
 * @param {*} failureMessageOrActualValue Either a failure message or the value
 *     to apply to the given matcher.
 * @param {*} actualValueOrMatcher Either the value to apply to the given
 *     matcher, or the matcher itself.
 * @param {webdriver.asserts.Matcher=} opt_matcher The matcher to use; ignored
 *     unless this function is invoked with three arguments.
 */
webdriver.asserts.expectThat = function(failureMessageOrActualValue,
                                        actualValueOrMatcher,
                                        opt_matcher) {
  webdriver.asserts.applyMatcher.apply(null, arguments).
      addErrback(function(e) {
        webdriver.asserts.emit(webdriver.asserts.EXPECTATION_FAILURE, e);
      });
};


webdriver.asserts.equalTo = function(a) {
  return new webdriver.asserts.Matcher('' +
      'to equal ' + a + webdriver.asserts.typeOf_(a),
      function(b) {
        return a === b;
      });
};


webdriver.asserts.not = function(matcher) {
  return new webdriver.asserts.Matcher('not ' + matcher.description,
      function(value) {
        return !matcher.predicate(value);
      });
};


goog.exportSymbol('assertThat', webdriver.asserts.assertThat);
goog.exportSymbol('expectThat', webdriver.asserts.expectThat);
goog.exportSymbol('equalTo', webdriver.asserts.equalTo);
goog.exportSymbol('equals', webdriver.asserts.equalTo);
goog.exportSymbol('not', webdriver.asserts.not);
