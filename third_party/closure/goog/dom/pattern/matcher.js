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
 * @fileoverview DOM pattern matcher.  Allows for simple searching of DOM
 * using patterns descended from {@link goog.dom.pattern.AbstractPattern}.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.dom.pattern.Matcher');

goog.require('goog.dom.TagIterator');
goog.require('goog.dom.pattern.MatchType');
goog.require('goog.iter');


// TODO(robbyw): Allow for backtracks of size > 1.



/**
 * Given a set of patterns and a root node, this class tests the patterns in
 * parallel.
 *
 * It is not (yet) a smart matcher - it doesn't do any advanced backtracking.
 * Given the pattern <code>DIV, SPAN</code> the matcher will not match
 * <code>DIV, DIV, SPAN</code> because it starts matching at the first
 * <code>DIV</code>, fails to match <code>SPAN</code> at the second, and never
 * backtracks to try again.
 *
 * It is also possible to have a set of complex patterns that when matched in
 * parallel will miss some possible matches.  Running multiple times will catch
 * all matches eventually.
 *
 * @constructor
 * @final
 */
goog.dom.pattern.Matcher = function() {
  this.patterns_ = [];
  this.callbacks_ = [];
};


/**
 * Array of patterns to attempt to match in parallel.
 *
 * @type {Array<goog.dom.pattern.AbstractPattern>}
 * @private
 */
goog.dom.pattern.Matcher.prototype.patterns_;


/**
 * Array of callbacks to call when a pattern is matched.  The indexing is the
 * same as the {@link #patterns_} array.
 *
 * @type {Array<Function>}
 * @private
 */
goog.dom.pattern.Matcher.prototype.callbacks_;


/**
 * Adds a pattern to be matched.  The callback can return an object whose keys
 * are processing instructions.
 *
 * @param {goog.dom.pattern.AbstractPattern} pattern The pattern to add.
 * @param {Function} callback Function to call when a match is found.  Uses
 *     the above semantics.
 */
goog.dom.pattern.Matcher.prototype.addPattern = function(pattern, callback) {
  this.patterns_.push(pattern);
  this.callbacks_.push(callback);
};


/**
 * Resets all the patterns.
 *
 * @private
 */
goog.dom.pattern.Matcher.prototype.reset_ = function() {
  for (var i = 0, len = this.patterns_.length; i < len; i++) {
    this.patterns_[i].reset();
  }
};


/**
 * Test the given node against all patterns.
 *
 * @param {goog.dom.TagIterator} position A position in a node walk that is
 *     located at the token to process.
 * @return {boolean} Whether a pattern modified the position or tree
 *     and its callback resulted in DOM structure or position modification.
 * @private
 */
goog.dom.pattern.Matcher.prototype.matchToken_ = function(position) {
  for (var i = 0, len = this.patterns_.length; i < len; i++) {
    var pattern = this.patterns_[i];
    switch (pattern.matchToken(position.node, position.tagType)) {
      case goog.dom.pattern.MatchType.MATCH:
      case goog.dom.pattern.MatchType.BACKTRACK_MATCH:
        var callback = this.callbacks_[i];

        // Callbacks are allowed to modify the current position, but must
        // return true if the do.
        if (callback(pattern.matchedNode, position, pattern)) {
          return true;
        }

      default:
        // Do nothing.
        break;
    }
  }

  return false;
};


/**
 * Match the set of patterns against a match tree.
 *
 * @param {Node} node The root node of the tree to match.
 */
goog.dom.pattern.Matcher.prototype.match = function(node) {
  var position = new goog.dom.TagIterator(node);

  this.reset_();

  goog.iter.forEach(position, function() {
    while (this.matchToken_(position)) {
      // Since we've moved, our old pattern statuses don't make sense any more.
      // Reset them.
      this.reset_();
    }
  }, this);
};
