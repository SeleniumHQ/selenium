// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Provides a convenient API for data with attached metadata
 * persistence. You probably don't want to use this class directly as it
 * does not save any metadata by itself. It only provides the necessary
 * infrastructure for subclasses that need to save metadata along with
 * values stored.
 *
 */

goog.provide('goog.storage.RichStorage');
goog.provide('goog.storage.RichStorage.Wrapper');

goog.require('goog.storage.ErrorCode');
goog.require('goog.storage.Storage');
goog.require('goog.storage.mechanism.Mechanism');



/**
 * Provides a storage for data with attached metadata.
 *
 * @param {!goog.storage.mechanism.Mechanism} mechanism The underlying
 *     storage mechanism.
 * @constructor
 * @extends {goog.storage.Storage}
 */
goog.storage.RichStorage = function(mechanism) {
  goog.storage.RichStorage.base(this, 'constructor', mechanism);
};
goog.inherits(goog.storage.RichStorage, goog.storage.Storage);


/**
 * Metadata key under which the actual data is stored.
 *
 * @type {string}
 * @protected
 */
goog.storage.RichStorage.DATA_KEY = 'data';



/**
 * Wraps a value so metadata can be associated with it. You probably want
 * to use goog.storage.RichStorage.Wrapper.wrapIfNecessary to avoid multiple
 * embeddings.
 *
 * @param {*} value The value to wrap.
 * @constructor
 * @final
 */
goog.storage.RichStorage.Wrapper = function(value) {
  this[goog.storage.RichStorage.DATA_KEY] = value;
};


/**
 * Convenience method for wrapping a value so metadata can be associated with
 * it. No-op if the value is already wrapped or is undefined.
 *
 * @param {*} value The value to wrap.
 * @return {(!goog.storage.RichStorage.Wrapper|undefined)} The wrapper.
 */
goog.storage.RichStorage.Wrapper.wrapIfNecessary = function(value) {
  if (!goog.isDef(value) || value instanceof goog.storage.RichStorage.Wrapper) {
    return /** @type {(!goog.storage.RichStorage.Wrapper|undefined)} */ (value);
  }
  return new goog.storage.RichStorage.Wrapper(value);
};


/**
 * Unwraps a value, any metadata is discarded (not returned). You might want to
 * use goog.storage.RichStorage.Wrapper.unwrapIfPossible to handle cases where
 * the wrapper is missing.
 *
 * @param {!Object} wrapper The wrapper.
 * @return {*} The wrapped value.
 */
goog.storage.RichStorage.Wrapper.unwrap = function(wrapper) {
  var value = wrapper[goog.storage.RichStorage.DATA_KEY];
  if (!goog.isDef(value)) {
    throw goog.storage.ErrorCode.INVALID_VALUE;
  }
  return value;
};


/**
 * Convenience method for unwrapping a value. Returns undefined if the
 * wrapper is missing.
 *
 * @param {(!Object|undefined)} wrapper The wrapper.
 * @return {*} The wrapped value or undefined.
 */
goog.storage.RichStorage.Wrapper.unwrapIfPossible = function(wrapper) {
  if (!wrapper) {
    return undefined;
  }
  return goog.storage.RichStorage.Wrapper.unwrap(wrapper);
};


/** @override */
goog.storage.RichStorage.prototype.set = function(key, value) {
  goog.storage.RichStorage.base(this, 'set', key,
      goog.storage.RichStorage.Wrapper.wrapIfNecessary(value));
};


/**
 * Get an item wrapper (the item and its metadata) from the storage.
 *
 * WARNING: This returns an Object, which once used to be
 * goog.storage.RichStorage.Wrapper. This is due to the fact
 * that deserialized objects lose type information and it
 * is hard to do proper typecasting in JavaScript. Be sure
 * you know what you are doing when using the returned value.
 *
 * @param {string} key The key to get.
 * @return {(!Object|undefined)} The wrapper, or undefined if not found.
 */
goog.storage.RichStorage.prototype.getWrapper = function(key) {
  var wrapper = goog.storage.RichStorage.superClass_.get.call(this, key);
  if (!goog.isDef(wrapper) || wrapper instanceof Object) {
    return /** @type {(!Object|undefined)} */ (wrapper);
  }
  throw goog.storage.ErrorCode.INVALID_VALUE;
};


/** @override */
goog.storage.RichStorage.prototype.get = function(key) {
  return goog.storage.RichStorage.Wrapper.unwrapIfPossible(
      this.getWrapper(key));
};
