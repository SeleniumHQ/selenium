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
 * @fileoverview Class that can be used to determine when an iframe is loaded.
 */

goog.provide('goog.net.IframeLoadMonitor');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.userAgent');



/**
 * The correct way to determine whether an iframe has completed loading
 * is different in IE and Firefox.  This class abstracts above these
 * differences, providing a consistent interface for:
 * <ol>
 * <li> Determing if an iframe is currently loaded
 * <li> Listening for an iframe that is not currently loaded, to finish loading
 * </ol>
 *
 * @param {HTMLIFrameElement} iframe An iframe.
 * @param {boolean=} opt_hasContent Does the loaded iframe have content.
 * @extends {goog.events.EventTarget}
 * @constructor
 */
goog.net.IframeLoadMonitor = function(iframe, opt_hasContent) {
  goog.base(this);

  /**
   * Iframe whose load state is monitored by this IframeLoadMonitor
   * @type {HTMLIFrameElement}
   * @private
   */
  this.iframe_ = iframe;

  /**
   * Whether or not the loaded iframe has any content.
   * @type {boolean}
   * @private
   */
  this.hasContent_ = !!opt_hasContent;

  /**
   * Whether or not the iframe is loaded.
   * @type {boolean}
   * @private
   */
  this.isLoaded_ = this.isLoadedHelper_();

  if (!this.isLoaded_) {
    // IE 6 (and lower?) does not reliably fire load events, so listen to
    // readystatechange.
    // IE 7 does not reliably fire readystatechange events but listening on load
    // seems to work just fine.
    var isIe6OrLess = goog.userAgent.IE && !goog.userAgent.isVersion('7');
    var loadEvtType = isIe6OrLess ?
        goog.events.EventType.READYSTATECHANGE : goog.events.EventType.LOAD;
    this.onloadListenerKey_ = goog.events.listen(
        this.iframe_, loadEvtType, this.handleLoad_, false, this);

    // Sometimes we still don't get the event callback, so we'll poll just to
    // be safe.
    this.intervalId_ = window.setInterval(
        goog.bind(this.handleLoad_, this),
        goog.net.IframeLoadMonitor.POLL_INTERVAL_MS_);
  }
};
goog.inherits(goog.net.IframeLoadMonitor, goog.events.EventTarget);


/**
 * Event type dispatched by a goog.net.IframeLoadMonitor when it internal iframe
 * finishes loading for the first time after construction of the
 * goog.net.IframeLoadMonitor
 * @type {string}
 */
goog.net.IframeLoadMonitor.LOAD_EVENT = 'ifload';


/**
 * Poll interval for polling iframe load states in milliseconds.
 * @type {number}
 * @private
 */
goog.net.IframeLoadMonitor.POLL_INTERVAL_MS_ = 100;


/**
 * Key for iframe load listener, or null if not currently listening on the
 * iframe for a load event.
 * @type {?number}
 * @private
 */
goog.net.IframeLoadMonitor.prototype.onloadListenerKey_ = null;


/**
 * Returns whether or not the iframe is loaded.
 * @return {boolean} whether or not the iframe is loaded.
 */
goog.net.IframeLoadMonitor.prototype.isLoaded = function() {
  return this.isLoaded_;
};


/**
 * Stops the poll timer if this IframeLoadMonitor is currently polling.
 * @private
 */
goog.net.IframeLoadMonitor.prototype.maybeStopTimer_ = function() {
  if (this.intervalId_) {
    window.clearInterval(this.intervalId_);
    this.intervalId_ = null;
  }
};


/**
 * Returns the iframe whose load state this IframeLoader monitors.
 * @return {HTMLIFrameElement} the iframe whose load state this IframeLoader
 *     monitors.
 */
goog.net.IframeLoadMonitor.prototype.getIframe = function() {
  return this.iframe_;
};


/** @override */
goog.net.IframeLoadMonitor.prototype.disposeInternal = function() {
  delete this.iframe_;
  this.maybeStopTimer_();
  goog.events.unlistenByKey(this.onloadListenerKey_);
  goog.net.IframeLoadMonitor.superClass_.disposeInternal.call(this);
};


/**
 * Returns whether or not the iframe is loaded.  Determines this by inspecting
 * browser dependent properties of the iframe.
 * @return {boolean} whether or not the iframe is loaded.
 * @private
 */
goog.net.IframeLoadMonitor.prototype.isLoadedHelper_ = function() {
  var isLoaded = false;
  /** @preserveTry */
  try {
    // IE will reliably have readyState set to complete if the iframe is loaded
    // For everything else, the iframe is loaded if there is a body and if the
    // body should have content the firstChild exists.  Firefox can fire
    // the LOAD event and then a few hundred ms later replace the
    // contentDocument once the content is loaded.
    isLoaded = goog.userAgent.IE ? this.iframe_.readyState == 'complete' :
        !!goog.dom.getFrameContentDocument(this.iframe_).body &&
        (!this.hasContent_ ||
        !!goog.dom.getFrameContentDocument(this.iframe_).body.firstChild);
  } catch (e) {
    // Ignore these errors. This just means that the iframe is not loaded
    // IE will throw error reading readyState if the iframe is not appended
    // to the dom yet.
    // Firefox will throw error getting the iframe body if the iframe is not
    // fully loaded.
  }
  return isLoaded;
};


/**
 * Handles an event indicating that the loading status of the iframe has
 * changed.  In Firefox this is a goog.events.EventType.LOAD event, in IE
 * this is a goog.events.EventType.READYSTATECHANGED
 * @private
 */
goog.net.IframeLoadMonitor.prototype.handleLoad_ = function() {
  // Only do the handler if the iframe is loaded.
  if (this.isLoadedHelper_()) {
    this.maybeStopTimer_();
    goog.events.unlistenByKey(this.onloadListenerKey_);
    this.onloadListenerKey_ = null;
    this.isLoaded_ = true;
    this.dispatchEvent(goog.net.IframeLoadMonitor.LOAD_EVENT);
  }
};

