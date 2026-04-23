/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines the collection interface.
 */

goog.provide('goog.structs.Collection');



/**
 * An interface for a collection of values.
 * @interface
 * @template T
 */
goog.structs.Collection = function() {};


/**
 * @param {T} value Value to add to the collection.
 */
goog.structs.Collection.prototype.add;


/**
 * @param {T} value Value to remove from the collection.
 */
goog.structs.Collection.prototype.remove;


/**
 * @param {T} value Value to find in the collection.
 * @return {boolean} Whether the collection contains the specified value.
 */
goog.structs.Collection.prototype.contains;


/**
 * @return {number} The number of values stored in the collection.
 */
goog.structs.Collection.prototype.getCount;
