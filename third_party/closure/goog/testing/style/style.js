// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utilities for inspecting page layout. This is a port of
 *     http://go/layoutbot.java
 *     See {@link http://go/layouttesting}.
 */

goog.provide('goog.testing.style');

goog.require('goog.math.Rect');
goog.require('goog.style');


/**
 * Determines whether the bounding rectangles of the given elements intersect.
 * @param {Element} element The first element.
 * @param {Element} otherElement The second element.
 * @return {boolean} Whether the bounding rectangles of the given elements
 *     intersect.
 */
goog.testing.style.intersects = function(element, otherElement) {
  var elementRect = goog.style.getBounds(element);
  var otherElementRect = goog.style.getBounds(otherElement);
  return goog.math.Rect.intersects(elementRect, otherElementRect);
};


/**
 * Determines whether the element has visible dimensions, i.e. x > 0 && y > 0.
 * @param {Element} element The element to check.
 * @return {boolean} Whether the element has visible dimensions.
 */
goog.testing.style.hasVisibleDimensions = function(element) {
  var elSize = goog.style.getSize(element);
  var shortest = elSize.getShortest();
  if (shortest <= 0) {
    return false;
  }

  return true;
};


/**
 * Determines whether the CSS style of the element renders it visible.
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the CSS style of the element renders it visible.
 */
goog.testing.style.isVisible = function(element) {
  var visibilityStyle =
      goog.testing.style.getAvailableStyle_(element, 'visibility');
  var displayStyle =
      goog.testing.style.getAvailableStyle_(element, 'display');

  return (visibilityStyle != 'hidden' && displayStyle != 'none');
};


/**
 * This is essentially goog.style.getStyle_. goog.style.getStyle_ is private
 * and is not a recommended way for general purpose style extractor. For the
 * purposes of layout testing, we only use this function for retrieving
 * 'visiblity' and 'display' style.
 * @param {!Element} element The element to retrieve the style from.
 * @param {string} style Style property name.
 * @return {string} Style value.
 * @private
 */
goog.testing.style.getAvailableStyle_ = function(element, style) {
  return goog.style.getComputedStyle(element, style) ||
      goog.style.getCascadedStyle(element, style) ||
      goog.style.getStyle(element, style);
};
