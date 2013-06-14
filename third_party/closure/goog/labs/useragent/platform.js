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
 * @fileoverview Closure user agent platform detection.
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For more information on browser brand, rendering engine, or device see the
 * other sub-namespaces in goog.labs.userAgent (browser, engine, and device
 * respectively).
 *
 */

goog.provide('goog.labs.userAgent.platform');

goog.require('goog.labs.userAgent.util');
goog.require('goog.memoize');
goog.require('goog.string');


/**
 * Returns the platform string.
 *
 * @return {string} The platform string.
 */
goog.labs.userAgent.platform.getPlatformString = goog.memoize(function() {
  return goog.global['navigator'] && goog.global['navigator'].platform ?
      goog.global['navigator'].platform : '';
});


/**
 * Returns the appVersion string.
 *
 * @return {string} The appVersion string.
 */
goog.labs.userAgent.platform.getAppVersion = goog.memoize(function() {
  return goog.global['navigator'] && goog.global['navigator'].appVersion ?
      goog.global['navigator'].appVersion : '';
});


/**
 * @param {string} str
 * @return {boolean} Whether the platform contains the given string.
 * @private
 */
goog.labs.userAgent.platform.matchPlatform_ = function(str) {
  var platformString = goog.labs.userAgent.platform.getPlatformString();
  return goog.string.contains(platformString, str);
};


/**
 * @return {boolean} Whether the platform is Android.
 */
goog.labs.userAgent.platform.isAndroid = goog.memoize(
    goog.partial(goog.labs.userAgent.util.matchUserAgent, 'Android'));


/**
 * @return {boolean} Whether the platform is iPod.
 */
goog.labs.userAgent.platform.isIpod = goog.memoize(
    goog.partial(goog.labs.userAgent.util.matchUserAgent, 'iPod'));


/**
 * @return {boolean} Whether the platform is iPhone.
 */
goog.labs.userAgent.platform.isIphone = goog.memoize(function() {
  return goog.labs.userAgent.util.matchUserAgent('iPhone') &&
      !goog.labs.userAgent.util.matchUserAgent('iPod');
});


/**
 * @return {boolean} Whether the platform is iPad.
 */
goog.labs.userAgent.platform.isIpad = goog.memoize(
    goog.partial(goog.labs.userAgent.util.matchUserAgent, 'iPad'));


/**
 * @return {boolean} Whether the platform is iOS.
 */
goog.labs.userAgent.platform.isIos = goog.memoize(function() {
  return goog.labs.userAgent.platform.isIphone() ||
      goog.labs.userAgent.platform.isIpad() ||
      goog.labs.userAgent.platform.isIpod();
});


/**
 * @return {boolean} Whether the platform is Mac.
 */
goog.labs.userAgent.platform.isMac = goog.memoize(
    goog.partial(goog.labs.userAgent.platform.matchPlatform_, 'Mac'));


/**
 * @return {boolean} Whether the platform is Linux.
 */
goog.labs.userAgent.platform.isLinux = goog.memoize(
    goog.partial(goog.labs.userAgent.platform.matchPlatform_, 'Linux'));


/**
 * @return {boolean} Whether the platform is Windows.
 */
goog.labs.userAgent.platform.isWindows = goog.memoize(
    goog.partial(goog.labs.userAgent.platform.matchPlatform_, 'Win'));


/**
 * @return {boolean} Whether the platform is X11.
 */
goog.labs.userAgent.platform.isX11 = goog.memoize(function() {
  var appVersion = goog.labs.userAgent.platform.getAppVersion();
  return goog.string.contains(appVersion, 'X11');
});


/**
 * @return {boolean} Whether the platform is ChromeOS.
 */
goog.labs.userAgent.platform.isChromeOS = goog.memoize(
    goog.partial(goog.labs.userAgent.util.matchUserAgent, 'CrOS'));


/**
 * The version of the platform. We only determine the version for Windows,
 * Mac, and Chrome OS. It doesn't make much sense on Linux. For Windows, we only
 * look at the NT version. Non-NT-based versions (e.g. 95, 98, etc.) are given
 * version 0.0.
 *
 * @return {string} The platform version or empty string if version cannot be
 *     determined.
 */
goog.labs.userAgent.platform.getVersion = function() {
  var userAgentString = goog.labs.userAgent.util.getUserAgentString();
  var version = '', re;
  if (goog.labs.userAgent.platform.isWindows()) {
    re = /Windows NT ([0-9.]+)/;
    var match = re.exec(userAgentString);
    if (match) {
      version = match[1];
    } else {
      version = '0.0';
    }
  } else if (goog.labs.userAgent.platform.isMac()) {
    re = /Mac OS X ([0-9_.]+)/;
    var match = re.exec(userAgentString);
    // Note: some old versions of Camino do not report an OSX version.
    // Default to 10.
    version = match ? match[1].replace(/_/g, '.') : '10';
  } else if (goog.labs.userAgent.platform.isAndroid()) {
    re = /Android\s+([^\);]+)(\)|;)/;
    var match = re.exec(userAgentString);
    version = match && match[1];
  } else if (goog.labs.userAgent.platform.isIos()) {
    re = /(?:iPhone|iPod|iPad|CPU)\s+OS\s+(\S+)/;
    var match = re.exec(userAgentString);
    // Report the version as x.y.z and not x_y_z
    version = match && match[1].replace(/_/g, '.');
  } else if (goog.labs.userAgent.platform.isChromeOS()) {
    re = /(?:CrOS\s+(?:i686|x86_64)\s+([0-9.]+))/;
    var match = re.exec(userAgentString);
    version = match && match[1];
  }
  return version || '';
};


/**
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the browser version is higher or the same as the
 *     given version.
 */
goog.labs.userAgent.platform.isVersionOrHigher = function(version) {
  return goog.string.compareVersions(goog.labs.userAgent.platform.getVersion(),
                                     version) >= 0;
};
