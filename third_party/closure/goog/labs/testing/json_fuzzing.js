// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview a fuzzing JSON generator.
 *
 * This class generates a random JSON-compatible array object under the
 * following rules, (n) n being the relative weight of enum/discrete values
 * of a stochastic variable:
 * 1. Total number of elements for the generated JSON array: [1, 10)
 * 2. Each element: with message (1), array (1)
 * 3. Each message: number of fields: [0, 5); field type: with
 *    message (5), string (1), number (1), boolean (1), array (1), null (1)
 * 4. Message may be nested, and will be terminated randomly with
 *    a max depth equal to 5
 * 5. Each array: length [0, 5), and may be nested too
 */

goog.provide('goog.labs.testing.JsonFuzzing');

goog.require('goog.string');
goog.require('goog.testing.PseudoRandom');



/**
 * The JSON fuzzing generator.
 *
 * @param {!goog.labs.testing.JsonFuzzing.Options=} opt_options Configuration
 *     for the fuzzing json generator.
 * @param {number=} opt_seed The seed for the random generator.
 * @constructor
 * @struct
 */
goog.labs.testing.JsonFuzzing = function(opt_options, opt_seed) {
  /**
   * The config options.
   * @private {!goog.labs.testing.JsonFuzzing.Options}
   */
  this.options_ =
      opt_options || {jsonSize: 10, numFields: 5, arraySize: 5, maxDepth: 5};

  /**
   * The random generator
   * @private {!goog.testing.PseudoRandom}
   */
  this.random_ = new goog.testing.PseudoRandom(opt_seed);

  /**
   * The depth limit, which defaults to 5.
   * @private {number}
   */
  this.maxDepth_ = this.options_.maxDepth;
};


/**
 * Configuration spec.
 *
 * jsonSize: default to [1, 10) for the entire JSON object (array)
 * numFields: default to [0, 5)
 * arraySize: default to [0, 5) for the length of nested arrays
 * maxDepth: default to 5
 *
 * @typedef {{
 *   jsonSize: number,
 *   numFields: number,
 *   arraySize: number,
 *   maxDepth: number
 * }}
 */
goog.labs.testing.JsonFuzzing.Options;


/**
 * Gets a fuzzily-generated JSON object (an array).
 *
 * TODO(user): whitespaces
 *
 * @return {!Array} A new JSON compliant array object.
 */
goog.labs.testing.JsonFuzzing.prototype.newArray = function() {
  var result = [];
  var depth = 0;

  var maxSize = this.options_.jsonSize;

  var size = this.nextInt(1, maxSize);
  for (var i = 0; i < size; i++) {
    result.push(this.nextElm_(depth));
  }

  return result;
};


/**
 * Gets a new integer.
 *
 * @param {number} min Inclusive
 * @param {number} max Exclusive
 * @return {number} A random integer
 */
goog.labs.testing.JsonFuzzing.prototype.nextInt = function(min, max) {
  var random = this.random_.random();

  return Math.floor(random * (max - min)) + min;
};


/**
 * Gets a new element type, randomly.
 *
 * @return {number} 0 for message and 1 for array.
 * @private
 */
goog.labs.testing.JsonFuzzing.prototype.nextElmType_ = function() {
  var random = this.random_.random();

  if (random < 0.5) {
    return 0;
  } else {
    return 1;
  }
};


/**
 * Enum type for the field type (of a message).
 * @enum {number}
 * @private
 */
goog.labs.testing.JsonFuzzing.FieldType_ = {
  /**
   * Message field.
   */
  MESSAGE: 0,

  /**
   * Array field.
   */
  ARRAY: 1,

  /**
   * String field.
   */
  STRING: 2,

  /**
   * Numeric field.
   */
  NUMBER: 3,

  /**
   * Boolean field.
   */
  BOOLEAN: 4,

  /**
   * Null field.
   */
  NULL: 5
};


/**
 * Get a new field type, randomly.
 *
 * @return {!goog.labs.testing.JsonFuzzing.FieldType_} the field type.
 * @private
 */
goog.labs.testing.JsonFuzzing.prototype.nextFieldType_ = function() {
  var FieldType = goog.labs.testing.JsonFuzzing.FieldType_;

  var random = this.random_.random();

  if (random < 0.5) {
    return FieldType.MESSAGE;
  } else if (random < 0.6) {
    return FieldType.ARRAY;
  } else if (random < 0.7) {
    return FieldType.STRING;
  } else if (random < 0.8) {
    return FieldType.NUMBER;
  } else if (random < 0.9) {
    return FieldType.BOOLEAN;
  } else {
    return FieldType.NULL;
  }
};


/**
 * Gets a new element.
 *
 * @param {number} depth The depth
 * @return {!Object} a random element, msg or array
 * @private
 */
goog.labs.testing.JsonFuzzing.prototype.nextElm_ = function(depth) {
  switch (this.nextElmType_()) {
    case 0:
      return this.nextMessage_(depth);
    case 1:
      return this.nextArray_(depth);
    default:
      throw Error('invalid elm type encounted.');
  }
};


/**
 * Gets a new message.
 *
 * @param {number} depth The depth
 * @return {!Object} a random message.
 * @private
 */
goog.labs.testing.JsonFuzzing.prototype.nextMessage_ = function(depth) {
  if (depth > this.maxDepth_) {
    return {};
  }

  var numFields = this.options_.numFields;

  var random_num = this.nextInt(0, numFields);
  var result = {};

  // TODO(user): unicode and random keys
  for (var i = 0; i < random_num; i++) {
    switch (this.nextFieldType_()) {
      case 0:
        result['f' + i] = this.nextMessage_(depth++);
        continue;
      case 1:
        result['f' + i] = this.nextArray_(depth++);
        continue;
      case 2:
        result['f' + i] = goog.string.getRandomString();
        continue;
      case 3:
        result['f' + i] = this.nextNumber_();
        continue;
      case 4:
        result['f' + i] = this.nextBoolean_();
        continue;
      case 5:
        result['f' + i] = null;
        continue;
      default:
        throw Error('invalid field type encounted.');
    }
  }

  return result;
};


/**
 * Gets a new array.
 *
 * @param {number} depth The depth
 * @return {!Array} a random array.
 * @private
 */
goog.labs.testing.JsonFuzzing.prototype.nextArray_ = function(depth) {
  if (depth > this.maxDepth_) {
    return [];
  }

  var size = this.options_.arraySize;

  var random_size = this.nextInt(0, size);
  var result = [];

  // mixed content
  for (var i = 0; i < random_size; i++) {
    switch (this.nextFieldType_()) {
      case 0:
        result.push(this.nextMessage_(depth++));
        continue;
      case 1:
        result.push(this.nextArray_(depth++));
        continue;
      case 2:
        result.push(goog.string.getRandomString());
        continue;
      case 3:
        result.push(this.nextNumber_());
        continue;
      case 4:
        result.push(this.nextBoolean_());
        continue;
      case 5:
        result.push(null);
        continue;
      default:
        throw Error('invalid field type encounted.');
    }
  }

  return result;
};


/**
 * Gets a new boolean.
 *
 * @return {boolean} a random boolean.
 * @private
 */
goog.labs.testing.JsonFuzzing.prototype.nextBoolean_ = function() {
  var random = this.random_.random();

  return random < 0.5;
};


/**
 * Gets a new number.
 *
 * @return {number} a random number..
 * @private
 */
goog.labs.testing.JsonFuzzing.prototype.nextNumber_ = function() {
  var result = this.random_.random();

  var random = this.random_.random();
  if (random < 0.5) {
    result *= 1000;
  }

  random = this.random_.random();
  if (random < 0.5) {
    result = Math.floor(result);
  }

  random = this.random_.random();
  if (random < 0.5) {
    result *= -1;
  }

  // TODO(user); more random numbers

  return result;
};
