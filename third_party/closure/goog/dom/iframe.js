// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2008 Google Inc. All Rights Reserved.

/**
 * @fileoverview Utilities for creating and working with iframes
 * cross-browser.
 */


goog.provide('goog.dom.iframe');


/**
 * Safe source for a blank iframe.
 *
 * Intentionally not about:blank, which gives mixed content warnings in IE6
 * over HTTPS.
 *
 * @type {string}
 */
goog.dom.iframe.BLANK_SOURCE = 'javascript:""';


/**
 * Creates a completely blank iframe element.
 *
 * The iframe will not caused mixed-content warnings for IE6 under HTTPS.
 * The iframe will also have no borders or padding, so that the styled width
 * and height will be the actual width and height of the iframe.
 *
 * This function currently only attempts to create a blank iframe.  There
 * are no guarantees to the contents of the iframe or whether it is rendered
 * in quirks mode.
 *
 * @param {goog.dom.DomHelper} domHelper The dom helper to use.
 * @return {HTMLIFrameElement} A completely blank iframe.
 */
goog.dom.iframe.createBlank = function(domHelper) {
  return /** @type {HTMLIFrameElement} */ (domHelper.createDom('iframe', {
    'frameborder': 0,
    // Since iframes are inline elements, we must align to bottom to
    // compensate for the line descent.
    'style': 'border: 0; vertical-align: bottom',
    'src': goog.dom.iframe.BLANK_SOURCE
  }));
};
