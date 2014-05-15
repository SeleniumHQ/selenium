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
 * @fileoverview Closure user agent detection (Browser).
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For more information on rendering engine, platform, or device see the other
 * sub-namespaces in goog.labs.userAgent, goog.labs.userAgent.platform,
 * goog.labs.userAgent.device respectively.)
 *
 */

goog.provide('goog.labs.userAgent.browser');

goog.require('goog.asserts');
goog.require('goog.labs.userAgent.util');
goog.require('goog.memoize');
goog.require('goog.string');


/**
 * @return {boolean} Whether the user's browser is Opera.
 * @private
 */
goog.labs.userAgent.browser.matchOpera_ = goog.memoize(
    goog.partial(goog.labs.userAgent.util.matchUserAgent, 'Opera'));


/**
 * @return {boolean} Whether the user's browser is IE.
 * @private
 */
goog.labs.userAgent.browser.matchIE_ = goog.memoize(
    goog.partial(goog.labs.userAgent.util.matchUserAgent, 'IE'));


/**
 * @return {boolean} Whether the user's browser is Firefox.
 * @private
 */
goog.labs.userAgent.browser.matchFirefox_ = goog.memoize(function() {
  return goog.labs.userAgent.util.matchUserAgent('Firefox');
});


/**
 * @return {boolean} Whether the user's browser is Safari.
 * @private
 */
goog.labs.userAgent.browser.matchSafari_ = goog.memoize(function() {
  return goog.labs.userAgent.util.matchUserAgent('Safari') &&
      !goog.labs.userAgent.util.matchUserAgent('Chrome') &&
      !goog.labs.userAgent.util.matchUserAgent('CriOS') &&
      !goog.labs.userAgent.util.matchUserAgent('Android');
});


/**
 * @return {boolean} Whether the user's browser is Chrome.
 * @private
 */
goog.labs.userAgent.browser.matchChrome_ = goog.memoize(function() {
  return goog.labs.userAgent.util.matchUserAgent('Chrome') ||
      goog.labs.userAgent.util.matchUserAgent('CriOS');
});


/**
 * @return {boolean} Whether the user's browser is the Android browser.
 * @private
 */
goog.labs.userAgent.browser.matchAndroidBrowser_ = goog.memoize(function() {
  return goog.labs.userAgent.util.matchUserAgent('Android') &&
      !goog.labs.userAgent.util.matchUserAgent('Chrome') &&
      !goog.labs.userAgent.util.matchUserAgent('CriOS');
});


/**
 * @return {boolean} Whether the user's browser is Opera.
 */
goog.labs.userAgent.browser.isOpera =
    goog.memoize(goog.labs.userAgent.browser.matchOpera_);


/**
 * @return {boolean} Whether the user's browser is IE.
 */
goog.labs.userAgent.browser.isIE =
    goog.memoize(goog.labs.userAgent.browser.matchIE_);


/**
 * @return {boolean} Whether the user's browser is Firefox.
 */
goog.labs.userAgent.browser.isFirefox =
    goog.memoize(goog.labs.userAgent.browser.matchFirefox_);


/**
 * @return {boolean} Whether the user's browser is Safari.
 */
goog.labs.userAgent.browser.isSafari =
    goog.memoize(goog.labs.userAgent.browser.matchSafari_);


/**
 * @return {boolean} Whether the user's browser is Chrome.
 */
goog.labs.userAgent.browser.isChrome =
    goog.memoize(goog.labs.userAgent.browser.matchChrome_);


/**
 * @return {boolean} Whether the user's browser is the Android browser.
 */
goog.labs.userAgent.browser.isAndroidBrowser =
    goog.memoize(goog.labs.userAgent.browser.matchAndroidBrowser_);


/**
 * @return {string} The browser version or empty string if version cannot be
 *     determined.
 */
goog.labs.userAgent.browser.getVersion = goog.memoize(function() {
  var userAgentString = goog.labs.userAgent.util.getUserAgentString();
  // Special case IE since IE's version is inside the parenthesis and without
  // the '/'.
  if (goog.labs.userAgent.browser.isIE()) {
    return goog.labs.userAgent.browser.getIEVersion_();
  }

  var versionTuples =
      goog.labs.userAgent.util.extractVersionTuples(userAgentString);
  // tuples[2] (The first X/Y tuple after the parenthesis) contains the browser
  // version number.
  // TODO (vbhasin): Make this check more robust.
  goog.asserts.assert(versionTuples.length > 2,
                      'Couldn\'t extract version tuple from user agent string');
  return goog.isDef(versionTuples[2][1]) ? versionTuples[2][1] : '';
});


/**
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the browser version is higher or the same as the
 *     given version.
 */
goog.labs.userAgent.browser.isVersionOrHigher = function(version) {
  return goog.string.compareVersions(goog.labs.userAgent.browser.getVersion(),
                                     version) >= 0;
};


/**
 * Determines IE version. More information:
 * http://msdn.microsoft.com/en-us/library/jj676915(v=vs.85).aspx
 *
 * @return {string}
 * @private
 */
goog.labs.userAgent.browser.getIEVersion_ = goog.memoize(function() {
  var gDoc = goog.global['document'];
  var version;
  var userAgentString = goog.labs.userAgent.util.getUserAgentString();

  if (gDoc && gDoc.documentMode) {
    version = gDoc.documentMode;
  } else if (gDoc && gDoc.compatMode && gDoc.compatMode == 'CSS1Compat') {
    version = 7;
  } else {
    var arr = /IE\s+([^\);]+)(?:\)|;)/.exec(userAgentString);
    version = arr && arr[1] ? arr[1] : '';
  }
  return version;
});
