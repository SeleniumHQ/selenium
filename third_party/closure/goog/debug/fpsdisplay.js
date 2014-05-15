// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Displays frames per second (FPS) for the current window.
 * Only supported in browsers that support requestAnimationFrame.
 * See: https://developer.mozilla.org/en/DOM/window.requestAnimationFrame.
 *
 * @see ../demos/fpsdisplay.html
 */

goog.provide('goog.debug.FpsDisplay');

goog.require('goog.asserts');
goog.require('goog.async.AnimationDelay');
goog.require('goog.ui.Component');



/**
 * Displays frames per seconds that the window this component is
 * rendered in is animating at.
 *
 * @param {goog.dom.DomHelper=} opt_domHelper An optional dom helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.debug.FpsDisplay = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(goog.debug.FpsDisplay, goog.ui.Component);


/**
 * CSS class for the FPS display.
 */
goog.debug.FpsDisplay.CSS = goog.getCssName('goog-fps-display');


/**
 * The number of samples per FPS report.
 */
goog.debug.FpsDisplay.SAMPLES = 10;


/**
 * The current animation.
 * @type {goog.debug.FpsDisplay.FpsAnimation_}
 * @private
 */
goog.debug.FpsDisplay.prototype.animation_ = null;


/** @override */
goog.debug.FpsDisplay.prototype.createDom = function() {
  this.setElementInternal(
      this.getDomHelper().createDom('div', goog.debug.FpsDisplay.CSS));
};


/** @override */
goog.debug.FpsDisplay.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.animation_ = new goog.debug.FpsDisplay.FpsAnimation_(this.getElement());
  this.delay_ = new goog.async.AnimationDelay(
      this.handleDelay_, this.getDomHelper().getWindow(), this);
  this.delay_.start();
};


/**
 * @param {number} now The current time.
 * @private
 */
goog.debug.FpsDisplay.prototype.handleDelay_ = function(now) {
  if (this.isInDocument()) {
    this.animation_.onAnimationFrame(now);
    this.delay_.start();
  }
};


/** @override */
goog.debug.FpsDisplay.prototype.exitDocument = function() {
  goog.base(this, 'exitDocument');
  this.animation_ = null;
  goog.dispose(this.delay_);
};


/**
 * @return {number} The average frames per second.
 */
goog.debug.FpsDisplay.prototype.getFps = function() {
  goog.asserts.assert(
      this.isInDocument(), 'Render the FPS display before querying FPS');
  return this.animation_.lastFps_;
};



/**
 * @param {Element} elem An element to hold the FPS count.
 * @constructor
 * @private
 */
goog.debug.FpsDisplay.FpsAnimation_ = function(elem) {
  /**
   * An element to hold the current FPS rate.
   * @type {Element}
   * @private
   */
  this.element_ = elem;

  /**
   * The number of frames observed so far.
   * @type {number}
   * @private
   */
  this.frameNumber_ = 0;
};


/**
 * The last time which we reported FPS at.
 * @type {number}
 * @private
 */
goog.debug.FpsDisplay.FpsAnimation_.prototype.lastTime_ = 0;


/**
 * The last average FPS.
 * @type {number}
 * @private
 */
goog.debug.FpsDisplay.FpsAnimation_.prototype.lastFps_ = -1;


/**
 * @param {number} now The current time.
 */
goog.debug.FpsDisplay.FpsAnimation_.prototype.onAnimationFrame = function(now) {
  var SAMPLES = goog.debug.FpsDisplay.SAMPLES;
  if (this.frameNumber_ % SAMPLES == 0) {
    this.lastFps_ = Math.round((1000 * SAMPLES) / (now - this.lastTime_));
    this.element_.innerHTML = this.lastFps_;
    this.lastTime_ = now;
  }
  this.frameNumber_++;
};
