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
 * @fileoverview Numeric base conversion library.  Works for arbitrary bases and
 * arbitrary length numbers.
 *
 * For base-64 conversion use base64.js because it is optimized for the specific
 * conversion to base-64 while this module is generic.  Base-64 is defined here
 * mostly for demonstration purpose.
 *
 * TODO: Make base64 and baseN classes that have common interface.  (Perhaps...)
 */

goog.provide('goog.crypt.baseN');


/**
 * Base-2, i.e. '01'.
 * @type {string}
 */
goog.crypt.baseN.BASE_BINARY = '01';


/**
 * Base-8, i.e. '01234567'.
 * @type {string}
 */
goog.crypt.baseN.BASE_OCTAL = '01234567';


/**
 * Base-10, i.e. '0123456789'.
 * @type {string}
 */
goog.crypt.baseN.BASE_DECIMAL = '0123456789';


/**
 * Base-16 using lower case, i.e. '0123456789abcdef'.
 * @type {string}
 */
goog.crypt.baseN.BASE_LOWERCASE_HEXADECIMAL = '0123456789abcdef';


/**
 * Base-16 using upper case, i.e. '0123456789ABCDEF'.
 * @type {string}
 */
goog.crypt.baseN.BASE_UPPERCASE_HEXADECIMAL = '0123456789ABCDEF';


/**
 * The more-known version of the BASE-64 encoding.  Uses + and / characters.
 * @type {string}
 */
goog.crypt.baseN.BASE_64 =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';


/**
 * URL-safe version of the BASE-64 encoding.
 * @type {string}
 */
goog.crypt.baseN.BASE_64_URL_SAFE =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';


/**
 * Converts a number from one numeric base to another.
 *
 * The bases are represented as strings, which list allowed digits.  Each digit
 * should be unique.  The bases can either be user defined, or any of
 * goog.crypt.baseN.BASE_xxx.
 *
 * The number is in human-readable format, most significant digit first, and is
 * a non-negative integer.  Base designators such as $, 0x, d, b or h (at end)
 * will be interpreted as digits, so avoid them.  Leading zeros will be trimmed.
 *
 * Note: for huge bases the result may be inaccurate because of overflowing
 * 64-bit doubles used by JavaScript for integer calculus.  This may happen
 * if the product of the number of digits in the input and output bases comes
 * close to 10^16, which is VERY unlikely (100M digits in each base), but
 * may be possible in the future unicode world.  (Unicode 3.2 has less than 100K
 * characters.  However, it reserves some more, close to 1M.)
 *
 * @param {string} number The number to convert.
 * @param {string} inputBase The numeric base the number is in (all digits).
 * @param {string} outputBase Requested numeric base.
 * @return {string} The converted number.
 */
goog.crypt.baseN.recodeString = function(number, inputBase, outputBase) {
  if (outputBase == '') {
    throw new Error('Empty output base');
  }

  // Check if number is 0 (special case when we don't want to return '').
  let isZero = true;
  let n = number.length;
  for (let i = 0; i < n; i++) {
    if (number.charAt(i) != inputBase.charAt(0)) {
      isZero = false;
      break;
    }
  }
  if (isZero) {
    return outputBase.charAt(0);
  }

  const numberDigits = goog.crypt.baseN.stringToArray_(number, inputBase);

  const inputBaseSize = inputBase.length;
  const outputBaseSize = outputBase.length;

  // result = 0.
  const result = [];

  // For all digits of number, starting with the most significant ...
  for (let i = numberDigits.length - 1; i >= 0; i--) {
    // result *= number.base.
    let carry = 0;
    const n = result.length;
    for (let j = 0; j < n; j++) {
      let digit = result[j];
      // This may overflow for huge bases.  See function comment.
      digit = digit * inputBaseSize + carry;
      if (digit >= outputBaseSize) {
        const remainder = digit % outputBaseSize;
        carry = (digit - remainder) / outputBaseSize;
        digit = remainder;
      } else {
        carry = 0;
      }
      result[j] = digit;
    }
    while (carry) {
      const remainder = carry % outputBaseSize;
      result.push(remainder);
      carry = (carry - remainder) / outputBaseSize;
    }

    // result += number[i].
    carry = numberDigits[i];
    let j = 0;
    while (carry) {
      if (j >= result.length) {
        // Extend result with a leading zero which will be overwritten below.
        result.push(0);
      }
      let digit = result[j];
      digit += carry;
      if (digit >= outputBaseSize) {
        const remainder = digit % outputBaseSize;
        carry = (digit - remainder) / outputBaseSize;
        digit = remainder;
      } else {
        carry = 0;
      }
      result[j] = digit;
      j++;
    }
  }

  return goog.crypt.baseN.arrayToString_(result, outputBase);
};


/**
 * Converts a string representation of a number to an array of digit values.
 *
 * More precisely, the digit values are indices into the number base, which
 * is represented as a string, which can either be user defined or one of the
 * BASE_xxx constants.
 *
 * Throws an Error if the number contains a digit not found in the base.
 *
 * @param {string} number The string to convert, most significant digit first.
 * @param {string} base Digits in the base.
 * @return {!Array<number>} Array of digit values, least significant digit
 *     first.
 * @private
 */
goog.crypt.baseN.stringToArray_ = function(number, base) {
  const index = {};
  const n = base.length;
  for (let i = 0; i < n; i++) {
    index[base.charAt(i)] = i;
  }
  const result = [];
  for (let i = number.length - 1; i >= 0; i--) {
    const character = number.charAt(i);
    const digit = index[character];
    if (typeof digit == 'undefined') {
      throw new Error(
          'Number ' + number + ' contains a character not found in base ' +
          base + ', which is ' + character);
    }
    result.push(digit);
  }
  return result;
};


/**
 * Converts an array representation of a number to a string.
 *
 * More precisely, the elements of the input array are indices into the base,
 * which is represented as a string, which can either be user defined or one of
 * the BASE_xxx constants.
 *
 * Throws an Error if the number contains a digit which is outside the range
 * 0 ... base.length - 1.
 *
 * @param {Array<number>} number Array of digit values, least significant
 *     first.
 * @param {string} base Digits in the base.
 * @return {string} Number as a string, most significant digit first.
 * @private
 */
goog.crypt.baseN.arrayToString_ = function(number, base) {
  const n = number.length;
  const chars = [];
  const baseSize = base.length;
  for (let i = n - 1; i >= 0; i--) {
    const digit = number[i];
    if (digit >= baseSize || digit < 0) {
      throw new Error(
          'Number ' + number + ' contains an invalid digit: ' + digit);
    }
    chars.push(base.charAt(digit));
  }
  return chars.join('');
};
