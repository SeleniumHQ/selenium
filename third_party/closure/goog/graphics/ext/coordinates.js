// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Graphics utility functions for advanced coordinates.
 *
 * This file assists the use of advanced coordinates in goog.graphics.  Coords
 * can be specified as simple numbers which will correspond to units in the
 * graphics element's coordinate space.  Alternately, coords can be expressed
 * in pixels, meaning no matter what tranformations or coordinate system changes
 * are present, the number of pixel changes will remain constant.  Coords can
 * also be expressed as percentages of their parent's size.
 *
 * This file also allows for elements to have margins, expressable in any of
 * the ways described above.
 *
 * Additional pieces of advanced coordinate functionality can (soon) be found in
 * element.js and groupelement.js.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.graphics.ext.coordinates');

goog.require('goog.string');


/**
 * Cache of boolean values.  For a given string (key), is it special? (value)
 * @type {Object}
 * @private
 */
goog.graphics.ext.coordinates.specialCoordinateCache_ = {};


/**
 * Determines if the given coordinate is a percent based coordinate or an
 * expression with a percent based component.
 * @param {string} coord The coordinate to test.
 * @return {boolean} Whether the coordinate contains the string '%'.
 * @private
 */
goog.graphics.ext.coordinates.isPercent_ = function(coord) {
  return goog.string.contains(coord, '%');
};


/**
 * Determines if the given coordinate is a pixel based coordinate or an
 * expression with a pixel based component.
 * @param {string} coord The coordinate to test.
 * @return {boolean} Whether the coordinate contains the string 'px'.
 * @private
 */
goog.graphics.ext.coordinates.isPixels_ = function(coord) {
  return goog.string.contains(coord, 'px');
};


/**
 * Determines if the given coordinate is special - i.e. not just a number.
 * @param {string|number|null} coord The coordinate to test.
 * @return {boolean} Whether the coordinate is special.
 */
goog.graphics.ext.coordinates.isSpecial = function(coord) {
  var cache = goog.graphics.ext.coordinates.specialCoordinateCache_;

  if (!(coord in cache)) {
    cache[coord] = goog.isString(coord) && (
        goog.graphics.ext.coordinates.isPercent_(coord) ||
        goog.graphics.ext.coordinates.isPixels_(coord));
  }

  return cache[coord];
};


/**
 * Returns the value of the given expression in the given context.
 *
 * Should be treated as package scope.
 *
 * @param {string|number} coord The coordinate to convert.
 * @param {number} size The size of the parent element.
 * @param {number} scale The ratio of pixels to units.
 * @return {number} The number of coordinate space units that corresponds to
 *     this coordinate.
 */
goog.graphics.ext.coordinates.computeValue = function(coord, size, scale) {
  var number = parseFloat(String(coord));
  if (goog.isString(coord)) {
    if (goog.graphics.ext.coordinates.isPercent_(coord)) {
      return number * size / 100;
    } else if (goog.graphics.ext.coordinates.isPixels_(coord)) {
      return number / scale;
    }
  }

  return number;
};


/**
 * Converts the given coordinate to a number value in units.
 *
 * Should be treated as package scope.
 *
 * @param {string|number} coord The coordinate to retrieve the value for.
 * @param {boolean|undefined} forMaximum Whether we are computing the largest
 *     value this coordinate would be in a parent of no size.  The container
 *     size in this case should be set to the size of the current element.
 * @param {number} containerSize The unit value of the size of the container of
 *     this element.  Should be set to the minimum width of this element if
 *     forMaximum is true.
 * @param {number} scale The ratio of pixels to units.
 * @param {Object=} opt_cache Optional (but highly recommend) object to store
 *     cached computations in.  The calling class should manage clearing out
 *     the cache when the scale or containerSize changes.
 * @return {number} The correct number of coordinate space units.
 */
goog.graphics.ext.coordinates.getValue = function(coord, forMaximum,
    containerSize, scale, opt_cache) {
  if (!goog.isNumber(coord)) {
    var cacheString = opt_cache && ((forMaximum ? 'X' : '') + coord);

    if (opt_cache && cacheString in opt_cache) {
      coord = opt_cache[cacheString];
    } else {
      if (goog.graphics.ext.coordinates.isSpecial(
          /** @type {string} */ (coord))) {
        coord = goog.graphics.ext.coordinates.computeValue(coord,
            containerSize, scale);
      } else {
        // Simple coordinates just need to be converted from a string to a
        // number.
        coord = parseFloat(/** @type {string} */ (coord));
      }

      // Cache the result.
      if (opt_cache) {
        opt_cache[cacheString] = coord;
      }
    }
  }

  return coord;
};
