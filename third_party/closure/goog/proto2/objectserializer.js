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
 * @fileoverview Protocol Buffer 2 Serializer which serializes messages
 *  into anonymous, simplified JSON objects.
 *
 */

goog.provide('goog.proto2.ObjectSerializer');

goog.require('goog.asserts');
goog.require('goog.proto2.FieldDescriptor');
goog.require('goog.proto2.Serializer');
goog.require('goog.string');



/**
 * ObjectSerializer, a serializer which turns Messages into simplified
 * ECMAScript objects.
 *
 * @param {goog.proto2.ObjectSerializer.KeyOption=} opt_keyOption If specified,
 *     which key option to use when serializing/deserializing.
 * @constructor
 * @extends {goog.proto2.Serializer}
 */
goog.proto2.ObjectSerializer = function(opt_keyOption) {
  this.keyOption_ = opt_keyOption;
};
goog.inherits(goog.proto2.ObjectSerializer, goog.proto2.Serializer);


/**
 * An enumeration of the options for how to emit the keys in
 * the generated simplified object.
 *
 * @enum {number}
 */
goog.proto2.ObjectSerializer.KeyOption = {
  /**
   * Use the tag of the field as the key (default)
   */
  TAG: 0,

  /**
   * Use the name of the field as the key. Unknown fields
   * will still use their tags as keys.
   */
  NAME: 1
};


/**
 * Serializes a message to an object.
 *
 * @param {goog.proto2.Message} message The message to be serialized.
 * @return {!Object} The serialized form of the message.
 * @override
 */
goog.proto2.ObjectSerializer.prototype.serialize = function(message) {
  var descriptor = message.getDescriptor();
  var fields = descriptor.getFields();

  var objectValue = {};

  // Add the defined fields, recursively.
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];

    var key = this.keyOption_ == goog.proto2.ObjectSerializer.KeyOption.NAME ?
        field.getName() :
        field.getTag();


    if (message.has(field)) {
      if (field.isRepeated()) {
        var array = [];
        objectValue[key] = array;

        for (var j = 0; j < message.countOf(field); j++) {
          array.push(this.getSerializedValue(field, message.get(field, j)));
        }

      } else {
        objectValue[key] = this.getSerializedValue(field, message.get(field));
      }
    }
  }

  // Add the unknown fields, if any.
  message.forEachUnknown(function(tag, value) { objectValue[tag] = value; });

  return objectValue;
};


/** @override */
goog.proto2.ObjectSerializer.prototype.getDeserializedValue = function(
    field, value) {

  // Gracefully handle the case where a boolean is represented by 0/1.
  // Some serialization libraries, such as GWT, can use this notation.
  if (field.getFieldType() == goog.proto2.FieldDescriptor.FieldType.BOOL &&
      goog.isNumber(value)) {
    return Boolean(value);
  }

  return goog.proto2.ObjectSerializer.base(
      this, 'getDeserializedValue', field, value);
};


/**
 * Deserializes a message from an object and places the
 * data in the message.
 *
 * @param {goog.proto2.Message} message The message in which to
 *     place the information.
 * @param {*} data The data of the message.
 * @override
 */
goog.proto2.ObjectSerializer.prototype.deserializeTo = function(message, data) {
  var descriptor = message.getDescriptor();

  for (var key in data) {
    var field;
    var value = data[key];

    var isNumeric = goog.string.isNumeric(key);

    if (isNumeric) {
      field = descriptor.findFieldByTag(key);
    } else {
      // We must be in Key == NAME mode to lookup by name.
      goog.asserts.assert(
          this.keyOption_ == goog.proto2.ObjectSerializer.KeyOption.NAME);

      field = descriptor.findFieldByName(key);
    }

    if (field) {
      if (field.isRepeated()) {
        goog.asserts.assert(goog.isArray(value));

        for (var j = 0; j < value.length; j++) {
          message.add(field, this.getDeserializedValue(field, value[j]));
        }
      } else {
        goog.asserts.assert(!goog.isArray(value));
        message.set(field, this.getDeserializedValue(field, value));
      }
    } else {
      if (isNumeric) {
        // We have an unknown field.
        message.setUnknown(Number(key), value);
      } else {
        // Named fields must be present.
        goog.asserts.fail('Failed to find field: ' + field);
      }
    }
  }
};
