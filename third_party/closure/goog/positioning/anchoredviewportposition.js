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
 * @fileoverview Anchored viewport positioning class.
 *
 */

goog.provide('goog.positioning.AnchoredViewportPosition');

goog.require('goog.functions');
goog.require('goog.math.Box');
goog.require('goog.positioning');
goog.require('goog.positioning.AnchoredPosition');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.Overflow');
goog.require('goog.positioning.OverflowStatus');



/**
 * Encapsulates a popup position where the popup is anchored at a corner of
 * an element. The corners are swapped if dictated by the viewport. For instance
 * if a popup is anchored with its top left corner to the bottom left corner of
 * the anchor the popup is either displayed below the anchor (as specified) or
 * above it if there's not enough room to display it below.
 *
 * When using this positioning object it's recommended that the movable element
 * be absolutely positioned.
 *
 * @param {Element} anchorElement Element the movable element should be
 *     anchored against.
 * @param {goog.positioning.Corner} corner Corner of anchored element the
 *     movable element should be positioned at.
 * @param {boolean=} opt_adjust Whether the positioning should be adjusted until
 *    the element fits inside the viewport even if that means that the anchored
 *    corners are ignored.
 * @constructor
 * @extends {goog.positioning.AnchoredPosition}
 */
goog.positioning.AnchoredViewportPosition = function(anchorElement,
                                                     corner,
                                                     opt_adjust) {
  goog.positioning.AnchoredPosition.call(this, anchorElement, corner);

  /**
   * Whether the positioning should be adjusted until the element fits inside
   * the viewport even if that means that the anchored corners are ignored.
   * @type {boolean|undefined}
   * @private
   */
  this.adjust_ = opt_adjust;
};
goog.inherits(goog.positioning.AnchoredViewportPosition,
              goog.positioning.AnchoredPosition);


/**
 * @return {number} A bitmask for the "last resort" overflow. Only takes affect
 *     when {@code opt_adjusted} in the constructor is enabled.
 * @protected
 */
goog.positioning.AnchoredViewportPosition.prototype.getLastResortOverflow =
    function() {
  return goog.positioning.Overflow.ADJUST_X |
      goog.positioning.Overflow.ADJUST_Y;
};


/**
 * Repositions the movable element.
 *
 * @param {Element} movableElement Element to position.
 * @param {goog.positioning.Corner} movableCorner Corner of the movable element
 *     that should be positioned adjacent to the anchored element.
 * @param {goog.math.Box=} opt_margin A margin specified in pixels.
 * @param {goog.math.Size=} opt_preferredSize The preferred size of the
 *     movableElement.
 * @override
 */
goog.positioning.AnchoredViewportPosition.prototype.reposition = function(
    movableElement, movableCorner, opt_margin, opt_preferredSize) {
  var status = goog.positioning.positionAtAnchor(this.element, this.corner,
      movableElement, movableCorner, null, opt_margin,
      goog.positioning.Overflow.FAIL_X | goog.positioning.Overflow.FAIL_Y,
      opt_preferredSize);

  // If the desired position is outside the viewport try mirroring the corners
  // horizontally or vertically.
  if (status & goog.positioning.OverflowStatus.FAILED) {
    var cornerFallback = this.correctCorner_(status, this.corner);
    var movableCornerFallback = this.correctCorner_(status, movableCorner);

    status = goog.positioning.positionAtAnchor(this.element, cornerFallback,
        movableElement, movableCornerFallback, null, opt_margin,
        goog.positioning.Overflow.FAIL_X | goog.positioning.Overflow.FAIL_Y,
        opt_preferredSize);

    if (status & goog.positioning.OverflowStatus.FAILED) {
      // If that also fails, pick the best corner from the two tries,
      // and adjust the position until it fits.
      cornerFallback = this.correctCorner_(status, cornerFallback);
      movableCornerFallback = this.correctCorner_(
          status, movableCornerFallback);

      if (this.adjust_) {
        goog.positioning.positionAtAnchor(this.element, cornerFallback,
            movableElement, movableCornerFallback, null, opt_margin,
            this.getLastResortOverflow(), opt_preferredSize);

      // Or display it anyway at the preferred position, if the adjust option
      // was not enabled.
      } else {
        goog.positioning.positionAtAnchor(this.element, cornerFallback,
            movableElement, movableCornerFallback, null, opt_margin,
            goog.positioning.Overflow.IGNORE, opt_preferredSize);
      }
    }
  }
};


/**
 * Flip the given corner if X or Y positioning failed.
 * @param {number} status The status of the last positionAtAnchor call.
 * @param {goog.positioning.Corner} corner The corner to correct.
 * @return {goog.positioning.Corner} The new corner.
 * @private
 */
goog.positioning.AnchoredViewportPosition.prototype.correctCorner_ = function(
    status, corner) {
  if (status & goog.positioning.OverflowStatus.FAILED_HORIZONTAL) {
    corner = goog.positioning.flipCornerHorizontal(corner);
  }

  if (status & goog.positioning.OverflowStatus.FAILED_VERTICAL) {
    corner = goog.positioning.flipCornerVertical(corner);
  }

  return corner;
};

