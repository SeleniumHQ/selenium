// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utilities used by goog.labs.userAgent tools. These functions
 * should not be used outside of goog.labs.userAgent.*.
 *
 * @visibility {//visibility:private}
 * @author nnaze@google.com (Nathan Naze)
 */

goog.provide('goog.labs.userAgent.util');

goog.require('goog.memoize');
goog.require('goog.string');


/**
 * Returns the user agent string.
 *
 * @return {string} The user agent string.
 */
goog.labs.userAgent.util.getUserAgentString = goog.memoize(function() {
  return goog.global['navigator'] ? goog.global['navigator'].userAgent : '';
});


/**
 * @param {string} str
 * @return {boolean} Whether the user agent contains the given string.
 */
goog.labs.userAgent.util.matchUserAgent = function(str) {
  var userAgentString = goog.labs.userAgent.util.getUserAgentString();
  return goog.string.contains(userAgentString, str);
};


/**
 * Parses the user agent into tuples for each section.
 * @param {string} userAgent
 * @return {!Array.<string>} Tuples of key, version, and the contents of the
 *     parenthetical.
 */
goog.labs.userAgent.util.extractVersionTuples = function(userAgent) {
  // Matches each section of a user agent string.
  // Example UA:
  // Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us)
  // AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405
  // This has three version tuples: Mozilla, AppleWebKit, and Mobile.

  var versionRegExp = new RegExp(
      // Key. Note that a key may have a space.
      // (i.e. 'Mobile Safari' in 'Mobile Safari/5.0')
      '(\\w[\\w ]+)' +

      '/' +                // slash
      '([^\\s]+)' +        // version (i.e. '5.0b')
      '\\s*' +             // whitespace
      '(?:\\((.*?)\\))?',  // parenthetical info. parentheses not matched.
      'g');

  var data = [];
  var match;

  // Iterate and collect the version tuples.  Each iteration will be the
  // next regex match.
  while (match = versionRegExp.exec(userAgent)) {
    data.push([
      match[1],  // key
      match[2],  // value
      // || undefined as this is not undefined in IE7 and IE8
      match[3] || undefined  // info
    ]);
  }

  return data;
};

