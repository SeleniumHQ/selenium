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
 * @fileoverview Number format/parse library with locale support.
 */


/**
 * Namespace for locale number format functions
 */
goog.provide('goog.i18n.NumberFormat');
goog.provide('goog.i18n.NumberFormat.CurrencyStyle');
goog.provide('goog.i18n.NumberFormat.Format');

goog.require('goog.asserts');
goog.require('goog.i18n.CompactNumberFormatSymbols');
goog.require('goog.i18n.NumberFormatSymbols');
goog.require('goog.i18n.currency');
goog.require('goog.math');



/**
 * Constructor of NumberFormat.
 * @param {number|string} pattern The number that indicates a predefined
 *     number format pattern.
 * @param {string=} opt_currency Optional international currency
 *     code. This determines the currency code/symbol used in format/parse. If
 *     not given, the currency code for current locale will be used.
 * @param {number=} opt_currencyStyle currency style, value defined in
 *        goog.i18n.NumberFormat.CurrencyStyle.
 * @constructor
 */
goog.i18n.NumberFormat = function(pattern, opt_currency, opt_currencyStyle) {
  this.intlCurrencyCode_ = opt_currency ||
      goog.i18n.NumberFormatSymbols.DEF_CURRENCY_CODE;

  this.currencyStyle_ = opt_currencyStyle ||
      goog.i18n.NumberFormat.CurrencyStyle.LOCAL;

  this.maximumIntegerDigits_ = 40;
  this.minimumIntegerDigits_ = 1;
  this.significantDigits_ = 0; // invariant, <= maximumFractionDigits
  this.maximumFractionDigits_ = 3; // invariant, >= minFractionDigits
  this.minimumFractionDigits_ = 0;
  this.minExponentDigits_ = 0;
  this.useSignForPositiveExponent_ = false;

  /**
   * Whether to show trailing zeros in the fraction when significantDigits_ is
   * positive.
   * @private {boolean}
   */
  this.showTrailingZeros_ = false;

  this.positivePrefix_ = '';
  this.positiveSuffix_ = '';
  this.negativePrefix_ = '-';
  this.negativeSuffix_ = '';

  // The multiplier for use in percent, per mille, etc.
  this.multiplier_ = 1;
  this.groupingSize_ = 3;
  this.decimalSeparatorAlwaysShown_ = false;
  this.useExponentialNotation_ = false;
  this.compactStyle_ = goog.i18n.NumberFormat.CompactStyle.NONE;

  /**
   * The number to base the formatting on when using compact styles, or null
   * if formatting should not be based on another number.
   * @type {?number}
   * @private
   */
  this.baseFormattingNumber_ = null;

  if (typeof pattern == 'number') {
    this.applyStandardPattern_(pattern);
  } else {
    this.applyPattern_(pattern);
  }
};


/**
 * Standard number formatting patterns.
 * @enum {number}
 */
goog.i18n.NumberFormat.Format = {
  DECIMAL: 1,
  SCIENTIFIC: 2,
  PERCENT: 3,
  CURRENCY: 4,
  COMPACT_SHORT: 5,
  COMPACT_LONG: 6
};


/**
 * Currency styles.
 * @enum {number}
 */
goog.i18n.NumberFormat.CurrencyStyle = {
  LOCAL: 0,     // currency style as it is used in its circulating country.
  PORTABLE: 1,  // currency style that differentiate it from other popular ones.
  GLOBAL: 2     // currency style that is unique among all currencies.
};


/**
 * Compacting styles.
 * @enum {number}
 */
goog.i18n.NumberFormat.CompactStyle = {
  NONE: 0,  // Don't compact.
  SHORT: 1, // Short compact form, such as 1.2B.
  LONG: 2  // Long compact form, such as 1.2 billion.
};


/**
 * If the usage of Ascii digits should be enforced.
 * @type {boolean}
 * @private
 */
goog.i18n.NumberFormat.enforceAsciiDigits_ = false;


/**
 * Set if the usage of Ascii digits in formatting should be enforced.
 * @param {boolean} doEnforce Boolean value about if Ascii digits should be
 *     enforced.
 */
goog.i18n.NumberFormat.setEnforceAsciiDigits = function(doEnforce) {
  goog.i18n.NumberFormat.enforceAsciiDigits_ = doEnforce;
};


/**
 * Return if Ascii digits is enforced.
 * @return {boolean} If Ascii digits is enforced.
 */
goog.i18n.NumberFormat.isEnforceAsciiDigits = function() {
  return goog.i18n.NumberFormat.enforceAsciiDigits_;
};


/**
 * Sets minimum number of fraction digits.
 * @param {number} min the minimum.
 * @return {!goog.i18n.NumberFormat} Reference to this NumberFormat object.
 */
goog.i18n.NumberFormat.prototype.setMinimumFractionDigits = function(min) {
  if (this.significantDigits_ > 0 && min > 0) {
    throw Error(
        'Can\'t combine significant digits and minimum fraction digits');
  }
  this.minimumFractionDigits_ = min;
  return this;
};


/**
 * Sets maximum number of fraction digits.
 * @param {number} max the maximum.
 * @return {!goog.i18n.NumberFormat} Reference to this NumberFormat object.
 */
goog.i18n.NumberFormat.prototype.setMaximumFractionDigits = function(max) {
  this.maximumFractionDigits_ = max;
  return this;
};


/**
 * Sets number of significant digits to show. Only fractions will be rounded.
 * @param {number} number The number of significant digits to include.
 * @return {!goog.i18n.NumberFormat} Reference to this NumberFormat object.
 */
goog.i18n.NumberFormat.prototype.setSignificantDigits = function(number) {
  if (this.minimumFractionDigits_ > 0 && number >= 0) {
    throw Error(
        'Can\'t combine significant digits and minimum fraction digits');
  }
  this.significantDigits_ = number;
  return this;
};


/**
 * Gets number of significant digits to show. Only fractions will be rounded.
 * @return {number} The number of significant digits to include.
 */
goog.i18n.NumberFormat.prototype.getSignificantDigits = function() {
  return this.significantDigits_;
};


/**
 * Sets whether trailing fraction zeros should be shown when significantDigits_
 * is positive. If this is true and significantDigits_ is 2, 1 will be formatted
 * as '1.0'.
 * @param {boolean} showTrailingZeros Whether trailing zeros should be shown.
 * @return {!goog.i18n.NumberFormat} Reference to this NumberFormat object.
 */
goog.i18n.NumberFormat.prototype.setShowTrailingZeros =
    function(showTrailingZeros) {
  this.showTrailingZeros_ = showTrailingZeros;
  return this;
};


/**
 * Sets a number to base the formatting on when compact style formatting is
 * used. If this is null, the formatting should be based only on the number to
 * be formatting.
 *
 * This base formatting number can be used to format the target number as
 * another number would be formatted. For example, 100,000 is normally formatted
 * as "100K" in the COMPACT_SHORT format. To instead format it as '0.1M', the
 * base number could be set to 1,000,000 in order to force all numbers to be
 * formatted in millions. Similarly, 1,000,000,000 would normally be formatted
 * as '1B' and setting the base formatting number to 1,000,000, would cause it
 * to be formatted instead as '1,000M'.
 *
 * @param {?number} baseFormattingNumber The number to base formatting on, or
 * null if formatting should not be based on another number.
 * @return {!goog.i18n.NumberFormat} Reference to this NumberFormat object.
 */
goog.i18n.NumberFormat.prototype.setBaseFormatting =
    function(baseFormattingNumber) {
  goog.asserts.assert(goog.isNull(baseFormattingNumber) ||
      isFinite(baseFormattingNumber));
  this.baseFormattingNumber_ = baseFormattingNumber;
  return this;
};


/**
 * Gets the number on which compact formatting is currently based, or null if
 * no such number is set. See setBaseFormatting() for more information.
 * @return {?number}
 */
goog.i18n.NumberFormat.prototype.getBaseFormatting = function() {
  return this.baseFormattingNumber_;
};


/**
 * Apply provided pattern, result are stored in member variables.
 *
 * @param {string} pattern String pattern being applied.
 * @private
 */
goog.i18n.NumberFormat.prototype.applyPattern_ = function(pattern) {
  this.pattern_ = pattern.replace(/ /g, '\u00a0');
  var pos = [0];

  this.positivePrefix_ = this.parseAffix_(pattern, pos);
  var trunkStart = pos[0];
  this.parseTrunk_(pattern, pos);
  var trunkLen = pos[0] - trunkStart;
  this.positiveSuffix_ = this.parseAffix_(pattern, pos);
  if (pos[0] < pattern.length &&
      pattern.charAt(pos[0]) == goog.i18n.NumberFormat.PATTERN_SEPARATOR_) {
    pos[0]++;
    this.negativePrefix_ = this.parseAffix_(pattern, pos);
    // we assume this part is identical to positive part.
    // user must make sure the pattern is correctly constructed.
    pos[0] += trunkLen;
    this.negativeSuffix_ = this.parseAffix_(pattern, pos);
  } else {
    // if no negative affix specified, they share the same positive affix
    this.negativePrefix_ = this.positivePrefix_ + this.negativePrefix_;
    this.negativeSuffix_ += this.positiveSuffix_;
  }
};


/**
 * Apply a predefined pattern to NumberFormat object.
 * @param {number} patternType The number that indicates a predefined number
 *     format pattern.
 * @private
 */
goog.i18n.NumberFormat.prototype.applyStandardPattern_ = function(patternType) {
  switch (patternType) {
    case goog.i18n.NumberFormat.Format.DECIMAL:
      this.applyPattern_(goog.i18n.NumberFormatSymbols.DECIMAL_PATTERN);
      break;
    case goog.i18n.NumberFormat.Format.SCIENTIFIC:
      this.applyPattern_(goog.i18n.NumberFormatSymbols.SCIENTIFIC_PATTERN);
      break;
    case goog.i18n.NumberFormat.Format.PERCENT:
      this.applyPattern_(goog.i18n.NumberFormatSymbols.PERCENT_PATTERN);
      break;
    case goog.i18n.NumberFormat.Format.CURRENCY:
      this.applyPattern_(goog.i18n.currency.adjustPrecision(
          goog.i18n.NumberFormatSymbols.CURRENCY_PATTERN,
          this.intlCurrencyCode_));
      break;
    case goog.i18n.NumberFormat.Format.COMPACT_SHORT:
      this.applyCompactStyle_(goog.i18n.NumberFormat.CompactStyle.SHORT);
      break;
    case goog.i18n.NumberFormat.Format.COMPACT_LONG:
      this.applyCompactStyle_(goog.i18n.NumberFormat.CompactStyle.LONG);
      break;
    default:
      throw Error('Unsupported pattern type.');
  }
};


/**
 * Apply a predefined pattern for shorthand formats.
 * @param {goog.i18n.NumberFormat.CompactStyle} style the compact style to
 *     set defaults for.
 * @private
 */
goog.i18n.NumberFormat.prototype.applyCompactStyle_ = function(style) {
  this.compactStyle_ = style;
  this.applyPattern_(goog.i18n.NumberFormatSymbols.DECIMAL_PATTERN);
  this.setMinimumFractionDigits(0);
  this.setMaximumFractionDigits(2);
  this.setSignificantDigits(2);
};


/**
 * Parses text string to produce a Number.
 *
 * This method attempts to parse text starting from position "opt_pos" if it
 * is given. Otherwise the parse will start from the beginning of the text.
 * When opt_pos presents, opt_pos will be updated to the character next to where
 * parsing stops after the call. If an error occurs, opt_pos won't be updated.
 *
 * @param {string} text The string to be parsed.
 * @param {Array.<number>=} opt_pos Position to pass in and get back.
 * @return {number} Parsed number. This throws an error if the text cannot be
 *     parsed.
 */
goog.i18n.NumberFormat.prototype.parse = function(text, opt_pos) {
  var pos = opt_pos || [0];

  if (this.compactStyle_ != goog.i18n.NumberFormat.CompactStyle.NONE) {
    throw Error('Parsing of compact numbers is unimplemented');
  }

  var start = pos[0];
  var ret = NaN;

  // we don't want to handle 2 kind of space in parsing, normalize it to nbsp
  text = text.replace(/ /g, '\u00a0');

  var gotPositive = text.indexOf(this.positivePrefix_, pos[0]) == pos[0];
  var gotNegative = text.indexOf(this.negativePrefix_, pos[0]) == pos[0];

  // check for the longest match
  if (gotPositive && gotNegative) {
    if (this.positivePrefix_.length > this.negativePrefix_.length) {
      gotNegative = false;
    } else if (this.positivePrefix_.length < this.negativePrefix_.length) {
      gotPositive = false;
    }
  }

  if (gotPositive) {
    pos[0] += this.positivePrefix_.length;
  } else if (gotNegative) {
    pos[0] += this.negativePrefix_.length;
  }

  // process digits or Inf, find decimal position
  if (text.indexOf(goog.i18n.NumberFormatSymbols.INFINITY, pos[0]) == pos[0]) {
    pos[0] += goog.i18n.NumberFormatSymbols.INFINITY.length;
    ret = Infinity;
  } else {
    ret = this.parseNumber_(text, pos);
  }

  // check for suffix
  if (gotPositive) {
    if (!(text.indexOf(this.positiveSuffix_, pos[0]) == pos[0])) {
      return NaN;
    }
    pos[0] += this.positiveSuffix_.length;
  } else if (gotNegative) {
    if (!(text.indexOf(this.negativeSuffix_, pos[0]) == pos[0])) {
      return NaN;
    }
    pos[0] += this.negativeSuffix_.length;
  }

  return gotNegative ? -ret : ret;
};


/**
 * This function will parse a "localized" text into a Number. It needs to
 * handle locale specific decimal, grouping, exponent and digits.
 *
 * @param {string} text The text that need to be parsed.
 * @param {Array.<number>} pos  In/out parsing position. In case of failure,
 *    pos value won't be changed.
 * @return {number} Number value, or NaN if nothing can be parsed.
 * @private
 */
goog.i18n.NumberFormat.prototype.parseNumber_ = function(text, pos) {
  var sawDecimal = false;
  var sawExponent = false;
  var sawDigit = false;
  var scale = 1;
  var decimal = goog.i18n.NumberFormatSymbols.DECIMAL_SEP;
  var grouping = goog.i18n.NumberFormatSymbols.GROUP_SEP;
  var exponentChar = goog.i18n.NumberFormatSymbols.EXP_SYMBOL;

  if (this.compactStyle_ != goog.i18n.NumberFormat.CompactStyle.NONE) {
    throw Error('Parsing of compact style numbers is not implemented');
  }

  var normalizedText = '';
  for (; pos[0] < text.length; pos[0]++) {
    var ch = text.charAt(pos[0]);
    var digit = this.getDigit_(ch);
    if (digit >= 0 && digit <= 9) {
      normalizedText += digit;
      sawDigit = true;
    } else if (ch == decimal.charAt(0)) {
      if (sawDecimal || sawExponent) {
        break;
      }
      normalizedText += '.';
      sawDecimal = true;
    } else if (ch == grouping.charAt(0) &&
               ('\u00a0' != grouping.charAt(0) ||
                pos[0] + 1 < text.length &&
                this.getDigit_(text.charAt(pos[0] + 1)) >= 0)) {
      // Got a grouping character here. When grouping character is nbsp, need
      // to make sure the character following it is a digit.
      if (sawDecimal || sawExponent) {
        break;
      }
      continue;
    } else if (ch == exponentChar.charAt(0)) {
      if (sawExponent) {
        break;
      }
      normalizedText += 'E';
      sawExponent = true;
    } else if (ch == '+' || ch == '-') {
      normalizedText += ch;
    } else if (ch == goog.i18n.NumberFormatSymbols.PERCENT.charAt(0)) {
      if (scale != 1) {
        break;
      }
      scale = 100;
      if (sawDigit) {
        pos[0]++; // eat this character if parse end here
        break;
      }
    } else if (ch == goog.i18n.NumberFormatSymbols.PERMILL.charAt(0)) {
      if (scale != 1) {
        break;
      }
      scale = 1000;
      if (sawDigit) {
        pos[0]++; // eat this character if parse end here
        break;
      }
    } else {
      break;
    }
  }
  return parseFloat(normalizedText) / scale;
};


/**
 * Formats a Number to produce a string.
 *
 * @param {number} number The Number to be formatted.
 * @return {string} The formatted number string.
 */
goog.i18n.NumberFormat.prototype.format = function(number) {
  if (isNaN(number)) {
    return goog.i18n.NumberFormatSymbols.NAN;
  }

  var parts = [];
  var baseFormattingNumber = goog.isNull(this.baseFormattingNumber_) ?
      number :
      this.baseFormattingNumber_;
  var unit = this.getUnitAfterRounding_(baseFormattingNumber, number);
  number /= Math.pow(10, unit.divisorBase);

  parts.push(unit.prefix);

  // in icu code, it is commented that certain computation need to keep the
  // negative sign for 0.
  var isNegative = number < 0.0 || number == 0.0 && 1 / number < 0.0;

  parts.push(isNegative ? this.negativePrefix_ : this.positivePrefix_);

  if (!isFinite(number)) {
    parts.push(goog.i18n.NumberFormatSymbols.INFINITY);
  } else {
    // convert number to non-negative value
    number *= isNegative ? -1 : 1;

    number *= this.multiplier_;
    this.useExponentialNotation_ ?
        this.subformatExponential_(number, parts) :
        this.subformatFixed_(number, this.minimumIntegerDigits_, parts);
  }

  parts.push(isNegative ? this.negativeSuffix_ : this.positiveSuffix_);
  parts.push(unit.suffix);

  return parts.join('');
};


/**
 * Round a number into an integer and fractional part
 * based on the rounding rules for this NumberFormat.
 * @param {number} number The number to round.
 * @return {{intValue: number, fracValue: number}} The integer and fractional
 *     part after rounding.
 * @private
 */
goog.i18n.NumberFormat.prototype.roundNumber_ = function(number) {
  var power = Math.pow(10, this.maximumFractionDigits_);
  var shiftedNumber = this.significantDigits_ <= 0 ?
      Math.round(number * power) :
      Math.floor(this.roundToSignificantDigits_(
          number * power,
          this.significantDigits_,
          this.maximumFractionDigits_));

  var intValue, fracValue;
  if (isFinite(shiftedNumber)) {
    intValue = Math.floor(shiftedNumber / power);
    fracValue = Math.floor(shiftedNumber - intValue * power);
  } else {
    intValue = number;
    fracValue = 0;
  }
  return {intValue: intValue, fracValue: fracValue};
};


/**
 * Formats a Number in fraction format.
 *
 * @param {number} number
 * @param {number} minIntDigits Minimum integer digits.
 * @param {Array} parts This array holds the pieces of formatted string.
 *     This function will add its formatted pieces to the array.
 * @private
 */
goog.i18n.NumberFormat.prototype.subformatFixed_ =
    function(number, minIntDigits, parts) {
  if (this.minimumFractionDigits_ > this.maximumFractionDigits_) {
    throw Error('Min value must be less than max value');
  }

  var rounded = this.roundNumber_(number);
  var power = Math.pow(10, this.maximumFractionDigits_);
  var intValue = rounded.intValue;
  var fracValue = rounded.fracValue;

  var numIntDigits = (intValue == 0) ? 0 : this.intLog10_(intValue) + 1;
  var fractionPresent = this.minimumFractionDigits_ > 0 || fracValue > 0 ||
      (this.showTrailingZeros_ && numIntDigits < this.significantDigits_);
  var minimumFractionDigits = this.minimumFractionDigits_;
  if (fractionPresent) {
    if (this.showTrailingZeros_ && this.significantDigits_ > 0) {
      minimumFractionDigits = this.significantDigits_ - numIntDigits;
    } else {
      minimumFractionDigits = this.minimumFractionDigits_;
    }
  }

  var intPart = '';
  var translatableInt = intValue;
  while (translatableInt > 1E20) {
    // here it goes beyond double precision, add '0' make it look better
    intPart = '0' + intPart;
    translatableInt = Math.round(translatableInt / 10);
  }
  intPart = translatableInt + intPart;

  var decimal = goog.i18n.NumberFormatSymbols.DECIMAL_SEP;
  var grouping = goog.i18n.NumberFormatSymbols.GROUP_SEP;
  var zeroCode = goog.i18n.NumberFormat.enforceAsciiDigits_ ?
                 48  /* ascii '0' */ :
                 goog.i18n.NumberFormatSymbols.ZERO_DIGIT.charCodeAt(0);
  var digitLen = intPart.length;

  if (intValue > 0 || minIntDigits > 0) {
    for (var i = digitLen; i < minIntDigits; i++) {
      parts.push(String.fromCharCode(zeroCode));
    }

    for (var i = 0; i < digitLen; i++) {
      parts.push(String.fromCharCode(zeroCode + intPart.charAt(i) * 1));

      if (digitLen - i > 1 && this.groupingSize_ > 0 &&
          ((digitLen - i) % this.groupingSize_ == 1)) {
        parts.push(grouping);
      }
    }
  } else if (!fractionPresent) {
    // If there is no fraction present, and we haven't printed any
    // integer digits, then print a zero.
    parts.push(String.fromCharCode(zeroCode));
  }

  // Output the decimal separator if we always do so.
  if (this.decimalSeparatorAlwaysShown_ || fractionPresent) {
    parts.push(decimal);
  }

  var fracPart = '' + (fracValue + power);
  var fracLen = fracPart.length;
  while (fracPart.charAt(fracLen - 1) == '0' &&
      fracLen > minimumFractionDigits + 1) {
    fracLen--;
  }

  for (var i = 1; i < fracLen; i++) {
    parts.push(String.fromCharCode(zeroCode + fracPart.charAt(i) * 1));
  }
};


/**
 * Formats exponent part of a Number.
 *
 * @param {number} exponent Exponential value.
 * @param {Array.<string>} parts The array that holds the pieces of formatted
 *     string. This function will append more formatted pieces to the array.
 * @private
 */
goog.i18n.NumberFormat.prototype.addExponentPart_ = function(exponent, parts) {
  parts.push(goog.i18n.NumberFormatSymbols.EXP_SYMBOL);

  if (exponent < 0) {
    exponent = -exponent;
    parts.push(goog.i18n.NumberFormatSymbols.MINUS_SIGN);
  } else if (this.useSignForPositiveExponent_) {
    parts.push(goog.i18n.NumberFormatSymbols.PLUS_SIGN);
  }

  var exponentDigits = '' + exponent;
  var zeroChar = goog.i18n.NumberFormat.enforceAsciiDigits_ ? '0' :
                 goog.i18n.NumberFormatSymbols.ZERO_DIGIT;
  for (var i = exponentDigits.length; i < this.minExponentDigits_; i++) {
    parts.push(zeroChar);
  }
  parts.push(exponentDigits);
};


/**
 * Formats Number in exponential format.
 *
 * @param {number} number Value need to be formated.
 * @param {Array.<string>} parts The array that holds the pieces of formatted
 *     string. This function will append more formatted pieces to the array.
 * @private
 */
goog.i18n.NumberFormat.prototype.subformatExponential_ =
    function(number, parts) {
  if (number == 0.0) {
    this.subformatFixed_(number, this.minimumIntegerDigits_, parts);
    this.addExponentPart_(0, parts);
    return;
  }

  var exponent = goog.math.safeFloor(Math.log(number) / Math.log(10));
  number /= Math.pow(10, exponent);

  var minIntDigits = this.minimumIntegerDigits_;
  if (this.maximumIntegerDigits_ > 1 &&
      this.maximumIntegerDigits_ > this.minimumIntegerDigits_) {
    // A repeating range is defined; adjust to it as follows.
    // If repeat == 3, we have 6,5,4=>3; 3,2,1=>0; 0,-1,-2=>-3;
    // -3,-4,-5=>-6, etc. This takes into account that the
    // exponent we have here is off by one from what we expect;
    // it is for the format 0.MMMMMx10^n.
    while ((exponent % this.maximumIntegerDigits_) != 0) {
      number *= 10;
      exponent--;
    }
    minIntDigits = 1;
  } else {
    // No repeating range is defined; use minimum integer digits.
    if (this.minimumIntegerDigits_ < 1) {
      exponent++;
      number /= 10;
    } else {
      exponent -= this.minimumIntegerDigits_ - 1;
      number *= Math.pow(10, this.minimumIntegerDigits_ - 1);
    }
  }
  this.subformatFixed_(number, minIntDigits, parts);
  this.addExponentPart_(exponent, parts);
};


/**
 * Returns the digit value of current character. The character could be either
 * '0' to '9', or a locale specific digit.
 *
 * @param {string} ch Character that represents a digit.
 * @return {number} The digit value, or -1 on error.
 * @private
 */
goog.i18n.NumberFormat.prototype.getDigit_ = function(ch) {
  var code = ch.charCodeAt(0);
  // between '0' to '9'
  if (48 <= code && code < 58) {
    return code - 48;
  } else {
    var zeroCode = goog.i18n.NumberFormatSymbols.ZERO_DIGIT.charCodeAt(0);
    return zeroCode <= code && code < zeroCode + 10 ? code - zeroCode : -1;
  }
};


// ----------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------
// Constants for characters used in programmatic (unlocalized) patterns.
/**
 * A zero digit character.
 * @type {string}
 * @private
 */
goog.i18n.NumberFormat.PATTERN_ZERO_DIGIT_ = '0';


/**
 * A grouping separator character.
 * @type {string}
 * @private
 */
goog.i18n.NumberFormat.PATTERN_GROUPING_SEPARATOR_ = ',';


/**
 * A decimal separator character.
 * @type {string}
 * @private
 */
goog.i18n.NumberFormat.PATTERN_DECIMAL_SEPARATOR_ = '.';


/**
 * A per mille character.
 * @type {string}
 * @private
 */
goog.i18n.NumberFormat.PATTERN_PER_MILLE_ = '\u2030';


/**
 * A percent character.
 * @type {string}
 * @private
 */
goog.i18n.NumberFormat.PATTERN_PERCENT_ = '%';


/**
 * A digit character.
 * @type {string}
 * @private
 */
goog.i18n.NumberFormat.PATTERN_DIGIT_ = '#';


/**
 * A separator character.
 * @type {string}
 * @private
 */
goog.i18n.NumberFormat.PATTERN_SEPARATOR_ = ';';


/**
 * An exponent character.
 * @type {string}
 * @private
 */
goog.i18n.NumberFormat.PATTERN_EXPONENT_ = 'E';


/**
 * An plus character.
 * @type {string}
 * @private
 */
goog.i18n.NumberFormat.PATTERN_PLUS_ = '+';


/**
 * A minus character.
 * @type {string}
 * @private
 */
goog.i18n.NumberFormat.PATTERN_MINUS_ = '-';


/**
 * A quote character.
 * @type {string}
 * @private
 */
goog.i18n.NumberFormat.PATTERN_CURRENCY_SIGN_ = '\u00A4';


/**
 * A quote character.
 * @type {string}
 * @private
 */
goog.i18n.NumberFormat.QUOTE_ = '\'';


/**
 * Parses affix part of pattern.
 *
 * @param {string} pattern Pattern string that need to be parsed.
 * @param {Array.<number>} pos One element position array to set and receive
 *     parsing position.
 *
 * @return {string} Affix received from parsing.
 * @private
 */
goog.i18n.NumberFormat.prototype.parseAffix_ = function(pattern, pos) {
  var affix = '';
  var inQuote = false;
  var len = pattern.length;

  for (; pos[0] < len; pos[0]++) {
    var ch = pattern.charAt(pos[0]);
    if (ch == goog.i18n.NumberFormat.QUOTE_) {
      if (pos[0] + 1 < len &&
          pattern.charAt(pos[0] + 1) == goog.i18n.NumberFormat.QUOTE_) {
        pos[0]++;
        affix += '\''; // 'don''t'
      } else {
        inQuote = !inQuote;
      }
      continue;
    }

    if (inQuote) {
      affix += ch;
    } else {
      switch (ch) {
        case goog.i18n.NumberFormat.PATTERN_DIGIT_:
        case goog.i18n.NumberFormat.PATTERN_ZERO_DIGIT_:
        case goog.i18n.NumberFormat.PATTERN_GROUPING_SEPARATOR_:
        case goog.i18n.NumberFormat.PATTERN_DECIMAL_SEPARATOR_:
        case goog.i18n.NumberFormat.PATTERN_SEPARATOR_:
          return affix;
        case goog.i18n.NumberFormat.PATTERN_CURRENCY_SIGN_:
          if ((pos[0] + 1) < len &&
              pattern.charAt(pos[0] + 1) ==
              goog.i18n.NumberFormat.PATTERN_CURRENCY_SIGN_) {
            pos[0]++;
            affix += this.intlCurrencyCode_;
          } else {
            switch (this.currencyStyle_) {
              case goog.i18n.NumberFormat.CurrencyStyle.LOCAL:
                affix += goog.i18n.currency.getLocalCurrencySign(
                    this.intlCurrencyCode_);
                break;
              case goog.i18n.NumberFormat.CurrencyStyle.GLOBAL:
                affix += goog.i18n.currency.getGlobalCurrencySign(
                    this.intlCurrencyCode_);
                break;
              case goog.i18n.NumberFormat.CurrencyStyle.PORTABLE:
                affix += goog.i18n.currency.getPortableCurrencySign(
                    this.intlCurrencyCode_);
                break;
              default:
                break;
            }
          }
          break;
        case goog.i18n.NumberFormat.PATTERN_PERCENT_:
          if (this.multiplier_ != 1) {
            throw Error('Too many percent/permill');
          }
          this.multiplier_ = 100;
          affix += goog.i18n.NumberFormatSymbols.PERCENT;
          break;
        case goog.i18n.NumberFormat.PATTERN_PER_MILLE_:
          if (this.multiplier_ != 1) {
            throw Error('Too many percent/permill');
          }
          this.multiplier_ = 1000;
          affix += goog.i18n.NumberFormatSymbols.PERMILL;
          break;
        default:
          affix += ch;
      }
    }
  }

  return affix;
};


/**
 * Parses the trunk part of a pattern.
 *
 * @param {string} pattern Pattern string that need to be parsed.
 * @param {Array.<number>} pos One element position array to set and receive
 *     parsing position.
 * @private
 */
goog.i18n.NumberFormat.prototype.parseTrunk_ = function(pattern, pos) {
  var decimalPos = -1;
  var digitLeftCount = 0;
  var zeroDigitCount = 0;
  var digitRightCount = 0;
  var groupingCount = -1;

  var len = pattern.length;
  for (var loop = true; pos[0] < len && loop; pos[0]++) {
    var ch = pattern.charAt(pos[0]);
    switch (ch) {
      case goog.i18n.NumberFormat.PATTERN_DIGIT_:
        if (zeroDigitCount > 0) {
          digitRightCount++;
        } else {
          digitLeftCount++;
        }
        if (groupingCount >= 0 && decimalPos < 0) {
          groupingCount++;
        }
        break;
      case goog.i18n.NumberFormat.PATTERN_ZERO_DIGIT_:
        if (digitRightCount > 0) {
          throw Error('Unexpected "0" in pattern "' + pattern + '"');
        }
        zeroDigitCount++;
        if (groupingCount >= 0 && decimalPos < 0) {
          groupingCount++;
        }
        break;
      case goog.i18n.NumberFormat.PATTERN_GROUPING_SEPARATOR_:
        groupingCount = 0;
        break;
      case goog.i18n.NumberFormat.PATTERN_DECIMAL_SEPARATOR_:
        if (decimalPos >= 0) {
          throw Error('Multiple decimal separators in pattern "' +
                      pattern + '"');
        }
        decimalPos = digitLeftCount + zeroDigitCount + digitRightCount;
        break;
      case goog.i18n.NumberFormat.PATTERN_EXPONENT_:
        if (this.useExponentialNotation_) {
          throw Error('Multiple exponential symbols in pattern "' +
                      pattern + '"');
        }
        this.useExponentialNotation_ = true;
        this.minExponentDigits_ = 0;

        // exponent pattern can have a optional '+'.
        if ((pos[0] + 1) < len && pattern.charAt(pos[0] + 1) ==
            goog.i18n.NumberFormat.PATTERN_PLUS_) {
          pos[0]++;
          this.useSignForPositiveExponent_ = true;
        }

        // Use lookahead to parse out the exponential part
        // of the pattern, then jump into phase 2.
        while ((pos[0] + 1) < len && pattern.charAt(pos[0] + 1) ==
               goog.i18n.NumberFormat.PATTERN_ZERO_DIGIT_) {
          pos[0]++;
          this.minExponentDigits_++;
        }

        if ((digitLeftCount + zeroDigitCount) < 1 ||
            this.minExponentDigits_ < 1) {
          throw Error('Malformed exponential pattern "' + pattern + '"');
        }
        loop = false;
        break;
      default:
        pos[0]--;
        loop = false;
        break;
    }
  }

  if (zeroDigitCount == 0 && digitLeftCount > 0 && decimalPos >= 0) {
    // Handle '###.###' and '###.' and '.###'
    var n = decimalPos;
    if (n == 0) { // Handle '.###'
      n++;
    }
    digitRightCount = digitLeftCount - n;
    digitLeftCount = n - 1;
    zeroDigitCount = 1;
  }

  // Do syntax checking on the digits.
  if (decimalPos < 0 && digitRightCount > 0 ||
      decimalPos >= 0 && (decimalPos < digitLeftCount ||
                          decimalPos > digitLeftCount + zeroDigitCount) ||
      groupingCount == 0) {
    throw Error('Malformed pattern "' + pattern + '"');
  }
  var totalDigits = digitLeftCount + zeroDigitCount + digitRightCount;

  this.maximumFractionDigits_ = decimalPos >= 0 ? totalDigits - decimalPos : 0;
  if (decimalPos >= 0) {
    this.minimumFractionDigits_ = digitLeftCount + zeroDigitCount - decimalPos;
    if (this.minimumFractionDigits_ < 0) {
      this.minimumFractionDigits_ = 0;
    }
  }

  // The effectiveDecimalPos is the position the decimal is at or would be at
  // if there is no decimal. Note that if decimalPos<0, then digitTotalCount ==
  // digitLeftCount + zeroDigitCount.
  var effectiveDecimalPos = decimalPos >= 0 ? decimalPos : totalDigits;
  this.minimumIntegerDigits_ = effectiveDecimalPos - digitLeftCount;
  if (this.useExponentialNotation_) {
    this.maximumIntegerDigits_ = digitLeftCount + this.minimumIntegerDigits_;

    // in exponential display, we need to at least show something.
    if (this.maximumFractionDigits_ == 0 && this.minimumIntegerDigits_ == 0) {
      this.minimumIntegerDigits_ = 1;
    }
  }

  this.groupingSize_ = Math.max(0, groupingCount);
  this.decimalSeparatorAlwaysShown_ = decimalPos == 0 ||
                                      decimalPos == totalDigits;
};


/**
 * Alias for the compact format 'unit' object.
 * @typedef {{
 *     prefix: string,
 *     suffix: string,
 *     divisorBase: number
 * }}
 */
goog.i18n.NumberFormat.CompactNumberUnit;


/**
 * The empty unit, corresponding to a base of 0.
 * @private {!goog.i18n.NumberFormat.CompactNumberUnit}
 */
goog.i18n.NumberFormat.NULL_UNIT_ = { prefix: '', suffix: '', divisorBase: 0 };


/**
 * Get compact unit for a certain number of digits
 *
 * @param {number} base The number of digits to get the unit for.
 * @param {string} plurality The plurality of the number.
 * @return {!goog.i18n.NumberFormat.CompactNumberUnit} The compact unit.
 * @private
 */
goog.i18n.NumberFormat.prototype.getUnitFor_ = function(base, plurality) {
  var table = this.compactStyle_ == goog.i18n.NumberFormat.CompactStyle.SHORT ?
      goog.i18n.CompactNumberFormatSymbols.COMPACT_DECIMAL_SHORT_PATTERN :
      goog.i18n.CompactNumberFormatSymbols.COMPACT_DECIMAL_LONG_PATTERN;

  if (base < 3) {
    return goog.i18n.NumberFormat.NULL_UNIT_;
  } else {
    base = Math.min(14, base);
    var patterns = table[Math.pow(10, base)];
    if (!patterns) {
      return goog.i18n.NumberFormat.NULL_UNIT_;
    }

    var pattern = patterns[plurality];
    if (!pattern || pattern == '0') {
      return goog.i18n.NumberFormat.NULL_UNIT_;
    }

    var parts = /([^0]*)(0+)(.*)/.exec(pattern);
    if (!parts) {
      return goog.i18n.NumberFormat.NULL_UNIT_;
    }

    return {
      prefix: parts[1],
      suffix: parts[3],
      divisorBase: base - (parts[2].length - 1)
    };
  }
};


/**
 * Get the compact unit divisor, accounting for rounding of the quantity.
 *
 * @param {number} formattingNumber The number to base the formatting on. The
 *     unit will be calculated from this number.
 * @param {number} pluralityNumber The number to use for calculating the
 *     plurality.
 * @return {!goog.i18n.NumberFormat.CompactNumberUnit} The unit after rounding.
 * @private
 */
goog.i18n.NumberFormat.prototype.getUnitAfterRounding_ =
    function(formattingNumber, pluralityNumber) {
  if (this.compactStyle_ == goog.i18n.NumberFormat.CompactStyle.NONE) {
    return goog.i18n.NumberFormat.NULL_UNIT_;
  }

  formattingNumber = Math.abs(formattingNumber);
  pluralityNumber = Math.abs(pluralityNumber);

  var initialPlurality = this.pluralForm_(formattingNumber);
  // Compute the exponent from the formattingNumber, to compute the unit.
  var base = formattingNumber <= 1 ? 0 : this.intLog10_(formattingNumber);
  var initialDivisor = this.getUnitFor_(base, initialPlurality).divisorBase;
  // Round both numbers based on the unit used.
  var pluralityAttempt = pluralityNumber / Math.pow(10, initialDivisor);
  var pluralityRounded = this.roundNumber_(pluralityAttempt);
  var formattingAttempt = formattingNumber / Math.pow(10, initialDivisor);
  var formattingRounded = this.roundNumber_(formattingAttempt);
  // Compute the plurality of the pluralityNumber when formatted using the name
  // units as the formattingNumber.
  var finalPlurality =
      this.pluralForm_(pluralityRounded.intValue + pluralityRounded.fracValue);
  // Get the final unit, using the rounded formatting number to get the correct
  // unit, and the plurality computed from the pluralityNumber.
  return this.getUnitFor_(
      initialDivisor + this.intLog10_(formattingRounded.intValue),
      finalPlurality);
};


/**
 * Get the integer base 10 logarithm of a number.
 *
 * @param {number} number The number to log.
 * @return {number} The lowest integer n such that 10^n >= number.
 * @private
 */
goog.i18n.NumberFormat.prototype.intLog10_ = function(number) {
  // Turns out Math.log(1000000)/Math.LN10 is strictly less than 6.
  var i = 0;
  while ((number /= 10) >= 1) i++;
  return i;
};


/**
 * Round to a certain number of significant digits.
 *
 * @param {number} number The number to round.
 * @param {number} significantDigits The number of significant digits
 *     to round to.
 * @param {number} scale Treat number as fixed point times 10^scale.
 * @return {number} The rounded number.
 * @private
 */
goog.i18n.NumberFormat.prototype.roundToSignificantDigits_ =
    function(number, significantDigits, scale) {
  if (!number)
    return number;

  var digits = this.intLog10_(number);
  var magnitude = significantDigits - digits - 1;

  // Only round fraction, not (potentially shifted) integers.
  if (magnitude < -scale) {
    var point = Math.pow(10, scale);
    return Math.round(number / point) * point;
  }

  var power = Math.pow(10, magnitude);
  var shifted = Math.round(number * power);
  return shifted / power;
};


/**
 * Get the plural form of a number.
 * @param {number} quantity The quantity to find plurality of.
 * @return {string} One of 'zero', 'one', 'two', 'few', 'many', 'other'.
 * @private
 */
goog.i18n.NumberFormat.prototype.pluralForm_ = function(quantity) {
  /* TODO: Implement */
  return 'other';
};


/**
 * Checks if the currency symbol comes before the value ($12) or after (12$)
 * Handy for applications that need to have separate UI fields for the currency
 * value and symbol, especially for input: Price: [USD] [123.45]
 * The currency symbol might be a combo box, or a label.
 *
 * @return {boolean} true if currency is before value.
 */
goog.i18n.NumberFormat.prototype.isCurrencyCodeBeforeValue = function() {
  var posCurrSymbol = this.pattern_.indexOf('\u00A4'); // '¤' Currency sign
  var posPound = this.pattern_.indexOf('#');
  var posZero = this.pattern_.indexOf('0');

  // posCurrValue is the first '#' or '0' found.
  // If none of them is found (not possible, but still),
  // the result is true (postCurrSymbol < MAX_VALUE)
  // That is OK, matches the en_US and ROOT locales.
  var posCurrValue = Number.MAX_VALUE;
  if (posPound >= 0 && posPound < posCurrValue) {
    posCurrValue = posPound;
  }
  if (posZero >= 0 && posZero < posCurrValue) {
    posCurrValue = posZero;
  }

  // No need to test, it is guaranteed that both these symbols exist.
  // If not, we have bigger problems than this.
  return posCurrSymbol < posCurrValue;
};
