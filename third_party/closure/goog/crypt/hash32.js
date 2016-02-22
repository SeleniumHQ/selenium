// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Implementation of 32-bit hashing functions.
 *
 * This is a direct port from the Google Java Hash class
 *
 */

goog.provide('goog.crypt.hash32');

goog.require('goog.crypt');


/**
 * Default seed used during hashing, digits of pie.
 * See SEED32 in http://go/base.hash.java
 * @type {number}
 */
goog.crypt.hash32.SEED32 = 314159265;


/**
 * Arbitrary constant used during hashing.
 * See CONSTANT32 in http://go/base.hash.java
 * @type {number}
 */
goog.crypt.hash32.CONSTANT32 = -1640531527;


/**
 * Hashes a string to a 32-bit value.
 * @param {string} str String to hash.
 * @return {number} 32-bit hash.
 */
goog.crypt.hash32.encodeString = function(str) {
  return goog.crypt.hash32.encodeByteArray(goog.crypt.stringToByteArray(str));
};


/**
 * Hashes a string to a 32-bit value, converting the string to UTF-8 before
 * doing the encoding.
 * @param {string} str String to hash.
 * @return {number} 32-bit hash.
 */
goog.crypt.hash32.encodeStringUtf8 = function(str) {
  return goog.crypt.hash32.encodeByteArray(
      goog.crypt.stringToUtf8ByteArray(str));
};


/**
 * Hashes an integer to a 32-bit value.
 * @param {number} value Number to hash.
 * @return {number} 32-bit hash.
 */
goog.crypt.hash32.encodeInteger = function(value) {
  // TODO(user): Does this make sense in JavaScript with doubles?  Should we
  // force the value to be in the correct range?
  return goog.crypt.hash32.mix32_({
    a: value,
    b: goog.crypt.hash32.CONSTANT32,
    c: goog.crypt.hash32.SEED32
  });
};


/**
 * Hashes a "byte" array to a 32-bit value using the supplied seed.
 * @param {Array<number>} bytes Array of bytes.
 * @param {number=} opt_offset The starting position to use for hash
 * computation.
 * @param {number=} opt_length Number of bytes that are used for hashing.
 * @param {number=} opt_seed The seed.
 * @return {number} 32-bit hash.
 */
goog.crypt.hash32.encodeByteArray = function(
    bytes, opt_offset, opt_length, opt_seed) {
  var offset = opt_offset || 0;
  var length = opt_length || bytes.length;
  var seed = opt_seed || goog.crypt.hash32.SEED32;

  var mix = {
    a: goog.crypt.hash32.CONSTANT32,
    b: goog.crypt.hash32.CONSTANT32,
    c: seed
  };

  var keylen;
  for (keylen = length; keylen >= 12; keylen -= 12, offset += 12) {
    mix.a += goog.crypt.hash32.wordAt_(bytes, offset);
    mix.b += goog.crypt.hash32.wordAt_(bytes, offset + 4);
    mix.c += goog.crypt.hash32.wordAt_(bytes, offset + 8);
    goog.crypt.hash32.mix32_(mix);
  }
  // Hash any remaining bytes
  mix.c += length;
  switch (keylen) {  // deal with rest.  Some cases fall through
    case 11: mix.c += (bytes[offset + 10]) << 24;
    case 10: mix.c += (bytes[offset + 9] & 0xff) << 16;
    case 9 : mix.c += (bytes[offset + 8] & 0xff) << 8;
    // the first byte of c is reserved for the length
    case 8 :
      mix.b += goog.crypt.hash32.wordAt_(bytes, offset + 4);
      mix.a += goog.crypt.hash32.wordAt_(bytes, offset);
      break;
    case 7 : mix.b += (bytes[offset + 6] & 0xff) << 16;
    case 6 : mix.b += (bytes[offset + 5] & 0xff) << 8;
    case 5 : mix.b += (bytes[offset + 4] & 0xff);
    case 4 :
      mix.a += goog.crypt.hash32.wordAt_(bytes, offset);
      break;
    case 3 : mix.a += (bytes[offset + 2] & 0xff) << 16;
    case 2 : mix.a += (bytes[offset + 1] & 0xff) << 8;
    case 1 : mix.a += (bytes[offset + 0] & 0xff);
    // case 0 : nothing left to add
  }
  return goog.crypt.hash32.mix32_(mix);
};


/**
 * Performs an inplace mix of an object with the integer properties (a, b, c)
 * and returns the final value of c.
 * @param {Object} mix Object with properties, a, b, and c.
 * @return {number} The end c-value for the mixing.
 * @private
 */
goog.crypt.hash32.mix32_ = function(mix) {
  var a = mix.a, b = mix.b, c = mix.c;
  a -= b; a -= c; a ^= c >>> 13;
  b -= c; b -= a; b ^= a << 8;
  c -= a; c -= b; c ^= b >>> 13;
  a -= b; a -= c; a ^= c >>> 12;
  b -= c; b -= a; b ^= a << 16;
  c -= a; c -= b; c ^= b >>> 5;
  a -= b; a -= c; a ^= c >>> 3;
  b -= c; b -= a; b ^= a << 10;
  c -= a; c -= b; c ^= b >>> 15;
  mix.a = a; mix.b = b; mix.c = c;
  return c;
};


/**
 * Returns the word at a given offset.  Treating an array of bytes a word at a
 * time is far more efficient than byte-by-byte.
 * @param {Array<number>} bytes Array of bytes.
 * @param {number} offset Offset in the byte array.
 * @return {number} Integer value for the word.
 * @private
 */
goog.crypt.hash32.wordAt_ = function(bytes, offset) {
  var a = goog.crypt.hash32.toSigned_(bytes[offset + 0]);
  var b = goog.crypt.hash32.toSigned_(bytes[offset + 1]);
  var c = goog.crypt.hash32.toSigned_(bytes[offset + 2]);
  var d = goog.crypt.hash32.toSigned_(bytes[offset + 3]);
  return a + (b << 8) + (c << 16) + (d << 24);
};


/**
 * Converts an unsigned "byte" to signed, that is, convert a value in the range
 * (0, 2^8-1) to (-2^7, 2^7-1) in order to be compatible with Java's byte type.
 * @param {number} n Unsigned "byte" value.
 * @return {number} Signed "byte" value.
 * @private
 */
goog.crypt.hash32.toSigned_ = function(n) {
  return n > 127 ? n - 256 : n;
};
