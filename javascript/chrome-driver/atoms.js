// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview Chrome specific atoms.
 *
 */

goog.provide('webdriver.chrome');

goog.require('bot.dom');
goog.require('bot.locators');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');
goog.require('goog.math.Size');
goog.require('goog.style');

/**
 * True if shadow dom is enabled.
 * @const
 * @type {boolean}
 */
var SHADOW_DOM_ENABLED = typeof ShadowRoot === 'function';

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

  function getContainer(elem) {
    var container = elem.parentNode;
    if (SHADOW_DOM_ENABLED && (container instanceof ShadowRoot)) {
      container = elem.host;
    }
    return container;
  }

  var doc = goog.dom.getOwnerDocument(elem);
  var container = getContainer(elem);
  var offset;
  while (container &&
         container != doc.documentElement &&
         container != doc.body) {
    offset = webdriver.chrome.computeOffsetInContainer_(
        /** @type {!Element} */ (container), elem);
    var containerSize = new goog.math.Size(container.clientWidth,
                                           container.clientHeight);
    scrollHelper(container, containerSize, offset, region, center);
    container = getContainer(container);
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
 *     to fit in the view.
 * @param {!goog.math.Rect} opt_region The region relative to the element's
 *     border box to be scrolled into view. If null, the border box will be
 *     used.
 * @return {!goog.math.Coordinate} The top-left coordinate of the element's
 *     region in client space.
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
 * @param {!goog.math.Coordinate} coord The coordinate to use.
 * @return {{clickable:boolean, message: (string|undefined)}} Object containing
 *     a boolean "clickable" property, as to whether it can be clicked, and an
 *     optional "message" string property, which contains any warning/error
 *     message.
 */
webdriver.chrome.isElementClickable = function(elem, coord) {
  /**
   * @param {boolean} clickable .
   * @param {string=} opt_msg .
   * @return {{clickable: boolean, message: (string|undefined)}} .
   */
  function makeResult(clickable, opt_msg) {
    var dict = {'clickable': clickable};
    if (opt_msg)
      dict['message'] = opt_msg;
    return dict;
  }

  // get the outermost ancestor of the element. This will be either the document
  // or a shadow root.
  var owner = elem;
  while (owner.parentNode) {
    owner = owner.parentNode;
  }

  var elemAtPoint = owner.elementFromPoint(coord.x, coord.y);
  if (elemAtPoint == elem)
    return makeResult(true);

  var coordStr = '(' + coord.x + ', ' + coord.y + ')';
  if (elemAtPoint == null) {
    return makeResult(
        false, 'Element is not clickable at point ' + coordStr);
  }
  var elemAtPointHTML = elemAtPoint.outerHTML.replace(elemAtPoint.innerHTML, 
                                                      elemAtPoint.hasChildNodes() 
                                                      ? '...' : '');
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
  var elemHTML = elem.outerHTML.replace(elem.innerHTML, 
                                        elem.hasChildNodes() ? '...' : '');
  return makeResult(
      false,
      'Element ' + elemHTML + ' is not clickable at point '
      + coordStr + '. Other element ' +
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

/**
 * Determines whether an element is what a user would call "shown". Mainly based
 * on bot.dom.isShown, but with extra intelligence regarding shadow DOM.
 *
 * @param {!Element} elem The element to consider.
 * @param {boolean=} opt_inComposedDom Whether to check if the element is shown
 *     within the composed DOM; defaults to false.
 * @param {boolean=} opt_ignoreOpacity Whether to ignore the element's opacity
 *     when determining whether it is shown; defaults to false.
 * @return {boolean} Whether or not the element is visible.
 */
webdriver.chrome.isElementDisplayed = function(elem,
                                               opt_inComposedDom,
                                               opt_ignoreOpacity) {
  if (!bot.dom.isShown(elem, opt_ignoreOpacity)) {
    return false;
  }
  // if it's not invisible then check if the element is within the shadow DOM
  // of an invisible element, using recursive calls to this function
  if (SHADOW_DOM_ENABLED) {
    var topLevelNode = elem;
    while (topLevelNode.parentNode) {
      topLevelNode = topLevelNode.parentNode;
    }
    if (topLevelNode instanceof ShadowRoot) {
      return webdriver.chrome.isElementDisplayed(topLevelNode.host,
                                                 opt_inComposedDom);
    }
  }
  // if it's not invisible, or in a shadow DOM, then it's definitely visible
  return true;
};

/**
 * Same as bot.locators.findElement (description copied below), but
 * with workarounds for shadow DOM.
 *
 * Find the first element in the DOM matching the target. The target
 * object should have a single key, the name of which determines the
 * locator strategy and the value of which gives the value to be
 * searched for. For example {id: 'foo'} indicates that the first
 * element on the DOM with the ID 'foo' should be returned.
 *
 * @param {!Object} target The selector to search for.
 * @param {(Document|Element)=} opt_root The node from which to start the
 *     search. If not specified, will use {@code document} as the root.
 * @return {Element} The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
webdriver.chrome.findElement = function(target, opt_root) {
  // This works fine if opt_root is outside of a shadow DOM, but for various
  // (presumably performance-based) reasons, it works by getting opt_root's
  // owning document, searching that, and then checking if the result is owned
  // by opt_root. Searching the owning document for a child of a shadow root
  // obviously doesn't work. However we try the performance-optimised version
  // first...
  var elem = bot.locators.findElement(target, opt_root);
  if (elem) {
    return elem;
  }
  // If we didn't find anything using that method, check to see if opt_root
  // is within a shadow DOM...
  if (SHADOW_DOM_ENABLED && opt_root) {
    var topLevelNode = opt_root;
    while (topLevelNode.parentNode) {
      topLevelNode = topLevelNode.parentNode;
    }
    if (topLevelNode instanceof ShadowRoot) {
      // findElement_s_ works fine if passed an root that's in a shadow root.
      elem = bot.locators.findElements(target, opt_root)[0];
      if (elem) {
        return elem;
      }
    }
  }
  return null;
};
