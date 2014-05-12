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
 * @fileoverview Interface for capturing URLs to a ResourceStore on the
 * LocalServer.
 *
 */


goog.provide('goog.gears.UrlCapture');
goog.provide('goog.gears.UrlCapture.Event');
goog.provide('goog.gears.UrlCapture.EventType');

goog.require('goog.Uri');
goog.require('goog.debug.Logger');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.gears');



/**
 * Class capture URLs to a ResourceStore on the LocalServer.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {string} name The name of the ResourceStore to capture the URLs to.
 * @param {?string} requiredCookie  A cookie that must be present for the
 *     managed store to be active. Should have the form "foo=bar".
 * @param {GearsResourceStore=} opt_localServer The LocalServer for gears.
 */
goog.gears.UrlCapture = function(name, requiredCookie, opt_localServer) {
  goog.events.EventTarget.call(this);

  /**
   * Name of resource store.
   * @type {string}
   * @private
   */
  this.storeName_ = goog.gears.makeSafeFileName(name);
  if (name != this.storeName_) {
    this.logger_.info(
        'local store name ' + name + '->' + this.storeName_);
  }

  /**
   * A cookie that must be present for the store to be active.
   * Should have the form "foo=bar". String cast is a safety measure since
   * Gears behaves very badly when it gets an unexpected data type.
   * @type {?string}
   * @private
   */
  this.requiredCookie_ = requiredCookie ? String(requiredCookie) : null;

  /**
   * The LocalServer for Gears.
   * @type {GearsLocalServer}
   * @private
   */
  this.localServer_ = opt_localServer ||
      goog.gears.getFactory().create('beta.localserver', '1.0');

  /**
   * Object mapping list of URIs to capture to capture id.
   * @type {Object}
   * @private
   */
  this.uris_ = {};

  /**
   * Object mapping list of URIs that had errors in the capture to capture id.
   * @type {Object}
   * @private
   */
  this.errorUris_ = {};

  /**
   * Object mapping number of URLs completed to capture id.
   * @type {Object}
   * @private
   */
  this.numCompleted_ = {};
};
goog.inherits(goog.gears.UrlCapture, goog.events.EventTarget);


/**
 * Logger.
 * @type {goog.debug.Logger}
 * @private
 */
goog.gears.UrlCapture.prototype.logger_ =
    goog.debug.Logger.getLogger('goog.gears.UrlCapture');


/**
 * The ResourceStore for gears, used to capture URLs.
 * @type {GearsResourceStore}
 * @private
 */
goog.gears.UrlCapture.prototype.resourceStore_ = null;


/**
 * Events fired during URL capture
 * @enum {string}
 */
goog.gears.UrlCapture.EventType = {
  URL_SUCCESS: 'url_success',
  URL_ERROR: 'url_error',
  COMPLETE: 'complete',
  ABORT: 'abort'
};


/**
 * Lazy initializer for resource store.
 * @return {GearsResourceStore} Gears resource store.
 * @private
 */
goog.gears.UrlCapture.prototype.getResourceStore_ = function() {
  if (!this.resourceStore_) {
    this.logger_.info('creating resource store: ' + this.storeName_);
    this.resourceStore_ = this.localServer_['createStore'](
        this.storeName_, this.requiredCookie_);
  }
  return this.resourceStore_;
};


/**
 * Determine if the UrlCapture has been created.
 * @return {boolean} True if it has been created.
 */
goog.gears.UrlCapture.prototype.exists = function() {
  if (!this.resourceStore_) {
    this.logger_.info('opening resource store: ' + this.storeName_);
    this.resourceStore_ = this.localServer_['openStore'](
        this.storeName_, this.requiredCookie_);
  }
  return !!this.resourceStore_;
};


/**
 * Remove this resource store.
 */
goog.gears.UrlCapture.prototype.removeStore = function() {
  this.logger_.info('removing resource store: ' + this.storeName_);
  this.localServer_['removeStore'](this.storeName_, this.requiredCookie_);
  this.resourceStore_ = null;
};


/**
 * Renames a Url that's been captured.
 * @param {string|goog.Uri} srcUri The source Uri.
 * @param {string|goog.Uri} dstUri The destination Uri.
 */
goog.gears.UrlCapture.prototype.rename = function(srcUri, dstUri) {
  this.getResourceStore_()['rename'](srcUri.toString(), dstUri.toString());
};


/**
 * Copies a Url that's been captured.
 * @param {string|goog.Uri} srcUri The source Uri.
 * @param {string|goog.Uri} dstUri The destination Uri.
 */
goog.gears.UrlCapture.prototype.copy = function(srcUri, dstUri) {
  this.getResourceStore_()['copy'](srcUri.toString(), dstUri.toString());
};


/**
 * Starts the capture of the given URLs. Returns immediately, and fires events
 * on success and error.
 * @param {Array.<string|goog.Uri>} uris URIs to capture.
 * @return {number} The id of the ResourceStore capture. Can be used to
 * abort, or identify events.
 */
goog.gears.UrlCapture.prototype.capture = function(uris) {
  var count = uris.length;
  this.logger_.fine('capture: count==' + count);
  if (!count) {
    throw Error('No URIs to capture');
  }

  // Convert goog.Uri objects to strings since Gears will throw an exception
  // for non-strings.
  var captureStrings = [];
  for (var i = 0; i < count; i++) {
    captureStrings.push(uris[i].toString());
  }

  var id = this.getResourceStore_()['capture'](
      captureStrings, goog.bind(this.captureCallback_, this));
  this.logger_.fine('capture started: ' + id);
  this.uris_[id] = uris;
  this.errorUris_[id] = [];
  this.numCompleted_[id] = 0;
  return id;
};


/**
 * Aborts the capture with the given id. Dispatches abort event.
 * @param {number} captureId The id of the capture to abort, from #capture.
 */
goog.gears.UrlCapture.prototype.abort = function(captureId) {
  this.logger_.fine('abort: ' + captureId);

  // TODO(user) Remove when Gears adds more rubust type handling.
  // Safety measure since Gears behaves very badly if it gets an unexpected
  // data type.
  if (typeof captureId != 'number') {
    throw Error('bad capture ID: ' + captureId);
  }

  // Only need to abort if the capture is still in progress.
  if (this.uris_[captureId] || this.numCompleted_[captureId]) {
    this.logger_.info('aborting capture: ' + captureId);
    this.getResourceStore_()['abortCapture'](captureId);
    this.cleanupCapture_(captureId);
    this.dispatchEvent(new goog.gears.UrlCapture.Event(
        goog.gears.UrlCapture.EventType.ABORT, captureId));
  }
};


/**
 * Checks if a URL is captured.
 * @param {string|goog.Uri} uri The URL to check.
 * @return {boolean} true if captured, false otherwise.
 */
goog.gears.UrlCapture.prototype.isCaptured = function(uri) {
  this.logger_.fine('isCaptured: ' + uri);
  return this.getResourceStore_()['isCaptured'](uri.toString());
};


/**
 * Removes the given URI from the store.
 * @param {string|goog.Uri} uri The URI to remove from the store.
 */
goog.gears.UrlCapture.prototype.remove = function(uri) {
  this.logger_.fine('remove: ' + uri);
  this.getResourceStore_()['remove'](uri.toString());
};


/**
 * This is the callback passed into ResourceStore.capture. It gets called
 * each time a URL is captured.
 * @param {string} url The url from gears, always a string.
 * @param {boolean} success True if capture succeeded, false otherwise.
 * @param {number} captureId The id of the capture.
 * @private
 */
goog.gears.UrlCapture.prototype.captureCallback_ = function(
    url, success, captureId) {
  this.logger_.fine('captureCallback_: ' + captureId);

  if (!this.uris_[captureId] && !this.numCompleted_[captureId]) {
    // This probably means we were aborted and then a capture event came in.
    this.cleanupCapture_(captureId);
    return;
  }

  // Dispatch success/error event for the URL
  var eventUri = this.usesGoogUri_(captureId) ? new goog.Uri(url) : url;
  var eventType = null;
  if (success) {
    eventType = goog.gears.UrlCapture.EventType.URL_SUCCESS;
  } else {
    eventType = goog.gears.UrlCapture.EventType.URL_ERROR;
    this.errorUris_[captureId].push(eventUri);
  }
  this.dispatchEvent(new goog.gears.UrlCapture.Event(
      eventType, captureId, eventUri));

  // Dispatch complete event for the entire capture, if necessary
  this.numCompleted_[captureId]++;
  if (this.numCompleted_[captureId] == this.uris_[captureId].length) {
    this.dispatchEvent(new goog.gears.UrlCapture.Event(
        goog.gears.UrlCapture.EventType.COMPLETE, captureId, null,
        this.errorUris_[captureId]));
    this.cleanupCapture_(captureId);
  }
};


/**
 * Helper function to cleanup after a capture completes or is aborted.
 * @private
 * @param {number} captureId The id of the capture to clean up.
 */
goog.gears.UrlCapture.prototype.cleanupCapture_ = function(captureId) {
  this.logger_.fine('cleanupCapture_: ' + captureId);
  delete this.uris_[captureId];
  delete this.numCompleted_[captureId];
  delete this.errorUris_[captureId];
};


/**
 * Helper function to check whether a certain capture is using URIs of type
 * String or type goog.Uri
 * @private
 * @param {number} captureId The id of the capture to check.
 * @return {boolean} True if the capture uses goog.Uri, false if it uses string
 * or there are no URIs associated with the capture.
 */
goog.gears.UrlCapture.prototype.usesGoogUri_ = function(captureId) {
  if (this.uris_[captureId] &&
      this.uris_[captureId].length > 0 &&
      this.uris_[captureId][0] instanceof goog.Uri) {
    return true;
  }
  return false;
};



/**
 * An event dispatched by UrlCapture
 * @constructor
 * @extends {goog.events.Event}
 * @param {goog.gears.UrlCapture.EventType} type Type of event to dispatch.
 * @param {number} captureId The id of the capture that fired this event.
 * @param {string|goog.Uri=} opt_uri The URI for the event.
 * @param {Array.<string|goog.Uri>=} opt_errorUris The URIs that failed to load
 * correctly.
 */
goog.gears.UrlCapture.Event = function(type, captureId, opt_uri,
    opt_errorUris) {
  goog.events.Event.call(this, type);

  /**
   * The id of the capture to dispatch the event for. This id is returned from
   * goog.gears.UrlCapture#capture
   * @type {number}
   */
  this.captureId = captureId;

  /**
   * The URI the event concerns. Valid for URL_SUCCESS and URL_ERROR events.
   * @type {string|goog.Uri|null}
   */
  this.uri = opt_uri || null;

  /**
   * A list of all the URIs that failed to load correctly. Valid for
   * COMPLETE event.
   * @type {Array.<string|goog.Uri>}
   */
  this.errorUris = opt_errorUris || [];
};
goog.inherits(goog.gears.UrlCapture.Event, goog.events.Event);
