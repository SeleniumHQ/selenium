// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview tmpnetwork.js contains some temporary networking functions
 * for browserchannel which will be moved at a later date.
 */


/**
 * Namespace for BrowserChannel
 */
goog.provide('goog.net.tmpnetwork');

goog.require('goog.Uri');
goog.require('goog.net.ChannelDebug');


/**
 * Default timeout to allow for google.com pings.
 * @type {number}
 */
goog.net.tmpnetwork.GOOGLECOM_TIMEOUT = 10000;


/**
 * Pings the network to check if an error is a server error or user's network
 * error.
 *
 * @param {Function} callback The function to call back with results.
 * @param {goog.Uri?=} opt_imageUri The URI of an image to use for the network
 *     test. You *must* provide an image URI; the default behavior is provided
 *     for compatibility with existing code, but the search team does not want
 *     people using images served off of google.com for this purpose. The
 *     default will go away when all usages have been changed.
 */
goog.net.tmpnetwork.testGoogleCom = function(callback, opt_imageUri) {
  // We need to add a 'rand' to make sure the response is not fulfilled
  // by browser cache.
  var uri = opt_imageUri;
  if (!uri) {
    uri = new goog.Uri('//www.google.com/images/cleardot.gif');
    uri.makeUnique();
  }
  goog.net.tmpnetwork.testLoadImage(uri.toString(),
      goog.net.tmpnetwork.GOOGLECOM_TIMEOUT, callback);
};


/**
 * Test loading the given image, retrying if necessary.
 * @param {string} url URL to the iamge.
 * @param {number} timeout Milliseconds before giving up.
 * @param {Function} callback Function to call with results.
 * @param {number} retries The number of times to retry.
 * @param {number=} opt_pauseBetweenRetriesMS Optional number of milliseconds
 *     between retries - defaults to 0.
 */
goog.net.tmpnetwork.testLoadImageWithRetries = function(url, timeout, callback,
    retries, opt_pauseBetweenRetriesMS) {
  var channelDebug = new goog.net.ChannelDebug();
  channelDebug.debug('TestLoadImageWithRetries: ' + opt_pauseBetweenRetriesMS);
  if (retries == 0) {
    // no more retries, give up
    callback(false);
    return;
  }

  var pauseBetweenRetries = opt_pauseBetweenRetriesMS || 0;
  retries--;
  goog.net.tmpnetwork.testLoadImage(url, timeout, function(succeeded) {
    if (succeeded) {
      callback(true);
    } else {
      // try again
      goog.global.setTimeout(function() {
        goog.net.tmpnetwork.testLoadImageWithRetries(url, timeout, callback,
            retries, pauseBetweenRetries);
      }, pauseBetweenRetries);
    }
  });
};


/**
 * Test loading the given image.
 * @param {string} url URL to the iamge.
 * @param {number} timeout Milliseconds before giving up.
 * @param {Function} callback Function to call with results.
 */
goog.net.tmpnetwork.testLoadImage = function(url, timeout, callback) {
  var channelDebug = new goog.net.ChannelDebug();
  channelDebug.debug('TestLoadImage: loading ' + url);
  var img = new Image();
  img.onload = function() {
    try {
      channelDebug.debug('TestLoadImage: loaded');
      goog.net.tmpnetwork.clearImageCallbacks_(img);
      callback(true);
    } catch (e) {
      channelDebug.dumpException(e);
    }
  };
  img.onerror = function() {
    try {
      channelDebug.debug('TestLoadImage: error');
      goog.net.tmpnetwork.clearImageCallbacks_(img);
      callback(false);
    } catch (e) {
      channelDebug.dumpException(e);
    }
  };
  img.onabort = function() {
    try {
      channelDebug.debug('TestLoadImage: abort');
      goog.net.tmpnetwork.clearImageCallbacks_(img);
      callback(false);
    } catch (e) {
      channelDebug.dumpException(e);
    }
  };
  img.ontimeout = function() {
    try {
      channelDebug.debug('TestLoadImage: timeout');
      goog.net.tmpnetwork.clearImageCallbacks_(img);
      callback(false);
    } catch (e) {
      channelDebug.dumpException(e);
    }
  };

  goog.global.setTimeout(function() {
    if (img.ontimeout) {
      img.ontimeout();
    }
  }, timeout);
  img.src = url;
};


/**
 * Clear handlers to avoid memory leaks.
 * @param {Image} img The image to clear handlers from.
 * @private
 */
goog.net.tmpnetwork.clearImageCallbacks_ = function(img) {
  // NOTE(user): Nullified individually to avoid compiler warnings
  // (BUG 658126)
  img.onload = null;
  img.onerror = null;
  img.onabort = null;
  img.ontimeout = null;
};
