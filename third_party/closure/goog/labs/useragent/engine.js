/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Closure user agent detection.
 * @see http://en.wikipedia.org/wiki/User_agent
 * For more information on browser brand, platform, or device see the other
 * sub-namespaces in goog.labs.userAgent (browser, platform, and device).
 */

goog.module('goog.labs.userAgent.engine');
goog.module.declareLegacyNamespace();

const googArray = goog.require('goog.array');
const googString = goog.require('goog.string.internal');
const util = goog.require('goog.labs.userAgent.util');

/**
 * @return {boolean} Whether the rendering engine is Presto.
 */
function isPresto() {
  return util.matchUserAgent('Presto');
}

/**
 * @return {boolean} Whether the rendering engine is Trident.
 */
function isTrident() {
  // IE only started including the Trident token in IE8.
  return util.matchUserAgent('Trident') || util.matchUserAgent('MSIE');
}

/**
 * @return {boolean} Whether the rendering engine is EdgeHTML.
 */
function isEdge() {
  return util.matchUserAgent('Edge');
}

/**
 * @return {boolean} Whether the rendering engine is WebKit. This will return
 * true for Chrome, Blink-based Opera (15+), Edge Chromium and Safari.
 */
function isWebKit() {
  return util.matchUserAgentIgnoreCase('WebKit') && !isEdge();
}

/**
 * @return {boolean} Whether the rendering engine is Gecko.
 */
function isGecko() {
  return util.matchUserAgent('Gecko') && !isWebKit() && !isTrident() &&
      !isEdge();
}

/**
 * @return {string} The rendering engine's version or empty string if version
 *     can't be determined.
 */
function getVersion() {
  const userAgentString = util.getUserAgent();
  if (userAgentString) {
    const tuples = util.extractVersionTuples(userAgentString);

    const engineTuple = getEngineTuple(tuples);
    if (engineTuple) {
      // In Gecko, the version string is either in the browser info or the
      // Firefox version.  See Gecko user agent string reference:
      // http://goo.gl/mULqa
      if (engineTuple[0] == 'Gecko') {
        return getVersionForKey(tuples, 'Firefox');
      }

      return engineTuple[1];
    }

    // MSIE has only one version identifier, and the Trident version is
    // specified in the parenthetical. IE Edge is covered in the engine tuple
    // detection.
    const browserTuple = tuples[0];
    let info;
    if (browserTuple && (info = browserTuple[2])) {
      const match = /Trident\/([^\s;]+)/.exec(info);
      if (match) {
        return match[1];
      }
    }
  }
  return '';
}

/**
 * @param {!Array<!Array<string>>} tuples Extracted version tuples.
 * @return {!Array<string>|undefined} The engine tuple or undefined if not
 *     found.
 */
function getEngineTuple(tuples) {
  if (!isEdge()) {
    return tuples[1];
  }
  for (let i = 0; i < tuples.length; i++) {
    const tuple = tuples[i];
    if (tuple[0] == 'Edge') {
      return tuple;
    }
  }
}

/**
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the rendering engine version is higher or the same
 *     as the given version.
 */
function isVersionOrHigher(version) {
  return googString.compareVersions(getVersion(), version) >= 0;
}

/**
 * @param {!Array<!Array<string>>} tuples Version tuples.
 * @param {string} key The key to look for.
 * @return {string} The version string of the given key, if present.
 *     Otherwise, the empty string.
 */
function getVersionForKey(tuples, key) {
  // TODO(nnaze): Move to util if useful elsewhere.

  const pair = googArray.find(tuples, function(pair) {
    return key == pair[0];
  });

  return pair && pair[1] || '';
}

exports = {
  getVersion,
  isEdge,
  isGecko,
  isPresto,
  isTrident,
  isVersionOrHigher,
  isWebKit,
};
