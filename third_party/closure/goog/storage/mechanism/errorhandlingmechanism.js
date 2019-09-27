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
 * @fileoverview Wraps a storage mechanism with a custom error handler.
 *
 * @author ruilopes@google.com (Rui do Nascimento Dias Lopes)
 */

goog.provide('goog.storage.mechanism.ErrorHandlingMechanism');

goog.require('goog.storage.mechanism.Mechanism');



/**
 * Wraps a storage mechanism with a custom error handler.
 *
 * @param {!goog.storage.mechanism.Mechanism} mechanism Underlying storage
 *     mechanism.
 * @param {goog.storage.mechanism.ErrorHandlingMechanism.ErrorHandler}
 *     errorHandler An error handler.
 * @constructor
 * @struct
 * @extends {goog.storage.mechanism.Mechanism}
 * @final
 */
goog.storage.mechanism.ErrorHandlingMechanism = function(
    mechanism, errorHandler) {
  goog.storage.mechanism.ErrorHandlingMechanism.base(this, 'constructor');

  /**
   * The mechanism to be wrapped.
   * @type {!goog.storage.mechanism.Mechanism}
   * @private
   */
  this.mechanism_ = mechanism;

  /**
   * The error handler.
   * @type {goog.storage.mechanism.ErrorHandlingMechanism.ErrorHandler}
   * @private
   */
  this.errorHandler_ = errorHandler;
};
goog.inherits(
    goog.storage.mechanism.ErrorHandlingMechanism,
    goog.storage.mechanism.Mechanism);


/**
 * Valid storage mechanism operations.
 * @enum {string}
 */
goog.storage.mechanism.ErrorHandlingMechanism.Operation = {
  SET: 'set',
  GET: 'get',
  REMOVE: 'remove'
};


/**
 * A function that handles errors raised in goog.storage.  Since some places in
 * the goog.storage codebase throw strings instead of Error objects, we accept
 * these as a valid parameter type.  It supports the following arguments:
 *
 * 1) The raised error (either in Error or string form);
 * 2) The operation name which triggered the error, as defined per the
 *    ErrorHandlingMechanism.Operation enum;
 * 3) The key that is passed to a storage method;
 * 4) An optional value that is passed to a storage method (only used in set
 *    operations).
 *
 * @typedef {function(
 *   (!Error|string),
 *   goog.storage.mechanism.ErrorHandlingMechanism.Operation,
 *   string,
 *   *=)}
 */
goog.storage.mechanism.ErrorHandlingMechanism.ErrorHandler;


/** @override */
goog.storage.mechanism.ErrorHandlingMechanism.prototype.set = function(
    key, value) {
  try {
    this.mechanism_.set(key, value);
  } catch (e) {
    this.errorHandler_(
        e, goog.storage.mechanism.ErrorHandlingMechanism.Operation.SET, key,
        value);
  }
};


/** @override */
goog.storage.mechanism.ErrorHandlingMechanism.prototype.get = function(key) {
  try {
    return this.mechanism_.get(key);
  } catch (e) {
    this.errorHandler_(
        e, goog.storage.mechanism.ErrorHandlingMechanism.Operation.GET, key);
    return null;
  }
};


/** @override */
goog.storage.mechanism.ErrorHandlingMechanism.prototype.remove = function(key) {
  try {
    this.mechanism_.remove(key);
  } catch (e) {
    this.errorHandler_(
        e, goog.storage.mechanism.ErrorHandlingMechanism.Operation.REMOVE, key);
  }
};
