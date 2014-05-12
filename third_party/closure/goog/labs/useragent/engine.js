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
 * @fileoverview Closure user agent detection.
 * @see http://en.wikipedia.org/wiki/User_agent
 * For more information on browser brand, platform, or device see the other
 * sub-namespaces in goog.labs.userAgent (browser, platform, and device).
 *
 */

goog.provide('goog.labs.userAgent.engine');

goog.require('goog.array');
goog.require('goog.labs.userAgent.util');
goog.require('goog.memoize');
goog.require('goog.string');


/**
 * Returns the user agent string.
 *
 * @return {?string} The user agent string.
 */
goog.labs.userAgent.engine.getUserAgentString = goog.memoize(function() {
  return goog.global['navigator'] ? goog.global['navigator'].userAgent : null;
});


/**
 * @param {string} str
 * @return {boolean} Whether the user agent contains the given string.
 * @private
 */
goog.labs.userAgent.engine.matchUserAgent_ = function(str) {
  var userAgentString = goog.labs.userAgent.engine.getUserAgentString();
  return Boolean(userAgentString && goog.string.contains(userAgentString, str));
};


/**
 * @return {boolean} Whether the rendering engine is Presto.
 */
goog.labs.userAgent.engine.isPresto = goog.memoize(
    goog.partial(goog.labs.userAgent.engine.matchUserAgent_, 'Presto'));


/**
 * @return {boolean} Whether the rendering engine is Trident.
 */
goog.labs.userAgent.engine.isTrident = goog.memoize(
    goog.partial(goog.labs.userAgent.engine.matchUserAgent_, 'Trident'));


/**
 * @return {boolean} Whether the rendering engine is WebKit.
 */
goog.labs.userAgent.engine.isWebKit = goog.memoize(
    goog.partial(goog.labs.userAgent.engine.matchUserAgent_, 'WebKit'));


/**
 * @return {boolean} Whether the rendering engine is Gecko.
 */
goog.labs.userAgent.engine.isGecko = goog.memoize(
    goog.partial(goog.labs.userAgent.engine.matchUserAgent_, 'Gecko'));


/**
 * @return {string} The rendering engine's version or empty string if version
 *     can't be determined.
 */
goog.labs.userAgent.engine.getVersion = goog.memoize(function() {
  var userAgentString = goog.labs.userAgent.engine.getUserAgentString();

  if (userAgentString) {
    var tuples = goog.labs.userAgent.util.extractVersionTuples(userAgentString);

    var engineTuple = tuples[1];
    if (engineTuple) {
      // In Gecko, the version string is either in the browser info or the
      // Firefox version.  See Gecko user agent string reference:
      // http://goo.gl/mULqa
      if (engineTuple[0] == 'Gecko') {
        return goog.labs.userAgent.engine.getVersionForKey_(tuples, 'Firefox');
      }

      return engineTuple[1];
    }

    // IE has only one version identifier, and the Trident version is
    // specified in the parenthetical.
    var browserTuple = tuples[0];
    var info;
    if (browserTuple && (info = browserTuple[2])) {
      var match = /Trident\/([^\s;]+)/.exec(info);
      if (match) {
        return match[1];
      }
    }

    return '';
  }
});


/**
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the rendering engine version is higher or the same
 *     as the given version.
 */
goog.labs.userAgent.engine.isVersionOrHigher = function(version) {
  return goog.string.compareVersions(goog.labs.userAgent.engine.getVersion(),
                                     version) >= 0;
};


/**
 * @param {!Array.<string>} tuples Version tuples.
 * @param {string} key The key to look for.
 * @return {string} The version string of the given key, if present.
 *     Otherwise, the empty string.
 * @private
 */
goog.labs.userAgent.engine.getVersionForKey_ = function(tuples, key) {
  // TODO(nnaze): Move to util if useful elsewhere.

  var pair = goog.array.find(tuples, function(pair) {
    return key == pair[0];
  });

  return pair && pair[1] || '';
};
