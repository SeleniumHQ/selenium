// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Class that can be used to determine when multiple iframes have
 * been loaded. Refactored from static APIs in IframeLoadMonitor.
 */
goog.provide('goog.net.MultiIframeLoadMonitor');

goog.require('goog.events');
goog.require('goog.net.IframeLoadMonitor');



/**
 * Provides a wrapper around IframeLoadMonitor, to allow the caller to wait for
 * multiple iframes to load.
 *
 * @param {Array<HTMLIFrameElement>} iframes Array of iframe elements to
 *     wait until they are loaded.
 * @param {function():void} callback The callback to invoke once the frames have
 *     loaded.
 * @param {boolean=} opt_hasContent true if the monitor should wait until the
 *     iframes have content (body.firstChild != null).
 * @constructor
 * @final
 */
goog.net.MultiIframeLoadMonitor = function(iframes, callback, opt_hasContent) {
  /**
   * Array of IframeLoadMonitors we use to track the loaded status of any
   * currently unloaded iframes.
   * @type {Array<goog.net.IframeLoadMonitor>}
   * @private
   */
  this.pendingIframeLoadMonitors_ = [];

  /**
   * Callback which is invoked when all of the iframes are loaded.
   * @type {function():void}
   * @private
   */
  this.callback_ = callback;

  for (var i = 0; i < iframes.length; i++) {
    var iframeLoadMonitor = new goog.net.IframeLoadMonitor(
        iframes[i], opt_hasContent);
    if (iframeLoadMonitor.isLoaded()) {
      // Already loaded - don't need to wait
      iframeLoadMonitor.dispose();
    } else {
      // Iframe isn't loaded yet - register to be notified when it is
      // loaded, and track this monitor so we can dispose later as
      // required.
      this.pendingIframeLoadMonitors_.push(iframeLoadMonitor);
      goog.events.listen(
          iframeLoadMonitor, goog.net.IframeLoadMonitor.LOAD_EVENT, this);
    }
  }
  if (!this.pendingIframeLoadMonitors_.length) {
    // All frames were already loaded
    this.callback_();
  }
};


/**
 * Handles a pending iframe load monitor load event.
 * @param {goog.events.Event} e The goog.net.IframeLoadMonitor.LOAD_EVENT event.
 */
goog.net.MultiIframeLoadMonitor.prototype.handleEvent = function(e) {
  var iframeLoadMonitor = e.target;
  // iframeLoadMonitor is now loaded, remove it from the array of
  // pending iframe load monitors.
  for (var i = 0; i < this.pendingIframeLoadMonitors_.length; i++) {
    if (this.pendingIframeLoadMonitors_[i] == iframeLoadMonitor) {
      this.pendingIframeLoadMonitors_.splice(i, 1);
      break;
    }
  }

  // Disposes of the iframe load monitor.  We created this iframe load monitor
  // and installed the single listener on it, so it is safe to dispose it
  // in the middle of this event handler.
  iframeLoadMonitor.dispose();

  // If there are no more pending iframe load monitors, all the iframes
  // have loaded, and so we invoke the callback.
  if (!this.pendingIframeLoadMonitors_.length) {
    this.callback_();
  }
};


/**
 * Stops monitoring the iframes, cleaning up any associated resources. In
 * general, the object cleans up its own resources before invoking the
 * callback, so this API should only be used if the caller wants to stop the
 * monitoring before the iframes are loaded (for example, if the caller is
 * implementing a timeout).
 */
goog.net.MultiIframeLoadMonitor.prototype.stopMonitoring = function() {
  for (var i = 0; i < this.pendingIframeLoadMonitors_.length; i++) {
    this.pendingIframeLoadMonitors_[i].dispose();
  }
  this.pendingIframeLoadMonitors_.length = 0;
};

