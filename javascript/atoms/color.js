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
 * @param {string} propertyName Name of the CSS property in camelCase.
 * @param {string} propertyValue The value of the CSS property.
 * @return {string} The value, in a standardized format
 *    if it is a color property.
 */
bot.color.standardizeColor = function (propertyName, propertyValue) {
  if (!goog.array.contains(bot.color.COLOR_PROPERTIES_, propertyName)) {
    return propertyValue;
  }
  var rgba =
    bot.color.maybeParseRgbaColor_(propertyValue) ||
    bot.color.maybeParseRgbColor_(propertyValue) ||
    bot.color.maybeConvertHexOrColorName_(propertyValue);
  return rgba ? 'rgba(' + rgba.join(', ') + ')' : propertyValue;
};


/**
 * Used to determine whether a css property contains a color and
 * should therefore be standardized to rgba.
 * These are  extracted from the W3C CSS spec:
 *
 * http://www.w3.org/TR/CSS/#properties
 *
 * @const
 * @private {!Array.<string>}
 */
bot.color.COLOR_PROPERTIES_ = [
  'backgroundColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'color',
  'outlineColor'
];


/**
 * Regular expression for extracting the digits in a hex color triplet.
 * @private {!RegExp}
 * @const
 */
bot.color.HEX_TRIPLET_RE_ = /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/;


/**
 * Converts a hex representation of a color to RGB.
 * @param {string} hexOrColorName Color to convert.
 * @return {?Array} array containing [r, g, b, 1] as ints in [0, 255] or null
 *     for invalid colors.
 * @private
 */
bot.color.maybeConvertHexOrColorName_ = function (hexOrColorName) {
  hexOrColorName = hexOrColorName.toLowerCase();
  var hex = goog.color.names[hexOrColorName.toLowerCase()];
  if (!hex) {
    hex = hexOrColorName.charAt(0) == '#' ?
      hexOrColorName : '#' + hexOrColorName;
    if (hex.length == 4) { // of the form #RGB
      hex = hex.replace(bot.color.HEX_TRIPLET_RE_, '#$1$1$2$2$3$3');
    }

    if (!bot.color.VALID_HEX_COLOR_RE_.test(hex)) {
      return null;
    }
  }

  var r = parseInt(hex.substr(1, 2), 16);
  var g = parseInt(hex.substr(3, 2), 16);
  var b = parseInt(hex.substr(5, 2), 16);

  return [r, g, b, 1];
};


/**
 * Helper for isValidHexColor_.
 * @private {!RegExp}
 * @const
 */
bot.color.VALID_HEX_COLOR_RE_ = /^#(?:[0-9a-f]{3}){1,2}$/i;


/**
 * Regular expression for matching and capturing RGBA style strings.
 * @private {!RegExp}
 * @const
 */
bot.color.RGBA_COLOR_RE_ =
  /^(?:rgba)?\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3}),\s?(0|1|0\.\d*)\)$/i;


/**
 * Attempts to parse a string as an rgba color.  We expect strings of the
 * format '(r, g, b, a)', or 'rgba(r, g, b, a)', where r, g, b are ints in
 * [0, 255] and a is a float in [0, 1].
 * @param {string} str String to check.
 * @return {?Array.<number>} the integers [r, g, b, a] for valid colors or null
 *     for invalid colors.
 * @private
 */
bot.color.maybeParseRgbaColor_ = function (str) {
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
  return null;
};


/**
 * Regular expression for matching and capturing RGB style strings.
 * @private {!RegExp}
 * @const
 */
bot.color.RGB_COLOR_RE_ =
  /^(?:rgb)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\)$/i;


/**
 * Attempts to parse a string as an rgb color.  We expect strings of the format
 * '(r, g, b)', or 'rgb(r, g, b)', where each color component is an int in
 * [0, 255].
 * @param {string} str String to check.
 * @return {?Array.<number>} the integers [r, g, b, 1] for valid colors or null
 *     for invalid colors.
 * @private
 */
bot.color.maybeParseRgbColor_ = function (str) {
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
      return [r, g, b, 1];
    }
  }
  return null;
};
