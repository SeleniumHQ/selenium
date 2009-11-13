// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2009 Google Inc. All Rights Reserved.

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
 * @param {string} ch The given character.
 * @return {number} The Unicode value of the character.
 */
goog.i18n.uChar.toCharCode = function(ch) {
  var chCode = ch.charCodeAt(0);
  if (chCode >= 0xD800 && chCode <= 0xDBFF) {
    var chCode2 = ch.charCodeAt(1);
    chCode = (chCode - 0xD800) * 0x400 + chCode2 - 0xDC00 + 0x10000;
  }

  return chCode;
};


/**
 * Gets a character from the given Unicode value.
 * @param {number} code The Unicode value of the character.
 * @return {?string} The character from Unicode value.
 */
goog.i18n.uChar.fromCharCode = function(code) {
  if (!code || code > 0x10FFFF) {
    return null;
  } else if (code >= 0x10000) {
    var hi = Math.floor((code - 0x10000) / 0x400) + 0xD800;
    var lo = (code - 0x10000) % 0x400 + 0xDC00;
    return String.fromCharCode(hi) + String.fromCharCode(lo);
  } else {
    return String.fromCharCode(code);
  }
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
  var MSG_CP_EN_QUAD = goog.getMsg('En Quad');


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
  var MSG_CP_IDEOGRAPHIC_SPACE = goog.getMsg('Ideographic Space');


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
    '\u2000': MSG_CP_EN_QUAD,
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
    '\u3000': MSG_CP_IDEOGRAPHIC_SPACE,
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
    '\u202A': MSG_CP_LEFT_TO_RIGHT_EMBEDDING,
    '\u05BE': MSG_CP_HEBREW_PUNCTUATION_MAQAF,
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
