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
 * @fileoverview A wrapper for the HTML5 FileReader object.
 *
 */

goog.provide('goog.fs.FileReader');
goog.provide('goog.fs.FileReader.EventType');
goog.provide('goog.fs.FileReader.ReadyState');

goog.require('goog.async.Deferred');
goog.require('goog.events.EventTarget');
goog.require('goog.fs.Error');
goog.require('goog.fs.ProgressEvent');



/**
 * An object for monitoring the reading of files. This emits ProgressEvents of
 * the types listed in {@link goog.fs.FileReader.EventType}.
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 * @final
 */
goog.fs.FileReader = function() {
  goog.fs.FileReader.base(this, 'constructor');

  /**
   * The underlying FileReader object.
   *
   * @type {!FileReader}
   * @private
   */
  this.reader_ = new FileReader();

  this.reader_.onloadstart = goog.bind(this.dispatchProgressEvent_, this);
  this.reader_.onprogress = goog.bind(this.dispatchProgressEvent_, this);
  this.reader_.onload = goog.bind(this.dispatchProgressEvent_, this);
  this.reader_.onabort = goog.bind(this.dispatchProgressEvent_, this);
  this.reader_.onerror = goog.bind(this.dispatchProgressEvent_, this);
  this.reader_.onloadend = goog.bind(this.dispatchProgressEvent_, this);
};
goog.inherits(goog.fs.FileReader, goog.events.EventTarget);


/**
 * Possible states for a FileReader.
 *
 * @enum {number}
 */
goog.fs.FileReader.ReadyState = {
  /**
   * The object has been constructed, but there is no pending read.
   */
  INIT: 0,
  /**
   * Data is being read.
   */
  LOADING: 1,
  /**
   * The data has been read from the file, the read was aborted, or an error
   * occurred.
   */
  DONE: 2
};


/**
 * Events emitted by a FileReader.
 *
 * @enum {string}
 */
goog.fs.FileReader.EventType = {
  /**
   * Emitted when the reading begins. readyState will be LOADING.
   */
  LOAD_START: 'loadstart',
  /**
   * Emitted when progress has been made in reading the file. readyState will be
   * LOADING.
   */
  PROGRESS: 'progress',
  /**
   * Emitted when the data has been successfully read. readyState will be
   * LOADING.
   */
  LOAD: 'load',
  /**
   * Emitted when the reading has been aborted. readyState will be LOADING.
   */
  ABORT: 'abort',
  /**
   * Emitted when an error is encountered or the reading has been aborted.
   * readyState will be LOADING.
   */
  ERROR: 'error',
  /**
   * Emitted when the reading is finished, whether successfully or not.
   * readyState will be DONE.
   */
  LOAD_END: 'loadend'
};


/**
 * Abort the reading of the file.
 */
goog.fs.FileReader.prototype.abort = function() {
  try {
    this.reader_.abort();
  } catch (e) {
    throw new goog.fs.Error(e, 'aborting read');
  }
};


/**
 * @return {goog.fs.FileReader.ReadyState} The current state of the FileReader.
 */
goog.fs.FileReader.prototype.getReadyState = function() {
  return /** @type {goog.fs.FileReader.ReadyState} */ (this.reader_.readyState);
};


/**
 * @return {*} The result of the file read.
 */
goog.fs.FileReader.prototype.getResult = function() {
  return this.reader_.result;
};


/**
 * @return {goog.fs.Error} The error encountered while reading, if any.
 */
goog.fs.FileReader.prototype.getError = function() {
  return this.reader_.error &&
      new goog.fs.Error(this.reader_.error, 'reading file');
};


/**
 * Wrap a progress event emitted by the underlying file reader and re-emit it.
 *
 * @param {!ProgressEvent} event The underlying event.
 * @private
 */
goog.fs.FileReader.prototype.dispatchProgressEvent_ = function(event) {
  this.dispatchEvent(new goog.fs.ProgressEvent(event, this));
};


/** @override */
goog.fs.FileReader.prototype.disposeInternal = function() {
  goog.fs.FileReader.base(this, 'disposeInternal');
  delete this.reader_;
};


/**
 * Starts reading a blob as a binary string.
 * @param {!Blob} blob The blob to read.
 */
goog.fs.FileReader.prototype.readAsBinaryString = function(blob) {
  this.reader_.readAsBinaryString(blob);
};


/**
 * Reads a blob as a binary string.
 * @param {!Blob} blob The blob to read.
 * @return {!goog.async.Deferred} The deferred Blob contents as a binary string.
 *     If an error occurs, the errback is called with a {@link goog.fs.Error}.
 */
goog.fs.FileReader.readAsBinaryString = function(blob) {
  var reader = new goog.fs.FileReader();
  var d = goog.fs.FileReader.createDeferred_(reader);
  reader.readAsBinaryString(blob);
  return d;
};


/**
 * Starts reading a blob as an array buffer.
 * @param {!Blob} blob The blob to read.
 */
goog.fs.FileReader.prototype.readAsArrayBuffer = function(blob) {
  this.reader_.readAsArrayBuffer(blob);
};


/**
 * Reads a blob as an array buffer.
 * @param {!Blob} blob The blob to read.
 * @return {!goog.async.Deferred} The deferred Blob contents as an array buffer.
 *     If an error occurs, the errback is called with a {@link goog.fs.Error}.
 */
goog.fs.FileReader.readAsArrayBuffer = function(blob) {
  var reader = new goog.fs.FileReader();
  var d = goog.fs.FileReader.createDeferred_(reader);
  reader.readAsArrayBuffer(blob);
  return d;
};


/**
 * Starts reading a blob as text.
 * @param {!Blob} blob The blob to read.
 * @param {string=} opt_encoding The name of the encoding to use.
 */
goog.fs.FileReader.prototype.readAsText = function(blob, opt_encoding) {
  this.reader_.readAsText(blob, opt_encoding);
};


/**
 * Reads a blob as text.
 * @param {!Blob} blob The blob to read.
 * @param {string=} opt_encoding The name of the encoding to use.
 * @return {!goog.async.Deferred} The deferred Blob contents as text.
 *     If an error occurs, the errback is called with a {@link goog.fs.Error}.
 */
goog.fs.FileReader.readAsText = function(blob, opt_encoding) {
  var reader = new goog.fs.FileReader();
  var d = goog.fs.FileReader.createDeferred_(reader);
  reader.readAsText(blob, opt_encoding);
  return d;
};


/**
 * Starts reading a blob as a data URL.
 * @param {!Blob} blob The blob to read.
 */
goog.fs.FileReader.prototype.readAsDataUrl = function(blob) {
  this.reader_.readAsDataURL(blob);
};


/**
 * Reads a blob as a data URL.
 * @param {!Blob} blob The blob to read.
 * @return {!goog.async.Deferred} The deferred Blob contents as a data URL.
 *     If an error occurs, the errback is called with a {@link goog.fs.Error}.
 */
goog.fs.FileReader.readAsDataUrl = function(blob) {
  var reader = new goog.fs.FileReader();
  var d = goog.fs.FileReader.createDeferred_(reader);
  reader.readAsDataUrl(blob);
  return d;
};


/**
 * Creates a new deferred object for the results of a read method.
 * @param {goog.fs.FileReader} reader The reader to create a deferred for.
 * @return {!goog.async.Deferred} The deferred results.
 * @private
 */
goog.fs.FileReader.createDeferred_ = function(reader) {
  var deferred = new goog.async.Deferred();
  reader.listen(
      goog.fs.FileReader.EventType.LOAD_END, goog.partial(function(d, r, e) {
        var result = r.getResult();
        var error = r.getError();
        if (result != null && !error) {
          d.callback(result);
        } else {
          d.errback(error);
        }
        r.dispose();
      }, deferred, reader));
  return deferred;
};
