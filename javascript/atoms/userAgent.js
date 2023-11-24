// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview Similar to goog.userAgent.isVersion, but with support for
 * getting the version information when running in a firefox extension.
 */
goog.provide('bot.userAgent');

goog.require('goog.string');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');
goog.require('goog.userAgent.product.isVersion');


/**
 * Whether the rendering engine version of the current browser is equal to or
 * greater than the given version. This implementation differs from
 * goog.userAgent.isVersion in the following ways:
 * <ol>
 * <li>in a Firefox extension, tests the engine version through the XUL version
 *     comparator service, because no window.navigator object is available
 * <li>in IE, compares the given version to the current documentMode
 * </ol>
 *
 * @param {string|number} version The version number to check.
 * @return {boolean} Whether the browser engine version is the same or higher
 *     than the given version.
 */
bot.userAgent.isEngineVersion = function (version) {
  if (goog.userAgent.IE) {
    return goog.string.compareVersions(
        /** @type {number} */(goog.userAgent.DOCUMENT_MODE), version) >= 0;
  } else {
    return goog.userAgent.isVersionOrHigher(version);
  }
};


/**
 * Whether the product version of the current browser is equal to or greater
 * than the given version. This implementation differs from
 * goog.userAgent.product.isVersion in the following ways:
 * <ol>
 * <li>in a Firefox extension, tests the product version through the XUL version
 *     comparator service, because no window.navigator object is available
 * <li>on Android, always compares to the version to the OS version
 * </ol>
 *
 * @param {string|number} version The version number to check.
 * @return {boolean} Whether the browser product version is the same or higher
 *     than the given version.
 */
bot.userAgent.isProductVersion = function (version) {
  if (goog.userAgent.product.ANDROID) {
    return goog.string.compareVersions(
      bot.userAgent.ANDROID_VERSION_, version) >= 0;
  } else {
    return goog.userAgent.product.isVersion(version);
  }
};


/**
 * Whether we are a WebExtension.
 *
 * @const
 * @type {boolean}
 */
bot.userAgent.WEBEXTENSION = (function () {
  // The content script global object is different than it's window
  // Which requires accessing the chrome and browser objects through this
  try {
    return !!((goog.global.chrome || goog.global.browser)['extension']);
  } catch (e) {
    return false;
  }
})();

/**
 * Whether we are on IOS.
 *
 * @const
 * @type {boolean}
 */
bot.userAgent.IOS = goog.userAgent.product.IPAD ||
  goog.userAgent.product.IPHONE;


/**
 * Whether we are on a mobile browser.
 *
 * @const
 * @type {boolean}
 */
bot.userAgent.MOBILE = bot.userAgent.IOS || goog.userAgent.product.ANDROID;


/**
 * Android Operating System Version.
 * @private {string}
 * @const
 */
bot.userAgent.ANDROID_VERSION_ = (function () {
  if (goog.userAgent.product.ANDROID) {
    var userAgentString = goog.userAgent.getUserAgentString();
    var match = /Android\s+([0-9\.]+)/.exec(userAgentString);
    return match ? match[1] : '0';
  } else {
    return '0';
  }
})();


/**
 * Whether the current document is IE in a documentMode older than 8.
 * @type {boolean}
 * @const
 */
bot.userAgent.IE_DOC_PRE8 = goog.userAgent.IE &&
  !goog.userAgent.isDocumentModeOrHigher(8);


/**
 * Whether the current document is IE in IE9 (or newer) standards mode.
 * @type {boolean}
 * @const
 */
bot.userAgent.IE_DOC_9 = goog.userAgent.isDocumentModeOrHigher(9);


/**
 * Whether the current document is IE in a documentMode older than 9.
 * @type {boolean}
 * @const
 */
bot.userAgent.IE_DOC_PRE9 = goog.userAgent.IE &&
  !goog.userAgent.isDocumentModeOrHigher(9);


/**
 * Whether the current document is IE in IE10 (or newer) standards mode.
 * @type {boolean}
 * @const
 */
bot.userAgent.IE_DOC_10 = goog.userAgent.isDocumentModeOrHigher(10);


/**
 * Whether the current document is IE in a documentMode older than 10.
 * @type {boolean}
 * @const
 */
bot.userAgent.IE_DOC_PRE10 = goog.userAgent.IE &&
  !goog.userAgent.isDocumentModeOrHigher(10);


/**
 * Whether the current browser is Android pre-gingerbread.
 * @type {boolean}
 * @const
 */
bot.userAgent.ANDROID_PRE_GINGERBREAD = goog.userAgent.product.ANDROID &&
  !bot.userAgent.isProductVersion(2.3);


/**
 * Whether the current browser is Android pre-icecreamsandwich
 * @type {boolean}
 * @const
 */
bot.userAgent.ANDROID_PRE_ICECREAMSANDWICH = goog.userAgent.product.ANDROID &&
  !bot.userAgent.isProductVersion(4);


/**
 * Whether the current browser is Safari 6.
 * @type {boolean}
 * @const
 */
bot.userAgent.SAFARI_6 = goog.userAgent.product.SAFARI &&
  bot.userAgent.isProductVersion(6);


/**
 * Whether the current browser is Windows Phone.
 * @type {boolean}
 * @const
 */
bot.userAgent.WINDOWS_PHONE = goog.userAgent.IE &&
  goog.userAgent.getUserAgentString().indexOf('IEMobile') != -1;
