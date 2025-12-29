/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Common positioning code.
 */

goog.provide('goog.positioning');
goog.provide('goog.positioning.Corner');
goog.provide('goog.positioning.CornerBit');
goog.provide('goog.positioning.Overflow');
goog.provide('goog.positioning.OverflowStatus');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');
goog.require('goog.math.Size');
goog.require('goog.style');
goog.require('goog.style.bidi');
goog.requireType('goog.math.Box');


/**
 * Enum for bits in the {@see goog.positioning.Corner) bitmap.
 *
 * @enum {number}
 */
goog.positioning.CornerBit = {
  BOTTOM: 1,
  CENTER: 2,
  RIGHT: 4,
  FLIP_RTL: 8
};


/**
 * Enum for representing an element corner for positioning the popup.
 *
 * The START constants map to LEFT if element directionality is left
 * to right and RIGHT if the directionality is right to left.
 * Likewise END maps to RIGHT or LEFT depending on the directionality.
 *
 * @enum {number}
 */
goog.positioning.Corner = {
  TOP_LEFT: 0,
  TOP_RIGHT: goog.positioning.CornerBit.RIGHT,
  BOTTOM_LEFT: goog.positioning.CornerBit.BOTTOM,
  BOTTOM_RIGHT:
      goog.positioning.CornerBit.BOTTOM | goog.positioning.CornerBit.RIGHT,
  TOP_START: goog.positioning.CornerBit.FLIP_RTL,
  TOP_END:
      goog.positioning.CornerBit.FLIP_RTL | goog.positioning.CornerBit.RIGHT,
  BOTTOM_START:
      goog.positioning.CornerBit.BOTTOM | goog.positioning.CornerBit.FLIP_RTL,
  BOTTOM_END: goog.positioning.CornerBit.BOTTOM |
      goog.positioning.CornerBit.RIGHT | goog.positioning.CornerBit.FLIP_RTL,
  TOP_CENTER: goog.positioning.CornerBit.CENTER,
  BOTTOM_CENTER:
      goog.positioning.CornerBit.BOTTOM | goog.positioning.CornerBit.CENTER
};


/**
 * Enum for representing position handling in cases where the element would be
 * positioned outside the viewport.
 *
 * @enum {number}
 */
goog.positioning.Overflow = {
  /** Ignore overflow */
  IGNORE: 0,

  /** Try to fit horizontally in the viewport at all costs. */
  ADJUST_X: 1,

  /** If the element can't fit horizontally, report positioning failure. */
  FAIL_X: 2,

  /** Try to fit vertically in the viewport at all costs. */
  ADJUST_Y: 4,

  /** If the element can't fit vertically, report positioning failure. */
  FAIL_Y: 8,

  /** Resize the element's width to fit in the viewport. */
  RESIZE_WIDTH: 16,

  /** Resize the element's height to fit in the viewport. */
  RESIZE_HEIGHT: 32,

  /**
   * If the anchor goes off-screen in the x-direction, position the movable
   * element off-screen. Otherwise, try to fit horizontally in the viewport.
   */
  ADJUST_X_EXCEPT_OFFSCREEN: 64 | 1,

  /**
   * If the anchor goes off-screen in the y-direction, position the movable
   * element off-screen. Otherwise, try to fit vertically in the viewport.
   */
  ADJUST_Y_EXCEPT_OFFSCREEN: 128 | 4
};


/**
 * Enum for representing the outcome of a positioning call.
 *
 * @enum {number}
 */
goog.positioning.OverflowStatus = {
  NONE: 0,
  ADJUSTED_X: 1,
  ADJUSTED_Y: 2,
  WIDTH_ADJUSTED: 4,
  HEIGHT_ADJUSTED: 8,
  FAILED_LEFT: 16,
  FAILED_RIGHT: 32,
  FAILED_TOP: 64,
  FAILED_BOTTOM: 128,
  FAILED_OUTSIDE_VIEWPORT: 256,
  /** Shorthand to check if a status code contains any fail code. */
  FAILED: 16 | 32 | 64 | 128 | 256,
  /** Shorthand to check if horizontal positioning failed. */
  FAILED_HORIZONTAL: 16 | 32,
  /** Shorthand to check if vertical positioning failed. */
  FAILED_VERTICAL: 64 | 128,
};


/**
 * Positions a movable element relative to an anchor element. The caller
 * specifies the corners that should touch. This functions then moves the
 * movable element accordingly.
 *
 * @param {Element} anchorElement The element that is the anchor for where
 *    the movable element should position itself.
 * @param {goog.positioning.Corner} anchorElementCorner The corner of the
 *     anchorElement for positioning the movable element.
 * @param {Element} movableElement The element to move.
 * @param {goog.positioning.Corner} movableElementCorner The corner of the
 *     movableElement that that should be positioned adjacent to the anchor
 *     element.
 * @param {goog.math.Coordinate=} opt_offset An offset specified in pixels.
 *    After the normal positioning algorithm is applied, the offset is then
 *    applied. Positive coordinates move the popup closer to the center of the
 *    anchor element. Negative coordinates move the popup away from the center
 *    of the anchor element.
 * @param {goog.math.Box=} opt_margin A margin specified in pixels.
 *    After the normal positioning algorithm is applied and any offset, the
 *    margin is then applied. Positive coordinates move the popup away from the
 *    spot it was positioned towards its center. Negative coordinates move it
 *    towards the spot it was positioned away from its center.
 * @param {?number=} opt_overflow Overflow handling mode. Defaults to IGNORE if
 *     not specified. Bitmap, {@see goog.positioning.Overflow}.
 * @param {goog.math.Size=} opt_preferredSize The preferred size of the
 *     movableElement.
 * @param {goog.math.Box=} opt_viewport Box object describing the dimensions of
 *     the viewport. The viewport is specified relative to offsetParent of
 *     `movableElement`. In other words, the viewport can be thought of as
 *     describing a "position: absolute" element contained in the offsetParent.
 *     It defaults to visible area of nearest scrollable ancestor of
 *     `movableElement` (see `goog.style.getVisibleRectForElement`).
 * @return {goog.positioning.OverflowStatus} Status bitmap,
 *     {@see goog.positioning.OverflowStatus}.
 */
goog.positioning.positionAtAnchor = function(
    anchorElement, anchorElementCorner, movableElement, movableElementCorner,
    opt_offset, opt_margin, opt_overflow, opt_preferredSize, opt_viewport) {
  'use strict';
  goog.asserts.assert(movableElement);
  var movableParentTopLeft =
      goog.positioning.getOffsetParentPageOffset(movableElement);

  // Get the visible part of the anchor element.  anchorRect is
  // relative to anchorElement's page.
  var anchorRect = goog.positioning.getVisiblePart_(anchorElement);

  // Translate anchorRect to be relative to movableElement's page.
  goog.style.translateRectForAnotherFrame(
      anchorRect, goog.dom.getDomHelper(anchorElement),
      goog.dom.getDomHelper(movableElement));

  // Offset based on which corner of the element we want to position against.
  var corner =
      goog.positioning.getEffectiveCorner(anchorElement, anchorElementCorner);
  var offsetLeft = anchorRect.left;
  if (corner & goog.positioning.CornerBit.RIGHT) {
    offsetLeft += anchorRect.width;
  } else if (corner & goog.positioning.CornerBit.CENTER) {
    offsetLeft += anchorRect.width / 2;
  }

  // absolutePos is a candidate position relative to the
  // movableElement's window.
  var absolutePos = new goog.math.Coordinate(
      offsetLeft, anchorRect.top +
          (corner & goog.positioning.CornerBit.BOTTOM ? anchorRect.height : 0));

  // Translate absolutePos to be relative to the offsetParent.
  absolutePos =
      goog.math.Coordinate.difference(absolutePos, movableParentTopLeft);

  // Apply offset, if specified
  if (opt_offset) {
    absolutePos.x +=
        (corner & goog.positioning.CornerBit.RIGHT ? -1 : 1) * opt_offset.x;
    absolutePos.y +=
        (corner & goog.positioning.CornerBit.BOTTOM ? -1 : 1) * opt_offset.y;
  }

  // Determine dimension of viewport.
  var viewport;
  if (opt_overflow) {
    if (opt_viewport) {
      viewport = opt_viewport;
    } else {
      viewport = goog.style.getVisibleRectForElement(movableElement);
      if (viewport) {
        viewport.top -= movableParentTopLeft.y;
        viewport.right -= movableParentTopLeft.x;
        viewport.bottom -= movableParentTopLeft.y;
        viewport.left -= movableParentTopLeft.x;
      }
    }
  }

  return goog.positioning.positionAtCoordinate(
      absolutePos, movableElement, movableElementCorner, opt_margin, viewport,
      opt_overflow, opt_preferredSize);
};


/**
 * Calculates the page offset of the given element's
 * offsetParent. This value can be used to translate any x- and
 * y-offset relative to the page to an offset relative to the
 * offsetParent, which can then be used directly with as position
 * coordinate for `positionWithCoordinate`.
 * @param {!Element} movableElement The element to calculate.
 * @return {!goog.math.Coordinate} The page offset, may be (0, 0).
 */
goog.positioning.getOffsetParentPageOffset = function(movableElement) {
  'use strict';
  // Ignore offset for the BODY element unless its position is non-static.
  // For cases where the offset parent is HTML rather than the BODY (such as in
  // IE strict mode) there's no need to get the position of the BODY as it
  // doesn't affect the page offset.
  var movableParentTopLeft;
  var parent = /** @type {?} */ (movableElement).offsetParent;
  if (parent) {
    var isBody = parent.tagName == goog.dom.TagName.HTML ||
        parent.tagName == goog.dom.TagName.BODY;
    if (!isBody || goog.style.getComputedPosition(parent) != 'static') {
      // Get the top-left corner of the parent, in page coordinates.
      movableParentTopLeft = goog.style.getPageOffset(parent);

      if (!isBody) {
        movableParentTopLeft = goog.math.Coordinate.difference(
            movableParentTopLeft,
            new goog.math.Coordinate(
                goog.style.bidi.getScrollLeft(parent), parent.scrollTop));
      }
    }
  }

  return movableParentTopLeft || new goog.math.Coordinate();
};


/**
 * Returns intersection of the specified element and
 * goog.style.getVisibleRectForElement for it.
 *
 * @param {Element} el The target element.
 * @return {!goog.math.Rect} Intersection of getVisibleRectForElement
 *     and the current bounding rectangle of the element.  If the
 *     intersection is empty, returns the bounding rectangle.
 * @private
 */
goog.positioning.getVisiblePart_ = function(el) {
  'use strict';
  var rect = goog.style.getBounds(el);
  var visibleBox = goog.style.getVisibleRectForElement(el);
  if (visibleBox) {
    rect.intersection(goog.math.Rect.createFromBox(visibleBox));
  }
  return rect;
};


/**
 * Positions the specified corner of the movable element at the
 * specified coordinate.
 *
 * @param {goog.math.Coordinate} absolutePos The coordinate to position the
 *     element at.
 * @param {Element} movableElement The element to be positioned.
 * @param {goog.positioning.Corner} movableElementCorner The corner of the
 *     movableElement that that should be positioned.
 * @param {goog.math.Box=} opt_margin A margin specified in pixels.
 *    After the normal positioning algorithm is applied and any offset, the
 *    margin is then applied. Positive coordinates move the popup away from the
 *    spot it was positioned towards its center. Negative coordinates move it
 *    towards the spot it was positioned away from its center.
 * @param {goog.math.Box=} opt_viewport Box object describing the dimensions of
 *     the viewport. Required if opt_overflow is specified.
 * @param {?number=} opt_overflow Overflow handling mode. Defaults to IGNORE if
 *     not specified, {@see goog.positioning.Overflow}.
 * @param {goog.math.Size=} opt_preferredSize The preferred size of the
 *     movableElement. Defaults to the current size.
 * @return {goog.positioning.OverflowStatus} Status bitmap.
 */
goog.positioning.positionAtCoordinate = function(
    absolutePos, movableElement, movableElementCorner, opt_margin, opt_viewport,
    opt_overflow, opt_preferredSize) {
  'use strict';
  absolutePos = absolutePos.clone();

  // Offset based on attached corner and desired margin.
  var corner =
      goog.positioning.getEffectiveCorner(movableElement, movableElementCorner);
  var elementSize = goog.style.getSize(movableElement);
  var size =
      opt_preferredSize ? opt_preferredSize.clone() : elementSize.clone();

  var positionResult = goog.positioning.getPositionAtCoordinate(
      absolutePos, size, corner, opt_margin, opt_viewport, opt_overflow);

  if (positionResult.status & goog.positioning.OverflowStatus.FAILED) {
    return positionResult.status;
  }

  goog.style.setPosition(movableElement, positionResult.rect.getTopLeft());
  size = positionResult.rect.getSize();
  if (!goog.math.Size.equals(elementSize, size)) {
    goog.style.setBorderBoxSize(movableElement, size);
  }

  return positionResult.status;
};


/**
 * Computes the position for an element to be placed on-screen at the
 * specified coordinates. Returns an object containing both the resulting
 * rectangle, and the overflow status bitmap.
 *
 * @param {!goog.math.Coordinate} absolutePos The coordinate to position the
 *     element at.
 * @param {!goog.math.Size} elementSize The size of the element to be
 *     positioned.
 * @param {goog.positioning.Corner} elementCorner The corner of the
 *     movableElement that that should be positioned.
 * @param {goog.math.Box=} opt_margin A margin specified in pixels.
 *    After the normal positioning algorithm is applied and any offset, the
 *    margin is then applied. Positive coordinates move the popup away from the
 *    spot it was positioned towards its center. Negative coordinates move it
 *    towards the spot it was positioned away from its center.
 * @param {goog.math.Box=} opt_viewport Box object describing the dimensions of
 *     the viewport. Required if opt_overflow is specified.
 * @param {?number=} opt_overflow Overflow handling mode. Defaults to IGNORE
 *     if not specified, {@see goog.positioning.Overflow}.
 * @return {{rect:!goog.math.Rect, status:goog.positioning.OverflowStatus}}
 *     Object containing the computed position and status bitmap.
 */
goog.positioning.getPositionAtCoordinate = function(
    absolutePos, elementSize, elementCorner, opt_margin, opt_viewport,
    opt_overflow) {
  'use strict';
  absolutePos = absolutePos.clone();
  elementSize = elementSize.clone();
  var status = goog.positioning.OverflowStatus.NONE;

  if (opt_margin || elementCorner != goog.positioning.Corner.TOP_LEFT) {
    if (elementCorner & goog.positioning.CornerBit.RIGHT) {
      absolutePos.x -= elementSize.width + (opt_margin ? opt_margin.right : 0);
    } else if (elementCorner & goog.positioning.CornerBit.CENTER) {
      absolutePos.x -= elementSize.width / 2;
    } else if (opt_margin) {
      absolutePos.x += opt_margin.left;
    }
    if (elementCorner & goog.positioning.CornerBit.BOTTOM) {
      absolutePos.y -=
          elementSize.height + (opt_margin ? opt_margin.bottom : 0);
    } else if (opt_margin) {
      absolutePos.y += opt_margin.top;
    }
  }

  // Adjust position to fit inside viewport.
  if (opt_overflow) {
    status = opt_viewport ?
        goog.positioning.adjustForViewport_(
            absolutePos, elementSize, opt_viewport, opt_overflow) :
        goog.positioning.OverflowStatus.FAILED_OUTSIDE_VIEWPORT;
  }

  var rect = new goog.math.Rect(0, 0, 0, 0);
  rect.left = absolutePos.x;
  rect.top = absolutePos.y;
  rect.width = elementSize.width;
  rect.height = elementSize.height;
  return {rect: rect, status: status};
};


/**
 * Adjusts the position and/or size of an element, identified by its position
 * and size, to fit inside the viewport. If the position or size of the element
 * is adjusted the pos or size objects, respectively, are modified.
 *
 * @param {goog.math.Coordinate} pos Position of element, updated if the
 *     position is adjusted.
 * @param {goog.math.Size} size Size of element, updated if the size is
 *     adjusted.
 * @param {goog.math.Box} viewport Bounding box describing the viewport.
 * @param {number} overflow Overflow handling mode,
 *     {@see goog.positioning.Overflow}.
 * @return {goog.positioning.OverflowStatus} Status bitmap,
 *     {@see goog.positioning.OverflowStatus}.
 * @private
 */
goog.positioning.adjustForViewport_ = function(pos, size, viewport, overflow) {
  'use strict';
  var status = goog.positioning.OverflowStatus.NONE;

  var ADJUST_X_EXCEPT_OFFSCREEN =
      goog.positioning.Overflow.ADJUST_X_EXCEPT_OFFSCREEN;
  var ADJUST_Y_EXCEPT_OFFSCREEN =
      goog.positioning.Overflow.ADJUST_Y_EXCEPT_OFFSCREEN;
  if ((overflow & ADJUST_X_EXCEPT_OFFSCREEN) == ADJUST_X_EXCEPT_OFFSCREEN &&
      (pos.x < viewport.left || pos.x >= viewport.right)) {
    overflow &= ~goog.positioning.Overflow.ADJUST_X;
  }
  if ((overflow & ADJUST_Y_EXCEPT_OFFSCREEN) == ADJUST_Y_EXCEPT_OFFSCREEN &&
      (pos.y < viewport.top || pos.y >= viewport.bottom)) {
    overflow &= ~goog.positioning.Overflow.ADJUST_Y;
  }

  // Left edge outside viewport, try to move it.
  if (pos.x < viewport.left && overflow & goog.positioning.Overflow.ADJUST_X) {
    pos.x = viewport.left;
    status |= goog.positioning.OverflowStatus.ADJUSTED_X;
  }

  // Ensure object is inside the viewport width if required.
  if (overflow & goog.positioning.Overflow.RESIZE_WIDTH) {
    // Move left edge inside viewport.
    var originalX = pos.x;
    if (pos.x < viewport.left) {
      pos.x = viewport.left;
      status |= goog.positioning.OverflowStatus.WIDTH_ADJUSTED;
    }

    // Shrink width to inside right of viewport.
    if (pos.x + size.width > viewport.right) {
      // Set the width to be either the new maximum width within the viewport
      // or the width originally within the viewport, whichever is less.
      size.width = Math.min(
          viewport.right - pos.x, originalX + size.width - viewport.left);
      size.width = Math.max(size.width, 0);
      status |= goog.positioning.OverflowStatus.WIDTH_ADJUSTED;
    }
  }

  // Right edge outside viewport, try to move it.
  if (pos.x + size.width > viewport.right &&
      overflow & goog.positioning.Overflow.ADJUST_X) {
    pos.x = Math.max(viewport.right - size.width, viewport.left);
    status |= goog.positioning.OverflowStatus.ADJUSTED_X;
  }

  // Left or right edge still outside viewport, fail if the FAIL_X option was
  // specified, ignore it otherwise.
  if (overflow & goog.positioning.Overflow.FAIL_X) {
    status |=
        (pos.x < viewport.left ? goog.positioning.OverflowStatus.FAILED_LEFT :
                                 0) |
        (pos.x + size.width > viewport.right ?
             goog.positioning.OverflowStatus.FAILED_RIGHT :
             0);
  }

  // Top edge outside viewport, try to move it.
  if (pos.y < viewport.top && overflow & goog.positioning.Overflow.ADJUST_Y) {
    pos.y = viewport.top;
    status |= goog.positioning.OverflowStatus.ADJUSTED_Y;
  }

  // Ensure object is inside the viewport height if required.
  if (overflow & goog.positioning.Overflow.RESIZE_HEIGHT) {
    // Move top edge inside viewport.
    var originalY = pos.y;
    if (pos.y < viewport.top) {
      pos.y = viewport.top;
      status |= goog.positioning.OverflowStatus.HEIGHT_ADJUSTED;
    }

    // Shrink height to inside bottom of viewport.
    if (pos.y + size.height > viewport.bottom) {
      // Set the height to be either the new maximum height within the viewport
      // or the height originally within the viewport, whichever is less.
      size.height = Math.min(
          viewport.bottom - pos.y, originalY + size.height - viewport.top);
      size.height = Math.max(size.height, 0);
      status |= goog.positioning.OverflowStatus.HEIGHT_ADJUSTED;
    }
  }

  // Bottom edge outside viewport, try to move it.
  if (pos.y + size.height > viewport.bottom &&
      overflow & goog.positioning.Overflow.ADJUST_Y) {
    pos.y = Math.max(viewport.bottom - size.height, viewport.top);
    status |= goog.positioning.OverflowStatus.ADJUSTED_Y;
  }

  // Top or bottom edge still outside viewport, fail if the FAIL_Y option was
  // specified, ignore it otherwise.
  if (overflow & goog.positioning.Overflow.FAIL_Y) {
    status |=
        (pos.y < viewport.top ? goog.positioning.OverflowStatus.FAILED_TOP :
                                0) |
        (pos.y + size.height > viewport.bottom ?
             goog.positioning.OverflowStatus.FAILED_BOTTOM :
             0);
  }

  return /** @type {!goog.positioning.OverflowStatus} */ (status);
};


/**
 * Returns an absolute corner (top/bottom left/right) given an absolute
 * or relative (top/bottom start/end) corner and the direction of an element.
 * Absolute corners remain unchanged.
 * @param {Element} element DOM element to test for RTL direction.
 * @param {goog.positioning.Corner} corner The popup corner used for
 *     positioning.
 * @return {goog.positioning.Corner} Effective corner.
 */
goog.positioning.getEffectiveCorner = function(element, corner) {
  'use strict';
  return /** @type {goog.positioning.Corner} */ (
      (corner & goog.positioning.CornerBit.FLIP_RTL &&
               goog.style.isRightToLeft(element) ?
           corner ^ goog.positioning.CornerBit.RIGHT :
           corner) &
      ~goog.positioning.CornerBit.FLIP_RTL);
};


/**
 * Returns the corner opposite the given one horizontally.
 * @param {goog.positioning.Corner} corner The popup corner used to flip.
 * @return {goog.positioning.Corner} The opposite corner horizontally.
 */
goog.positioning.flipCornerHorizontal = function(corner) {
  'use strict';
  return /** @type {goog.positioning.Corner} */ (
      corner ^ goog.positioning.CornerBit.RIGHT);
};


/**
 * Returns the corner opposite the given one vertically.
 * @param {goog.positioning.Corner} corner The popup corner used to flip.
 * @return {goog.positioning.Corner} The opposite corner vertically.
 */
goog.positioning.flipCornerVertical = function(corner) {
  'use strict';
  return /** @type {goog.positioning.Corner} */ (
      corner ^ goog.positioning.CornerBit.BOTTOM);
};


/**
 * Returns the corner opposite the given one horizontally and vertically.
 * @param {goog.positioning.Corner} corner The popup corner used to flip.
 * @return {goog.positioning.Corner} The opposite corner horizontally and
 *     vertically.
 */
goog.positioning.flipCorner = function(corner) {
  'use strict';
  return /** @type {goog.positioning.Corner} */ (
      corner ^ goog.positioning.CornerBit.BOTTOM ^
      goog.positioning.CornerBit.RIGHT);
};
