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
 * @fileoverview The default Protobuf stream parser.
 *
 * The default Protobuf parser decodes the input stream (binary) under the
 * following rules:
 * 1. The data stream as a whole represents a valid proto message,
 *    defined as following:
 *
 *    message StreamBody {
 *      repeated bytes messages = 1;
 *      google.rpc.Status status = 2;
 *      repeated bytes padding = 15;
 *    }
 *
 *    Padding are noop messages may be generated as base64 padding (for
 *    browsers) or as a way to keep the connection alive. Its tag-id is
 *    reserved as the maximum value allowed for a single-byte tag-id.
 *
 * 2. The only things that are significant to this parser in the above
 *    definition are the specification of the tag ids and wire types (all fields
 *    having length-delimited wire type). The parser doesn't fail if status
 *    appears more than once, i.e. the validity of StreamBody (other than tag
 *    ids and wire types) is not checked.
 *
 * 3. The wire format looks like:
 *
 *    (<tag-id> <wire-type> <length> <message-bytes>)... EOF
 *
 *    For details of Protobuf wire format see
 *    https://developers.google.com/protocol-buffers/docs/encoding
 *
 *    A message with unknown tag or with length larger than 2^32 - 1 will
 *    invalidate the whole stream.
 *
 * 4. All decoded messages and status in the buffer will be delivered in
 *    a batch (array), with each constructed as {tag-id: opaque-byte-array}.
 *    No-op data, e.g. padding, will be immediately discarded.
 *
 * 5. If a high-level API does not support batch delivery (e.g. grpc), then
 *    a wrapper is expected to deliver individual message separately in order.
 */

goog.provide('goog.net.streams.PbStreamParser');

goog.require('goog.asserts');
goog.require('goog.net.streams.StreamParser');

goog.scope(function() {


/**
 * The default Protobuf stream parser.
 *
 * @constructor
 * @struct
 * @implements {goog.net.streams.StreamParser}
 * @final
 */
goog.net.streams.PbStreamParser = function() {
  /**
   * The current error message, if any.
   * @private {?string}
   */
  this.errorMessage_ = null;

  /**
   * The currently buffered result (parsed messages).
   * @private {!Array<!Object>}
   */
  this.result_ = [];

  /**
   * The current position in the streamed data.
   * @private {number}
   */
  this.streamPos_ = 0;

  /**
   * The current parser state.
   * @private {goog.net.streams.PbStreamParser.State_}
   */
  this.state_ = Parser.State_.INIT;

  /**
   * The tag of the proto message being parsed.
   * @private {number}
   */
  this.tag_ = 0;

  /**
   * The length of the proto message being parsed.
   * @private {number}
   */
  this.length_ = 0;

  /**
   * Count of processed length bytes.
   * @private {number}
   */
  this.countLengthBytes_ = 0;

  /**
   * Raw bytes of the current message. Uses Uint8Array by default. Falls back to
   * native array when Uint8Array is unsupported.
   * @private {?Uint8Array|?Array<number>}
   */
  this.messageBuffer_ = null;

  /**
   * Count of processed message bytes.
   * @private {number}
   */
  this.countMessageBytes_ = 0;
};


var Parser = goog.net.streams.PbStreamParser;


/**
 * The parser state.
 * @private @enum {number}
 */
Parser.State_ = {
  INIT: 0,     // expecting the tag:wire-type byte
  LENGTH: 1,   // expecting more varint bytes of length
  MESSAGE: 2,  // expecting more message bytes
  INVALID: 3
};


/**
 * Tag of padding messages.
 * @private @const {number}
 */
Parser.PADDING_TAG_ = 15;


/**
 * @override
 */
goog.net.streams.PbStreamParser.prototype.isInputValid = function() {
  return this.state_ != Parser.State_.INVALID;
};


/**
 * @override
 */
goog.net.streams.PbStreamParser.prototype.getErrorMessage = function() {
  return this.errorMessage_;
};


/**
 * @param {!Uint8Array|!Array<number>} inputBytes The current input buffer
 * @param {number} pos The position in the current input that triggers the error
 * @param {string} errorMsg Additional error message
 * @throws {!Error} Throws an error indicating where the stream is broken
 * @private
 */
Parser.prototype.error_ = function(inputBytes, pos, errorMsg) {
  this.state_ = Parser.State_.INVALID;
  this.errorMessage_ = 'The stream is broken @' + this.streamPos_ + '/' + pos +
      '. ' +
      'Error: ' + errorMsg + '. ' +
      'With input:\n' + inputBytes;
  throw Error(this.errorMessage_);
};


/**
 * @throws {!Error} Throws an error message if the input is invalid.
 * @override
 */
goog.net.streams.PbStreamParser.prototype.parse = function(input) {
  goog.asserts.assert(input instanceof Array || input instanceof ArrayBuffer);

  var parser = this;
  var inputBytes = (input instanceof Array) ? input : new Uint8Array(input);
  var pos = 0;

  while (pos < inputBytes.length) {
    switch (parser.state_) {
      case Parser.State_.INVALID: {
        parser.error_(inputBytes, pos, 'stream already broken');
        break;
      }
      case Parser.State_.INIT: {
        processTagByte(inputBytes[pos]);
        break;
      }
      case Parser.State_.LENGTH: {
        processLengthByte(inputBytes[pos]);
        break;
      }
      case Parser.State_.MESSAGE: {
        processMessageByte(inputBytes[pos]);
        break;
      }
      default: { throw Error('unexpected parser state: ' + parser.state_); }
    }

    parser.streamPos_++;
    pos++;
  }

  var msgs = parser.result_;
  parser.result_ = [];
  return msgs.length > 0 ? msgs : null;

  /**
   * @param {number} b A tag byte to process
   */
  function processTagByte(b) {
    if (b & 0x80) {
      parser.error_(inputBytes, pos, 'invalid tag');
    }

    var wireType = b & 0x07;
    if (wireType != 2) {
      parser.error_(inputBytes, pos, 'invalid wire type');
    }

    parser.tag_ = b >>> 3;
    if (parser.tag_ != 1 && parser.tag_ != 2 && parser.tag_ != 15) {
      parser.error_(inputBytes, pos, 'unexpected tag');
    }

    parser.state_ = Parser.State_.LENGTH;
    parser.length_ = 0;
    parser.countLengthBytes_ = 0;
  }

  /**
   * @param {number} b A length byte to process
   */
  function processLengthByte(b) {
    parser.countLengthBytes_++;
    if (parser.countLengthBytes_ == 5) {
      if (b & 0xF0) {  // length will not fit in a 32-bit uint
        parser.error_(inputBytes, pos, 'message length too long');
      }
    }
    parser.length_ |= (b & 0x7F) << ((parser.countLengthBytes_ - 1) * 7);

    if (!(b & 0x80)) {  // no more length byte
      parser.state_ = Parser.State_.MESSAGE;
      parser.countMessageBytes_ = 0;
      if (typeof Uint8Array !== 'undefined') {
        parser.messageBuffer_ = new Uint8Array(parser.length_);
      } else {
        parser.messageBuffer_ = new Array(parser.length_);
      }

      if (parser.length_ == 0) {  // empty message
        finishMessage();
      }
    }
  }

  /**
   * @param {number} b A message byte to process
   */
  function processMessageByte(b) {
    parser.messageBuffer_[parser.countMessageBytes_++] = b;
    if (parser.countMessageBytes_ == parser.length_) {
      finishMessage();
    }
  }

  /**
   * Finishes up building the current message and resets parser state
   */
  function finishMessage() {
    if (parser.tag_ < Parser.PADDING_TAG_) {
      var message = {};
      message[parser.tag_] = parser.messageBuffer_;
      parser.result_.push(message);
    }
    parser.state_ = Parser.State_.INIT;
  }
};


});  // goog.scope
