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
 * @fileoverview DOM pattern to match any children of a tag.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.dom.pattern.AllChildren');

goog.require('goog.dom.pattern.AbstractPattern');
goog.require('goog.dom.pattern.MatchType');



/**
 * Pattern object that matches any nodes at or below the current tree depth.
 *
 * @constructor
 * @extends {goog.dom.pattern.AbstractPattern}
 */
goog.dom.pattern.AllChildren = function() {
  /**
   * Tracks the matcher's depth to detect the end of the tag.
   *
   * @private {number}
   */
  this.depth_ = 0;
};
goog.inherits(goog.dom.pattern.AllChildren, goog.dom.pattern.AbstractPattern);


/**
 * Test whether the given token is on the same level.
 *
 * @param {Node} token Token to match against.
 * @param {goog.dom.TagWalkType} type The type of token.
 * @return {goog.dom.pattern.MatchType} {@code MATCHING} if the token is on the
 *     same level or deeper and {@code BACKTRACK_MATCH} if not.
 * @override
 */
goog.dom.pattern.AllChildren.prototype.matchToken = function(token, type) {
  this.depth_ += type;

  if (this.depth_ >= 0) {
    return goog.dom.pattern.MatchType.MATCHING;
  } else {
    this.depth_ = 0;
    return goog.dom.pattern.MatchType.BACKTRACK_MATCH;
  }
};


/**
 * Reset any internal state this pattern keeps.
 * @override
 */
goog.dom.pattern.AllChildren.prototype.reset = function() {
  this.depth_ = 0;
};
