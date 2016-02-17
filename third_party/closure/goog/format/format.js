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
 * @fileoverview Provides utility functions for formatting strings, numbers etc.
 *
 */

goog.provide('goog.format');

goog.require('goog.i18n.GraphemeBreak');
goog.require('goog.string');
goog.require('goog.userAgent');


/**
 * Formats a number of bytes in human readable form.
 * 54, 450K, 1.3M, 5G etc.
 * @param {number} bytes The number of bytes to show.
 * @param {number=} opt_decimals The number of decimals to use.  Defaults to 2.
 * @return {string} The human readable form of the byte size.
 */
goog.format.fileSize = function(bytes, opt_decimals) {
  return goog.format.numBytesToString(bytes, opt_decimals, false);
};


/**
 * Checks whether string value containing scaling units (K, M, G, T, P, m,
 * u, n) can be converted to a number.
 *
 * Where there is a decimal, there must be a digit to the left of the
 * decimal point.
 *
 * Negative numbers are valid.
 *
 * Examples:
 *   0, 1, 1.0, 10.4K, 2.3M, -0.3P, 1.2m
 *
 * @param {string} val String value to check.
 * @return {boolean} True if string could be converted to a numeric value.
 */
goog.format.isConvertableScaledNumber = function(val) {
  return goog.format.SCALED_NUMERIC_RE_.test(val);
};


/**
 * Converts a string to numeric value, taking into account the units.
 * If string ends in 'B', use binary conversion.
 * @param {string} stringValue String to be converted to numeric value.
 * @return {number} Numeric value for string.
 */
goog.format.stringToNumericValue = function(stringValue) {
  if (goog.string.endsWith(stringValue, 'B')) {
    return goog.format.stringToNumericValue_(
        stringValue, goog.format.NUMERIC_SCALES_BINARY_);
  }
  return goog.format.stringToNumericValue_(
      stringValue, goog.format.NUMERIC_SCALES_SI_);
};


/**
 * Converts a string to number of bytes, taking into account the units.
 * Binary conversion.
 * @param {string} stringValue String to be converted to numeric value.
 * @return {number} Numeric value for string.
 */
goog.format.stringToNumBytes = function(stringValue) {
  return goog.format.stringToNumericValue_(
      stringValue, goog.format.NUMERIC_SCALES_BINARY_);
};


/**
 * Converts a numeric value to string representation. SI conversion.
 * @param {number} val Value to be converted.
 * @param {number=} opt_decimals The number of decimals to use.  Defaults to 2.
 * @return {string} String representation of number.
 */
goog.format.numericValueToString = function(val, opt_decimals) {
  return goog.format.numericValueToString_(
      val, goog.format.NUMERIC_SCALES_SI_, opt_decimals);
};


/**
 * Converts number of bytes to string representation. Binary conversion.
 * Default is to return the additional 'B' suffix only for scales greater than
 * 1K, e.g. '10.5KB' to minimize confusion with counts that are scaled by powers
 * of 1000. Otherwise, suffix is empty string.
 * @param {number} val Value to be converted.
 * @param {number=} opt_decimals The number of decimals to use.  Defaults to 2.
 * @param {boolean=} opt_suffix If true, include trailing 'B' in returned
 *     string.  Default is true.
 * @param {boolean=} opt_useSeparator If true, number and scale will be
 *     separated by a no break space. Default is false.
 * @return {string} String representation of number of bytes.
 */
goog.format.numBytesToString = function(
    val, opt_decimals, opt_suffix, opt_useSeparator) {
  var suffix = '';
  if (!goog.isDef(opt_suffix) || opt_suffix) {
    suffix = 'B';
  }
  return goog.format.numericValueToString_(
      val, goog.format.NUMERIC_SCALES_BINARY_, opt_decimals, suffix,
      opt_useSeparator);
};


/**
 * Converts a string to numeric value, taking into account the units.
 * @param {string} stringValue String to be converted to numeric value.
 * @param {Object} conversion Dictionary of conversion scales.
 * @return {number} Numeric value for string.  If it cannot be converted,
 *    returns NaN.
 * @private
 */
goog.format.stringToNumericValue_ = function(stringValue, conversion) {
  var match = stringValue.match(goog.format.SCALED_NUMERIC_RE_);
  if (!match) {
    return NaN;
  }
  var val = Number(match[1]) * conversion[match[2]];
  return val;
};


/**
 * Converts a numeric value to string, using specified conversion
 * scales.
 * @param {number} val Value to be converted.
 * @param {Object} conversion Dictionary of scaling factors.
 * @param {number=} opt_decimals The number of decimals to use.  Default is 2.
 * @param {string=} opt_suffix Optional suffix to append.
 * @param {boolean=} opt_useSeparator If true, number and scale will be
 *     separated by a space. Default is false.
 * @return {string} The human readable form of the byte size.
 * @private
 */
goog.format.numericValueToString_ = function(
    val, conversion, opt_decimals, opt_suffix, opt_useSeparator) {
  var prefixes = goog.format.NUMERIC_SCALE_PREFIXES_;
  var orig_val = val;
  var symbol = '';
  var separator = '';
  var scale = 1;
  if (val < 0) {
    val = -val;
  }
  for (var i = 0; i < prefixes.length; i++) {
    var unit = prefixes[i];
    scale = conversion[unit];
    if (val >= scale || (scale <= 1 && val > 0.1 * scale)) {
      // Treat values less than 1 differently, allowing 0.5 to be "0.5" rather
      // than "500m"
      symbol = unit;
      break;
    }
  }
  if (!symbol) {
    scale = 1;
  } else {
    if (opt_suffix) {
      symbol += opt_suffix;
    }
    if (opt_useSeparator) {
      separator = ' ';
    }
  }
  var ex = Math.pow(10, goog.isDef(opt_decimals) ? opt_decimals : 2);
  return Math.round(orig_val / scale * ex) / ex + separator + symbol;
};


/**
 * Regular expression for detecting scaling units, such as K, M, G, etc. for
 * converting a string representation to a numeric value.
 *
 * Also allow 'k' to be aliased to 'K'.  These could be used for SI (powers
 * of 1000) or Binary (powers of 1024) conversions.
 *
 * Also allow final 'B' to be interpreted as byte-count, implicitly triggering
 * binary conversion (e.g., '10.2MB').
 *
 * @type {RegExp}
 * @private
 */
goog.format.SCALED_NUMERIC_RE_ = /^([-]?\d+\.?\d*)([K,M,G,T,P,k,m,u,n]?)[B]?$/;


/**
 * Ordered list of scaling prefixes in decreasing order.
 * @private {Array<string>}
 */
goog.format.NUMERIC_SCALE_PREFIXES_ =
    ['P', 'T', 'G', 'M', 'K', '', 'm', 'u', 'n'];


/**
 * Scaling factors for conversion of numeric value to string.  SI conversion.
 * @type {Object}
 * @private
 */
goog.format.NUMERIC_SCALES_SI_ = {
  '': 1,
  'n': 1e-9,
  'u': 1e-6,
  'm': 1e-3,
  'k': 1e3,
  'K': 1e3,
  'M': 1e6,
  'G': 1e9,
  'T': 1e12,
  'P': 1e15
};


/**
 * Scaling factors for conversion of numeric value to string.  Binary
 * conversion.
 * @type {Object}
 * @private
 */
goog.format.NUMERIC_SCALES_BINARY_ = {
  '': 1,
  'n': Math.pow(1024, -3),
  'u': Math.pow(1024, -2),
  'm': 1.0 / 1024,
  'k': 1024,
  'K': 1024,
  'M': Math.pow(1024, 2),
  'G': Math.pow(1024, 3),
  'T': Math.pow(1024, 4),
  'P': Math.pow(1024, 5)
};


/**
 * First Unicode code point that has the Mark property.
 * @type {number}
 * @private
 */
goog.format.FIRST_GRAPHEME_EXTEND_ = 0x300;


/**
 * Returns true if and only if given character should be treated as a breaking
 * space. All ASCII control characters, the main Unicode range of spacing
 * characters (U+2000 to U+200B inclusive except for U+2007), and several other
 * Unicode space characters are treated as breaking spaces.
 * @param {number} charCode The character code under consideration.
 * @return {boolean} True if the character is a breaking space.
 * @private
 */
goog.format.isTreatedAsBreakingSpace_ = function(charCode) {
  return (charCode <= goog.format.WbrToken_.SPACE) ||
      (charCode >= 0x1000 &&
       ((charCode >= 0x2000 && charCode <= 0x2006) ||
        (charCode >= 0x2008 && charCode <= 0x200B) || charCode == 0x1680 ||
        charCode == 0x180E || charCode == 0x2028 || charCode == 0x2029 ||
        charCode == 0x205f || charCode == 0x3000));
};


/**
 * Returns true if and only if given character is an invisible formatting
 * character.
 * @param {number} charCode The character code under consideration.
 * @return {boolean} True if the character is an invisible formatting character.
 * @private
 */
goog.format.isInvisibleFormattingCharacter_ = function(charCode) {
  // See: http://unicode.org/charts/PDF/U2000.pdf
  return (charCode >= 0x200C && charCode <= 0x200F) ||
      (charCode >= 0x202A && charCode <= 0x202E);
};


/**
 * Inserts word breaks into an HTML string at a given interval.  The counter is
 * reset if a space or a character which behaves like a space is encountered,
 * but it isn't incremented if an invisible formatting character is encountered.
 * WBRs aren't inserted into HTML tags or entities.  Entities count towards the
 * character count, HTML tags do not.
 *
 * With common strings aliased, objects allocations are constant based on the
 * length of the string: N + 3. This guarantee does not hold if the string
 * contains an element >= U+0300 and hasGraphemeBreak is non-trivial.
 *
 * @param {string} str HTML to insert word breaks into.
 * @param {function(number, number, boolean): boolean} hasGraphemeBreak A
 *     function determining if there is a grapheme break between two characters,
 *     in the same signature as goog.i18n.GraphemeBreak.hasGraphemeBreak.
 * @param {number=} opt_maxlen Maximum length after which to ensure
 *     there is a break.  Default is 10 characters.
 * @return {string} The string including word breaks.
 * @private
 */
goog.format.insertWordBreaksGeneric_ = function(
    str, hasGraphemeBreak, opt_maxlen) {
  var maxlen = opt_maxlen || 10;
  if (maxlen > str.length) return str;

  var rv = [];
  var n = 0;  // The length of the current token

  // This will contain the ampersand or less-than character if one of the
  // two has been seen; otherwise, the value is zero.
  var nestingCharCode = 0;

  // First character position from input string that has not been outputted.
  var lastDumpPosition = 0;

  var charCode = 0;
  for (var i = 0; i < str.length; i++) {
    // Using charCodeAt versus charAt avoids allocating new string objects.
    var lastCharCode = charCode;
    charCode = str.charCodeAt(i);

    // Don't add a WBR before characters that might be grapheme extending.
    var isPotentiallyGraphemeExtending =
        charCode >= goog.format.FIRST_GRAPHEME_EXTEND_ &&
        !hasGraphemeBreak(lastCharCode, charCode, true);

    // Don't add a WBR at the end of a word. For the purposes of determining
    // work breaks, all ASCII control characters and some commonly encountered
    // Unicode spacing characters are treated as breaking spaces.
    if (n >= maxlen && !goog.format.isTreatedAsBreakingSpace_(charCode) &&
        !isPotentiallyGraphemeExtending) {
      // Flush everything seen so far, and append a word break.
      rv.push(str.substring(lastDumpPosition, i), goog.format.WORD_BREAK_HTML);
      lastDumpPosition = i;
      n = 0;
    }

    if (!nestingCharCode) {
      // Not currently within an HTML tag or entity

      if (charCode == goog.format.WbrToken_.LT ||
          charCode == goog.format.WbrToken_.AMP) {
        // Entering an HTML Entity '&' or open tag '<'
        nestingCharCode = charCode;
      } else if (goog.format.isTreatedAsBreakingSpace_(charCode)) {
        // A space or control character -- reset the token length
        n = 0;
      } else if (!goog.format.isInvisibleFormattingCharacter_(charCode)) {
        // A normal flow character - increment.  For grapheme extending
        // characters, this is not *technically* a new character.  However,
        // since the grapheme break detector might be overly conservative,
        // we have to continue incrementing, or else we won't even be able
        // to add breaks when we get to things like punctuation.  For the
        // case where we have a full grapheme break detector, it is okay if
        // we occasionally break slightly early.
        n++;
      }
    } else if (
        charCode == goog.format.WbrToken_.GT &&
        nestingCharCode == goog.format.WbrToken_.LT) {
      // Leaving an HTML tag, treat the tag as zero-length
      nestingCharCode = 0;
    } else if (
        charCode == goog.format.WbrToken_.SEMI_COLON &&
        nestingCharCode == goog.format.WbrToken_.AMP) {
      // Leaving an HTML entity, treat it as length one
      nestingCharCode = 0;
      n++;
    }
  }

  // Take care of anything we haven't flushed so far.
  rv.push(str.substr(lastDumpPosition));

  return rv.join('');
};


/**
 * Inserts word breaks into an HTML string at a given interval.
 *
 * This method is as aggressive as possible, using a full table of Unicode
 * characters where it is legal to insert word breaks; however, this table
 * comes at a 2.5k pre-gzip (~1k post-gzip) size cost.  Consider using
 * insertWordBreaksBasic to minimize the size impact.
 *
 * @param {string} str HTML to insert word breaks into.
 * @param {number=} opt_maxlen Maximum length after which to ensure there is a
 *     break.  Default is 10 characters.
 * @return {string} The string including word breaks.
 */
goog.format.insertWordBreaks = function(str, opt_maxlen) {
  return goog.format.insertWordBreaksGeneric_(
      str, goog.i18n.GraphemeBreak.hasGraphemeBreak, opt_maxlen);
};


/**
 * Determines conservatively if a character has a Grapheme break.
 *
 * Conforms to a similar signature as goog.i18n.GraphemeBreak, but is overly
 * conservative, returning true only for characters in common scripts that
 * are simple to account for.
 *
 * @param {number} lastCharCode The previous character code.  Ignored.
 * @param {number} charCode The character code under consideration.  It must be
 *     at least \u0300 as a precondition -- this case is covered by
 *     insertWordBreaksGeneric_.
 * @param {boolean=} opt_extended Ignored, to conform with the interface.
 * @return {boolean} Whether it is one of the recognized subsets of characters
 *     with a grapheme break.
 * @private
 */
goog.format.conservativelyHasGraphemeBreak_ = function(
    lastCharCode, charCode, opt_extended) {
  // Return false for everything except the most common Cyrillic characters.
  // Don't worry about Latin characters, because insertWordBreaksGeneric_
  // itself already handles those.
  // TODO(gboyer): Also account for Greek, Armenian, and Georgian if it is
  // simple to do so.
  return charCode >= 0x400 && charCode < 0x523;
};


// TODO(gboyer): Consider using a compile-time flag to switch implementations
// rather than relying on the developers to toggle implementations.
/**
 * Inserts word breaks into an HTML string at a given interval.
 *
 * This method is less aggressive than insertWordBreaks, only inserting
 * breaks next to punctuation and between Latin or Cyrillic characters.
 * However, this is good enough for the common case of URLs.  It also
 * works for all Latin and Cyrillic languages, plus CJK has no need for word
 * breaks.  When this method is used, goog.i18n.GraphemeBreak may be dead
 * code eliminated.
 *
 * @param {string} str HTML to insert word breaks into.
 * @param {number=} opt_maxlen Maximum length after which to ensure there is a
 *     break.  Default is 10 characters.
 * @return {string} The string including word breaks.
 */
goog.format.insertWordBreaksBasic = function(str, opt_maxlen) {
  return goog.format.insertWordBreaksGeneric_(
      str, goog.format.conservativelyHasGraphemeBreak_, opt_maxlen);
};


/**
 * True iff the current userAgent is IE8 or above.
 * @type {boolean}
 * @private
 */
goog.format.IS_IE8_OR_ABOVE_ =
    goog.userAgent.IE && goog.userAgent.isVersionOrHigher(8);


/**
 * Constant for the WBR replacement used by insertWordBreaks.  Safari requires
 * <wbr></wbr>, Opera needs the &shy; entity, though this will give a visible
 * hyphen at breaks.  IE8 uses a zero width space.
 * Other browsers just use <wbr>.
 * @type {string}
 */
goog.format.WORD_BREAK_HTML =
    goog.userAgent.WEBKIT ? '<wbr></wbr>' : goog.userAgent.OPERA ?
                            '&shy;' :
                            goog.format.IS_IE8_OR_ABOVE_ ? '&#8203;' : '<wbr>';


/**
 * Tokens used within insertWordBreaks.
 * @private
 * @enum {number}
 */
goog.format.WbrToken_ = {
  LT: 60,          // '<'.charCodeAt(0)
  GT: 62,          // '>'.charCodeAt(0)
  AMP: 38,         // '&'.charCodeAt(0)
  SEMI_COLON: 59,  // ';'.charCodeAt(0)
  SPACE: 32        // ' '.charCodeAt(0)
};
