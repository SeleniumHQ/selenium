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
 * @fileoverview This event monitor wraps the Page Visibility API.
 * @see http://www.w3.org/TR/page-visibility/
 */

goog.provide('goog.labs.dom.PageVisibilityEvent');
goog.provide('goog.labs.dom.PageVisibilityMonitor');
goog.provide('goog.labs.dom.PageVisibilityState');

goog.require('goog.dom');
goog.require('goog.dom.vendor');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.memoize');


/**
 * The different visibility states.
 * @enum {string}
 */
goog.labs.dom.PageVisibilityState = {
  HIDDEN: 'hidden',
  VISIBLE: 'visible',
  PRERENDER: 'prerender',
  UNLOADED: 'unloaded'
};



/**
 * This event handler allows you to catch page visibility change events.
 * @param {!goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.events.EventTarget}
 * @final
 */
goog.labs.dom.PageVisibilityMonitor = function(opt_domHelper) {
  goog.labs.dom.PageVisibilityMonitor.base(this, 'constructor');

  /**
   * @private {!goog.dom.DomHelper}
   */
  this.domHelper_ = opt_domHelper || goog.dom.getDomHelper();

  /**
   * @private {?string}
   */
  this.eventType_ = this.getBrowserEventType_();

  // Some browsers do not support visibilityChange and therefore we don't bother
  // setting up events.
  if (this.eventType_) {
    /**
     * @private {goog.events.Key}
     */
    this.eventKey_ = goog.events.listen(
        this.domHelper_.getDocument(), this.eventType_,
        goog.bind(this.handleChange_, this));
  }
};
goog.inherits(goog.labs.dom.PageVisibilityMonitor, goog.events.EventTarget);


/**
 * @return {?string} The visibility change event type, or null if not supported.
 *     Memoized for performance.
 * @private
 */
goog.labs.dom.PageVisibilityMonitor.prototype
    .getBrowserEventType_ = goog.memoize(function() {
  var isSupported =
      /** @type {!goog.labs.dom.PageVisibilityMonitor} */ (this).isSupported();
  var isPrefixed =
      /** @type {!goog.labs.dom.PageVisibilityMonitor} */ (this).isPrefixed_();

  if (isSupported) {
    return isPrefixed ?
        goog.dom.vendor.getPrefixedEventType(
            goog.events.EventType.VISIBILITYCHANGE) :
        goog.events.EventType.VISIBILITYCHANGE;
  } else {
    return null;
  }
});


/**
 * @return {?string} The browser-specific document.hidden property.  Memoized
 *     for performance.
 * @private
 */
goog.labs.dom.PageVisibilityMonitor.prototype.getHiddenPropertyName_ =
    goog.memoize(function() {
      return goog.dom.vendor.getPrefixedPropertyName(
          'hidden',
          /** @type {!goog.labs.dom.PageVisibilityMonitor} */
          (this).domHelper_.getDocument());
    });


/**
 * @return {boolean} Whether the visibility API is prefixed.
 * @private
 */
goog.labs.dom.PageVisibilityMonitor.prototype.isPrefixed_ = function() {
  return this.getHiddenPropertyName_() != 'hidden';
};


/**
 * @return {?string} The browser-specific document.visibilityState property.
 *     Memoized for performance.
 * @private
 */
goog.labs.dom.PageVisibilityMonitor.prototype.getVisibilityStatePropertyName_ =
    goog.memoize(function() {
      return goog.dom.vendor.getPrefixedPropertyName(
          'visibilityState',
          /** @type {!goog.labs.dom.PageVisibilityMonitor} */
          (this).domHelper_.getDocument());
    });


/**
 * @return {boolean} Whether the visibility API is supported.
 */
goog.labs.dom.PageVisibilityMonitor.prototype.isSupported = function() {
  return !!this.getHiddenPropertyName_();
};


/**
 * @return {boolean} Whether the page is visible.
 */
goog.labs.dom.PageVisibilityMonitor.prototype.isHidden = function() {
  return !!this.domHelper_.getDocument()[this.getHiddenPropertyName_()];
};


/**
 * @return {?goog.labs.dom.PageVisibilityState} The page visibility state, or
 *     null if not supported.
 */
goog.labs.dom.PageVisibilityMonitor.prototype.getVisibilityState = function() {
  if (!this.isSupported()) {
    return null;
  }
  return this.domHelper_.getDocument()[this.getVisibilityStatePropertyName_()];
};


/**
 * Handles the events on the element.
 * @param {goog.events.BrowserEvent} e The underlying browser event.
 * @private
 */
goog.labs.dom.PageVisibilityMonitor.prototype.handleChange_ = function(e) {
  var state = this.getVisibilityState();
  var visibilityEvent = new goog.labs.dom.PageVisibilityEvent(
      this.isHidden(),
      /** @type {goog.labs.dom.PageVisibilityState} */ (state));
  this.dispatchEvent(visibilityEvent);
};


/** @override */
goog.labs.dom.PageVisibilityMonitor.prototype.disposeInternal = function() {
  goog.events.unlistenByKey(this.eventKey_);
  goog.labs.dom.PageVisibilityMonitor.base(this, 'disposeInternal');
};



/**
 * A page visibility change event.
 * @param {boolean} hidden Whether the page is hidden.
 * @param {goog.labs.dom.PageVisibilityState} visibilityState A more detailed
 *     visibility state.
 * @constructor
 * @extends {goog.events.Event}
 * @final
 */
goog.labs.dom.PageVisibilityEvent = function(hidden, visibilityState) {
  goog.labs.dom.PageVisibilityEvent.base(
      this, 'constructor', goog.events.EventType.VISIBILITYCHANGE);

  /**
   * Whether the page is hidden.
   * @type {boolean}
   */
  this.hidden = hidden;

  /**
   * A more detailed visibility state.
   * @type {goog.labs.dom.PageVisibilityState}
   */
  this.visibilityState = visibilityState;
};
goog.inherits(goog.labs.dom.PageVisibilityEvent, goog.events.Event);
