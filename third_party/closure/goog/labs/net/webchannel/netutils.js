// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utility functions for managing networking, such as
 * testing network connectivity.
 *
 * @visibility {:internal}
 */


goog.provide('goog.labs.net.webChannel.netUtils');

goog.require('goog.Uri');
goog.require('goog.labs.net.webChannel.WebChannelDebug');

goog.scope(function() {
var netUtils = goog.labs.net.webChannel.netUtils;
var WebChannelDebug = goog.labs.net.webChannel.WebChannelDebug;


/**
 * Default timeout to allow for URI pings.
 * @type {number}
 */
netUtils.NETWORK_TIMEOUT = 10000;


/**
 * Pings the network with an image URI to check if an error is a server error
 * or user's network error.
 *
 * The caller needs to add a 'rand' parameter to make sure the response is
 * not fulfilled by browser cache.
 *
 * @param {function(boolean)} callback The function to call back with results.
 * @param {goog.Uri=} opt_imageUri The URI (of an image) to use for the network
 *     test.
 */
netUtils.testNetwork = function(callback, opt_imageUri) {
  var uri = opt_imageUri;
  if (!uri) {
    // default google.com image
    uri = new goog.Uri('//www.google.com/images/cleardot.gif');

    if (!(goog.global.location && goog.global.location.protocol == 'http')) {
      uri.setScheme('https');  // e.g. chrome-extension
    }
    uri.makeUnique();
  }

  netUtils.testLoadImage(uri.toString(), netUtils.NETWORK_TIMEOUT, callback);
};


/**
 * Test loading the given image, retrying if necessary.
 * @param {string} url URL to the image.
 * @param {number} timeout Milliseconds before giving up.
 * @param {function(boolean)} callback Function to call with results.
 * @param {number} retries The number of times to retry.
 * @param {number=} opt_pauseBetweenRetriesMS Optional number of milliseconds
 *     between retries - defaults to 0.
 */
netUtils.testLoadImageWithRetries = function(
    url, timeout, callback, retries, opt_pauseBetweenRetriesMS) {
  var channelDebug = new WebChannelDebug();
  channelDebug.debug('TestLoadImageWithRetries: ' + opt_pauseBetweenRetriesMS);
  if (retries == 0) {
    // no more retries, give up
    callback(false);
    return;
  }

  var pauseBetweenRetries = opt_pauseBetweenRetriesMS || 0;
  retries--;
  netUtils.testLoadImage(url, timeout, function(succeeded) {
    if (succeeded) {
      callback(true);
    } else {
      // try again
      goog.global.setTimeout(function() {
        netUtils.testLoadImageWithRetries(
            url, timeout, callback, retries, pauseBetweenRetries);
      }, pauseBetweenRetries);
    }
  });
};


/**
 * Test loading the given image.
 * @param {string} url URL to the image.
 * @param {number} timeout Milliseconds before giving up.
 * @param {function(boolean)} callback Function to call with results.
 */
netUtils.testLoadImage = function(url, timeout, callback) {
  var channelDebug = new WebChannelDebug();
  channelDebug.debug('TestLoadImage: loading ' + url);
  var img = new Image();
  img.onload = goog.partial(
      netUtils.imageCallback_, channelDebug, img, 'TestLoadImage: loaded', true,
      callback);
  img.onerror = goog.partial(
      netUtils.imageCallback_, channelDebug, img, 'TestLoadImage: error', false,
      callback);
  img.onabort = goog.partial(
      netUtils.imageCallback_, channelDebug, img, 'TestLoadImage: abort', false,
      callback);
  img.ontimeout = goog.partial(
      netUtils.imageCallback_, channelDebug, img, 'TestLoadImage: timeout',
      false, callback);

  goog.global.setTimeout(function() {
    if (img.ontimeout) {
      img.ontimeout();
    }
  }, timeout);
  img.src = url;
};


/**
 * Wrap the image callback with debug and cleanup logic.
 * @param {!WebChannelDebug} channelDebug The WebChannelDebug object.
 * @param {!Image} img The image element.
 * @param {string} debugText The debug text.
 * @param {boolean} result The result of image loading.
 * @param {function(boolean)} callback The image callback.
 * @private
 */
netUtils.imageCallback_ = function(
    channelDebug, img, debugText, result, callback) {
  try {
    channelDebug.debug(debugText);
    netUtils.clearImageCallbacks_(img);
    callback(result);
  } catch (e) {
    channelDebug.dumpException(e);
  }
};


/**
 * Clears handlers to avoid memory leaks.
 * @param {Image} img The image to clear handlers from.
 * @private
 */
netUtils.clearImageCallbacks_ = function(img) {
  img.onload = null;
  img.onerror = null;
  img.onabort = null;
  img.ontimeout = null;
};
});  // goog.scope
