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

goog.require('goog.i18n.NumberFormatSymbols');
goog.require('goog.i18n.currency');



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
  this.maximumFractionDigits_ = 3; // invariant, >= minFractionDigits
  this.minimumFractionDigits_ = 0;
  this.minExponentDigits_ = 0;
  this.useSignForPositiveExponent_ = false;

  this.positivePrefix_ = '';
  this.positiveSuffix_ = '';
  this.negativePrefix_ = '-';
  this.negativeSuffix_ = '';

  // The multiplier for use in percent, per mille, etc.
  this.multiplier_ = 1;
  this.groupingSize_ = 3;
  this.decimalSeparatorAlwaysShown_ = false;
  this.useExponentialNotation_ = false;

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
  CURRENCY: 4
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
 */
goog.i18n.NumberFormat.prototype.setMinimumFractionDigits = function(min) {
  if (min > this.maximumFractionDigits_) {
    throw Error('Min value must be less than max value');
  }
  this.minimumFractionDigits_ = min;
};


/**
 * Sets maximum number of fraction digits.
 * @param {number} max the maximum.
 */
goog.i18n.NumberFormat.prototype.setMaximumFractionDigits = function(max) {
  if (this.minimumFractionDigits_ > max) {
    throw Error('Min value must be less than max value');
  }
  this.maximumFractionDigits_ = max;
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
    default:
      throw Error('Unsupported pattern type.');
  }
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

  return parts.join('');
};


/**
 * Formats a Number in fraction format.
 *
 * @param {number} number Value need to be formated.
 * @param {number} minIntDigits Minimum integer digits.
 * @param {Array} parts This array holds the pieces of formatted string.
 *     This function will add its formatted pieces to the array.
 * @private
 */
goog.i18n.NumberFormat.prototype.subformatFixed_ =
    function(number, minIntDigits, parts) {
  // round the number
  var power = Math.pow(10, this.maximumFractionDigits_);
  var shiftedNumber = Math.round(number * power);
  var intValue, fracValue;
  if (isFinite(shiftedNumber)) {
    intValue = Math.floor(shiftedNumber / power);
    fracValue = Math.floor(shiftedNumber - intValue * power);
  } else {
    intValue = number;
    fracValue = 0;
  }

  var fractionPresent = this.minimumFractionDigits_ > 0 || fracValue > 0;

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
         fracLen > this.minimumFractionDigits_ + 1) {
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

  var exponent = Math.floor(Math.log(number) / Math.log(10));
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
