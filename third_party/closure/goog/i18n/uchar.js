// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Collection of utility functions for Unicode character.
 *
 */

goog.provide('goog.i18n.uChar');


// Constants for handling Unicode supplementary characters (surrogate pairs).


/**
 * The minimum value for Supplementary code points.
 * @type {number}
 * @private
 */
goog.i18n.uChar.SUPPLEMENTARY_CODE_POINT_MIN_VALUE_ = 0x10000;


/**
 * The highest Unicode code point value (scalar value) according to the Unicode
 * Standard.
 * @type {number}
 * @private
 */
goog.i18n.uChar.CODE_POINT_MAX_VALUE_ = 0x10FFFF;


/**
 * Lead surrogate minimum value.
 * @type {number}
 * @private
 */
goog.i18n.uChar.LEAD_SURROGATE_MIN_VALUE_ = 0xD800;


/**
 * Lead surrogate maximum value.
 * @type {number}
 * @private
 */
goog.i18n.uChar.LEAD_SURROGATE_MAX_VALUE_ = 0xDBFF;


/**
 * Trail surrogate minimum value.
 * @type {number}
 * @private
 */
goog.i18n.uChar.TRAIL_SURROGATE_MIN_VALUE_ = 0xDC00;


/**
 * Trail surrogate maximum value.
 * @type {number}
 * @private
 */
goog.i18n.uChar.TRAIL_SURROGATE_MAX_VALUE_ = 0xDFFF;


/**
 * The number of least significant bits of a supplementary code point that in
 * UTF-16 become the least significant bits of the trail surrogate. The rest of
 * the in-use bits of the supplementary code point become the least significant
 * bits of the lead surrogate.
 * @type {number}
 * @private
 */
goog.i18n.uChar.TRAIL_SURROGATE_BIT_COUNT_ = 10;


/**
 * Gets the U+ notation string of a Unicode character. Ex: 'U+0041' for 'A'.
 * @param {string} ch The given character.
 * @return {string} The U+ notation of the given character.
 */
goog.i18n.uChar.toHexString = function(ch) {
  var chCode = goog.i18n.uChar.toCharCode(ch);
  var chCodeStr = 'U+' +
      goog.i18n.uChar.padString_(chCode.toString(16).toUpperCase(), 4, '0');

  return chCodeStr;
};


/**
 * Gets a string padded with given character to get given size.
 * @param {string} str The given string to be padded.
 * @param {number} length The target size of the string.
 * @param {string} ch The character to be padded with.
 * @return {string} The padded string.
 * @private
 */
goog.i18n.uChar.padString_ = function(str, length, ch) {
  while (str.length < length) {
    str = ch + str;
  }
  return str;
};


/**
 * Gets Unicode value of the given character.
 * @param {string} ch The given character, which in the case of a supplementary
 * character is actually a surrogate pair. The remainder of the string is
 * ignored.
 * @return {number} The Unicode value of the character.
 */
goog.i18n.uChar.toCharCode = function(ch) {
  return goog.i18n.uChar.getCodePointAround(ch, 0);
};


/**
 * Gets a character from the given Unicode value. If the given code point is not
 * a valid Unicode code point, null is returned.
 * @param {number} code The Unicode value of the character.
 * @return {?string} The character corresponding to the given Unicode value.
 */
goog.i18n.uChar.fromCharCode = function(code) {
  if (!goog.isDefAndNotNull(code) ||
      !(code >= 0 && code <= goog.i18n.uChar.CODE_POINT_MAX_VALUE_)) {
    return null;
  }
  if (goog.i18n.uChar.isSupplementaryCodePoint(code)) {
    // First, we split the code point into the trail surrogate part (the
    // TRAIL_SURROGATE_BIT_COUNT_ least significant bits) and the lead surrogate
    // part (the rest of the bits, shifted down; note that for now this includes
    // the supplementary offset, also shifted down, to be subtracted off below).
    var leadBits = code >> goog.i18n.uChar.TRAIL_SURROGATE_BIT_COUNT_;
    var trailBits = code &
        // A bit-mask to get the TRAIL_SURROGATE_BIT_COUNT_ (i.e. 10) least
        // significant bits. 1 << 10 = 0x0400. 0x0400 - 1 = 0x03FF.
        ((1 << goog.i18n.uChar.TRAIL_SURROGATE_BIT_COUNT_) - 1);

    // Now we calculate the code point of each surrogate by adding each offset
    // to the corresponding base code point.
    var leadCodePoint = leadBits +
        (goog.i18n.uChar.LEAD_SURROGATE_MIN_VALUE_ -
         // Subtract off the supplementary offset, which had been shifted down
         // with the rest of leadBits. We do this here instead of before the
         // shift in order to save a separate subtraction step.
         (goog.i18n.uChar.SUPPLEMENTARY_CODE_POINT_MIN_VALUE_ >>
          goog.i18n.uChar.TRAIL_SURROGATE_BIT_COUNT_));
    var trailCodePoint = trailBits + goog.i18n.uChar.TRAIL_SURROGATE_MIN_VALUE_;

    // Convert the code points into a 2-character long string.
    return String.fromCharCode(leadCodePoint) +
        String.fromCharCode(trailCodePoint);
  }
  return String.fromCharCode(code);
};


/**
 * Returns the Unicode code point at the specified index.
 *
 * If the char value specified at the given index is in the leading-surrogate
 * range, and the following index is less than the length of {@code string}, and
 * the char value at the following index is in the trailing-surrogate range,
 * then the supplementary code point corresponding to this surrogate pair is
 * returned.
 *
 * If the char value specified at the given index is in the trailing-surrogate
 * range, and the preceding index is not before the start of {@code string}, and
 * the char value at the preceding index is in the leading-surrogate range, then
 * the negated supplementary code point corresponding to this surrogate pair is
 * returned.
 *
 * The negation allows the caller to differentiate between the case where the
 * given index is at the leading surrogate and the one where it is at the
 * trailing surrogate, and thus deduce where the next character starts and
 * preceding character ends.
 *
 * Otherwise, the char value at the given index is returned. Thus, a leading
 * surrogate is returned when it is not followed by a trailing surrogate, and a
 * trailing surrogate is returned when it is not preceded by a leading
 * surrogate.
 *
 * @param {string} string The string.
 * @param {number} index The index from which the code point is to be retrieved.
 * @return {number} The code point at the given index. If the given index is
 * that of the start (i.e. lead surrogate) of a surrogate pair, returns the code
 * point encoded by the pair. If the given index is that of the end (i.e. trail
 * surrogate) of a surrogate pair, returns the negated code pointed encoded by
 * the pair.
 */
goog.i18n.uChar.getCodePointAround = function(string, index) {
  var charCode = string.charCodeAt(index);
  if (goog.i18n.uChar.isLeadSurrogateCodePoint(charCode) &&
      index + 1 < string.length) {
    var trail = string.charCodeAt(index + 1);
    if (goog.i18n.uChar.isTrailSurrogateCodePoint(trail)) {
      // Part of a surrogate pair.
      return /** @type {number} */ (
          goog.i18n.uChar.buildSupplementaryCodePoint(charCode, trail));
    }
  } else if (goog.i18n.uChar.isTrailSurrogateCodePoint(charCode) && index > 0) {
    var lead = string.charCodeAt(index - 1);
    if (goog.i18n.uChar.isLeadSurrogateCodePoint(lead)) {
      // Part of a surrogate pair.
      return /** @type {number} */ (
          -goog.i18n.uChar.buildSupplementaryCodePoint(lead, charCode));
    }
  }
  return charCode;
};


/**
 * Determines the length of the string needed to represent the specified
 * Unicode code point.
 * @param {number} codePoint
 * @return {number} 2 if codePoint is a supplementary character, 1 otherwise.
 */
goog.i18n.uChar.charCount = function(codePoint) {
  return goog.i18n.uChar.isSupplementaryCodePoint(codePoint) ? 2 : 1;
};


/**
 * Determines whether the specified Unicode code point is in the supplementary
 * Unicode characters range.
 * @param {number} codePoint
 * @return {boolean} Whether then given code point is a supplementary character.
 */
goog.i18n.uChar.isSupplementaryCodePoint = function(codePoint) {
  return codePoint >= goog.i18n.uChar.SUPPLEMENTARY_CODE_POINT_MIN_VALUE_ &&
      codePoint <= goog.i18n.uChar.CODE_POINT_MAX_VALUE_;
};


/**
 * Gets whether the given code point is a leading surrogate character.
 * @param {number} codePoint
 * @return {boolean} Whether the given code point is a leading surrogate
 * character.
 */
goog.i18n.uChar.isLeadSurrogateCodePoint = function(codePoint) {
  return codePoint >= goog.i18n.uChar.LEAD_SURROGATE_MIN_VALUE_ &&
      codePoint <= goog.i18n.uChar.LEAD_SURROGATE_MAX_VALUE_;
};


/**
 * Gets whether the given code point is a trailing surrogate character.
 * @param {number} codePoint
 * @return {boolean} Whether the given code point is a trailing surrogate
 * character.
 */
goog.i18n.uChar.isTrailSurrogateCodePoint = function(codePoint) {
  return codePoint >= goog.i18n.uChar.TRAIL_SURROGATE_MIN_VALUE_ &&
      codePoint <= goog.i18n.uChar.TRAIL_SURROGATE_MAX_VALUE_;
};


/**
 * Composes a supplementary Unicode code point from the given UTF-16 surrogate
 * pair. If leadSurrogate isn't a leading surrogate code point or trailSurrogate
 * isn't a trailing surrogate code point, null is returned.
 * @param {number} lead The leading surrogate code point.
 * @param {number} trail The trailing surrogate code point.
 * @return {?number} The supplementary Unicode code point obtained by decoding
 * the given UTF-16 surrogate pair.
 */
goog.i18n.uChar.buildSupplementaryCodePoint = function(lead, trail) {
  if (goog.i18n.uChar.isLeadSurrogateCodePoint(lead) &&
      goog.i18n.uChar.isTrailSurrogateCodePoint(trail)) {
    var shiftedLeadOffset =
        (lead << goog.i18n.uChar.TRAIL_SURROGATE_BIT_COUNT_) -
        (goog.i18n.uChar.LEAD_SURROGATE_MIN_VALUE_
         << goog.i18n.uChar.TRAIL_SURROGATE_BIT_COUNT_);
    var trailOffset = trail - goog.i18n.uChar.TRAIL_SURROGATE_MIN_VALUE_ +
        goog.i18n.uChar.SUPPLEMENTARY_CODE_POINT_MIN_VALUE_;
    return shiftedLeadOffset + trailOffset;
  }
  return null;
};
