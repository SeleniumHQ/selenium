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
 * @fileoverview the default Protobuf stream parser.
 *
 * The default Protobuf parser decodes the input stream (binary) under the
 * following rules:
 * 1. The data stream as a whole represents a valid proto message,
 *    defined as following;
 *
 *    message StreamBody {
 *      repeated bytes message = 1;
 *      google.rpc.Status status = 2;
 *    }
 *
 * 2. The only thing that is significant in the above definition is the
 *    allocation of the two tag ids, to this parser.
 *
 * 3. The wire format looks like (with varint encoding):
 *
 *    1 <length> <message-bytes>  2 <length> <status-bytes> EOF
 *
 * 4. All decoded "messages" in the buffer will be delivered in a batch (array),
 *    with each message constructed as {tag-id: opaque-array-buffer}.
 *
 * 5. If a high-level API does not support batch delivery (e.g. grpc), then
 *    a wrapper is expected to deliver individual "messages" separately
 *    and in order;
 */

goog.provide('goog.net.streams.PbStreamParser');

goog.require('goog.asserts');
goog.require('goog.net.streams.StreamParser');



/**
 * The default Protobuf stream parser.
 *
 * TODO(user); base64 encoded protobufs
 *
 * @constructor
 * @struct
 * @implements {goog.net.streams.StreamParser}
 * @final
 */
goog.net.streams.PbStreamParser = function() {
  // to be implemented
};


/**
 * @override
 */
goog.net.streams.PbStreamParser.prototype.isInputValid = function() {
  return true;
};


/**
 * @override
 */
goog.net.streams.PbStreamParser.prototype.getErrorMessage = function() {
  return null;
};


/**
 * @override
 */
goog.net.streams.PbStreamParser.prototype.parse = function(input) {
  goog.asserts.assertInstanceof(input, ArrayBuffer);

  return null;
};
