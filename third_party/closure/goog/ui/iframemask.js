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
 * @fileoverview Iframe shims, to protect controls on the underlying page
 * from bleeding through popups.
 *
 */


goog.provide('goog.ui.IframeMask');

goog.require('goog.Disposable');
goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.dom.iframe');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.style');



/**
 * Controller for an iframe mask. The mask is only valid in the current
 * document, or else the document of the given DOM helper.
 *
 * @param {goog.dom.DomHelper=} opt_domHelper The DOM helper for the relevant
 *     document.
 * @param {goog.structs.Pool=} opt_iframePool An optional source of iframes.
 *     Iframes will be grabbed from the pool when they're needed and returned
 *     to the pool (but still attached to the DOM) when they're done.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.ui.IframeMask = function(opt_domHelper, opt_iframePool) {
  goog.Disposable.call(this);

  /**
   * The DOM helper for this document.
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();

  /**
   * An Element to snap the mask to. If none is given, defaults to
   * a full-screen iframe mask.
   * @type {Element}
   * @private
   */
  this.snapElement_ = this.dom_.getDocument().documentElement;

  /**
   * An event handler for listening to popups and the like.
   * @type {goog.events.EventHandler|undefined}
   * @private
   */
  this.handler_ = new goog.events.EventHandler(this);

  /**
   * An iframe pool.
   * @type {goog.structs.Pool|undefined}
   * @private
   */
  this.iframePool_ = opt_iframePool;
};
goog.inherits(goog.ui.IframeMask, goog.Disposable);


/**
 * An iframe.
 * @type {HTMLIFrameElement}
 * @private
 */
goog.ui.IframeMask.prototype.iframe_;


/**
 * The z-index of the iframe mask.
 * @type {number}
 * @private
 */
goog.ui.IframeMask.prototype.zIndex_ = 1;


/**
 * The opacity of the iframe mask, expressed as a value between 0 and 1, with
 * 1 being totally opaque.
 * @type {number}
 * @private
 */
goog.ui.IframeMask.prototype.opacity_ = 0;


/**
 * Removes the iframe from the DOM.
 * @override
 */
goog.ui.IframeMask.prototype.disposeInternal = function() {
  if (this.iframePool_) {
    this.iframePool_.releaseObject(
        /** @type {HTMLIFrameElement} */ (this.iframe_));
  } else {
    goog.dom.removeNode(this.iframe_);
  }
  this.iframe_ = null;

  this.handler_.dispose();
  this.handler_ = null;

  goog.ui.IframeMask.superClass_.disposeInternal.call(this);
};


/**
 * CSS for a hidden iframe.
 * @type {string}
 * @private
 */
goog.ui.IframeMask.HIDDEN_CSS_TEXT_ =
    'position:absolute;display:none;z-index:1';


/**
 * Removes the mask from the screen.
 */
goog.ui.IframeMask.prototype.hideMask = function() {
  if (this.iframe_) {
    this.iframe_.style.cssText = goog.ui.IframeMask.HIDDEN_CSS_TEXT_;
    if (this.iframePool_) {
      this.iframePool_.releaseObject(this.iframe_);
      this.iframe_ = null;
    }
  }
};


/**
 * Gets the iframe to use as a mask. Creates a new one if one has not been
 * created yet.
 * @return {HTMLIFrameElement} The iframe.
 * @private
 */
goog.ui.IframeMask.prototype.getIframe_ = function() {
  if (!this.iframe_) {
    this.iframe_ = this.iframePool_ ?
        /** @type {HTMLIFrameElement} */ (this.iframePool_.getObject()) :
        goog.dom.iframe.createBlank(this.dom_);
    this.iframe_.style.cssText = goog.ui.IframeMask.HIDDEN_CSS_TEXT_;
    this.dom_.getDocument().body.appendChild(this.iframe_);
  }
  return this.iframe_;
};


/**
 * Applies the iframe mask to the screen.
 */
goog.ui.IframeMask.prototype.applyMask = function() {
  var iframe = this.getIframe_();
  var bounds = goog.style.getBounds(this.snapElement_);
  iframe.style.cssText =
      'position:absolute;' +
      'left:' + bounds.left + 'px;' +
      'top:' + bounds.top + 'px;' +
      'width:' + bounds.width + 'px;' +
      'height:' + bounds.height + 'px;' +
      'z-index:' + this.zIndex_;
  goog.style.setOpacity(iframe, this.opacity_);
  iframe.style.display = 'block';
};


/**
 * Sets the opacity of the mask. Will take effect the next time the mask
 * is applied.
 * @param {number} opacity A value between 0 and 1, with 1 being
 *     totally opaque.
 */
goog.ui.IframeMask.prototype.setOpacity = function(opacity) {
  this.opacity_ = opacity;
};


/**
 * Sets the z-index of the mask. Will take effect the next time the mask
 * is applied.
 * @param {number} zIndex A z-index value.
 */
goog.ui.IframeMask.prototype.setZIndex = function(zIndex) {
  this.zIndex_ = zIndex;
};


/**
 * Sets the element to use as the bounds of the mask. Takes effect immediately.
 * @param {Element} snapElement The snap element, which the iframe will be
 *     "snapped" around.
 */
goog.ui.IframeMask.prototype.setSnapElement = function(snapElement) {
  this.snapElement_ = snapElement;
  if (this.iframe_ && goog.style.isElementShown(this.iframe_)) {
    this.applyMask();
  }
};


/**
 * Listens on the specified target, hiding and showing the iframe mask
 * when the given event types are dispatched.
 * @param {goog.events.EventTarget} target The event target to listen on.
 * @param {string} showEvent When this event fires, the mask will be applied.
 * @param {string} hideEvent When this event fires, the mask will be hidden.
 * @param {Element=} opt_snapElement When the mask is applied, it will
 *     automatically snap to this element. If no element is specified, it will
 *     use the default snap element.
 */
goog.ui.IframeMask.prototype.listenOnTarget = function(target, showEvent,
    hideEvent, opt_snapElement) {
  var timerKey;
  this.handler_.listen(target, showEvent, function() {
    if (opt_snapElement) {
      this.setSnapElement(opt_snapElement);
    }
    // Check out the iframe asynchronously, so we don't block the SHOW
    // event and cause a bounce.
    timerKey = goog.Timer.callOnce(this.applyMask, 0, this);
  });
  this.handler_.listen(target, hideEvent, function() {
    if (timerKey) {
      goog.Timer.clear(timerKey);
      timerKey = null;
    }
    this.hideMask();
  });
};


/**
 * Removes all handlers attached by listenOnTarget.
 */
goog.ui.IframeMask.prototype.removeHandlers = function() {
  this.handler_.removeAll();
};
