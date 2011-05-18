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
 * @fileoverview Functions for understanding the version of the browser.
 * This is pulled out of product.js to ensure that only builds that need
 * this functionality actually get it, without having to rely on the compiler
 * to strip out unneeded pieces.
 */
goog.provide('goog.userAgent.product.isVersion');
goog.require('goog.userAgent.product');


/**
 * @return {string} The string that describes the version number of the user
 *     agent product.
 * @private
 */
goog.userAgent.product.determineVersion_ = function() {
  // All browsers have different ways to detect the version and they all have
  // different naming schemes.

  // version is a string rather than a number because it may contain 'b', 'a',
  // and so on.
  var version = '', re, combine;

  if (goog.userAgent.product.FIREFOX) {
    // Firefox/2.0.0.1 or Firefox/3.5.3
    re = /Firefox\/([0-9.]+)/;
  } else if (goog.userAgent.product.IE || goog.userAgent.product.OPERA) {
    return goog.userAgent.VERSION;
  } else if (goog.userAgent.product.CHROME) {
    // Chrome/4.0.223.1
    re = /Chrome\/([0-9.]+)/;
  } else if (goog.userAgent.product.SAFARI) {
    // Version/5.0.3
    //
    // NOTE: Before version 3, Safari did not report a product version number.
    // The product version number for these browsers will be the empty string.
    // They may be differentiated by WebKit version number in goog.userAgent.
    re = /Version\/([0-9.]+)/;
  } else if (goog.userAgent.product.IPHONE || goog.userAgent.product.IPAD) {
    // Mozilla/5.0 (iPod; U; CPU like Mac OS X; en) AppleWebKit/420.1
    // (KHTML, like Gecko) Version/3.0 Mobile/3A100a Safari/419.3
    // Version is the browser version, Mobile is the build number. We combine
    // the version string with the build number: 3.0.3A100a for the example.
    re = /Version\/(\S+).*Mobile\/(\S+)/;
    combine = true;
  } else if (goog.userAgent.product.ANDROID) {
    // Mozilla/5.0 (Linux; U; Android 0.5; en-us) AppleWebKit/522+
    // (KHTML, like Gecko) Safari/419.3
    //
    // Mozilla/5.0 (Linux; U; Android 1.0; en-us; dream) AppleWebKit/525.10+
    // (KHTML, like Gecko) Version/3.0.4 Mobile Safari/523.12.2
    //
    // Prefer Version number if present, else make do with the OS number
    re = /Android\s+([0-9.]+)(?:.*Version\/([0-9.]+))?/;
  } else if (goog.userAgent.product.CAMINO) {
    re = /Camino\/([0-9.]+)/;
  }
  if (re) {
    var arr = re.exec(goog.userAgent.getUserAgentString());
    if (arr) {
      version = combine ? arr[1] + '.' + arr[2] : (arr[2] || arr[1]);
    } else {
      version = '';
    }
  }
  return version;
};


/**
 * The version of the user agent. This is a string because it might contain
 * 'b' (as in beta) as well as multiple dots.
 * @type {string}
 */
goog.userAgent.product.VERSION = goog.userAgent.product.determineVersion_();


/**
 * Whether the user agent product version is higher or the same as the given
 * version.
 *
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the user agent product version is higher or the
 *     same as the given version.
 */
goog.userAgent.product.isVersion = function(version) {
  return goog.string.compareVersions(
      goog.userAgent.product.VERSION, version) >= 0;
};
