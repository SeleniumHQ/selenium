// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Bidi utility functions.
 *
 */

goog.provide('goog.style.bidi');

goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.userAgent');


/**
 * Returns the normalized scrollLeft position for a scrolled element.
 * @param {Element} element The scrolled element.
 * @return {number} The number of pixels the element is scrolled. 0 indicates
 *     that the element is not scrolled at all (which, in general, is the
 *     left-most position in ltr and the right-most position in rtl).
 */
goog.style.bidi.getScrollLeft = function(element) {
  var isRtl = goog.style.isRightToLeft(element);
  if (isRtl && goog.userAgent.GECKO) {
    // ScrollLeft starts at 0 and then goes negative as the element is scrolled
    // towards the left.
    return -element.scrollLeft;
  } else if (isRtl && !(goog.userAgent.IE && goog.userAgent.isVersion('8'))) {
    // ScrollLeft starts at the maximum positive value and decreases towards
    // 0 as the element is scrolled towards the left.
    return element.scrollWidth - element.clientWidth - element.scrollLeft;
  }
  // ScrollLeft behavior is identical in rtl and ltr, it starts at 0 and
  // increases as the element is scrolled away from the start.
  return element.scrollLeft;
};


/**
 * Returns the "offsetStart" of an element, analagous to offsetLeft but
 * normalized for right-to-left environments and various browser
 * inconsistencies. This value returned can always be passed to setScrollOffset
 * to scroll to an element's left edge in a left-to-right offsetParent or
 * right edge in a right-to-left offsetParent.
 *
 * For example, here offsetStart is 10px in an LTR environment and 5px in RTL:
 *
 * <pre>
 * |          xxxxxxxxxx     |
 *  ^^^^^^^^^^   ^^^^   ^^^^^
 *     10px      elem    5px
 * </pre>
 *
 * If an element is positioned before the start of its offsetParent, the
 * startOffset may be negative.  This can be used with setScrollOffset to
 * reliably scroll to an element:
 *
 * <pre>
 * var scrollOffset = goog.style.bidi.getOffsetStart(element);
 * goog.style.bidi.setScrollOffset(element.offsetParent, scrollOffset);
 * </pre>
 *
 * @see setScrollOffset
 *
 * @param {Element} element The element for which we need to determine the
 *     offsetStart position.
 * @return {number} The offsetStart for that element.
 */
goog.style.bidi.getOffsetStart = function(element) {
  var offsetLeftForReal = element.offsetLeft;

  // The element might not have an offsetParent.
  // For example, the node might not be attached to the DOM tree,
  // and position:fixed children do not have an offset parent.
  // Just try to do the best we can with what we have.
  var bestParent = element.offsetParent;

  if (!bestParent && goog.style.getComputedPosition(element) == 'fixed') {
    bestParent = goog.dom.getOwnerDocument(element).documentElement;
  }

  // Just give up in this case.
  if (!bestParent) {
    return offsetLeftForReal;
  }

  if (goog.userAgent.GECKO) {
    // When calculating an element's offsetLeft, Firefox erroneously subtracts
    // the border width from the actual distance.  So we need to add it back.
    var borderWidths = goog.style.getBorderBox(bestParent);
    offsetLeftForReal += borderWidths.left;
  } else if (goog.userAgent.isDocumentMode(8)) {
    // When calculating an element's offsetLeft, IE8-Standards Mode erroneously
    // adds the border width to the actual distance.  So we need to subtract it.
    var borderWidths = goog.style.getBorderBox(bestParent);
    offsetLeftForReal -= borderWidths.left;
  }

  if (goog.style.isRightToLeft(bestParent)) {
    // Right edge of the element relative to the left edge of its parent.
    var elementRightOffset = offsetLeftForReal + element.offsetWidth;

    // Distance from the parent's right edge to the element's right edge.
    return bestParent.clientWidth - elementRightOffset;
  }

  return offsetLeftForReal;
};


/**
 * Sets the element's scrollLeft attribute so it is correctly scrolled by
 * offsetStart pixels.  This takes into account whether the element is RTL and
 * the nuances of different browsers.  To scroll to the "beginning" of an
 * element use getOffsetStart to obtain the element's offsetStart value and then
 * pass the value to setScrollOffset.
 * @see getOffsetStart
 * @param {Element} element The element to set scrollLeft on.
 * @param {number} offsetStart The number of pixels to scroll the element.
 *     If this value is < 0, 0 is used.
 */
goog.style.bidi.setScrollOffset = function(element, offsetStart) {
  offsetStart = Math.max(offsetStart, 0);
  // In LTR and in "mirrored" browser RTL (such as IE), we set scrollLeft to
  // the number of pixels to scroll.
  // Otherwise, in RTL, we need to account for different browser behavior.
  if (!goog.style.isRightToLeft(element)) {
    element.scrollLeft = offsetStart;
  } else if (goog.userAgent.GECKO) {
    // Negative scroll-left positions in RTL.
    element.scrollLeft = -offsetStart;
  } else if (!(goog.userAgent.IE && goog.userAgent.isVersion('8'))) {
    // Take the current scrollLeft value and move to the right by the
    // offsetStart to get to the left edge of the element, and then by
    // the clientWidth of the element to get to the right edge.
    element.scrollLeft =
        element.scrollWidth - offsetStart - element.clientWidth;
  } else {
    element.scrollLeft = offsetStart;
  }
};


/**
 * Sets the element's left style attribute in LTR or right style attribute in
 * RTL.  Also clears the left attribute in RTL and the right attribute in LTR.
 * @param {Element} elem The element to position.
 * @param {number} left The left position in LTR; will be set as right in RTL.
 * @param {?number} top The top position.  If null only the left/right is set.
 * @param {boolean} isRtl Whether we are in RTL mode.
 */
goog.style.bidi.setPosition = function(elem, left, top, isRtl) {
  if (!goog.isNull(top)) {
    elem.style.top = top + 'px';
  }
  if (isRtl) {
    elem.style.right = left + 'px';
    elem.style.left = '';
  } else {
    elem.style.left = left + 'px';
    elem.style.right = '';
  }
};
