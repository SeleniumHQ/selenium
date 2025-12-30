/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Helper class for creating stubs for testing.
 */

goog.setTestOnly('goog.testing.PropertyReplacer');
goog.provide('goog.testing.PropertyReplacer');

goog.require('goog.asserts');



/**
 * Helper class for stubbing out variables and object properties for unit tests.
 * This class can change the value of some variables before running the test
 * cases, and to reset them in the tearDown phase.
 * See googletest.StubOutForTesting as an analogy in Python:
 * http://protobuf.googlecode.com/svn/trunk/python/stubout.py
 *
 * Example usage:
 *
 *     var stubs = new goog.testing.PropertyReplacer();
 *
 *     function setUp() {
 *       // Mock functions used in all test cases.
 *       stubs.replace(Math, 'random', function() {
 *         return 4;  // Chosen by fair dice roll. Guaranteed to be random.
 *       });
 *     }
 *
 *     function tearDown() {
 *       stubs.reset();
 *     }
 *
 *     function testThreeDice() {
 *       // Mock a constant used only in this test case.
 *       stubs.set(goog.global, 'DICE_COUNT', 3);
 *       assertEquals(12, rollAllDice());
 *     }
 *
 * Constraints on altered objects:
 * <ul>
 *   <li>DOM subclasses aren't supported.
 *   <li>The value of the objects' constructor property must either be equal to
 *       the real constructor or kept untouched.
 * </ul>
 *
 * Code compiled with property renaming may need to use
 * `goog.reflect.objectProperty` instead of simply naming the property to
 * replace.
 *
 * @constructor
 * @final
 */
goog.testing.PropertyReplacer = function() {
  'use strict';
  /**
   * Stores the values changed by the set() method in chronological order.
   * Its items are objects with 3 fields: 'object', 'key', 'value'. The
   * original value for the given key in the given object is stored under the
   * 'value' key.
   * @type {Array<{ object: ?, key: string, value: ? }>}
   * @private
   */
  this.original_ = [];
};


/**
 * Indicates that a key didn't exist before having been set by the set() method.
 * @private @const
 */
goog.testing.PropertyReplacer.NO_SUCH_KEY_ = {};


/**
 * Tells if the given key exists in the object. Ignores inherited fields.
 * @param {!Object|!Function} obj The JavaScript or native object or function
 *     whose key is to be checked.
 * @param {string} key The key to check.
 * @return {boolean} Whether the object has the key as own key.
 * @private
 * @suppress {unusedLocalVariables}
 */
goog.testing.PropertyReplacer.hasKey_ = function(obj, key) {
  'use strict';
  if (!(key in obj)) {
    return false;
  }
  // hasOwnProperty is only reliable with JavaScript objects. It returns false
  // for built-in DOM attributes.
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    return true;
  }
  // In all browsers except Opera obj.constructor never equals to Object if
  // obj is an instance of a native class. In Opera we have to fall back on
  // examining obj.toString().
  if (obj.constructor == Object) {
    return false;
  }
  try {
    // Firefox hack to consider "className" part of the HTML elements or
    // "body" part of document. Although they are defined in the prototype of
    // HTMLElement or Document, accessing them this way throws an exception.
    // <pre>
    //   var dummy = document.body.constructor.prototype.className
    //   [Exception... "Cannot modify properties of a WrappedNative"]
    // </pre>
    var dummy = obj.constructor.prototype[key];
  } catch (e) {
    return true;
  }
  return !(key in obj.constructor.prototype);
};


/**
 * Deletes a key from an object. Sets it to undefined or empty string if the
 * delete failed.
 * @param {!Object|!Function} obj The object or function to delete a key from.
 * @param {string} key The key to delete.
 * @throws {Error} In case of trying to set a read-only property
 * @private
 */
goog.testing.PropertyReplacer.deleteKey_ = function(obj, key) {
  'use strict';
  try {
    delete obj[key];
    // Delete has no effect for built-in properties of DOM nodes in FF.
    if (!goog.testing.PropertyReplacer.hasKey_(obj, key)) {
      return;
    }
  } catch (e) {
    // IE throws TypeError when trying to delete properties of native objects
    // (e.g. DOM nodes or window), even if they have been added by JavaScript.
  }

  obj[key] = undefined;
  if (obj[key] == 'undefined') {
    // Some properties such as className in IE are always evaluated as string
    // so undefined will become 'undefined'.
    obj[key] = '';
  }

  if (obj[key]) {
    throw new Error(
        'Cannot delete non configurable property "' + key + '" in ' + obj);
  }
};


/**
 * Restore the original state of a key in an object.
 * @param {{ object: ?, key: string, value: ? }} original Original state
 * @private
 */
goog.testing.PropertyReplacer.restoreOriginal_ = function(original) {
  'use strict';
  if (original.value == goog.testing.PropertyReplacer.NO_SUCH_KEY_) {
    goog.testing.PropertyReplacer.deleteKey_(original.object, original.key);
  } else {
    original.object[original.key] = original.value;
  }
};


/**
 * Adds or changes a value in an object while saving its original state.
 * @param {Object|Function} obj The JavaScript or native object or function to
 *     alter. See the constraints in the class description.
 * @param {string} key The key to change the value for.
 * @param {*} value The new value to set.
 * @throws {Error} In case of trying to set a read-only property.
 */
goog.testing.PropertyReplacer.prototype.set = function(obj, key, value) {
  'use strict';
  goog.asserts.assert(obj);
  var origValue = goog.testing.PropertyReplacer.hasKey_(obj, key) ?
      obj[key] :
      goog.testing.PropertyReplacer.NO_SUCH_KEY_;
  this.original_.push({object: obj, key: key, value: origValue});
  obj[key] = value;

  // Check whether obj[key] was a read-only value and the assignment failed.
  // Also, check that we're not comparing returned pixel values when "value"
  // is 0. In other words, account for this case:
  // document.body.style.margin = 0;
  // document.body.style.margin; // returns "0px"
  if (obj[key] != value && (value + 'px') != obj[key]) {
    throw new Error(
        'Cannot overwrite read-only property "' + key + '" in ' + obj);
  }
};


/**
 * Changes an existing value in an object to another one of the same type while
 * saving its original state. The advantage of `replace` over {@link #set}
 * is that `replace` protects against typos and erroneously passing tests
 * after some members have been renamed during a refactoring.
 * @param {Object|Function} obj The JavaScript or native object or function to
 *     alter. See the constraints in the class description.
 * @param {string} key The key to change the value for. It has to be present
 *     either in `obj` or in its prototype chain.
 * @param {*} value The new value to set.
 * @param {boolean=} opt_allowNullOrUndefined By default, this method requires
 *     `value` to match the type of the existing value, as determined by
 *     {@link goog.typeOf}. Setting opt_allowNullOrUndefined to `true`
 *     allows an existing value to be replaced by `null` or
       `undefined`, or vice versa.
 * @throws {Error} In case of missing key or type mismatch.
 */
goog.testing.PropertyReplacer.prototype.replace = function(
    obj, key, value, opt_allowNullOrUndefined) {
  'use strict';
  if (!(key in obj)) {
    throw new Error('Cannot replace missing property "' + key + '" in ' + obj);
  }
  // If opt_allowNullOrUndefined is true, then we do not check the types if
  // either the original or new value is null or undefined.
  var shouldCheckTypes =
      !opt_allowNullOrUndefined || (obj[key] != null && value != null);
  if (shouldCheckTypes) {
    var originalType = goog.typeOf(obj[key]);
    var newType = goog.typeOf(value);
    if (originalType != newType) {
      throw new Error(
          'Cannot replace property "' + key + '" in ' + obj +
          ' with a value of different type (expected ' + originalType +
          ', found ' + newType + ')');
    }
  }
  this.set(obj, key, value);
};


/**
 * Builds an object structure for the provided namespace path.  Doesn't
 * overwrite those prefixes of the path that are already objects or functions.
 * @param {string} path The path to create or alter, e.g. 'goog.ui.Menu'.
 * @param {*} value The value to set.
 */
goog.testing.PropertyReplacer.prototype.setPath = function(path, value) {
  'use strict';
  var parts = path.split('.');
  var obj = goog.global;
  for (var i = 0; i < parts.length - 1; i++) {
    var part = parts[i];
    if (part == 'prototype' && !obj[part]) {
      throw new Error(
          'Cannot set the prototype of ' + parts.slice(0, i).join('.'));
    }
    if (!goog.isObject(obj[part]) && typeof obj[part] !== 'function') {
      this.set(obj, part, {});
    }
    obj = obj[part];
  }
  this.set(obj, parts[parts.length - 1], value);
};


/**
 * Deletes the key from the object while saving its original value.
 * @param {Object|Function} obj The JavaScript or native object or function to
 *     alter. See the constraints in the class description.
 * @param {string} key The key to delete.
 */
goog.testing.PropertyReplacer.prototype.remove = function(obj, key) {
  'use strict';
  if (obj && goog.testing.PropertyReplacer.hasKey_(obj, key)) {
    this.original_.push({object: obj, key: key, value: obj[key]});
    goog.testing.PropertyReplacer.deleteKey_(obj, key);
  }
};


/**
 * Restore the original state of key in an object.
 * @param {!Object|!Function} obj The JavaScript or native object whose state
 *     should be restored.
 * @param {string} key The key to restore the original value for.
 * @throws {Error} In case the object/key pair hadn't been modified earlier.
 */
goog.testing.PropertyReplacer.prototype.restore = function(obj, key) {
  'use strict';
  for (var i = this.original_.length - 1; i >= 0; i--) {
    var original = this.original_[i];
    if (original.object === obj && original.key == key) {
      goog.testing.PropertyReplacer.restoreOriginal_(original);
      this.original_.splice(i, 1);
      return;
    }
  }
  throw new Error('Cannot restore unmodified property "' + key + '" of ' + obj);
};


/**
 * Resets all changes made by goog.testing.PropertyReplacer.prototype.set.
 */
goog.testing.PropertyReplacer.prototype.reset = function() {
  'use strict';
  for (var i = this.original_.length - 1; i >= 0; i--) {
    goog.testing.PropertyReplacer.restoreOriginal_(this.original_[i]);
    delete this.original_[i];
  }
  this.original_.length = 0;
};
