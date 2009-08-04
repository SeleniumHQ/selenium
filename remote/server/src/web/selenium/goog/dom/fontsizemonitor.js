// Copyright 2005 Google Inc.
// All Rights Reserved.
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
 * @fileoverview Class that can be used to listen to font size changes
 */

goog.provide('goog.dom.FontSizeMonitor');

goog.require('goog.dom');
goog.require('goog.events.EventTarget');


/**
 * This class can be used to monitor changes in font-size.  Instances will
 * dispatch a "fontsizechange" event.
 * Example usage:
 * <pre>
 * var fms = new goog.dom.FontSizeMonitor();
 * goog.events.listen(fms, 'goog.dom.FontSizeMonitor.CHANGE_EVENT, function(e) {
 *   alert('Font-size was changed');
 * });
 * </pre>
 * @param {goog.Timer} opt_timer Optional timer object that can be used instead
 * of an interval.  The monitor will listen on the TICK event.
 * @constructor
 * @extends goog.events.EventTarget
 */
goog.dom.FontSizeMonitor = function(opt_timer) {

  // Create a new element and position it off screen.  Use this so we can
  // guarantee its not going to have a fixed size.
  this.sizeElement_ = goog.dom.createDom(
      'div', { 'style': 'position:absolute;left:0;top:-1000px;' }, 'X');
  goog.dom.appendChild(goog.dom.getDocument().body, this.sizeElement_);

  this.lastSize_ = this.sizeElement_.offsetWidth;

  if (opt_timer) {
    this.timerListener_ = goog.events.listen(
        opt_timer, 'tick', this.checkFontSize_, false, this);
  } else {
    this.interval_ = goog.global.setInterval(
        goog.bind(this.checkFontSize_, this), 50);
  }
};
goog.inherits(goog.dom.FontSizeMonitor, goog.events.EventTarget);


/**
 * Constant for the fontsizechange event
 * @type {string}
 */
goog.dom.FontSizeMonitor.CHANGE_EVENT = 'fontsizechange';


/**
 * The key for the listener if a timer is used
 * @type {string?}
 * @private
 */
goog.dom.FontSizeMonitor.prototype.timerListener_ = null;


/**
 * Identifier for the interval
 * @type {number?}
 * @private
 */
goog.dom.FontSizeMonitor.prototype.interval_ = null;


/**
 * Dispose the fontsize monitor
 */
goog.dom.FontSizeMonitor.prototype.dispose = function() {
  if (!this.getDisposed()) {
    goog.dom.FontSizeMonitor.superClass_.dispose.call(this);
    goog.dom.removeNode(this.sizeElement_);
    if (this.timerListener_) {
      goog.events.unlistenByKey(this.timerListener_);
    }
    if (this.interval_) {
      window.clearInterval(this.interval_);
    }
  }
};


/**
 * Callback used to check the fontsize, if it has changed this will dispatch
 * a "fontsizechange" event.
 * @private
 */
goog.dom.FontSizeMonitor.prototype.checkFontSize_ = function() {
  var curSize = this.sizeElement_.offsetWidth;
  if (this.lastSize_ != curSize) {
    this.lastSize_ = curSize;
    this.dispatchEvent(goog.dom.FontSizeMonitor.CHANGE_EVENT);
  }
};
