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
 * @fileoverview Factory class to create a simple autocomplete that will match
 * from an array of data provided via ajax.
 *
*
 * @see ../../demos/autocompleteremote.html
 */

goog.provide('goog.ui.AutoComplete.Remote');

goog.require('goog.ui.AutoComplete');
goog.require('goog.ui.AutoComplete.InputHandler');
goog.require('goog.ui.AutoComplete.RemoteArrayMatcher');
goog.require('goog.ui.AutoComplete.Renderer');



/**
 * Factory class for building a remote autocomplete widget that autocompletes
 * an inputbox or text area from a data array provided via ajax.
 * @param {string} url The Uri which generates the auto complete matches.
 * @param {Element} input Input element or text area.
 * @param {boolean=} opt_multi Whether to allow multiple entries; defaults
 *     to false.
 * @param {boolean=} opt_useSimilar Whether to use similar matches; e.g.
 *     "gost" => "ghost".
 * @constructor
 * @extends {goog.ui.AutoComplete}
 */
goog.ui.AutoComplete.Remote = function(url, input, opt_multi, opt_useSimilar) {
  var matcher = new goog.ui.AutoComplete.RemoteArrayMatcher(url,
      !opt_useSimilar);
  this.matcher_ = matcher;

  var renderer = new goog.ui.AutoComplete.Renderer();

  var inputhandler = new goog.ui.AutoComplete.InputHandler(null, null,
      !!opt_multi, 300);

  goog.ui.AutoComplete.call(this, matcher, renderer, inputhandler);

  inputhandler.attachAutoComplete(this);
  inputhandler.attachInputs(input);
};
goog.inherits(goog.ui.AutoComplete.Remote, goog.ui.AutoComplete);


/**
 * Set whether or not standard highlighting should be used when rendering rows.
 * @param {boolean} useStandardHighlighting true if standard highlighting used.
 */
goog.ui.AutoComplete.Remote.prototype.setUseStandardHighlighting =
    function(useStandardHighlighting) {
  this.renderer_.setUseStandardHighlighting(useStandardHighlighting);
};


/**
 * Gets the attached InputHandler object.
 * @return {goog.ui.AutoComplete.InputHandler} The input handler.
 */
goog.ui.AutoComplete.Remote.prototype.getInputHandler = function() {
  return /** @type {goog.ui.AutoComplete.InputHandler} */ (
         this.selectionHandler_);
};


/**
 * Set the send method ("GET", "POST") for the matcher.
 * @param {string} method The send method; default: GET.
 */
goog.ui.AutoComplete.Remote.prototype.setMethod = function(method) {
  this.matcher_.setMethod(method);
};


/**
 * Set the post data for the matcher.
 * @param {string} content Post data.
 */
goog.ui.AutoComplete.Remote.prototype.setContent = function(content) {
  this.matcher_.setContent(content);
};


/**
 * Set the HTTP headers for the matcher.
 * @param {Object|goog.structs.Map} headers Map of headers to add to the
 *     request.
 */
goog.ui.AutoComplete.Remote.prototype.setHeaders = function(headers) {
  this.matcher_.setHeaders(headers);
};


/**
 * Set the timeout interval for the matcher.
 * @param {number} interval Number of milliseconds after which an
 *     incomplete request will be aborted; 0 means no timeout is set.
 */
goog.ui.AutoComplete.Remote.prototype.setTimeoutInterval =
    function(interval) {
  this.matcher_.setTimeoutInterval(interval);
};
