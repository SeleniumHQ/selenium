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
 * @fileoverview Wraps an iterable storage mechanism and creates artificial
 * namespaces using a prefix in the global namespace.
 *
 */

goog.provide('goog.storage.mechanism.PrefixedMechanism');

goog.require('goog.iter.Iterator');
goog.require('goog.storage.mechanism.IterableMechanism');



/**
 * Wraps an iterable storage mechanism and creates artificial namespaces.
 *
 * @param {!goog.storage.mechanism.IterableMechanism} mechanism Underlying
 *     iterable storage mechanism.
 * @param {string} prefix Prefix for creating an artificial namespace.
 * @constructor
 * @extends {goog.storage.mechanism.IterableMechanism}
 */
goog.storage.mechanism.PrefixedMechanism = function(mechanism, prefix) {
  goog.base(this);
  this.mechanism_ = mechanism;
  this.prefix_ = prefix + '::';
};
goog.inherits(goog.storage.mechanism.PrefixedMechanism,
              goog.storage.mechanism.IterableMechanism);


/**
 * The mechanism to be prefixed.
 *
 * @type {goog.storage.mechanism.IterableMechanism}
 * @private
 */
goog.storage.mechanism.PrefixedMechanism.prototype.mechanism_ = null;


/**
 * The prefix for creating artificial namespaces.
 *
 * @type {string}
 * @private
 */
goog.storage.mechanism.PrefixedMechanism.prototype.prefix_ = '';


/** @override */
goog.storage.mechanism.PrefixedMechanism.prototype.set = function(key, value) {
  this.mechanism_.set(this.prefix_ + key, value);
};


/** @override */
goog.storage.mechanism.PrefixedMechanism.prototype.get = function(key) {
  return this.mechanism_.get(this.prefix_ + key);
};


/** @override */
goog.storage.mechanism.PrefixedMechanism.prototype.remove = function(key) {
  this.mechanism_.remove(this.prefix_ + key);
};


/** @override */
goog.storage.mechanism.PrefixedMechanism.prototype.__iterator__ = function(
    opt_keys) {
  var subIter = this.mechanism_.__iterator__(true);
  var newIter = new goog.iter.Iterator;
  var selfObj = this;
  newIter.next = function() {
    var key = subIter.next();
    while (key.substr(0, selfObj.prefix_.length) != selfObj.prefix_) {
      key = subIter.next();
    }
    return opt_keys ? key.substr(selfObj.prefix_.length) :
                      selfObj.mechanism_.get(key);
  };
  return newIter;
};
