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
 * @fileoverview Common positioning code.
 *
 */

goog.provide('goog.positioning');
goog.provide('goog.positioning.Corner');
goog.provide('goog.positioning.CornerBit');
goog.provide('goog.positioning.Overflow');
goog.provide('goog.positioning.OverflowStatus');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.math.Box');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.style');


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
  TOP_RIGHT: 2,
  BOTTOM_LEFT: 1,
  BOTTOM_RIGHT: 3,
  TOP_START: 4,
  TOP_END: 6,
  BOTTOM_START: 5,
  BOTTOM_END: 7
};


/**
 * Enum for bits in the {@see goog.positioning.Corner) bitmap.
 *
 * @enum {number}
 */
goog.positioning.CornerBit = {
  BOTTOM: 1,
  RIGHT: 2,
  FLIP_RTL: 4
};


/**
 * Enum for representing position handling in cases where the element would be
 * positioned outside the viewport.
 *
 * @enum {number}
 */
goog.positioning.Overflow = {
  IGNORE: 0,
  ADJUST_X: 1,
  FAIL_X: 2,
  ADJUST_Y: 4,
  FAIL_Y: 8,
  RESIZE_WIDTH: 16,
  RESIZE_HEIGHT: 32
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
  FAILED_OUTSIDE_VIEWPORT: 256
};


/**
 * Shorthand to check if a status code contains any fail code.
 * @type {number}
 */
goog.positioning.OverflowStatus.FAILED =
    goog.positioning.OverflowStatus.FAILED_LEFT |
    goog.positioning.OverflowStatus.FAILED_RIGHT |
    goog.positioning.OverflowStatus.FAILED_TOP |
    goog.positioning.OverflowStatus.FAILED_BOTTOM |
    goog.positioning.OverflowStatus.FAILED_OUTSIDE_VIEWPORT;


/**
 * Shorthand to check if horizontal positioning failed.
 * @type {number}
 */
goog.positioning.OverflowStatus.FAILED_HORIZONTAL =
    goog.positioning.OverflowStatus.FAILED_LEFT |
    goog.positioning.OverflowStatus.FAILED_RIGHT;


/**
 * Shorthand to check if vertical positioning failed.
 * @type {number}
 */
goog.positioning.OverflowStatus.FAILED_VERTICAL =
    goog.positioning.OverflowStatus.FAILED_TOP |
    goog.positioning.OverflowStatus.FAILED_BOTTOM;


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
 * @return {goog.positioning.OverflowStatus} Status bitmap,
 *     {@see goog.positioning.OverflowStatus}.
 */
goog.positioning.positionAtAnchor = function(anchorElement,
                                             anchorElementCorner,
                                             movableElement,
                                             movableElementCorner,
                                             opt_offset,
                                             opt_margin,
                                             opt_overflow,
                                             opt_preferredSize) {
  // Ignore offset for the BODY element unless its position is non-static.
  // For cases where the offset parent is HTML rather than the BODY (such as in
  // IE strict mode) there's no need to get the position of the BODY as it
  // doesn't affect the page offset.
  var moveableParentTopLeft;
  var parent = movableElement.offsetParent;
  if (parent) {
    var isBody = parent.tagName == goog.dom.TagName.HTML ||
        parent.tagName == goog.dom.TagName.BODY;
    if (!isBody ||
        goog.style.getComputedPosition(parent) != 'static') {
      // Get the top-left corner of the parent, in page coordinates.
      moveableParentTopLeft = goog.style.getPageOffset(parent);

      if (!isBody) {
        moveableParentTopLeft = goog.math.Coordinate.difference(
            moveableParentTopLeft,
            new goog.math.Coordinate(parent.scrollLeft, parent.scrollTop));
      }
    }
  }

  // Get the visible part of the anchor element.  anchorRect is
  // relative to anchorElement's page.
  var anchorRect = goog.positioning.getVisiblePart_(anchorElement);

  // Translate anchorRect to be relative to movableElement's page.
  goog.style.translateRectForAnotherFrame(
      anchorRect,
      goog.dom.getDomHelper(anchorElement),
      goog.dom.getDomHelper(movableElement));

  // Offset based on which corner of the element we want to position against.
  var corner = goog.positioning.getEffectiveCorner(anchorElement,
                                                   anchorElementCorner);
  // absolutePos is a candidate position relative to the
  // movableElement's window.
  var absolutePos = new goog.math.Coordinate(
      corner & goog.positioning.CornerBit.RIGHT ?
          anchorRect.left + anchorRect.width : anchorRect.left,
      corner & goog.positioning.CornerBit.BOTTOM ?
          anchorRect.top + anchorRect.height : anchorRect.top);

  // Translate absolutePos to be relative to the offsetParent.
  if (moveableParentTopLeft) {
    absolutePos =
        goog.math.Coordinate.difference(absolutePos, moveableParentTopLeft);
  }

  // Apply offset, if specified
  if (opt_offset) {
    absolutePos.x += (corner & goog.positioning.CornerBit.RIGHT ? -1 : 1) *
        opt_offset.x;
    absolutePos.y += (corner & goog.positioning.CornerBit.BOTTOM ? -1 : 1) *
        opt_offset.y;
  }

  // Determine dimension of viewport.
  var viewport;
  if (opt_overflow) {
    viewport = goog.style.getVisibleRectForElement(movableElement);
    if (viewport && moveableParentTopLeft) {
      viewport.top = Math.max(0, viewport.top - moveableParentTopLeft.y);
      viewport.right -= moveableParentTopLeft.x;
      viewport.bottom -= moveableParentTopLeft.y;
      viewport.left = Math.max(0, viewport.left - moveableParentTopLeft.x);
    }
  }

  return goog.positioning.positionAtCoordinate(absolutePos,
                                               movableElement,
                                               movableElementCorner,
                                               opt_margin,
                                               viewport,
                                               opt_overflow,
                                               opt_preferredSize);
};


/**
 * Returns intersection of the specified element and
 * goog.style.getVisibleRectForElement for it.
 *
 * @param {Element} el The target element.
 * @return {goog.math.Rect} Intersection of getVisibleRectForElement
 *     and the current bounding rectangle of the element.  If the
 *     intersection is empty, returns the bounding rectangle.
 * @private
 */
goog.positioning.getVisiblePart_ = function(el) {
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
goog.positioning.positionAtCoordinate = function(absolutePos,
                                                 movableElement,
                                                 movableElementCorner,
                                                 opt_margin,
                                                 opt_viewport,
                                                 opt_overflow,
                                                 opt_preferredSize) {
  absolutePos = absolutePos.clone();
  var status = goog.positioning.OverflowStatus.NONE;

  // Offset based on attached corner and desired margin.
  var corner = goog.positioning.getEffectiveCorner(movableElement,
                                                   movableElementCorner);
  var elementSize = goog.style.getSize(movableElement);
  var size = opt_preferredSize ? opt_preferredSize.clone() :
      elementSize;

  if (opt_margin || corner != goog.positioning.Corner.TOP_LEFT) {
    if (corner & goog.positioning.CornerBit.RIGHT) {
      absolutePos.x -= size.width + (opt_margin ? opt_margin.right : 0);
    } else if (opt_margin) {
      absolutePos.x += opt_margin.left;
    }
    if (corner & goog.positioning.CornerBit.BOTTOM) {
      absolutePos.y -= size.height + (opt_margin ? opt_margin.bottom : 0);
    } else if (opt_margin) {
      absolutePos.y += opt_margin.top;
    }
  }

  // Adjust position to fit inside viewport.
  if (opt_overflow) {
    status = opt_viewport ? goog.positioning.adjustForViewport(absolutePos,
                                                               size,
                                                               opt_viewport,
                                                               opt_overflow) :
        goog.positioning.OverflowStatus.FAILED_OUTSIDE_VIEWPORT;
    if (status & goog.positioning.OverflowStatus.FAILED) {
      return status;
    }
  }

  goog.style.setPosition(movableElement, absolutePos);
  if (!goog.math.Size.equals(elementSize, size)) {
    goog.style.setSize(movableElement, size);
  }

  return status;
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
 */
goog.positioning.adjustForViewport = function(pos, size, viewport, overflow) {
  var status = goog.positioning.OverflowStatus.NONE;

  // Left edge outside viewport, try to move it.
  if (pos.x < viewport.left && overflow & goog.positioning.Overflow.ADJUST_X) {
    pos.x = viewport.left;
    status |= goog.positioning.OverflowStatus.ADJUSTED_X;
  }

  // Left edge inside and right edge outside viewport, try to resize it.
  if (pos.x < viewport.left &&
      pos.x + size.width > viewport.right &&
      overflow & goog.positioning.Overflow.RESIZE_WIDTH) {
    size.width -= (pos.x + size.width) - viewport.right;
    status |= goog.positioning.OverflowStatus.WIDTH_ADJUSTED;
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
    status |= (pos.x < viewport.left ?
                  goog.positioning.OverflowStatus.FAILED_LEFT : 0) |
              (pos.x + size.width > viewport.right ?
                  goog.positioning.OverflowStatus.FAILED_RIGHT : 0);
  }

  // Top edge outside viewport, try to move it.
  if (pos.y < viewport.top && overflow & goog.positioning.Overflow.ADJUST_Y) {
    pos.y = viewport.top;
    status |= goog.positioning.OverflowStatus.ADJUSTED_Y;
  }

  // Top edge inside and bottom edge outside viewport, try to resize it.
  if (pos.y >= viewport.top &&
      pos.y + size.height > viewport.bottom &&
      overflow & goog.positioning.Overflow.RESIZE_HEIGHT) {
    size.height -= (pos.y + size.height) - viewport.bottom;
    status |= goog.positioning.OverflowStatus.HEIGHT_ADJUSTED;
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
    status |= (pos.y < viewport.top ?
                  goog.positioning.OverflowStatus.FAILED_TOP : 0) |
              (pos.y + size.height > viewport.bottom ?
                  goog.positioning.OverflowStatus.FAILED_BOTTOM : 0);
  }

  return status;
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
  return /** @type {goog.positioning.Corner} */ (
      (corner & goog.positioning.CornerBit.FLIP_RTL &&
          goog.style.isRightToLeft(element) ?
          corner ^ goog.positioning.CornerBit.RIGHT :
          corner
      ) & ~goog.positioning.CornerBit.FLIP_RTL);
};


/**
 * Returns the corner opposite the given one horizontally.
 * @param {goog.positioning.Corner} corner The popup corner used to flip.
 * @return {goog.positioning.Corner} The opposite corner horizontally.
 */
goog.positioning.flipCornerHorizontal = function(corner) {
  return /** @type {goog.positioning.Corner} */ (corner ^
      goog.positioning.CornerBit.RIGHT);
};


/**
 * Returns the corner opposite the given one vertically.
 * @param {goog.positioning.Corner} corner The popup corner used to flip.
 * @return {goog.positioning.Corner} The opposite corner vertically.
 */
goog.positioning.flipCornerVertical = function(corner) {
  return /** @type {goog.positioning.Corner} */ (corner ^
      goog.positioning.CornerBit.BOTTOM);
};


/**
 * Returns the corner opposite the given one horizontally and vertically.
 * @param {goog.positioning.Corner} corner The popup corner used to flip.
 * @return {goog.positioning.Corner} The opposite corner horizontally and
 *     vertically.
 */
goog.positioning.flipCorner = function(corner) {
  return /** @type {goog.positioning.Corner} */ (corner ^
      goog.positioning.CornerBit.BOTTOM ^
      goog.positioning.CornerBit.RIGHT);
};
