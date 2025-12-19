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

goog.setTestOnly('goog.testing.style');
goog.provide('goog.testing.style');

goog.require('goog.dom');
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
 * Elements detached from the document are considered invisible.
 * @param {!Element} element The element to check.
 * @return {boolean} Whether the CSS style of the element renders it visible.
 */
goog.testing.style.isVisible = function(element) {
  if (!goog.dom.isInDocument(element)) {
    return false;
  }
  var style = getComputedStyle(element);
  return style.visibility != 'hidden' && style.display != 'none';
};


/**
 * Test whether the given element is on screen.
 * @param {!Element} el The element to test.
 * @return {boolean} Whether the element is on the screen.
 */
goog.testing.style.isOnScreen = function(el) {
  var doc = goog.dom.getDomHelper(el).getDocument();
  var viewport = goog.style.getVisibleRectForElement(doc.body);
  var viewportRect = goog.math.Rect.createFromBox(viewport);
  return goog.dom.contains(doc, el) &&
      goog.style.getBounds(el).intersects(viewportRect);
};
