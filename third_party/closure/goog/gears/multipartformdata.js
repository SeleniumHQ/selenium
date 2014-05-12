// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview This class provides a builder for building multipart form data
 * that is to be usef with Gears BlobBuilder and GearsHttpRequest.
 *
 * @author arv@google.com (Erik Arvidsson)
 */

goog.provide('goog.gears.MultipartFormData');

goog.require('goog.asserts');
goog.require('goog.gears');
goog.require('goog.string');



/**
 * Creates a new multipart form data builder.
 * @constructor
 */
goog.gears.MultipartFormData = function() {
  /**
   * The blob builder used to build the blob.
   * @type {GearsBlobBuilder}
   * @private
   */
  this.blobBuilder_ = goog.gears.getFactory().create('beta.blobbuilder');

  /**
   * The boundary. This should be something that does not occurr in the values.
   * @type {string}
   * @private
   */
  this.boundary_ = '----' + goog.string.getRandomString();
};


/**
 * Constant for a carriage return followed by a new line.
 * @type {string}
 * @private
 */
goog.gears.MultipartFormData.CRLF_ = '\r\n';


/**
 * Constant containing two dashes.
 * @type {string}
 * @private
 */
goog.gears.MultipartFormData.DASHES_ = '--';


/**
 * Whether the builder has been closed.
 * @type {boolean}
 * @private
 */
goog.gears.MultipartFormData.prototype.closed_;


/**
 * Whether the builder has any content.
 * @type {boolean}
 * @private
 */
goog.gears.MultipartFormData.prototype.hasContent_;


/**
 * Adds a Gears file to the multipart.
 * @param {string} name The name of the value.
 * @param {GearsFile} gearsFile The Gears file as returned from openFiles etc.
 * @return {goog.gears.MultipartFormData} The form builder itself.
 */
goog.gears.MultipartFormData.prototype.addFile = function(name, gearsFile) {
  return this.addBlob(name, gearsFile.name, gearsFile.blob);
};


/**
 * Adds some text to the multipart.
 * @param {string} name The name of the value.
 * @param {*} value The value. This will use toString on the value.
 * @return {goog.gears.MultipartFormData} The form builder itself.
 */
goog.gears.MultipartFormData.prototype.addText = function(name, value) {
  this.assertNotClosed_();

  // Also assert that the value does not contain the boundary.
  this.assertNoBoundary_(value);

  this.hasContent_ = true;
  this.blobBuilder_.append(
      goog.gears.MultipartFormData.DASHES_ + this.boundary_ +
      goog.gears.MultipartFormData.CRLF_ +
      'Content-Disposition: form-data; name="' + name + '"' +
      goog.gears.MultipartFormData.CRLF_ +
      // The BlobBuilder uses UTF-8 so ensure that we use that at all times.
      'Content-Type: text/plain; charset=UTF-8' +
      goog.gears.MultipartFormData.CRLF_ +
      goog.gears.MultipartFormData.CRLF_ +
      value +
      goog.gears.MultipartFormData.CRLF_);
  return this;
};


/**
 * Adds a Gears blob as a file to the multipart.
 * @param {string} name The name of the value.
 * @param {string} fileName The name of the file.
 * @param {GearsBlob} blob The blob to add.
 * @return {goog.gears.MultipartFormData} The form builder itself.
 */
goog.gears.MultipartFormData.prototype.addBlob = function(name, fileName,
                                                          blob) {
  this.assertNotClosed_();

  this.hasContent_ = true;
  this.blobBuilder_.append(
      goog.gears.MultipartFormData.DASHES_ + this.boundary_ +
      goog.gears.MultipartFormData.CRLF_ +
      'Content-Disposition: form-data; name="' + name + '"' +
      '; filename="' + fileName + '"' +
      goog.gears.MultipartFormData.CRLF_ +
      'Content-Type: application/octet-stream' +
      goog.gears.MultipartFormData.CRLF_ +
      goog.gears.MultipartFormData.CRLF_);
  this.blobBuilder_.append(blob);
  this.blobBuilder_.append(goog.gears.MultipartFormData.CRLF_);
  return this;
};


/**
 * The content type to set on the GearsHttpRequest.
 *
 *   var builder = new MultipartFormData;
 *   ...
 *   ghr.setRequestHeader('Content-Type', builder.getContentType());
 *   ghr.send(builder.getAsBlob());
 *
 * @return {string} The content type string to be used when posting this with
 *   a GearsHttpRequest.
 */
goog.gears.MultipartFormData.prototype.getContentType = function() {
  return 'multipart/form-data; boundary=' + this.boundary_;
};


/**
 * @return {GearsBlob} The blob to use in the send method of the
 *     GearsHttpRequest.
 */
goog.gears.MultipartFormData.prototype.getAsBlob = function() {
  if (!this.closed_ && this.hasContent_) {
    this.blobBuilder_.append(
        goog.gears.MultipartFormData.DASHES_ +
        this.boundary_ +
        goog.gears.MultipartFormData.DASHES_ +
        goog.gears.MultipartFormData.CRLF_);
    this.closed_ = true;
  }
  return this.blobBuilder_.getAsBlob();
};


/**
 * Asserts that we do not try to add any more data to a closed multipart form
 * builder.
 * @throws {Error} If the multipart form data has already been closed.
 * @private
 */
goog.gears.MultipartFormData.prototype.assertNotClosed_ = function() {
  goog.asserts.assert(!this.closed_, 'The multipart form builder has been ' +
                      'closed and no more data can be added to it');
};


/**
 * Asserts that the value does not contain the boundary.
 * @param {*} v The value to ensure that the string representation does not
 *     contain the boundary token.
 * @throws {Error} If the value contains the boundary.
 * @private
 */
goog.gears.MultipartFormData.prototype.assertNoBoundary_ = function(v) {
  goog.asserts.assert(String(v).indexOf(this.boundary_) == -1,
                      'The value cannot contain the boundary');
};
