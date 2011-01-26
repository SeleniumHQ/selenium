// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A wrapper for the HTML5 FileSaver object.
 *
 */

goog.provide('goog.fs.FileSaver');
goog.provide('goog.fs.FileSaver.EventType');
goog.provide('goog.fs.FileSaver.ProgressEvent');
goog.provide('goog.fs.FileSaver.ReadyState');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.fs.Error');



/**
 * An object for monitoring the saving of files. This emits ProgressEvents of
 * the types listed in {@link goog.fs.FileSaver.EventType}.
 *
 * This should not be instantiated directly. Instead, its subclass
 * {@link goog.fs.FileWriter} should be accessed via
 * {@link goog.fs.FileEntry#createWriter}.
 *
 * @param {!FileSaver} fileSaver The underlying FileSaver object.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.fs.FileSaver = function(fileSaver) {
  goog.base(this);

  /**
   * The underlying FileSaver object.
   *
   * @type {!FileSaver}
   * @private
   */
  this.saver_ = fileSaver;

  this.saver_.onwritestart = goog.bind(this.dispatchProgressEvent_, this);
  this.saver_.onprogress = goog.bind(this.dispatchProgressEvent_, this);
  this.saver_.onwrite = goog.bind(this.dispatchProgressEvent_, this);
  this.saver_.onabort = goog.bind(this.dispatchProgressEvent_, this);
  this.saver_.onerror = goog.bind(this.dispatchProgressEvent_, this);
  this.saver_.onwriteend = goog.bind(this.dispatchProgressEvent_, this);
};
goog.inherits(goog.fs.FileSaver, goog.events.EventTarget);


/**
 * Possible states for a FileSaver.
 *
 * @enum {number}
 */
goog.fs.FileSaver.ReadyState = {
  /**
   * The object has been constructed, but there is no pending write.
   */
  INIT: 0,
  /**
   * Data is being written.
   */
  WRITING: 1,
  /**
   * The data has been written to the file, the write was aborted, or an error
   * occurred.
   */
  DONE: 2
};


/**
 * Events emitted by a FileSaver.
 *
 * @enum {string}
 */
goog.fs.FileSaver.EventType = {
  /**
   * Emitted when the writing begins. readyState will be WRITING.
   */
  WRITE_START: 'writestart',
  /**
   * Emitted when progress has been made in saving the file. readyState will be
   * WRITING.
   */
  PROGRESS: 'progress',
  /**
   * Emitted when the data has been successfully written. readyState will be
   * WRITING.
   */
  WRITE: 'write',
  /**
   * Emitted when the writing has been aborted. readyState will be WRITING.
   */
  ABORT: 'abort',
  /**
   * Emitted when an error is encountered or the writing has been aborted.
   * readyState will be WRITING.
   */
  ERROR: 'error',
  /**
   * Emitted when the writing is finished, whether successfully or not.
   * readyState will be DONE.
   */
  WRITE_END: 'writeend'
};


/**
 * Abort the writing of the file.
 */
goog.fs.FileSaver.prototype.abort = function() {
  try {
    this.saver_.abort();
  } catch (e) {
    throw new goog.fs.Error(e.code, 'aborting save');
  }
};


/**
 * @return {goog.fs.FileSaver.ReadyState} The current state of the FileSaver.
 */
goog.fs.FileSaver.prototype.getReadyState = function() {
  return /** @type {goog.fs.FileSaver.ReadyState} */ (this.saver_.readyState);
};


/**
 * @return {goog.fs.Error} The error encountered while writing, if any.
 */
goog.fs.FileSaver.prototype.getError = function() {
  return this.saver_.error &&
      new goog.fs.Error(this.saver_.error.code, 'saving file');
};


/**
 * Wrap a progress event emitted by the underlying file saver and re-emit it.
 *
 * @param {!ProgressEvent} event The underlying event.
 * @private
 */
goog.fs.FileSaver.prototype.dispatchProgressEvent_ = function(event) {
  this.dispatchEvent(new goog.fs.FileSaver.ProgressEvent(event, this));
};


/** @inheritDoc */
goog.fs.FileSaver.prototype.disposeInternal = function() {
  delete this.saver_;
  goog.base(this, 'disposeInternal');
};



/**
 * A wrapper for the progress events emitted by the FileSaver.
 *
 * @param {!ProgressEvent} event The underlying event object.
 * @param {!goog.fs.FileSaver} target The FileSaver emitting the event.
 * @extends {goog.events.Event}
 * @constructor
 */
goog.fs.FileSaver.ProgressEvent = function(event, target) {
  goog.base(this, event.type, target);

  /**
   * The underlying event object.
   * @type {!ProgressEvent}
   * @private
   */
  this.event_ = event;
};
goog.inherits(goog.fs.FileSaver.ProgressEvent, goog.events.Event);


/**
 * @return {boolean} Whether or not the total size of the of the file being
 *     saved is known.
 */
goog.fs.FileSaver.ProgressEvent.prototype.isLengthComputable = function() {
  return this.event_.lengthComputable;
};


/**
 * @return {number} The number of bytes saved so far.
 */
goog.fs.FileSaver.ProgressEvent.prototype.getLoaded = function() {
  return this.event_.loaded;
};


/**
 * @return {number} The total number of bytes in the file being saved.
 */
goog.fs.FileSaver.ProgressEvent.prototype.getTotal = function() {
  return this.event_.total;
};
