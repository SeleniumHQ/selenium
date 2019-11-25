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
 * @fileoverview Protocol Buffer (Message) Descriptor class.
 */

goog.provide('goog.proto2.Descriptor');
goog.provide('goog.proto2.Metadata');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.object');
goog.require('goog.string');


/**
 * @typedef {{name: (string|undefined),
 *            fullName: (string|undefined),
 *            containingType: (goog.proto2.Message|undefined)}}
 */
goog.proto2.Metadata;



/**
 * A class which describes a Protocol Buffer 2 Message.
 *
 * @param {function(new:goog.proto2.Message)} messageType Constructor for
 *      the message class that this descriptor describes.
 * @param {!goog.proto2.Metadata} metadata The metadata about the message that
 *      will be used to construct this descriptor.
 * @param {Array<!goog.proto2.FieldDescriptor>} fields The fields of the
 *      message described by this descriptor.
 *
 * @constructor
 * @final
 */
goog.proto2.Descriptor = function(messageType, metadata, fields) {

  /**
   * @type {function(new:goog.proto2.Message)}
   * @private
   */
  this.messageType_ = messageType;

  /**
   * @type {?string}
   * @private
   */
  this.name_ = metadata.name || null;

  /**
   * @type {?string}
   * @private
   */
  this.fullName_ = metadata.fullName || null;

  /**
   * @type {goog.proto2.Message|undefined}
   * @private
   */
  this.containingType_ = metadata.containingType;

  /**
   * The fields of the message described by this descriptor.
   * @type {!Object<number, !goog.proto2.FieldDescriptor>}
   * @private
   */
  this.fields_ = {};

  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    this.fields_[field.getTag()] = field;
  }
};


/**
 * Returns the name of the message, if any.
 *
 * @return {?string} The name.
 */
goog.proto2.Descriptor.prototype.getName = function() {
  return this.name_;
};


/**
 * Returns the full name of the message, if any.
 *
 * @return {?string} The name.
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

  return this.containingType_.getDescriptor();
};


/**
 * Returns the fields in the message described by this descriptor ordered by
 * tag.
 *
 * @return {!Array<!goog.proto2.FieldDescriptor>} The array of field
 *     descriptors.
 */
goog.proto2.Descriptor.prototype.getFields = function() {
  /**
   * @param {!goog.proto2.FieldDescriptor} fieldA First field.
   * @param {!goog.proto2.FieldDescriptor} fieldB Second field.
   * @return {number} Negative if fieldA's tag number is smaller, positive
   *     if greater, zero if the same.
   */
  function tagComparator(fieldA, fieldB) {
    return fieldA.getTag() - fieldB.getTag();
  }

  var fields = goog.object.getValues(this.fields_);
  goog.array.sort(fields, tagComparator);

  return fields;
};


/**
 * Returns the fields in the message as a key/value map, where the key is
 * the tag number of the field. DO NOT MODIFY THE RETURNED OBJECT. We return
 * the actual, internal, fields map for performance reasons, and changing the
 * map can result in undefined behavior of this library.
 *
 * @return {!Object<number, !goog.proto2.FieldDescriptor>} The field map.
 */
goog.proto2.Descriptor.prototype.getFieldsMap = function() {
  return this.fields_;
};


/**
 * Returns the field matching the given name, if any. Note that
 * this method searches over the *original* name of the field,
 * not the camelCase version.
 *
 * @param {string} name The field name for which to search.
 *
 * @return {goog.proto2.FieldDescriptor} The field found, if any.
 */
goog.proto2.Descriptor.prototype.findFieldByName = function(name) {
  var valueFound = goog.object.findValue(
      this.fields_,
      function(field, key, obj) { return field.getName() == name; });

  return /** @type {goog.proto2.FieldDescriptor} */ (valueFound) || null;
};


/**
 * Returns the field matching the given tag number, if any.
 *
 * @param {number|string} tag The field tag number for which to search.
 *
 * @return {goog.proto2.FieldDescriptor} The field found, if any.
 */
goog.proto2.Descriptor.prototype.findFieldByTag = function(tag) {
  goog.asserts.assert(goog.string.isNumeric(tag));
  return this.fields_[parseInt(tag, 10)] || null;
};


/**
 * Creates an instance of the message type that this descriptor
 * describes.
 *
 * @return {!goog.proto2.Message} The instance of the message.
 */
goog.proto2.Descriptor.prototype.createMessageInstance = function() {
  return new this.messageType_;
};
