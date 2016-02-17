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
 * @fileoverview the default JSON stream parser.
 *
 * The default JSON parser decodes the input stream (string) under the
 * following rules:
 * 1. The stream must start with a '[' and an array is assumed, and each
 *     element will be decoded as a JS object and delivered.
 * 2. All JSON elements in the buffer will be decoded and delivered in a batch.
 * 3. If a high-level API does not support batch delivery (e.g. grpc), then
 *    a wrapper is expected to deliver individual elements separately
 *    and in order.
 * 4. The parser is expected to drop any data (without breaking the
 *    specified MIME format) that is not visible to the client: e.g. new lines
 *    for pretty printing; no-op data for keep-alive support.
 * 5. Fail-fast: any invalid content should abort the stream by setting the
 *    state of the parser to "invalid".
 *
 * The parser is a streamed JSON parser and is optimized in such a way
 * that it only scans the message boundary and the actual decoding of JSON
 * strings and construction of JS object are done by JSON.parse (native
 * code).
 */

goog.provide('goog.net.streams.JsonStreamParser');

goog.require('goog.asserts');
goog.require('goog.json');
goog.require('goog.net.streams.StreamParser');

goog.scope(function() {



/**
 * The default JSON stream parser.
 *
 * @constructor
 * @struct
 * @implements {goog.net.streams.StreamParser}
 * @final
 * @package
 */
goog.net.streams.JsonStreamParser = function() {
  /**
   * The current error message, if any.
   * @private {?string}
   */
  this.errorMessage_ = null;

  /**
   * The currently buffered result (parsed JSON objects).
   * @private {!Array<!Object>}
   */
  this.result_ = [];

  /**
   * The currently buffered input.
   * @private {string}
   */
  this.buffer_ = '';

  /**
   * The current stack.
   * @private {!Array<!Parser.State_>}
   */
  this.stack_ = [];

  /**
   * The current depth of the nested JSON structure.
   * @private {number}
   */
  this.depth_ = 0;

  /**
   * The current position in the streamed data.
   * @private {number}
   */
  this.pos_ = 0;

  /**
   * The current state of whether the parser is decoding a '\' escaped string.
   * @private {boolean}
   */
  this.slashed_ = false;

  /**
   * The current unicode char count. 0 means no unicode, 1-4 otherwise.
   * @private {number}
   */
  this.unicodeCount_ = 0;

  /**
   * The regexp for parsing string input.
   * @private {!RegExp}
   */
  this.stringInputPattern_ = /[\\"]/g;

  /**
   * The current stream state.
   * @private {goog.net.streams.JsonStreamParser.StreamState_}
   */
  this.streamState_ = Parser.StreamState_.INIT;

  /**
   * The current parser state.
   * @private {goog.net.streams.JsonStreamParser.State_}
   */
  this.state_ = Parser.State_.INIT;
};

var Parser = goog.net.streams.JsonStreamParser;


/**
 * The stream state.
 * @private @enum {number}
 */
Parser.StreamState_ = {
  INIT: 0,
  ARRAY_OPEN: 1,
  ARRAY_END: 2,
  INVALID: 3
};


/**
 * The parser state.
 * @private @enum {number}
 */
Parser.State_ = {
  INIT: 0,
  VALUE: 1,
  OBJECT_OPEN: 2,
  OBJECT_END: 3,
  ARRAY_OPEN: 4,
  ARRAY_END: 5,
  STRING: 6,
  KEY_START: 7,
  KEY_END: 8,
  TRUE1: 9,  // T and expecting RUE ...
  TRUE2: 10,
  TRUE3: 11,
  FALSE1: 12,  // F and expecting ALSE ...
  FALSE2: 13,
  FALSE3: 14,
  FALSE4: 15,
  NULL1: 16,  // N and expecting ULL ...
  NULL2: 17,
  NULL3: 18,
  NUM_DECIMAL_POINT: 19,
  NUM_DIGIT: 20
};


/**
 * @override
 */
Parser.prototype.isInputValid = function() {
  return this.streamState_ != Parser.StreamState_.INVALID;
};


/**
 * @override
 */
Parser.prototype.getErrorMessage = function() {
  return this.errorMessage_;
};


/**
 * @param {string|!ArrayBuffer} input The current input string (always)
 * @param {number} pos The position in the current input that triggers the error
 * @throws {Error} Throws an error message indicating where
 *     the stream is broken.
 * @private
 */
Parser.prototype.error_ = function(input, pos) {
  this.errorMessage_ = 'The stream is broken @' + this.pos_ + '/' + pos +
      '. With input:\n' + input;
  throw Error(this.errorMessage_);
};


/**
 * @throws {Error} Throws an error message if the input is invalid.
 * @override
 */
Parser.prototype.parse = function(input) {
  goog.asserts.assertString(input);

  // captures
  var parser = this;
  var stack = parser.stack_;
  /** @type {!Array<!Object>} */
  var result = parser.result_;
  var pattern = parser.stringInputPattern_;
  var State = Parser.State_;  // enums

  var num = input.length;

  var streamStart = 0;

  var msgStart = -1;

  var i = 0;

  while (i < num) {
    switch (parser.streamState_) {
      case Parser.StreamState_.INVALID:
        parser.error_(input, i);
        return null;

      case Parser.StreamState_.ARRAY_END:
        if (readMore()) {
          parser.error_(input, i);
        }
        return null;

      case Parser.StreamState_.INIT:
        if (readMore()) {
          var current = input[i++];
          parser.pos_++;

          if (current === '[') {
            parser.streamState_ = Parser.StreamState_.ARRAY_OPEN;

            streamStart = i;
            parser.state_ = State.ARRAY_OPEN;

            continue;
          } else {
            parser.error_(input, i);
          }
        }
        return null;

      case Parser.StreamState_.ARRAY_OPEN:
        parseData();

        if (parser.depth_ === 0 && parser.state_ == State.ARRAY_END) {
          parser.streamState_ = Parser.StreamState_.ARRAY_END;
          parser.buffer_ = '';  // TODO(wenboz): discard anything after ']'?
        } else {
          if (msgStart === -1) {
            parser.buffer_ += input.substring(streamStart);
          } else {
            parser.buffer_ = input.substring(msgStart);
          }
        }

        if (parser.result_.length > 0) {
          var msgs = parser.result_;
          parser.result_ = [];
          return msgs;
        }
        return null;
    }
  }

  /**
   * @return {boolean} true if the parser needs parse more data
   */
  function readMore() {
    skipWhitespace();
    return i < num;
  }

  /**
   * Skip as many whitespaces as possible, and increments current index of
   * stream to next available char.
   */
  function skipWhitespace() {
    while (i < input.length) {
      if (isWhitespace(input[i])) {
        i++;
        parser.pos_++;
        continue;
      }
      break;
    }
  }

  /**
   * TODO(wenboz): 0xa0 for IE?
   *
   * @param {string} c The char to check
   * @return {boolean} true if a char is a whitespace
   */
  function isWhitespace(c) {
    return c == '\r' || c == '\n' || c == ' ' || c == '\t';
  }

  /**
   * Parse the input JSON elements with a streamed state machine.
   */
  function parseData() {
    var current;

    while (true) {
      current = input[i++];
      if (!current) {
        break;
      }

      parser.pos_++;

      switch (parser.state_) {
        case State.INIT:
          if (current === '{') {
            parser.state_ = State.OBJECT_OPEN;
          } else if (current === '[') {
            parser.state_ = State.ARRAY_OPEN;
          } else if (!isWhitespace(current)) {
            parser.error_(input, i);
          }
          continue;

        case State.KEY_START:
        case State.OBJECT_OPEN:
          if (isWhitespace(current)) {
            continue;
          }
          if (parser.state_ === State.KEY_START) {
            stack.push(State.KEY_END);
          } else {
            if (current === '}') {
              addMessage({});
              parser.state_ = nextState();
              continue;
            } else {
              stack.push(State.OBJECT_END);
            }
          }
          if (current === '"') {
            parser.state_ = State.STRING;
          } else {
            parser.error_(input, i);
          }
          continue;


        case State.KEY_END:
        case State.OBJECT_END:
          if (isWhitespace(current)) {
            continue;
          }
          if (current === ':') {
            if (parser.state_ === State.OBJECT_END) {
              stack.push(State.OBJECT_END);
              parser.depth_++;
            }
            parser.state_ = State.VALUE;
          } else if (current === '}') {
            parser.depth_--;
            addMessage();
            parser.state_ = nextState();
          } else if (current === ',') {
            if (parser.state_ === State.OBJECT_END) {
              stack.push(State.OBJECT_END);
            }
            parser.state_ = State.KEY_START;
          } else {
            parser.error_(input, i);
          }
          continue;

        case State.ARRAY_OPEN:
        case State.VALUE:
          if (isWhitespace(current)) {
            continue;
          }
          if (parser.state_ === State.ARRAY_OPEN) {
            parser.depth_++;
            parser.state_ = State.VALUE;
            if (current === ']') {
              parser.depth_--;
              if (parser.depth_ === 0) {
                parser.state_ = State.ARRAY_END;
                break;
              }

              addMessage([]);

              parser.state_ = nextState();
              continue;
            } else {
              stack.push(State.ARRAY_END);
            }
          }
          if (current === '"')
            parser.state_ = State.STRING;
          else if (current === '{')
            parser.state_ = State.OBJECT_OPEN;
          else if (current === '[')
            parser.state_ = State.ARRAY_OPEN;
          else if (current === 't')
            parser.state_ = State.TRUE1;
          else if (current === 'f')
            parser.state_ = State.FALSE1;
          else if (current === 'n')
            parser.state_ = State.NULL1;
          else if (current === '-') {
            // continue
          } else if ('0123456789'.indexOf(current) !== -1) {
            parser.state_ = State.NUM_DIGIT;
          } else {
            parser.error_(input, i);
          }
          continue;

        case State.ARRAY_END:
          if (current === ',') {
            stack.push(State.ARRAY_END);
            parser.state_ = State.VALUE;

            if (parser.depth_ === 1) {
              msgStart = i;  // skip ',', including a leading one
            }
          } else if (current === ']') {
            parser.depth_--;
            if (parser.depth_ === 0) break;

            addMessage();
            parser.state_ = nextState();
          } else if (isWhitespace(current)) {
            continue;
          } else {
            parser.error_(input, i);
          }
          continue;

        case State.STRING:
          var start = i - 1;
          var old = i;

          STRING_LOOP: while (true) {
            while (parser.unicodeCount_ > 0) {
              current = input[i++];
              if (parser.unicodeCount_ === 4) {
                parser.unicodeCount_ = 0;
                start = i - 1;
              } else {
                parser.unicodeCount_++;
              }
              if (!current) {
                break STRING_LOOP;
              }
            }

            if (current === '"' && !parser.slashed_) {
              parser.state_ = nextState();
              break;
            }
            if (current === '\\' && !parser.slashed_) {
              parser.slashed_ = true;
              current = input[i++];
              if (!current) {
                break;
              }
            }
            if (parser.slashed_) {
              parser.slashed_ = false;
              if (current === 'u') {
                parser.unicodeCount_ = 1;
              }
              current = input[i++];
              start = i - 1;
              if (!current) {
                break;
              } else {
                continue;
              }
            }

            pattern.lastIndex = i;
            var patternResult = pattern.exec(input);
            if (!patternResult) {
              i = input.length + 1;
              break;
            }
            i = patternResult.index + 1;
            current = input[patternResult.index];
            if (!current) {
              break;
            }
          }

          parser.pos_ += (i - old);

          continue;

        case State.TRUE1:
          if (!current) {
            continue;
          }
          if (current === 'r') {
            parser.state_ = State.TRUE2;
          } else {
            parser.error_(input, i);
          }
          continue;

        case State.TRUE2:
          if (!current) {
            continue;
          }
          if (current === 'u') {
            parser.state_ = State.TRUE3;
          } else {
            parser.error_(input, i);
          }
          continue;

        case State.TRUE3:
          if (!current) {
            continue;
          }
          if (current === 'e') {
            parser.state_ = nextState();
          } else {
            parser.error_(input, i);
          }
          continue;

        case State.FALSE1:
          if (!current) {
            continue;
          }
          if (current === 'a') {
            parser.state_ = State.FALSE2;
          } else {
            parser.error_(input, i);
          }
          continue;

        case State.FALSE2:
          if (!current) {
            continue;
          }
          if (current === 'l') {
            parser.state_ = State.FALSE3;
          } else {
            parser.error_(input, i);
          }
          continue;

        case State.FALSE3:
          if (!current) {
            continue;
          }
          if (current === 's') {
            parser.state_ = State.FALSE4;
          } else {
            parser.error_(input, i);
          }
          continue;

        case State.FALSE4:
          if (!current) {
            continue;
          }
          if (current === 'e') {
            parser.state_ = nextState();
          } else {
            parser.error_(input, i);
          }
          continue;

        case State.NULL1:
          if (!current) {
            continue;
          }
          if (current === 'u') {
            parser.state_ = State.NULL2;
          } else {
            parser.error_(input, i);
          }
          continue;

        case State.NULL2:
          if (!current) {
            continue;
          }
          if (current === 'l') {
            parser.state_ = State.NULL3;
          } else {
            parser.error_(input, i);
          }
          continue;

        case State.NULL3:
          if (!current) {
            continue;
          }
          if (current === 'l') {
            parser.state_ = nextState();
          } else {
            parser.error_(input, i);
          }
          continue;

        case State.NUM_DECIMAL_POINT:
          if (current === '.') {
            parser.state_ = State.NUM_DIGIT;
          } else {
            parser.error_(input, i);
          }
          continue;

        case State.NUM_DIGIT:  // no need for a full validation here
          if ('0123456789.eE+-'.indexOf(current) !== -1) {
            continue;
          } else {
            i--;
            parser.pos_--;
            parser.state_ = nextState();
          }
          continue;

        default:
          parser.error_(input, i);
      }
    }
  }

  /**
   * @return {!goog.net.streams.JsonStreamParser.State_} the next state
   *    from the stack, or the general VALUE state.
   */
  function nextState() {
    var state = stack.pop();
    if (state != null) {
      return state;
    } else {
      return State.VALUE;
    }
  }

  /**
   * @param {(!Object|!string)=} opt_data The message to add
   */
  function addMessage(opt_data) {
    if (parser.depth_ > 1) {
      return;
    }

    // '' not possible
    if (!opt_data) {
      if (msgStart === -1) {
        opt_data = parser.buffer_ + input.substring(streamStart, i);
      } else {
        opt_data = input.substring(msgStart, i);
      }
    }
    if (goog.isString(opt_data)) {
      result.push(
          goog.asserts.assertInstanceof(goog.json.parse(opt_data), Object));
    } else {
      result.push(opt_data);
    }
    msgStart = i;
  }

  return null;  // Parser.prototype.parse()
};

});  // goog.scope
