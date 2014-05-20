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
 * @fileoverview Helper class to load a list of URIs in bulk. All URIs
 * must be a successfully loaded in order for the entire load to be considered
 * a success.
 *
 */

goog.provide('goog.net.BulkLoaderHelper');

goog.require('goog.Disposable');
goog.require('goog.log');



/**
 * Helper class used to load multiple URIs.
 * @param {Array.<string|goog.Uri>} uris The URIs to load.
 * @constructor
 * @extends {goog.Disposable}
 * @final
 */
goog.net.BulkLoaderHelper = function(uris) {
  goog.Disposable.call(this);

  /**
   * The URIs to load.
   * @type {Array.<string|goog.Uri>}
   * @private
   */
  this.uris_ = uris;

  /**
   * The response from the XHR's.
   * @type {Array.<string>}
   * @private
   */
  this.responseTexts_ = [];
};
goog.inherits(goog.net.BulkLoaderHelper, goog.Disposable);


/**
 * A logger.
 * @type {goog.log.Logger}
 * @private
 */
goog.net.BulkLoaderHelper.prototype.logger_ =
    goog.log.getLogger('goog.net.BulkLoaderHelper');


/**
 * Gets the URI by id.
 * @param {number} id The id.
 * @return {string|goog.Uri} The URI specified by the id.
 */
goog.net.BulkLoaderHelper.prototype.getUri = function(id) {
  return this.uris_[id];
};


/**
 * Gets the URIs.
 * @return {Array.<string|goog.Uri>} The URIs.
 */
goog.net.BulkLoaderHelper.prototype.getUris = function() {
  return this.uris_;
};


/**
 * Gets the response texts.
 * @return {Array.<string>} The response texts.
 */
goog.net.BulkLoaderHelper.prototype.getResponseTexts = function() {
  return this.responseTexts_;
};


/**
 * Sets the response text by id.
 * @param {number} id The id.
 * @param {string} responseText The response texts.
 */
goog.net.BulkLoaderHelper.prototype.setResponseText = function(
    id, responseText) {
  this.responseTexts_[id] = responseText;
};


/**
 * Determines if the load of the URIs is complete.
 * @return {boolean} TRUE iff the load is complete.
 */
goog.net.BulkLoaderHelper.prototype.isLoadComplete = function() {
  var responseTexts = this.responseTexts_;
  if (responseTexts.length == this.uris_.length) {
    for (var i = 0; i < responseTexts.length; i++) {
      if (!goog.isDefAndNotNull(responseTexts[i])) {
        return false;
      }
    }
    return true;
  }
  return false;
};


/** @override */
goog.net.BulkLoaderHelper.prototype.disposeInternal = function() {
  goog.net.BulkLoaderHelper.superClass_.disposeInternal.call(this);

  this.uris_ = null;
  this.responseTexts_ = null;
};
