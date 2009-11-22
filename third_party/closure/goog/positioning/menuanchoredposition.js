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

// Copyright 2006 Google Inc. All Rights Reserved.

/**
 * @fileoverview Anchored viewport positioning class with both adjust and
 *     resize options for the popup.
 *
 */

goog.provide('goog.positioning.MenuAnchoredPosition');

goog.require('goog.math.Box');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.positioning');
goog.require('goog.positioning.AnchoredViewportPosition');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.CornerBit');
goog.require('goog.positioning.Overflow');
goog.require('goog.positioning.OverflowStatus');


/**
 * Encapsulates a popup position where the popup is anchored at a corner of
 * an element.  The positioning behavior changes based on the values of
 * opt_adjust and opt_resize.
 *
 * When using this positioning object it's recommended that the movable element
 * be absolutely positioned.
 *
 * @param {Element} anchorElement Element the movable element should be
 *     anchored against.
 * @param {goog.positioning.Corner} corner Corner of anchored element the
 *     movable element should be positioned at.
 * @param {boolean} opt_adjust Whether the positioning should be adjusted until
 *    the element fits inside the viewport even if that means that the anchored
 *    corners are ignored.
 * @param {boolean} opt_resize Whether the positioning should be adjusted until
 *    the element fits inside the viewport on the X axis and it's heigh is
 *    resized so if fits in the viewport.  This take precedence over
 *    opt_adjust.
 * @constructor
 * @extends {goog.positioning.AnchoredViewportPosition}
 */
goog.positioning.MenuAnchoredPosition = function(anchorElement,
                                                 corner,
                                                 opt_adjust,
                                                 opt_resize) {
  goog.positioning.AnchoredViewportPosition.call(this, anchorElement, corner,
                                                 opt_adjust);
  /**
   * Whether the positioning should be adjusted until the element fits inside
   * the viewport even if that means that the anchored corners are ignored.
   * @type {boolean|undefined}
   * @private
   */
  this.resize_ = opt_resize;
};
goog.inherits(goog.positioning.MenuAnchoredPosition,
              goog.positioning.AnchoredViewportPosition);


/**
 * Repositions the movable element.
 *
 * @param {Element} movableElement Element to position.
 * @param {goog.positioning.Corner} movableCorner Corner of the movable element
 *     that should be positioned adjacent to the anchored element.
 * @param {goog.math.Box} opt_margin A margin specifin pixels.
 * @param {goog.math.Size} opt_preferredSize Preferred size of the
 *     moveableElement.
 */
goog.positioning.MenuAnchoredPosition.prototype.reposition =
    function(movableElement, movableCorner, opt_margin, opt_preferredSize) {

  if (this.resize_) {
    goog.positioning.positionAtAnchor(this.element, this.corner,
        movableElement, movableCorner, null, opt_margin,
        goog.positioning.Overflow.ADJUST_X |
        goog.positioning.Overflow.RESIZE_HEIGHT, opt_preferredSize);
  } else {
    goog.positioning.MenuAnchoredPosition.superClass_.reposition.call(
        this,
        movableElement,
        movableCorner,
        opt_margin,
        opt_preferredSize);
  }
};
