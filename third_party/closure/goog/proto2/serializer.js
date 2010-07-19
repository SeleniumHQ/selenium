// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Base class for all Protocol Buffer 2 serializers.
*
 */

goog.provide('goog.proto2.Serializer');

goog.require('goog.proto2.Descriptor');
goog.require('goog.proto2.FieldDescriptor');
goog.require('goog.proto2.Message');
goog.require('goog.proto2.Util');


/**
 * Abstract base class for PB2 serializers. A serializer is a class which
 * implements the serialization and deserialization of a Protocol Buffer Message
 * to/from a specific format.
 *
 * @constructor
 */
goog.proto2.Serializer = function() {};


/**
 * Serializes a message to the expected format.
 *
 * @param {goog.proto2.Message} message The message to be serialized.
 *
 * @return {Object} The serialized form of the message.
 */
goog.proto2.Serializer.prototype.serialize = goog.abstractMethod;


/**
 * Returns the serialized form of the given value for the given field
 * if the field is a Message or Group and returns the value unchanged
 * otherwise.
 *
 * @param {goog.proto2.FieldDescriptor} field The field from which this
 *     value came.
 *
 * @param {*} value The value of the field.
 *
 * @return {*} The value.
 * @protected
 */
goog.proto2.Serializer.prototype.getSerializedValue = function(field, value) {
  if (field.getFieldType() == goog.proto2.Message.FieldType.MESSAGE ||
      field.getFieldType() == goog.proto2.Message.FieldType.GROUP) {
    return this.serialize(/** @type {goog.proto2.Message} */ (value));
  } else {
    return value;
  }
};


/**
 * Deserializes a message from the expected format.
 *
 * @param {goog.proto2.Descriptor} descriptor The descriptor of the message
 *     to be created.
 * @param {*} data The data of the message.
 *
 * @return {goog.proto2.Message} The message created.
 */
goog.proto2.Serializer.prototype.deserialize = function(descriptor, data) {
  var message = descriptor.createMessageInstance();
  this.deserializeTo(message, data);
  goog.proto2.Util.assert(message instanceof goog.proto2.Message);
  return message;
};


/**
 * Deserializes a message from the expected format and places the
 * data in the message.
 *
 * @param {goog.proto2.Message} message The message in which to
 *     place the information.
 * @param {*} data The data of the message.
 */
goog.proto2.Serializer.prototype.deserializeTo = goog.abstractMethod;


/**
 * Returns the deserialized form of the given value for the given field
 * if the field is a Message or Group and returns the value unchanged
 * otherwise.
 *
 * @param {goog.proto2.FieldDescriptor} field The field from which this
 *     value came.
 *
 * @param {*} value The value of the field.
 *
 * @return {*} The value.
 * @protected
 */
goog.proto2.Serializer.prototype.getDeserializedValue =
  function(field, value) {
  if (field.getFieldType() == goog.proto2.Message.FieldType.MESSAGE ||
      field.getFieldType() == goog.proto2.Message.FieldType.GROUP) {
    return this.deserialize(field.getFieldMessageType(), value);
  } else {
    return value;
  }
};
