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

goog.provide('bot.locators.relative');

goog.require('bot');
goog.require('bot.dom');
goog.require('bot.locators');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.math.Rect');


/**
 *  @typedef {function(!Element):!boolean}
 */
var Filter;

/**
 * @param {!Element|function():!Element|!Object} selector Mechanism to be used
 *    to find the element.
 * @param {!function(!goog.math.Rect, !goog.math.Rect):boolean} proximity
 * @return {!Filter} A function that determines whether the
 *    selector matches the proximity function.
 * @private
 */
bot.locators.relative.proximity_ = function (selector, proximity) {
  /**
   * Assigning to a temporary variable to keep the closure compiler happy.
   * @todo Inline this.
   *
   * @type {!function(!Element):boolean}
   */
  var toReturn = function (compareTo) {
    var element = bot.locators.relative.resolve_(selector);

    var rect1 = bot.dom.getClientRect(element);
    var rect2 = bot.dom.getClientRect(compareTo);

    return proximity.call(null, rect1, rect2);
  };

  return toReturn;
};


/**
 * Relative locator to find elements that are above the expected one. "Above"
 * is defined as where the bottom of the element found by `selector` is above
 * the top of an element we're comparing to.
 *
 * @param {!Element|function():!Element|!Object} selector Mechanism to be used to find the element.
 * @return {!Filter} A function that determines whether the selector is above the given element.
 * @private
 */
bot.locators.relative.above_ = function (selector) {
  return bot.locators.relative.proximity_(
    selector,
    function (rect1, rect2) {
      // "rect1" is the element we're comparing against. "rect2" is the variable element
      var top = rect2.top + rect2.height;
      return top < rect1.top;
    });
};


/**
 * Relative locator to find elements that are below the expected one. "Below"
 * is defined as where the top of the element found by `selector` is below the
 * bottom of an element we're comparing to.
 *
 * @param {!Element|function():!Element|!Object} selector Mechanism to be used to find the element.
 * @return {!Filter} A function that determines whether the selector is below the given element.
 * @private
 */
bot.locators.relative.below_ = function (selector) {
  return bot.locators.relative.proximity_(
    selector,
    function (rect1, rect2) {
      var bottom = rect1.top + rect1.height;
      return bottom < rect2.top;
    });
};


/**
 * Relative locator to find elements that are to the left of the expected one.
 *
 * @param {!Element|function():!Element|!Object} selector Mechanism to be used to find the element.
 * @return {!Filter} A function that determines whether the selector is left of the given element.
 * @private
 */
bot.locators.relative.leftOf_ = function (selector) {
  return bot.locators.relative.proximity_(
    selector,
    function (rect1, rect2) {
      var left = rect2.left + rect2.width;
      return left < rect1.left;
    });
};


/**
 * Relative locator to find elements that are to the left of the expected one.
 *
 * @param {!Element|function():!Element|!Object} selector Mechanism to be used to find the element.
 * @return {!Filter} A function that determines whether the selector is right of the given element.
 * @private
 */
bot.locators.relative.rightOf_ = function (selector) {
  return bot.locators.relative.proximity_(
    selector,
    function (rect1, rect2) {
      var right = rect1.left + rect1.width;
      return right < rect2.left;
    });
};


/**
 * Find elements within (by default) 50 pixels of the selected element. An
 * element is not near itself.
 *
 * @param {!Element|function():!Element|!Object} selector Mechanism to be used to find the element.
 * @param {number=} opt_distance Optional distance in pixels to count as "near" (defaults to 50 pixels).
 * @return {!Filter} A function that determines whether the selector is near the given element.
 * @private
 */
bot.locators.relative.near_ = function (selector, opt_distance) {
  var distance;
  if (opt_distance) {
    distance = opt_distance;
  } else if (goog.isNumber(selector['distance'])) {
    distance = /** @type {number} */ (selector['distance']);
    // delete selector['distance'];
  }

  if (!distance) {
    distance = 50;
  }

  /**
   * @param {!Element} compareTo
   * @return {boolean}
   */
  var func = function (compareTo) {
    var element = bot.locators.relative.resolve_(selector);

    if (element === compareTo) {
      return false;
    }

    var rect1 = bot.dom.getClientRect(element);
    var rect2 = bot.dom.getClientRect(compareTo);

    var rect1_bigger = new goog.math.Rect(rect1.left-distance,rect1.top-distance,rect1.width+distance*2,rect1.height+distance*2);

    return rect1_bigger.intersects(rect2);
  };

  return func;
};


/**
 * @param {!Element|function():!Element|!Object} selector Mechanism to be used to find the element.
 * @returns {!Element} A single element.
 * @private
 */
bot.locators.relative.resolve_ = function (selector) {
  if (goog.dom.isElement(selector)) {
    return /** @type {!Element} */ (selector);
  }

  if (goog.isFunction(selector)) {
    var func = /** @type {function():!Element} */ (selector);
    return bot.locators.relative.resolve_(func.call(null));
  }

  if (goog.isObject(selector)) {
    var element = bot.locators.findElement(selector);
    if (!element) {
      throw new bot.Error(
        bot.ErrorCode.NO_SUCH_ELEMENT,
        "No element has been found by " + JSON.stringify(selector));
    }
    return element;
  }

  throw new bot.Error(
    bot.ErrorCode.INVALID_ARGUMENT,
    "Selector is of wrong type: " + JSON.stringify(selector));
};


/**
 * @type {!Object<string, function(!Object):!Filter>}
 * @private
 * @const
 */
bot.locators.relative.STRATEGIES_ = {
  'left': bot.locators.relative.leftOf_,
  'right': bot.locators.relative.rightOf_,
  'above': bot.locators.relative.above_,
  'below': bot.locators.relative.below_,
  'near': bot.locators.relative.near_,
};

bot.locators.relative.RESOLVERS_ = {
  'left': bot.locators.relative.resolve_,
  'right': bot.locators.relative.resolve_,
  'above': bot.locators.relative.resolve_,
  'below': bot.locators.relative.resolve_,
  'near': bot.locators.relative.resolve_,
};

/**
 * @param {!IArrayLike<!Element>} allElements
 * @param {!IArrayLike<!Filter>}filters
 * @return {!Array<!Element>}
 * @private
 */
bot.locators.relative.filterElements_ = function (allElements, filters) {
  var toReturn = [];
  goog.array.forEach(
    allElements,
    function (element) {
      if (!!!element) {
        return;
      }

      var include = goog.array.every(
        filters,
        function (filter) {
          // Look up the filter function by name
          var name = filter["kind"];
          var strategy = bot.locators.relative.STRATEGIES_[name];

          if (!!!strategy) {
            throw new bot.Error(
              bot.ErrorCode.INVALID_ARGUMENT,
              "Cannot find filter suitable for " + name);
          }

          // Call it with args.
          var filterFunc = strategy.apply(null, filter["args"]);
          return filterFunc(/** @type {!Element} */(element));
        },
        null);

      if (include) {
        toReturn.push(element);
      }
    },
    null);

  // We want to sort the returned elements by proximity to the last "anchor"
  // element in the filters.
  var finalFilter = goog.array.last(filters);
  var name = finalFilter ? finalFilter["kind"] : "unknown";
  var resolver = bot.locators.relative.RESOLVERS_[name];
  if (!!!resolver) {
    return toReturn;
  }
  var lastAnchor = resolver.apply(null, finalFilter["args"]);
  if (!!!lastAnchor) {
    return toReturn;
  }

  return bot.locators.relative.sortByProximity_(lastAnchor, toReturn);
};


/**
 * @param {!Element} anchor
 * @param {!Array<!Element>} elements
 * @return {!Array<!Element>}
 * @private
 */
bot.locators.relative.sortByProximity_ = function (anchor, elements) {
  var anchorRect = bot.dom.getClientRect(anchor);
  var anchorCenter = {
    x: anchorRect.left + (Math.max(1, anchorRect.width) / 2),
    y: anchorRect.top + (Math.max(1, anchorRect.height) / 2)
  };

  var distance = function (e) {
    var rect = bot.dom.getClientRect(e);
    var center = {
      x: rect.left + (Math.max(1, rect.width) / 2),
      y: rect.top + (Math.max(1, rect.height) / 2)
    };

    var x = Math.pow(anchorCenter.x - center.x, 2);
    var y = Math.pow(anchorCenter.y - center.y, 2);

    return Math.sqrt(x + y);
  };

  goog.array.sort(elements, function (left, right) {
    return distance(left) - distance(right);
  });

  return elements;
};


/**
 * Find an element by using a relative locator.
 *
 * @param {!Object} target The search criteria.
 * @param {!(Document|Element)} ignored_root The document or element to perform
 *     the search under, which is ignored.
 * @return {Element} The first matching element, or null if no such element
 *     could be found.
 */
bot.locators.relative.single = function (target, ignored_root) {
  var matches = bot.locators.relative.many(target, ignored_root);
  if (goog.array.isEmpty(matches)) {
    return null;
  }
  return matches[0];
};


/**
 * Find many elements by using the value of the ID attribute.
 * @param {!Object} target The search criteria.
 * @param {!(Document|Element)} root The document or element to perform
 *     the search under, which is ignored.
 * @return {!IArrayLike<Element>} All matching elements, or an empty list.
 */
bot.locators.relative.many = function (target, root) {
  if (!target.hasOwnProperty("root") || !target.hasOwnProperty("filters")) {
    throw new bot.Error(
      bot.ErrorCode.INVALID_ARGUMENT,
      "Locator not suitable for relative locators: " + JSON.stringify(target));
  }
  if (!goog.isArrayLike(target["filters"])) {
    throw new bot.Error(
      bot.ErrorCode.INVALID_ARGUMENT,
      "Targets should be an array: " + JSON.stringify(target));
  }

  var elements;
  if (bot.dom.isElement(target["root"])) {
    elements = [ /** @type {!Element} */ (target["root"])];
  } else {
    elements = bot.locators.findElements(target["root"], root);
  }

  if (goog.array.isEmpty(elements)) {
    return [];
  }

  var filters = target["filters"];
  return bot.locators.relative.filterElements_(elements, filters);
};
