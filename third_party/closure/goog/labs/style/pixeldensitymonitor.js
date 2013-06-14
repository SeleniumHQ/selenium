// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utility class that monitors pixel density ratio changes.
 *
 * @see ../demos/pixeldensitymonitor.html
 */

goog.provide('goog.labs.style.PixelDensityMonitor');
goog.provide('goog.labs.style.PixelDensityMonitor.Density');
goog.provide('goog.labs.style.PixelDensityMonitor.EventType');

goog.require('goog.events');
goog.require('goog.events.EventTarget');



/**
 * Monitors the window for changes to the ratio between device and screen
 * pixels, e.g. when the user moves the window from a high density screen to a
 * screen with normal density. Dispatches
 * goog.labs.style.PixelDensityMonitor.EventType.CHANGE events when the density
 * changes between the two predefined values NORMAL and HIGH.
 *
 * This class uses the window.devicePixelRatio value which is supported in
 * WebKit and FF18. If the value does not exist, it will always return a
 * NORMAL density. It requires support for MediaQueryList to detect changes to
 * the devicePixelRatio.
 *
 * @param {!goog.dom.DomHelper=} opt_domHelper The DomHelper which contains the
 *     document associated with the window to listen to. Defaults to the one in
 *     which this code is executing.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.labs.style.PixelDensityMonitor = function(opt_domHelper) {
  goog.base(this);

  /**
   * @type {Window}
   * @private
   */
  this.window_ = opt_domHelper ? opt_domHelper.getWindow() : window;

  /**
   * The last density that was reported so that changes can be detected.
   * @type {goog.labs.style.PixelDensityMonitor.Density}
   * @private
   */
  this.lastDensity_ = this.getDensity();

  /**
   * @type {function (MediaQueryList)}
   * @private
   */
  this.listener_ = goog.bind(this.handleMediaQueryChange_, this);

  /**
   * The media query list for a query that detects high density, if supported
   * by the browser. Because matchMedia returns a new object for every call, it
   * needs to be saved here so the listener can be removed when disposing.
   * @type {?MediaQueryList}
   * @private
   */
  this.mediaQueryList_ = this.window_.matchMedia ? this.window_.matchMedia(
      goog.labs.style.PixelDensityMonitor.HIGH_DENSITY_QUERY_) : null;
};
goog.inherits(goog.labs.style.PixelDensityMonitor, goog.events.EventTarget);


/**
 * The two different pixel density modes on which the various ratios between
 * physical and device pixels are mapped.
 * @enum {number}
 */
goog.labs.style.PixelDensityMonitor.Density = {
  /**
   * Mode for older portable devices and desktop screens, defined as having a
   * device pixel ratio of less than 1.5.
   */
  NORMAL: 1,

  /**
   * Mode for newer portable devices with a high resolution screen, defined as
   * having a device pixel ratio of more than 1.5.
   */
  HIGH: 2
};


/**
 * The events fired by the PixelDensityMonitor.
 * @enum {string}
 */
goog.labs.style.PixelDensityMonitor.EventType = {
  /**
   * Dispatched when density changes between NORMAL and HIGH.
   */
  CHANGE: goog.events.getUniqueId('change')
};


/**
 * Minimum ratio between device and screen pixel needed for high density mode.
 * @type {number}
 * @private
 */
goog.labs.style.PixelDensityMonitor.HIGH_DENSITY_RATIO_ = 1.5;


/**
 * Media query that matches for high density.
 * @type {string}
 * @private
 */
goog.labs.style.PixelDensityMonitor.HIGH_DENSITY_QUERY_ =
    '(min-resolution: 1.5dppx), (-webkit-min-device-pixel-ratio: 1.5)';


/**
 * Starts monitoring for changes in pixel density.
 */
goog.labs.style.PixelDensityMonitor.prototype.start = function() {
  if (this.mediaQueryList_) {
    this.mediaQueryList_.addListener(this.listener_);
  }
};


/**
 * @return {goog.labs.style.PixelDensityMonitor.Density} The density for the
 *     window.
 */
goog.labs.style.PixelDensityMonitor.prototype.getDensity = function() {
  if (this.window_.devicePixelRatio >=
      goog.labs.style.PixelDensityMonitor.HIGH_DENSITY_RATIO_) {
    return goog.labs.style.PixelDensityMonitor.Density.HIGH;
  } else {
    return goog.labs.style.PixelDensityMonitor.Density.NORMAL;
  }
};


/**
 * Handles a change to the media query and checks whether the density has
 * changed since the last call.
 * @param {MediaQueryList} mql The list of changed media queries.
 * @private
 */
goog.labs.style.PixelDensityMonitor.prototype.handleMediaQueryChange_ =
    function(mql) {
  var newDensity = this.getDensity();
  if (this.lastDensity_ != newDensity) {
    this.lastDensity_ = newDensity;
    this.dispatchEvent(goog.labs.style.PixelDensityMonitor.EventType.CHANGE);
  }
};


/** @override */
goog.labs.style.PixelDensityMonitor.prototype.disposeInternal = function() {
  if (this.mediaQueryList_) {
    this.mediaQueryList_.removeListener(this.listener_);
  }
  goog.base(this, 'disposeInternal');
};
