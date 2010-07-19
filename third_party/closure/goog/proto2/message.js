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
 * @fileoverview Protocol Buffer Message base class.
*
 */

goog.provide('goog.proto2.Message');

goog.require('goog.proto2.Descriptor');
goog.require('goog.proto2.FieldDescriptor');
goog.require('goog.proto2.Util');
goog.require('goog.string');



/**
 * Base class for all Protocol Buffer 2 messages.
 * @constructor
 */
goog.proto2.Message = function() {
  /**
   * Stores the field values in this message.
   * @type {*}
   * @private
   */
  this.values_ = {};

  // The descriptor_ is static to the message function that is being created.
  // Therefore, we retrieve it via the constructor.

  /**
   * Stores the information (i.e. metadata) about
   * this message.
   * @type {goog.proto2.Descriptor}
   * @private
   */
  this.descriptor_ = this.constructor.descriptor_;

  /**
   * Stores the field information (i.e. metadata)
   * about this message.
   * @type {Object}
   * @private
   */
  this.fields_ = this.descriptor_.getFieldsMap();

  /**
   * The lazy deserializer for this message instance, if any.
   * @type {goog.proto2.LazyDeserializer?}
   * @private
   */
  this.lazyDeserializer_ = null;

  /**
   * A map of those fields deserialized.
   * @type {Object}
   * @private
   */
  this.deserializedFields_ = null;
};


/**
 * An enumeration defining the possible field types.
 * Should be a mirror of that defined in descriptor.h.
 *
 * @enum {number}
 */
goog.proto2.Message.FieldType = {
  DOUBLE: 1,
  FLOAT: 2,
  INT64: 3,
  UINT64: 4,
  INT32: 5,
  FIXED64: 6,
  FIXED32: 7,
  BOOL: 8,
  STRING: 9,
  GROUP: 10,
  MESSAGE: 11,
  BYTES: 12,
  UINT32: 13,
  ENUM: 14,
  SFIXED32: 15,
  SFIXED64: 16,
  SINT32: 17,
  SINT64: 18
};


/**
 * Initializes the message with a lazy deserializer and its associated data.
 * This method should be called by internal methods ONLY.
 *
 * @param {goog.proto2.LazyDeserializer} deserializer The lazy deserializer to
 *   use to decode the data on the fly.
 *
 * @param {*} data The data to decode/deserialize.
 */
goog.proto2.Message.prototype.initializeForLazyDeserializer =
  function(deserializer, data) {

  this.lazyDeserializer_ = deserializer;
  this.values_ = data;
  this.deserializedFields_ = {};
};


/**
 * Sets the value of an unknown field, by tag.
 *
 * @param {number} tag The tag of an unknown field (must be >= 1).
 * @param {Object} value The value for that unknown field.
 */
goog.proto2.Message.prototype.setUnknown = function(tag, value) {
  goog.proto2.Util.assert(!this.fields_[tag],
                          'Field is not unknown in this message');

  goog.proto2.Util.assert(tag >= 1, 'Tag is not valid');
  goog.proto2.Util.assert(value !== null, 'Value cannot be null');

  this.values_[tag] = value;
};


/**
 * Iterates over all the unknown fields in the message.
 *
 * @param {function(number, *)} callback A callback method
 *     which gets invoked for each unknown field.
 */
goog.proto2.Message.prototype.forEachUnknown = function(callback) {
  for (var key in this.values_) {
    if (!this.fields_[key]) {
      callback(/** @type {number} */ (key), this.values_[key]);
    }
  }
};


/**
 * Returns the descriptor which describes the current message.
 *
 * @return {goog.proto2.Descriptor} The descriptor.
 */
goog.proto2.Message.prototype.getDescriptor = function() {
  return this.descriptor_;
};


/**
 * Returns whether there is a value stored at the field specified by the
 * given field descriptor.
 *
 * @param {goog.proto2.FieldDescriptor} field The field for which to check
 *     if there is a value.
 *
 * @return {boolean} True if a value was found.
 */
goog.proto2.Message.prototype.has = function(field) {
  goog.proto2.Util.assert(
      field.getContainingType() == this.descriptor_,
      'The current message does not contain the given field');

  return this.has$Value(field.getTag());
};


/**
 * Returns the array of values found for the given repeated field.
 *
 * @param {goog.proto2.FieldDescriptor} field The field for which to
 *     return the values.
 *
 * @return {Array.<*>} The values found.
 */
goog.proto2.Message.prototype.arrayOf = function(field) {
  goog.proto2.Util.assert(
      field.getContainingType() == this.descriptor_,
      'The current message does not contain the given field');

  return this.array$Values(field.getTag());
};


/**
 * Returns the number of values stored in the given field.
 *
 * @param {goog.proto2.FieldDescriptor} field The field for which to count
 *     the number of values.
 *
 * @return {number} The count of the values in the given field.
 */
goog.proto2.Message.prototype.countOf = function(field) {
  goog.proto2.Util.assert(
      field.getContainingType() == this.descriptor_,
      'The current message does not contain the given field');

  return this.count$Values(field.getTag());
};


/**
 * Returns the value stored at the field specified by the
 * given field descriptor.
 *
 * @param {goog.proto2.FieldDescriptor} field The field for which to get the
 *     value.
 * @param {number=} opt_index If the field is repeated, the index to use when
 *     looking up the value.
 *
 * @return {*} The value found or undefined if none.
 */
goog.proto2.Message.prototype.get = function(field, opt_index) {
  goog.proto2.Util.assert(
      field.getContainingType() == this.descriptor_,
      'The current message does not contain the given field');

  return this.get$Value(field.getTag(), opt_index);
};


/**
 * Returns the value stored at the field specified by the
 * given field descriptor or the default value if none exists.
 *
 * @param {goog.proto2.FieldDescriptor} field The field for which to get the
 *     value.
 * @param {number=} opt_index If the field is repeated, the index to use when
 *     looking up the value.
 *
 * @return {*} The value found or the default if none.
 */
goog.proto2.Message.prototype.getOrDefault = function(field, opt_index) {
  goog.proto2.Util.assert(
      field.getContainingType() == this.descriptor_,
      'The current message does not contain the given field');

  return this.get$ValueOrDefault(field.getTag(), opt_index);
};


/**
 * Stores the given value to the field specified by the
 * given field descriptor. Note that the field must not be repeated.
 *
 * @param {goog.proto2.FieldDescriptor} field The field for which to set
 *     the value.
 * @param {*} value The new value for the field.
 */
goog.proto2.Message.prototype.set = function(field, value) {
  goog.proto2.Util.assert(
      field.getContainingType() == this.descriptor_,
      'The current message does not contain the given field');

  this.set$Value(field.getTag(), value);
};


/**
 * Adds the given value to the field specified by the
 * given field descriptor. Note that the field must be repeated.
 *
 * @param {goog.proto2.FieldDescriptor} field The field in which to add the
 *     the value.
 * @param {*} value The new value to add to the field.
 */
goog.proto2.Message.prototype.add = function(field, value) {
  goog.proto2.Util.assert(
      field.getContainingType() == this.descriptor_,
      'The current message does not contain the given field');

  this.add$Value(field.getTag(), value);
};


/**
 * Clears the field specified.
 *
 * @param {goog.proto2.FieldDescriptor} field The field to clear.
 */
goog.proto2.Message.prototype.clear = function(field) {
  goog.proto2.Util.assert(
      field.getContainingType() == this.descriptor_,
      'The current message does not contain the given field');

  this.clear$Field(field.getTag());
};


/**
 * Returns the field in this message by the given tag number. If no
 * such field exists, throws an exception.
 *
 * @param {number} tag The field's tag index.
 * @return {goog.proto2.FieldDescriptor} The descriptor for the field.
 * @private
 */
goog.proto2.Message.prototype.getFieldByTag_ = function(tag) {
  goog.proto2.Util.assert(this.fields_[tag],
                          'No field found for the given tag');

  return this.fields_[tag];
};


/**
 * Returns the whether or not the field indicated by the given tag
 * has a value.
 *
 * GENERATED CODE USE ONLY. Basis of the has{Field} methods.
 *
 * @param {number} tag The tag.
 *
 * @return {boolean} Whether the message has a value for the field.
 */
goog.proto2.Message.prototype.has$Value = function(tag) {
  goog.proto2.Util.assert(this.fields_[tag],
                          'No field found for the given tag');

  return tag in this.values_ && goog.isDef(this.values_[tag]);
};


/**
 * If a lazy deserializer is instantiated, lazily deserializes the
 * field if required.
 *
 * @param {goog.proto2.FieldDescriptor} field The field.
 * @private
 */
goog.proto2.Message.prototype.lazyDeserialize_ = function(field) {
  // If we have a lazy deserializer, then ensure that the field is
  // properly deserialized.
  if (this.lazyDeserializer_) {
    var tag = field.getTag();

    if (!(tag in this.deserializedFields_)) {
      this.values_[tag] = this.lazyDeserializer_.deserializeField(
          this, field, this.values_[tag]);

      this.deserializedFields_[tag] = true;
    }
  }
};


/**
 * Gets the value at the field indicated by the given tag.
 *
 * GENERATED CODE USE ONLY. Basis of the get{Field} methods.
 *
 * @param {number} tag The field's tag index.
 * @param {number=} opt_index If the field is a repeated field, the index
 *     at which to get the value.
 *
 * @return {*} The value found or undefined for none.
 */
goog.proto2.Message.prototype.get$Value = function(tag, opt_index) {
  var field = this.getFieldByTag_(tag);

  // Ensure that the field is deserialized.
  this.lazyDeserialize_(field);

  var index = opt_index || 0;

  if (field.isRepeated()) {
    goog.proto2.Util.assert(index < this.count$Values(tag),
                            'Field value count is less than index given');

    return this.values_[tag][index];
  } else {
    goog.proto2.Util.assert(!goog.isArray(this.values_[tag]));
    return this.values_[tag];
  }
};


/**
 * Gets the value at the field indicated by the given tag or the default value
 * if none.
 *
 * GENERATED CODE USE ONLY. Basis of the get{Field} methods.
 *
 * @param {number} tag The field's tag index.
 * @param {number=} opt_index If the field is a repeated field, the index
 *     at which to get the value.
 *
 * @return {*} The value found or the default value if none set.
 */
goog.proto2.Message.prototype.get$ValueOrDefault = function(tag, opt_index) {

  if (!this.has$Value(tag)) {
    // Return the default value.
    var field = this.getFieldByTag_(tag);
    return field.getDefaultValue();
  }

  return this.get$Value(tag, opt_index);
};


/**
 * Gets the values at the field indicated by the given tag.
 *
 * GENERATED CODE USE ONLY. Basis of the {field}Array methods.
 *
 * @param {number} tag The field's tag index.
 *
 * @return {Array.<Object>} The values found. If none, returns an empty array.
 */
goog.proto2.Message.prototype.array$Values = function(tag) {
  goog.proto2.Util.assert(this.getFieldByTag_(tag).isRepeated(),
                          'Cannot call fieldArray on a non-repeated field');

  var field = this.getFieldByTag_(tag);

  // Ensure that the field is deserialized.
  this.lazyDeserialize_(field);

  var valuesArray = this.values_[tag];

  if (!valuesArray) {
    return [];
  }

  return valuesArray;
};


/**
 * Returns the number of values stored in the field by the given tag.
 *
 * GENERATED CODE USE ONLY. Basis of the {field}Count methods.
 *
 * @param {number} tag The tag.
 *
 * @return {number} The number of values.
 */
goog.proto2.Message.prototype.count$Values = function(tag) {
  var field = this.getFieldByTag_(tag);

  if (field.isRepeated()) {
    if (this.has$Value(tag)) {
      goog.proto2.Util.assert(goog.isArray(this.values_[tag]));
    }

    return this.has$Value(tag) ? this.values_[tag].length : 0;
  } else {
    return this.has$Value(tag) ? 1 : 0;
  }
};


/**
 * Sets the value of the *non-repeating* field indicated by the given tag.
 *
 * GENERATED CODE USE ONLY. Basis of the set{Field} methods.
 *
 * @param {number} tag The field's tag index.
 * @param {*} value The field's value.
 */
goog.proto2.Message.prototype.set$Value = function(tag, value) {
  if (goog.proto2.Util.conductChecks()) {
    var field = this.getFieldByTag_(tag);

    goog.proto2.Util.assert(!field.isRepeated(),
                            'Cannot call set on a repeated field');

    this.checkFieldType_(field, value);
  }

  this.values_[tag] = value;
};


/**
 * Adds the value to the *repeating* field indicated by the given tag.
 *
 * GENERATED CODE USE ONLY. Basis of the add{Field} methods.
 *
 * @param {number} tag The field's tag index.
 * @param {*} value The value to add.
 */
goog.proto2.Message.prototype.add$Value = function(tag, value) {
  if (goog.proto2.Util.conductChecks()) {
    var field = this.getFieldByTag_(tag);

    goog.proto2.Util.assert(field.isRepeated(),
                            'Cannot call add on a non-repeated field');

    this.checkFieldType_(field, value);
  }

  if (!this.values_[tag]) {
    this.values_[tag] = [];
  }

  this.values_[tag].push(value);
};


/**
 * Ensures that the value being assigned to the given field
 * is valid.
 *
 * @param {goog.proto2.FieldDescriptor} field The field being assigned.
 * @param {*} value The value being assigned.
 * @private
 */
goog.proto2.Message.prototype.checkFieldType_ = function(field, value) {
  goog.proto2.Util.assert(value !== null);

  if (field.getNativeType() == String) {
    goog.proto2.Util.assert(typeof value === 'string',
                            'Expected value of type string');
  } else if (field.getNativeType() == Boolean) {
    goog.proto2.Util.assert(typeof value === 'boolean',
                            'Expected value of type boolean');
  } else if (field.getNativeType() == Number) {
    goog.proto2.Util.assert(typeof value === 'number',
                            'Expected value of type number');
  } else {
    if (field.getFieldType() == goog.proto2.Message.FieldType.ENUM) {
      goog.proto2.Util.assert(typeof value === 'number',
                              'Expected an enum value, which is a number');
    } else {
      goog.proto2.Util.assert(value instanceof field.getNativeType(),
                              'Expected a matching message type');
    }
  }
};


/**
 * Clears the field specified by tag.
 *
 * GENERATED CODE USE ONLY. Basis of the clear{Field} methods.
 *
 * @param {number} tag The tag of the field to clear.
 */
goog.proto2.Message.prototype.clear$Field = function(tag) {
  goog.proto2.Util.assert(this.getFieldByTag_(tag), 'Unknown field');
  delete this.values_[tag];
};


/**
 * Sets the metadata that represents the definition of this message.
 *
 * GENERATED CODE USE ONLY. Called when constructing message classes.
 *
 * @param {Function} messageType Constructor for the message type to
 *     which this metadata applies.
 * @param {Object} metadataObj The object containing the metadata.
 */
goog.proto2.Message.set$Metadata = function(messageType, metadataObj) {
  var fields = [];
  var descriptorInfo;

  for (var key in metadataObj) {
    if (!metadataObj.hasOwnProperty(key)) {
      continue;
    }

    goog.proto2.Util.assert(goog.string.isNumeric(key), 'Keys must be numeric');

    if (key == 0) {
      descriptorInfo = metadataObj[0];
      continue;
    }

    // Create the field descriptor.
    fields.push(
        new goog.proto2.FieldDescriptor(messageType, key, metadataObj[key]));
  }

  goog.proto2.Util.assert(descriptorInfo);

  // Create the descriptor.
  messageType.descriptor_ =
      new goog.proto2.Descriptor(messageType, descriptorInfo, fields);

  messageType.getDescriptor = function() {
    return messageType.descriptor_;
  };
};
