// Copyright 2011 WebDriver committers
// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Chrome specific atoms.
 *
 */

goog.provide('webdriver.chrome');

goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');
goog.require('goog.math.Size');
goog.require('goog.style');


/**
 * Returns the minimum required offsets to scroll a given region into view.
 * If the region is larger than the scrollable view, the region will be
 * centered or aligned with the top-left of the scrollable view, depending
 * on the value of "center".
 *
 * @param {!goog.math.Size} size The size of the scrollable view.
 * @param {!goog.math.Rect} region The region of the scrollable to bring into
 *     view.
 * @param {boolean} center If true, when the region is too big to view,
 *     center it instead of aligning with the top-left.
 * @return {!goog.math.Coordinate} Offset by which to scroll.
 * @private
 */
webdriver.chrome.computeScrollOffsets_ = function(size, region,
                                                  center) {
  var scroll = [0, 0];
  var scrollableSize = [size.width, size.height];
  var regionLoc = [region.left, region.top];
  var regionSize = [region.width, region.height];

  for (var i = 0; i < 2; i++) {
    if (regionSize[i] > scrollableSize[i]) {
      if (center)
        scroll[i] = regionLoc[i] + regionSize[i] / 2 - scrollableSize[i] / 2;
      else
        scroll[i] = regionLoc[i];
    } else {
      var alignRight = regionLoc[i] - scrollableSize[i] + regionSize[i];
      if (alignRight > 0)
        scroll[i] = alignRight;
      else if (regionLoc[i] < 0)
        scroll[i] = regionLoc[i];
    }
  }

  return new goog.math.Coordinate(scroll[0], scroll[1]);
};


/**
 * Return the offset of the given element from its container.
 *
 * @param {!Element} container The container.
 * @param {!Element} elem The element.
 * @return {!goog.math.Coordinate} The offset.
 * @private
 */
webdriver.chrome.computeOffsetInContainer_ = function(container, elem) {
  var offset = goog.math.Coordinate.difference(
      goog.style.getPageOffset(elem), goog.style.getPageOffset(container));
  var containerBorder = goog.style.getBorderBox(container);
  offset.x -= containerBorder.left;
  offset.y -= containerBorder.top;
  return offset;
};


/**
 * Scrolls the region of an element into view. If the region will not fit,
 * it will be aligned at the top-left or centered, depending on
 * "center".
 *
 * @param {!Element} elem The element with the region to scroll into view.
 * @param {!goog.math.Rect} region The region, relative to the element's
 *     border box, to scroll into view.
 * @param {boolean} center If true, when the region is too big to view,
 *     center it instead of aligning with the top-left.
 * @private
 */
webdriver.chrome.scrollIntoView_ = function(elem, region, center) {
  function scrollHelper(scrollable, size, offset, region, center) {
    region = new goog.math.Rect(
        offset.x + region.left, offset.y + region.top,
        region.width, region.height);

    var scroll = webdriver.chrome.computeScrollOffsets_(size, region, center);
    scrollable.scrollLeft += scroll.x;
    scrollable.scrollTop += scroll.y;
  }

  var doc = goog.dom.getOwnerDocument(elem);
  var container = elem.parentNode;
  var offset;
  while (container &&
         container != doc.documentElement &&
         container != doc.body) {
    offset = webdriver.chrome.computeOffsetInContainer_(container, elem);
    var containerSize = new goog.math.Size(container.clientWidth,
                                           container.clientHeight);
    scrollHelper(container, containerSize, offset, region, center);
    container = container.parentNode;
  }

  offset = goog.style.getClientPosition(elem);
  var windowSize = goog.dom.getDomHelper(elem).getViewportSize();
  scrollHelper(doc.body, windowSize, offset, region, center);
};


/**
 * Scrolls a region of the given element into the client's view and returns
 * its position relative to the client viewport. If the element or region is too
 * large to fit in the view, it will be centered or aligned to the top-left,
 * depending on the value of "center".
 *
 * scrollIntoView is not used because it does not work correctly in Chrome:
 *     http://crbug.com/73953.
 *
 * The element should be attached to the current document.
 *
 * @param {!Element} elem The element to use.
 * @param {boolean} center If true, center the region when it is too big
 *     to fit in the view
 * @param {!goog.math.Rect} opt_region The region relative to the element's
 *     border box to be scrolled into view. If null, the border box will be
 *     used.
 * @return {!goog.math.Coordinate} The top-left coordinate of the element's
 *     region in client space
 */
webdriver.chrome.getLocationInView = function(elem, center, opt_region) {
  var region = opt_region;
  if (!region)
    region = new goog.math.Rect(0, 0, elem.offsetWidth, elem.offsetHeight);

  webdriver.chrome.scrollIntoView_(elem, region, center);

  var elemClientPos = goog.style.getClientPosition(elem);
  return new goog.math.Coordinate(
      elemClientPos.x + region.left, elemClientPos.y + region.top);
};


/**
 * Returns the first client rect of the given element, relative to the
 * element's border box. If the element does not have any client rects,
 * throws an error.
 *
 * @param {!Element} elem The element to use.
 * @return {!goog.math.Rect} The first client rect of the given element,
 *     relative to the element's border box.
 */
webdriver.chrome.getFirstClientRect = function(elem) {
  var clientRects = elem.getClientRects();
  if (clientRects.length == 0)
    throw new Error('Element does not have any client rects');
  var clientRect = clientRects[0];
  var clientPos = goog.style.getClientPosition(elem);
  return new goog.math.Rect(
      clientRect.left - clientPos.x, clientRect.top - clientPos.y,
      clientRect.right - clientRect.left, clientRect.bottom - clientRect.top);
};


/**
 * Returns whether the element or any of its descendants would receive a click
 * at the given location. Useful for debugging test clicking issues.
 *
 * @param {!Element} elem The element to use.
 * @param {!goog.math.Coordinate} coord, The coordinate to use.
 * @return {{clickable:boolean, message:string=}} Object containing a boolean
 *     "clickable" property, as to whether it can be clicked, and an optional
 *     "message" string property, which contains any warning/error message.
 */
webdriver.chrome.isElementClickable = function(elem, coord) {
  function makeResult(clickable, opt_msg) {
    var dict = {'clickable': clickable};
    if (opt_msg)
      dict['message'] = opt_msg;
    return dict;
  }

  var elemAtPoint = elem.ownerDocument.elementFromPoint(coord.x, coord.y);
  if (elemAtPoint == elem)
    return makeResult(true);

  var coord = '(' + coord.x + ', ' + coord.y + ')';
  if (elemAtPoint == null) {
    return makeResult(
        false, 'Element is not clickable at point ' + coord);
  }
  var elemAtPointHTML = elemAtPoint.outerHTML;
  if (elemAtPoint.hasChildNodes()) {
    var inner = elemAtPoint.innerHTML;
    var closingTag = '</' + elemAtPoint.tagName + '>';
    var innerStart = elemAtPointHTML.length - inner.length - closingTag.length;
    elemAtPointHTML = elemAtPointHTML.substring(0, innerStart) + '...' +
        elemAtPointHTML.substring(innerStart + inner.length);
  }
  var parentElemIter = elemAtPoint.parentNode;
  while (parentElemIter) {
    if (parentElemIter == elem) {
      return makeResult(
          true,
          'Element\'s descendant would receive the click. Consider ' +
              'clicking the descendant instead. Descendant: ' +
                  elemAtPointHTML);
    }
    parentElemIter = parentElemIter.parentNode;
  }
  return makeResult(
      false,
      'Element is not clickable at point ' + coord + '. Other element ' +
          'would receive the click: ' + elemAtPointHTML);
};


/**
 * Returns the current page zoom ratio for the page with the given element.
 *
 * @param {!Element} elem The element to use.
 * @return {number} Page zoom ratio.
 */
webdriver.chrome.getPageZoom = function(elem) {
  // From http://stackoverflow.com/questions/1713771/
  //     how-to-detect-page-zoom-level-in-all-modern-browsers
  var doc = goog.dom.getOwnerDocument(elem);
  var docElem = doc.documentElement;
  var width = Math.max(
      docElem.clientWidth, docElem.offsetWidth, docElem.scrollWidth);
  return doc.width / width;
};

