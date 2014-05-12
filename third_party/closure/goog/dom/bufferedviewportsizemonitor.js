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
 * @fileoverview A viewport size monitor that buffers RESIZE events until the
 * window size has stopped changing, within a specified period of time.  For
 * every RESIZE event dispatched, this will dispatch up to two *additional*
 * events:
 * - {@link #EventType.RESIZE_WIDTH} if the viewport's width has changed since
 *   the last buffered dispatch.
 * - {@link #EventType.RESIZE_HEIGHT} if the viewport's height has changed since
 *   the last buffered dispatch.
 * You likely only need to listen to one of the three events.  But if you need
 * more, just be cautious of duplicating effort.
 *
 */

goog.provide('goog.dom.BufferedViewportSizeMonitor');

goog.require('goog.asserts');
goog.require('goog.async.Delay');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');



/**
 * Creates a new BufferedViewportSizeMonitor.
 * @param {!goog.dom.ViewportSizeMonitor} viewportSizeMonitor The
 *     underlying viewport size monitor.
 * @param {number=} opt_bufferMs The buffer time, in ms. If not specified, this
 *     value defaults to {@link #RESIZE_EVENT_DELAY_MS_}.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @final
 */
goog.dom.BufferedViewportSizeMonitor = function(
    viewportSizeMonitor, opt_bufferMs) {
  goog.dom.BufferedViewportSizeMonitor.base(this, 'constructor');

  /**
   * The underlying viewport size monitor.
   * @type {goog.dom.ViewportSizeMonitor}
   * @private
   */
  this.viewportSizeMonitor_ = viewportSizeMonitor;

  /**
   * The current size of the viewport.
   * @type {goog.math.Size}
   * @private
   */
  this.currentSize_ = this.viewportSizeMonitor_.getSize();

  /**
   * The resize buffer time in ms.
   * @type {number}
   * @private
   */
  this.resizeBufferMs_ = opt_bufferMs ||
      goog.dom.BufferedViewportSizeMonitor.RESIZE_EVENT_DELAY_MS_;

  /**
   * Listener key for the viewport size monitor.
   * @type {goog.events.Key}
   * @private
   */
  this.listenerKey_ = goog.events.listen(
      viewportSizeMonitor,
      goog.events.EventType.RESIZE,
      this.handleResize_,
      false,
      this);
};
goog.inherits(goog.dom.BufferedViewportSizeMonitor, goog.events.EventTarget);


/**
 * Additional events to dispatch.
 * @enum {string}
 */
goog.dom.BufferedViewportSizeMonitor.EventType = {
  RESIZE_HEIGHT: goog.events.getUniqueId('resizeheight'),
  RESIZE_WIDTH: goog.events.getUniqueId('resizewidth')
};


/**
 * Delay for the resize event.
 * @type {goog.async.Delay}
 * @private
 */
goog.dom.BufferedViewportSizeMonitor.prototype.resizeDelay_;


/**
 * Default number of milliseconds to wait after a resize event to relayout the
 * page.
 * @type {number}
 * @const
 * @private
 */
goog.dom.BufferedViewportSizeMonitor.RESIZE_EVENT_DELAY_MS_ = 100;


/** @override */
goog.dom.BufferedViewportSizeMonitor.prototype.disposeInternal =
    function() {
  goog.events.unlistenByKey(this.listenerKey_);
  goog.dom.BufferedViewportSizeMonitor.base(this, 'disposeInternal');
};


/**
 * Handles resize events on the underlying ViewportMonitor.
 * @private
 */
goog.dom.BufferedViewportSizeMonitor.prototype.handleResize_ =
    function() {
  // Lazily create when needed.
  if (!this.resizeDelay_) {
    this.resizeDelay_ = new goog.async.Delay(
        this.onWindowResize_,
        this.resizeBufferMs_,
        this);
    this.registerDisposable(this.resizeDelay_);
  }
  this.resizeDelay_.start();
};


/**
 * Window resize callback that determines whether to reflow the view contents.
 * @private
 */
goog.dom.BufferedViewportSizeMonitor.prototype.onWindowResize_ =
    function() {
  if (this.viewportSizeMonitor_.isDisposed()) {
    return;
  }

  var previousSize = this.currentSize_;
  var currentSize = this.viewportSizeMonitor_.getSize();

  goog.asserts.assert(currentSize,
      'Viewport size should be set at this point');

  this.currentSize_ = currentSize;

  if (previousSize) {

    var resized = false;

    // Width has changed
    if (previousSize.width != currentSize.width) {
      this.dispatchEvent(
          goog.dom.BufferedViewportSizeMonitor.EventType.RESIZE_WIDTH);
      resized = true;
    }

    // Height has changed
    if (previousSize.height != currentSize.height) {
      this.dispatchEvent(
          goog.dom.BufferedViewportSizeMonitor.EventType.RESIZE_HEIGHT);
      resized = true;
    }

    // If either has changed, this is a resize event.
    if (resized) {
      this.dispatchEvent(goog.events.EventType.RESIZE);
    }

  } else {
    // If we didn't have a previous size, we consider all events to have
    // changed.
    this.dispatchEvent(
        goog.dom.BufferedViewportSizeMonitor.EventType.RESIZE_HEIGHT);
    this.dispatchEvent(
        goog.dom.BufferedViewportSizeMonitor.EventType.RESIZE_WIDTH);
    this.dispatchEvent(goog.events.EventType.RESIZE);
  }
};


/**
 * Returns the current size of the viewport.
 * @return {goog.math.Size?} The current viewport size.
 */
goog.dom.BufferedViewportSizeMonitor.prototype.getSize = function() {
  return this.currentSize_ ? this.currentSize_.clone() : null;
};
