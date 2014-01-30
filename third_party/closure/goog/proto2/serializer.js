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
 * @define {boolean} Whether to decode and convert symbolic enum values to
 * actual enum values or leave them as strings.
 */
goog.define('goog.proto2.Serializer.DECODE_SYMBOLIC_ENUMS', false);


/**
 * Serializes a message to the expected format.
 *
 * @param {goog.proto2.Message} message The message to be serialized.
 *
 * @return {*} The serialized form of the message.
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
  if (field.isCompositeType()) {
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
 * Returns the deserialized form of the given value for the given field if the
 * field is a Message or Group and returns the value, converted or unchanged,
 * for primitive field types otherwise.
 *
 * @param {goog.proto2.FieldDescriptor} field The field from which this
 *     value came.
 *
 * @param {*} value The value of the field.
 *
 * @return {*} The value.
 * @protected
 */
goog.proto2.Serializer.prototype.getDeserializedValue = function(field, value) {
  // Composite types are deserialized recursively.
  if (field.isCompositeType()) {
    if (value instanceof goog.proto2.Message) {
      return value;
    }

    return this.deserialize(field.getFieldMessageType(), value);
  }

  // Decode enum values.
  if (field.getFieldType() == goog.proto2.FieldDescriptor.FieldType.ENUM) {
    // If it's a string, get enum value by name.
    // NB: In order this feature to work, property renaming should be turned off
    // for the respective enums.
    if (goog.proto2.Serializer.DECODE_SYMBOLIC_ENUMS && goog.isString(value)) {
      // enumType is a regular Javascript enum as defined in field's metadata.
      var enumType = field.getNativeType();
      if (enumType.hasOwnProperty(value)) {
        return enumType[value];
      }
    }
    // Return unknown values as is for backward compatibility.
    return value;
  }

  // Return the raw value if the field does not allow the JSON input to be
  // converted.
  if (!field.deserializationConversionPermitted()) {
    return value;
  }

  // Convert to native type of field.  Return the converted value or fall
  // through to return the raw value.  The JSON encoding of int64 value 123
  // might be either the number 123 or the string "123".  The field native type
  // could be either Number or String (depending on field options in the .proto
  // file).  All four combinations should work correctly.
  var nativeType = field.getNativeType();
  if (nativeType === String) {
    // JSON numbers can be converted to strings.
    if (goog.isNumber(value)) {
      return String(value);
    }
  } else if (nativeType === Number) {
    // JSON strings are sometimes used for large integer numeric values.
    if (goog.isString(value)) {
      // Validate the string.  If the string is not an integral number, we would
      // rather have an assertion or error in the caller than a mysterious NaN
      // value.
      if (/^-?[0-9]+$/.test(value)) {
        return Number(value);
      }
    }
  }

  return value;
};
