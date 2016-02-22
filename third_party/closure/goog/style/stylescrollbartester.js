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
 * @fileoverview Shared unit tests for scrollbar measurement.
 *
 * @author flan@google.com (Ian Flanigan)
 */

goog.provide('goog.styleScrollbarTester');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.style');
goog.require('goog.testing.asserts');
goog.setTestOnly('goog.styleScrollbarTester');


/**
 * Tests the scrollbar width calculation. Assumes that there is an element with
 * id 'test-scrollbarwidth' in the page.
 */
function testScrollbarWidth() {
  var width = goog.style.getScrollbarWidth();
  assertTrue(width > 0);

  var outer = goog.dom.getElement('test-scrollbarwidth');
  var inner = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.DIV,
                                                    null, outer)[0];
  assertTrue('should have a scroll bar',
      hasVerticalScroll(outer));
  assertTrue('should have a scroll bar',
      hasHorizontalScroll(outer));

  // Get the inner div absolute width
  goog.style.setStyle(outer, 'width', '100%');
  assertTrue('should have a scroll bar',
      hasVerticalScroll(outer));
  assertFalse('should not have a scroll bar',
      hasHorizontalScroll(outer));
  var innerAbsoluteWidth = inner.offsetWidth;

  // Leave the vertical scroll and remove the horizontal by using the scroll
  // bar width calculation.
  goog.style.setStyle(outer, 'width',
      (innerAbsoluteWidth + width) + 'px');
  assertTrue('should have a scroll bar',
      hasVerticalScroll(outer));
  assertFalse('should not have a scroll bar',
      hasHorizontalScroll(outer));

  // verify by adding 1 more pixel (brings back the vertical scroll bar).
  goog.style.setStyle(outer, 'width',
      (innerAbsoluteWidth + width - 1) + 'px');
  assertTrue('should have a scroll bar',
      hasVerticalScroll(outer));
  assertTrue('should have a scroll bar',
      hasHorizontalScroll(outer));
}


function hasVerticalScroll(el) {
  return el.clientWidth != 0 && el.offsetWidth - el.clientWidth > 0;
}


function hasHorizontalScroll(el) {
  return el.clientHeight != 0 && el.offsetHeight - el.clientHeight > 0;
}
