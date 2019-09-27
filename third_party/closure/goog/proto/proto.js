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
 * @fileoverview Protocol buffer serializer.
 * @author arv@google.com (Erik Arvidsson)
 */

goog.provide('goog.proto');


goog.require('goog.proto.Serializer');


/**
 * Instance of the serializer object.
 * @type {goog.proto.Serializer}
 * @private
 */
goog.proto.serializer_ = null;


/**
 * Serializes an object or a value to a protocol buffer string.
 * @param {Object} object The object to serialize.
 * @return {string} The serialized protocol buffer string.
 */
goog.proto.serialize = function(object) {
  if (!goog.proto.serializer_) {
    goog.proto.serializer_ = new goog.proto.Serializer;
  }
  return goog.proto.serializer_.serialize(object);
};
