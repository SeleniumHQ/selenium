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
 * closure/goog/proto2/package_test.proto.
 */

goog.provide('someprotopackage.TestPackageTypes');

goog.require('goog.proto2.Message');
goog.require('proto2.TestAllTypes');



/**
 * Message TestPackageTypes.
 * @constructor
 * @extends {goog.proto2.Message}
 */
someprotopackage.TestPackageTypes = function() {
  goog.proto2.Message.apply(this);
};
goog.inherits(someprotopackage.TestPackageTypes, goog.proto2.Message);


/**
 * Overrides {@link goog.proto2.Message#clone} to specify its exact return type.
 * @return {!someprotopackage.TestPackageTypes} The cloned message.
 * @override
 */
someprotopackage.TestPackageTypes.prototype.clone;


/**
 * Gets the value of the optional_int32 field.
 * @return {?number} The value.
 */
someprotopackage.TestPackageTypes.prototype.getOptionalInt32 = function() {
  return /** @type {?number} */ (this.get$Value(1));
};


/**
 * Gets the value of the optional_int32 field or the default value if not set.
 * @return {number} The value.
 */
someprotopackage.TestPackageTypes.prototype.getOptionalInt32OrDefault = function() {
  return /** @type {number} */ (this.get$ValueOrDefault(1));
};


/**
 * Sets the value of the optional_int32 field.
 * @param {number} value The value.
 */
someprotopackage.TestPackageTypes.prototype.setOptionalInt32 = function(value) {
  this.set$Value(1, value);
};


/**
 * @return {boolean} Whether the optional_int32 field has a value.
 */
someprotopackage.TestPackageTypes.prototype.hasOptionalInt32 = function() {
  return this.has$Value(1);
};


/**
 * @return {number} The number of values in the optional_int32 field. 
 */
someprotopackage.TestPackageTypes.prototype.optionalInt32Count = function() {
  return this.count$Values(1);
};


/**
 * Clears the values in the optional_int32 field.
 */
someprotopackage.TestPackageTypes.prototype.clearOptionalInt32 = function() {
  this.clear$Field(1);
};


/**
 * Gets the value of the other_all field.
 * @return {proto2.TestAllTypes} The value.
 */
someprotopackage.TestPackageTypes.prototype.getOtherAll = function() {
  return /** @type {proto2.TestAllTypes} */ (this.get$Value(2));
};


/**
 * Gets the value of the other_all field or the default value if not set.
 * @return {!proto2.TestAllTypes} The value.
 */
someprotopackage.TestPackageTypes.prototype.getOtherAllOrDefault = function() {
  return /** @type {!proto2.TestAllTypes} */ (this.get$ValueOrDefault(2));
};


/**
 * Sets the value of the other_all field.
 * @param {!proto2.TestAllTypes} value The value.
 */
someprotopackage.TestPackageTypes.prototype.setOtherAll = function(value) {
  this.set$Value(2, value);
};


/**
 * @return {boolean} Whether the other_all field has a value.
 */
someprotopackage.TestPackageTypes.prototype.hasOtherAll = function() {
  return this.has$Value(2);
};


/**
 * @return {number} The number of values in the other_all field. 
 */
someprotopackage.TestPackageTypes.prototype.otherAllCount = function() {
  return this.count$Values(2);
};


/**
 * Clears the values in the other_all field.
 */
someprotopackage.TestPackageTypes.prototype.clearOtherAll = function() {
  this.clear$Field(2);
};


goog.proto2.Message.set$Metadata(someprotopackage.TestPackageTypes, {
  0: {
    name: 'TestPackageTypes',
    fullName: 'someprotopackage.TestPackageTypes'
  },
  1: {
    name: 'optional_int32',
    fieldType: goog.proto2.Message.FieldType.INT32,
    type: Number
  },
  2: {
    name: 'other_all',
    fieldType: goog.proto2.Message.FieldType.MESSAGE,
    type: proto2.TestAllTypes
  }
});
