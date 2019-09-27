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
 * @fileoverview Mock blob object.
 *
 */

goog.setTestOnly('goog.testing.fs.Blob');
goog.provide('goog.testing.fs.Blob');

goog.require('goog.crypt');
goog.require('goog.crypt.base64');



/**
 * A mock Blob object. The data is stored as an Array of bytes, a "byte" being a
 * JS number in the range 0-255.
 *
 * This blob simplifies writing test code because it has the toString() method
 * that returns immediately, while the File API only provides asynchronous
 * reads.
 * @see https://www.w3.org/TR/FileAPI/#constructorBlob
 *
 * @param {(string|Array<(string|number|!Uint8Array)>)=} opt_data The data
 *     encapsulated by the blob.
 * @param {string=} opt_type The mime type of the blob.
 * @constructor
 */
goog.testing.fs.Blob = function(opt_data, opt_type) {
  /**
   * @see http://www.w3.org/TR/FileAPI/#dfn-type
   * @type {string}
   */
  this.type = opt_type || '';

  /**
   * The data encapsulated by the blob as an Array of bytes, a "byte" being a
   * JS number in the range 0-255.
   * @private {!Array<number>}
   */
  this.data_ = [];

  /**
   * @see http://www.w3.org/TR/FileAPI/#dfn-size
   * @type {number}
   */
  this.size = 0;

  this.setDataInternal(opt_data || '');
};


/**
 * Creates a blob with bytes of a blob ranging from the optional start
 * parameter up to but not including the optional end parameter, and with a type
 * attribute that is the value of the optional contentType parameter.
 * @see http://www.w3.org/TR/FileAPI/#dfn-slice
 * @param {number=} opt_start The start byte offset.
 * @param {number=} opt_end The end point of a slice.
 * @param {string=} opt_contentType The type of the resulting Blob.
 * @return {!goog.testing.fs.Blob} The result blob of the slice operation.
 */
goog.testing.fs.Blob.prototype.slice = function(
    opt_start, opt_end, opt_contentType) {
  var relativeStart;
  if (goog.isNumber(opt_start)) {
    relativeStart = (opt_start < 0) ? Math.max(this.size + opt_start, 0) :
                                      Math.min(opt_start, this.size);
  } else {
    relativeStart = 0;
  }
  var relativeEnd;
  if (goog.isNumber(opt_end)) {
    relativeEnd = (opt_end < 0) ? Math.max(this.size + opt_end, 0) :
                                  Math.min(opt_end, this.size);
  } else {
    relativeEnd = this.size;
  }
  var span = Math.max(relativeEnd - relativeStart, 0);
  var blob = new goog.testing.fs.Blob(
      this.data_.slice(relativeStart, relativeStart + span), opt_contentType);
  return blob;
};


/**
 * @return {string} The data encapsulated by the blob as an UTF-8 string.
 * @override
 */
goog.testing.fs.Blob.prototype.toString = function() {
  return goog.crypt.utf8ByteArrayToString(this.data_);
};


/**
 * @return {!ArrayBuffer} The data encapsulated by the blob as an
 *     ArrayBuffer.
 */
goog.testing.fs.Blob.prototype.toArrayBuffer = function() {
  var buf = new ArrayBuffer(this.data_.length);
  var arr = new Uint8Array(buf);
  for (var i = 0; i < this.data_.length; i++) {
    arr[i] = this.data_[i];
  }
  return buf;
};


/**
 * @return {string} The string data encapsulated by the blob as a data: URI.
 */
goog.testing.fs.Blob.prototype.toDataUrl = function() {
  return 'data:' + this.type + ';base64,' +
      goog.crypt.base64.encodeByteArray(this.data_);
};


/**
 * Sets the internal contents of the blob to an Array of bytes. This should
 *     only be called by other functions inside the {@code goog.testing.fs}
 *     namespace.
 * @param {string|Array<string|number|!Uint8Array>} data The data to write
 *     into the blob.
 * @package
 */
goog.testing.fs.Blob.prototype.setDataInternal = function(data) {
  this.data_ = [];
  if (typeof data === 'string') {
    this.appendString_(data);
  } else if (data instanceof Array) {
    for (var i = 0; i < data.length; i++) {
      if (typeof data[i] === 'string') {
        this.appendString_(data[i]);
      } else if (typeof data[i] === 'number') {  // Assume Bytes array.
        this.appendByte_(data[i]);
      } else if (data[i] instanceof Uint8Array) {
        this.appendUint8_(data[i]);
      }
    }
  }
  this.size = this.data_.length;
};


/**
 * Converts the data from string to Array of bytes and appends to the blob
 *     content.
 * @param {string} data The string to append to the blob content.
 * @private
 */
goog.testing.fs.Blob.prototype.appendString_ = function(data) {
  Array.prototype.push.apply(
      this.data_, goog.crypt.stringToUtf8ByteArray(data));
};


/**
 * Appends a byte (as a number between 0 to 255) to the blob content.
 * @param {number} data The byte to append.
 * @private
 */
goog.testing.fs.Blob.prototype.appendByte_ = function(data) {
  this.data_.push(data);
};


/**
 * Converts the data from Uint8Array to Array of bytes and appends it to the
 *     blob content.
 * @param {!Uint8Array} data The array to append to the blob content.
 * @private
 */
goog.testing.fs.Blob.prototype.appendUint8_ = function(data) {
  for (var i = 0; i < data.length; i++) {
    this.data_.push(data[i]);
  }
};
