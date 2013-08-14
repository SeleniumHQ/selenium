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
 * @fileoverview Collection of unitility functions for Unicode character.
 *
 */

goog.provide('goog.i18n.uChar');


/**
 * Map used for looking up the char data.  Will be created lazily.
 * @type {Object}
 * @private
 */
goog.i18n.uChar.charData_ = null;


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
  var chCodeStr = 'U+' + goog.i18n.uChar.padString_(
      chCode.toString(16).toUpperCase(), 4, '0');

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
    var leadCodePoint = leadBits + (goog.i18n.uChar.LEAD_SURROGATE_MIN_VALUE_ -
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
 * @param {!string} string The string.
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
      return /** @type {number} */ (goog.i18n.uChar.
          buildSupplementaryCodePoint(charCode, trail));
    }
  } else if (goog.i18n.uChar.isTrailSurrogateCodePoint(charCode) &&
      index > 0) {
    var lead = string.charCodeAt(index - 1);
    if (goog.i18n.uChar.isLeadSurrogateCodePoint(lead)) {
      // Part of a surrogate pair.
      return /** @type {number} */ (-goog.i18n.uChar.
          buildSupplementaryCodePoint(lead, charCode));
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
    var shiftedLeadOffset = (lead <<
        goog.i18n.uChar.TRAIL_SURROGATE_BIT_COUNT_) -
        (goog.i18n.uChar.LEAD_SURROGATE_MIN_VALUE_ <<
        goog.i18n.uChar.TRAIL_SURROGATE_BIT_COUNT_);
    var trailOffset = trail - goog.i18n.uChar.TRAIL_SURROGATE_MIN_VALUE_ +
        goog.i18n.uChar.SUPPLEMENTARY_CODE_POINT_MIN_VALUE_;
    return shiftedLeadOffset + trailOffset;
  }
  return null;
};


/**
 * Gets the name of a character, if available, returns null otherwise.
 * @param {string} ch The character.
 * @return {?string} The name of the character.
 */
goog.i18n.uChar.toName = function(ch) {
  if (!goog.i18n.uChar.charData_) {
    goog.i18n.uChar.createCharData();
  }

  var names = goog.i18n.uChar.charData_;
  var chCode = goog.i18n.uChar.toCharCode(ch);
  var chCodeStr = chCode + '';

  if (ch in names) {
    return names[ch];
  } else if (chCodeStr in names) {
    return names[chCode];
  } else if (0xFE00 <= chCode && chCode <= 0xFE0F ||
      0xE0100 <= chCode && chCode <= 0xE01EF) {
    var seqnum;
    if (0xFE00 <= chCode && chCode <= 0xFE0F) {
      // Variation selectors from 1 to 16.
      seqnum = chCode - 0xFDFF;
    } else {
      // Variation selectors from 17 to 256.
      seqnum = chCode - 0xE00EF;
    }

    /** @desc Variation selector with the sequence number. */
    var MSG_VARIATION_SELECTOR_SEQNUM =
        goog.getMsg('Variation Selector - {$seqnum}', {'seqnum': seqnum});
    return MSG_VARIATION_SELECTOR_SEQNUM;
  }
  return null;
};


/**
 * Following lines are programatically created.
 * Details: https://sites/cibu/character-picker.
 **/


/**
 * Sets up the character map, lazily.  Some characters are indexed by their
 * decimal value.
 * @protected
 */
goog.i18n.uChar.createCharData = function() {


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_ARABIC_SIGN_SANAH = goog.getMsg('Arabic Sign Sanah');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_CANADIAN_SYLLABICS_HYPHEN =
      goog.getMsg('Canadian Syllabics Hyphen');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_ARABIC_SIGN_SAFHA = goog.getMsg('Arabic Sign Safha');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_ARABIC_FOOTNOTE_MARKER = goog.getMsg('Arabic Footnote Marker');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_FOUR_PER_EM_SPACE = goog.getMsg('Four-per-em Space');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_THREE_PER_EM_SPACE = goog.getMsg('Three-per-em Space');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_FIGURE_SPACE = goog.getMsg('Figure Space');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_MONGOLIAN_SOFT_HYPHEN = goog.getMsg('Mongolian Soft Hyphen');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_THIN_SPACE = goog.getMsg('Thin Space');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_SOFT_HYPHEN = goog.getMsg('Soft Hyphen');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_ZERO_WIDTH_SPACE = goog.getMsg('Zero Width Space');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_ARMENIAN_HYPHEN = goog.getMsg('Armenian Hyphen');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_ZERO_WIDTH_JOINER = goog.getMsg('Zero Width Joiner');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_EM_SPACE = goog.getMsg('Em Space');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_SYRIAC_ABBREVIATION_MARK = goog.getMsg('Syriac Abbreviation Mark');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_MONGOLIAN_VOWEL_SEPARATOR =
      goog.getMsg('Mongolian Vowel Separator');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_NON_BREAKING_HYPHEN = goog.getMsg('Non-breaking Hyphen');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_HYPHEN = goog.getMsg('Hyphen');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_EM_QUAD = goog.getMsg('Em Quad');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_EN_SPACE = goog.getMsg('En Space');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_HORIZONTAL_BAR = goog.getMsg('Horizontal Bar');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_EM_DASH = goog.getMsg('Em Dash');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_DOUBLE_OBLIQUE_HYPHEN = goog.getMsg('Double Oblique Hyphen');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_MUSICAL_SYMBOL_END_PHRASE =
      goog.getMsg('Musical Symbol End Phrase');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_MEDIUM_MATHEMATICAL_SPACE =
      goog.getMsg('Medium Mathematical Space');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_WAVE_DASH = goog.getMsg('Wave Dash');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_SPACE = goog.getMsg('Space');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_HYPHEN_WITH_DIAERESIS = goog.getMsg('Hyphen With Diaeresis');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_EN_QUAD = goog.getMsg('En Quad');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_RIGHT_TO_LEFT_EMBEDDING = goog.getMsg('Right-to-left Embedding');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_SIX_PER_EM_SPACE = goog.getMsg('Six-per-em Space');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_HYPHEN_MINUS = goog.getMsg('Hyphen-minus');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_POP_DIRECTIONAL_FORMATTING =
      goog.getMsg('Pop Directional Formatting');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_NARROW_NO_BREAK_SPACE = goog.getMsg('Narrow No-break Space');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_RIGHT_TO_LEFT_OVERRIDE = goog.getMsg('Right-to-left Override');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_PRESENTATION_FORM_FOR_VERTICAL_EM_DASH =
      goog.getMsg('Presentation Form For Vertical Em Dash');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_WAVY_DASH = goog.getMsg('Wavy Dash');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_PRESENTATION_FORM_FOR_VERTICAL_EN_DASH =
      goog.getMsg('Presentation Form For Vertical En Dash');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_KHMER_VOWEL_INHERENT_AA = goog.getMsg('Khmer Vowel Inherent Aa');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_KHMER_VOWEL_INHERENT_AQ = goog.getMsg('Khmer Vowel Inherent Aq');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_PUNCTUATION_SPACE = goog.getMsg('Punctuation Space');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_HALFWIDTH_HANGUL_FILLER = goog.getMsg('Halfwidth Hangul Filler');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_KAITHI_NUMBER_SIGN = goog.getMsg('Kaithi Number Sign');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_LEFT_TO_RIGHT_EMBEDDING = goog.getMsg('Left-to-right Embedding');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_HEBREW_PUNCTUATION_MAQAF = goog.getMsg('Hebrew Punctuation Maqaf');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_IDEOGRAPHIC_SPACE = goog.getMsg('Ideographic Space');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_HAIR_SPACE = goog.getMsg('Hair Space');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_NO_BREAK_SPACE = goog.getMsg('No-break Space');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_FULLWIDTH_HYPHEN_MINUS = goog.getMsg('Fullwidth Hyphen-minus');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_PARAGRAPH_SEPARATOR = goog.getMsg('Paragraph Separator');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_LEFT_TO_RIGHT_OVERRIDE = goog.getMsg('Left-to-right Override');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_SMALL_HYPHEN_MINUS = goog.getMsg('Small Hyphen-minus');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_COMBINING_GRAPHEME_JOINER =
      goog.getMsg('Combining Grapheme Joiner');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_ZERO_WIDTH_NON_JOINER = goog.getMsg('Zero Width Non-joiner');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_MUSICAL_SYMBOL_BEGIN_PHRASE =
      goog.getMsg('Musical Symbol Begin Phrase');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_ARABIC_NUMBER_SIGN = goog.getMsg('Arabic Number Sign');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_RIGHT_TO_LEFT_MARK = goog.getMsg('Right-to-left Mark');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_OGHAM_SPACE_MARK = goog.getMsg('Ogham Space Mark');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_SMALL_EM_DASH = goog.getMsg('Small Em Dash');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_LEFT_TO_RIGHT_MARK = goog.getMsg('Left-to-right Mark');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_ARABIC_END_OF_AYAH = goog.getMsg('Arabic End Of Ayah');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_HANGUL_CHOSEONG_FILLER = goog.getMsg('Hangul Choseong Filler');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_HANGUL_FILLER = goog.getMsg('Hangul Filler');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_FUNCTION_APPLICATION = goog.getMsg('Function Application');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_HANGUL_JUNGSEONG_FILLER = goog.getMsg('Hangul Jungseong Filler');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_INVISIBLE_SEPARATOR = goog.getMsg('Invisible Separator');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_INVISIBLE_TIMES = goog.getMsg('Invisible Times');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_INVISIBLE_PLUS = goog.getMsg('Invisible Plus');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_WORD_JOINER = goog.getMsg('Word Joiner');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_LINE_SEPARATOR = goog.getMsg('Line Separator');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_KATAKANA_HIRAGANA_DOUBLE_HYPHEN =
      goog.getMsg('Katakana-hiragana Double Hyphen');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_EN_DASH = goog.getMsg('En Dash');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_MUSICAL_SYMBOL_BEGIN_BEAM =
      goog.getMsg('Musical Symbol Begin Beam');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_FIGURE_DASH = goog.getMsg('Figure Dash');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_MUSICAL_SYMBOL_BEGIN_TIE = goog.getMsg('Musical Symbol Begin Tie');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_MUSICAL_SYMBOL_END_BEAM = goog.getMsg('Musical Symbol End Beam');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_MUSICAL_SYMBOL_BEGIN_SLUR =
      goog.getMsg('Musical Symbol Begin Slur');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_MUSICAL_SYMBOL_END_TIE = goog.getMsg('Musical Symbol End Tie');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_INTERLINEAR_ANNOTATION_ANCHOR =
      goog.getMsg('Interlinear Annotation Anchor');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_MUSICAL_SYMBOL_END_SLUR = goog.getMsg('Musical Symbol End Slur');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_INTERLINEAR_ANNOTATION_TERMINATOR =
      goog.getMsg('Interlinear Annotation Terminator');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_INTERLINEAR_ANNOTATION_SEPARATOR =
      goog.getMsg('Interlinear Annotation Separator');


  /**
   * @desc Name for a symbol, character or a letter. Used in a pop-up balloon,
   *   shown to a document editing user trying to insert a special character.
   *   The balloon help would appear while the user hovers over the character
   *   displayed. Newlines are not allowed; translation should be a noun and
   *   as consise as possible. More details:
   *   docs/fileview?id=0B8NbxddKsFtwYjExMGJjNzgtYjkzOS00NjdiLTlmOGQtOGVhZDkyZDU5YjM4.
   */
  var MSG_CP_ZERO_WIDTH_NO_BREAK_SPACE =
      goog.getMsg('Zero Width No-break Space');

  goog.i18n.uChar.charData_ = {
    '\u0601': MSG_CP_ARABIC_SIGN_SANAH,
    '\u1400': MSG_CP_CANADIAN_SYLLABICS_HYPHEN,
    '\u0603': MSG_CP_ARABIC_SIGN_SAFHA,
    '\u0602': MSG_CP_ARABIC_FOOTNOTE_MARKER,
    '\u2005': MSG_CP_FOUR_PER_EM_SPACE,
    '\u2004': MSG_CP_THREE_PER_EM_SPACE,
    '\u2007': MSG_CP_FIGURE_SPACE,
    '\u1806': MSG_CP_MONGOLIAN_SOFT_HYPHEN,
    '\u2009': MSG_CP_THIN_SPACE,
    '\u00AD': MSG_CP_SOFT_HYPHEN,
    '\u200B': MSG_CP_ZERO_WIDTH_SPACE,
    '\u058A': MSG_CP_ARMENIAN_HYPHEN,
    '\u200D': MSG_CP_ZERO_WIDTH_JOINER,
    '\u2003': MSG_CP_EM_SPACE,
    '\u070F': MSG_CP_SYRIAC_ABBREVIATION_MARK,
    '\u180E': MSG_CP_MONGOLIAN_VOWEL_SEPARATOR,
    '\u2011': MSG_CP_NON_BREAKING_HYPHEN,
    '\u2010': MSG_CP_HYPHEN,
    '\u2001': MSG_CP_EM_QUAD,
    '\u2002': MSG_CP_EN_SPACE,
    '\u2015': MSG_CP_HORIZONTAL_BAR,
    '\u2014': MSG_CP_EM_DASH,
    '\u2E17': MSG_CP_DOUBLE_OBLIQUE_HYPHEN,
    '\u1D17A': MSG_CP_MUSICAL_SYMBOL_END_PHRASE,
    '\u205F': MSG_CP_MEDIUM_MATHEMATICAL_SPACE,
    '\u301C': MSG_CP_WAVE_DASH,
    ' ': MSG_CP_SPACE,
    '\u2E1A': MSG_CP_HYPHEN_WITH_DIAERESIS,
    '\u2000': MSG_CP_EN_QUAD,
    '\u202B': MSG_CP_RIGHT_TO_LEFT_EMBEDDING,
    '\u2006': MSG_CP_SIX_PER_EM_SPACE,
    '-': MSG_CP_HYPHEN_MINUS,
    '\u202C': MSG_CP_POP_DIRECTIONAL_FORMATTING,
    '\u202F': MSG_CP_NARROW_NO_BREAK_SPACE,
    '\u202E': MSG_CP_RIGHT_TO_LEFT_OVERRIDE,
    '\uFE31': MSG_CP_PRESENTATION_FORM_FOR_VERTICAL_EM_DASH,
    '\u3030': MSG_CP_WAVY_DASH,
    '\uFE32': MSG_CP_PRESENTATION_FORM_FOR_VERTICAL_EN_DASH,
    '\u17B5': MSG_CP_KHMER_VOWEL_INHERENT_AA,
    '\u17B4': MSG_CP_KHMER_VOWEL_INHERENT_AQ,
    '\u2008': MSG_CP_PUNCTUATION_SPACE,
    '\uFFA0': MSG_CP_HALFWIDTH_HANGUL_FILLER,
    '\u110BD': MSG_CP_KAITHI_NUMBER_SIGN,
    '\u202A': MSG_CP_LEFT_TO_RIGHT_EMBEDDING,
    '\u05BE': MSG_CP_HEBREW_PUNCTUATION_MAQAF,
    '\u3000': MSG_CP_IDEOGRAPHIC_SPACE,
    '\u200A': MSG_CP_HAIR_SPACE,
    '\u00A0': MSG_CP_NO_BREAK_SPACE,
    '\uFF0D': MSG_CP_FULLWIDTH_HYPHEN_MINUS,
    '8233': MSG_CP_PARAGRAPH_SEPARATOR,
    '\u202D': MSG_CP_LEFT_TO_RIGHT_OVERRIDE,
    '\uFE63': MSG_CP_SMALL_HYPHEN_MINUS,
    '\u034F': MSG_CP_COMBINING_GRAPHEME_JOINER,
    '\u200C': MSG_CP_ZERO_WIDTH_NON_JOINER,
    '\u1D179': MSG_CP_MUSICAL_SYMBOL_BEGIN_PHRASE,
    '\u0600': MSG_CP_ARABIC_NUMBER_SIGN,
    '\u200F': MSG_CP_RIGHT_TO_LEFT_MARK,
    '\u1680': MSG_CP_OGHAM_SPACE_MARK,
    '\uFE58': MSG_CP_SMALL_EM_DASH,
    '\u200E': MSG_CP_LEFT_TO_RIGHT_MARK,
    '\u06DD': MSG_CP_ARABIC_END_OF_AYAH,
    '\u115F': MSG_CP_HANGUL_CHOSEONG_FILLER,
    '\u3164': MSG_CP_HANGUL_FILLER,
    '\u2061': MSG_CP_FUNCTION_APPLICATION,
    '\u1160': MSG_CP_HANGUL_JUNGSEONG_FILLER,
    '\u2063': MSG_CP_INVISIBLE_SEPARATOR,
    '\u2062': MSG_CP_INVISIBLE_TIMES,
    '\u2064': MSG_CP_INVISIBLE_PLUS,
    '\u2060': MSG_CP_WORD_JOINER,
    '8232': MSG_CP_LINE_SEPARATOR,
    '\u30A0': MSG_CP_KATAKANA_HIRAGANA_DOUBLE_HYPHEN,
    '\u2013': MSG_CP_EN_DASH,
    '\u1D173': MSG_CP_MUSICAL_SYMBOL_BEGIN_BEAM,
    '\u2012': MSG_CP_FIGURE_DASH,
    '\u1D175': MSG_CP_MUSICAL_SYMBOL_BEGIN_TIE,
    '\u1D174': MSG_CP_MUSICAL_SYMBOL_END_BEAM,
    '\u1D177': MSG_CP_MUSICAL_SYMBOL_BEGIN_SLUR,
    '\u1D176': MSG_CP_MUSICAL_SYMBOL_END_TIE,
    '\uFFF9': MSG_CP_INTERLINEAR_ANNOTATION_ANCHOR,
    '\u1D178': MSG_CP_MUSICAL_SYMBOL_END_SLUR,
    '\uFFFB': MSG_CP_INTERLINEAR_ANNOTATION_TERMINATOR,
    '\uFFFA': MSG_CP_INTERLINEAR_ANNOTATION_SEPARATOR,
    '\uFEFF': MSG_CP_ZERO_WIDTH_NO_BREAK_SPACE
  };
};
