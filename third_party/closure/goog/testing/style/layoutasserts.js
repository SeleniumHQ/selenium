// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A utility class for making layout assertions. This is a port
 * of http://go/layoutbot.java
 * See {@link http://go/layouttesting}.
*
*
 */

goog.provide('goog.testing.style.layoutasserts');

goog.require('goog.style');
goog.require('goog.testing.asserts');

/**
 * Asserts that an element has:
 *   1 - a CSS rendering the makes the element visible.
 *   2 - a non-zero width and height.
 * @param {Element|string} a The element or optionally the comment string.
 * @param {Element=} opt_b The element when a comment string is present.
 */
function assertIsVisible(a, opt_b) {
  _validateArguments(1, arguments);
  var element = nonCommentArg(1, 1, arguments);

  _assert(commentArg(1, arguments),
      goog.testing.style.layoutasserts.isVisible_(element) &&
      goog.testing.style.layoutasserts.hasVisibleDimension_(element),
      'Specified element should be visible.');
}


/**
 * The counter assertion of assertIsVisible().
 * @param {Element|string} a The element or optionally the comment string.
 * @param {Element=} opt_b The element when a comment string is present.
 */
function assertNotVisible(a, opt_b) {
  _validateArguments(1, arguments);
  var element = nonCommentArg(1, 1, arguments);
  if (!element) {
    return;
  }

  _assert(commentArg(1, arguments),
      !goog.testing.style.layoutasserts.isVisible_(element) ||
      !goog.testing.style.layoutasserts.hasVisibleDimension_(element),
    'Specified element should not be visible.');
}


/**
 * Asserts that the two specified elements intersect.
 * @param {Element|string} a The first element or optionally the comment string.
 * @param {Element} b The second element or the first element if comment string
 *     is present.
 * @param {Element=} opt_c The second element if comment string is present.
 */
function assertIntersect(a, b, opt_c) {
  _validateArguments(2, arguments);
  var element = nonCommentArg(1, 2, arguments);
  var otherElement = nonCommentArg(2, 2, arguments);

  _assert(commentArg(1, arguments),
      goog.testing.style.layoutasserts.intersects_(element, otherElement),
      'Elements should intersect.');
}


/**
 * Asserts that the two specified elements do not intersect.
 * @param {Element|string} a The first element or optionally the comment string.
 * @param {Element} b The second element or the first element if comment string
 *     is present.
 * @param {Element=} opt_c The second element if comment string is present.
 */
function assertNoIntersect(a, b, opt_c) {
  _validateArguments(2, arguments);
  var element = nonCommentArg(1, 2, arguments);
  var otherElement = nonCommentArg(2, 2, arguments);

  _assert(commentArg(1, arguments),
      !goog.testing.style.layoutasserts.intersects_(element, otherElement),
      'Elements should not intersect.');
}


/**
 * Asserts that the element must have the specified width.
 * @param {Element|string} a The first element or optionally the comment string.
 * @param {Element} b The second element or the first element if comment string
 *     is present.
 * @param {Element=} opt_c The second element if comment string is present.
 */
function assertWidth(a, b, opt_c) {
  _validateArguments(2, arguments);
  var element = nonCommentArg(1, 2, arguments);
  var width = nonCommentArg(2, 2, arguments);
  var size = goog.style.getSize(element);
  var elementWidth = size.width;

  _assert(commentArg(1, arguments),
      goog.testing.style.layoutasserts.isWithinThreshold_(
          width, elementWidth, 0 /* tolerance */),
      'Element should have width ' + width + ' but was ' + elementWidth + '.');
}


/**
 * Asserts that the element must have the specified width within the specified
 * tolerance.
 * @param {Element|string} a The element or optionally the comment string.
 * @param {number|Element} b The height or the element if comment string is
 *     present.
 * @param {number} c The tolerance or the height if comment string is
 *     present.
 * @param {number=} opt_d The tolerance if comment string is present.
 */
function assertWidthWithinTolerance(a, b, c, opt_d) {
  _validateArguments(3, arguments);
  var element = nonCommentArg(1, 3, arguments);
  var width = nonCommentArg(2, 3, arguments);
  var tolerance = nonCommentArg(3, 3, arguments);
  var size = goog.style.getSize(element);
  var elementWidth = size.width;

  _assert(commentArg(1, arguments),
      goog.testing.style.layoutasserts.isWithinThreshold_(
          width, elementWidth, tolerance),
      'Element width(' + elementWidth + ') should be within given width(' +
      width + ') with tolerance value of ' + tolerance + '.');
}


/**
 * Asserts that the element must have the specified height.
 * @param {Element|string} a The first element or optionally the comment string.
 * @param {Element} b The second element or the first element if comment string
 *     is present.
 * @param {Element=} opt_c The second element if comment string is present.
 */
function assertHeight(a, b, opt_c) {
  _validateArguments(2, arguments);
  var element = nonCommentArg(1, 2, arguments);
  var height = nonCommentArg(2, 2, arguments);
  var size = goog.style.getSize(element);
  var elementHeight = size.height;

  _assert(commentArg(1, arguments),
      goog.testing.style.layoutasserts.isWithinThreshold_(
          height, elementHeight, 0 /* tolerance */),
      'Element should have height ' + height + '.');
}


/**
 * Asserts that the element must have the specified height within the specified
 * tolerance.
 * @param {Element|string} a The element or optionally the comment string.
 * @param {number|Element} b The height or the element if comment string is
 *     present.
 * @param {number} c The tolerance or the height if comment string is
 *     present.
 * @param {number=} opt_d The tolerance if comment string is present.
 */
function assertHeightWithinTolerance(a, b, c, opt_d) {
  _validateArguments(3, arguments);
  var element = nonCommentArg(1, 3, arguments);
  var height = nonCommentArg(2, 3, arguments);
  var tolerance = nonCommentArg(3, 3, arguments);
  var size = goog.style.getSize(element);
  var elementHeight = size.height;

  _assert(commentArg(1, arguments),
    goog.testing.style.layoutasserts.isWithinThreshold_(
        height, elementHeight, tolerance),
    'Element width(' + elementHeight + ') should be within given width(' +
    height + ') with tolerance value of ' + tolerance + '.');
}


/**
 * Asserts that the first element is to the left of the second element.
 * @param {Element|string} a The first element or optionally the comment string.
 * @param {Element} b The second element or the first element if comment string
 *     is present.
 * @param {Element=} opt_c The second element if comment string is present.
 */
function assertIsLeftOf(a, b, opt_c) {
  _validateArguments(2, arguments);
  var element = nonCommentArg(1, 2, arguments);
  var otherElement = nonCommentArg(2, 2, arguments);
  var elementRect = goog.style.getBounds(element);
  var otherElementRect = goog.style.getBounds(otherElement);

  _assert(commentArg(1, arguments),
      elementRect.left < otherElementRect.left,
      'Elements should be left to right.');
}


/**
 * Asserts that the first element is strictly left of the second element.
 * @param {Element|string} a The first element or optionally the comment string.
 * @param {Element} b The second element or the first element if comment string
 *     is present.
 * @param {Element=} opt_c The second element if comment string is present.
 */
function assertIsStrictlyLeftOf(a, b, opt_c) {
  _validateArguments(2, arguments);
  var element = nonCommentArg(1, 2, arguments);
  var otherElement = nonCommentArg(2, 2, arguments);
  var elementRect = goog.style.getBounds(element);
  var otherElementRect = goog.style.getBounds(otherElement);

  _assert(commentArg(1, arguments),
      elementRect.left + elementRect.width < otherElementRect.left,
      'Elements should be strictly left to right.');
}


/**
 * Asserts that the first element is higher than the second element.
 * @param {Element|string} a The first element or optionally the comment string.
 * @param {Element} b The second element or the first element if comment string
 *     is present.
 * @param {Element=} opt_c The second element if comment string is present.
 */
function assertIsAbove(a, b, opt_c) {
  _validateArguments(2, arguments);
  var element = nonCommentArg(1, 2, arguments);
  var otherElement = nonCommentArg(2, 2, arguments);
  var elementRect = goog.style.getBounds(element);
  var otherElementRect = goog.style.getBounds(otherElement);

  _assert(commentArg(1, arguments),
      elementRect.top < otherElementRect.top,
      'Elements should be top to bottom.');
}


/**
 * Asserts that the first element is strictly higher than the second element.
 * @param {Element|string} a The first element or optionally the comment string.
 * @param {Element} b The second element or the first element if comment string
 *     is present.
 * @param {Element=} opt_c The second element if comment string is present.
 */
function assertIsStrictlyAbove(a, b, opt_c) {
  _validateArguments(2, arguments);
  var element = nonCommentArg(1, 2, arguments);
  var otherElement = nonCommentArg(2, 2, arguments);
  var elementRect = goog.style.getBounds(element);
  var otherElementRect = goog.style.getBounds(otherElement);

  _assert(commentArg(1, arguments),
      elementRect.top + elementRect.height < otherElementRect.top,
      'Elements should be strictly top to bottom.');
}


/**
 * Asserts that the first element's bounds contain the bounds of the second
 * element.
 * @param {Element|string} a The first element or optionally the comment string.
 * @param {Element} b The second element or the first element if comment string
 *     is present.
 * @param {Element=} opt_c The second element if comment string is present.
 */
function assertContained(a, b, opt_c) {
  _validateArguments(2, arguments);
  var element = nonCommentArg(1, 2, arguments);
  var otherElement = nonCommentArg(2, 2, arguments);
  var elementRect = goog.style.getBounds(element);
  var otherElementRect = goog.style.getBounds(otherElement);

  _assert(commentArg(1, arguments),
      elementRect.contains(otherElementRect),
      'Element should be contained within the other element.');
}


/**
 * Returns true if the bounding rectangle of the given elements intersect.
 * @param {Element} element The first element.
 * @param {Element} otherElement The second element.
 * @private
 */
goog.testing.style.layoutasserts.intersects_ = function(element, otherElement) {
  var elementRect = goog.style.getBounds(element);
  var otherElementRect = goog.style.getBounds(otherElement);
  return goog.math.Rect.intersects(elementRect, otherElementRect);
};


/**
 * Returns true if the difference between val1 and val2 is less than or equal to
 * the threashold.
 * @param {number} val1 The first value.
 * @param {number} val2 The second value.
 * @param {number} threshold The threshold value.
 * @return {boolean} Whether or not the the values are within the threshold.
 * @private
 */
goog.testing.style.layoutasserts.isWithinThreshold_ = function(
    val1, val2, threshold) {
  return Math.abs(val1 - val2) <= threshold;
};


/**
 * Returns true if the element has a visible dimension, i.e. x > 0 && y > 0.
 * @param {Element} element The element to check for visible dimension.
 * @private
 */
goog.testing.style.layoutasserts.hasVisibleDimension_ = function(element) {
  var elSize = goog.style.getSize(element);
  var longest = elSize.getLongest();
  if (longest <= 0) {
    return false;
  }

  return true;
};


/**
 * Returns true if the CSS style of the element renders it visible.
 * @param {Element} element The element to check for visibility.
 * @private
 */
goog.testing.style.layoutasserts.isVisible_ = function(element) {
  var visibilityStyle =
      goog.testing.style.layoutasserts.getAvailableStyle_(
          element, 'visibility');
  var displayStyle =
      goog.testing.style.layoutasserts.getAvailableStyle_(element, 'display');

  return (visibilityStyle != 'hidden' && displayStyle != 'none');
};


/**
 * This is essentially goog.style.getStyle_. goog.style.getStyle_ is private
 * and is not a recommended way for general purpose style extractor. For the
 * purposes of layout testing, we only use this function for retrieving
 * 'visiblity' and 'display' style.
 * @param {Element} element The element to retrieve the style from.
 * @param {string} style Style property name.
 * @private
 */
goog.testing.style.layoutasserts.getAvailableStyle_ = function(element, style) {
  return goog.style.getComputedStyle(element, style) ||
      goog.style.getCascadedStyle(element, style) ||
      goog.style.getStyle(element, style);
};
