// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Detect Grapheme Cluster Break in a pair of codepoints. Follows
 * Unicode 10 UAX#29. Tailoring for Virama × Indic Letters is used.
 *
 * Reference: http://unicode.org/reports/tr29
 */

goog.provide('goog.i18n.GraphemeBreak');

goog.require('goog.asserts');
goog.require('goog.i18n.uChar');
goog.require('goog.structs.InversionMap');

/**
 * Enum for all Grapheme Cluster Break properties.
 * These enums directly corresponds to Grapheme_Cluster_Break property values
 * mentioned in http://unicode.org/reports/tr29 table 2. VIRAMA and
 * INDIC_LETTER are for the Virama × Base tailoring mentioned in the notes.
 *
 * @protected @enum {number}
 */
goog.i18n.GraphemeBreak.property = {
  OTHER: 0,
  CONTROL: 1,
  EXTEND: 2,
  PREPEND: 3,
  SPACING_MARK: 4,
  INDIC_LETTER: 5,
  VIRAMA: 6,
  L: 7,
  V: 8,
  T: 9,
  LV: 10,
  LVT: 11,
  CR: 12,
  LF: 13,
  REGIONAL_INDICATOR: 14,
  ZWJ: 15,
  E_BASE: 16,
  GLUE_AFTER_ZWJ: 17,
  E_MODIFIER: 18,
  E_BASE_GAZ: 19
};


/**
 * Grapheme Cluster Break property values for all codepoints as inversion map.
 * Constructed lazily.
 *
 * @private {?goog.structs.InversionMap}
 */
goog.i18n.GraphemeBreak.inversions_ = null;


/**
 * Indicates if a and b form a grapheme cluster.
 *
 * This implements the rules in:
 * http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundary_Rules
 *
 * @param {number|string} a Code point or string with the first side of
 *     grapheme cluster.
 * @param {number|string} b Code point or string with the second side of
 *     grapheme cluster.
 * @param {boolean} extended If true, indicates extended grapheme cluster;
 *     If false, indicates legacy cluster.
 * @return {boolean} True if a & b do not form a cluster; False otherwise.
 * @private
 */
goog.i18n.GraphemeBreak.applyBreakRules_ = function(a, b, extended) {
  var prop = goog.i18n.GraphemeBreak.property;

  var aCode = (typeof a === 'string') ?
      goog.i18n.GraphemeBreak.getCodePoint_(a, a.length - 1) :
      a;
  var bCode =
      (typeof b === 'string') ? goog.i18n.GraphemeBreak.getCodePoint_(b, 0) : b;

  var aProp = goog.i18n.GraphemeBreak.getBreakProp_(aCode);
  var bProp = goog.i18n.GraphemeBreak.getBreakProp_(bCode);

  var isString = (typeof a === 'string');

  // GB3.
  if (aProp === prop.CR && bProp === prop.LF) {
    return false;
  }

  // GB4.
  if (aProp === prop.CONTROL || aProp === prop.CR || aProp === prop.LF) {
    return true;
  }

  // GB5.
  if (bProp === prop.CONTROL || bProp === prop.CR || bProp === prop.LF) {
    return true;
  }

  // GB6.
  if (aProp === prop.L &&
      (bProp === prop.L || bProp === prop.V || bProp === prop.LV ||
       bProp === prop.LVT)) {
    return false;
  }

  // GB7.
  if ((aProp === prop.LV || aProp === prop.V) &&
      (bProp === prop.V || bProp === prop.T)) {
    return false;
  }

  // GB8.
  if ((aProp === prop.LVT || aProp === prop.T) && bProp === prop.T) {
    return false;
  }

  // GB9.
  if (bProp === prop.EXTEND || bProp === prop.ZWJ || bProp === prop.VIRAMA) {
    return false;
  }

  // GB9a, GB9b.
  if (extended && (aProp === prop.PREPEND || bProp === prop.SPACING_MARK)) {
    return false;
  }

  // Tailorings for basic aksara support.
  if (extended && aProp === prop.VIRAMA && bProp === prop.INDIC_LETTER) {
    return false;
  }

  var aStr, index, codePoint, codePointProp;

  // GB10.
  if (isString) {
    if (bProp === prop.E_MODIFIER) {
      // If using new API, consume the string's code points starting from the
      // end and test the left side of: (E_Base | EBG) Extend* × E_Modifier.
      aStr = /** @type {string} */ (a);
      index = aStr.length - 1;
      codePoint = aCode;
      codePointProp = aProp;
      while (index > 0 && codePointProp === prop.EXTEND) {
        index -= goog.i18n.uChar.charCount(codePoint);
        codePoint = goog.i18n.GraphemeBreak.getCodePoint_(aStr, index);
        codePointProp = goog.i18n.GraphemeBreak.getBreakProp_(codePoint);
      }
      if (codePointProp === prop.E_BASE || codePointProp === prop.E_BASE_GAZ) {
        return false;
      }
    }
  } else {
    // If using legacy API, return best effort by testing:
    // (E_Base | EBG) × E_Modifier.
    if ((aProp === prop.E_BASE || aProp === prop.E_BASE_GAZ) &&
        bProp === prop.E_MODIFIER) {
      return false;
    }
  }

  // GB11.
  if (aProp === prop.ZWJ &&
      (bProp === prop.GLUE_AFTER_ZWJ || bProp === prop.E_BASE_GAZ)) {
    return false;
  }

  // GB12, GB13.
  if (isString) {
    if (bProp === prop.REGIONAL_INDICATOR) {
      // If using new API, consume the string's code points starting from the
      // end and test the left side of these rules:
      // - sot (RI RI)* RI × RI
      // - [^RI] (RI RI)* RI × RI.
      var numberOfRi = 0;
      aStr = /** @type {string} */ (a);
      index = aStr.length - 1;
      codePoint = aCode;
      codePointProp = aProp;
      while (index > 0 && codePointProp === prop.REGIONAL_INDICATOR) {
        numberOfRi++;
        index -= goog.i18n.uChar.charCount(codePoint);
        codePoint = goog.i18n.GraphemeBreak.getCodePoint_(aStr, index);
        codePointProp = goog.i18n.GraphemeBreak.getBreakProp_(codePoint);
      }
      if (codePointProp === prop.REGIONAL_INDICATOR) {
        numberOfRi++;
      }
      if (numberOfRi % 2 === 1) {
        return false;
      }
    }
  } else {
    // If using legacy API, return best effort by testing: RI × RI.
    if (aProp === prop.REGIONAL_INDICATOR &&
        bProp === prop.REGIONAL_INDICATOR) {
      return false;
    }
  }

  // GB999.
  return true;
};


/**
 * Method to return property enum value of the code point. If it is Hangul LV or
 * LVT, then it is computed; for the rest it is picked from the inversion map.
 *
 * @param {number} codePoint The code point value of the character.
 * @return {number} Property enum value of code point.
 * @private
 */
goog.i18n.GraphemeBreak.getBreakProp_ = function(codePoint) {
  if (0xAC00 <= codePoint && codePoint <= 0xD7A3) {
    var prop = goog.i18n.GraphemeBreak.property;
    if (codePoint % 0x1C === 0x10) {
      return prop.LV;
    }
    return prop.LVT;
  } else {
    if (!goog.i18n.GraphemeBreak.inversions_) {
      goog.i18n.GraphemeBreak.inversions_ = new goog.structs.InversionMap(
          [
            0,      10,   1,     2,   1,    18,   95,    33,    13,  1,
            594,    112,  275,   7,   263,  45,   1,     1,     1,   2,
            1,      2,    1,     1,   56,   6,    10,    11,    1,   1,
            46,     21,   16,    1,   101,  7,    1,     1,     6,   2,
            2,      1,    4,     33,  1,    1,    1,     30,    27,  91,
            11,     58,   9,     34,  4,    1,    9,     1,     3,   1,
            5,      43,   3,     120, 14,   1,    32,    1,     17,  37,
            1,      1,    1,     1,   3,    8,    4,     1,     2,   1,
            7,      8,    2,     2,   21,   7,    1,     1,     2,   17,
            39,     1,    1,     1,   2,    6,    6,     1,     9,   5,
            4,      2,    2,     12,  2,    15,   2,     1,     17,  39,
            2,      3,    12,    4,   8,    6,    17,    2,     3,   14,
            1,      17,   39,    1,   1,    3,    8,     4,     1,   20,
            2,      29,   1,     2,   17,   39,   1,     1,     2,   1,
            6,      6,    9,     6,   4,    2,    2,     13,    1,   16,
            1,      18,   41,    1,   1,    1,    12,    1,     9,   1,
            40,     1,    3,     17,  31,   1,    5,     4,     3,   5,
            7,      8,    3,     2,   8,    2,    29,    1,     2,   17,
            39,     1,    1,     1,   1,    2,    1,     3,     1,   5,
            1,      8,    9,     1,   3,    2,    29,    1,     2,   17,
            38,     3,    1,     2,   5,    7,    1,     1,     8,   1,
            10,     2,    30,    2,   22,   48,   5,     1,     2,   6,
            7,      1,    18,    2,   13,   46,   2,     1,     1,   1,
            6,      1,    12,    8,   50,   46,   2,     1,     1,   1,
            9,      11,   6,     14,  2,    58,   2,     27,    1,   1,
            1,      1,    1,     4,   2,    49,   14,    1,     4,   1,
            1,      2,    5,     48,  9,    1,    57,    33,    12,  4,
            1,      6,    1,     2,   2,    2,    1,     16,    2,   4,
            2,      2,    4,     3,   1,    3,    2,     7,     3,   4,
            13,     1,    1,     1,   2,    6,    1,     1,     14,  1,
            98,     96,   72,    88,  349,  3,    931,   15,    2,   1,
            14,     15,   2,     1,   14,   15,   2,     15,    15,  14,
            35,     17,   2,     1,   7,    8,    1,     2,     9,   1,
            1,      9,    1,     45,  3,    1,    118,   2,     34,  1,
            87,     28,   3,     3,   4,    2,    9,     1,     6,   3,
            20,     19,   29,    44,  84,   23,   2,     2,     1,   4,
            45,     6,    2,     1,   1,    1,    8,     1,     1,   1,
            2,      8,    6,     13,  48,   84,   1,     14,    33,  1,
            1,      5,    1,     1,   5,    1,    1,     1,     7,   31,
            9,      12,   2,     1,   7,    23,   1,     4,     2,   2,
            2,      2,    2,     11,  3,    2,    36,    2,     1,   1,
            2,      3,    1,     1,   3,    2,    12,    36,    8,   8,
            2,      2,    21,    3,   128,  3,    1,     13,    1,   7,
            4,      1,    4,     2,   1,    3,    2,     198,   64,  523,
            1,      1,    1,     2,   24,   7,    49,    16,    96,  33,
            1324,   1,    34,    1,   1,    1,    82,    2,     98,  1,
            14,     1,    1,     4,   86,   1,    1418,  3,     141, 1,
            96,     32,   554,   6,   105,  2,    30164, 4,     1,   10,
            32,     2,    80,    2,   272,  1,    3,     1,     4,   1,
            23,     2,    2,     1,   24,   30,   4,     4,     3,   8,
            1,      1,    13,    2,   16,   34,   16,    1,     1,   26,
            18,     24,   24,    4,   8,    2,    23,    11,    1,   1,
            12,     32,   3,     1,   5,    3,    3,     36,    1,   2,
            4,      2,    1,     3,   1,    36,   1,     32,    35,  6,
            2,      2,    2,     2,   12,   1,    8,     1,     1,   18,
            16,     1,    3,     6,   1,    1,    1,     3,     48,  1,
            1,      3,    2,     2,   5,    2,    1,     1,     32,  9,
            1,      2,    2,     5,   1,    1,    201,   14,    2,   1,
            1,      9,    8,     2,   1,    2,    1,     2,     1,   1,
            1,      18,   11184, 27,  49,   1028, 1024,  6942,  1,   737,
            16,     16,   16,    207, 1,    158,  2,     89,    3,   513,
            1,      226,  1,     149, 5,    1670, 15,    40,    7,   1,
            165,    2,    1305,  1,   1,    1,    53,    14,    1,   56,
            1,      2,    1,     45,  3,    4,    2,     1,     1,   2,
            1,      66,   3,     36,  5,    1,    6,     2,     62,  1,
            12,     2,    1,     48,  3,    9,    1,     1,     1,   2,
            6,      3,    95,    3,   3,    2,    1,     1,     2,   6,
            1,      160,  1,     3,   7,    1,    21,    2,     2,   56,
            1,      1,    1,     1,   1,    12,   1,     9,     1,   10,
            4,      15,   192,   3,   8,    2,    1,     2,     1,   1,
            105,    1,    2,     6,   1,    1,    2,     1,     1,   2,
            1,      1,    1,     235, 1,    2,    6,     4,     2,   1,
            1,      1,    27,    2,   82,   3,    8,     2,     1,   1,
            1,      1,    106,   1,   1,    1,    2,     6,     1,   1,
            101,    3,    2,     4,   1,    4,    1,     1283,  1,   14,
            1,      1,    82,    23,  1,    7,    1,     2,     1,   2,
            20025,  5,    59,    7,   1050, 62,   4,     19722, 2,   1,
            4,      5313, 1,     1,   3,    3,    1,     5,     8,   8,
            2,      7,    30,    4,   148,  3,    1979,  55,    4,   50,
            8,      1,    14,    1,   22,   1424, 2213,  7,     109, 7,
            2203,   26,   264,   1,   53,   1,    52,    1,     17,  1,
            13,     1,    16,    1,   3,    1,    25,    3,     2,   1,
            2,      3,    30,    1,   1,    1,    13,    5,     66,  2,
            2,      11,   21,    4,   4,    1,    1,     9,     3,   1,
            4,      3,    1,     3,   3,    1,    30,    1,     16,  2,
            106,    1,    4,     1,   71,   2,    4,     1,     21,  1,
            4,      2,    81,    1,   92,   3,    3,     5,     48,  1,
            17,     1,    16,    1,   16,   3,    9,     1,     11,  1,
            587,    5,    1,     1,   7,    1,    9,     10,    3,   2,
            788162, 31
          ],
          [
            1,  13, 1,  12, 1,  0, 1,  0, 1,  0,  2,  0, 2,  0, 2,  0,  2,  0,
            2,  0,  2,  0,  2,  0, 3,  0, 2,  0,  1,  0, 2,  0, 2,  0,  2,  3,
            0,  2,  0,  2,  0,  2, 0,  3, 0,  2,  0,  2, 0,  2, 0,  2,  0,  2,
            0,  2,  0,  2,  0,  2, 0,  2, 0,  2,  3,  2, 4,  0, 5,  2,  4,  2,
            0,  4,  2,  4,  6,  4, 0,  2, 5,  0,  2,  0, 5,  0, 2,  4,  0,  5,
            2,  0,  2,  4,  2,  4, 6,  0, 2,  5,  0,  2, 0,  5, 0,  2,  4,  0,
            5,  2,  4,  2,  6,  2, 5,  0, 2,  0,  2,  4, 0,  5, 2,  0,  4,  2,
            4,  6,  0,  2,  0,  2, 4,  0, 5,  2,  0,  2, 4,  2, 4,  6,  2,  5,
            0,  2,  0,  5,  0,  2, 0,  5, 2,  4,  2,  4, 6,  0, 2,  0,  2,  4,
            0,  5,  0,  5,  0,  2, 4,  2, 6,  2,  5,  0, 2,  0, 2,  4,  0,  5,
            2,  0,  4,  2,  4,  2, 4,  2, 4,  2,  6,  2, 5,  0, 2,  0,  2,  4,
            0,  5,  0,  2,  4,  2, 4,  6, 3,  0,  2,  0, 2,  0, 4,  0,  5,  6,
            2,  4,  2,  4,  2,  0, 4,  0, 5,  0,  2,  0, 4,  2, 6,  0,  2,  0,
            5,  0,  2,  0,  4,  2, 0,  2, 0,  5,  0,  2, 0,  2, 0,  2,  0,  2,
            0,  4,  5,  2,  4,  2, 6,  0, 2,  0,  2,  0, 2,  0, 5,  0,  2,  4,
            2,  0,  6,  4,  2,  5, 0,  5, 0,  4,  2,  5, 2,  5, 0,  5,  0,  5,
            2,  5,  2,  0,  4,  2, 0,  2, 5,  0,  2,  0, 7,  8, 9,  0,  2,  0,
            5,  2,  6,  0,  5,  2, 6,  0, 5,  2,  0,  5, 2,  5, 0,  2,  4,  2,
            4,  2,  4,  2,  6,  2, 0,  2, 0,  2,  1,  0, 2,  0, 2,  0,  5,  0,
            2,  4,  2,  4,  2,  4, 2,  0, 5,  0,  5,  0, 5,  2, 4,  2,  0,  5,
            0,  5,  4,  2,  4,  2, 6,  0, 2,  0,  2,  4, 2,  0, 2,  4,  0,  5,
            2,  4,  2,  4,  2,  4, 2,  4, 6,  5,  0,  2, 0,  2, 4,  0,  5,  4,
            2,  4,  2,  6,  2,  5, 0,  5, 0,  5,  0,  2, 4,  2, 4,  2,  4,  2,
            6,  0,  5,  4,  2,  4, 2,  0, 5,  0,  2,  0, 2,  4, 2,  0,  2,  0,
            4,  2,  0,  2,  0,  2, 0,  1, 2,  15, 1,  0, 1,  0, 1,  0,  2,  0,
            16, 0,  17, 0,  17, 0, 17, 0, 16, 0,  17, 0, 16, 0, 17, 0,  2,  0,
            6,  0,  2,  0,  2,  0, 2,  0, 2,  0,  2,  0, 2,  0, 2,  0,  2,  0,
            6,  5,  2,  5,  4,  2, 4,  0, 5,  0,  5,  0, 5,  0, 5,  0,  4,  0,
            5,  4,  6,  2,  0,  2, 0,  5, 0,  2,  0,  5, 2,  4, 6,  0,  7,  2,
            4,  0,  5,  0,  5,  2, 4,  2, 4,  2,  4,  6, 0,  2, 0,  5,  2,  4,
            2,  4,  2,  0,  2,  0, 2,  4, 0,  5,  0,  5, 0,  5, 0,  2,  0,  5,
            2,  0,  2,  0,  2,  0, 2,  0, 2,  0,  5,  4, 2,  4, 0,  4,  6,  0,
            5,  0,  5,  0,  5,  0, 4,  2, 4,  2,  4,  0, 4,  6, 0,  11, 8,  9,
            0,  2,  0,  2,  0,  2, 0,  2, 0,  1,  0,  2, 0,  1, 0,  2,  0,  2,
            0,  2,  0,  2,  0,  2, 6,  0, 2,  0,  4,  2, 4,  0, 2,  6,  0,  6,
            2,  4,  0,  4,  2,  4, 6,  2, 0,  3,  0,  2, 0,  2, 4,  2,  6,  0,
            2,  0,  2,  4,  0,  4, 2,  4, 6,  0,  3,  0, 2,  0, 4,  2,  4,  2,
            6,  2,  0,  2,  0,  2, 4,  2, 6,  0,  2,  4, 0,  2, 0,  2,  4,  2,
            4,  6,  0,  2,  0,  4, 2,  0, 4,  2,  4,  6, 2,  4, 2,  0,  2,  4,
            2,  4,  2,  4,  2,  4, 2,  4, 6,  2,  0,  2, 4,  2, 4,  2,  4,  6,
            2,  0,  2,  0,  4,  2, 4,  2, 4,  6,  2,  0, 2,  4, 2,  4,  2,  6,
            2,  0,  2,  4,  2,  4, 2,  6, 0,  4,  2,  4, 6,  0, 2,  4,  2,  4,
            2,  4,  2,  0,  2,  0, 2,  0, 4,  2,  0,  2, 0,  1, 0,  2,  4,  2,
            0,  4,  2,  1,  2,  0, 2,  0, 2,  0,  2,  0, 2,  0, 2,  0,  2,  0,
            2,  0,  2,  0,  2,  0, 2,  0, 14, 0,  17, 0, 17, 0, 17, 0,  16, 0,
            17, 0,  17, 0,  17, 0, 16, 0, 16, 0,  16, 0, 17, 0, 17, 0,  18, 0,
            16, 0,  16, 0,  19, 0, 16, 0, 16, 0,  16, 0, 16, 0, 16, 0,  17, 0,
            16, 0,  17, 0,  17, 0, 17, 0, 16, 0,  16, 0, 16, 0, 16, 0,  17, 0,
            16, 0,  16, 0,  17, 0, 17, 0, 16, 0,  16, 0, 16, 0, 16, 0,  16, 0,
            16, 0,  16, 0,  16, 0, 16, 0, 1,  2
          ],
          true);
    }
    return /** @type {number} */ (
        goog.i18n.GraphemeBreak.inversions_.at(codePoint));
  }
};

/**
 * Extracts a code point from a string at the specified index.
 *
 * @param {string} str
 * @param {number} index
 * @return {number} Extracted code point.
 * @private
 */
goog.i18n.GraphemeBreak.getCodePoint_ = function(str, index) {
  var codePoint = goog.i18n.uChar.getCodePointAround(str, index);
  return (codePoint < 0) ? -codePoint : codePoint;
};

/**
 * Indicates if there is a grapheme cluster boundary between a and b.
 *
 * Legacy function. Does not cover cases where a sequence of code points is
 * required in order to decide if there is a grapheme cluster boundary, such as
 * emoji modifier sequences and emoji flag sequences. To cover all cases please
 * use `hasGraphemeBreakStrings`.
 *
 * There are two kinds of grapheme clusters: 1) Legacy 2) Extended. This method
 * is to check for both using a boolean flag to switch between them. If no flag
 * is provided rules for the extended clusters will be used by default.
 *
 * @param {number} a The code point value of the first character.
 * @param {number} b The code point value of the second character.
 * @param {boolean=} opt_extended If true, indicates extended grapheme cluster;
 *     If false, indicates legacy cluster. Default value is true.
 * @return {boolean} True if there is a grapheme cluster boundary between
 *     a and b; False otherwise.
 */
goog.i18n.GraphemeBreak.hasGraphemeBreak = function(a, b, opt_extended) {
  return goog.i18n.GraphemeBreak.applyBreakRules_(a, b, opt_extended !== false);
};

/**
 * Indicates if there is a grapheme cluster boundary between a and b.
 *
 * There are two kinds of grapheme clusters: 1) Legacy 2) Extended. This method
 * is to check for both using a boolean flag to switch between them. If no flag
 * is provided rules for the extended clusters will be used by default.
 *
 * @param {string} a String with the first sequence of characters.
 * @param {string} b String with the second sequence of characters.
 * @param {boolean=} opt_extended If true, indicates extended grapheme cluster;
 *     If false, indicates legacy cluster. Default value is true.
 * @return {boolean} True if there is a grapheme cluster boundary between
 *     a and b; False otherwise.
 */
goog.i18n.GraphemeBreak.hasGraphemeBreakStrings = function(a, b, opt_extended) {
  goog.asserts.assert(a !== undefined, 'First string should be defined.');
  goog.asserts.assert(b !== undefined, 'Second string should be defined.');

  // Break if any of the strings is empty.
  if (a.length === 0 || b.length === 0) {
    return true;
  }

  return goog.i18n.GraphemeBreak.applyBreakRules_(a, b, opt_extended !== false);
};
