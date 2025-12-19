/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Anchored viewport positioning class.
 */

goog.provide('goog.positioning.AnchoredViewportPosition');

goog.require('goog.positioning');
goog.require('goog.positioning.AnchoredPosition');
goog.require('goog.positioning.Overflow');
goog.require('goog.positioning.OverflowStatus');
goog.requireType('goog.math.Box');
goog.requireType('goog.math.Size');



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
 *     the element fits inside the viewport even if that means that the anchored
 *     corners are ignored.
 * @param {goog.math.Box=} opt_overflowConstraint Box object describing the
 *     dimensions in which the movable element could be shown.
 * @constructor
 * @extends {goog.positioning.AnchoredPosition}
 */
goog.positioning.AnchoredViewportPosition = function(
    anchorElement, corner, opt_adjust, opt_overflowConstraint) {
  'use strict';
  goog.positioning.AnchoredPosition.call(this, anchorElement, corner);

  /**
   * The last resort algorithm to use if the algorithm can't fit inside
   * the viewport.
   *
   * IGNORE = do nothing, just display at the preferred position.
   *
   * ADJUST_X | ADJUST_Y = Adjust until the element fits, even if that means
   * that the anchored corners are ignored.
   *
   * @type {number}
   * @private
   */
  this.lastResortOverflow_ = opt_adjust ? (goog.positioning.Overflow.ADJUST_X |
                                           goog.positioning.Overflow.ADJUST_Y) :
                                          goog.positioning.Overflow.IGNORE;

  /**
   * The dimensions in which the movable element could be shown.
   * @type {goog.math.Box|undefined}
   * @private
   */
  this.overflowConstraint_ = opt_overflowConstraint || undefined;
};
goog.inherits(
    goog.positioning.AnchoredViewportPosition,
    goog.positioning.AnchoredPosition);


/**
 * @return {goog.math.Box|undefined} The box object describing the
 *     dimensions in which the movable element will be shown.
 */
goog.positioning.AnchoredViewportPosition.prototype.getOverflowConstraint =
    function() {
  'use strict';
  return this.overflowConstraint_;
};


/**
 * @param {goog.math.Box|undefined} overflowConstraint Box object describing the
 *     dimensions in which the movable element could be shown.
 */
goog.positioning.AnchoredViewportPosition.prototype.setOverflowConstraint =
    function(overflowConstraint) {
  'use strict';
  this.overflowConstraint_ = overflowConstraint;
};


/**
 * @return {number} A bitmask for the "last resort" overflow.
 */
goog.positioning.AnchoredViewportPosition.prototype.getLastResortOverflow =
    function() {
  'use strict';
  return this.lastResortOverflow_;
};


/**
 * @param {number} lastResortOverflow A bitmask for the "last resort" overflow,
 *     if we fail to fit the element on-screen.
 */
goog.positioning.AnchoredViewportPosition.prototype.setLastResortOverflow =
    function(lastResortOverflow) {
  'use strict';
  this.lastResortOverflow_ = lastResortOverflow;
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
  'use strict';
  var status = goog.positioning.positionAtAnchor(
      this.element, this.corner, movableElement, movableCorner, null,
      opt_margin,
      goog.positioning.Overflow.FAIL_X | goog.positioning.Overflow.FAIL_Y,
      opt_preferredSize, this.overflowConstraint_);

  // If the desired position is outside the viewport try mirroring the corners
  // horizontally or vertically.
  if (status & goog.positioning.OverflowStatus.FAILED) {
    var cornerFallback = this.adjustCorner(status, this.corner);
    var movableCornerFallback = this.adjustCorner(status, movableCorner);

    status = goog.positioning.positionAtAnchor(
        this.element, cornerFallback, movableElement, movableCornerFallback,
        null, opt_margin,
        goog.positioning.Overflow.FAIL_X | goog.positioning.Overflow.FAIL_Y,
        opt_preferredSize, this.overflowConstraint_);

    if (status & goog.positioning.OverflowStatus.FAILED) {
      // If that also fails, pick the best corner from the two tries,
      // and adjust the position until it fits.
      cornerFallback = this.adjustCorner(status, cornerFallback);
      movableCornerFallback = this.adjustCorner(status, movableCornerFallback);

      goog.positioning.positionAtAnchor(
          this.element, cornerFallback, movableElement, movableCornerFallback,
          null, opt_margin, this.getLastResortOverflow(), opt_preferredSize,
          this.overflowConstraint_);
    }
  }
};


/**
 * Adjusts the corner if X or Y positioning failed.
 * @param {number} status The status of the last positionAtAnchor call.
 * @param {goog.positioning.Corner} corner The corner to adjust.
 * @return {goog.positioning.Corner} The adjusted corner.
 * @protected
 */
goog.positioning.AnchoredViewportPosition.prototype.adjustCorner = function(
    status, corner) {
  'use strict';
  if (status & goog.positioning.OverflowStatus.FAILED_HORIZONTAL) {
    corner = goog.positioning.flipCornerHorizontal(corner);
  }

  if (status & goog.positioning.OverflowStatus.FAILED_VERTICAL) {
    corner = goog.positioning.flipCornerVertical(corner);
  }

  return corner;
};
