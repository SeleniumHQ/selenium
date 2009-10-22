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
 * @fileoverview An base class for  event objects
 */

/**
 * Namespace for evevnts
 */
goog.provide('goog.events.Event');


goog.require('goog.Disposable');


/**
 * An base class for event objects, so that they can support
 * preventDefault and stopPropagation.
 *
 * @param {string} type Event Type.
 * @param {Object} opt_target Reference to the object that is the target
 *                            of this event.
 * @constructor
 */
goog.events.Event = function(type, opt_target) {

  /**
   * Event type
   * @type {string}
   */
  this.type = type;

  /**
   * Target of the event
   * @type {Object|undefined}
   */
  this.target = opt_target;

  /**
   * Node that had the listener attached
   * @type {Object|undefined}
   */
  this.currentTarget = this.target;
};
goog.inherits(goog.events.Event, goog.Disposable);


/**
 * Whether to cancel event in internal capture/bubble processing for IE
 * @type {boolean}
 * @private
 */
goog.events.Event.prototype.propagationStopped_ = false;


/**
 * Return value for in internal capture/bubble processing for IE
 * @type {boolean}
 * @private
 */
goog.events.Event.prototype.returnValue_ = true;


/**
 * Stop event propagation
 */
goog.events.Event.prototype.stopPropagation = function() {
  this.propagationStopped_ = true;
};


/**
 * Prevent the default action, for example a link redirecting to a url
 */
goog.events.Event.prototype.preventDefault = function() {
  this.returnValue_ = false;
};
