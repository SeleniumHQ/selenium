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
 * @fileoverview DOM pattern to match any children of a tag, and
 * specifically collect those that match a child pattern.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.dom.pattern.ChildMatches');

goog.require('goog.dom.pattern.AllChildren');
goog.require('goog.dom.pattern.MatchType');



/**
 * Pattern object that matches any nodes at or below the current tree depth.
 *
 * @param {goog.dom.pattern.AbstractPattern} childPattern Pattern to collect
 *     child matches of.
 * @param {number=} opt_minimumMatches Enforce a minimum nuber of matches.
 *     Defaults to 0.
 * @constructor
 * @extends {goog.dom.pattern.AllChildren}
 * @final
 */
goog.dom.pattern.ChildMatches = function(childPattern, opt_minimumMatches) {
  /**
   * The child pattern to collect matches from.
   *
   * @private {goog.dom.pattern.AbstractPattern}
   */
  this.childPattern_ = childPattern;

  /**
   * Array of matched child nodes.
   *
   * @type {Array<Node>}
   */
  this.matches = [];

  /**
   * Minimum number of matches.
   *
   * @private {number}
   */
  this.minimumMatches_ = opt_minimumMatches || 0;

  /**
   * Whether the pattern has recently matched or failed to match and will need
   * to be reset when starting a new round of matches.
   *
   * @private {boolean}
   */
  this.needsReset_ = false;

  goog.dom.pattern.ChildMatches.base(this, 'constructor');
};
goog.inherits(goog.dom.pattern.ChildMatches, goog.dom.pattern.AllChildren);


/**
 * Test whether the given token is on the same level.
 *
 * @param {Node} token Token to match against.
 * @param {goog.dom.TagWalkType} type The type of token.
 * @return {goog.dom.pattern.MatchType} {@code MATCHING} if the token is on the
 *     same level or deeper and {@code BACKTRACK_MATCH} if not.
 * @override
 */
goog.dom.pattern.ChildMatches.prototype.matchToken = function(token, type) {
  // Defer resets so we maintain our matches array until the last possible time.
  if (this.needsReset_) {
    this.reset();
  }

  // Call the super-method to ensure we stay in the child tree.
  var status =
      goog.dom.pattern.AllChildren.prototype.matchToken.apply(this, arguments);

  switch (status) {
    case goog.dom.pattern.MatchType.MATCHING:
      var backtrack = false;

      switch (this.childPattern_.matchToken(token, type)) {
        case goog.dom.pattern.MatchType.BACKTRACK_MATCH:
          backtrack = true;
        case goog.dom.pattern.MatchType.MATCH:
          // Collect the match.
          this.matches.push(this.childPattern_.matchedNode);
          break;

        default:
          // Keep trying if we haven't hit a terminal state.
          break;
      }

      if (backtrack) {
        // The only interesting result is a MATCH, since BACKTRACK_MATCH means
        // we are hitting an infinite loop on something like a Repeat(0).
        if (this.childPattern_.matchToken(token, type) ==
            goog.dom.pattern.MatchType.MATCH) {
          this.matches.push(this.childPattern_.matchedNode);
        }
      }
      return goog.dom.pattern.MatchType.MATCHING;

    case goog.dom.pattern.MatchType.BACKTRACK_MATCH:
      // TODO(robbyw): this should return something like BACKTRACK_NO_MATCH
      // when we don't meet our minimum.
      this.needsReset_ = true;
      return (this.matches.length >= this.minimumMatches_) ?
             goog.dom.pattern.MatchType.BACKTRACK_MATCH :
             goog.dom.pattern.MatchType.NO_MATCH;

    default:
      this.needsReset_ = true;
      return status;
  }
};


/**
 * Reset any internal state this pattern keeps.
 * @override
 */
goog.dom.pattern.ChildMatches.prototype.reset = function() {
  this.needsReset_ = false;
  this.matches.length = 0;
  this.childPattern_.reset();
  goog.dom.pattern.AllChildren.prototype.reset.call(this);
};
