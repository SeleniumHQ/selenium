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
 * @fileoverview DOM pattern to match a tag and all of its children.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.dom.pattern.FullTag');

goog.require('goog.dom.pattern.MatchType');
goog.require('goog.dom.pattern.StartTag');
goog.require('goog.dom.pattern.Tag');



/**
 * Pattern object that matches a full tag including all its children.
 *
 * @param {string|RegExp} tag Name of the tag.  Also will accept a regular
 *     expression to match against the tag name.
 * @param {Object=} opt_attrs Optional map of attribute names to desired values.
 *     This pattern will only match when all attributes are present and match
 *     the string or regular expression value provided here.
 * @param {Object=} opt_styles Optional map of CSS style names to desired
 *     values. This pattern will only match when all styles are present and
 *     match the string or regular expression value provided here.
 * @param {Function=} opt_test Optional function that takes the element as a
 *     parameter and returns true if this pattern should match it.
 * @constructor
 * @extends {goog.dom.pattern.StartTag}
 */
goog.dom.pattern.FullTag = function(tag, opt_attrs, opt_styles, opt_test) {
  goog.dom.pattern.StartTag.call(
      this,
      tag,
      opt_attrs,
      opt_styles,
      opt_test);
};
goog.inherits(goog.dom.pattern.FullTag, goog.dom.pattern.StartTag);


/**
 * Tracks the matcher's depth to detect the end of the tag.
 *
 * @type {number}
 * @private
 */
goog.dom.pattern.FullTag.prototype.depth_ = 0;


/**
 * Test whether the given token is a start tag token which matches the tag name,
 * style, and attributes provided in the constructor.
 *
 * @param {Node} token Token to match against.
 * @param {goog.dom.TagWalkType} type The type of token.
 * @return {goog.dom.pattern.MatchType} <code>MATCH</code> at the end of our
 *    tag, <code>MATCHING</code> if we are within the tag, and
 *    <code>NO_MATCH</code> if the starting tag does not match.
 */
goog.dom.pattern.FullTag.prototype.matchToken = function(token, type) {
  if (!this.depth_) {
    // If we have not yet started, make sure we match as a StartTag.
    if (goog.dom.pattern.Tag.prototype.matchToken.call(this, token, type)) {
      this.depth_ = type;
      return goog.dom.pattern.MatchType.MATCHING;

    } else {
      return goog.dom.pattern.MatchType.NO_MATCH;
    }
  } else {
    this.depth_ += type;

    return this.depth_ ?
           goog.dom.pattern.MatchType.MATCHING :
           goog.dom.pattern.MatchType.MATCH;
  }
};
