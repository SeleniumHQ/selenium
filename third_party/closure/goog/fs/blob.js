/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Wrappers for the HTML5 File API. These wrappers closely mirror
 * the underlying APIs, but use Closure-style events and Deferred return values.
 * Their existence also makes it possible to mock the FileSystem API for testing
 * in browsers that don't support it natively.
 *
 * When adding public functions to anything under this namespace, be sure to add
 * its mock counterpart to goog.testing.fs.
 */

goog.provide('goog.fs.blob');



/**
 * Concatenates one or more values together and converts them to a Blob.
 *
 * @param {...(string|!Blob|!ArrayBuffer)} var_args The values that will make up
 *     the resulting blob.
 * @return {!Blob} The blob.
 */
goog.fs.blob.getBlob = function(var_args) {
  'use strict';
  const BlobBuilder = goog.global.BlobBuilder || goog.global.WebKitBlobBuilder;

  if (BlobBuilder !== undefined) {
    const bb = new BlobBuilder();
    for (let i = 0; i < arguments.length; i++) {
      bb.append(arguments[i]);
    }
    return bb.getBlob();
  } else {
    return goog.fs.blob.getBlobWithProperties(
        Array.prototype.slice.call(arguments));
  }
};


/**
 * Creates a blob with the given properties.
 * See https://developer.mozilla.org/en-US/docs/Web/API/Blob for more details.
 *
 * @param {!Array<string|!Blob|!ArrayBuffer>} parts The values that will make up
 *     the resulting blob (subset supported by both BlobBuilder.append() and
 *     Blob constructor).
 * @param {string=} opt_type The MIME type of the Blob.
 * @param {string=} opt_endings Specifies how strings containing newlines are to
 *     be written out.
 * @return {!Blob} The blob.
 */
goog.fs.blob.getBlobWithProperties = function(parts, opt_type, opt_endings) {
  'use strict';
  const BlobBuilder = goog.global.BlobBuilder || goog.global.WebKitBlobBuilder;

  if (BlobBuilder !== undefined) {
    const bb = new BlobBuilder();
    for (let i = 0; i < parts.length; i++) {
      bb.append(parts[i], opt_endings);
    }
    return bb.getBlob(opt_type);
  } else if (goog.global.Blob !== undefined) {
    const properties = {};
    if (opt_type) {
      properties['type'] = opt_type;
    }
    if (opt_endings) {
      properties['endings'] = opt_endings;
    }
    return new Blob(parts, properties);
  } else {
    throw new Error('This browser doesn\'t seem to support creating Blobs');
  }
};
