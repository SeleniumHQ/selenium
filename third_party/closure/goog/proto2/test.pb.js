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
// All other code copyright its respective owners(s).

/**
 * @fileoverview Generated Protocol Buffer code for file
 * closure/goog/proto2/test.proto.
 */

goog.provide('proto2.TestAllTypes');
goog.provide('proto2.TestAllTypes.NestedMessage');
goog.provide('proto2.TestAllTypes.OptionalGroup');
goog.provide('proto2.TestAllTypes.RepeatedGroup');
goog.provide('proto2.TestAllTypes.NestedEnum');
goog.provide('proto2.TestDefaultParent');
goog.provide('proto2.TestDefaultChild');

goog.require('goog.proto2.Message');



/**
 * Message TestAllTypes.
 * @constructor
 * @extends {goog.proto2.Message}
 */
proto2.TestAllTypes = function() {
  goog.proto2.Message.call(this);
};
goog.inherits(proto2.TestAllTypes, goog.proto2.Message);


/**
 * Overrides {@link goog.proto2.Message#clone} to specify its exact return type.
 * @return {!proto2.TestAllTypes} The cloned message.
 * @override
 */
proto2.TestAllTypes.prototype.clone;


/**
 * Gets the value of the optional_int32 field.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getOptionalInt32 = function() {
  return /** @type {?number} */ (this.get$Value(1));
};


/**
 * Gets the value of the optional_int32 field or the default value if not set.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getOptionalInt32OrDefault = function() {
  return /** @type {number} */ (this.get$ValueOrDefault(1));
};


/**
 * Sets the value of the optional_int32 field.
 * @param {number} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalInt32 = function(value) {
  this.set$Value(1, value);
};


/**
 * @return {boolean} Whether the optional_int32 field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalInt32 = function() {
  return this.has$Value(1);
};


/**
 * @return {number} The number of values in the optional_int32 field.
 */
proto2.TestAllTypes.prototype.optionalInt32Count = function() {
  return this.count$Values(1);
};


/**
 * Clears the values in the optional_int32 field.
 */
proto2.TestAllTypes.prototype.clearOptionalInt32 = function() {
  this.clear$Field(1);
};


/**
 * Gets the value of the optional_int64 field.
 * @return {?string} The value.
 */
proto2.TestAllTypes.prototype.getOptionalInt64 = function() {
  return /** @type {?string} */ (this.get$Value(2));
};


/**
 * Gets the value of the optional_int64 field or the default value if not set.
 * @return {string} The value.
 */
proto2.TestAllTypes.prototype.getOptionalInt64OrDefault = function() {
  return /** @type {string} */ (this.get$ValueOrDefault(2));
};


/**
 * Sets the value of the optional_int64 field.
 * @param {string} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalInt64 = function(value) {
  this.set$Value(2, value);
};


/**
 * @return {boolean} Whether the optional_int64 field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalInt64 = function() {
  return this.has$Value(2);
};


/**
 * @return {number} The number of values in the optional_int64 field.
 */
proto2.TestAllTypes.prototype.optionalInt64Count = function() {
  return this.count$Values(2);
};


/**
 * Clears the values in the optional_int64 field.
 */
proto2.TestAllTypes.prototype.clearOptionalInt64 = function() {
  this.clear$Field(2);
};


/**
 * Gets the value of the optional_uint32 field.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getOptionalUint32 = function() {
  return /** @type {?number} */ (this.get$Value(3));
};


/**
 * Gets the value of the optional_uint32 field or the default value if not set.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getOptionalUint32OrDefault = function() {
  return /** @type {number} */ (this.get$ValueOrDefault(3));
};


/**
 * Sets the value of the optional_uint32 field.
 * @param {number} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalUint32 = function(value) {
  this.set$Value(3, value);
};


/**
 * @return {boolean} Whether the optional_uint32 field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalUint32 = function() {
  return this.has$Value(3);
};


/**
 * @return {number} The number of values in the optional_uint32 field.
 */
proto2.TestAllTypes.prototype.optionalUint32Count = function() {
  return this.count$Values(3);
};


/**
 * Clears the values in the optional_uint32 field.
 */
proto2.TestAllTypes.prototype.clearOptionalUint32 = function() {
  this.clear$Field(3);
};


/**
 * Gets the value of the optional_uint64 field.
 * @return {?string} The value.
 */
proto2.TestAllTypes.prototype.getOptionalUint64 = function() {
  return /** @type {?string} */ (this.get$Value(4));
};


/**
 * Gets the value of the optional_uint64 field or the default value if not set.
 * @return {string} The value.
 */
proto2.TestAllTypes.prototype.getOptionalUint64OrDefault = function() {
  return /** @type {string} */ (this.get$ValueOrDefault(4));
};


/**
 * Sets the value of the optional_uint64 field.
 * @param {string} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalUint64 = function(value) {
  this.set$Value(4, value);
};


/**
 * @return {boolean} Whether the optional_uint64 field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalUint64 = function() {
  return this.has$Value(4);
};


/**
 * @return {number} The number of values in the optional_uint64 field.
 */
proto2.TestAllTypes.prototype.optionalUint64Count = function() {
  return this.count$Values(4);
};


/**
 * Clears the values in the optional_uint64 field.
 */
proto2.TestAllTypes.prototype.clearOptionalUint64 = function() {
  this.clear$Field(4);
};


/**
 * Gets the value of the optional_sint32 field.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getOptionalSint32 = function() {
  return /** @type {?number} */ (this.get$Value(5));
};


/**
 * Gets the value of the optional_sint32 field or the default value if not set.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getOptionalSint32OrDefault = function() {
  return /** @type {number} */ (this.get$ValueOrDefault(5));
};


/**
 * Sets the value of the optional_sint32 field.
 * @param {number} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalSint32 = function(value) {
  this.set$Value(5, value);
};


/**
 * @return {boolean} Whether the optional_sint32 field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalSint32 = function() {
  return this.has$Value(5);
};


/**
 * @return {number} The number of values in the optional_sint32 field.
 */
proto2.TestAllTypes.prototype.optionalSint32Count = function() {
  return this.count$Values(5);
};


/**
 * Clears the values in the optional_sint32 field.
 */
proto2.TestAllTypes.prototype.clearOptionalSint32 = function() {
  this.clear$Field(5);
};


/**
 * Gets the value of the optional_sint64 field.
 * @return {?string} The value.
 */
proto2.TestAllTypes.prototype.getOptionalSint64 = function() {
  return /** @type {?string} */ (this.get$Value(6));
};


/**
 * Gets the value of the optional_sint64 field or the default value if not set.
 * @return {string} The value.
 */
proto2.TestAllTypes.prototype.getOptionalSint64OrDefault = function() {
  return /** @type {string} */ (this.get$ValueOrDefault(6));
};


/**
 * Sets the value of the optional_sint64 field.
 * @param {string} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalSint64 = function(value) {
  this.set$Value(6, value);
};


/**
 * @return {boolean} Whether the optional_sint64 field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalSint64 = function() {
  return this.has$Value(6);
};


/**
 * @return {number} The number of values in the optional_sint64 field.
 */
proto2.TestAllTypes.prototype.optionalSint64Count = function() {
  return this.count$Values(6);
};


/**
 * Clears the values in the optional_sint64 field.
 */
proto2.TestAllTypes.prototype.clearOptionalSint64 = function() {
  this.clear$Field(6);
};


/**
 * Gets the value of the optional_fixed32 field.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getOptionalFixed32 = function() {
  return /** @type {?number} */ (this.get$Value(7));
};


/**
 * Gets the value of the optional_fixed32 field or the default value if not set.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getOptionalFixed32OrDefault = function() {
  return /** @type {number} */ (this.get$ValueOrDefault(7));
};


/**
 * Sets the value of the optional_fixed32 field.
 * @param {number} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalFixed32 = function(value) {
  this.set$Value(7, value);
};


/**
 * @return {boolean} Whether the optional_fixed32 field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalFixed32 = function() {
  return this.has$Value(7);
};


/**
 * @return {number} The number of values in the optional_fixed32 field.
 */
proto2.TestAllTypes.prototype.optionalFixed32Count = function() {
  return this.count$Values(7);
};


/**
 * Clears the values in the optional_fixed32 field.
 */
proto2.TestAllTypes.prototype.clearOptionalFixed32 = function() {
  this.clear$Field(7);
};


/**
 * Gets the value of the optional_fixed64 field.
 * @return {?string} The value.
 */
proto2.TestAllTypes.prototype.getOptionalFixed64 = function() {
  return /** @type {?string} */ (this.get$Value(8));
};


/**
 * Gets the value of the optional_fixed64 field or the default value if not set.
 * @return {string} The value.
 */
proto2.TestAllTypes.prototype.getOptionalFixed64OrDefault = function() {
  return /** @type {string} */ (this.get$ValueOrDefault(8));
};


/**
 * Sets the value of the optional_fixed64 field.
 * @param {string} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalFixed64 = function(value) {
  this.set$Value(8, value);
};


/**
 * @return {boolean} Whether the optional_fixed64 field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalFixed64 = function() {
  return this.has$Value(8);
};


/**
 * @return {number} The number of values in the optional_fixed64 field.
 */
proto2.TestAllTypes.prototype.optionalFixed64Count = function() {
  return this.count$Values(8);
};


/**
 * Clears the values in the optional_fixed64 field.
 */
proto2.TestAllTypes.prototype.clearOptionalFixed64 = function() {
  this.clear$Field(8);
};


/**
 * Gets the value of the optional_sfixed32 field.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getOptionalSfixed32 = function() {
  return /** @type {?number} */ (this.get$Value(9));
};


/**
 * Gets the value of the optional_sfixed32 field or the default value if not set.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getOptionalSfixed32OrDefault = function() {
  return /** @type {number} */ (this.get$ValueOrDefault(9));
};


/**
 * Sets the value of the optional_sfixed32 field.
 * @param {number} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalSfixed32 = function(value) {
  this.set$Value(9, value);
};


/**
 * @return {boolean} Whether the optional_sfixed32 field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalSfixed32 = function() {
  return this.has$Value(9);
};


/**
 * @return {number} The number of values in the optional_sfixed32 field.
 */
proto2.TestAllTypes.prototype.optionalSfixed32Count = function() {
  return this.count$Values(9);
};


/**
 * Clears the values in the optional_sfixed32 field.
 */
proto2.TestAllTypes.prototype.clearOptionalSfixed32 = function() {
  this.clear$Field(9);
};


/**
 * Gets the value of the optional_sfixed64 field.
 * @return {?string} The value.
 */
proto2.TestAllTypes.prototype.getOptionalSfixed64 = function() {
  return /** @type {?string} */ (this.get$Value(10));
};


/**
 * Gets the value of the optional_sfixed64 field or the default value if not set.
 * @return {string} The value.
 */
proto2.TestAllTypes.prototype.getOptionalSfixed64OrDefault = function() {
  return /** @type {string} */ (this.get$ValueOrDefault(10));
};


/**
 * Sets the value of the optional_sfixed64 field.
 * @param {string} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalSfixed64 = function(value) {
  this.set$Value(10, value);
};


/**
 * @return {boolean} Whether the optional_sfixed64 field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalSfixed64 = function() {
  return this.has$Value(10);
};


/**
 * @return {number} The number of values in the optional_sfixed64 field.
 */
proto2.TestAllTypes.prototype.optionalSfixed64Count = function() {
  return this.count$Values(10);
};


/**
 * Clears the values in the optional_sfixed64 field.
 */
proto2.TestAllTypes.prototype.clearOptionalSfixed64 = function() {
  this.clear$Field(10);
};


/**
 * Gets the value of the optional_float field.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getOptionalFloat = function() {
  return /** @type {?number} */ (this.get$Value(11));
};


/**
 * Gets the value of the optional_float field or the default value if not set.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getOptionalFloatOrDefault = function() {
  return /** @type {number} */ (this.get$ValueOrDefault(11));
};


/**
 * Sets the value of the optional_float field.
 * @param {number} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalFloat = function(value) {
  this.set$Value(11, value);
};


/**
 * @return {boolean} Whether the optional_float field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalFloat = function() {
  return this.has$Value(11);
};


/**
 * @return {number} The number of values in the optional_float field.
 */
proto2.TestAllTypes.prototype.optionalFloatCount = function() {
  return this.count$Values(11);
};


/**
 * Clears the values in the optional_float field.
 */
proto2.TestAllTypes.prototype.clearOptionalFloat = function() {
  this.clear$Field(11);
};


/**
 * Gets the value of the optional_double field.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getOptionalDouble = function() {
  return /** @type {?number} */ (this.get$Value(12));
};


/**
 * Gets the value of the optional_double field or the default value if not set.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getOptionalDoubleOrDefault = function() {
  return /** @type {number} */ (this.get$ValueOrDefault(12));
};


/**
 * Sets the value of the optional_double field.
 * @param {number} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalDouble = function(value) {
  this.set$Value(12, value);
};


/**
 * @return {boolean} Whether the optional_double field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalDouble = function() {
  return this.has$Value(12);
};


/**
 * @return {number} The number of values in the optional_double field.
 */
proto2.TestAllTypes.prototype.optionalDoubleCount = function() {
  return this.count$Values(12);
};


/**
 * Clears the values in the optional_double field.
 */
proto2.TestAllTypes.prototype.clearOptionalDouble = function() {
  this.clear$Field(12);
};


/**
 * Gets the value of the optional_bool field.
 * @return {?boolean} The value.
 */
proto2.TestAllTypes.prototype.getOptionalBool = function() {
  return /** @type {?boolean} */ (this.get$Value(13));
};


/**
 * Gets the value of the optional_bool field or the default value if not set.
 * @return {boolean} The value.
 */
proto2.TestAllTypes.prototype.getOptionalBoolOrDefault = function() {
  return /** @type {boolean} */ (this.get$ValueOrDefault(13));
};


/**
 * Sets the value of the optional_bool field.
 * @param {boolean} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalBool = function(value) {
  this.set$Value(13, value);
};


/**
 * @return {boolean} Whether the optional_bool field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalBool = function() {
  return this.has$Value(13);
};


/**
 * @return {number} The number of values in the optional_bool field.
 */
proto2.TestAllTypes.prototype.optionalBoolCount = function() {
  return this.count$Values(13);
};


/**
 * Clears the values in the optional_bool field.
 */
proto2.TestAllTypes.prototype.clearOptionalBool = function() {
  this.clear$Field(13);
};


/**
 * Gets the value of the optional_string field.
 * @return {?string} The value.
 */
proto2.TestAllTypes.prototype.getOptionalString = function() {
  return /** @type {?string} */ (this.get$Value(14));
};


/**
 * Gets the value of the optional_string field or the default value if not set.
 * @return {string} The value.
 */
proto2.TestAllTypes.prototype.getOptionalStringOrDefault = function() {
  return /** @type {string} */ (this.get$ValueOrDefault(14));
};


/**
 * Sets the value of the optional_string field.
 * @param {string} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalString = function(value) {
  this.set$Value(14, value);
};


/**
 * @return {boolean} Whether the optional_string field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalString = function() {
  return this.has$Value(14);
};


/**
 * @return {number} The number of values in the optional_string field.
 */
proto2.TestAllTypes.prototype.optionalStringCount = function() {
  return this.count$Values(14);
};


/**
 * Clears the values in the optional_string field.
 */
proto2.TestAllTypes.prototype.clearOptionalString = function() {
  this.clear$Field(14);
};


/**
 * Gets the value of the optional_bytes field.
 * @return {?string} The value.
 */
proto2.TestAllTypes.prototype.getOptionalBytes = function() {
  return /** @type {?string} */ (this.get$Value(15));
};


/**
 * Gets the value of the optional_bytes field or the default value if not set.
 * @return {string} The value.
 */
proto2.TestAllTypes.prototype.getOptionalBytesOrDefault = function() {
  return /** @type {string} */ (this.get$ValueOrDefault(15));
};


/**
 * Sets the value of the optional_bytes field.
 * @param {string} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalBytes = function(value) {
  this.set$Value(15, value);
};


/**
 * @return {boolean} Whether the optional_bytes field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalBytes = function() {
  return this.has$Value(15);
};


/**
 * @return {number} The number of values in the optional_bytes field.
 */
proto2.TestAllTypes.prototype.optionalBytesCount = function() {
  return this.count$Values(15);
};


/**
 * Clears the values in the optional_bytes field.
 */
proto2.TestAllTypes.prototype.clearOptionalBytes = function() {
  this.clear$Field(15);
};


/**
 * Gets the value of the optionalgroup field.
 * @return {proto2.TestAllTypes.OptionalGroup} The value.
 */
proto2.TestAllTypes.prototype.getOptionalgroup = function() {
  return /** @type {proto2.TestAllTypes.OptionalGroup} */ (this.get$Value(16));
};


/**
 * Gets the value of the optionalgroup field or the default value if not set.
 * @return {!proto2.TestAllTypes.OptionalGroup} The value.
 */
proto2.TestAllTypes.prototype.getOptionalgroupOrDefault = function() {
  return /** @type {!proto2.TestAllTypes.OptionalGroup} */ (this.get$ValueOrDefault(16));
};


/**
 * Sets the value of the optionalgroup field.
 * @param {!proto2.TestAllTypes.OptionalGroup} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalgroup = function(value) {
  this.set$Value(16, value);
};


/**
 * @return {boolean} Whether the optionalgroup field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalgroup = function() {
  return this.has$Value(16);
};


/**
 * @return {number} The number of values in the optionalgroup field.
 */
proto2.TestAllTypes.prototype.optionalgroupCount = function() {
  return this.count$Values(16);
};


/**
 * Clears the values in the optionalgroup field.
 */
proto2.TestAllTypes.prototype.clearOptionalgroup = function() {
  this.clear$Field(16);
};


/**
 * Gets the value of the optional_nested_message field.
 * @return {proto2.TestAllTypes.NestedMessage} The value.
 */
proto2.TestAllTypes.prototype.getOptionalNestedMessage = function() {
  return /** @type {proto2.TestAllTypes.NestedMessage} */ (this.get$Value(18));
};


/**
 * Gets the value of the optional_nested_message field or the default value if not set.
 * @return {!proto2.TestAllTypes.NestedMessage} The value.
 */
proto2.TestAllTypes.prototype.getOptionalNestedMessageOrDefault = function() {
  return /** @type {!proto2.TestAllTypes.NestedMessage} */ (this.get$ValueOrDefault(18));
};


/**
 * Sets the value of the optional_nested_message field.
 * @param {!proto2.TestAllTypes.NestedMessage} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalNestedMessage = function(value) {
  this.set$Value(18, value);
};


/**
 * @return {boolean} Whether the optional_nested_message field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalNestedMessage = function() {
  return this.has$Value(18);
};


/**
 * @return {number} The number of values in the optional_nested_message field.
 */
proto2.TestAllTypes.prototype.optionalNestedMessageCount = function() {
  return this.count$Values(18);
};


/**
 * Clears the values in the optional_nested_message field.
 */
proto2.TestAllTypes.prototype.clearOptionalNestedMessage = function() {
  this.clear$Field(18);
};


/**
 * Gets the value of the optional_nested_enum field.
 * @return {?proto2.TestAllTypes.NestedEnum} The value.
 */
proto2.TestAllTypes.prototype.getOptionalNestedEnum = function() {
  return /** @type {?proto2.TestAllTypes.NestedEnum} */ (this.get$Value(21));
};


/**
 * Gets the value of the optional_nested_enum field or the default value if not set.
 * @return {proto2.TestAllTypes.NestedEnum} The value.
 */
proto2.TestAllTypes.prototype.getOptionalNestedEnumOrDefault = function() {
  return /** @type {proto2.TestAllTypes.NestedEnum} */ (this.get$ValueOrDefault(21));
};


/**
 * Sets the value of the optional_nested_enum field.
 * @param {proto2.TestAllTypes.NestedEnum} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalNestedEnum = function(value) {
  this.set$Value(21, value);
};


/**
 * @return {boolean} Whether the optional_nested_enum field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalNestedEnum = function() {
  return this.has$Value(21);
};


/**
 * @return {number} The number of values in the optional_nested_enum field.
 */
proto2.TestAllTypes.prototype.optionalNestedEnumCount = function() {
  return this.count$Values(21);
};


/**
 * Clears the values in the optional_nested_enum field.
 */
proto2.TestAllTypes.prototype.clearOptionalNestedEnum = function() {
  this.clear$Field(21);
};


/**
 * Gets the value of the optional_int64_number field.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getOptionalInt64Number = function() {
  return /** @type {?number} */ (this.get$Value(50));
};


/**
 * Gets the value of the optional_int64_number field or the default value if not set.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getOptionalInt64NumberOrDefault = function() {
  return /** @type {number} */ (this.get$ValueOrDefault(50));
};


/**
 * Sets the value of the optional_int64_number field.
 * @param {number} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalInt64Number = function(value) {
  this.set$Value(50, value);
};


/**
 * @return {boolean} Whether the optional_int64_number field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalInt64Number = function() {
  return this.has$Value(50);
};


/**
 * @return {number} The number of values in the optional_int64_number field.
 */
proto2.TestAllTypes.prototype.optionalInt64NumberCount = function() {
  return this.count$Values(50);
};


/**
 * Clears the values in the optional_int64_number field.
 */
proto2.TestAllTypes.prototype.clearOptionalInt64Number = function() {
  this.clear$Field(50);
};


/**
 * Gets the value of the optional_int64_string field.
 * @return {?string} The value.
 */
proto2.TestAllTypes.prototype.getOptionalInt64String = function() {
  return /** @type {?string} */ (this.get$Value(51));
};


/**
 * Gets the value of the optional_int64_string field or the default value if not set.
 * @return {string} The value.
 */
proto2.TestAllTypes.prototype.getOptionalInt64StringOrDefault = function() {
  return /** @type {string} */ (this.get$ValueOrDefault(51));
};


/**
 * Sets the value of the optional_int64_string field.
 * @param {string} value The value.
 */
proto2.TestAllTypes.prototype.setOptionalInt64String = function(value) {
  this.set$Value(51, value);
};


/**
 * @return {boolean} Whether the optional_int64_string field has a value.
 */
proto2.TestAllTypes.prototype.hasOptionalInt64String = function() {
  return this.has$Value(51);
};


/**
 * @return {number} The number of values in the optional_int64_string field.
 */
proto2.TestAllTypes.prototype.optionalInt64StringCount = function() {
  return this.count$Values(51);
};


/**
 * Clears the values in the optional_int64_string field.
 */
proto2.TestAllTypes.prototype.clearOptionalInt64String = function() {
  this.clear$Field(51);
};


/**
 * Gets the value of the repeated_int32 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedInt32 = function(index) {
  return /** @type {?number} */ (this.get$Value(31, index));
};


/**
 * Gets the value of the repeated_int32 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedInt32OrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(31, index));
};


/**
 * Adds a value to the repeated_int32 field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedInt32 = function(value) {
  this.add$Value(31, value);
};


/**
 * Returns the array of values in the repeated_int32 field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedInt32Array = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(31));
};


/**
 * @return {boolean} Whether the repeated_int32 field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedInt32 = function() {
  return this.has$Value(31);
};


/**
 * @return {number} The number of values in the repeated_int32 field.
 */
proto2.TestAllTypes.prototype.repeatedInt32Count = function() {
  return this.count$Values(31);
};


/**
 * Clears the values in the repeated_int32 field.
 */
proto2.TestAllTypes.prototype.clearRepeatedInt32 = function() {
  this.clear$Field(31);
};


/**
 * Gets the value of the repeated_int64 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?string} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedInt64 = function(index) {
  return /** @type {?string} */ (this.get$Value(32, index));
};


/**
 * Gets the value of the repeated_int64 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {string} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedInt64OrDefault = function(index) {
  return /** @type {string} */ (this.get$ValueOrDefault(32, index));
};


/**
 * Adds a value to the repeated_int64 field.
 * @param {string} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedInt64 = function(value) {
  this.add$Value(32, value);
};


/**
 * Returns the array of values in the repeated_int64 field.
 * @return {!Array.<string>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedInt64Array = function() {
  return /** @type {!Array.<string>} */ (this.array$Values(32));
};


/**
 * @return {boolean} Whether the repeated_int64 field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedInt64 = function() {
  return this.has$Value(32);
};


/**
 * @return {number} The number of values in the repeated_int64 field.
 */
proto2.TestAllTypes.prototype.repeatedInt64Count = function() {
  return this.count$Values(32);
};


/**
 * Clears the values in the repeated_int64 field.
 */
proto2.TestAllTypes.prototype.clearRepeatedInt64 = function() {
  this.clear$Field(32);
};


/**
 * Gets the value of the repeated_uint32 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedUint32 = function(index) {
  return /** @type {?number} */ (this.get$Value(33, index));
};


/**
 * Gets the value of the repeated_uint32 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedUint32OrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(33, index));
};


/**
 * Adds a value to the repeated_uint32 field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedUint32 = function(value) {
  this.add$Value(33, value);
};


/**
 * Returns the array of values in the repeated_uint32 field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedUint32Array = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(33));
};


/**
 * @return {boolean} Whether the repeated_uint32 field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedUint32 = function() {
  return this.has$Value(33);
};


/**
 * @return {number} The number of values in the repeated_uint32 field.
 */
proto2.TestAllTypes.prototype.repeatedUint32Count = function() {
  return this.count$Values(33);
};


/**
 * Clears the values in the repeated_uint32 field.
 */
proto2.TestAllTypes.prototype.clearRepeatedUint32 = function() {
  this.clear$Field(33);
};


/**
 * Gets the value of the repeated_uint64 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?string} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedUint64 = function(index) {
  return /** @type {?string} */ (this.get$Value(34, index));
};


/**
 * Gets the value of the repeated_uint64 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {string} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedUint64OrDefault = function(index) {
  return /** @type {string} */ (this.get$ValueOrDefault(34, index));
};


/**
 * Adds a value to the repeated_uint64 field.
 * @param {string} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedUint64 = function(value) {
  this.add$Value(34, value);
};


/**
 * Returns the array of values in the repeated_uint64 field.
 * @return {!Array.<string>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedUint64Array = function() {
  return /** @type {!Array.<string>} */ (this.array$Values(34));
};


/**
 * @return {boolean} Whether the repeated_uint64 field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedUint64 = function() {
  return this.has$Value(34);
};


/**
 * @return {number} The number of values in the repeated_uint64 field.
 */
proto2.TestAllTypes.prototype.repeatedUint64Count = function() {
  return this.count$Values(34);
};


/**
 * Clears the values in the repeated_uint64 field.
 */
proto2.TestAllTypes.prototype.clearRepeatedUint64 = function() {
  this.clear$Field(34);
};


/**
 * Gets the value of the repeated_sint32 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedSint32 = function(index) {
  return /** @type {?number} */ (this.get$Value(35, index));
};


/**
 * Gets the value of the repeated_sint32 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedSint32OrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(35, index));
};


/**
 * Adds a value to the repeated_sint32 field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedSint32 = function(value) {
  this.add$Value(35, value);
};


/**
 * Returns the array of values in the repeated_sint32 field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedSint32Array = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(35));
};


/**
 * @return {boolean} Whether the repeated_sint32 field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedSint32 = function() {
  return this.has$Value(35);
};


/**
 * @return {number} The number of values in the repeated_sint32 field.
 */
proto2.TestAllTypes.prototype.repeatedSint32Count = function() {
  return this.count$Values(35);
};


/**
 * Clears the values in the repeated_sint32 field.
 */
proto2.TestAllTypes.prototype.clearRepeatedSint32 = function() {
  this.clear$Field(35);
};


/**
 * Gets the value of the repeated_sint64 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?string} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedSint64 = function(index) {
  return /** @type {?string} */ (this.get$Value(36, index));
};


/**
 * Gets the value of the repeated_sint64 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {string} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedSint64OrDefault = function(index) {
  return /** @type {string} */ (this.get$ValueOrDefault(36, index));
};


/**
 * Adds a value to the repeated_sint64 field.
 * @param {string} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedSint64 = function(value) {
  this.add$Value(36, value);
};


/**
 * Returns the array of values in the repeated_sint64 field.
 * @return {!Array.<string>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedSint64Array = function() {
  return /** @type {!Array.<string>} */ (this.array$Values(36));
};


/**
 * @return {boolean} Whether the repeated_sint64 field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedSint64 = function() {
  return this.has$Value(36);
};


/**
 * @return {number} The number of values in the repeated_sint64 field.
 */
proto2.TestAllTypes.prototype.repeatedSint64Count = function() {
  return this.count$Values(36);
};


/**
 * Clears the values in the repeated_sint64 field.
 */
proto2.TestAllTypes.prototype.clearRepeatedSint64 = function() {
  this.clear$Field(36);
};


/**
 * Gets the value of the repeated_fixed32 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedFixed32 = function(index) {
  return /** @type {?number} */ (this.get$Value(37, index));
};


/**
 * Gets the value of the repeated_fixed32 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedFixed32OrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(37, index));
};


/**
 * Adds a value to the repeated_fixed32 field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedFixed32 = function(value) {
  this.add$Value(37, value);
};


/**
 * Returns the array of values in the repeated_fixed32 field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedFixed32Array = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(37));
};


/**
 * @return {boolean} Whether the repeated_fixed32 field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedFixed32 = function() {
  return this.has$Value(37);
};


/**
 * @return {number} The number of values in the repeated_fixed32 field.
 */
proto2.TestAllTypes.prototype.repeatedFixed32Count = function() {
  return this.count$Values(37);
};


/**
 * Clears the values in the repeated_fixed32 field.
 */
proto2.TestAllTypes.prototype.clearRepeatedFixed32 = function() {
  this.clear$Field(37);
};


/**
 * Gets the value of the repeated_fixed64 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?string} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedFixed64 = function(index) {
  return /** @type {?string} */ (this.get$Value(38, index));
};


/**
 * Gets the value of the repeated_fixed64 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {string} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedFixed64OrDefault = function(index) {
  return /** @type {string} */ (this.get$ValueOrDefault(38, index));
};


/**
 * Adds a value to the repeated_fixed64 field.
 * @param {string} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedFixed64 = function(value) {
  this.add$Value(38, value);
};


/**
 * Returns the array of values in the repeated_fixed64 field.
 * @return {!Array.<string>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedFixed64Array = function() {
  return /** @type {!Array.<string>} */ (this.array$Values(38));
};


/**
 * @return {boolean} Whether the repeated_fixed64 field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedFixed64 = function() {
  return this.has$Value(38);
};


/**
 * @return {number} The number of values in the repeated_fixed64 field.
 */
proto2.TestAllTypes.prototype.repeatedFixed64Count = function() {
  return this.count$Values(38);
};


/**
 * Clears the values in the repeated_fixed64 field.
 */
proto2.TestAllTypes.prototype.clearRepeatedFixed64 = function() {
  this.clear$Field(38);
};


/**
 * Gets the value of the repeated_sfixed32 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedSfixed32 = function(index) {
  return /** @type {?number} */ (this.get$Value(39, index));
};


/**
 * Gets the value of the repeated_sfixed32 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedSfixed32OrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(39, index));
};


/**
 * Adds a value to the repeated_sfixed32 field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedSfixed32 = function(value) {
  this.add$Value(39, value);
};


/**
 * Returns the array of values in the repeated_sfixed32 field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedSfixed32Array = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(39));
};


/**
 * @return {boolean} Whether the repeated_sfixed32 field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedSfixed32 = function() {
  return this.has$Value(39);
};


/**
 * @return {number} The number of values in the repeated_sfixed32 field.
 */
proto2.TestAllTypes.prototype.repeatedSfixed32Count = function() {
  return this.count$Values(39);
};


/**
 * Clears the values in the repeated_sfixed32 field.
 */
proto2.TestAllTypes.prototype.clearRepeatedSfixed32 = function() {
  this.clear$Field(39);
};


/**
 * Gets the value of the repeated_sfixed64 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?string} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedSfixed64 = function(index) {
  return /** @type {?string} */ (this.get$Value(40, index));
};


/**
 * Gets the value of the repeated_sfixed64 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {string} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedSfixed64OrDefault = function(index) {
  return /** @type {string} */ (this.get$ValueOrDefault(40, index));
};


/**
 * Adds a value to the repeated_sfixed64 field.
 * @param {string} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedSfixed64 = function(value) {
  this.add$Value(40, value);
};


/**
 * Returns the array of values in the repeated_sfixed64 field.
 * @return {!Array.<string>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedSfixed64Array = function() {
  return /** @type {!Array.<string>} */ (this.array$Values(40));
};


/**
 * @return {boolean} Whether the repeated_sfixed64 field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedSfixed64 = function() {
  return this.has$Value(40);
};


/**
 * @return {number} The number of values in the repeated_sfixed64 field.
 */
proto2.TestAllTypes.prototype.repeatedSfixed64Count = function() {
  return this.count$Values(40);
};


/**
 * Clears the values in the repeated_sfixed64 field.
 */
proto2.TestAllTypes.prototype.clearRepeatedSfixed64 = function() {
  this.clear$Field(40);
};


/**
 * Gets the value of the repeated_float field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedFloat = function(index) {
  return /** @type {?number} */ (this.get$Value(41, index));
};


/**
 * Gets the value of the repeated_float field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedFloatOrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(41, index));
};


/**
 * Adds a value to the repeated_float field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedFloat = function(value) {
  this.add$Value(41, value);
};


/**
 * Returns the array of values in the repeated_float field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedFloatArray = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(41));
};


/**
 * @return {boolean} Whether the repeated_float field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedFloat = function() {
  return this.has$Value(41);
};


/**
 * @return {number} The number of values in the repeated_float field.
 */
proto2.TestAllTypes.prototype.repeatedFloatCount = function() {
  return this.count$Values(41);
};


/**
 * Clears the values in the repeated_float field.
 */
proto2.TestAllTypes.prototype.clearRepeatedFloat = function() {
  this.clear$Field(41);
};


/**
 * Gets the value of the repeated_double field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedDouble = function(index) {
  return /** @type {?number} */ (this.get$Value(42, index));
};


/**
 * Gets the value of the repeated_double field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedDoubleOrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(42, index));
};


/**
 * Adds a value to the repeated_double field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedDouble = function(value) {
  this.add$Value(42, value);
};


/**
 * Returns the array of values in the repeated_double field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedDoubleArray = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(42));
};


/**
 * @return {boolean} Whether the repeated_double field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedDouble = function() {
  return this.has$Value(42);
};


/**
 * @return {number} The number of values in the repeated_double field.
 */
proto2.TestAllTypes.prototype.repeatedDoubleCount = function() {
  return this.count$Values(42);
};


/**
 * Clears the values in the repeated_double field.
 */
proto2.TestAllTypes.prototype.clearRepeatedDouble = function() {
  this.clear$Field(42);
};


/**
 * Gets the value of the repeated_bool field at the index given.
 * @param {number} index The index to lookup.
 * @return {?boolean} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedBool = function(index) {
  return /** @type {?boolean} */ (this.get$Value(43, index));
};


/**
 * Gets the value of the repeated_bool field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {boolean} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedBoolOrDefault = function(index) {
  return /** @type {boolean} */ (this.get$ValueOrDefault(43, index));
};


/**
 * Adds a value to the repeated_bool field.
 * @param {boolean} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedBool = function(value) {
  this.add$Value(43, value);
};


/**
 * Returns the array of values in the repeated_bool field.
 * @return {!Array.<boolean>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedBoolArray = function() {
  return /** @type {!Array.<boolean>} */ (this.array$Values(43));
};


/**
 * @return {boolean} Whether the repeated_bool field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedBool = function() {
  return this.has$Value(43);
};


/**
 * @return {number} The number of values in the repeated_bool field.
 */
proto2.TestAllTypes.prototype.repeatedBoolCount = function() {
  return this.count$Values(43);
};


/**
 * Clears the values in the repeated_bool field.
 */
proto2.TestAllTypes.prototype.clearRepeatedBool = function() {
  this.clear$Field(43);
};


/**
 * Gets the value of the repeated_string field at the index given.
 * @param {number} index The index to lookup.
 * @return {?string} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedString = function(index) {
  return /** @type {?string} */ (this.get$Value(44, index));
};


/**
 * Gets the value of the repeated_string field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {string} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedStringOrDefault = function(index) {
  return /** @type {string} */ (this.get$ValueOrDefault(44, index));
};


/**
 * Adds a value to the repeated_string field.
 * @param {string} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedString = function(value) {
  this.add$Value(44, value);
};


/**
 * Returns the array of values in the repeated_string field.
 * @return {!Array.<string>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedStringArray = function() {
  return /** @type {!Array.<string>} */ (this.array$Values(44));
};


/**
 * @return {boolean} Whether the repeated_string field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedString = function() {
  return this.has$Value(44);
};


/**
 * @return {number} The number of values in the repeated_string field.
 */
proto2.TestAllTypes.prototype.repeatedStringCount = function() {
  return this.count$Values(44);
};


/**
 * Clears the values in the repeated_string field.
 */
proto2.TestAllTypes.prototype.clearRepeatedString = function() {
  this.clear$Field(44);
};


/**
 * Gets the value of the repeated_bytes field at the index given.
 * @param {number} index The index to lookup.
 * @return {?string} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedBytes = function(index) {
  return /** @type {?string} */ (this.get$Value(45, index));
};


/**
 * Gets the value of the repeated_bytes field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {string} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedBytesOrDefault = function(index) {
  return /** @type {string} */ (this.get$ValueOrDefault(45, index));
};


/**
 * Adds a value to the repeated_bytes field.
 * @param {string} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedBytes = function(value) {
  this.add$Value(45, value);
};


/**
 * Returns the array of values in the repeated_bytes field.
 * @return {!Array.<string>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedBytesArray = function() {
  return /** @type {!Array.<string>} */ (this.array$Values(45));
};


/**
 * @return {boolean} Whether the repeated_bytes field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedBytes = function() {
  return this.has$Value(45);
};


/**
 * @return {number} The number of values in the repeated_bytes field.
 */
proto2.TestAllTypes.prototype.repeatedBytesCount = function() {
  return this.count$Values(45);
};


/**
 * Clears the values in the repeated_bytes field.
 */
proto2.TestAllTypes.prototype.clearRepeatedBytes = function() {
  this.clear$Field(45);
};


/**
 * Gets the value of the repeatedgroup field at the index given.
 * @param {number} index The index to lookup.
 * @return {proto2.TestAllTypes.RepeatedGroup} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedgroup = function(index) {
  return /** @type {proto2.TestAllTypes.RepeatedGroup} */ (this.get$Value(46, index));
};


/**
 * Gets the value of the repeatedgroup field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {!proto2.TestAllTypes.RepeatedGroup} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedgroupOrDefault = function(index) {
  return /** @type {!proto2.TestAllTypes.RepeatedGroup} */ (this.get$ValueOrDefault(46, index));
};


/**
 * Adds a value to the repeatedgroup field.
 * @param {!proto2.TestAllTypes.RepeatedGroup} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedgroup = function(value) {
  this.add$Value(46, value);
};


/**
 * Returns the array of values in the repeatedgroup field.
 * @return {!Array.<!proto2.TestAllTypes.RepeatedGroup>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedgroupArray = function() {
  return /** @type {!Array.<!proto2.TestAllTypes.RepeatedGroup>} */ (this.array$Values(46));
};


/**
 * @return {boolean} Whether the repeatedgroup field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedgroup = function() {
  return this.has$Value(46);
};


/**
 * @return {number} The number of values in the repeatedgroup field.
 */
proto2.TestAllTypes.prototype.repeatedgroupCount = function() {
  return this.count$Values(46);
};


/**
 * Clears the values in the repeatedgroup field.
 */
proto2.TestAllTypes.prototype.clearRepeatedgroup = function() {
  this.clear$Field(46);
};


/**
 * Gets the value of the repeated_nested_message field at the index given.
 * @param {number} index The index to lookup.
 * @return {proto2.TestAllTypes.NestedMessage} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedNestedMessage = function(index) {
  return /** @type {proto2.TestAllTypes.NestedMessage} */ (this.get$Value(48, index));
};


/**
 * Gets the value of the repeated_nested_message field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {!proto2.TestAllTypes.NestedMessage} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedNestedMessageOrDefault = function(index) {
  return /** @type {!proto2.TestAllTypes.NestedMessage} */ (this.get$ValueOrDefault(48, index));
};


/**
 * Adds a value to the repeated_nested_message field.
 * @param {!proto2.TestAllTypes.NestedMessage} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedNestedMessage = function(value) {
  this.add$Value(48, value);
};


/**
 * Returns the array of values in the repeated_nested_message field.
 * @return {!Array.<!proto2.TestAllTypes.NestedMessage>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedNestedMessageArray = function() {
  return /** @type {!Array.<!proto2.TestAllTypes.NestedMessage>} */ (this.array$Values(48));
};


/**
 * @return {boolean} Whether the repeated_nested_message field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedNestedMessage = function() {
  return this.has$Value(48);
};


/**
 * @return {number} The number of values in the repeated_nested_message field.
 */
proto2.TestAllTypes.prototype.repeatedNestedMessageCount = function() {
  return this.count$Values(48);
};


/**
 * Clears the values in the repeated_nested_message field.
 */
proto2.TestAllTypes.prototype.clearRepeatedNestedMessage = function() {
  this.clear$Field(48);
};


/**
 * Gets the value of the repeated_nested_enum field at the index given.
 * @param {number} index The index to lookup.
 * @return {?proto2.TestAllTypes.NestedEnum} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedNestedEnum = function(index) {
  return /** @type {?proto2.TestAllTypes.NestedEnum} */ (this.get$Value(49, index));
};


/**
 * Gets the value of the repeated_nested_enum field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {proto2.TestAllTypes.NestedEnum} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedNestedEnumOrDefault = function(index) {
  return /** @type {proto2.TestAllTypes.NestedEnum} */ (this.get$ValueOrDefault(49, index));
};


/**
 * Adds a value to the repeated_nested_enum field.
 * @param {proto2.TestAllTypes.NestedEnum} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedNestedEnum = function(value) {
  this.add$Value(49, value);
};


/**
 * Returns the array of values in the repeated_nested_enum field.
 * @return {!Array.<proto2.TestAllTypes.NestedEnum>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedNestedEnumArray = function() {
  return /** @type {!Array.<proto2.TestAllTypes.NestedEnum>} */ (this.array$Values(49));
};


/**
 * @return {boolean} Whether the repeated_nested_enum field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedNestedEnum = function() {
  return this.has$Value(49);
};


/**
 * @return {number} The number of values in the repeated_nested_enum field.
 */
proto2.TestAllTypes.prototype.repeatedNestedEnumCount = function() {
  return this.count$Values(49);
};


/**
 * Clears the values in the repeated_nested_enum field.
 */
proto2.TestAllTypes.prototype.clearRepeatedNestedEnum = function() {
  this.clear$Field(49);
};


/**
 * Gets the value of the repeated_int64_number field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedInt64Number = function(index) {
  return /** @type {?number} */ (this.get$Value(52, index));
};


/**
 * Gets the value of the repeated_int64_number field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedInt64NumberOrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(52, index));
};


/**
 * Adds a value to the repeated_int64_number field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedInt64Number = function(value) {
  this.add$Value(52, value);
};


/**
 * Returns the array of values in the repeated_int64_number field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedInt64NumberArray = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(52));
};


/**
 * @return {boolean} Whether the repeated_int64_number field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedInt64Number = function() {
  return this.has$Value(52);
};


/**
 * @return {number} The number of values in the repeated_int64_number field.
 */
proto2.TestAllTypes.prototype.repeatedInt64NumberCount = function() {
  return this.count$Values(52);
};


/**
 * Clears the values in the repeated_int64_number field.
 */
proto2.TestAllTypes.prototype.clearRepeatedInt64Number = function() {
  this.clear$Field(52);
};


/**
 * Gets the value of the repeated_int64_string field at the index given.
 * @param {number} index The index to lookup.
 * @return {?string} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedInt64String = function(index) {
  return /** @type {?string} */ (this.get$Value(53, index));
};


/**
 * Gets the value of the repeated_int64_string field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {string} The value.
 */
proto2.TestAllTypes.prototype.getRepeatedInt64StringOrDefault = function(index) {
  return /** @type {string} */ (this.get$ValueOrDefault(53, index));
};


/**
 * Adds a value to the repeated_int64_string field.
 * @param {string} value The value to add.
 */
proto2.TestAllTypes.prototype.addRepeatedInt64String = function(value) {
  this.add$Value(53, value);
};


/**
 * Returns the array of values in the repeated_int64_string field.
 * @return {!Array.<string>} The values in the field.
 */
proto2.TestAllTypes.prototype.repeatedInt64StringArray = function() {
  return /** @type {!Array.<string>} */ (this.array$Values(53));
};


/**
 * @return {boolean} Whether the repeated_int64_string field has a value.
 */
proto2.TestAllTypes.prototype.hasRepeatedInt64String = function() {
  return this.has$Value(53);
};


/**
 * @return {number} The number of values in the repeated_int64_string field.
 */
proto2.TestAllTypes.prototype.repeatedInt64StringCount = function() {
  return this.count$Values(53);
};


/**
 * Clears the values in the repeated_int64_string field.
 */
proto2.TestAllTypes.prototype.clearRepeatedInt64String = function() {
  this.clear$Field(53);
};


/**
 * Gets the value of the packed_int32 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getPackedInt32 = function(index) {
  return /** @type {?number} */ (this.get$Value(54, index));
};


/**
 * Gets the value of the packed_int32 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getPackedInt32OrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(54, index));
};


/**
 * Adds a value to the packed_int32 field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addPackedInt32 = function(value) {
  this.add$Value(54, value);
};


/**
 * Returns the array of values in the packed_int32 field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.packedInt32Array = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(54));
};


/**
 * @return {boolean} Whether the packed_int32 field has a value.
 */
proto2.TestAllTypes.prototype.hasPackedInt32 = function() {
  return this.has$Value(54);
};


/**
 * @return {number} The number of values in the packed_int32 field.
 */
proto2.TestAllTypes.prototype.packedInt32Count = function() {
  return this.count$Values(54);
};


/**
 * Clears the values in the packed_int32 field.
 */
proto2.TestAllTypes.prototype.clearPackedInt32 = function() {
  this.clear$Field(54);
};


/**
 * Gets the value of the packed_int64 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getPackedInt64 = function(index) {
  return /** @type {?number} */ (this.get$Value(55, index));
};


/**
 * Gets the value of the packed_int64 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getPackedInt64OrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(55, index));
};


/**
 * Adds a value to the packed_int64 field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addPackedInt64 = function(value) {
  this.add$Value(55, value);
};


/**
 * Returns the array of values in the packed_int64 field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.packedInt64Array = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(55));
};


/**
 * @return {boolean} Whether the packed_int64 field has a value.
 */
proto2.TestAllTypes.prototype.hasPackedInt64 = function() {
  return this.has$Value(55);
};


/**
 * @return {number} The number of values in the packed_int64 field.
 */
proto2.TestAllTypes.prototype.packedInt64Count = function() {
  return this.count$Values(55);
};


/**
 * Clears the values in the packed_int64 field.
 */
proto2.TestAllTypes.prototype.clearPackedInt64 = function() {
  this.clear$Field(55);
};


/**
 * Gets the value of the packed_uint32 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getPackedUint32 = function(index) {
  return /** @type {?number} */ (this.get$Value(56, index));
};


/**
 * Gets the value of the packed_uint32 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getPackedUint32OrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(56, index));
};


/**
 * Adds a value to the packed_uint32 field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addPackedUint32 = function(value) {
  this.add$Value(56, value);
};


/**
 * Returns the array of values in the packed_uint32 field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.packedUint32Array = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(56));
};


/**
 * @return {boolean} Whether the packed_uint32 field has a value.
 */
proto2.TestAllTypes.prototype.hasPackedUint32 = function() {
  return this.has$Value(56);
};


/**
 * @return {number} The number of values in the packed_uint32 field.
 */
proto2.TestAllTypes.prototype.packedUint32Count = function() {
  return this.count$Values(56);
};


/**
 * Clears the values in the packed_uint32 field.
 */
proto2.TestAllTypes.prototype.clearPackedUint32 = function() {
  this.clear$Field(56);
};


/**
 * Gets the value of the packed_uint64 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getPackedUint64 = function(index) {
  return /** @type {?number} */ (this.get$Value(57, index));
};


/**
 * Gets the value of the packed_uint64 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getPackedUint64OrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(57, index));
};


/**
 * Adds a value to the packed_uint64 field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addPackedUint64 = function(value) {
  this.add$Value(57, value);
};


/**
 * Returns the array of values in the packed_uint64 field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.packedUint64Array = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(57));
};


/**
 * @return {boolean} Whether the packed_uint64 field has a value.
 */
proto2.TestAllTypes.prototype.hasPackedUint64 = function() {
  return this.has$Value(57);
};


/**
 * @return {number} The number of values in the packed_uint64 field.
 */
proto2.TestAllTypes.prototype.packedUint64Count = function() {
  return this.count$Values(57);
};


/**
 * Clears the values in the packed_uint64 field.
 */
proto2.TestAllTypes.prototype.clearPackedUint64 = function() {
  this.clear$Field(57);
};


/**
 * Gets the value of the packed_sint32 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getPackedSint32 = function(index) {
  return /** @type {?number} */ (this.get$Value(58, index));
};


/**
 * Gets the value of the packed_sint32 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getPackedSint32OrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(58, index));
};


/**
 * Adds a value to the packed_sint32 field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addPackedSint32 = function(value) {
  this.add$Value(58, value);
};


/**
 * Returns the array of values in the packed_sint32 field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.packedSint32Array = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(58));
};


/**
 * @return {boolean} Whether the packed_sint32 field has a value.
 */
proto2.TestAllTypes.prototype.hasPackedSint32 = function() {
  return this.has$Value(58);
};


/**
 * @return {number} The number of values in the packed_sint32 field.
 */
proto2.TestAllTypes.prototype.packedSint32Count = function() {
  return this.count$Values(58);
};


/**
 * Clears the values in the packed_sint32 field.
 */
proto2.TestAllTypes.prototype.clearPackedSint32 = function() {
  this.clear$Field(58);
};


/**
 * Gets the value of the packed_sint64 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getPackedSint64 = function(index) {
  return /** @type {?number} */ (this.get$Value(59, index));
};


/**
 * Gets the value of the packed_sint64 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getPackedSint64OrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(59, index));
};


/**
 * Adds a value to the packed_sint64 field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addPackedSint64 = function(value) {
  this.add$Value(59, value);
};


/**
 * Returns the array of values in the packed_sint64 field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.packedSint64Array = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(59));
};


/**
 * @return {boolean} Whether the packed_sint64 field has a value.
 */
proto2.TestAllTypes.prototype.hasPackedSint64 = function() {
  return this.has$Value(59);
};


/**
 * @return {number} The number of values in the packed_sint64 field.
 */
proto2.TestAllTypes.prototype.packedSint64Count = function() {
  return this.count$Values(59);
};


/**
 * Clears the values in the packed_sint64 field.
 */
proto2.TestAllTypes.prototype.clearPackedSint64 = function() {
  this.clear$Field(59);
};


/**
 * Gets the value of the packed_fixed32 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getPackedFixed32 = function(index) {
  return /** @type {?number} */ (this.get$Value(60, index));
};


/**
 * Gets the value of the packed_fixed32 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getPackedFixed32OrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(60, index));
};


/**
 * Adds a value to the packed_fixed32 field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addPackedFixed32 = function(value) {
  this.add$Value(60, value);
};


/**
 * Returns the array of values in the packed_fixed32 field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.packedFixed32Array = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(60));
};


/**
 * @return {boolean} Whether the packed_fixed32 field has a value.
 */
proto2.TestAllTypes.prototype.hasPackedFixed32 = function() {
  return this.has$Value(60);
};


/**
 * @return {number} The number of values in the packed_fixed32 field.
 */
proto2.TestAllTypes.prototype.packedFixed32Count = function() {
  return this.count$Values(60);
};


/**
 * Clears the values in the packed_fixed32 field.
 */
proto2.TestAllTypes.prototype.clearPackedFixed32 = function() {
  this.clear$Field(60);
};


/**
 * Gets the value of the packed_fixed64 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getPackedFixed64 = function(index) {
  return /** @type {?number} */ (this.get$Value(61, index));
};


/**
 * Gets the value of the packed_fixed64 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getPackedFixed64OrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(61, index));
};


/**
 * Adds a value to the packed_fixed64 field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addPackedFixed64 = function(value) {
  this.add$Value(61, value);
};


/**
 * Returns the array of values in the packed_fixed64 field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.packedFixed64Array = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(61));
};


/**
 * @return {boolean} Whether the packed_fixed64 field has a value.
 */
proto2.TestAllTypes.prototype.hasPackedFixed64 = function() {
  return this.has$Value(61);
};


/**
 * @return {number} The number of values in the packed_fixed64 field.
 */
proto2.TestAllTypes.prototype.packedFixed64Count = function() {
  return this.count$Values(61);
};


/**
 * Clears the values in the packed_fixed64 field.
 */
proto2.TestAllTypes.prototype.clearPackedFixed64 = function() {
  this.clear$Field(61);
};


/**
 * Gets the value of the packed_sfixed32 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getPackedSfixed32 = function(index) {
  return /** @type {?number} */ (this.get$Value(62, index));
};


/**
 * Gets the value of the packed_sfixed32 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getPackedSfixed32OrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(62, index));
};


/**
 * Adds a value to the packed_sfixed32 field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addPackedSfixed32 = function(value) {
  this.add$Value(62, value);
};


/**
 * Returns the array of values in the packed_sfixed32 field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.packedSfixed32Array = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(62));
};


/**
 * @return {boolean} Whether the packed_sfixed32 field has a value.
 */
proto2.TestAllTypes.prototype.hasPackedSfixed32 = function() {
  return this.has$Value(62);
};


/**
 * @return {number} The number of values in the packed_sfixed32 field.
 */
proto2.TestAllTypes.prototype.packedSfixed32Count = function() {
  return this.count$Values(62);
};


/**
 * Clears the values in the packed_sfixed32 field.
 */
proto2.TestAllTypes.prototype.clearPackedSfixed32 = function() {
  this.clear$Field(62);
};


/**
 * Gets the value of the packed_sfixed64 field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getPackedSfixed64 = function(index) {
  return /** @type {?number} */ (this.get$Value(63, index));
};


/**
 * Gets the value of the packed_sfixed64 field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getPackedSfixed64OrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(63, index));
};


/**
 * Adds a value to the packed_sfixed64 field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addPackedSfixed64 = function(value) {
  this.add$Value(63, value);
};


/**
 * Returns the array of values in the packed_sfixed64 field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.packedSfixed64Array = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(63));
};


/**
 * @return {boolean} Whether the packed_sfixed64 field has a value.
 */
proto2.TestAllTypes.prototype.hasPackedSfixed64 = function() {
  return this.has$Value(63);
};


/**
 * @return {number} The number of values in the packed_sfixed64 field.
 */
proto2.TestAllTypes.prototype.packedSfixed64Count = function() {
  return this.count$Values(63);
};


/**
 * Clears the values in the packed_sfixed64 field.
 */
proto2.TestAllTypes.prototype.clearPackedSfixed64 = function() {
  this.clear$Field(63);
};


/**
 * Gets the value of the packed_float field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getPackedFloat = function(index) {
  return /** @type {?number} */ (this.get$Value(64, index));
};


/**
 * Gets the value of the packed_float field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getPackedFloatOrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(64, index));
};


/**
 * Adds a value to the packed_float field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addPackedFloat = function(value) {
  this.add$Value(64, value);
};


/**
 * Returns the array of values in the packed_float field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.packedFloatArray = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(64));
};


/**
 * @return {boolean} Whether the packed_float field has a value.
 */
proto2.TestAllTypes.prototype.hasPackedFloat = function() {
  return this.has$Value(64);
};


/**
 * @return {number} The number of values in the packed_float field.
 */
proto2.TestAllTypes.prototype.packedFloatCount = function() {
  return this.count$Values(64);
};


/**
 * Clears the values in the packed_float field.
 */
proto2.TestAllTypes.prototype.clearPackedFloat = function() {
  this.clear$Field(64);
};


/**
 * Gets the value of the packed_double field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.prototype.getPackedDouble = function(index) {
  return /** @type {?number} */ (this.get$Value(65, index));
};


/**
 * Gets the value of the packed_double field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.prototype.getPackedDoubleOrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(65, index));
};


/**
 * Adds a value to the packed_double field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.prototype.addPackedDouble = function(value) {
  this.add$Value(65, value);
};


/**
 * Returns the array of values in the packed_double field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.prototype.packedDoubleArray = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(65));
};


/**
 * @return {boolean} Whether the packed_double field has a value.
 */
proto2.TestAllTypes.prototype.hasPackedDouble = function() {
  return this.has$Value(65);
};


/**
 * @return {number} The number of values in the packed_double field.
 */
proto2.TestAllTypes.prototype.packedDoubleCount = function() {
  return this.count$Values(65);
};


/**
 * Clears the values in the packed_double field.
 */
proto2.TestAllTypes.prototype.clearPackedDouble = function() {
  this.clear$Field(65);
};


/**
 * Gets the value of the packed_bool field at the index given.
 * @param {number} index The index to lookup.
 * @return {?boolean} The value.
 */
proto2.TestAllTypes.prototype.getPackedBool = function(index) {
  return /** @type {?boolean} */ (this.get$Value(66, index));
};


/**
 * Gets the value of the packed_bool field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {boolean} The value.
 */
proto2.TestAllTypes.prototype.getPackedBoolOrDefault = function(index) {
  return /** @type {boolean} */ (this.get$ValueOrDefault(66, index));
};


/**
 * Adds a value to the packed_bool field.
 * @param {boolean} value The value to add.
 */
proto2.TestAllTypes.prototype.addPackedBool = function(value) {
  this.add$Value(66, value);
};


/**
 * Returns the array of values in the packed_bool field.
 * @return {!Array.<boolean>} The values in the field.
 */
proto2.TestAllTypes.prototype.packedBoolArray = function() {
  return /** @type {!Array.<boolean>} */ (this.array$Values(66));
};


/**
 * @return {boolean} Whether the packed_bool field has a value.
 */
proto2.TestAllTypes.prototype.hasPackedBool = function() {
  return this.has$Value(66);
};


/**
 * @return {number} The number of values in the packed_bool field.
 */
proto2.TestAllTypes.prototype.packedBoolCount = function() {
  return this.count$Values(66);
};


/**
 * Clears the values in the packed_bool field.
 */
proto2.TestAllTypes.prototype.clearPackedBool = function() {
  this.clear$Field(66);
};


/**
 * Enumeration NestedEnum.
 * @enum {number}
 */
proto2.TestAllTypes.NestedEnum = {
  FOO: 0,
  BAR: 2,
  BAZ: 3
};



/**
 * Message NestedMessage.
 * @constructor
 * @extends {goog.proto2.Message}
 */
proto2.TestAllTypes.NestedMessage = function() {
  goog.proto2.Message.call(this);
};
goog.inherits(proto2.TestAllTypes.NestedMessage, goog.proto2.Message);


/**
 * Overrides {@link goog.proto2.Message#clone} to specify its exact return type.
 * @return {!proto2.TestAllTypes.NestedMessage} The cloned message.
 * @override
 */
proto2.TestAllTypes.NestedMessage.prototype.clone;


/**
 * Gets the value of the b field.
 * @return {?number} The value.
 */
proto2.TestAllTypes.NestedMessage.prototype.getB = function() {
  return /** @type {?number} */ (this.get$Value(1));
};


/**
 * Gets the value of the b field or the default value if not set.
 * @return {number} The value.
 */
proto2.TestAllTypes.NestedMessage.prototype.getBOrDefault = function() {
  return /** @type {number} */ (this.get$ValueOrDefault(1));
};


/**
 * Sets the value of the b field.
 * @param {number} value The value.
 */
proto2.TestAllTypes.NestedMessage.prototype.setB = function(value) {
  this.set$Value(1, value);
};


/**
 * @return {boolean} Whether the b field has a value.
 */
proto2.TestAllTypes.NestedMessage.prototype.hasB = function() {
  return this.has$Value(1);
};


/**
 * @return {number} The number of values in the b field.
 */
proto2.TestAllTypes.NestedMessage.prototype.bCount = function() {
  return this.count$Values(1);
};


/**
 * Clears the values in the b field.
 */
proto2.TestAllTypes.NestedMessage.prototype.clearB = function() {
  this.clear$Field(1);
};


/**
 * Gets the value of the c field.
 * @return {?number} The value.
 */
proto2.TestAllTypes.NestedMessage.prototype.getC = function() {
  return /** @type {?number} */ (this.get$Value(2));
};


/**
 * Gets the value of the c field or the default value if not set.
 * @return {number} The value.
 */
proto2.TestAllTypes.NestedMessage.prototype.getCOrDefault = function() {
  return /** @type {number} */ (this.get$ValueOrDefault(2));
};


/**
 * Sets the value of the c field.
 * @param {number} value The value.
 */
proto2.TestAllTypes.NestedMessage.prototype.setC = function(value) {
  this.set$Value(2, value);
};


/**
 * @return {boolean} Whether the c field has a value.
 */
proto2.TestAllTypes.NestedMessage.prototype.hasC = function() {
  return this.has$Value(2);
};


/**
 * @return {number} The number of values in the c field.
 */
proto2.TestAllTypes.NestedMessage.prototype.cCount = function() {
  return this.count$Values(2);
};


/**
 * Clears the values in the c field.
 */
proto2.TestAllTypes.NestedMessage.prototype.clearC = function() {
  this.clear$Field(2);
};



/**
 * Message OptionalGroup.
 * @constructor
 * @extends {goog.proto2.Message}
 */
proto2.TestAllTypes.OptionalGroup = function() {
  goog.proto2.Message.call(this);
};
goog.inherits(proto2.TestAllTypes.OptionalGroup, goog.proto2.Message);


/**
 * Overrides {@link goog.proto2.Message#clone} to specify its exact return type.
 * @return {!proto2.TestAllTypes.OptionalGroup} The cloned message.
 * @override
 */
proto2.TestAllTypes.OptionalGroup.prototype.clone;


/**
 * Gets the value of the a field.
 * @return {?number} The value.
 */
proto2.TestAllTypes.OptionalGroup.prototype.getA = function() {
  return /** @type {?number} */ (this.get$Value(17));
};


/**
 * Gets the value of the a field or the default value if not set.
 * @return {number} The value.
 */
proto2.TestAllTypes.OptionalGroup.prototype.getAOrDefault = function() {
  return /** @type {number} */ (this.get$ValueOrDefault(17));
};


/**
 * Sets the value of the a field.
 * @param {number} value The value.
 */
proto2.TestAllTypes.OptionalGroup.prototype.setA = function(value) {
  this.set$Value(17, value);
};


/**
 * @return {boolean} Whether the a field has a value.
 */
proto2.TestAllTypes.OptionalGroup.prototype.hasA = function() {
  return this.has$Value(17);
};


/**
 * @return {number} The number of values in the a field.
 */
proto2.TestAllTypes.OptionalGroup.prototype.aCount = function() {
  return this.count$Values(17);
};


/**
 * Clears the values in the a field.
 */
proto2.TestAllTypes.OptionalGroup.prototype.clearA = function() {
  this.clear$Field(17);
};



/**
 * Message RepeatedGroup.
 * @constructor
 * @extends {goog.proto2.Message}
 */
proto2.TestAllTypes.RepeatedGroup = function() {
  goog.proto2.Message.call(this);
};
goog.inherits(proto2.TestAllTypes.RepeatedGroup, goog.proto2.Message);


/**
 * Overrides {@link goog.proto2.Message#clone} to specify its exact return type.
 * @return {!proto2.TestAllTypes.RepeatedGroup} The cloned message.
 * @override
 */
proto2.TestAllTypes.RepeatedGroup.prototype.clone;


/**
 * Gets the value of the a field at the index given.
 * @param {number} index The index to lookup.
 * @return {?number} The value.
 */
proto2.TestAllTypes.RepeatedGroup.prototype.getA = function(index) {
  return /** @type {?number} */ (this.get$Value(47, index));
};


/**
 * Gets the value of the a field at the index given or the default value if not set.
 * @param {number} index The index to lookup.
 * @return {number} The value.
 */
proto2.TestAllTypes.RepeatedGroup.prototype.getAOrDefault = function(index) {
  return /** @type {number} */ (this.get$ValueOrDefault(47, index));
};


/**
 * Adds a value to the a field.
 * @param {number} value The value to add.
 */
proto2.TestAllTypes.RepeatedGroup.prototype.addA = function(value) {
  this.add$Value(47, value);
};


/**
 * Returns the array of values in the a field.
 * @return {!Array.<number>} The values in the field.
 */
proto2.TestAllTypes.RepeatedGroup.prototype.aArray = function() {
  return /** @type {!Array.<number>} */ (this.array$Values(47));
};


/**
 * @return {boolean} Whether the a field has a value.
 */
proto2.TestAllTypes.RepeatedGroup.prototype.hasA = function() {
  return this.has$Value(47);
};


/**
 * @return {number} The number of values in the a field.
 */
proto2.TestAllTypes.RepeatedGroup.prototype.aCount = function() {
  return this.count$Values(47);
};


/**
 * Clears the values in the a field.
 */
proto2.TestAllTypes.RepeatedGroup.prototype.clearA = function() {
  this.clear$Field(47);
};



/**
 * Message TestDefaultParent.
 * @constructor
 * @extends {goog.proto2.Message}
 */
proto2.TestDefaultParent = function() {
  goog.proto2.Message.call(this);
};
goog.inherits(proto2.TestDefaultParent, goog.proto2.Message);


/**
 * Overrides {@link goog.proto2.Message#clone} to specify its exact return type.
 * @return {!proto2.TestDefaultParent} The cloned message.
 * @override
 */
proto2.TestDefaultParent.prototype.clone;


/**
 * Gets the value of the child field.
 * @return {proto2.TestDefaultChild} The value.
 */
proto2.TestDefaultParent.prototype.getChild = function() {
  return /** @type {proto2.TestDefaultChild} */ (this.get$Value(1));
};


/**
 * Gets the value of the child field or the default value if not set.
 * @return {!proto2.TestDefaultChild} The value.
 */
proto2.TestDefaultParent.prototype.getChildOrDefault = function() {
  return /** @type {!proto2.TestDefaultChild} */ (this.get$ValueOrDefault(1));
};


/**
 * Sets the value of the child field.
 * @param {!proto2.TestDefaultChild} value The value.
 */
proto2.TestDefaultParent.prototype.setChild = function(value) {
  this.set$Value(1, value);
};


/**
 * @return {boolean} Whether the child field has a value.
 */
proto2.TestDefaultParent.prototype.hasChild = function() {
  return this.has$Value(1);
};


/**
 * @return {number} The number of values in the child field.
 */
proto2.TestDefaultParent.prototype.childCount = function() {
  return this.count$Values(1);
};


/**
 * Clears the values in the child field.
 */
proto2.TestDefaultParent.prototype.clearChild = function() {
  this.clear$Field(1);
};



/**
 * Message TestDefaultChild.
 * @constructor
 * @extends {goog.proto2.Message}
 */
proto2.TestDefaultChild = function() {
  goog.proto2.Message.call(this);
};
goog.inherits(proto2.TestDefaultChild, goog.proto2.Message);


/**
 * Overrides {@link goog.proto2.Message#clone} to specify its exact return type.
 * @return {!proto2.TestDefaultChild} The cloned message.
 * @override
 */
proto2.TestDefaultChild.prototype.clone;


/**
 * Gets the value of the foo field.
 * @return {?boolean} The value.
 */
proto2.TestDefaultChild.prototype.getFoo = function() {
  return /** @type {?boolean} */ (this.get$Value(1));
};


/**
 * Gets the value of the foo field or the default value if not set.
 * @return {boolean} The value.
 */
proto2.TestDefaultChild.prototype.getFooOrDefault = function() {
  return /** @type {boolean} */ (this.get$ValueOrDefault(1));
};


/**
 * Sets the value of the foo field.
 * @param {boolean} value The value.
 */
proto2.TestDefaultChild.prototype.setFoo = function(value) {
  this.set$Value(1, value);
};


/**
 * @return {boolean} Whether the foo field has a value.
 */
proto2.TestDefaultChild.prototype.hasFoo = function() {
  return this.has$Value(1);
};


/**
 * @return {number} The number of values in the foo field.
 */
proto2.TestDefaultChild.prototype.fooCount = function() {
  return this.count$Values(1);
};


/**
 * Clears the values in the foo field.
 */
proto2.TestDefaultChild.prototype.clearFoo = function() {
  this.clear$Field(1);
};


/** @override */
proto2.TestAllTypes.prototype.getDescriptor = function() {
  if (!proto2.TestAllTypes.descriptor_) {
    // The descriptor is created lazily when we instantiate a new instance.
    var descriptorObj = {
      0: {
        name: 'TestAllTypes',
        fullName: 'TestAllTypes'
      },
      1: {
        name: 'optional_int32',
        fieldType: goog.proto2.Message.FieldType.INT32,
        type: Number
      },
      2: {
        name: 'optional_int64',
        fieldType: goog.proto2.Message.FieldType.INT64,
        defaultValue: '1',
        type: String
      },
      3: {
        name: 'optional_uint32',
        fieldType: goog.proto2.Message.FieldType.UINT32,
        type: Number
      },
      4: {
        name: 'optional_uint64',
        fieldType: goog.proto2.Message.FieldType.UINT64,
        type: String
      },
      5: {
        name: 'optional_sint32',
        fieldType: goog.proto2.Message.FieldType.SINT32,
        type: Number
      },
      6: {
        name: 'optional_sint64',
        fieldType: goog.proto2.Message.FieldType.SINT64,
        type: String
      },
      7: {
        name: 'optional_fixed32',
        fieldType: goog.proto2.Message.FieldType.FIXED32,
        type: Number
      },
      8: {
        name: 'optional_fixed64',
        fieldType: goog.proto2.Message.FieldType.FIXED64,
        type: String
      },
      9: {
        name: 'optional_sfixed32',
        fieldType: goog.proto2.Message.FieldType.SFIXED32,
        type: Number
      },
      10: {
        name: 'optional_sfixed64',
        fieldType: goog.proto2.Message.FieldType.SFIXED64,
        type: String
      },
      11: {
        name: 'optional_float',
        fieldType: goog.proto2.Message.FieldType.FLOAT,
        defaultValue: 1.5,
        type: Number
      },
      12: {
        name: 'optional_double',
        fieldType: goog.proto2.Message.FieldType.DOUBLE,
        type: Number
      },
      13: {
        name: 'optional_bool',
        fieldType: goog.proto2.Message.FieldType.BOOL,
        type: Boolean
      },
      14: {
        name: 'optional_string',
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
      },
      15: {
        name: 'optional_bytes',
        fieldType: goog.proto2.Message.FieldType.BYTES,
        defaultValue: 'moo',
        type: String
      },
      16: {
        name: 'optionalgroup',
        fieldType: goog.proto2.Message.FieldType.GROUP,
        type: proto2.TestAllTypes.OptionalGroup
      },
      18: {
        name: 'optional_nested_message',
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: proto2.TestAllTypes.NestedMessage
      },
      21: {
        name: 'optional_nested_enum',
        fieldType: goog.proto2.Message.FieldType.ENUM,
        defaultValue: proto2.TestAllTypes.NestedEnum.FOO,
        type: proto2.TestAllTypes.NestedEnum
      },
      50: {
        name: 'optional_int64_number',
        fieldType: goog.proto2.Message.FieldType.INT64,
        defaultValue: 1000000000000000001,
        type: Number
      },
      51: {
        name: 'optional_int64_string',
        fieldType: goog.proto2.Message.FieldType.INT64,
        defaultValue: '1000000000000000001',
        type: String
      },
      31: {
        name: 'repeated_int32',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.INT32,
        type: Number
      },
      32: {
        name: 'repeated_int64',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.INT64,
        type: String
      },
      33: {
        name: 'repeated_uint32',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.UINT32,
        type: Number
      },
      34: {
        name: 'repeated_uint64',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.UINT64,
        type: String
      },
      35: {
        name: 'repeated_sint32',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.SINT32,
        type: Number
      },
      36: {
        name: 'repeated_sint64',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.SINT64,
        type: String
      },
      37: {
        name: 'repeated_fixed32',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.FIXED32,
        type: Number
      },
      38: {
        name: 'repeated_fixed64',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.FIXED64,
        type: String
      },
      39: {
        name: 'repeated_sfixed32',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.SFIXED32,
        type: Number
      },
      40: {
        name: 'repeated_sfixed64',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.SFIXED64,
        type: String
      },
      41: {
        name: 'repeated_float',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.FLOAT,
        type: Number
      },
      42: {
        name: 'repeated_double',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.DOUBLE,
        type: Number
      },
      43: {
        name: 'repeated_bool',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.BOOL,
        type: Boolean
      },
      44: {
        name: 'repeated_string',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
      },
      45: {
        name: 'repeated_bytes',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.BYTES,
        type: String
      },
      46: {
        name: 'repeatedgroup',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.GROUP,
        type: proto2.TestAllTypes.RepeatedGroup
      },
      48: {
        name: 'repeated_nested_message',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: proto2.TestAllTypes.NestedMessage
      },
      49: {
        name: 'repeated_nested_enum',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.ENUM,
        defaultValue: proto2.TestAllTypes.NestedEnum.FOO,
        type: proto2.TestAllTypes.NestedEnum
      },
      52: {
        name: 'repeated_int64_number',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.INT64,
        type: Number
      },
      53: {
        name: 'repeated_int64_string',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.INT64,
        type: String
      },
      54: {
        name: 'packed_int32',
        repeated: true,
        packed: true,
        fieldType: goog.proto2.Message.FieldType.INT32,
        type: Number
      },
      55: {
        name: 'packed_int64',
        repeated: true,
        packed: true,
        fieldType: goog.proto2.Message.FieldType.INT64,
        type: Number
      },
      56: {
        name: 'packed_uint32',
        repeated: true,
        packed: true,
        fieldType: goog.proto2.Message.FieldType.UINT32,
        type: Number
      },
      57: {
        name: 'packed_uint64',
        repeated: true,
        packed: true,
        fieldType: goog.proto2.Message.FieldType.UINT64,
        type: Number
      },
      58: {
        name: 'packed_sint32',
        repeated: true,
        packed: true,
        fieldType: goog.proto2.Message.FieldType.SINT32,
        type: Number
      },
      59: {
        name: 'packed_sint64',
        repeated: true,
        packed: true,
        fieldType: goog.proto2.Message.FieldType.SINT64,
        type: Number
      },
      60: {
        name: 'packed_fixed32',
        repeated: true,
        packed: true,
        fieldType: goog.proto2.Message.FieldType.FIXED32,
        type: Number
      },
      61: {
        name: 'packed_fixed64',
        repeated: true,
        packed: true,
        fieldType: goog.proto2.Message.FieldType.FIXED64,
        type: Number
      },
      62: {
        name: 'packed_sfixed32',
        repeated: true,
        packed: true,
        fieldType: goog.proto2.Message.FieldType.SFIXED32,
        type: Number
      },
      63: {
        name: 'packed_sfixed64',
        repeated: true,
        packed: true,
        fieldType: goog.proto2.Message.FieldType.SFIXED64,
        type: Number
      },
      64: {
        name: 'packed_float',
        repeated: true,
        packed: true,
        fieldType: goog.proto2.Message.FieldType.FLOAT,
        type: Number
      },
      65: {
        name: 'packed_double',
        repeated: true,
        packed: true,
        fieldType: goog.proto2.Message.FieldType.DOUBLE,
        type: Number
      },
      66: {
        name: 'packed_bool',
        repeated: true,
        packed: true,
        fieldType: goog.proto2.Message.FieldType.BOOL,
        type: Boolean
      }
    };
    proto2.TestAllTypes.descriptor_ =
        goog.proto2.Message.createDescriptor(
             proto2.TestAllTypes, descriptorObj);
  }
  return proto2.TestAllTypes.descriptor_;
};


proto2.TestAllTypes['ctor'] = proto2.TestAllTypes;proto2.TestAllTypes['ctor'].getDescriptor =
    proto2.TestAllTypes.prototype.getDescriptor;


/** @override */
proto2.TestAllTypes.NestedMessage.prototype.getDescriptor = function() {
  if (!proto2.TestAllTypes.NestedMessage.descriptor_) {
    // The descriptor is created lazily when we instantiate a new instance.
    var descriptorObj = {
      0: {
        name: 'NestedMessage',
        containingType: proto2.TestAllTypes,
        fullName: 'TestAllTypes.NestedMessage'
      },
      1: {
        name: 'b',
        fieldType: goog.proto2.Message.FieldType.INT32,
        type: Number
      },
      2: {
        name: 'c',
        fieldType: goog.proto2.Message.FieldType.INT32,
        type: Number
      }
    };
    proto2.TestAllTypes.NestedMessage.descriptor_ =
        goog.proto2.Message.createDescriptor(
             proto2.TestAllTypes.NestedMessage, descriptorObj);
  }
  return proto2.TestAllTypes.NestedMessage.descriptor_;
};


proto2.TestAllTypes.NestedMessage['ctor'] = proto2.TestAllTypes.NestedMessage;proto2.TestAllTypes.NestedMessage['ctor'].getDescriptor =
    proto2.TestAllTypes.NestedMessage.prototype.getDescriptor;


/** @override */
proto2.TestAllTypes.OptionalGroup.prototype.getDescriptor = function() {
  if (!proto2.TestAllTypes.OptionalGroup.descriptor_) {
    // The descriptor is created lazily when we instantiate a new instance.
    var descriptorObj = {
      0: {
        name: 'OptionalGroup',
        containingType: proto2.TestAllTypes,
        fullName: 'TestAllTypes.OptionalGroup'
      },
      17: {
        name: 'a',
        fieldType: goog.proto2.Message.FieldType.INT32,
        type: Number
      }
    };
    proto2.TestAllTypes.OptionalGroup.descriptor_ =
        goog.proto2.Message.createDescriptor(
             proto2.TestAllTypes.OptionalGroup, descriptorObj);
  }
  return proto2.TestAllTypes.OptionalGroup.descriptor_;
};


proto2.TestAllTypes.OptionalGroup['ctor'] = proto2.TestAllTypes.OptionalGroup;proto2.TestAllTypes.OptionalGroup['ctor'].getDescriptor =
    proto2.TestAllTypes.OptionalGroup.prototype.getDescriptor;


/** @override */
proto2.TestAllTypes.RepeatedGroup.prototype.getDescriptor = function() {
  if (!proto2.TestAllTypes.RepeatedGroup.descriptor_) {
    // The descriptor is created lazily when we instantiate a new instance.
    var descriptorObj = {
      0: {
        name: 'RepeatedGroup',
        containingType: proto2.TestAllTypes,
        fullName: 'TestAllTypes.RepeatedGroup'
      },
      47: {
        name: 'a',
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.INT32,
        type: Number
      }
    };
    proto2.TestAllTypes.RepeatedGroup.descriptor_ =
        goog.proto2.Message.createDescriptor(
             proto2.TestAllTypes.RepeatedGroup, descriptorObj);
  }
  return proto2.TestAllTypes.RepeatedGroup.descriptor_;
};


proto2.TestAllTypes.RepeatedGroup['ctor'] = proto2.TestAllTypes.RepeatedGroup;proto2.TestAllTypes.RepeatedGroup['ctor'].getDescriptor =
    proto2.TestAllTypes.RepeatedGroup.prototype.getDescriptor;


/** @override */
proto2.TestDefaultParent.prototype.getDescriptor = function() {
  if (!proto2.TestDefaultParent.descriptor_) {
    // The descriptor is created lazily when we instantiate a new instance.
    var descriptorObj = {
      0: {
        name: 'TestDefaultParent',
        fullName: 'TestDefaultParent'
      },
      1: {
        name: 'child',
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: proto2.TestDefaultChild
      }
    };
    proto2.TestDefaultParent.descriptor_ =
        goog.proto2.Message.createDescriptor(
             proto2.TestDefaultParent, descriptorObj);
  }
  return proto2.TestDefaultParent.descriptor_;
};


proto2.TestDefaultParent['ctor'] = proto2.TestDefaultParent;proto2.TestDefaultParent['ctor'].getDescriptor =
    proto2.TestDefaultParent.prototype.getDescriptor;


/** @override */
proto2.TestDefaultChild.prototype.getDescriptor = function() {
  if (!proto2.TestDefaultChild.descriptor_) {
    // The descriptor is created lazily when we instantiate a new instance.
    var descriptorObj = {
      0: {
        name: 'TestDefaultChild',
        fullName: 'TestDefaultChild'
      },
      1: {
        name: 'foo',
        fieldType: goog.proto2.Message.FieldType.BOOL,
        defaultValue: true,
        type: Boolean
      }
    };
    proto2.TestDefaultChild.descriptor_ =
        goog.proto2.Message.createDescriptor(
             proto2.TestDefaultChild, descriptorObj);
  }
  return proto2.TestDefaultChild.descriptor_;
};


proto2.TestDefaultChild['ctor'] = proto2.TestDefaultChild;proto2.TestDefaultChild['ctor'].getDescriptor =
    proto2.TestDefaultChild.prototype.getDescriptor;
