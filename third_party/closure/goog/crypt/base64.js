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
 *
 * @author doughtie@google.com (Gavin Doughtie)
 */

goog.provide('goog.crypt.base64');

goog.require('goog.asserts');
goog.require('goog.crypt');
goog.require('goog.string');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');

// Static lookup maps, lazily populated by init_()


/**
 * Maps bytes to characters.
 * @type {Object}
 * @private
 */
goog.crypt.base64.byteToCharMap_ = null;


/**
 * Maps characters to bytes. Used for normal and websafe characters.
 * @type {Object}
 * @private
 */
goog.crypt.base64.charToByteMap_ = null;


/**
 * Maps bytes to websafe characters.
 * @type {Object}
 * @private
 */
goog.crypt.base64.byteToCharMapWebSafe_ = null;


/**
 * Our default alphabet, shared between
 * ENCODED_VALS and ENCODED_VALS_WEBSAFE
 * @type {string}
 */
goog.crypt.base64.ENCODED_VALS_BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'abcdefghijklmnopqrstuvwxyz' +
    '0123456789';


/**
 * Our default alphabet. Value 64 (=) is special; it means "nothing."
 * @type {string}
 */
goog.crypt.base64.ENCODED_VALS = goog.crypt.base64.ENCODED_VALS_BASE + '+/=';


/**
 * Our websafe alphabet.
 * @type {string}
 */
goog.crypt.base64.ENCODED_VALS_WEBSAFE =
    goog.crypt.base64.ENCODED_VALS_BASE + '-_.';


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
 * @param {boolean=} opt_webSafe True indicates we should use the alternative
 *     alphabet, which does not require escaping for use in URLs.
 * @return {string} The base64 encoded string.
 */
goog.crypt.base64.encodeByteArray = function(input, opt_webSafe) {
  // Assert avoids runtime dependency on goog.isArrayLike, which helps reduce
  // size of jscompiler output, and which yields slight performance increase.
  goog.asserts.assert(
      goog.isArrayLike(input), 'encodeByteArray takes an array as a parameter');

  goog.crypt.base64.init_();

  var byteToCharMap = opt_webSafe ? goog.crypt.base64.byteToCharMapWebSafe_ :
                                    goog.crypt.base64.byteToCharMap_;

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
        byteToCharMap[outByte3], byteToCharMap[outByte4]);
  }

  return output.join('');
};


/**
 * Base64-encode a string.
 *
 * @param {string} input A string to encode.
 * @param {boolean=} opt_webSafe True indicates we should use the alternative
 *     alphabet, which does not require escaping for use in URLs.
 * @return {string} The base64 encoded string.
 */
goog.crypt.base64.encodeString = function(input, opt_webSafe) {
  // Shortcut for browsers that implement
  // a native base64 encoder in the form of "btoa/atob"
  if (goog.crypt.base64.HAS_NATIVE_ENCODE_ && !opt_webSafe) {
    return goog.global.btoa(input);
  }
  return goog.crypt.base64.encodeByteArray(
      goog.crypt.stringToByteArray(input), opt_webSafe);
};


/**
 * Base64-decode a string.
 *
 * @param {string} input Input to decode. Any whitespace is ignored, and the
 *     input maybe encoded with either supported alphabet (or a mix thereof).
 * @param {boolean=} opt_webSafe True indicates we should use the alternative
 *     alphabet, which does not require escaping for use in URLs. Note that
 *     passing false may also still allow webSafe input decoding, when the
 *     fallback decoder is used on browsers without native support.
 * @return {string} string representing the decoded value.
 */
goog.crypt.base64.decodeString = function(input, opt_webSafe) {
  // Shortcut for browsers that implement
  // a native base64 encoder in the form of "btoa/atob"
  if (goog.crypt.base64.HAS_NATIVE_DECODE_ && !opt_webSafe) {
    return goog.global.atob(input);
  }
  var output = '';
  function pushByte(b) { output += String.fromCharCode(b); }

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
  var output = new Uint8Array(Math.ceil(input.length * 3 / 4));
  var outLen = 0;
  function pushByte(b) { output[outLen++] = b; }

  goog.crypt.base64.decodeStringInternal_(input, pushByte);

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
        throw Error('Unknown base64 encoding at char: ' + ch);
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
  if (!goog.crypt.base64.byteToCharMap_) {
    goog.crypt.base64.byteToCharMap_ = {};
    goog.crypt.base64.charToByteMap_ = {};
    goog.crypt.base64.byteToCharMapWebSafe_ = {};

    // We want quick mappings back and forth, so we precompute two maps.
    for (var i = 0; i < goog.crypt.base64.ENCODED_VALS.length; i++) {
      goog.crypt.base64.byteToCharMap_[i] =
          goog.crypt.base64.ENCODED_VALS.charAt(i);
      goog.crypt.base64.charToByteMap_[goog.crypt.base64.byteToCharMap_[i]] = i;
      goog.crypt.base64.byteToCharMapWebSafe_[i] =
          goog.crypt.base64.ENCODED_VALS_WEBSAFE.charAt(i);

      // Be forgiving when decoding and correctly decode both encodings.
      if (i >= goog.crypt.base64.ENCODED_VALS_BASE.length) {
        goog.crypt.base64
            .charToByteMap_[goog.crypt.base64.ENCODED_VALS_WEBSAFE.charAt(i)] =
            i;
      }
    }
  }
};
