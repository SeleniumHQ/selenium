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
 * @fileoverview DOM pattern to match a text node.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.dom.pattern.Text');

goog.require('goog.dom.NodeType');
goog.require('goog.dom.pattern');
goog.require('goog.dom.pattern.AbstractPattern');
goog.require('goog.dom.pattern.MatchType');



/**
 * Pattern object that matches text by exact matching or regular expressions.
 *
 * @param {string|RegExp} match String or regular expression to match against.
 * @constructor
 * @extends {goog.dom.pattern.AbstractPattern}
 * @final
 */
goog.dom.pattern.Text = function(match) {
  /**
   * The text or regular expression to match.
   *
   * @private {string|RegExp}
   */
  this.match_ = match;
};
goog.inherits(goog.dom.pattern.Text, goog.dom.pattern.AbstractPattern);


/**
 * Test whether the given token is a text token which matches the string or
 * regular expression provided in the constructor.
 *
 * @param {Node} token Token to match against.
 * @param {goog.dom.TagWalkType} type The type of token.
 * @return {goog.dom.pattern.MatchType} <code>MATCH</code> if the pattern
 *     matches, <code>NO_MATCH</code> otherwise.
 * @override
 */
goog.dom.pattern.Text.prototype.matchToken = function(token, type) {
  if (token.nodeType == goog.dom.NodeType.TEXT &&
      goog.dom.pattern.matchStringOrRegex(this.match_, token.nodeValue)) {
    this.matchedNode = token;
    return goog.dom.pattern.MatchType.MATCH;
  }

  return goog.dom.pattern.MatchType.NO_MATCH;
};
