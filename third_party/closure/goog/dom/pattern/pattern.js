// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview DOM patterns.  Allows for description of complex DOM patterns
 * using regular expression like constructs.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.dom.pattern');
goog.provide('goog.dom.pattern.MatchType');


/**
 * Regular expression for breaking text nodes.
 * @type {RegExp}
 */
goog.dom.pattern.BREAKING_TEXTNODE_RE = /^\s*$/;


/**
 * Utility function to match a string against either a string or a regular
 * expression.
 *
 * @param {string|RegExp} obj Either a string or a regular expression.
 * @param {string} str The string to match.
 * @return {boolean} Whether the strings are equal, or if the string matches
 *     the regular expression.
 */
goog.dom.pattern.matchStringOrRegex = function(obj, str) {
  if (goog.isString(obj)) {
    // Match a string
    return str == obj;
  } else {
    // Match a regular expression
    return !!(str && str.match(obj));
  }
};


/**
 * Utility function to match a DOM attribute against either a string or a
 * regular expression.  Conforms to the interface spec for
 * {@link goog.object#every}.
 *
 * @param {string|RegExp} elem Either a string or a regular expression.
 * @param {string} index The attribute name to match.
 * @param {Object} orig The original map of matches to test.
 * @return {boolean} Whether the strings are equal, or if the attribute matches
 *     the regular expression.
 * @this {Element} Called using goog.object every on an Element.
 */
goog.dom.pattern.matchStringOrRegexMap = function(elem, index, orig) {
  return goog.dom.pattern.matchStringOrRegex(
      elem, index in this ?
          this[index] :
          (this.getAttribute ? this.getAttribute(index) : null));
};


/**
 * When matched to a token, a pattern may return any of the following statuses:
 *  <ol>
 *    <li><code>NO_MATCH</code> - The pattern does not match.  This is the only
 *      value that evaluates to <code>false</code> in a boolean context.
 *    <li><code>MATCHING</code> - The token is part of an incomplete match.
 *    <li><code>MATCH</code> - The token completes a match.
 *    <li><code>BACKTRACK_MATCH</code> - The token does not match, but indicates
 *      the end of a repetitive match.  For instance, in regular expressions,
 *      the pattern <code>/a+/</code> would match <code>'aaaaaaaab'</code>.
 *      Every <code>'a'</code> token would give a status of
 *      <code>MATCHING</code> while the <code>'b'</code> token would give a
 *      status of <code>BACKTRACK_MATCH</code>.
 *  </ol>
 * @enum {number}
 */
goog.dom.pattern.MatchType = {
  NO_MATCH: 0,
  MATCHING: 1,
  MATCH: 2,
  BACKTRACK_MATCH: 3
};
