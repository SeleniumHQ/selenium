// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Provides the built-in decorators: is, describedAs, anything.
 */

goog.provide('goog.labs.testing.AnythingMatcher');

goog.require('goog.labs.testing.Matcher');


/**
 * The Anything matcher. Matches all possible inputs.
 *
 * @constructor
 * @implements {goog.labs.testing.Matcher}
 * @final
 */
goog.labs.testing.AnythingMatcher = function() {};


/**
 * Matches anything. Useful if one doesn't care what the object under test is.
 *
 * @override
 */
goog.labs.testing.AnythingMatcher.prototype.matches = function(actualObject) {
  return true;
};


/**
 * This method is never called but is needed so AnythingMatcher implements the
 * Matcher interface.
 *
 * @override
 */
goog.labs.testing.AnythingMatcher.prototype.describe = function(actualObject) {
  throw new Error('AnythingMatcher should never fail!');
};


/**
 * Returns a matcher that matches anything.
 *
 * @return {!goog.labs.testing.AnythingMatcher} A AnythingMatcher.
 */
var anything = goog.labs.testing.AnythingMatcher.anything = function() {
  return new goog.labs.testing.AnythingMatcher();
};


/**
 * Returns any matcher that is passed to it (aids readability).
 *
 * @param {!goog.labs.testing.Matcher} matcher A matcher.
 * @return {!goog.labs.testing.Matcher} The wrapped matcher.
 */
var is = goog.labs.testing.AnythingMatcher.is = function(matcher) {
  return matcher;
};


/**
 * Returns a matcher with a customized description for the given matcher.
 *
 * @param {string} description The custom description for the matcher.
 * @param {!goog.labs.testing.Matcher} matcher The matcher.
 * @return {!goog.labs.testing.Matcher} The matcher with custom description.
 */
var describedAs = goog.labs.testing.AnythingMatcher.describedAs = function(
    description, matcher) {
  return /** @type {!goog.labs.testing.Matcher} */ ({
    matches: function(value) {
      return matcher.matches(value);
    },
    describe: function() {
      return description;
    }
  });
};
