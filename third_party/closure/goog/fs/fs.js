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

goog.require('goog.array');
goog.require('goog.async.Deferred');
goog.require('goog.fs.Error');
goog.require('goog.fs.FileReader');
goog.require('goog.fs.FileSystemImpl');
goog.require('goog.userAgent');


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
  var requestFileSystem = goog.global.requestFileSystem ||
      goog.global.webkitRequestFileSystem;

  if (!goog.isFunction(requestFileSystem)) {
    return goog.async.Deferred.fail(new Error('File API unsupported'));
  }

  var d = new goog.async.Deferred();
  requestFileSystem(type, size, function(fs) {
    d.callback(new goog.fs.FileSystemImpl(fs));
  }, function(err) {
    d.errback(new goog.fs.Error(err, 'requesting filesystem'));
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
 * Throws an error if the browser does not support Object Urls.
 *
 * @param {!Blob} blob The object for which to create the URL.
 * @return {string} The URL for the object.
 */
goog.fs.createObjectUrl = function(blob) {
  return goog.fs.getUrlObject_().createObjectURL(blob);
};


/**
 * Revokes a URL created by {@link goog.fs.createObjectUrl}.
 * Throws an error if the browser does not support Object Urls.
 *
 * @param {string} url The URL to revoke.
 */
goog.fs.revokeObjectUrl = function(url) {
  goog.fs.getUrlObject_().revokeObjectURL(url);
};


/**
 * @typedef {{createObjectURL: (function(!Blob): string),
 *            revokeObjectURL: function(string): void}}
 */
goog.fs.UrlObject_;


/**
 * Get the object that has the createObjectURL and revokeObjectURL functions for
 * this browser.
 *
 * @return {goog.fs.UrlObject_} The object for this browser.
 * @private
 */
goog.fs.getUrlObject_ = function() {
  var urlObject = goog.fs.findUrlObject_();
  if (urlObject != null) {
    return urlObject;
  } else {
    throw Error('This browser doesn\'t seem to support blob URLs');
  }
};


/**
 * Finds the object that has the createObjectURL and revokeObjectURL functions
 * for this browser.
 *
 * @return {?goog.fs.UrlObject_} The object for this browser or null if the
 *     browser does not support Object Urls.
 * @private
 */
goog.fs.findUrlObject_ = function() {
  // This is what the spec says to do
  // http://dev.w3.org/2006/webapi/FileAPI/#dfn-createObjectURL
  if (goog.isDef(goog.global.URL) &&
      goog.isDef(goog.global.URL.createObjectURL)) {
    return /** @type {goog.fs.UrlObject_} */ (goog.global.URL);
  // This is what Chrome does (as of 10.0.648.6 dev)
  } else if (goog.isDef(goog.global.webkitURL) &&
             goog.isDef(goog.global.webkitURL.createObjectURL)) {
    return /** @type {goog.fs.UrlObject_} */ (goog.global.webkitURL);
  // This is what the spec used to say to do
  } else if (goog.isDef(goog.global.createObjectURL)) {
    return /** @type {goog.fs.UrlObject_} */ (goog.global);
  } else {
    return null;
  }
};


/**
 * Checks whether this browser supports Object Urls. If not, calls to
 * createObjectUrl and revokeObjectUrl will result in an error.
 *
 * @return {boolean} True if this browser supports Object Urls.
 */
goog.fs.browserSupportsObjectUrls = function() {
  return goog.fs.findUrlObject_() != null;
};


/**
 * Concatenates one or more values together and converts them to a Blob.
 *
 * @param {...(string|!Blob|!ArrayBuffer)} var_args The values that will make up
 *     the resulting blob.
 * @return {!Blob} The blob.
 */
goog.fs.getBlob = function(var_args) {
  var BlobBuilder = goog.global.BlobBuilder || goog.global.WebKitBlobBuilder;

  if (goog.isDef(BlobBuilder)) {
    var bb = new BlobBuilder();
    for (var i = 0; i < arguments.length; i++) {
      bb.append(arguments[i]);
    }
    return bb.getBlob();
  } else {
    return goog.fs.getBlobWithProperties(goog.array.toArray(arguments));
  }
};


/**
 * Creates a blob with the given properties.
 * See https://developer.mozilla.org/en-US/docs/Web/API/Blob for more details.
 *
 * @param {Array.<string|!Blob>} parts The values that will make up the
 *     resulting blob.
 * @param {string=} opt_type The MIME type of the Blob.
 * @param {string=} opt_endings Specifies how strings containing newlines are to
 *     be written out.
 * @return {!Blob} The blob.
 */
goog.fs.getBlobWithProperties = function(parts, opt_type, opt_endings) {
  var BlobBuilder = goog.global.BlobBuilder || goog.global.WebKitBlobBuilder;

  if (goog.isDef(BlobBuilder)) {
    var bb = new BlobBuilder();
    for (var i = 0; i < parts.length; i++) {
      bb.append(parts[i], opt_endings);
    }
    return bb.getBlob(opt_type);
  } else if (goog.isDef(goog.global.Blob)) {
    var properties = {};
    if (opt_type) {
      properties['type'] = opt_type;
    }
    if (opt_endings) {
      properties['endings'] = opt_endings;
    }
    return new Blob(parts, properties);
  } else {
    throw Error('This browser doesn\'t seem to support creating Blobs');
  }
};


/**
 * Converts a Blob or a File into a string. This should only be used when the
 * blob is known to be small.
 *
 * @param {!Blob} blob The blob to convert.
 * @param {string=} opt_encoding The name of the encoding to use.
 * @return {!goog.async.Deferred} The deferred string. If an error occurrs, the
 *     errback is called with a {@link goog.fs.Error}.
 * @deprecated Use {@link goog.fs.FileReader.readAsText} instead.
 */
goog.fs.blobToString = function(blob, opt_encoding) {
  return goog.fs.FileReader.readAsText(blob, opt_encoding);
};


/**
 * Slices the blob. The returned blob contains data from the start byte
 * (inclusive) till the end byte (exclusive). Negative indices can be used
 * to count bytes from the end of the blob (-1 == blob.size - 1). Indices
 * are always clamped to blob range. If end is omitted, all the data till
 * the end of the blob is taken.
 *
 * @param {!Blob} blob The blob to be sliced.
 * @param {number} start Index of the starting byte.
 * @param {number=} opt_end Index of the ending byte.
 * @return {Blob} The blob slice or null if not supported.
 */
goog.fs.sliceBlob = function(blob, start, opt_end) {
  if (!goog.isDef(opt_end)) {
    opt_end = blob.size;
  }
  if (blob.webkitSlice) {
    // Natively accepts negative indices, clamping to the blob range and
    // range end is optional. See http://trac.webkit.org/changeset/83873
    return blob.webkitSlice(start, opt_end);
  } else if (blob.mozSlice) {
    // Natively accepts negative indices, clamping to the blob range and
    // range end is optional. See https://developer.mozilla.org/en/DOM/Blob
    // and http://hg.mozilla.org/mozilla-central/rev/dae833f4d934
    return blob.mozSlice(start, opt_end);
  } else if (blob.slice) {
    // Old versions of Firefox and Chrome use the original specification.
    // Negative indices are not accepted, only range end is clamped and
    // range end specification is obligatory.
    // See http://www.w3.org/TR/2009/WD-FileAPI-20091117/
    if ((goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('13.0')) ||
        (goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('537.1'))) {
      if (start < 0) {
        start += blob.size;
      }
      if (start < 0) {
        start = 0;
      }
      if (opt_end < 0) {
        opt_end += blob.size;
      }
      if (opt_end < start) {
        opt_end = start;
      }
      return blob.slice(start, opt_end - start);
    }
    // IE and the latest versions of Firefox and Chrome use the new
    // specification. Natively accepts negative indices, clamping to the blob
    // range and range end is optional.
    // See http://dev.w3.org/2006/webapi/FileAPI/
    return blob.slice(start, opt_end);
  }
  return null;
};

