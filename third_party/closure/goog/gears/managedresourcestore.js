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
 * @fileoverview Simple wrapper around a Gears ManagedResourceStore.
 *
 */

goog.provide('goog.gears.ManagedResourceStore');
goog.provide('goog.gears.ManagedResourceStore.EventType');
goog.provide('goog.gears.ManagedResourceStore.UpdateStatus');
goog.provide('goog.gears.ManagedResourceStoreEvent');

goog.require('goog.debug.Logger');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.gears');
goog.require('goog.string');



/**
 * Creates a ManagedResourceStore with the specified name and update.  This
 * follows the Closure event model so the COMPLETE event will fire both for
 * SUCCESS and for ERROR.  You can use {@code isSuccess} in UPDATE to see if the
 * capture was successful or you can just listen to the different events.
 *
 * This supports PROGRESS events, which are fired any time {@code filesComplete}
 * or {@code filesTotal} changes.  If the Gears version is 0.3.6 or newer this
 * will reflect the numbers returned by the underlying Gears MRS but for older
 * Gears versions this will just be {@code 0} or {@code 1}.
 *
 * NOTE: This relies on at least the 0.2 version of gears (for timer).
 *
 * @param {string} name  The name of the managed store.
 * @param {?string} requiredCookie  A cookie that must be present for the
 *     managed store to be active. Should have the form "foo=bar". Can be null
 *     if not required.
 * @param {GearsLocalServer=} opt_localServer  Gears local server -- if not set,
 *     create a new one internally.
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.gears.ManagedResourceStore = function(name, requiredCookie,
    opt_localServer) {
  this.localServer_ = opt_localServer ||
                      goog.gears.getFactory().create('beta.localserver', '1.0');

  this.name_ = goog.gears.makeSafeFileName(name);
  if (name != this.name_) {
    this.logger_.info(
        'managed resource store name ' + name + '->' + this.name_);
  }

  this.requiredCookie_ = requiredCookie ? String(requiredCookie) : null;

  // Whether Gears natively has "events" on the MRS.  If it does not we treat
  // the progress as 0 to 1
  this.supportsEvents_ = goog.string.compareVersions(
      goog.gears.getFactory().version, '0.3.6') >= 0;
};
goog.inherits(goog.gears.ManagedResourceStore, goog.events.EventTarget);


/**
 * The amount of time between status checks during an update
 * @type {number}
 */
goog.gears.ManagedResourceStore.UPDATE_INTERVAL_MS = 500;


/**
 * Enum for possible values of Gears ManagedResourceStore.updatedStatus
 * @enum
 */
goog.gears.ManagedResourceStore.UpdateStatus = {
  OK: 0,
  CHECKING: 1,
  DOWNLOADING: 2,
  FAILURE: 3
};


/**
 * Logger.
 * @type {goog.debug.Logger}
 * @private
 */
goog.gears.ManagedResourceStore.prototype.logger_ =
    goog.debug.Logger.getLogger('goog.gears.ManagedResourceStore');


/**
 * The Gears local server object.
 * @type {GearsLocalServer}
 * @private
 */
goog.gears.ManagedResourceStore.prototype.localServer_;


/**
 * The name of the managed store.
 * @type {?string}
 * @private
 */
goog.gears.ManagedResourceStore.prototype.name_;


/**
 * A cookie that must be present for the managed store to be active.
 * Should have the form "foo=bar". String cast is a safety measure since
 * Gears behaves very badly when it gets an unexpected data type.
 * @type {?string}
 * @private
 */
goog.gears.ManagedResourceStore.prototype.requiredCookie_;


/**
 * The required cookie, if any, for the managed store.
 * @type {boolean}
 * @private
 */
goog.gears.ManagedResourceStore.prototype.supportsEvents_;


/**
 * The Gears ManagedResourceStore instance we are wrapping.
 * @type {GearsManagedResourceStore}
 * @private
 */
goog.gears.ManagedResourceStore.prototype.gearsStore_;


/**
 * The id of the check status timer.
 * @type {?number}
 * @private
 */
goog.gears.ManagedResourceStore.prototype.timerId_ = null;


/**
 * The check status timer.
 * @type {Object}
 * @private
 */
goog.gears.ManagedResourceStore.prototype.timer_ = null;


/**
 * Whether we already have an active update check.
 * @type {boolean}
 * @private
 */
goog.gears.ManagedResourceStore.prototype.active_ = false;


/**
 * Number of files completed.  This is 0 or 1 if the Gears version does not
 * support progress events.  If the Gears version supports progress events
 * this will reflect the number of files that have been completed.
 * @type {number}
 * @private
 */
goog.gears.ManagedResourceStore.prototype.filesComplete_ = 0;


/**
 * Number of total files to load.  This is 1 if the Gears version does not
 * support progress events.  If the Gears version supports progress events
 * this will reflect the number of files that needs to be loaded.
 * @type {number}
 * @private
 */
goog.gears.ManagedResourceStore.prototype.filesTotal_ = 0;


/**
 * @return {boolean} Whether there is an active request.
 */
goog.gears.ManagedResourceStore.prototype.isActive = function() {
  return this.active_;
};


/**
 * @return {boolean} Whether the update has completed.
 */
goog.gears.ManagedResourceStore.prototype.isComplete = function() {
  return this.filesComplete_ == this.filesTotal_;
};


/**
 * @return {boolean} Whether the update completed with a success.
 */
goog.gears.ManagedResourceStore.prototype.isSuccess = function() {
  return this.getStatus() == goog.gears.ManagedResourceStore.UpdateStatus.OK;
};


/**
 * Number of total files to load.  This is always 1 if the Gears version does
 * not support progress events.  If the Gears version supports progress events
 * this will reflect the number of files that needs to be loaded.
 * @return {number} The number of files to load.
 */
goog.gears.ManagedResourceStore.prototype.getFilesTotal = function() {
  return this.filesTotal_;
};


/**
 * Get the last error message.
 * @return {string} Last error message.
 */
goog.gears.ManagedResourceStore.prototype.getLastError = function() {
  return this.gearsStore_ ? this.gearsStore_.lastErrorMessage : '';
};


/**
 * Number of files completed.  This is 0 or 1 if the Gears version does not
 * support progress events.  If the Gears version supports progress events
 * this will reflect the number of files that have been completed.
 * @return {number} The number of completed files.
 */
goog.gears.ManagedResourceStore.prototype.getFilesComplete = function() {
  return this.filesComplete_;
};


/**
 * Sets the filesComplete and the filesTotal and dispathces an event when
 * either changes.
 * @param {number} complete The count of the downloaded files.
 * @param {number} total The total number of files.
 * @private
 */
goog.gears.ManagedResourceStore.prototype.setFilesCounts_ = function(complete,
                                                                     total) {
  if (this.filesComplete_ != complete || this.filesTotal_ != total) {
    this.filesComplete_ = complete;
    this.filesTotal_ = total;
    this.dispatchEvent(goog.gears.ManagedResourceStore.EventType.PROGRESS);
  }
};


/**
 * Determine if the ManagedResourceStore has been created in Gears yet
 * @return {boolean}  true if it has been created.
 */
goog.gears.ManagedResourceStore.prototype.exists = function() {
  if (!this.gearsStore_) {
    this.gearsStore_ = this.localServer_.openManagedStore(
        this.name_, this.requiredCookie_);
  }

  return !!this.gearsStore_;
};


/**
 * Throws an error if the store has not yet been created via create().
 * @private
 */
goog.gears.ManagedResourceStore.prototype.assertExists_ = function() {
  if (!this.exists()) {
    throw Error('Store not yet created');
  }
};


/**
 * Throws an error if the store has already been created via create().
 * @private
 */
goog.gears.ManagedResourceStore.prototype.assertNotExists_ = function() {
  if (this.exists()) {
    throw Error('Store already created');
  }
};


/**
 * Create the ManagedResourceStore in gears
 * @param {string=} opt_manifestUrl  The url of the manifest to associate.
 */
goog.gears.ManagedResourceStore.prototype.create = function(opt_manifestUrl) {
  if (!this.exists()) {
    this.gearsStore_ = this.localServer_.createManagedStore(
        this.name_, this.requiredCookie_);
    this.assertExists_();
  }

  if (opt_manifestUrl) {
    // String cast is a safety measure since Gears behaves very badly if it
    // gets an unexpected data type (e.g., goog.Uri).
    this.gearsStore_.manifestUrl = String(opt_manifestUrl);
  }
};


/**
 * Starts an asynchronous process to update the ManagedResourcStore
 */
goog.gears.ManagedResourceStore.prototype.update = function() {
  if (this.active_) {
    // Update already in progress.
    return;
  }

  this.assertExists_();


  if (this.supportsEvents_) {
    this.gearsStore_.onprogress = goog.bind(this.handleProgress_, this);
    this.gearsStore_.oncomplete = goog.bind(this.handleComplete_, this);
    this.gearsStore_.onerror = goog.bind(this.handleError_, this);
  } else {
    this.timer_ = goog.gears.getFactory().create('beta.timer', '1.0');
    this.timerId_ = this.timer_.setInterval(
        goog.bind(this.checkUpdateStatus_, this),
        goog.gears.ManagedResourceStore.UPDATE_INTERVAL_MS);
    this.setFilesCounts_(0, 1);
  }

  this.gearsStore_.checkForUpdate();

  this.active_ = true;
};


/**
 * @return {string} Store's current manifest URL.
 */
goog.gears.ManagedResourceStore.prototype.getManifestUrl = function() {
  this.assertExists_();
  return this.gearsStore_.manifestUrl;
};


/**
 * @param {string} url  Store's new manifest URL.
 */
goog.gears.ManagedResourceStore.prototype.setManifestUrl = function(url) {
  this.assertExists_();

  // Safety measure since Gears behaves very badly if it gets an unexpected
  // data type (e.g., goog.Uri).
  this.gearsStore_.manifestUrl = String(url);
};


/**
 * @return {?string} The version of the managed store that is currently being
 *     served.
 */
goog.gears.ManagedResourceStore.prototype.getVersion = function() {
  return this.exists() ? this.gearsStore_.currentVersion : null;
};


/**
 * @return {goog.gears.ManagedResourceStore.UpdateStatus} The current update
 *     status.
 */
goog.gears.ManagedResourceStore.prototype.getStatus = function() {
  this.assertExists_();
  return /** @type {goog.gears.ManagedResourceStore.UpdateStatus} */ (
      this.gearsStore_.updateStatus);
};


/**
 * @return {boolean} Whether the store is currently enabled to serve local
 *     content.
 */
goog.gears.ManagedResourceStore.prototype.isEnabled = function() {
  this.assertExists_();
  return this.gearsStore_.enabled;
};


/**
 * Sets whether the store is currently enabled to serve local content.
 * @param {boolean} isEnabled True if the store is enabled and false otherwise.
 */
goog.gears.ManagedResourceStore.prototype.setEnabled = function(isEnabled) {
  this.assertExists_();
  // !! is a safety measure since Gears behaves very badly if it gets an
  //  unexpected data type.
  this.gearsStore_.enabled = !!isEnabled;
};


/**
 * Remove managed store.
 */
goog.gears.ManagedResourceStore.prototype.remove = function() {
  this.assertExists_();
  this.localServer_.removeManagedStore(this.name_, this.requiredCookie_);
  this.gearsStore_ = null;
  this.assertNotExists_();
};


/**
 * Called periodically as the update proceeds. If it has completed, fire an
 * approproiate event and cancel further checks.
 * @private
 */
goog.gears.ManagedResourceStore.prototype.checkUpdateStatus_ = function() {
  var e;

  if (this.gearsStore_.updateStatus ==
      goog.gears.ManagedResourceStore.UpdateStatus.FAILURE) {
    e = new goog.gears.ManagedResourceStoreEvent(
        goog.gears.ManagedResourceStore.EventType.ERROR,
        this.gearsStore_.lastErrorMessage);
    this.setFilesCounts_(0, 1);
  } else if (this.gearsStore_.updateStatus ==
             goog.gears.ManagedResourceStore.UpdateStatus.OK) {
    e = new goog.gears.ManagedResourceStoreEvent(
        goog.gears.ManagedResourceStore.EventType.SUCCESS);
    this.setFilesCounts_(1, 1);
  }

  if (e) {
    this.cancelStatusCheck_();
    this.dispatchEvent(e);
    // Fire complete after both error and success
    this.dispatchEvent(goog.gears.ManagedResourceStore.EventType.COMPLETE);
    this.active_ = false;
  }
};


/**
 * Cancel periodic status checks.
 * @private
 */
goog.gears.ManagedResourceStore.prototype.cancelStatusCheck_ = function() {
  if (!this.supportsEvents_ && this.timerId_ != null) {
    this.timer_.clearInterval(this.timerId_);
    this.timerId_ = null;
    this.timer_ = null;
  }
};


/**
 * Callback for when the Gears managed resource store fires a progress event.
 * @param {Object} details An object containg two fields, {@code filesComplete}
 *     and {@code filesTotal}.
 * @private
 */
goog.gears.ManagedResourceStore.prototype.handleProgress_ = function(details) {
  // setFilesCounts_ will dispatch the progress event as needed
  this.setFilesCounts_(details['filesComplete'], details['filesTotal']);
};


/**
 * Callback for when the Gears managed resource store fires a complete event.
 * @param {Object} details An object containg one field called
 *     {@code newVersion}.
 * @private
 */
goog.gears.ManagedResourceStore.prototype.handleComplete_ = function(details) {
  this.dispatchEvent(goog.gears.ManagedResourceStore.EventType.SUCCESS);
  this.dispatchEvent(goog.gears.ManagedResourceStore.EventType.COMPLETE);
  this.active_ = false;
};


/**
 * Callback for when the Gears managed resource store fires an error event.
 * @param {Object} error An object containg one field called
 *     {@code message}.
 * @private
 */
goog.gears.ManagedResourceStore.prototype.handleError_ = function(error) {
  this.dispatchEvent(new goog.gears.ManagedResourceStoreEvent(
      goog.gears.ManagedResourceStore.EventType.ERROR, error.message));
  this.dispatchEvent(goog.gears.ManagedResourceStore.EventType.COMPLETE);
  this.active_ = false;
};


/** @inheritDoc */
goog.gears.ManagedResourceStore.prototype.disposeInternal = function() {
  goog.gears.ManagedResourceStore.superClass_.disposeInternal.call(this);
  if (this.supportsEvents_ && this.gearsStore_) {
    this.gearsStore_.onprogress = null;
    this.gearsStore_.oncomplete = null;
    this.gearsStore_.onerror = null;
  }
  this.cancelStatusCheck_();
  this.localServer_ = null;
  this.gearsStore_ = null;
};


/**
 * Enum for event types fired by ManagedResourceStore.
 * @enum {string}
 */
goog.gears.ManagedResourceStore.EventType = {
  COMPLETE: 'complete',
  ERROR: 'error',
  PROGRESS: 'progress',
  SUCCESS: 'success'
};



/**
 * Event used when a ManagedResourceStore update is complete
 * @param {string} type  The type of the event.
 * @param {string=} opt_errorMessage  The error message if failure.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.gears.ManagedResourceStoreEvent = function(type, opt_errorMessage) {
  goog.events.Event.call(this, type);

  if (opt_errorMessage) {
    this.errorMessage = opt_errorMessage;
  }
};
goog.inherits(goog.gears.ManagedResourceStoreEvent, goog.events.Event);


/**
 * Error message in the case of a failure event.
 * @type {?string}
 */
goog.gears.ManagedResourceStoreEvent.prototype.errorMessage = null;
