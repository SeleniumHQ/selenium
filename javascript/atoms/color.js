// Copyright 2012 Software Freedom Conservancy
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
 * @fileoverview Utilities related to color and color conversion.
 * Some of this code is borrowed and modified from goog.color and
 * goog.color.alpha.
 */

goog.provide('bot.color');

goog.require('goog.array');
goog.require('goog.color.names');


/**
 * Returns a property, with a standardized color if it contains a
 * convertible color.
 * @param {string} propertyName Name of the CSS property in selector-case.
 * @param {string} propertyValue The value of the CSS property.
 * @return {string} The value, in a standardized format
 *    if it is a color property.
 */
bot.color.standardizeColor = function(propertyName, propertyValue) {
  if (bot.color.isColorProperty(propertyName) &&
      bot.color.isConvertibleColor(propertyValue)) {
    return bot.color.standardizeToRgba_(propertyValue);
  }
  return propertyValue;
};


/**
 * Returns a color in RGBA format - rgba(r, g, b, a).
 * @param {string} propertyValue The value of the CSS property.
 * @return {string} The value, in RGBA format.
 * @private
 */
bot.color.standardizeToRgba_ = function(propertyValue) {
  var rgba = bot.color.parseRgbaColor(propertyValue);
  if (!rgba.length) {
    rgba = bot.color.convertToRgba_(propertyValue);
    bot.color.addAlphaIfNecessary_(rgba);
  }
  if (rgba.length != 4) {
    return propertyValue;
  }
  return bot.color.toRgbaStyle_(rgba);
};


/**
 * Coverts a color to RGBA.
 * @param {string} propertyValue The value of the CSS property.
 * @return {!Array.<number>} array containing [r, g, b, a]
 *  with r, g, b as ints in [0, 255] and a as a float in [0, 1].
 * @private
 */
bot.color.convertToRgba_ = function(propertyValue) {
  var rgba = bot.color.parseRgbColor_(propertyValue);
  if (rgba.length) {
    return rgba;
  }
  var hex = goog.color.names[propertyValue.toLowerCase()];
  hex = (!hex) ? bot.color.prependHashIfNecessary_(propertyValue) : hex;
  if (bot.color.isValidHexColor_(hex)) {
    rgba = bot.color.hexToRgb(bot.color.normalizeHex(hex));
    if (rgba.length) {
      return rgba;
    }
  }
  return [];
};


/**
 * Determines if the given string is a color that can be converted to RGBA.
 * Browsers can return colors in the following formats:
 * RGB, RGBA, Hex, NamedColor
 * So only those are supported by this module and therefore considered
 * convertible.
 *
 * @param {string} str Potential color string.
 * @return {boolean} True if str is in a format that can be converted to RGBA.
 */
bot.color.isConvertibleColor = function(str) {
  return !!(bot.color.isValidHexColor_(
      bot.color.prependHashIfNecessary_(str)) ||
      bot.color.parseRgbColor_(str).length ||
      goog.color.names && goog.color.names[str.toLowerCase()] ||
      bot.color.parseRgbaColor(str).length
  );
};


/**
 * Used to determine whether a css property contains a color and
 * should therefore be standardized to rgba.
 * These are  extracted from the W3C CSS spec:
 *
 * http://www.w3.org/TR/CSS/#properties
 *
 * Used by bot.color.isColorProperty()
 * @const
 * @private
 */
bot.color.COLOR_PROPERTIES_ = [
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'color',
  'outline-color'
];


/**
 * Determines if the given property can contain a color.
 * @param {string} str CSS property name.
 * @return {boolean} True if str is a property that can contain a color.
 */
bot.color.isColorProperty = function(str) {
  return goog.array.contains(bot.color.COLOR_PROPERTIES_, str);
};


/**
 * Regular expression for extracting the digits in a hex color triplet.
 * @type {!RegExp}
 * @private
 * @const
 */
bot.color.HEX_TRIPLET_RE_ = /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/;


/**
 * Normalize an hex representation of a color
 * @param {string} hexColor an hex color string.
 * @return {string} hex color in the format '#rrggbb' with all lowercase
 *     literals.
 */
bot.color.normalizeHex = function(hexColor) {
  if (!bot.color.isValidHexColor_(hexColor)) {
    throw Error("'" + hexColor + "' is not a valid hex color");
  }
  if (hexColor.length == 4) { // of the form #RGB
    hexColor = hexColor.replace(bot.color.HEX_TRIPLET_RE_, '#$1$1$2$2$3$3');
  }
  return hexColor.toLowerCase();
};


/**
 * Converts a hex representation of a color to RGB.
 * @param {string} hexColor Color to convert.
 * @return {!Array} array containing [r, g, b] as ints in [0, 255].
 */
bot.color.hexToRgb = function(hexColor) {
  hexColor = bot.color.normalizeHex(hexColor);
  var r = parseInt(hexColor.substr(1, 2), 16);
  var g = parseInt(hexColor.substr(3, 2), 16);
  var b = parseInt(hexColor.substr(5, 2), 16);

  return [r, g, b];
};


/**
 * Helper for isValidHexColor_.
 * @type {!RegExp}
 * @private
 * @const
 */
bot.color.VALID_HEX_COLOR_RE_ = /^#(?:[0-9a-f]{3}){1,2}$/i;


/**
 * Checks if a string is a valid hex color.  We expect strings of the format
 * #RRGGBB (ex: #1b3d5f) or #RGB (ex: #3CA == #33CCAA).
 * @param {string} str String to check.
 * @return {boolean} Whether the string is a valid hex color.
 * @private
 */
bot.color.isValidHexColor_ = function(str) {
  return bot.color.VALID_HEX_COLOR_RE_.test(str);
};


/**
 * Helper for isNormalizedHexColor_.
 * @type {!RegExp}
 * @private
 * @const
 */
bot.color.NORMALIZED_HEX_COLOR_RE_ = /^#[0-9a-f]{6}$/;


/**
 * Checks if a string is a normalized hex color.
 * We expect strings of the format #RRGGBB (ex: #1b3d5f)
 * using only lowercase letters.
 * @param {string} str String to check.
 * @return {boolean} Whether the string is a normalized hex color.
 * @private
 */
bot.color.isNormalizedHexColor_ = function(str) {
  return bot.color.NORMALIZED_HEX_COLOR_RE_.test(str);
};


/**
 * Regular expression for matching and capturing RGBA style strings.
 * Helper for parseRgbaColor.
 * @type {!RegExp}
 * @private
 * @const
 */
bot.color.RGBA_COLOR_RE_ =
    /^(?:rgba)?\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3}),\s?(0|1|0\.\d*)\)$/i;


/**
 * Attempts to parse a string as an rgba color.  We expect strings of the
 * format '(r, g, b, a)', or 'rgba(r, g, b, a)', where r, g, b are ints in
 * [0, 255] and a is a float in [0, 1].
 * @param {string} str String to check.
 * @return {!Array.<number>} the integers [r, g, b, a] for valid colors or the
 *     empty array for invalid colors.
 */
bot.color.parseRgbaColor = function(str) {
  // Each component is separate (rather than using a repeater) so we can
  // capture the match. Also, we explicitly set each component to be either 0,
  // or start with a non-zero, to prevent octal numbers from slipping through.
  var regExpResultArray = str.match(bot.color.RGBA_COLOR_RE_);
  if (regExpResultArray) {
    var r = Number(regExpResultArray[1]);
    var g = Number(regExpResultArray[2]);
    var b = Number(regExpResultArray[3]);
    var a = Number(regExpResultArray[4]);
    if (r >= 0 && r <= 255 &&
        g >= 0 && g <= 255 &&
        b >= 0 && b <= 255 &&
        a >= 0 && a <= 1) {
      return [r, g, b, a];
    }
  }
  return [];
};


/**
 * Regular expression for matching and capturing RGB style strings. Helper for
 * parseRgbColor_.
 * @type {!RegExp}
 * @private
 * @const
 */
bot.color.RGB_COLOR_RE_ =
    /^(?:rgb)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\)$/i;


/**
 * Attempts to parse a string as an rgb color.  We expect strings of the format
 * '(r, g, b)', or 'rgb(r, g, b)', where each color component is an int in
 * [0, 255].
 * @param {string} str String to check.
 * @return {!Array.<number>} the integers [r, g, b] for valid colors or the
 *     empty array for invalid colors.
 * @private
 */
bot.color.parseRgbColor_ = function(str) {
  // Each component is separate (rather than using a repeater) so we can
  // capture the match. Also, we explicitly set each component to be either 0,
  // or start with a non-zero, to prevent octal numbers from slipping through.
  var regExpResultArray = str.match(bot.color.RGB_COLOR_RE_);
  if (regExpResultArray) {
    var r = Number(regExpResultArray[1]);
    var g = Number(regExpResultArray[2]);
    var b = Number(regExpResultArray[3]);
    if (r >= 0 && r <= 255 &&
        g >= 0 && g <= 255 &&
        b >= 0 && b <= 255) {
      return [r, g, b];
    }
  }
  return [];
};


/**
 * Takes a string a prepends a '#' sign if one doesn't exist.
 * Small helper method for use by bot.color and friends.
 * @param {string} str String to check.
 * @return {string} The value passed in, prepended with a '#' if it didn't
 *     already have one.
 * @private
 */
bot.color.prependHashIfNecessary_ = function(str) {
  return str.charAt(0) == '#' ? str : '#' + str;
};


/**
 * Takes an array and appends a 1 to it if the array only contains 3 elements.
 * @param {!Array.<number>} arr The array to check.
 * @return {!Array.<number>} The same array with a 1 appended
 *  if it only contained 3 elements.
 * @private
 */
bot.color.addAlphaIfNecessary_ = function(arr) {
  if (arr.length == 3) {
    arr.push(1);
  }
  return arr;
};


/**
 * Takes an array of [r, g, b, a] and converts it into a string appropriate for
 * CSS styles.
 * @param {!Array.<number>} rgba An array with four elements.
 * @return {string} string of the form 'rgba(r, g, b, a)'.
 * @private
 */
bot.color.toRgbaStyle_ = function(rgba) {
  return 'rgba(' + rgba.join(', ') + ')';
};

