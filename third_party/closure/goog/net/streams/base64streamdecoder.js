// Copyright 2016 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A base64 stream decoder.
 *
 * Base64 encoding bytes in the buffer will be decoded and delivered in a batch.
 * - Decodes input string in 4-character groups.
 * - Accepts both normal and websafe characters (see {@link goog.crypt.base64}).
 * - Whitespaces are skipped.
 * - Further input after padding characters are decoded normally. Padding
 *   characters are simply treated as 6 input bits (like other characters),
 *   and has no more semantics meaning to the decoder.
 *
 */

goog.provide('goog.net.streams.Base64StreamDecoder');

goog.require('goog.asserts');
goog.require('goog.crypt.base64');

goog.scope(function() {


/**
 * Base64 stream decoder.
 *
 * @constructor
 * @struct
 * @final
 * @package
 */
goog.net.streams.Base64StreamDecoder = function() {
  /**
   * If the input stream is still valid.
   * @private {boolean}
   */
  this.isInputValid_ = true;

  /**
   * The current position in the streamed data that has been processed, i.e.
   * the position right before {@code leftoverInput_}.
   * @private {number}
   */
  this.streamPos_ = 0;

  /**
   * The leftover characters when grouping input characters into four.
   * @private {string}
   */
  this.leftoverInput_ = '';
};


var Decoder = goog.net.streams.Base64StreamDecoder;


/**
 * Checks if the decoder has aborted due to invalid input.
 *
 * @return {boolean} true if the input is still valid.
 */
Decoder.prototype.isInputValid = function() {
  return this.isInputValid_;
};


/**
 * @param {string} input The current input string to be processed
 * @param {string} errorMsg Additional error message
 * @throws {!Error} Throws an error indicating where the stream is broken
 * @private
 */
Decoder.prototype.error_ = function(input, errorMsg) {
  this.isInputValid_ = false;
  throw Error(
      'The stream is broken @' + this.streamPos_ + '. Error: ' + errorMsg +
      '. With input:\n' + input);
};


/**
 * Decodes the input stream.
 *
 * @param {string} input The next part of input stream
 * @return {?Array<number>} decoded bytes in an array, or null if needs more
 *     input data to decode any new bytes
 * @throws {!Error} Throws an error message if the input is invalid
 */
Decoder.prototype.decode = function(input) {
  goog.asserts.assertString(input);

  if (!this.isInputValid_) {
    this.error_(input, 'stream already broken');
  }

  this.leftoverInput_ += input;

  var groups = Math.floor(this.leftoverInput_.length / 4);
  if (groups == 0) {
    return null;
  }

  try {
    var result = goog.crypt.base64.decodeStringToByteArray(
        this.leftoverInput_.substr(0, groups * 4));
  } catch (e) {
    this.error_(this.leftoverInput_, e.message);
  }

  this.streamPos_ += groups * 4;
  this.leftoverInput_ = this.leftoverInput_.substr(groups * 4);
  return result;
};


});  // goog.scope
