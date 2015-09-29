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
 * @fileoverview Functions for managing full screen status of the DOM.
 *
 */

goog.provide('goog.dom.fullscreen');
goog.provide('goog.dom.fullscreen.EventType');

goog.require('goog.dom');
goog.require('goog.userAgent');


/**
 * Event types for full screen.
 * @enum {string}
 */
goog.dom.fullscreen.EventType = {
  /** Dispatched by the Document when the fullscreen status changes. */
  CHANGE: (function() {
    if (goog.userAgent.WEBKIT) {
      return 'webkitfullscreenchange';
    }
    if (goog.userAgent.GECKO) {
      return 'mozfullscreenchange';
    }
    if (goog.userAgent.IE) {
      return 'MSFullscreenChange';
    }
    // Opera 12-14, and W3C standard (Draft):
    // https://dvcs.w3.org/hg/fullscreen/raw-file/tip/Overview.html
    return 'fullscreenchange';
  })()
};


/**
 * Determines if full screen is supported.
 * @param {!goog.dom.DomHelper=} opt_domHelper The DomHelper for the DOM being
 *     queried. If not provided, use the current DOM.
 * @return {boolean} True iff full screen is supported.
 */
goog.dom.fullscreen.isSupported = function(opt_domHelper) {
  var doc = goog.dom.fullscreen.getDocument_(opt_domHelper);
  var body = doc.body;
  return !!(body.webkitRequestFullscreen ||
      (body.mozRequestFullScreen && doc.mozFullScreenEnabled) ||
      (body.msRequestFullscreen && doc.msFullscreenEnabled) ||
      (body.requestFullscreen && doc.fullscreenEnabled));
};


/**
 * Requests putting the element in full screen.
 * @param {!Element} element The element to put full screen.
 */
goog.dom.fullscreen.requestFullScreen = function(element) {
  if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else if (element.requestFullscreen) {
    element.requestFullscreen();
  }
};


/**
 * Requests putting the element in full screen with full keyboard access.
 * @param {!Element} element The element to put full screen.
 */
goog.dom.fullscreen.requestFullScreenWithKeys = function(
    element) {
  if (element.mozRequestFullScreenWithKeys) {
    element.mozRequestFullScreenWithKeys();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else {
    goog.dom.fullscreen.requestFullScreen(element);
  }
};


/**
 * Exits full screen.
 * @param {!goog.dom.DomHelper=} opt_domHelper The DomHelper for the DOM being
 *     queried. If not provided, use the current DOM.
 */
goog.dom.fullscreen.exitFullScreen = function(opt_domHelper) {
  var doc = goog.dom.fullscreen.getDocument_(opt_domHelper);
  if (doc.webkitCancelFullScreen) {
    doc.webkitCancelFullScreen();
  } else if (doc.mozCancelFullScreen) {
    doc.mozCancelFullScreen();
  } else if (doc.msExitFullscreen) {
    doc.msExitFullscreen();
  } else if (doc.exitFullscreen) {
    doc.exitFullscreen();
  }
};


/**
 * Determines if the document is full screen.
 * @param {!goog.dom.DomHelper=} opt_domHelper The DomHelper for the DOM being
 *     queried. If not provided, use the current DOM.
 * @return {boolean} Whether the document is full screen.
 */
goog.dom.fullscreen.isFullScreen = function(opt_domHelper) {
  var doc = goog.dom.fullscreen.getDocument_(opt_domHelper);
  // IE 11 doesn't have similar boolean property, so check whether
  // document.msFullscreenElement is null instead.
  return !!(doc.webkitIsFullScreen || doc.mozFullScreen ||
      doc.msFullscreenElement || doc.fullscreenElement);
};


/**
 * Get the root element in full screen mode.
 * @param {!goog.dom.DomHelper=} opt_domHelper The DomHelper for the DOM being
 *     queried. If not provided, use the current DOM.
 * @return {?Element} The root element in full screen mode.
 */
goog.dom.fullscreen.getFullScreenElement = function(opt_domHelper) {
  var doc = goog.dom.fullscreen.getDocument_(opt_domHelper);
  var element_list = [
    doc.webkitFullscreenElement,
    doc.mozFullScreenElement,
    doc.msFullscreenElement,
    doc.fullscreenElement
  ];
  for (var i = 0; i < element_list.length; i++) {
    if (element_list[i] != null) {
      return element_list[i];
    }
  }
  return null;
};


/**
 * Gets the document object of the dom.
 * @param {!goog.dom.DomHelper=} opt_domHelper The DomHelper for the DOM being
 *     queried. If not provided, use the current DOM.
 * @return {!Document} The dom document.
 * @private
 */
goog.dom.fullscreen.getDocument_ = function(opt_domHelper) {
  return opt_domHelper ?
      opt_domHelper.getDocument() :
      goog.dom.getDomHelper().getDocument();
};
