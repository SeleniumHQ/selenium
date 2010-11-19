// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Base class for all PB2 lazy deserializer. A lazy deserializer
 *   is a serializer whose deserialization occurs on the fly as data is
 *   requested. In order to use a lazy deserializer, the serialized form
 *   of the data must be an object or array that can be indexed by the tag
 *   number.
 *
 */

goog.provide('goog.proto2.LazyDeserializer');

goog.require('goog.proto2.Serializer');
goog.require('goog.proto2.Util');



/**
 * Base class for all lazy deserializers.
 *
 * @constructor
 * @extends {goog.proto2.Serializer}
 */
goog.proto2.LazyDeserializer = function() {};
goog.inherits(goog.proto2.LazyDeserializer, goog.proto2.Serializer);


/** @inheritDoc */
goog.proto2.LazyDeserializer.prototype.deserialize =
  function(descriptor, data) {
  var message = descriptor.createMessageInstance();
  message.initializeForLazyDeserializer(this, data);
  goog.proto2.Util.assert(message instanceof goog.proto2.Message);
  return message;
};


/** @inheritDoc */
goog.proto2.LazyDeserializer.prototype.deserializeTo = function(message, data) {
  throw new Error('Unimplemented');
};


/**
 * Deserializes a message field from the expected format and places the
 * data in the given message
 *
 * @param {goog.proto2.Message} message The message in which to
 *     place the information.
 * @param {goog.proto2.FieldDescriptor} field The field for which to set the
 *     message value.
 * @param {*} data The serialized data for the field.
 *
 * @return {*} The deserialized data or null for no value found.
 */
goog.proto2.LazyDeserializer.prototype.deserializeField = goog.abstractMethod;
