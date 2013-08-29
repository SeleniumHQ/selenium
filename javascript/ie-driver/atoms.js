// Copyright 2013 WebDriver committers
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
 * @fileoverview IE specific atoms.
 */

goog.provide('webdriver.ie');

goog.require('bot.dom');
goog.require('bot.locators');
goog.require('goog.dom.TagName');
goog.require('goog.style');
goog.require('goog.userAgent');


/**
 * Find the first element in the DOM matching the mechanism and critera.
 *
 * @param {!string} mechanism The mechanism to search by.
 * @param {!string} criteria The criteria to search for.
 * @param {(Document|Element)=} opt_root The node from which to start the
 *     search. If not specified, will use {@code document} as the root.
 * @return {Element} The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
webdriver.ie.findElement = function(mechanism, criteria, opt_root) {
  var locator = {};
  locator[mechanism] = criteria;
  return bot.locators.findElement(locator, opt_root);
};


/**
 * Find all elements in the DOM matching the mechanism and critera.
 *
 * @param {!string} mechanism The mechanism to search by.
 * @param {!string} criteria The criteria to search for.
 * @param {(Document|Element)=} opt_root The node from which to start the
 *     search. If not specified, will use {@code document} as the root.
 * @return {!goog.array.ArrayLike.<Element>} All matching elements found in the
 *     DOM.
 */
webdriver.ie.findElements = function(mechanism, criteria, opt_root) {
  var locator = {};
  locator[mechanism] = criteria;
  return bot.locators.findElements(locator, opt_root);
};


/**
 * Checks whether the element is currently scrolled into the parent's overflow
 * region, such that the offset given, relative to the top-left corner of the
 * element, is currently in the overflow region.
 *
 * @param {!Element} element The element to check.
 * @param {!goog.math.Coordinate=} opt_coords Coordinate in the element,
 *     relative to the top-left corner of the element, to check. If none are
 *     specified, checks that the center of the element is in in the overflow.
 * @return {boolean} Whether the coordinates specified, relative to the element,
 *     are scrolled in the parent overflow.
 */
webdriver.ie.isInParentOverflow = function(element, opt_coords) {
  var parent = goog.style.getOffsetParent(element);
  var parentNode = goog.userAgent.GECKO || goog.userAgent.IE ||
      goog.userAgent.OPERA ? bot.dom.getParentElement(element) : parent;

  // Gecko will skip the BODY tag when calling getOffsetParent. However, the
  // combination of the overflow values on the BODY _and_ HTML tags determine
  // whether scroll bars are shown, so we need to guarantee that both values
  // are checked.
  if ((goog.userAgent.GECKO || goog.userAgent.IE || goog.userAgent.OPERA) &&
      bot.dom.isElement(parentNode, goog.dom.TagName.BODY)) {
    parent = parentNode;
  }

  if (parent && (bot.dom.getEffectiveStyle(parent, 'overflow') == 'scroll' ||
                 bot.dom.getEffectiveStyle(parent, 'overflow') == 'auto')) {
    var parentRect = bot.dom.getClientRect(parent);
    var elementRect = bot.dom.getClientRect(element);
    var offsetX, offsetY;
    if (opt_coords) {
      offsetX = opt_coords.x;
      offsetY = opt_coords.y;
    } else {
      offsetX = elementRect.width / 2;
      offsetY = elementRect.height / 2;
    }
    var elementPointX = elementRect.left + offsetX;
    var elementPointY = elementRect.top + offsetY;
    if (elementPointX >= parentRect.left + parentRect.width) {
      return true;
    }
    if (elementPointX <= parentRect.left) {
      return true;
    }
    if (elementPointY >= parentRect.top + parentRect.height) {
      return true;
    }
    if (elementPointY <= parentRect.top) {
      return true;
    }
    return webdriver.ie.isInParentOverflow(parent);
  }
  return false;
};
