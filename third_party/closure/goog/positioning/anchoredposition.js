/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Client positioning class.
 */

goog.provide('goog.positioning.AnchoredPosition');

goog.require('goog.positioning');
goog.require('goog.positioning.AbstractPosition');
goog.requireType('goog.math.Box');
goog.requireType('goog.math.Size');



/**
 * Encapsulates a popup position where the popup is anchored at a corner of
 * an element.
 *
 * When using AnchoredPosition, it is recommended that the popup element
 * specified in the Popup constructor or Popup.setElement be absolutely
 * positioned.
 *
 * @param {Element} anchorElement Element the movable element should be
 *     anchored against.
 * @param {goog.positioning.Corner} corner Corner of anchored element the
 *     movable element should be positioned at.
 * @param {number=} opt_overflow Overflow handling mode. Defaults to IGNORE if
 *     not specified. Bitmap, {@see goog.positioning.Overflow}.
 * @constructor
 * @extends {goog.positioning.AbstractPosition}
 */
goog.positioning.AnchoredPosition = function(
    anchorElement, corner, opt_overflow) {
  'use strict';
  /**
   * Element the movable element should be anchored against.
   * @type {Element}
   */
  this.element = anchorElement;

  /**
   * Corner of anchored element the movable element should be positioned at.
   * @type {goog.positioning.Corner}
   */
  this.corner = corner;

  /**
   * Overflow handling mode. Defaults to IGNORE if not specified.
   * Bitmap, {@see goog.positioning.Overflow}.
   * @type {number|undefined}
   * @private
   */
  this.overflow_ = opt_overflow;
};
goog.inherits(
    goog.positioning.AnchoredPosition, goog.positioning.AbstractPosition);


/**
 * Repositions the movable element.
 *
 * @param {Element} movableElement Element to position.
 * @param {goog.positioning.Corner} movableCorner Corner of the movable element
 *     that should be positioned adjacent to the anchored element.
 * @param {goog.math.Box=} opt_margin A margin specifin pixels.
 * @param {goog.math.Size=} opt_preferredSize PreferredSize of the
 *     movableElement (unused in this class).
 * @override
 */
goog.positioning.AnchoredPosition.prototype.reposition = function(
    movableElement, movableCorner, opt_margin, opt_preferredSize) {
  'use strict';
  goog.positioning.positionAtAnchor(
      this.element, this.corner, movableElement, movableCorner, undefined,
      opt_margin, this.overflow_);
};
