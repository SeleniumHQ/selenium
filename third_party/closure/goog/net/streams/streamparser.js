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
 * @fileoverview the private interface for implementing parsers responsible
 * for decoding the input stream (e.g. an HTTP body) to objects per their
 * specified content-types, e.g. JSON, Protobuf.
 *
 * A default JSON parser is provided,
 *
 * A Protobuf stream parser is also provided.
 */

goog.provide('goog.net.streams.StreamParser');



/**
 * This interface represents a stream parser.
 *
 * @interface
 * @package
 */
goog.net.streams.StreamParser = function() {};


/**
 * Checks if the parser is aborted due to invalid input.
 *
 * @return {boolean} true if the input is still valid.
 */
goog.net.streams.StreamParser.prototype.isInputValid = goog.abstractMethod;


/**
 * Checks the error message.
 *
 * @return {?string} any debug info on the first invalid input, or null if
 *    the input is still valid.
 */
goog.net.streams.StreamParser.prototype.getErrorMessage = goog.abstractMethod;


/**
 * Parse the new input.
 *
 * Note that there is no Parser state to indicate the end of a stream.
 *
 * @param {string|!ArrayBuffer|!Array<number>} input The input data
 * @throws {!Error} if the input is invalid, and the parser will remain invalid
 *    once an error has been thrown.
 * @return {?Array<string|!Object>} any parsed objects (atomic messages)
 *    in an array, or null if more data needs be read to parse any new object.
 */
goog.net.streams.StreamParser.prototype.parse = goog.abstractMethod;
