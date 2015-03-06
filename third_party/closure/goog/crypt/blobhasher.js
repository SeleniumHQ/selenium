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
 * @fileoverview Asynchronous hash computer for the Blob interface.
 *
 * The Blob interface, part of the HTML5 File API, is supported on Chrome 7+,
 * Firefox 4.0 and Opera 11. No Blob interface implementation is expected on
 * Internet Explorer 10. Chrome 11, Firefox 5.0 and the subsequent release of
 * Opera are supposed to use vendor prefixes due to evolving API, see
 * http://dev.w3.org/2006/webapi/FileAPI/ for details.
 *
 * This implementation currently uses upcoming Chrome and Firefox prefixes,
 * plus the original Blob.slice specification, as implemented on Chrome 10
 * and Firefox 4.0.
 *
 */

goog.provide('goog.crypt.BlobHasher');
goog.provide('goog.crypt.BlobHasher.EventType');

goog.require('goog.asserts');
goog.require('goog.events.EventTarget');
goog.require('goog.fs');
goog.require('goog.log');



/**
 * Construct the hash computer.
 *
 * @param {!goog.crypt.Hash} hashFn The hash function to use.
 * @param {number=} opt_blockSize Processing block size.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @final
 */
goog.crypt.BlobHasher = function(hashFn, opt_blockSize) {
  goog.crypt.BlobHasher.base(this, 'constructor');

  /**
   * The actual hash function.
   * @type {!goog.crypt.Hash}
   * @private
   */
  this.hashFn_ = hashFn;

  /**
   * The blob being processed or null if no blob is being processed.
   * @type {Blob}
   * @private
   */
  this.blob_ = null;

  /**
   * Computed hash value.
   * @type {Array<number>}
   * @private
   */
  this.hashVal_ = null;

  /**
   * Number of bytes already processed.
   * @type {number}
   * @private
   */
  this.bytesProcessed_ = 0;

  /**
   * The number of bytes to hash or Infinity for no limit.
   * @type {number}
   * @private
   */
  this.hashingLimit_ = Infinity;

  /**
   * Processing block size.
   * @type {number}
   * @private
   */
  this.blockSize_ = opt_blockSize || 5000000;

  /**
   * File reader object. Will be null if no chunk is currently being read.
   * @type {FileReader}
   * @private
   */
  this.fileReader_ = null;

  /**
   * The logger used by this object.
   * @type {goog.log.Logger}
   * @private
   */
  this.logger_ = goog.log.getLogger('goog.crypt.BlobHasher');
};
goog.inherits(goog.crypt.BlobHasher, goog.events.EventTarget);


/**
 * Event names for hash computation events
 * @enum {string}
 */
goog.crypt.BlobHasher.EventType = {
  STARTED: 'started',
  PROGRESS: 'progress',
  THROTTLED: 'throttled',
  COMPLETE: 'complete',
  ABORT: 'abort',
  ERROR: 'error'
};


/**
 * Start the hash computation.
 * @param {!Blob} blob The blob of data to compute the hash for.
 */
goog.crypt.BlobHasher.prototype.hash = function(blob) {
  this.abort();
  this.hashFn_.reset();
  this.blob_ = blob;
  this.hashVal_ = null;
  this.bytesProcessed_ = 0;
  this.dispatchEvent(goog.crypt.BlobHasher.EventType.STARTED);

  this.processNextBlock_();
};


/**
 * Sets the maximum number of bytes to hash or Infinity for no limit. Can be
 * called before hash() to throttle the hash computation. The hash computation
 * can then be continued by repeatedly calling setHashingLimit() with greater
 * byte offsets. This is useful if you don't need the hash until some time in
 * the future, for example when uploading a file and you don't need the hash
 * until the transfer is complete.
 * @param {number} byteOffset The byte offset to compute the hash up to.
 *     Should be a non-negative integer or Infinity for no limit. Negative
 *     values are not allowed.
 */
goog.crypt.BlobHasher.prototype.setHashingLimit = function(byteOffset) {
  goog.asserts.assert(byteOffset >= 0, 'Hashing limit must be non-negative.');
  this.hashingLimit_ = byteOffset;

  // Resume processing if a blob is currently being hashed, but no block read
  // is currently in progress.
  if (this.blob_ && !this.fileReader_) {
    this.processNextBlock_();
  }
};


/**
 * Abort hash computation.
 */
goog.crypt.BlobHasher.prototype.abort = function() {
  if (this.fileReader_) {
    this.fileReader_.abort();
    this.fileReader_ = null;
  }

  if (this.blob_) {
    this.blob_ = null;
    this.dispatchEvent(goog.crypt.BlobHasher.EventType.ABORT);
  }
};


/**
 * @return {number} Number of bytes processed so far.
 */
goog.crypt.BlobHasher.prototype.getBytesProcessed = function() {
  return this.bytesProcessed_;
};


/**
 * @return {Array<number>} The computed hash value or null if not ready.
 */
goog.crypt.BlobHasher.prototype.getHash = function() {
  return this.hashVal_;
};


/**
 * Helper function setting up the processing for the next block, or finalizing
 * the computation if all blocks were processed.
 * @private
 */
goog.crypt.BlobHasher.prototype.processNextBlock_ = function() {
  goog.asserts.assert(this.blob_, 'A hash computation must be in progress.');

  if (this.bytesProcessed_ < this.blob_.size) {

    if (this.hashingLimit_ <= this.bytesProcessed_) {
      // Throttle limit reached. Wait until we are allowed to hash more bytes.
      this.dispatchEvent(goog.crypt.BlobHasher.EventType.THROTTLED);
      return;
    }

    // We have to reset the FileReader every time, otherwise it fails on
    // Chrome, including the latest Chrome 12 beta.
    // http://code.google.com/p/chromium/issues/detail?id=82346
    this.fileReader_ = new FileReader();
    this.fileReader_.onload = goog.bind(this.onLoad_, this);
    this.fileReader_.onerror = goog.bind(this.onError_, this);

    var endOffset = Math.min(this.hashingLimit_, this.blob_.size);
    var size = Math.min(endOffset - this.bytesProcessed_, this.blockSize_);
    var chunk = goog.fs.sliceBlob(this.blob_, this.bytesProcessed_,
                                  this.bytesProcessed_ + size);
    if (!chunk || chunk.size != size) {
      goog.log.error(this.logger_, 'Failed slicing the blob');
      this.onError_();
      return;
    }

    if (this.fileReader_.readAsArrayBuffer) {
      this.fileReader_.readAsArrayBuffer(chunk);
    } else if (this.fileReader_.readAsBinaryString) {
      this.fileReader_.readAsBinaryString(chunk);
    } else {
      goog.log.error(this.logger_, 'Failed calling the chunk reader');
      this.onError_();
    }
  } else {
    this.hashVal_ = this.hashFn_.digest();
    this.blob_ = null;
    this.dispatchEvent(goog.crypt.BlobHasher.EventType.COMPLETE);
  }
};


/**
 * Handle processing block loaded.
 * @private
 */
goog.crypt.BlobHasher.prototype.onLoad_ = function() {
  goog.log.info(this.logger_, 'Successfully loaded a chunk');

  var array = null;
  if (this.fileReader_.result instanceof Array ||
      goog.isString(this.fileReader_.result)) {
    array = this.fileReader_.result;
  } else if (goog.global['ArrayBuffer'] && goog.global['Uint8Array'] &&
             this.fileReader_.result instanceof ArrayBuffer) {
    array = new Uint8Array(this.fileReader_.result);
  }
  if (!array) {
    goog.log.error(this.logger_, 'Failed reading the chunk');
    this.onError_();
    return;
  }

  this.hashFn_.update(array);
  this.bytesProcessed_ += array.length;
  this.fileReader_ = null;
  this.dispatchEvent(goog.crypt.BlobHasher.EventType.PROGRESS);

  this.processNextBlock_();
};


/**
 * Handles error.
 * @private
 */
goog.crypt.BlobHasher.prototype.onError_ = function() {
  this.fileReader_ = null;
  this.blob_ = null;
  this.dispatchEvent(goog.crypt.BlobHasher.EventType.ERROR);
};
