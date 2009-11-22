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
 * @fileoverview Protocol Buffer (Message) Descriptor class.
 */

goog.provide('goog.proto2.Descriptor');

goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.proto2.Util');



/**
 * A class which describes a Protocol Buffer 2 Message.
 *
 * @param {Function} messageType Constructor for the message class that
 *      this descriptor describes.
 * @param {!Object} metadata The metadata about the message that will be used
 *      to construct this descriptor.
 * @param {Array.<goog.proto2.FieldDescriptor>} fields The fields of the
 *      message described by this descriptor.
 *
 * @constructor
 */
goog.proto2.Descriptor = function(messageType, metadata, fields) {
  this.messageType_ = messageType;
  this.name_ = metadata.name;
  this.fullName_ = metadata.fullName;
  this.containingType_ = metadata.containingType;

  /**
   * The fields of the message described by this descriptor.
   * @type {Object}
   * @private
   */
  this.fields_ = {};

  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    this.fields_[field.getTag()] = field;
  }
};


/**
 * Returns the name of the message.
 *
 * @return {string} The name.
 */
goog.proto2.Descriptor.prototype.getName = function() {
  return this.name_;
};


/**
 * Returns the full name of the message.
 *
 * @return {string} The na,e.
 */
goog.proto2.Descriptor.prototype.getFullName = function() {
  return this.fullName_;
};


/**
 * Returns the descriptor of the containing message type or null if none.
 *
 * @return {goog.proto2.Descriptor} The descriptor.
 */
goog.proto2.Descriptor.prototype.getContainingType = function() {
  if (!this.containingType_) {
    return null;
  }

  return this.containingType_.descriptor_;
};


/**
 * Returns the fields in the message described by this descriptor ordered by
 * tag.
 *
 * @return {Array.<goog.proto2.FieldDescriptor>} The array of field descriptors.
 */
goog.proto2.Descriptor.prototype.getFields = function() {
  var fields = goog.object.getValues(this.fields_);

  goog.array.sort(fields, function(fieldA, fieldB) {
    return fieldA.getTag() - fieldB.getTag();
  });

  return fields;
};


/**
 * Returns the fields in the message as a key/value map, where the key is
 * the tag number of the field.
 *
 * @return {Object} The field map.
 */
goog.proto2.Descriptor.prototype.getFieldsMap = function() {
  return goog.object.clone(this.fields_);
};


/**
 * Returns the field matching the given name, if any. Note that
 * this method searches over the *original* name of the field,
 * not the camelCase version.
 *
 * @param {string} name The field name for which to search.
 *
 * @return {goog.proto2.FieldDescriptor?} The field found, if any.
 */
goog.proto2.Descriptor.prototype.findFieldByName = function(name) {
  var valueFound =
    goog.object.findValue(this.fields_, function(field, key, obj) {
      return field.getName() == name;
    });

  return valueFound || null;
};


/**
 * Returns the field matching the given tag number, if any.
 *
 * @param {number|string} tag The field tag number for which to search.
 *
 * @return {goog.proto2.FieldDescriptor} The field found, if any.
 */
goog.proto2.Descriptor.prototype.findFieldByTag = function(tag) {
  goog.proto2.Util.assert(goog.string.isNumeric(tag));
  return this.fields_[tag] || null;
};


/**
 * Creates an instance of the message type that this descriptor
 * describes.
 *
 * @return {goog.proto2.Message} The instance of the message.
 */
goog.proto2.Descriptor.prototype.createMessageInstance = function() {
  return new this.messageType_;
};
