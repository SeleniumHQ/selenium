// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview A basic pattern matcher.
 */

goog.provide('core.patternMatcher');
goog.provide('core.patternMatcher.Strategy');

goog.require('core.Error');



/**
 * @param {string} expected The expected value.
 * @param {string} actual The actual value.
 * @return {boolean} Whether the actual value is the same as the expected one.
 * @private
 */
core.patternMatcher.exact_ = function(expected, actual) {
  return actual.indexOf(expected) != -1;
};


/**
 * @param {string} regexpString The expected value.
 * @param {string} actual The actual value.
 * @return {boolean} Whether the actual value matches the expected one.
 * @private
 */
core.patternMatcher.regexp_ = function(regexpString, actual) {
  return new RegExp(regexpString).test(actual);
};


/**
 * @param {string} regexpString The expected value.
 * @param {string} actual The actual value.
 * @return {boolean} Whether the actual value case-insensitively matches the
 *   expected one.
 * @private
 */
core.patternMatcher.regexpi_ = function(regexpString, actual) {
  return new RegExp(regexpString, 'i').test(actual);
};


/**
 * "globContains" (aka "wildmat") patterns, e.g. "glob:one,two,*",
 * but don't require a perfect match; instead succeed if actual
 * contains something that matches globString.
 * Making this distinction is motivated by a bug in IE6 which
 * leads to the browser hanging if we implement *TextPresent tests
 * by just matching against a regular expression beginning and
 * ending with ".*".  The globcontains strategy allows us to satisfy
 * the functional needs of the *TextPresent ops more efficiently
 * and so avoid running into this IE6 freeze.
 *
 * @param {string} globString The expected value.
 * @param {string} actual The actual value.
 * @return {boolean} Whether the actual value matches the expected one.
 * @private
 */
core.patternMatcher.globContains_ = function(globString, actual) {
  var regexp = new RegExp(
      core.patternMatcher.regexpFromGlobContains(globString));
  return regexp.test(actual);
};


/**
 * "glob" (aka "wildmat") patterns, e.g. "glob:one,two,*"
 *
 * @param {string} globString The expected value.
 * @param {string} actual The actual value.
 * @return {boolean} Whether the actual value matches the expected one.
 * @private
 */
core.patternMatcher.glob_ = function(globString, actual) {
  var regexp = new RegExp(core.patternMatcher.regexpFromGlob(globString));
  return regexp.test(actual);
};


/**
 * @param {string} glob The string to convert to a glob.
 * @return {string} The shell-style glob as an equivalent regexp string.
 * @private
 */
core.patternMatcher.convertGlobMetaCharsToRegexpMetaChars_ = function(glob) {
  var re = glob;
  re = re.replace(/([.^$+(){}\[\]\\|])/g, '\\$1');
  re = re.replace(/\?/g, '(.|[\r\n])');
  re = re.replace(/\*/g, '(.|[\r\n])*');
  return re;
};


/**
 * @param {string} globContains A shell-style glob.
 * @return {string} A regex string which will match on a part of a string.
 */
core.patternMatcher.regexpFromGlobContains = function(globContains) {
  return core.patternMatcher.convertGlobMetaCharsToRegexpMetaChars_(
      globContains);
};


/**
 * @param {string} glob A shell-style glob.
 * @return {string} A regex string which requires an exact match.
 */
core.patternMatcher.regexpFromGlob = function(glob) {
  return '^' +
      core.patternMatcher.convertGlobMetaCharsToRegexpMetaChars_(glob) +
      '$';
};


/**
 * @typedef {function(string,string):boolean}
 */
core.patternMatcher.Strategy;


/**
 * Known element location strategies.
 *
 * @const
 * @private {Object.<string,core.patternMatcher.Strategy>}
 */
core.patternMatcher.KNOWN_STRATEGIES_ = {
  'exact': core.patternMatcher.exact_,
  'glob': core.patternMatcher.glob_,
  'globcontains': core.patternMatcher.globContains_,
  'regex': core.patternMatcher.regexp_,
  'regexi': core.patternMatcher.regexpi_,
  'regexpi': core.patternMatcher.regexpi_,
  'regexp': core.patternMatcher.regexp_
};


/**
 * Find a pattern matching strategy for the given pattern.
 *
 * @param {string} pattern The pattern to match against.
 * @return {function(string): boolean} The matching function.
 */
core.patternMatcher.against = function(pattern) {
  // by default
  var strategyName = 'glob';

  var result = /^([a-zA-Z-]+):(.*)/.exec(pattern);
  if (result) {
    var possibleNewStrategyName = result[1];
    var possibleNewPattern = result[2];
    if (core.patternMatcher.KNOWN_STRATEGIES_[
        possibleNewStrategyName.toLowerCase()]) {
      strategyName = possibleNewStrategyName.toLowerCase();
      pattern = possibleNewPattern;
    }
  }
  var matchStrategy = core.patternMatcher.KNOWN_STRATEGIES_[strategyName];
  if (!matchStrategy) {
    throw new core.Error('Cannot find pattern matching strategy: ' +
        strategyName);
  }

  if (strategyName == 'glob') {
    if (pattern.indexOf('glob:') == 0) {
      pattern = pattern.substring('glob:'.length); // strip off 'glob:'
    }
    matchStrategy = core.patternMatcher.KNOWN_STRATEGIES_['glob'];
  } else {
    if (strategyName == 'exact' && pattern.indexOf('exact:') == 0) {
      pattern = pattern.substring('exact:'.length); // strip off 'exact:'
    }
  }

  // Here we go
  var matcher = goog.partial(matchStrategy, pattern);
  matcher.strategyName = strategyName;
  return matcher;
};


/**
 * A "static" convenience method for easy matching.
 *
 * @param {string} pattern The pattern to match against.
 * @param {string} actual The value to be compared.
 * @return {boolean} Whether the actual value matches the pattern.
 */
core.patternMatcher.matches = function(pattern, actual) {
  return core.patternMatcher.against(pattern)(actual);
};
