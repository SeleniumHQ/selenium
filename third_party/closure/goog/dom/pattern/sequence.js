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
 * @fileoverview DOM pattern to match a sequence of other patterns.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.dom.pattern.Sequence');

goog.require('goog.dom.NodeType');
goog.require('goog.dom.pattern.AbstractPattern');
goog.require('goog.dom.pattern.MatchType');


/**
 * Pattern object that matches a sequence of other patterns.
 *
 * @param {Array.<goog.dom.pattern.AbstractPattern>} patterns Ordered array of
 *     patterns to match.
 * @param {boolean=} opt_ignoreWhitespace Optional flag to ignore text nodes
 *     consisting entirely of whitespace.  The default is to not ignore them.
 * @constructor
 * @extends {goog.dom.pattern.AbstractPattern}
 */
goog.dom.pattern.Sequence = function(patterns, opt_ignoreWhitespace) {
  this.patterns = patterns;
  this.ignoreWhitespace_ = !!opt_ignoreWhitespace;
};
goog.inherits(goog.dom.pattern.Sequence, goog.dom.pattern.AbstractPattern);


/**
 * Ordered array of patterns to match.
 *
 * @type {Array.<goog.dom.pattern.AbstractPattern>}
 */
goog.dom.pattern.Sequence.prototype.patterns;


/**
 * Position in the patterns array we have reached by successful matches.
 *
 * @type {number}
 * @private
 */
goog.dom.pattern.Sequence.prototype.currentPosition_ = 0;


/**
 * Whether or not to ignore whitespace only Text nodes.
 *
 * @type {boolean}
 * @private
 */
goog.dom.pattern.Sequence.prototype.ignoreWhitespace_ = false;


/**
 * Test whether the given token starts, continues, or finishes the sequence
 * of patterns given in the constructor.
 *
 * @param {Node} token Token to match against.
 * @param {goog.dom.TagWalkType} type The type of token.
 * @return {goog.dom.pattern.MatchType} <code>MATCH</code> if the pattern
 *     matches, <code>MATCHING</code> if the pattern starts a match, and
 *     <code>NO_MATCH</code> if the pattern does not match.
 */
goog.dom.pattern.Sequence.prototype.matchToken = function(token, type) {
  // If the option is set, ignore any whitespace only text nodes
  if (this.ignoreWhitespace_ && token.nodeType == goog.dom.NodeType.TEXT &&
      goog.dom.pattern.BREAKING_TEXTNODE_RE.test(token.nodeValue)) {
    return goog.dom.pattern.MatchType.MATCHING;
  }

  switch (this.patterns[this.currentPosition_].matchToken(token, type)) {
    case goog.dom.pattern.MatchType.MATCH:
      // Record the first token we match.
      if (this.currentPosition_ == 0) {
        this.matchedNode = token;
      }

      // Move forward one position.
      this.currentPosition_++;

      // Check if this is the last position.
      if (this.currentPosition_ == this.patterns.length) {
        this.reset();
        return goog.dom.pattern.MatchType.MATCH;
      } else {
        return goog.dom.pattern.MatchType.MATCHING;
      }

    case goog.dom.pattern.MatchType.MATCHING:
      // This can happen when our child pattern is a sequence or a repetition.
      return goog.dom.pattern.MatchType.MATCHING;

    case goog.dom.pattern.MatchType.BACKTRACK_MATCH:
      // This means a repetitive match succeeded 1 token ago.
      // TODO(robbyw): Backtrack further if necessary.
      this.currentPosition_++;

      if (this.currentPosition_ == this.patterns.length) {
        this.reset();
        return goog.dom.pattern.MatchType.BACKTRACK_MATCH;
      } else {
        // Retry the same token on the next pattern.
        return this.matchToken(token, type);
      }

    default:
      this.reset();
      return goog.dom.pattern.MatchType.NO_MATCH;
  }
};


/**
 * Reset any internal state this pattern keeps.
 */
goog.dom.pattern.Sequence.prototype.reset = function() {
  if (this.patterns[this.currentPosition_]) {
    this.patterns[this.currentPosition_].reset();
  }
  this.currentPosition_ = 0;
};
