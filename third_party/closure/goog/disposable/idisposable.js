/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Definition of the disposable interface.  A disposable object
 * has a dispose method to to clean up references and resources.
 */


goog.provide('goog.disposable.IDisposable');

goog.require('goog.utils');



/**
 * Interface for a disposable object.  If a instance requires cleanup, it should
 * implement this interface (it may subclass goog.Disposable).
 *
 * Examples of cleanup that can be done in `dispose` method:
 * 1. Remove event listeners.
 * 2. Cancel timers (setTimeout, setInterval, goog.Timer).
 * 3. Call `dispose` on other disposable objects hold by current object.
 * 4. Close connections (e.g. WebSockets).
 *
 * Note that it's not required to delete properties (e.g. DOM nodes) or set them
 * to null as garbage collector will collect them assuming that references to
 * current object will be lost after it is disposed.
 *
 * See also http://go/mdn/JavaScript/Memory_Management.
 *
 * @record
 */
goog.disposable.IDisposable = function() {};


/**
 * Disposes of the object and its resources.
 * @return {void} Nothing.
 */
goog.disposable.IDisposable.prototype.dispose = goog.utils.abstractMethod;


/**
 * @return {boolean} Whether the object has been disposed of.
 */
goog.disposable.IDisposable.prototype.isDisposed = goog.utils.abstractMethod;
