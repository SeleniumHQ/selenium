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
 * @fileoverview Mock FileWriter object.
 *
 */

goog.setTestOnly('goog.testing.fs.FileWriter');
goog.provide('goog.testing.fs.FileWriter');

goog.require('goog.Timer');
goog.require('goog.events.EventTarget');
goog.require('goog.fs.Error');
goog.require('goog.fs.FileSaver');
goog.require('goog.string');
goog.require('goog.testing.fs.ProgressEvent');



/**
 * A mock FileWriter object. This emits the same events as
 * {@link goog.fs.FileSaver} and {@link goog.fs.FileWriter}.
 *
 * @param {!goog.testing.fs.FileEntry} fileEntry The file entry to write to.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @final
 */
goog.testing.fs.FileWriter = function(fileEntry) {
  goog.testing.fs.FileWriter.base(this, 'constructor');

  /**
   * The file entry to which to write.
   * @type {!goog.testing.fs.FileEntry}
   * @private
   */
  this.fileEntry_ = fileEntry;

  /**
   * The file blob to write to.
   * @type {!goog.testing.fs.File}
   * @private
   */
  this.file_ = fileEntry.fileSync();

  /**
   * The current state of the writer.
   * @type {goog.fs.FileSaver.ReadyState}
   * @private
   */
  this.readyState_ = goog.fs.FileSaver.ReadyState.INIT;
};
goog.inherits(goog.testing.fs.FileWriter, goog.events.EventTarget);


/**
 * The most recent error experienced by this writer.
 * @type {goog.fs.Error}
 * @private
 */
goog.testing.fs.FileWriter.prototype.error_;


/**
 * Whether the current operation has been aborted.
 * @type {boolean}
 * @private
 */
goog.testing.fs.FileWriter.prototype.aborted_ = false;


/**
 * The current position in the file.
 * @type {number}
 * @private
 */
goog.testing.fs.FileWriter.prototype.position_ = 0;


/**
 * @see {goog.fs.FileSaver#getReadyState}
 * @return {goog.fs.FileSaver.ReadyState} The ready state.
 */
goog.testing.fs.FileWriter.prototype.getReadyState = function() {
  return this.readyState_;
};


/**
 * @see {goog.fs.FileSaver#getError}
 * @return {goog.fs.Error} The error.
 */
goog.testing.fs.FileWriter.prototype.getError = function() {
  return this.error_;
};


/**
 * @see {goog.fs.FileWriter#getPosition}
 * @return {number} The position.
 */
goog.testing.fs.FileWriter.prototype.getPosition = function() {
  return this.position_;
};


/**
 * @see {goog.fs.FileWriter#getLength}
 * @return {number} The length.
 */
goog.testing.fs.FileWriter.prototype.getLength = function() {
  return this.file_.size;
};


/**
 * @see {goog.fs.FileSaver#abort}
 */
goog.testing.fs.FileWriter.prototype.abort = function() {
  if (this.readyState_ != goog.fs.FileSaver.ReadyState.WRITING) {
    var msg = 'aborting save of ' + this.fileEntry_.getFullPath();
    throw new goog.fs.Error({'name': 'InvalidStateError'}, msg);
  }

  this.aborted_ = true;
};


/**
 * @see {goog.fs.FileWriter#write}
 * @param {!goog.testing.fs.Blob} blob The blob to write.
 */
goog.testing.fs.FileWriter.prototype.write = function(blob) {
  if (this.readyState_ == goog.fs.FileSaver.ReadyState.WRITING) {
    var msg = 'writing to ' + this.fileEntry_.getFullPath();
    throw new goog.fs.Error({'name': 'InvalidStateError'}, msg);
  }

  this.readyState_ = goog.fs.FileSaver.ReadyState.WRITING;
  goog.Timer.callOnce(function() {
    if (this.aborted_) {
      this.abort_(blob.size);
      return;
    }

    this.progressEvent_(goog.fs.FileSaver.EventType.WRITE_START, 0, blob.size);
    var fileString = this.file_.toString();
    this.file_.setDataInternal(
        fileString.substring(0, this.position_) + blob.toString() +
        fileString.substring(this.position_ + blob.size, fileString.length));
    this.position_ += blob.size;

    this.progressEvent_(
        goog.fs.FileSaver.EventType.WRITE, blob.size, blob.size);
    this.readyState_ = goog.fs.FileSaver.ReadyState.DONE;
    this.progressEvent_(
        goog.fs.FileSaver.EventType.WRITE_END, blob.size, blob.size);
  }, 0, this);
};


/**
 * @see {goog.fs.FileWriter#truncate}
 * @param {number} size The size to truncate to.
 */
goog.testing.fs.FileWriter.prototype.truncate = function(size) {
  if (this.readyState_ == goog.fs.FileSaver.ReadyState.WRITING) {
    var msg = 'truncating ' + this.fileEntry_.getFullPath();
    throw new goog.fs.Error({'name': 'InvalidStateError'}, msg);
  }

  this.readyState_ = goog.fs.FileSaver.ReadyState.WRITING;
  goog.Timer.callOnce(function() {
    if (this.aborted_) {
      this.abort_(size);
      return;
    }

    this.progressEvent_(goog.fs.FileSaver.EventType.WRITE_START, 0, size);

    var fileString = this.file_.toString();
    if (size > fileString.length) {
      this.file_.setDataInternal(
          fileString + goog.string.repeat('\0', size - fileString.length));
    } else {
      this.file_.setDataInternal(fileString.substring(0, size));
    }
    this.position_ = Math.min(this.position_, size);

    this.progressEvent_(goog.fs.FileSaver.EventType.WRITE, size, size);
    this.readyState_ = goog.fs.FileSaver.ReadyState.DONE;
    this.progressEvent_(goog.fs.FileSaver.EventType.WRITE_END, size, size);
  }, 0, this);
};


/**
 * @see {goog.fs.FileWriter#seek}
 * @param {number} offset The offset to seek to.
 */
goog.testing.fs.FileWriter.prototype.seek = function(offset) {
  if (this.readyState_ == goog.fs.FileSaver.ReadyState.WRITING) {
    var msg = 'truncating ' + this.fileEntry_.getFullPath();
    throw new goog.fs.Error({name: 'InvalidStateError'}, msg);
  }

  if (offset < 0) {
    this.position_ = Math.max(0, this.file_.size + offset);
  } else {
    this.position_ = Math.min(offset, this.file_.size);
  }
};


/**
 * Abort the current action and emit appropriate events.
 *
 * @param {number} total The total data that was to be processed, in bytes.
 * @private
 */
goog.testing.fs.FileWriter.prototype.abort_ = function(total) {
  this.error_ = new goog.fs.Error(
      {'name': 'AbortError'}, 'saving ' + this.fileEntry_.getFullPath());
  this.progressEvent_(goog.fs.FileSaver.EventType.ERROR, 0, total);
  this.progressEvent_(goog.fs.FileSaver.EventType.ABORT, 0, total);
  this.readyState_ = goog.fs.FileSaver.ReadyState.DONE;
  this.progressEvent_(goog.fs.FileSaver.EventType.WRITE_END, 0, total);
  this.aborted_ = false;
};


/**
 * Dispatch a progress event.
 *
 * @param {goog.fs.FileSaver.EventType} type The type of the event.
 * @param {number} loaded The number of bytes processed.
 * @param {number} total The total data that was to be processed, in bytes.
 * @private
 */
goog.testing.fs.FileWriter.prototype.progressEvent_ = function(
    type, loaded, total) {
  // On write, update the last modified date to the current (real or mock) time.
  if (type == goog.fs.FileSaver.EventType.WRITE) {
    this.file_.lastModifiedDate = new Date(goog.now());
  }

  this.dispatchEvent(new goog.testing.fs.ProgressEvent(type, loaded, total));
};
