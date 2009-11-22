// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2008 Google Inc. All Rights Reserved.

/**
 * @fileoverview DOM pattern to match a node of the given type.
 *
 */

goog.provide('goog.dom.pattern.NodeType');

goog.require('goog.dom.pattern.AbstractPattern');
goog.require('goog.dom.pattern.MatchType');



/**
 * Pattern object that matches any node of the given type.
 * @param {goog.dom.NodeType} nodeType The node type to match.
 * @constructor
 * @extends {goog.dom.pattern.AbstractPattern}
 */
goog.dom.pattern.NodeType = function(nodeType) {
  /**
   * The node type to match.
   * @type {goog.dom.NodeType}
   * @private
   */
  this.nodeType_ = nodeType;
};
goog.inherits(goog.dom.pattern.NodeType, goog.dom.pattern.AbstractPattern);


/**
 * Test whether the given token is a text token which matches the string or
 * regular expression provided in the constructor.
 * @param {Node} token Token to match against.
 * @param {goog.dom.TagWalkType} type The type of token.
 * @return {goog.dom.pattern.MatchType} <code>MATCH</code> if the pattern
 *     matches, <code>NO_MATCH</code> otherwise.
 */
goog.dom.pattern.NodeType.prototype.matchToken = function(token, type) {
  return token.nodeType == this.nodeType_ ?
      goog.dom.pattern.MatchType.MATCH :
      goog.dom.pattern.MatchType.NO_MATCH;
};
