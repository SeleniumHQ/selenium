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
 * @fileoverview Mock implementations of the Closure HTML5 FileSystem wrapper
 * classes. These implementations are designed to be usable in any browser, so
 * they use none of the native FileSystem-related objects.
 *
 */

goog.provide('goog.testing.fs');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.async.Deferred');
goog.require('goog.fs');
goog.require('goog.testing.fs.Blob');
goog.require('goog.testing.fs.FileSystem');


/**
 * Get a filesystem object. Since these are mocks, there's no difference between
 * temporary and persistent filesystems.
 *
 * @param {number} size Ignored.
 * @return {!goog.async.Deferred} The deferred
 *     {@link goog.testing.fs.FileSystem}.
 */
goog.testing.fs.getTemporary = function(size) {
  var d = new goog.async.Deferred();
  goog.Timer.callOnce(
      goog.bind(d.callback, d, new goog.testing.fs.FileSystem()));
  return d;
};


/**
 * Get a filesystem object. Since these are mocks, there's no difference between
 * temporary and persistent filesystems.
 *
 * @param {number} size Ignored.
 * @return {!goog.async.Deferred} The deferred
 *     {@link goog.testing.fs.FileSystem}.
 */
goog.testing.fs.getPersistent = function(size) {
  return goog.testing.fs.getTemporary(size);
};


/**
 * Which object URLs have been granted for fake blobs.
 * @type {!Object.<boolean>}
 * @private
 */
goog.testing.fs.objectUrls_ = {};


/**
 * Create a fake object URL for a given fake blob. This can be used as a real
 * URL, and it can be created and revoked normally.
 *
 * @param {!goog.testing.fs.Blob} blob The blob for which to create the URL.
 * @return {string} The URL.
 */
goog.testing.fs.createObjectUrl = function(blob) {
  var url = blob.toDataUrl();
  goog.testing.fs.objectUrls_[url] = true;
  return url;
};


/**
 * Remove a URL that was created for a fake blob.
 *
 * @param {string} url The URL to revoke.
 */
goog.testing.fs.revokeObjectUrl = function(url) {
  delete goog.testing.fs.objectUrls_[url];
};


/**
 * Return whether or not a URL has been granted for the given blob.
 *
 * @param {!goog.testing.fs.Blob} blob The blob to check.
 * @return {boolean} Whether a URL has been granted.
 */
goog.testing.fs.isObjectUrlGranted = function(blob) {
  return (blob.toDataUrl()) in goog.testing.fs.objectUrls_;
};


/**
 * Concatenates one or more values together and converts them to a fake blob.
 *
 * @param {...(string|!goog.testing.fs.Blob)} var_args The values that will make
 *     up the resulting blob.
 * @return {!goog.testing.fs.Blob} The blob.
 */
goog.testing.fs.getBlob = function(var_args) {
  return new goog.testing.fs.Blob(goog.array.map(arguments, String).join(''));
};


/**
 * Returns the string value of a fake blob.
 *
 * @param {!goog.testing.fs.Blob} blob The blob to convert to a string.
 * @param {string=} opt_encoding Ignored.
 * @return {!goog.async.Deferred} The deferred string value of the blob.
 */
goog.testing.fs.blobToString = function(blob, opt_encoding) {
  var d = new goog.async.Deferred();
  goog.Timer.callOnce(goog.bind(d.callback, d, blob.toString()));
  return d;
};


/**
 * Installs goog.testing.fs in place of the standard goog.fs. After calling
 * this, code that uses goog.fs should work without issue using goog.testing.fs.
 *
 * @param {!goog.testing.PropertyReplacer} stubs The property replacer for
 *     stubbing out the original goog.fs functions.
 */
goog.testing.fs.install = function(stubs) {
  // Prevent warnings that goog.fs may get optimized away. It's true this is
  // unsafe in compiled code, but it's only meant for tests.
  var fs = goog.getObjectByName('goog.fs');
  stubs.replace(fs, 'getTemporary', goog.testing.fs.getTemporary);
  stubs.replace(fs, 'getPersistent', goog.testing.fs.getPersistent);
  stubs.replace(fs, 'createObjectUrl', goog.testing.fs.createObjectUrl);
  stubs.replace(fs, 'revokeObjectUrl', goog.testing.fs.revokeObjectUrl);
  stubs.replace(fs, 'getBlob', goog.testing.fs.getBlob);
  stubs.replace(fs, 'blobToString', goog.testing.fs.blobToString);
};
