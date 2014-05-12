// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utility class that monitors viewport size changes.
 *
 * @author attila@google.com (Attila Bodis)
 * @see ../demos/viewportsizemonitor.html
 */

goog.provide('goog.dom.ViewportSizeMonitor');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.math.Size');



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
 * Manually verified on IE6, IE7, FF2, Opera 11, Safari 4 and Chrome.
 *
 * @param {Window=} opt_window The window to monitor; defaults to the window in
 *    which this code is executing.
 * @constructor
 * @extends {goog.events.EventTarget}
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
};
goog.inherits(goog.dom.ViewportSizeMonitor, goog.events.EventTarget);


/**
 * Returns a viewport size monitor for the given window.  A new one is created
 * if it doesn't exist already.  This prevents the unnecessary creation of
 * multiple spooling monitors for a window.
 * @param {Window=} opt_window The window to monitor; defaults to the window in
 *     which this code is executing.
 * @return {!goog.dom.ViewportSizeMonitor} Monitor for the given window.
 */
goog.dom.ViewportSizeMonitor.getInstanceForWindow = function(opt_window) {
  var currentWindow = opt_window || window;
  var uid = goog.getUid(currentWindow);

  return goog.dom.ViewportSizeMonitor.windowInstanceMap_[uid] =
      goog.dom.ViewportSizeMonitor.windowInstanceMap_[uid] ||
      new goog.dom.ViewportSizeMonitor(currentWindow);
};


/**
 * Removes and disposes a viewport size monitor for the given window if one
 * exists.
 * @param {Window=} opt_window The window whose monitor should be removed;
 *     defaults to the window in which this code is executing.
 */
goog.dom.ViewportSizeMonitor.removeInstanceForWindow = function(opt_window) {
  var uid = goog.getUid(opt_window || window);

  goog.dispose(goog.dom.ViewportSizeMonitor.windowInstanceMap_[uid]);
  delete goog.dom.ViewportSizeMonitor.windowInstanceMap_[uid];
};


/**
 * Map of window hash code to viewport size monitor for that window, if
 * created.
 * @type {Object.<number,goog.dom.ViewportSizeMonitor>}
 * @private
 */
goog.dom.ViewportSizeMonitor.windowInstanceMap_ = {};


/**
 * Event listener key for window the window resize handler, as returned by
 * {@link goog.events.listen}.
 * @type {goog.events.Key}
 * @private
 */
goog.dom.ViewportSizeMonitor.prototype.listenerKey_ = null;


/**
 * The window to monitor.  Defaults to the window in which the code is running.
 * @type {Window}
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
 * Returns the most recently recorded size of the viewport, in pixels.  May
 * return null if no window resize event has been handled yet.
 * @return {goog.math.Size} The viewport dimensions, in pixels.
 */
goog.dom.ViewportSizeMonitor.prototype.getSize = function() {
  // Return a clone instead of the original to preserve encapsulation.
  return this.size_ ? this.size_.clone() : null;
};


/** @override */
goog.dom.ViewportSizeMonitor.prototype.disposeInternal = function() {
  goog.dom.ViewportSizeMonitor.superClass_.disposeInternal.call(this);

  if (this.listenerKey_) {
    goog.events.unlistenByKey(this.listenerKey_);
    this.listenerKey_ = null;
  }

  this.window_ = null;
  this.size_ = null;
};


/**
 * Handles window resize events by measuring the dimensions of the
 * viewport and dispatching a {@link goog.events.EventType.RESIZE} event if the
 * current dimensions are different from the previous ones.
 * @param {goog.events.Event} event The window resize event to handle.
 * @private
 */
goog.dom.ViewportSizeMonitor.prototype.handleResize_ = function(event) {
  var size = goog.dom.getViewportSize(this.window_);
  if (!goog.math.Size.equals(size, this.size_)) {
    this.size_ = size;
    this.dispatchEvent(goog.events.EventType.RESIZE);
  }
};
