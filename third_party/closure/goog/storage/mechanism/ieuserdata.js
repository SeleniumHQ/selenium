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
 * @fileoverview Provides data persistence using IE userData mechanism.
 *
 */

goog.provide('goog.storage.mechanism.IEUserData');

goog.require('goog.asserts');
goog.require('goog.iter.Iterator');
goog.require('goog.iter.StopIteration');
goog.require('goog.storage.mechanism.ErrorCode');
goog.require('goog.storage.mechanism.IterableMechanism');
goog.require('goog.structs.Map');
goog.require('goog.userAgent');



/**
 * Provides a storage mechanism using IE userData.
 *
 * @param {string} storageKey The key (store name) to store the data under.
 * @param {string=} opt_storageNodeId The ID of the associated HTML element,
 *     one will be created if not provided.
 * @constructor
 * @extends {goog.storage.mechanism.IterableMechanism}
 */
goog.storage.mechanism.IEUserData = function(storageKey, opt_storageNodeId) {
  goog.base(this);

  // Tested on IE6, IE7 and IE8. It seems that IE9 introduces some security
  // features which make persistent (loaded) node attributes invisible from
  // JavaScript.
  if (goog.userAgent.IE && !goog.userAgent.isVersion(9)) {
    if (!goog.storage.mechanism.IEUserData.storageMap_) {
      goog.storage.mechanism.IEUserData.storageMap_ = new goog.structs.Map();
    }
    this.storageNode_ = /** @type {Element} */
        goog.storage.mechanism.IEUserData.storageMap_.get(storageKey);
    if (!this.storageNode_) {
      if (opt_storageNodeId) {
        this.storageNode_ = document.getElementById(opt_storageNodeId);
      } else {
        this.storageNode_ = document.createElement('userdata');
        // This is a special IE-only method letting us persist data.
        this.storageNode_['addBehavior']('#default#userData');
        document.body.appendChild(this.storageNode_);
      }
      goog.storage.mechanism.IEUserData.storageMap_.set(
          storageKey, this.storageNode_);
    }
    this.storageKey_ = storageKey;

    /** @preserveTry */
    try {
      // Availability check.
      this.loadNode_();
    } catch (e) {
      this.storageNode_ = null;
    }
  }
};
goog.inherits(goog.storage.mechanism.IEUserData,
              goog.storage.mechanism.IterableMechanism);


/**
 * Encoding map for characters which are not encoded by encodeURIComponent().
 *
 * @type {!Object}
 * @const
 */
goog.storage.mechanism.IEUserData.ENCODE_MAP = {'.': '.2E', '!': '.21',
  '~': '.7E', '*': '.2A', '\'': '.27', '(': '.28', ')': '.29', '%': '.'};


/**
 * Global storageKey to storageNode map, so we save on reloading the storage.
 *
 * @type {goog.structs.Map}
 * @private
 */
goog.storage.mechanism.IEUserData.storageMap_ = null;


/**
 * The document element used for storing data.
 *
 * @type {Element}
 * @private
 */
goog.storage.mechanism.IEUserData.prototype.storageNode_ = null;


/**
 * The key to store the data under.
 *
 * @type {?string}
 * @private
 */
goog.storage.mechanism.IEUserData.prototype.storageKey_ = null;


/**
 * Encodes anything other than [-a-zA-Z0-9_] using a dot followed by hex,
 * and prefixes with underscore to form a valid and safe HTML attribute name.
 *
 * @param {string} key The key to be encoded.
 * @return {string} The encoded key.
 * @private
 */
goog.storage.mechanism.IEUserData.encodeKey_ = function(key) {
  // encodeURIComponent leaves - _ . ! ~ * ' ( ) unencoded.
  return '_' + encodeURIComponent(key).replace(/[.!~*'()%]/g, function(c) {
    return goog.storage.mechanism.IEUserData.ENCODE_MAP[c];
  });
};


/**
 * Decodes a dot-encoded and character-prefixed key.
 *
 * @param {string} key The key to be decoded.
 * @return {string} The decoded key.
 * @private
 */
goog.storage.mechanism.IEUserData.decodeKey_ = function(key) {
  return decodeURIComponent(key.replace(/\./g, '%')).substr(1);
};


/**
 * Determines whether or not the mechanism is available.
 *
 * @return {boolean} True if the mechanism is available.
 */
goog.storage.mechanism.IEUserData.prototype.isAvailable = function() {
  return !!this.storageNode_;
};


/** @override */
goog.storage.mechanism.IEUserData.prototype.set = function(key, value) {
  this.storageNode_.setAttribute(
      goog.storage.mechanism.IEUserData.encodeKey_(key), value);
  this.saveNode_();
};


/** @override */
goog.storage.mechanism.IEUserData.prototype.get = function(key) {
  // According to Microsoft, values can be strings, numbers or booleans. Since
  // we only save strings, any other type is a storage error. If we returned
  // nulls for such keys, i.e., treated them as non-existent, this would lead
  // to a paradox where a key exists, but it does not when it is retrieved.
  // http://msdn.microsoft.com/en-us/library/ms531348(v=vs.85).aspx
  var value = this.storageNode_.getAttribute(
      goog.storage.mechanism.IEUserData.encodeKey_(key));
  if (goog.isString(value) || goog.isNull(value)) {
    return value;
  }
  throw goog.storage.mechanism.ErrorCode.INVALID_VALUE;
};


/** @override */
goog.storage.mechanism.IEUserData.prototype.remove = function(key) {
  this.storageNode_.removeAttribute(
      goog.storage.mechanism.IEUserData.encodeKey_(key));
  this.saveNode_();
};


/** @override */
goog.storage.mechanism.IEUserData.prototype.getCount = function() {
  return this.getNode_().attributes.length;
};


/** @override */
goog.storage.mechanism.IEUserData.prototype.__iterator__ = function(opt_keys) {
  var i = 0;
  var attributes = this.getNode_().attributes;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if (i >= attributes.length) {
      throw goog.iter.StopIteration;
    }
    var item = goog.asserts.assert(attributes[i++]);
    if (opt_keys) {
      return goog.storage.mechanism.IEUserData.decodeKey_(item.nodeName);
    }
    var value = item.nodeValue;
    // The value must exist and be a string, otherwise it is a storage error.
    if (goog.isString(value)) {
      return value;
    }
    throw goog.storage.mechanism.ErrorCode.INVALID_VALUE;
  };
  return newIter;
};


/** @override */
goog.storage.mechanism.IEUserData.prototype.clear = function() {
  var node = this.getNode_();
  for (var left = node.attributes.length; left > 0; left--) {
    node.removeAttribute(node.attributes[left - 1].nodeName);
  }
  this.saveNode_();
};


/**
 * Loads the underlying storage node to the state we saved it to before.
 *
 * @private
 */
goog.storage.mechanism.IEUserData.prototype.loadNode_ = function() {
  // This is a special IE-only method on Elements letting us persist data.
  this.storageNode_['load'](this.storageKey_);
};


/**
 * Saves the underlying storage node.
 *
 * @private
 */
goog.storage.mechanism.IEUserData.prototype.saveNode_ = function() {
  /** @preserveTry */
  try {
    // This is a special IE-only method on Elements letting us persist data.
    // Do not try to assign this.storageNode_['save'] to a variable, it does
    // not work. May throw an exception when the quota is exceeded.
    this.storageNode_['save'](this.storageKey_);
  } catch (e) {
    throw goog.storage.mechanism.ErrorCode.QUOTA_EXCEEDED;
  }
};


/**
 * Returns the storage node.
 *
 * @return {Element} Storage DOM Element.
 * @private
 */
goog.storage.mechanism.IEUserData.prototype.getNode_ = function() {
  // This is a special IE-only property letting us browse persistent data.
  var doc = /** @type {Document} */ this.storageNode_['XMLDocument'];
  return doc.documentElement;
};
