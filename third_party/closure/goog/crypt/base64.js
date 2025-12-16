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
 * @fileoverview Base64 en/decoding. Not much to say here except that we
 * work with decoded values in arrays of bytes. By "byte" I mean a number
 * in [0, 255].
 */

goog.provide('goog.crypt.base64');

goog.require('goog.asserts');
goog.require('goog.crypt');
goog.require('goog.string');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');

/**
 * Default alphabet, shared between alphabets. Only 62 characters.
 * @private {string}
 */
goog.crypt.base64.DEFAULT_ALPHABET_COMMON_ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'abcdefghijklmnopqrstuvwxyz' +
    '0123456789';


/**
 * Alphabet characters for Alphabet.DEFAULT encoding.
 * For characters without padding, please consider using
 * `goog.crypt.baseN.BASE_64` instead.
 *
 * @type {string}
 */
goog.crypt.base64.ENCODED_VALS =
    goog.crypt.base64.DEFAULT_ALPHABET_COMMON_ + '+/=';


/**
 * Alphabet characters for Alphabet.WEBSAFE_DOT_PADDING encoding.
 * The dot padding is no Internet Standard, according to RFC 4686.
 * https://tools.ietf.org/html/rfc4648
 * For characters without padding, please consider using
 * `goog.crypt.baseN.BASE_64_URL_SAFE` instead.
 *
 * @type {string}
 */
goog.crypt.base64.ENCODED_VALS_WEBSAFE =
    goog.crypt.base64.DEFAULT_ALPHABET_COMMON_ + '-_.';


/**
 * Alphabets for Base64 encoding
 * Alphabets with no padding character are for encoding without padding.
 * About the alphabets, please refer to RFC 4686.
 * https://tools.ietf.org/html/rfc4648
 * @enum {number}
 */
goog.crypt.base64.Alphabet = {
  DEFAULT: 0,
  NO_PADDING: 1,
  WEBSAFE: 2,
  WEBSAFE_DOT_PADDING: 3,
  WEBSAFE_NO_PADDING: 4,
};


/**
 * Padding chars for Base64 encoding
 * @const {string}
 * @private
 */
goog.crypt.base64.paddingChars_ = '=.';


/**
 * Check if a character is a padding character
 *
 * @param {string} char
 * @return {boolean}
 * @private
 */
goog.crypt.base64.isPadding_ = function(char) {
  return goog.string.contains(goog.crypt.base64.paddingChars_, char);
};


// Static lookup maps, lazily populated by init_()

/**
 * For each `Alphabet`, maps from bytes to characters.
 *
 * @see https://jsperf.com/char-lookups
 * @type {!Object<!goog.crypt.base64.Alphabet, !Array<string>>}
 * @private
 */
goog.crypt.base64.byteToCharMaps_ = {};

/**
 * Maps characters to bytes.
 *
 * This map is used for all alphabets since, across alphabets, common chars
 * always map to the same byte.
 *
 * `null` indicates `init` has not yet been called.
 *
 * @type {?Object<string, number>}
 * @private
 */
goog.crypt.base64.charToByteMap_ = null;


/**
 * White list of implementations with known-good native atob and btoa functions.
 * Listing these explicitly (via the ASSUME_* wrappers) benefits dead-code
 * removal in per-browser compilations.
 * @private {boolean}
 */
goog.crypt.base64.ASSUME_NATIVE_SUPPORT_ = goog.userAgent.GECKO ||
    (goog.userAgent.WEBKIT && !goog.userAgent.product.SAFARI) ||
    goog.userAgent.OPERA;


/**
 * Does this browser have a working btoa function?
 * @private {boolean}
 */
goog.crypt.base64.HAS_NATIVE_ENCODE_ =
    goog.crypt.base64.ASSUME_NATIVE_SUPPORT_ ||
    typeof(goog.global.btoa) == 'function';


/**
 * Does this browser have a working atob function?
 * We blacklist known-bad implementations:
 *  - IE (10+) added atob() but it does not tolerate whitespace on the input.
 * @private {boolean}
 */
goog.crypt.base64.HAS_NATIVE_DECODE_ =
    goog.crypt.base64.ASSUME_NATIVE_SUPPORT_ ||
    (!goog.userAgent.product.SAFARI && !goog.userAgent.IE &&
     typeof(goog.global.atob) == 'function');


/**
 * Base64-encode an array of bytes.
 *
 * @param {Array<number>|Uint8Array} input An array of bytes (numbers with
 *     value in [0, 255]) to encode.
 * @param {!goog.crypt.base64.Alphabet=} alphabet Base 64 alphabet to
 *     use in encoding. Alphabet.DEFAULT is used by default.
 * @return {string} The base64 encoded string.
 */
goog.crypt.base64.encodeByteArray = function(input, alphabet) {
  // Assert avoids runtime dependency on goog.isArrayLike, which helps reduce
  // size of jscompiler output, and which yields slight performance increase.
  goog.asserts.assert(
      goog.isArrayLike(input), 'encodeByteArray takes an array as a parameter');

  if (alphabet === undefined) {
    alphabet = goog.crypt.base64.Alphabet.DEFAULT;
  }

  goog.crypt.base64.init_();

  var byteToCharMap = goog.crypt.base64.byteToCharMaps_[alphabet];

  var output = [];

  for (var i = 0; i < input.length; i += 3) {
    var byte1 = input[i];
    var haveByte2 = i + 1 < input.length;
    var byte2 = haveByte2 ? input[i + 1] : 0;
    var haveByte3 = i + 2 < input.length;
    var byte3 = haveByte3 ? input[i + 2] : 0;

    var outByte1 = byte1 >> 2;
    var outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
    var outByte3 = ((byte2 & 0x0F) << 2) | (byte3 >> 6);
    var outByte4 = byte3 & 0x3F;

    if (!haveByte3) {
      outByte4 = 64;

      if (!haveByte2) {
        outByte3 = 64;
      }
    }

    output.push(
        byteToCharMap[outByte1], byteToCharMap[outByte2],
        byteToCharMap[outByte3] || '', byteToCharMap[outByte4] || '');
  }

  return output.join('');
};


/**
 * Base64-encode a string.
 *
 * @param {string} input A string to encode.
 * @param {!goog.crypt.base64.Alphabet=} alphabet Base 64 alphabet to
 *     use in encoding. Alphabet.DEFAULT is used by default.
 * @return {string} The base64 encoded string.
 */
goog.crypt.base64.encodeString = function(input, alphabet) {
  // Shortcut for browsers that implement
  // a native base64 encoder in the form of "btoa/atob"
  if (goog.crypt.base64.HAS_NATIVE_ENCODE_ && !alphabet) {
    return goog.global.btoa(input);
  }
  return goog.crypt.base64.encodeByteArray(
      goog.crypt.stringToByteArray(input), alphabet);
};


/**
 * Base64-decode a string.
 *
 * @param {string} input Input to decode. Any whitespace is ignored, and the
 *     input maybe encoded with either supported alphabet (or a mix thereof).
 * @param {boolean=} useCustomDecoder True indicates the custom decoder is used,
 *     which supports alternative alphabets. Note that passing false may still
 *     use the custom decoder on browsers without native support.
 * @return {string} string representing the decoded value.
 */
goog.crypt.base64.decodeString = function(input, useCustomDecoder) {
  // Shortcut for browsers that implement
  // a native base64 encoder in the form of "btoa/atob"
  if (goog.crypt.base64.HAS_NATIVE_DECODE_ && !useCustomDecoder) {
    return goog.global.atob(input);
  }
  var output = '';
  function pushByte(b) {
    output += String.fromCharCode(b);
  }

  goog.crypt.base64.decodeStringInternal_(input, pushByte);

  return output;
};


/**
 * Base64-decode a string to an Array of numbers.
 *
 * In base-64 decoding, groups of four characters are converted into three
 * bytes.  If the encoder did not apply padding, the input length may not
 * be a multiple of 4.
 *
 * In this case, the last group will have fewer than 4 characters, and
 * padding will be inferred.  If the group has one or two characters, it decodes
 * to one byte.  If the group has three characters, it decodes to two bytes.
 *
 * @param {string} input Input to decode. Any whitespace is ignored, and the
 *     input maybe encoded with either supported alphabet (or a mix thereof).
 * @param {boolean=} opt_ignored Unused parameter, retained for compatibility.
 * @return {!Array<number>} bytes representing the decoded value.
 */
goog.crypt.base64.decodeStringToByteArray = function(input, opt_ignored) {
  var output = [];
  function pushByte(b) { output.push(b); }

  goog.crypt.base64.decodeStringInternal_(input, pushByte);

  return output;
};


/**
 * Base64-decode a string to a Uint8Array.
 *
 * Note that Uint8Array is not supported on older browsers, e.g. IE < 10.
 * @see http://caniuse.com/uint8array
 *
 * In base-64 decoding, groups of four characters are converted into three
 * bytes.  If the encoder did not apply padding, the input length may not
 * be a multiple of 4.
 *
 * In this case, the last group will have fewer than 4 characters, and
 * padding will be inferred.  If the group has one or two characters, it decodes
 * to one byte.  If the group has three characters, it decodes to two bytes.
 *
 * @param {string} input Input to decode. Any whitespace is ignored, and the
 *     input maybe encoded with either supported alphabet (or a mix thereof).
 * @return {!Uint8Array} bytes representing the decoded value.
 */
goog.crypt.base64.decodeStringToUint8Array = function(input) {
  goog.asserts.assert(
      !goog.userAgent.IE || goog.userAgent.isVersionOrHigher('10'),
      'Browser does not support typed arrays');
  var len = input.length;
  // Approximate the length of the array needed for output.
  // Our method varies according to the format of the input, which we can
  // consider in three categories:
  //   A) well-formed with proper padding
  //   B) well-formed without any padding
  //   C) not-well-formed, either with extra whitespace in the middle or with
  //      extra padding characters.
  //
  //  In the case of (A), (length * 3 / 4) will result in an integer number of
  //  bytes evenly divisible by 3, and we need only subtract bytes according to
  //  the padding observed.
  //
  //  In the case of (B), (length * 3 / 4) will result in a non-integer number
  //  of bytes, or not evenly divisible by 3. (If the result is evenly divisible
  //  by 3, it's well-formed with the proper amount of padding [0 padding]).
  //  This approximation can become exact by rounding down.
  //
  //  In the case of (C), the only way to get the length is to walk the full
  //  length of the string to consider each character. This is handled by
  //  tracking the number of bytes added to the array and using subarray to
  //  trim the array back down to size.
  var approxByteLength = len * 3 / 4;
  if (approxByteLength % 3) {
    // The string isn't complete, either because it didn't include padding, or
    // because it has extra white space.
    // In either case, we won't generate more bytes than are completely encoded,
    // so rounding down is appropriate to have a buffer at least as large as
    // output.
    approxByteLength = Math.floor(approxByteLength);
  } else if (goog.crypt.base64.isPadding_(input[len - 1])) {
    // The string has a round length, and has some padding.
    // Reduce the byte length according to the quantity of padding.
    if (goog.crypt.base64.isPadding_(input[len - 2])) {
      approxByteLength -= 2;
    } else {
      approxByteLength -= 1;
    }
  }
  var output = new Uint8Array(approxByteLength);
  var outLen = 0;
  function pushByte(b) {
    output[outLen++] = b;
  }

  goog.crypt.base64.decodeStringInternal_(input, pushByte);

  // Return a subarray to handle the case that input included extra whitespace
  // or extra padding and approxByteLength was incorrect.
  return output.subarray(0, outLen);
};


/**
 * @param {string} input Input to decode.
 * @param {function(number):void} pushByte result accumulator.
 * @private
 */
goog.crypt.base64.decodeStringInternal_ = function(input, pushByte) {
  goog.crypt.base64.init_();

  var nextCharIndex = 0;
  /**
   * @param {number} default_val Used for end-of-input.
   * @return {number} The next 6-bit value, or the default for end-of-input.
   */
  function getByte(default_val) {
    while (nextCharIndex < input.length) {
      var ch = input.charAt(nextCharIndex++);
      var b = goog.crypt.base64.charToByteMap_[ch];
      if (b != null) {
        return b;  // Common case: decoded the char.
      }
      if (!goog.string.isEmptyOrWhitespace(ch)) {
        throw new Error('Unknown base64 encoding at char: ' + ch);
      }
      // We encountered whitespace: loop around to the next input char.
    }
    return default_val;  // No more input remaining.
  }

  while (true) {
    var byte1 = getByte(-1);
    var byte2 = getByte(0);
    var byte3 = getByte(64);
    var byte4 = getByte(64);

    // The common case is that all four bytes are present, so if we have byte4
    // we can skip over the truncated input special case handling.
    if (byte4 === 64) {
      if (byte1 === -1) {
        return;  // Terminal case: no input left to decode.
      }
      // Here we know an intermediate number of bytes are missing.
      // The defaults for byte2, byte3 and byte4 apply the inferred padding
      // rules per the public API documentation. i.e: 1 byte
      // missing should yield 2 bytes of output, but 2 or 3 missing bytes yield
      // a single byte of output. (Recall that 64 corresponds the padding char).
    }

    var outByte1 = (byte1 << 2) | (byte2 >> 4);
    pushByte(outByte1);

    if (byte3 != 64) {
      var outByte2 = ((byte2 << 4) & 0xF0) | (byte3 >> 2);
      pushByte(outByte2);

      if (byte4 != 64) {
        var outByte3 = ((byte3 << 6) & 0xC0) | byte4;
        pushByte(outByte3);
      }
    }
  }
};


/**
 * Lazy static initialization function. Called before
 * accessing any of the static map variables.
 * @private
 */
goog.crypt.base64.init_ = function() {
  if (goog.crypt.base64.charToByteMap_) {
    return;
  }
  goog.crypt.base64.charToByteMap_ = {};

  // We want quick mappings back and forth, so we precompute encoding maps.

  /** @type {!Array<string>} */
  var commonChars = goog.crypt.base64.DEFAULT_ALPHABET_COMMON_.split('');
  var specialChars = [
    '+/=',  // DEFAULT
    '+/',   // NO_PADDING
    '-_=',  // WEBSAFE
    '-_.',  // WEBSAFE_DOT_PADDING
    '-_',   // WEBSAFE_NO_PADDING
  ];

  for (var i = 0; i < 5; i++) {
    // `i` is each value of the `goog.crypt.base64.Alphabet` enum
    var chars = commonChars.concat(specialChars[i].split(''));

    // Sets byte-to-char map
    goog.crypt.base64
        .byteToCharMaps_[/** @type {!goog.crypt.base64.Alphabet} */ (i)] =
        chars;

    // Sets char-to-byte map
    for (var j = 0; j < chars.length; j++) {
      var char = chars[j];

      var existingByte = goog.crypt.base64.charToByteMap_[char];
      if (existingByte === undefined) {
        goog.crypt.base64.charToByteMap_[char] = j;
      } else {
        goog.asserts.assert(existingByte === j);
      }
    }
  }
};
