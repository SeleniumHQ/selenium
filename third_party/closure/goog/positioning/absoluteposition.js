// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Client viewport positioning class.
 *
 * @author eae@google.com (Emil A Eklund)
 */

goog.provide('goog.positioning.AbsolutePosition');

goog.require('goog.math.Coordinate');
goog.require('goog.positioning');
goog.require('goog.positioning.AbstractPosition');



/**
 * Encapsulates a popup position where the popup absolutely positioned by
 * setting the left/top style elements directly to the specified values.
 * The position is generally relative to the element's offsetParent. Normally,
 * this is the document body, but can be another element if the popup element
 * is scoped by an element with relative position.
 *
 * @param {number|!goog.math.Coordinate} arg1 Left position or coordinate.
 * @param {number=} opt_arg2 Top position.
 * @constructor
 * @extends {goog.positioning.AbstractPosition}
 */
goog.positioning.AbsolutePosition = function(arg1, opt_arg2) {
  /**
   * Coordinate to position popup at.
   * @type {goog.math.Coordinate}
   */
  this.coordinate = arg1 instanceof goog.math.Coordinate ?
      arg1 :
      new goog.math.Coordinate(/** @type {number} */ (arg1), opt_arg2);
};
goog.inherits(
    goog.positioning.AbsolutePosition, goog.positioning.AbstractPosition);


/**
 * Repositions the popup according to the current state.
 *
 * @param {Element} movableElement The DOM element to position.
 * @param {goog.positioning.Corner} movableCorner The corner of the movable
 *     element that should be positioned at the specified position.
 * @param {goog.math.Box=} opt_margin A margin specified in pixels.
 * @param {goog.math.Size=} opt_preferredSize Preferred size of the
 *     movableElement.
 * @override
 */
goog.positioning.AbsolutePosition.prototype.reposition = function(
    movableElement, movableCorner, opt_margin, opt_preferredSize) {
  goog.positioning.positionAtCoordinate(
      this.coordinate, movableElement, movableCorner, opt_margin, null, null,
      opt_preferredSize);
};
