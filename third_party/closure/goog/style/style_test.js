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
 * @fileoverview Shared unit tests for scrollbar measurement
 *
 * @author flan@google.com (Ian Flanigan)
 */

goog.provide('goog.style_test');

goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.testing.asserts');
goog.setTestOnly('Tests for scrollbars');


/**
 * Tests the scrollbar width calculation. Assumes that there is an element with
 * id 'test-scrollbarwidth' in the page.
 */
goog.style_test.testScrollbarWidth = function() {
  var width = goog.style.getScrollbarWidth();
  assertTrue(width > 0);

  var outer = goog.dom.getElement('test-scrollbarwidth');
  var inner = goog.dom.getElementsByTagNameAndClass('div', null, outer)[0];
  assertTrue('should have a scroll bar',
      goog.style_test.hasVerticalScroll(outer));
  assertTrue('should have a scroll bar',
      goog.style_test.hasHorizontalScroll(outer));

  // Get the inner div absolute width
  goog.style.setStyle(outer, 'width', '100%');
  assertTrue('should have a scroll bar',
      goog.style_test.hasVerticalScroll(outer));
  assertFalse('should not have a scroll bar',
      goog.style_test.hasHorizontalScroll(outer));
  var innerAbsoluteWidth = inner.offsetWidth;

  // Leave the vertical scroll and remove the horizontal by using the scroll
  // bar width calculation.
  goog.style.setStyle(outer, 'width',
      (innerAbsoluteWidth + width) + 'px');
  assertTrue('should have a scroll bar',
      goog.style_test.hasVerticalScroll(outer));
  assertFalse('should not have a scroll bar',
      goog.style_test.hasHorizontalScroll(outer));

  // verify by adding 1 more pixel (brings back the vertical scroll bar).
  goog.style.setStyle(outer, 'width',
      (innerAbsoluteWidth + width - 1) + 'px');
  assertTrue('should have a scroll bar',
      goog.style_test.hasVerticalScroll(outer));
  assertTrue('should have a scroll bar',
      goog.style_test.hasHorizontalScroll(outer));
};


goog.style_test.hasVerticalScroll = function(el) {
  return el.clientWidth != 0 && el.offsetWidth - el.clientWidth  > 0;
}


goog.style_test.hasHorizontalScroll = function(el) {
  return el.clientHeight != 0 && el.offsetHeight - el.clientHeight > 0;
}
