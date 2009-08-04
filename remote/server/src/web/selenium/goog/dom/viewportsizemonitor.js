// Copyright 2007 Google Inc.
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
 * @fileoverview Utility class that monitors viewport size changes.
 */

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.math.Size');

goog.provide('goog.dom.ViewportSizeMonitor');


/**
 * This class can be used to monitor changes in the viewport size.  Instances
 * dispatch a {@link goog.events.EventType.RESIZE} event when the viewport size
 * changes.  Handlers can call {@link goog.dom.ViewportSizeMonitor#getSize} to
 * get the new viewport size.
 *
 * Use this class if you want to execute resize/reflow logic each time the
 * user resizes the browser window.  This class is guaranteed to only dispatch
 * {@code RESIZE} events when the pixel dimensions of the viewport change.
 * (Internet Explorer fires resize events if any element on the page is resized,
 * even if the viewport dimensions are unchanged, which can lead to infinite
 * resize loops.)
 *
 * Example usage:
 *  <pre>
 *    var vsm = new goog.dom.ViewportSizeMonitor();
 *    goog.events.listen(vsm, goog.events.EventType.RESIZE, function(e) {
 *      alert('Viewport size changed to ' + vsm.getSize());
 *    });
 *  </pre>
 *
 * Manually verified on IE6, IE7, FF2, Opera 9, and WebKit.  {@code getSize}
 * doesn't always return the correct viewport height on Safari 2.0.4.
 *
 * @param {Window} opt_window The window to monitor; defaults to the window in
 *    which this code is executing.
 * @constructor
 * @extends goog.events.EventTarget
 */
goog.dom.ViewportSizeMonitor = function(opt_window) {
  goog.events.EventTarget.call(this);

  // Default the window to the current window if unspecified.
  this.window_ = opt_window || window;

  // Listen for window resize events.
  this.listenerKey_ = goog.events.listen(this.window_,
      goog.events.EventType.RESIZE, this.handleResize_, false, this);

  // Set the initial size.
  this.size_ = goog.dom.getViewportSize(this.window_);

  if (goog.userAgent.WEBKIT && goog.userAgent.WINDOWS) {
    this.windowSizePollInterval_ = window.setInterval(
        goog.bind(this.checkForSizeChange_, this),
        goog.dom.ViewportSizeMonitor.WIN_WEBKIT_WINDOW_SIZE_POLL_RATE);
  }
};
goog.inherits(goog.dom.ViewportSizeMonitor, goog.events.EventTarget);


/**
 * Rate in milliseconds at which to poll the window size on Windows Safari.
 * @type {number}
 */
goog.dom.ViewportSizeMonitor.WIN_WEBKIT_WINDOW_SIZE_POLL_RATE = 500;


/**
 * Event listener key for window the window resize handler, as returned by
 * {@link goog.events.listen}.
 * @type {string?}
 * @private
 */
goog.dom.ViewportSizeMonitor.prototype.listenerKey_ = null;


/**
 * The window to monitor.  Defaults to the window in which the code is running.
 * @type {Window?}
 * @private
 */
goog.dom.ViewportSizeMonitor.prototype.window_ = null;


/**
 * The most recently recorded size of the viewport, in pixels.
 * @type {goog.math.Size?}
 * @private
 */
goog.dom.ViewportSizeMonitor.prototype.size_ = null;


/**
 * Identifier for the interval used for polling the window size on Windows
 * Safari.
 * @type {number?}
 * @private
 */
goog.dom.ViewportSizeMonitor.prototype.windowSizePollInterval_ = null;


/**
 * Returns the most recently recorded size of the viewport, in pixels.  May
 * return null if no window resize event has been handled yet.
 * @return {goog.math.Size} The viewport dimensions, in pixels.
 */
goog.dom.ViewportSizeMonitor.prototype.getSize = function() {
  // Return a clone instead of the original to preserve encapsulation.
  return this.size_ ? this.size_.clone() : null;
};


/**
 * Disposes of the object.  Overrides {@link goog.events.EventTarget#dispose}.
 */
goog.dom.ViewportSizeMonitor.prototype.dispose = function() {
  if (!this.getDisposed()) {
    goog.dom.ViewportSizeMonitor.superClass_.dispose.call(this);

    if (this.listenerKey_) {
      goog.events.unlistenByKey(this.listenerKey_);
      this.listenerKey_ = null;
    }

    if (this.windowSizePollInterval_) {
      window.clearInterval(this.windowSizePollInterval_);
      this.windowSizePollInterval_ = null;
    }

    this.window_ = null;
    this.size_ = null;
  }
};


/**
 * Handles window resize events by measuring the dimensions of the
 * viewport and dispatching a {@link goog.events.EventType.RESIZE} event if the
 * current dimensions are different from the previous ones.
 * @param {goog.events.Event} event The window resize event to handle.
 * @private
 */
goog.dom.ViewportSizeMonitor.prototype.handleResize_ = function(event) {
  this.checkForSizeChange_();
};


/**
 * Measures the dimensions of the viewport and dispatches a
 * {@link goog.events.EventType.RESIZE} event if the current dimensions are
 * different from the previous ones.
 * @private
 */
goog.dom.ViewportSizeMonitor.prototype.checkForSizeChange_ = function() {
  var size = goog.dom.getViewportSize(this.window_);
  if (!goog.math.Size.equals(size, this.size_)) {
    this.size_ = size;
    this.dispatchEvent(goog.events.EventType.RESIZE);
  }
};
