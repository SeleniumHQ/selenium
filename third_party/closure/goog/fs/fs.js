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
 * @fileoverview Wrappers for the HTML5 File API. These wrappers closely mirror
 * the underlying APIs, but use Closure-style events and Deferred return values.
 * Their existence also makes it possible to mock the FileSystem API for testing
 * in browsers that don't support it natively.
 *
 * When adding public functions to anything under this namespace, be sure to add
 * its mock counterpart to goog.testing.fs.
 *
 */

goog.provide('goog.fs');

goog.require('goog.async.Deferred');
goog.require('goog.events');
goog.require('goog.fs.Error');
goog.require('goog.fs.FileSystem');


/**
 * Get a wrapped FileSystem object.
 *
 * @param {goog.fs.FileSystemType_} type The type of the filesystem to get.
 * @param {number} size The size requested for the filesystem, in bytes.
 * @return {!goog.async.Deferred} The deferred {@link goog.fs.FileSystem}. If an
 *     error occurs, the errback is called with a {@link goog.fs.Error}.
 * @private
 */
goog.fs.get_ = function(type, size) {
  var d = new goog.async.Deferred();
  goog.global.requestFileSystem(type, size, function(fs) {
    d.callback(new goog.fs.FileSystem(fs));
  }, function(err) {
    d.callback(new goog.fs.Error(err.code, 'requesting filesystem'));
  });
  return d;
};


/**
 * The two types of filesystem.
 *
 * @enum {number}
 * @private
 */
goog.fs.FileSystemType_ = {
  /**
   * A temporary filesystem may be deleted by the user agent at its discretion.
   */
  TEMPORARY: 0,
  /**
   * A persistent filesystem will never be deleted without the user's or
   * application's authorization.
   */
  PERSISTENT: 1
};


/**
 * Returns a temporary FileSystem object. A temporary filesystem may be deleted
 * by the user agent at its discretion.
 *
 * @param {number} size The size requested for the filesystem, in bytes.
 * @return {!goog.async.Deferred} The deferred {@link goog.fs.FileSystem}. If an
 *     error occurs, the errback is called with a {@link goog.fs.Error}.
 */
goog.fs.getTemporary = function(size) {
  return goog.fs.get_(goog.fs.FileSystemType_.TEMPORARY, size);
};


/**
 * Returns a persistent FileSystem object. A persistent filesystem will never be
 * deleted without the user's or application's authorization.
 *
 * @param {number} size The size requested for the filesystem, in bytes.
 * @return {!goog.async.Deferred} The deferred {@link goog.fs.FileSystem}. If an
 *     error occurs, the errback is called with a {@link goog.fs.Error}.
 */
goog.fs.getPersistent = function(size) {
  return goog.fs.get_(goog.fs.FileSystemType_.PERSISTENT, size);
};


/**
 * Creates a blob URL for a blob object.
 *
 * @param {!Blob} blob The object for which to create the URL.
 * @return {string} The URL for the object.
 */
goog.fs.createObjectUrl = function(blob) {
  return goog.fs.getUrlObject_().createObjectURL(blob);
};


/**
 * Revokes a URL created by {@link goog.fs.createObjectUrl}.
 *
 * @param {string} url The URL to revoke.
 */
goog.fs.revokeObjectUrl = function(url) {
  goog.fs.getUrlObject_().revokeObjectURL(url);
};


/**
 * Get the object that has the createObjectURL and revokeObjectURL functions for
 * this browser.
 *
 * @return {!{createObjectURL: (function(Blob): string),
 *            revokeObjectURL: function(string)}} The object for this browser.
 * @private
 */
goog.fs.getUrlObject_ = function() {
  // This is what the spec says to do
  // http://dev.w3.org/2006/webapi/FileAPI/#dfn-createObjectURL
  if (goog.isDef(goog.global.URL) &&
      goog.isDef(goog.global.URL.createObjectURL)) {
    return goog.global.URL;
  // This is what Chrome does (as of 10.0.648.6 dev)
  } else if (goog.isDef(goog.global.webkitURL) &&
             goog.isDef(goog.global.webkitURL.createObjectURL)) {
    return goog.global.webkitURL;
  // This is what the spec used to say to do
  } else if (goog.isDef(goog.global.createObjectURL)) {
    return goog.global;
  } else {
    throw Error('This browser doesn\'t seem to support blob URLs');
  }
};


/**
 * Concatenates one or more values together and converts them to a Blob.
 *
 * @param {...(string|!Blob)} var_args The values that will make up
 *     the resulting blob.
 * @return {!Blob} The blob.
 */
goog.fs.getBlob = function(var_args) {
  var bb = new BlobBuilder();
  for (var i = 0; i < arguments.length; i++) {
    bb.append(arguments[i]);
  }
  return bb.getBlob();
};


/**
 * Converts a Blob or a File into a string. This should only be used when the
 * blob is known to be small.
 *
 * @param {!Blob} blob The blob to convert.
 * @param {string=} opt_encoding The name of the encoding to use.
 * @return {!goog.async.Deferred} The deferred string. If an error occurrs, the
 *     errback is called with a {@link goog.fs.Error}.
 */
goog.fs.blobToString = function(blob, opt_encoding) {
  // TODO(user): write a proper wrapper for FileReader
  var reader = new FileReader();
  var d = new goog.async.Deferred();
  reader.onload = function() { d.callback(reader.result); };
  reader.onerror = function() {
    d.errback(
        new goog.fs.Error(reader.error.code, 'converting blob to string'));
  };
  reader.readAsText(blob, opt_encoding);
  return d;
};
