// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Provides the built-in dictionary matcher methods like
 *     hasEntry, hasEntries, hasKey, hasValue, etc.
 */



goog.provide('goog.labs.testing.HasEntriesMatcher');
goog.provide('goog.labs.testing.HasEntryMatcher');
goog.provide('goog.labs.testing.HasKeyMatcher');
goog.provide('goog.labs.testing.HasValueMatcher');


goog.require('goog.asserts');
goog.require('goog.labs.testing.Matcher');
goog.require('goog.object');



/**
 * The HasEntries matcher.
 *
 * @param {!Object} entries The entries to check in the object.
 *
 * @constructor
 * @struct
 * @implements {goog.labs.testing.Matcher}
 * @final
 */
goog.labs.testing.HasEntriesMatcher = function(entries) {
  /**
   * @type {Object}
   * @private
   */
  this.entries_ = entries;
};


/**
 * Determines if an object has particular entries.
 *
 * @override
 */
goog.labs.testing.HasEntriesMatcher.prototype.matches = function(actualObject) {
  goog.asserts.assertObject(actualObject, 'Expected an Object');
  var object = /** @type {!Object} */ (actualObject);
  return goog.object.every(this.entries_, function(value, key) {
    return goog.object.containsKey(object, key) && object[key] === value;
  });
};


/**
 * @override
 */
goog.labs.testing.HasEntriesMatcher.prototype.describe = function(
    actualObject) {
  goog.asserts.assertObject(actualObject, 'Expected an Object');
  var object = /** @type {!Object} */ (actualObject);
  var errorString = 'Input object did not contain the following entries:\n';
  goog.object.forEach(this.entries_, function(value, key) {
    if (!goog.object.containsKey(object, key) || object[key] !== value) {
      errorString += key + ': ' + value + '\n';
    }
  });
  return errorString;
};



/**
 * The HasEntry matcher.
 *
 * @param {string} key The key for the entry.
 * @param {*} value The value for the key.
 *
 * @constructor
 * @struct
 * @implements {goog.labs.testing.Matcher}
 * @final
 */
goog.labs.testing.HasEntryMatcher = function(key, value) {
  /**
   * @type {string}
   * @private
   */
  this.key_ = key;
  /**
   * @type {*}
   * @private
   */
  this.value_ = value;
};


/**
 * Determines if an object has a particular entry.
 *
 * @override
 */
goog.labs.testing.HasEntryMatcher.prototype.matches = function(actualObject) {
  goog.asserts.assertObject(actualObject);
  return goog.object.containsKey(actualObject, this.key_) &&
      actualObject[this.key_] === this.value_;
};


/**
 * @override
 */
goog.labs.testing.HasEntryMatcher.prototype.describe = function(actualObject) {
  goog.asserts.assertObject(actualObject);
  var errorMsg;
  if (goog.object.containsKey(actualObject, this.key_)) {
    errorMsg = 'Input object did not contain key: ' + this.key_;
  } else {
    errorMsg = 'Value for key did not match value: ' + this.value_;
  }
  return errorMsg;
};



/**
 * The HasKey matcher.
 *
 * @param {string} key The key to check in the object.
 *
 * @constructor
 * @struct
 * @implements {goog.labs.testing.Matcher}
 * @final
 */
goog.labs.testing.HasKeyMatcher = function(key) {
  /**
   * @type {string}
   * @private
   */
  this.key_ = key;
};


/**
 * Determines if an object has a key.
 *
 * @override
 */
goog.labs.testing.HasKeyMatcher.prototype.matches = function(actualObject) {
  goog.asserts.assertObject(actualObject);
  return goog.object.containsKey(actualObject, this.key_);
};


/**
 * @override
 */
goog.labs.testing.HasKeyMatcher.prototype.describe = function(actualObject) {
  goog.asserts.assertObject(actualObject);
  return 'Input object did not contain the key: ' + this.key_;
};



/**
 * The HasValue matcher.
 *
 * @param {*} value The value to check in the object.
 *
 * @constructor
 * @struct
 * @implements {goog.labs.testing.Matcher}
 * @final
 */
goog.labs.testing.HasValueMatcher = function(value) {
  /**
   * @type {*}
   * @private
   */
  this.value_ = value;
};


/**
 * Determines if an object contains a value
 *
 * @override
 */
goog.labs.testing.HasValueMatcher.prototype.matches = function(actualObject) {
  goog.asserts.assertObject(actualObject, 'Expected an Object');
  var object = /** @type {!Object} */ (actualObject);
  return goog.object.containsValue(object, this.value_);
};


/**
 * @override
 */
goog.labs.testing.HasValueMatcher.prototype.describe = function(actualObject) {
  return 'Input object did not contain the value: ' + this.value_;
};


/**
 * Gives a matcher that asserts an object contains all the given key-value pairs
 * in the input object.
 *
 * @param {!Object} entries The entries to check for presence in the object.
 *
 * @return {!goog.labs.testing.HasEntriesMatcher} A HasEntriesMatcher.
 */
function hasEntries(entries) {
  return new goog.labs.testing.HasEntriesMatcher(entries);
}


/**
 * Gives a matcher that asserts an object contains the given key-value pair.
 *
 * @param {string} key The key to check for presence in the object.
 * @param {*} value The value to check for presence in the object.
 *
 * @return {!goog.labs.testing.HasEntryMatcher} A HasEntryMatcher.
 */
function hasEntry(key, value) {
  return new goog.labs.testing.HasEntryMatcher(key, value);
}


/**
 * Gives a matcher that asserts an object contains the given key.
 *
 * @param {string} key The key to check for presence in the object.
 *
 * @return {!goog.labs.testing.HasKeyMatcher} A HasKeyMatcher.
 */
function hasKey(key) {
  return new goog.labs.testing.HasKeyMatcher(key);
}


/**
 * Gives a matcher that asserts an object contains the given value.
 *
 * @param {*} value The value to check for presence in the object.
 *
 * @return {!goog.labs.testing.HasValueMatcher} A HasValueMatcher.
 */
function hasValue(value) {
  return new goog.labs.testing.HasValueMatcher(value);
}
