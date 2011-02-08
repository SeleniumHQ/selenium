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

goog.provide('goog.testing.fs.FileWriter');
goog.provide('goog.testing.fs.FileWriter.ProgressEvent');

goog.require('goog.Timer');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.fs.Error');
goog.require('goog.fs.FileSaver.EventType');
goog.require('goog.fs.FileSaver.ReadyState');
goog.require('goog.string');



/**
 * A mock FileWriter object. This emits the same events as
 * {@link goog.fs.FileSaver} and {@link goog.fs.FileWriter}.
 *
 * @param {!goog.testing.fs.FileEntry} file The file entry to which to write.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.testing.fs.FileWriter = function(file) {
  goog.base(this);

  /**
   * The file entry to which to write.
   * @type {!goog.testing.fs.FileEntry}
   * @private
   */
  this.file_ = file;

  /**
   * The current state of the writer.
   * @type {goog.fs.FileSaver.ReadyState}
   * @private
   */
  this.readyState_ = goog.fs.FileSaver.ReadyState.INIT;

  /**
   * The length of the file.
   * @type {number}
   * @private
   */
  this.length_ = file.data.length;
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
 * @return {goog.fs.FileSaver.ReadyState}
 */
goog.testing.fs.FileWriter.prototype.getReadyState = function() {
  return this.readyState_;
};


/**
 * @see {goog.fs.FileSaver#getError}
 * @return {goog.fs.Error}
 */
goog.testing.fs.FileWriter.prototype.getError = function() {
  return this.error_;
};


/**
 * @see {goog.fs.FileWriter#getPosition}
 * @return {number}
 */
goog.testing.fs.FileWriter.prototype.getPosition = function() {
  return this.position_;
};


/**
 * @see {goog.fs.FileWriter#getLength}
 * @return {number}
 */
goog.testing.fs.FileWriter.prototype.getLength = function() {
  return this.length_;
};


/**
 * @see {goog.fs.FileSaver#abort}
 */
goog.testing.fs.FileWriter.prototype.abort = function() {
  if (this.readyState_ != goog.fs.FileSaver.ReadyState.WRITING) {
    var msg = 'aborting save of ' + this.file_.getFullPath();
    throw new goog.fs.Error(goog.fs.Error.ErrorCode.INVALID_STATE, msg);
  }

  this.aborted_ = true;
};


/**
 * @see {goog.fs.FileWriter#write}
 * @param {!goog.testing.fs.Blob} blob
 */
goog.testing.fs.FileWriter.prototype.write = function(blob) {
  if (this.readyState_ == goog.fs.FileSaver.ReadyState.WRITING) {
    var msg = 'writing to ' + this.file_.getFullPath();
    throw new goog.fs.Error(goog.fs.Error.ErrorCode.INVALID_STATE, msg);
  }

  this.readyState_ = goog.fs.FileSaver.ReadyState.WRITING;
  goog.Timer.callOnce(function() {
    if (this.aborted_) {
      this.abort_(blob.size);
      return;
    }

    this.progressEvent_(goog.fs.FileSaver.EventType.WRITE_START, 0, blob.size);
    var fileString = this.file_.data;
    this.file_.data =
        fileString.substring(0, this.position_) + blob.toString() +
        fileString.substring(this.position_ + blob.size, fileString.length);
    this.position_ += blob.size;
    this.length_ = this.file_.data.length;
    this.progressEvent_(
        goog.fs.FileSaver.EventType.WRITE, blob.size, blob.size);
    this.readyState_ = goog.fs.FileSaver.ReadyState.DONE;
    this.progressEvent_(
        goog.fs.FileSaver.EventType.WRITE_END, blob.size, blob.size);
  }, 0, this);
};


/**
 * @see {goog.fs.FileWriter#truncate}
 * @param {number} size
 */
goog.testing.fs.FileWriter.prototype.truncate = function(size) {
  if (this.readyState_ == goog.fs.FileSaver.ReadyState.WRITING) {
    var msg = 'truncating ' + this.file_.getFullPath();
    throw new goog.fs.Error(goog.fs.Error.ErrorCode.INVALID_STATE, msg);
  }

  this.readyState_ = goog.fs.FileSaver.ReadyState.WRITING;
  goog.Timer.callOnce(function() {
    if (this.aborted_) {
      this.abort_(size);
      return;
    }

    this.progressEvent_(goog.fs.FileSaver.EventType.WRITE_START, 0, size);
    if (size > this.file_.data.length) {
      this.file_.data =
          this.file_.data +
          goog.string.repeat('\0', size - this.file_.data.length);
    } else {
      this.file_.data = this.file_.data.substring(0, size);
    }
    this.position_ = Math.min(this.position_, size);
    this.length_ = size;
    this.progressEvent_(goog.fs.FileSaver.EventType.WRITE, size, size);
    this.readyState_ = goog.fs.FileSaver.ReadyState.DONE;
    this.progressEvent_(goog.fs.FileSaver.EventType.WRITE_END, size, size);
  }, 0, this);
};


/**
 * @see {goog.fs.FileWriter#seek}
 * @param {number} offset
 */
goog.testing.fs.FileWriter.prototype.seek = function(offset) {
  if (this.readyState_ == goog.fs.FileSaver.ReadyState.WRITING) {
    var msg = 'truncating ' + this.file_.getFullPath();
    throw new goog.fs.Error(goog.fs.Error.ErrorCode.INVALID_STATE, msg);
  }

  if (offset < 0) {
    this.position_ = Math.max(0, this.file_.data.length + offset);
  } else {
    this.position_ = Math.min(offset, this.file_.data.length);
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
      goog.fs.Error.ErrorCode.ABORT, 'saving ' + this.file_.getFullPath());
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
  this.dispatchEvent(new goog.testing.fs.FileWriter.ProgressEvent(
      type, loaded, total));
};



/**
 * A mock progress event.
 *
 * @param {goog.fs.FileSaver.EventType} type The type of the event.
 * @param {number} loaded The number of bytes processed.
 * @param {number} total The total data that was to be processed, in bytes.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.testing.fs.FileWriter.ProgressEvent = function(type, loaded, total) {
  goog.base(this, type);

  /**
   * The number of bytes processed.
   * @type {number}
   * @private
   */
  this.loaded_ = loaded;


  /**
   * The total data that was to be procesed, in bytes.
   * @type {number}
   * @private
   */
  this.total_ = total;
};
goog.inherits(goog.testing.fs.FileWriter.ProgressEvent, goog.events.Event);


/**
 * @see {goog.fs.FileSaver.ProgressEvent#isLengthComputable}
 * @return {boolean}
 */
goog.testing.fs.FileWriter.ProgressEvent.prototype.isLengthComputable =
    function() {
  return true;
};


/**
 * @see {goog.fs.FileSaver.ProgressEvent#getLoaded}
 * @return {number}
 */
goog.testing.fs.FileWriter.ProgressEvent.prototype.getLoaded = function() {
  return this.loaded_;
};


/**
 * @see {goog.fs.FileSaver.ProgressEvent#getTotal}
 * @return {number}
 */
goog.testing.fs.FileWriter.ProgressEvent.prototype.getTotal = function() {
  return this.total_;
};
