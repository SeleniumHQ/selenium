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
 * @fileoverview Loads a list of URIs in bulk. All requests must be a success
 * in order for the load to be considered a success.
 *
*
 */

goog.provide('goog.net.BulkLoader');

goog.require('goog.debug.Logger');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.net.BulkLoaderHelper');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrIo');


/**
 * Class used to load multiple URIs.
 * @param {Array.<string|goog.Uri>} uris The URIs to load.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.net.BulkLoader = function(uris) {
  goog.events.EventTarget.call(this);

  /**
   * The bulk loader helper.
   * @type {goog.net.BulkLoaderHelper}
   * @private
   */
  this.helper_ = new goog.net.BulkLoaderHelper(uris);

  /**
   * The handler for managing events.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);
};
goog.inherits(goog.net.BulkLoader, goog.events.EventTarget);


/**
 * A logger.
 * @type {goog.debug.Logger}
 * @private
 */
goog.net.BulkLoader.prototype.logger_ =
    goog.debug.Logger.getLogger('goog.net.BulkLoader');


/**
 * Gets the response texts.
 * @return {Array.<string>} The response texts.
 */
goog.net.BulkLoader.prototype.getResponseTexts = function() {
  return this.helper_.getResponseTexts();
};


/**
 * Starts the process of loading the URIs.
 */
goog.net.BulkLoader.prototype.load = function() {
  var eventHandler = this.eventHandler_;
  var uris = this.helper_.getUris();
  this.logger_.info('Starting load of code with ' + uris.length + ' uris.');

  for (var i = 0; i < uris.length; i++) {
    var xhrIo = new goog.net.XhrIo();
    eventHandler.listen(xhrIo,
        goog.net.EventType.COMPLETE,
        goog.bind(this.handleEvent_, this, i));

    xhrIo.send(uris[i]);
  }
};


/**
 * Handles all events fired by the XhrManager.
 * @param {number} id The id of the request.
 * @param {goog.events.Event} e The event.
 * @private
 */
goog.net.BulkLoader.prototype.handleEvent_ = function(id, e) {
  this.logger_.info('Received event "' + e.type + '" for id ' + id +
      ' with uri ' + this.helper_.getUri(id));
  var xhrIo = /** @type {goog.net.XhrIo} */ (e.target);
  if (xhrIo.isSuccess()) {
    this.handleSuccess_(id, xhrIo);
  } else {
    this.handleError_(id, xhrIo);
  }
};


/**
 * Handles when a request is successful (i.e., completed and response received).
 * Stores thhe responseText and checks if loading is complete.
 * @param {number} id The id of the request.
 * @param {goog.net.XhrIo} xhrIo The XhrIo objects that was used.
 * @private
 */
goog.net.BulkLoader.prototype.handleSuccess_ = function(
    id, xhrIo) {
  // Save the response text.
  this.helper_.setResponseText(id, xhrIo.getResponseText());

  // Check if all response texts have been received.
  if (this.helper_.isLoadComplete()) {
    this.finishLoad_();
  }
  xhrIo.dispose();
};


/**
 * Handles when a request has ended in error (i.e., all retries completed and
 * none were successful). Cancels loading of the URI's.
 * @param {number|string} id The id of the request.
 * @param {goog.net.XhrIo} xhrIo The XhrIo objects that was used.
 * @private
 */
goog.net.BulkLoader.prototype.handleError_ = function(
    id, xhrIo) {
  // TODO(user): Abort all pending requests.

  // Dispatch the ERROR event.
  this.dispatchEvent(goog.net.EventType.ERROR);
  xhrIo.dispose();
};


/**
 * Finishes the load of the URI's. Dispatches the SUCCESS event.
 * @private
 */
goog.net.BulkLoader.prototype.finishLoad_ = function() {
  this.logger_.info('All uris loaded.');

  // Dispatch the SUCCESS event.
  this.dispatchEvent(goog.net.EventType.SUCCESS);
};


/**
 * Disposes of the BulkLoader.
 */
goog.net.BulkLoader.prototype.disposeInternal = function() {
  goog.net.BulkLoader.superClass_.disposeInternal.call(this);

  this.eventHandler_.dispose();
  this.eventHandler_ = null;

  this.helper_.dispose();
  this.helper_ = null;
};
