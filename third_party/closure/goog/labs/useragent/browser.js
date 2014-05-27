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

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.labs.userAgent.util');
goog.require('goog.string');


/**
 * @return {boolean} Whether the user's browser is Opera.
 * @private
 */
goog.labs.userAgent.browser.matchOpera_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Opera') ||
      goog.labs.userAgent.util.matchUserAgent('OPR');
};


/**
 * @return {boolean} Whether the user's browser is IE.
 * @private
 */
goog.labs.userAgent.browser.matchIE_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Trident') ||
      goog.labs.userAgent.util.matchUserAgent('MSIE');
};


/**
 * @return {boolean} Whether the user's browser is Firefox.
 * @private
 */
goog.labs.userAgent.browser.matchFirefox_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Firefox');
};


/**
 * @return {boolean} Whether the user's browser is Safari.
 * @private
 */
goog.labs.userAgent.browser.matchSafari_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Safari') &&
      !goog.labs.userAgent.util.matchUserAgent('Chrome') &&
      !goog.labs.userAgent.util.matchUserAgent('CriOS') &&
      !goog.labs.userAgent.util.matchUserAgent('Android');
};


/**
 * @return {boolean} Whether the user's browser is Chrome.
 * @private
 */
goog.labs.userAgent.browser.matchChrome_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Chrome') ||
      goog.labs.userAgent.util.matchUserAgent('CriOS');
};


/**
 * @return {boolean} Whether the user's browser is the Android browser.
 * @private
 */
goog.labs.userAgent.browser.matchAndroidBrowser_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Android') &&
      !goog.labs.userAgent.util.matchUserAgent('Chrome') &&
      !goog.labs.userAgent.util.matchUserAgent('CriOS');
};


/**
 * @return {boolean} Whether the user's browser is Opera.
 */
goog.labs.userAgent.browser.isOpera = goog.labs.userAgent.browser.matchOpera_;


/**
 * @return {boolean} Whether the user's browser is IE.
 */
goog.labs.userAgent.browser.isIE = goog.labs.userAgent.browser.matchIE_;


/**
 * @return {boolean} Whether the user's browser is Firefox.
 */
goog.labs.userAgent.browser.isFirefox =
    goog.labs.userAgent.browser.matchFirefox_;


/**
 * @return {boolean} Whether the user's browser is Safari.
 */
goog.labs.userAgent.browser.isSafari =
    goog.labs.userAgent.browser.matchSafari_;


/**
 * @return {boolean} Whether the user's browser is Chrome.
 */
goog.labs.userAgent.browser.isChrome =
    goog.labs.userAgent.browser.matchChrome_;


/**
 * @return {boolean} Whether the user's browser is the Android browser.
 */
goog.labs.userAgent.browser.isAndroidBrowser =
    goog.labs.userAgent.browser.matchAndroidBrowser_;


/**
 * For more information, see:
 * http://docs.aws.amazon.com/silk/latest/developerguide/user-agent.html
 * @return {boolean} Whether the user's browser is Silk.
 */
goog.labs.userAgent.browser.isSilk = function() {
  return goog.labs.userAgent.util.matchUserAgent('Silk');
};


/**
 * @return {string} The browser version or empty string if version cannot be
 *     determined. Note that for Internet Explorer, this returns the version of
 *     the browser, not the version of the rendering engine. (IE 8 in
 *     compatibility mode will return 8.0 rather than 7.0. To determine the
 *     rendering engine version, look at document.documentMode instead. See
 *     http://msdn.microsoft.com/en-us/library/cc196988(v=vs.85).aspx for more
 *     details.)
 */
goog.labs.userAgent.browser.getVersion = function() {
  var userAgentString = goog.labs.userAgent.util.getUserAgent();
  // Special case IE since IE's version is inside the parenthesis and
  // without the '/'.
  if (goog.labs.userAgent.browser.isIE()) {
    return goog.labs.userAgent.browser.getIEVersion_(userAgentString);
  }

  if (goog.labs.userAgent.browser.isOpera()) {
    return goog.labs.userAgent.browser.getOperaVersion_(userAgentString);
  }

  var versionTuples =
      goog.labs.userAgent.util.extractVersionTuples(userAgentString);
  return goog.labs.userAgent.browser.getVersionFromTuples_(versionTuples);
};


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
 * http://msdn.microsoft.com/en-us/library/ie/bg182625(v=vs.85).aspx#uaString
 * http://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
 * http://blogs.msdn.com/b/ie/archive/2010/03/23/introducing-ie9-s-user-agent-string.aspx
 * http://blogs.msdn.com/b/ie/archive/2009/01/09/the-internet-explorer-8-user-agent-string-updated-edition.aspx
 *
 * @param {string} userAgent the User-Agent.
 * @return {string}
 * @private
 */
goog.labs.userAgent.browser.getIEVersion_ = function(userAgent) {
  // IE11 may identify itself as MSIE 9.0 or MSIE 10.0 due to an IE 11 upgrade
  // bug. Example UA:
  // Mozilla/5.0 (MSIE 9.0; Windows NT 6.1; WOW64; Trident/7.0; rv:11.0)
  // like Gecko.
  // See http://www.whatismybrowser.com/developers/unknown-user-agent-fragments.
  var rv = /rv: *([\d\.]*)/.exec(userAgent);
  if (rv && rv[1]) {
    return rv[1];
  }

  var version = '';
  var msie = /MSIE +([\d\.]+)/.exec(userAgent);
  if (msie && msie[1]) {
    // IE in compatibility mode usually identifies itself as MSIE 7.0; in this
    // case, use the Trident version to determine the version of IE. For more
    // details, see the links above.
    var tridentVersion = /Trident\/(\d.\d)/.exec(userAgent);
    if (msie[1] == '7.0') {
      if (tridentVersion && tridentVersion[1]) {
        switch (tridentVersion[1]) {
          case '4.0':
            version = '8.0';
            break;
          case '5.0':
            version = '9.0';
            break;
          case '6.0':
            version = '10.0';
            break;
          case '7.0':
            version = '11.0';
            break;
        }
      } else {
        version = '7.0';
      }
    } else {
      version = msie[1];
    }
  }
  return version;
};


/**
 * Determines Opera version. More information:
 * http://my.opera.com/ODIN/blog/2013/07/15/opera-user-agent-strings-opera-15-and-beyond
 *
 * @param {string} userAgent The User-Agent.
 * @return {string}
 * @private
 */
goog.labs.userAgent.browser.getOperaVersion_ = function(userAgent) {
  var versionTuples =
      goog.labs.userAgent.util.extractVersionTuples(userAgent);
  var lastTuple = goog.array.peek(versionTuples);
  if (lastTuple[0] == 'OPR' && lastTuple[1]) {
    return lastTuple[1];
  }

  return goog.labs.userAgent.browser.getVersionFromTuples_(versionTuples);
};


/**
 * Nearly all User-Agents start with Mozilla/N.0. This looks at the second tuple
 * for the actual browser version number.
 * @param {!Array.<!Array.<string>>} versionTuples
 * @return {string} The version or empty string if it cannot be determined.
 * @private
 */
goog.labs.userAgent.browser.getVersionFromTuples_ = function(versionTuples) {
  // versionTuples[2] (The first X/Y tuple after the parenthesis) contains the
  // browser version number.
  goog.asserts.assert(versionTuples.length > 2,
      'Couldn\'t extract version tuple from user agent string');
  return versionTuples[2] && versionTuples[2][1] ? versionTuples[2][1] : '';
};
