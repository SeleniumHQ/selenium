// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2008 Google Inc. All Rights Reserved.

/**
 * @fileoverview Protocol Buffer 2 Serializer which serializes messages
 *  into PB-Lite ("JsPbLite") format.
 *
 * PB-Lite format is an array where each index corresponds to the associated tag
 * number. For example, a message like so:
 *
 * message Foo {
 *   optional int bar = 1;
 *   optional int baz = 2;
 *   optional int bop = 4;
 * }
 *
 * would be represented as such:
 *
 * [, (bar data), (baz data), (nothing), (bop data)]
 *
 * Note that since the array index is used to represent the tag number, sparsely
 * populated messages with tag numbers that are not continuous (and/or are very
 * large) will have many (empty) spots and thus, are inefficient.
 *
 *
 */

goog.provide('goog.proto2.PbLiteSerializer');

goog.require('goog.proto2.Descriptor');
goog.require('goog.proto2.FieldDescriptor');
goog.require('goog.proto2.LazyDeserializer');
goog.require('goog.proto2.Util');
goog.require('goog.string');



/**
 * PB-Lite serializer.
 *
 * @constructor
 * @extends {goog.proto2.LazyDeserializer}
 */
goog.proto2.PbLiteSerializer = function() {};
goog.inherits(goog.proto2.PbLiteSerializer, goog.proto2.LazyDeserializer);


/**
 * Serializes a message to a PB-Lite object.
 *
 * @param {goog.proto2.Message} message The message to be serialized.
 *
 * @return {Object} The serialized form of the message.
 */
goog.proto2.PbLiteSerializer.prototype.serialize = function(message) {
  var descriptor = message.getDescriptor();
  var fields = descriptor.getFields();

  var serialized = [];

  // Add the known fields.
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];

    if (!message.has(field)) {
      continue;
    }

    var tag = field.getTag();

    if (field.isRepeated()) {
      serialized[tag] = [];

      for (var j = 0; j < message.countOf(field); j++) {
        serialized[tag][j] =
            this.getSerializedValue(field, message.get(field, j));
      }
    } else {
      serialized[tag] = this.getSerializedValue(field, message.get(field));
    }
  }

  // Add any unknown fields.
  message.forEachUnknown(function(tag, value) {
    serialized[tag] = value;
  });

  return serialized;
};


/** @inheritDoc */
goog.proto2.PbLiteSerializer.prototype.deserializeField =
  function(message, field, value) {

   if (value == null) {
     return null;
   }

   if (field.isRepeated()) {
     var data = [];

     goog.proto2.Util.assert(goog.isArray(value));

     for (var i = 0; i < value.length; i++) {
       data[i] = this.getDeserializedValue(field, value[i]);
     }

     return data;
   } else {
     return this.getDeserializedValue(field, value);
   }
};


/** @inheritDoc */
goog.proto2.PbLiteSerializer.prototype.getSerializedValue =
  function(field, value) {
  if (field.getFieldType() == goog.proto2.Message.FieldType.BOOL) {
    // Booleans are serialized in numeric form.
    return value ? 1 : 0;
  }

  return goog.proto2.Serializer.prototype.getSerializedValue.apply(this,
                                                                   arguments);
};

/** @inheritDoc */
goog.proto2.PbLiteSerializer.prototype.getDeserializedValue =
  function(field, value) {

  if (field.getFieldType() == goog.proto2.Message.FieldType.BOOL) {
    // Booleans are serialized in numeric form.
    return value === 1;
  }

  return goog.proto2.Serializer.prototype.getDeserializedValue.apply(this,
                                                                     arguments);
};
