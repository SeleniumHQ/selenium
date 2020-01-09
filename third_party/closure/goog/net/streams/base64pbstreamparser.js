// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview The default base64-encoded Protobuf stream parser.
 *
 * A composed parser that first applies base64 stream decoding (see
 * {@link goog.net.streams.Base64StreamDecoder}) followed by Protobuf stream
 * parsing (see {@link goog.net.streams.PbStreamParser}).
 */

goog.module('goog.net.streams.Base64PbStreamParser');

var Base64StreamDecoder = goog.require('goog.net.streams.Base64StreamDecoder');
var PbStreamParser = goog.require('goog.net.streams.PbStreamParser');
var StreamParser = goog.require('goog.net.streams.StreamParser');
var asserts = goog.require('goog.asserts');


/**
 * The default base64-encoded Protobuf stream parser.
 *
 * @constructor
 * @struct
 * @implements {StreamParser}
 * @final
 */
var Base64PbStreamParser = function() {
  /**
   * The current error message, if any.
   * @private {?string}
   */
  this.errorMessage_ = null;

  /**
   * The current position in the streamed data.
   * @private {number}
   */
  this.streamPos_ = 0;

  /**
   * Base64 stream decoder
   * @private @const {!Base64StreamDecoder}
   */
  this.base64Decoder_ = new Base64StreamDecoder();

  /**
   * Protobuf raw bytes stream parser
   * @private @const
   */
  this.pbParser_ = new PbStreamParser();
};


/** @override */
Base64PbStreamParser.prototype.isInputValid = function() {
  return this.errorMessage_ === null;
};


/** @override */
Base64PbStreamParser.prototype.getErrorMessage = function() {
  return this.errorMessage_;
};


/**
 * @param {string} input The current input string to be processed
 * @param {string} errorMsg Additional error message
 * @throws {!Error} Throws an error indicating where the stream is broken
 * @private
 */
Base64PbStreamParser.prototype.error_ = function(input, errorMsg) {
  this.errorMessage_ = 'The stream is broken @' + this.streamPos_ +
      '. Error: ' + errorMsg + '. With input:\n' + input;
  throw Error(this.errorMessage_);
};


/** @override */
Base64PbStreamParser.prototype.parse = function(input) {
  asserts.assertString(input);

  if (this.errorMessage_ !== null) {
    this.error_(input, 'stream already broken');
  }

  var result = null;
  try {
    var rawBytes = this.base64Decoder_.decode(input);
    result = (rawBytes === null) ? null : this.pbParser_.parse(rawBytes);
  } catch (e) {
    this.error_(input, e.message);
  }

  this.streamPos_ += input.length;
  return result;
};


exports = Base64PbStreamParser;
