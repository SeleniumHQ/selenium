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

// Copyright 2009 Google Inc. All Rights Reserved

/**
 * @fileoverview Defines an Integer class for representing (potentially)
 * infinite length two's-complement integer values.
 *
 * For the specific case of 64-bit integers, use goog.math.Long, which is more
 * efficient.
 *
 */

goog.provide('goog.math.Integer')


/**
 * Constructs a two's-complement integer an array containing bits of the
 * integer in 32-bit (signed) pieces, given in little-endian order (i.e.,
 * lowest-order bits in the first piece), and the sign of -1 or 0.
 *
 * See the from* functions below for other convenient ways of constructing
 * Integers.
 *
 * The internal representation of an integer is an array of 32-bit signed
 * pieces, along with a sign (0 or -1) that indicates the contents of all the
 * other 32-bit pieces out to infinity.  We use 32-bit pieces because these are
 * the size of integers on which Javascript performs bit-operations.  For
 * operations like addition and multiplication, we split each number into 16-bit
 * pieces, which can easily be multiplied within Javascript's floating-point
 * representation without overflow or change in sign.
 *
 * @constructor
 * @param {Array.<number>} bits Array containing the bits of the number.
 * @param {number} sign The sign of the number: -1 for negative and 0 positive.
 */
goog.math.Integer = function(bits, sign) {
  /**
   * @type {Array.<number>}
   * @private
   */
  this.bits_ = [];

  /**
   * @type {number}
   * @private
   */
  this.sign_ = sign;

  // Copy the 32-bit signed integer values passed in.  We prune out those at the
  // top that equal the sign since they are redundant.
  var top = true;
  for (var i = bits.length - 1; i >= 0; i--) {
    var val = bits[i] | 0;
    if (!top || val != sign) {
      this.bits_[i] = val;
      top = false;
    }
  }
};


// NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
// from* methods on which they depend.


/**
 * A cache of the Integer representations of small integer values.
 * @type {Object}
 * @private
 */
goog.math.Integer.INT_CACHE_ = {};


/**
 * Returns an Integer representing the given (32-bit) integer value.
 * @param {number} value A 32-bit integer value.
 * @return {goog.math.Integer} The corresponding Integer value.
 */
goog.math.Integer.fromInt = function(value) {
  if (-128 <= value && value < 128) {
    var cachedObj = goog.math.Integer.INT_CACHE_[value];
    if (cachedObj) {
      return cachedObj;
    }
  }

  var obj = new goog.math.Integer([value | 0], value < 0 ? -1 : 0);
  if (-128 <= value && value < 128) {
    goog.math.Integer.INT_CACHE_[value] = obj;
  }
  return obj;
};


/**
 * Returns an Integer representing the given value, provided that it is a finite
 * number.  Otherwise, zero is returned.
 * @param {number} value The value in question.
 * @return {goog.math.Integer} The corresponding Integer value.
 */
goog.math.Integer.fromNumber = function(value) {
  if (isNaN(value) || !isFinite(value)) {
    return goog.math.Integer.ZERO;
  } else if (value < 0) {
    return goog.math.Integer.fromNumber(-value).negate();
  } else {
    var bits = [];
    var pow = 1;
    for (var i = 0; value >= pow; i++) {
      bits[i] = (value / pow) | 0;
      pow *= goog.math.Integer.TWO_PWR_32_DBL_;
    }
    return new goog.math.Integer(bits, 0);
  }
};


/**
 * Returns a Integer representing the value that comes by concatenating the
 * given entries, each is assumed to be 32 signed bits, given in little-endian
 * order (lowest order bits in the lowest index), and sign-extending the highest
 * order 32-bit value.
 * @param {Array.<number>} bits The bits of the number, in 32-bit signed pieces,
 *     in little-endian order.
 * @return {goog.math.Integer} The corresponding Integer value.
 */
goog.math.Integer.fromBits = function(bits) {
  var high = bits[bits.length - 1];
  return new goog.math.Integer(bits, high & (1 << 31) ? -1 : 0);
};


/**
 * Returns an Integer representation of the given string, written using the
 * given radix.
 * @param {string} str The textual representation of the Integer.
 * @param {number} opt_radix The radix in which the text is written.
 * @return {goog.math.Integer} The corresponding Integer value.
 */
goog.math.Integer.fromString = function(str, opt_radix) {
  if (str.length == 0) {
    throw Error('number format error: empty string');
  }

  var radix = opt_radix || 10;
  if (radix < 2 || 36 < radix) {
    throw Error('radix out of range: ' + radix);
  }

  if (str.charAt(0) == '-') {
    return goog.math.Integer.fromString(str.substring(1), radix).negate();
  } else if (str.indexOf('-') >= 0) {
    throw Error('number format error: interior "-" character');
  }

  // Do several (8) digits each time through the loop, so as to
  // minimize the calls to the very expensive emulated div.
  var radixToPower = goog.math.Integer.fromNumber(Math.pow(radix, 8));

  var result = goog.math.Integer.ZERO;
  for (var i = 0; i < str.length; i += 8) {
    var size = Math.min(8, str.length - i);
    var value = parseInt(str.substring(i, i + size), radix);
    if (size < 8) {
      var power = goog.math.Integer.fromNumber(Math.pow(radix, size));
      result = result.multiply(power).add(goog.math.Integer.fromNumber(value));
    } else {
      result = result.multiply(radixToPower);
      result = result.add(goog.math.Integer.fromNumber(value));
    }
  }
  return result;
};


/**
 * A number used repeatedly in calculations.  This must appear before the first
 * call to the from* functions below.
 * @type {number}
 * @private
 */
goog.math.Integer.TWO_PWR_32_DBL_ = (1 << 16) * (1 << 16);


/** @type {goog.math.Integer} */
goog.math.Integer.ZERO = goog.math.Integer.fromInt(0);


/** @type {goog.math.Integer} */
goog.math.Integer.ONE = goog.math.Integer.fromInt(1);


/**
 * @type {goog.math.Integer}
 * @private
 */
goog.math.Integer.TWO_PWR_24_ = goog.math.Integer.fromInt(1 << 24);


/**
 * Returns the value, assuming it is a 32-bit integer.
 * @return {number} The corresponding int value.
 */
goog.math.Integer.prototype.toInt = function() {
  return this.bits_.length > 0 ? this.bits_[0] : this.sign_;
};


/** @return {number} The closest floating-point representation to this value. */
goog.math.Integer.prototype.toNumber = function() {
  if (this.isNegative()) {
    return -this.negate().toNumber();
  } else {
    var val = 0;
    var pow = 1;
    for (var i = 0; i < this.bits_.length; i++) {
      val += this.getBitsUnsigned(i) * pow;
      pow *= goog.math.Integer.TWO_PWR_32_DBL_;
    }
    return val;
  }
};


/**
 * @param {number} opt_radix The radix in which the text should be written.
 * @return {string} The textual representation of this value.
 */
goog.math.Integer.prototype.toString = function(opt_radix) {
  var radix = opt_radix || 10;
  if (radix < 2 || 36 < radix) {
    throw Error('radix out of range: ' + radix);
  }

  if (this.isZero()) {
    return '0';
  } else if (this.isNegative()) {
    return '-' + this.negate().toString(radix);
  }

  // Do several (6) digits each time through the loop, so as to
  // minimize the calls to the very expensive emulated div.
  var radixToPower = goog.math.Integer.fromNumber(Math.pow(radix, 6));

  var rem = this;
  var result = '';
  while (true) {
    var remDiv = rem.divide(radixToPower);
    var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
    var digits = intval.toString(radix);

    rem = remDiv;
    if (rem.isZero()) {
      return digits + result;
    } else {
      while (digits.length < 6) {
        digits = '0' + digits;
      }
      result = '' + digits + result;
    }
  }
};


/**
 * Returns the index-th 32-bit (signed) piece of the Integer according to
 * little-endian order (i.e., index 0 contains the smallest bits).
 * @param {number} index The index in question.
 * @return {number} The requested 32-bits as a signed number.
 */
goog.math.Integer.prototype.getBits = function(index) {
  if (index < 0) {
    return 0;  // Allowing this simplifies bit shifting operations below...
  } else if (index < this.bits_.length) {
    return this.bits_[index];
  } else {
    return this.sign_;
  }
};


/**
 * Returns the index-th 32-bit piece as an unsigned number.
 * @param {number} index The index in question.
 * @return {number} The requested 32-bits as an unsigned number.
 */
goog.math.Integer.prototype.getBitsUnsigned = function(index) {
  var val = this.getBits(index);
  return val >= 0 ? val : goog.math.Integer.TWO_PWR_32_DBL_ + val;
};


/** @return {number} The sign bit of this number, -1 or 0. */
goog.math.Integer.prototype.getSign = function() {
  return this.sign_;
};


/** @return {boolean} Whether this value is zero. */
goog.math.Integer.prototype.isZero = function() {
  if (this.sign_ != 0) {
    return false;
  }
  for (var i = 0; i < this.bits_.length; i++) {
    if (this.bits_[i] != 0) {
      return false;
    }
  }
  return true;
};


/** @return {boolean} Whether this value is negative. */
goog.math.Integer.prototype.isNegative = function() {
  return this.sign_ == -1;
};


/** @return {boolean} Whether this value is odd. */
goog.math.Integer.prototype.isOdd = function() {
  return (this.bits_.length == 0) && (this.sign_ == -1) ||
         (this.bits_.length > 0) && ((this.bits_[0] & 1) != 0);
};


/**
 * @param {goog.math.Integer} other Integer to compare against.
 * @return {boolean} Whether this Integer equals the other.
 */
goog.math.Integer.prototype.equals = function(other) {
  if (this.sign_ != other.sign_) {
    return false;
  }
  var len = Math.max(this.bits_.length, other.bits_.length);
  for (var i = 0; i < len; i++) {
    if (this.getBits(i) != other.getBits(i)) {
      return false;
    }
  }
  return true;
};


/**
 * @param {goog.math.Integer} other Integer to compare against.
 * @return {boolean} Whether this Integer does not equal the other.
 */
goog.math.Integer.prototype.notEquals = function(other) {
  return !this.equals(other);
};


/**
 * @param {goog.math.Integer} other Integer to compare against.
 * @return {boolean} Whether this Integer is greater than the other.
 */
goog.math.Integer.prototype.greaterThan = function(other) {
  return this.compare(other) > 0;
};


/**
 * @param {goog.math.Integer} other Integer to compare against.
 * @return {boolean} Whether this Integer is greater than or equal to the other.
 */
goog.math.Integer.prototype.greaterThanOrEqual = function(other) {
  return this.compare(other) >= 0;
};


/**
 * @param {goog.math.Integer} other Integer to compare against.
 * @return {boolean} Whether this Integer is less than the other.
 */
goog.math.Integer.prototype.lessThan = function(other) {
  return this.compare(other) < 0;
};


/**
 * @param {goog.math.Integer} other Integer to compare against.
 * @return {boolean} Whether this Integer is less than or equal to the other.
 */
goog.math.Integer.prototype.lessThanOrEqual = function(other) {
  return this.compare(other) <= 0;
};


/**
 * Compares this Integer with the given one.
 * @param {goog.math.Integer} other Integer to compare against.
 * @return {number} 0 if they are the same, 1 if the this is greater, and -1
 *     if the given one is greater.
 */
goog.math.Integer.prototype.compare = function(other) {
  var diff = this.subtract(other);
  if (diff.isNegative()) {
    return -1;
  } else if (diff.isZero()) {
    return 0;
  } else {
    return +1;
  }
};


/**
 * Returns an integer with only the first numBits bits of this value, sign
 * extended from the final bit.
 * @param {number} numBits The number of bits by which to shift.
 * @return {goog.math.Integer} The shorted integer value.
 */
goog.math.Integer.prototype.shorten = function(numBits) {
  var arr_index = (numBits - 1) >> 5;
  var bit_index = (numBits - 1) % 32;
  var bits = [];
  for (var i = 0; i < arr_index; i++) {
    bits[i] = this.getBits(i);
  }
  var sigBits = bit_index == 31 ? 0xFFFFFFFF : (1 << (bit_index + 1)) - 1;
  var val = this.getBits(arr_index) & sigBits;
  if (val & (1 << bit_index)) {
    val |= 0xFFFFFFFF - sigBits;
    bits[arr_index] = val;
    return new goog.math.Integer(bits, -1);
  } else {
    bits[arr_index] = val;
    return new goog.math.Integer(bits, 0);
  }
};


/** @return {goog.math.Integer} The negation of this value. */
goog.math.Integer.prototype.negate = function() {
  return this.not().add(goog.math.Integer.ONE);
};


/**
 * Returns the sum of this and the given Integer.
 * @param {goog.math.Integer} other The Integer to add to this.
 * @return {goog.math.Integer} The Integer result.
 */
goog.math.Integer.prototype.add = function(other) {
  var len = Math.max(this.bits_.length, other.bits_.length);
  var arr = [];
  var carry = 0;

  for (var i = 0; i <= len; i++) {
    var a1 = this.getBits(i) >>> 16;
    var a0 = this.getBits(i) & 0xFFFF;

    var b1 = other.getBits(i) >>> 16;
    var b0 = other.getBits(i) & 0xFFFF;

    var c0 = carry + a0 + b0;
    var c1 = (c0 >>> 16) + a1 + b1;
    carry = c1 >>> 16;
    c0 &= 0xFFFF;
    c1 &= 0xFFFF;
    arr[i] = (c1 << 16) | c0;
  }
  return goog.math.Integer.fromBits(arr);
};


/**
 * Returns the difference of this and the given Integer.
 * @param {goog.math.Integer} other The Integer to subtract from this.
 * @return {goog.math.Integer} The Integer result.
 */
goog.math.Integer.prototype.subtract = function(other) {
  return this.add(other.negate());
};


/**
 * Returns the product of this and the given Integer.
 * @param {goog.math.Integer} other The Integer to multiply against this.
 * @return {goog.math.Integer} The product of this and the other.
 */
goog.math.Integer.prototype.multiply = function(other) {
  if (this.isZero()) {
    return goog.math.Integer.ZERO;
  } else if (other.isZero()) {
    return goog.math.Integer.ZERO;
  }

  if (this.isNegative()) {
    if (other.isNegative()) {
      return this.negate().multiply(other.negate());
    } else {
      return this.negate().multiply(other).negate();
    }
  } else if (other.isNegative()) {
    return this.multiply(other.negate()).negate();
  }

  // If both numbers are small, use float multiplication
  if (this.lessThan(goog.math.Integer.TWO_PWR_24_) &&
      other.lessThan(goog.math.Integer.TWO_PWR_24_)) {
    return goog.math.Integer.fromNumber(this.toNumber() * other.toNumber());
  }

  // Fill in an array of 16-bit products.
  var len = this.bits_.length + other.bits_.length;
  var arr = [];
  for (var i = 0; i < 2 * len; i++) {
    arr[i] = 0;
  }
  for (var i = 0; i < this.bits_.length; i++) {
    for (var j = 0; j < other.bits_.length; j++) {
      var a1 = this.getBits(i) >>> 16;
      var a0 = this.getBits(i) & 0xFFFF;

      var b1 = other.getBits(j) >>> 16;
      var b0 = other.getBits(j) & 0xFFFF;

      arr[2 * i + 2 * j] += a0 * b0;
      goog.math.Integer.carry16_(arr, 2 * i + 2 * j);
      arr[2 * i + 2 * j + 1] += a1 * b0;
      goog.math.Integer.carry16_(arr, 2 * i + 2 * j + 1);
      arr[2 * i + 2 * j + 1] += a0 * b1;
      goog.math.Integer.carry16_(arr, 2 * i + 2 * j + 1);
      arr[2 * i + 2 * j + 2] += a1 * b1;
      goog.math.Integer.carry16_(arr, 2 * i + 2 * j + 2);
    }
  }

  // Combine the 16-bit values into 32-bit values.
  for (var i = 0; i < len; i++) {
    arr[i] = (arr[2 * i + 1] << 16) | arr[2 * i];
  }
  for (var i = len; i < 2 * len; i++) {
    arr[i] = 0;
  }
  return new goog.math.Integer(arr, 0);
};


/**
 * Carries any overflow from the given index into later entries.
 * @param {Array.<number>} bits Array of 16-bit values in little-endian order.
 * @param {number} index The index in question.
 * @private
 */
goog.math.Integer.carry16_ = function(bits, index) {
  while ((bits[index] & 0xFFFF) != bits[index]) {
    bits[index + 1] += bits[index] >>> 16;
    bits[index] &= 0xFFFF;
  }
};


/**
 * Returns this Integer divided by the given one.
 * @param {goog.math.Integer} other Th Integer to divide this by.
 * @return {goog.math.Integer} This value divided by the given one.
 */
goog.math.Integer.prototype.divide = function(other) {
  if (other.isZero()) {
    throw Error('division by zero');
  } else if (this.isZero()) {
    return goog.math.Integer.ZERO;
  }

  if (this.isNegative()) {
    if (other.isNegative()) {
      return this.negate().divide(other.negate());
    } else {
      return this.negate().divide(other).negate();
    }
  } else if (other.isNegative()) {
    return this.divide(other.negate()).negate();
  }

  // Repeat the following until the remainder is less than other:  find a
  // floating-point that approximates remainder / other *from below*, add this
  // into the result, and subtract it from the remainder.  It is critical that
  // the approximate value is less than or equal to the real value so that the
  // remainder never becomes negative.
  var res = goog.math.Integer.ZERO;
  var rem = this;
  while (rem.greaterThanOrEqual(other)) {
    // Approximate the result of division. This may be a little greater or
    // smaller than the actual value.
    var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

    // We will tweak the approximate result by changing it in the 48-th digit or
    // the smallest non-fractional digit, whichever is larger.
    var log2 = Math.ceil(Math.log(approx) / Math.LN2);
    var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

    // Decrease the approximation until it is smaller than the remainder.  Note
    // that if it is too large, the product overflows and is negative.
    var approxRes = goog.math.Integer.fromNumber(approx);
    var approxRem = approxRes.multiply(other);
    while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
      approx -= delta;
      approxRes = goog.math.Integer.fromNumber(approx);
      approxRem = approxRes.multiply(other);
    }

    // We know the answer can't be zero... and actually, zero would cause
    // infinite recursion since we would make no progress.
    if (approxRes.isZero()) {
      approxRes = goog.math.Integer.ONE;
    }

    res = res.add(approxRes);
    rem = rem.subtract(approxRem);
  }
  return res;
};


/**
 * Returns this Integer modulo the given one.
 * @param {goog.math.Integer} other The Integer by which to mod.
 * @return {goog.math.Integer} This value modulo the given one.
 */
goog.math.Integer.prototype.modulo = function(other) {
  return this.subtract(this.divide(other).multiply(other));
};


/** @return {goog.math.Integer} The bitwise-NOT of this value. */
goog.math.Integer.prototype.not = function() {
  var len = this.bits_.length;
  var arr = [];
  for (var i = 0; i < len; i++) {
    arr[i] = ~this.bits_[i];
  }
  return new goog.math.Integer(arr, ~this.sign_);
};


/**
 * Returns the bitwise-AND of this Integer and the given one.
 * @param {goog.math.Integer} other The Integer to AND with this.
 * @return {goog.math.Integer} The bitwise-AND of this and the other.
 */
goog.math.Integer.prototype.and = function(other) {
  var len = Math.max(this.bits_.length, other.bits_.length);
  var arr = [];
  for (var i = 0; i < len; i++) {
    arr[i] = this.getBits(i) & other.getBits(i);
  }
  return new goog.math.Integer(arr, this.sign_ & other.sign_);
};


/**
 * Returns the bitwise-OR of this Integer and the given one.
 * @param {goog.math.Integer} other The Integer to OR with this.
 * @return {goog.math.Integer} The bitwise-OR of this and the other.
 */
goog.math.Integer.prototype.or = function(other) {
  var len = Math.max(this.bits_.length, other.bits_.length);
  var arr = [];
  for (var i = 0; i < len; i++) {
    arr[i] = this.getBits(i) | other.getBits(i);
  }
  return new goog.math.Integer(arr, this.sign_ | other.sign_);
};


/**
 * Returns the bitwise-XOR of this Integer and the given one.
 * @param {goog.math.Integer} other The Integer to XOR with this.
 * @return {goog.math.Integer} The bitwise-XOR of this and the other.
 */
goog.math.Integer.prototype.xor = function(other) {
  var len = Math.max(this.bits_.length, other.bits_.length);
  var arr = [];
  for (var i = 0; i < len; i++) {
    arr[i] = this.getBits(i) ^ other.getBits(i);
  }
  return new goog.math.Integer(arr, this.sign_ ^ other.sign_);
};


/**
 * Returns this value with bits shifted to the left by the given amount.
 * @param {number} numBits The number of bits by which to shift.
 * @return {goog.math.Integer} This shifted to the left by the given amount.
 */
goog.math.Integer.prototype.shiftLeft = function(numBits) {
  var arr_delta = numBits >> 5;
  var bit_delta = numBits % 32;
  var len = this.bits_.length + arr_delta + (bit_delta > 0 ? 1 : 0);
  var arr = [];
  for (var i = 0; i < len; i++) {
    if (bit_delta > 0) {
      arr[i] = (this.getBits(i - arr_delta) << bit_delta) |
               (this.getBits(i - arr_delta - 1) >>> (32 - bit_delta));
    } else {
      arr[i] = this.getBits(i - arr_delta);
    }
  }
  return new goog.math.Integer(arr, this.sign_);
};


/**
 * Returns this value with bits shifted to the right by the given amount.
 * @param {number} numBits The number of bits by which to shift.
 * @return {goog.math.Integer} This shifted to the right by the given amount.
 */
goog.math.Integer.prototype.shiftRight = function(numBits) {
  var arr_delta = numBits >> 5;
  var bit_delta = numBits % 32;
  var len = this.bits_.length - arr_delta;
  var arr = [];
  for (var i = 0; i < len; i++) {
    if (bit_delta > 0) {
      arr[i] = (this.getBits(i + arr_delta) >>> bit_delta) |
               (this.getBits(i + arr_delta + 1) << (32 - bit_delta));
    } else {
      arr[i] = this.getBits(i + arr_delta);
    }
  }
  return new goog.math.Integer(arr, this.sign_);
};
