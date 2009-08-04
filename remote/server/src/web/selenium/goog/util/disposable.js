// Copyright 2005 Google Inc.
// All Rights Reserved
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in
//    the documentation and/or other materials provided with the
//    distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE. 

/**
 * @fileoverview Implements the disposable interface. The dispose method is used
 * to clean up references and resources.
 */


goog.provide('goog.Disposable');
goog.provide('goog.dispose');


/**
 * This implements a class that provides the basic for disposable objects. If
 * your class depends on a COM object or a DOM object it should extend this or
 * implement the same interface.
 *
 * @constructor
 */
goog.Disposable = function() {};


/**
 * Whether object has been disposed
 * @private
 * @type {boolean}
 */
goog.Disposable.prototype.disposed_ = false;


/**
 * @return {boolean} The disposed property of this object.
 */
goog.Disposable.prototype.getDisposed = function() {
  return this.disposed_;
};


/**
 * Disposes the object. Classes that extend goog.Disposable may need to override
 * this method in order to remove references to DOM nodes and COM objects.
 * <pre>
 * MyClass.prototype.dispose = function() {
 *   if (this.getDisposed()) return;
 *   goog.Disposable.prototype.dispose.call(this);
 *
 *   // Dispose logic for MyClass
 * };
 * </pre>
 */
goog.Disposable.prototype.dispose = function() {
  if (!this.disposed_) {
    this.disposed_ = true;
  }
};


/**
 * This function takes an object and calls dispose on it if there is such a
 * method.
 * @param {Object} obj The object to dispose.
 */
goog.dispose = function(obj) {
  if (typeof obj.dispose == 'function') {
    obj.dispose();
  }
};
