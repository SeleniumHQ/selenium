/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utilities used by goog.labs.userAgent tools. These functions
 * should not be used outside of goog.labs.userAgent.*.
 *
 */

goog.module('goog.labs.userAgent.util');
goog.module.declareLegacyNamespace();

const {caseInsensitiveContains, contains} = goog.require('goog.string.internal');
const {useClientHints} = goog.require('goog.labs.userAgent');

/**
 * @const {boolean} If true, use navigator.userAgentData without check.
 * TODO(user): FEATURESET_YEAR >= 2024 if it supports mobile and all the
 * brands we need.  See https://caniuse.com/mdn-api_navigator_useragentdata.
 */
const ASSUME_CLIENT_HINTS_SUPPORT = false;

/**
 * Gets the native userAgent string from navigator if it exists.
 * If navigator or navigator.userAgent string is missing, returns an empty
 * string.
 * @return {string}
 */
function getNativeUserAgentString() {
  const navigator = getNavigator();
  if (navigator) {
    const userAgent = navigator.userAgent;
    if (userAgent) {
      return userAgent;
    }
  }
  return '';
}

/**
 * Gets the native userAgentData object from navigator if it exists.
 * If navigator.userAgentData object is missing returns null.
 * @return {?NavigatorUAData}
 */
function getNativeUserAgentData() {
  const navigator = getNavigator();
  // TODO(user): Use navigator?.userAgent ?? null once it's supported.
  if (navigator) {
    return navigator.userAgentData || null;
  }
  return null;
}

/**
 * Getter for the native navigator.
 * @return {!Navigator}
 */
function getNavigator() {
  return goog.global.navigator;
}

/**
 * A possible override for applications which wish to not check
 * navigator.userAgent but use a specified value for detection instead.
 * @type {?string}
 */
let userAgentInternal = null;

/**
 * A possible override for applications which wish to not check
 * navigator.userAgentData but use a specified value for detection instead.
 * @type {?NavigatorUAData}
 */
let userAgentDataInternal = getNativeUserAgentData();

/**
 * Override the user agent string with the given value.
 * This should only be used for testing within the goog.labs.userAgent
 * namespace.
 * Pass `null` to use the native browser object instead.
 * @param {?string=} userAgent The userAgent override.
 * @return {void}
 */
function setUserAgent(userAgent = undefined) {
  userAgentInternal =
      typeof userAgent === 'string' ? userAgent : getNativeUserAgentString();
}

/** @return {string} The user agent string. */
function getUserAgent() {
  return userAgentInternal == null ? getNativeUserAgentString() :
                                     userAgentInternal;
}

/**
 * Override the user agent data object with the given value.
 * This should only be used for testing within the goog.labs.userAgent
 * namespace.
 * Pass `null` to specify the absence of userAgentData. Note that this behavior
 * is different from setUserAgent.
 * @param {?NavigatorUAData} userAgentData The userAgentData override.
 */
function setUserAgentData(userAgentData) {
  userAgentDataInternal = userAgentData;
}

/**
 * If the user agent data object was overridden using setUserAgentData,
 * reset it so that it uses the native browser object instead, if it exists.
 */
function resetUserAgentData() {
  userAgentDataInternal = getNativeUserAgentData();
}

/** @return {?NavigatorUAData} Navigator.userAgentData if exist */
function getUserAgentData() {
  return userAgentDataInternal;
}

/**
 * Checks if any string in userAgentData.brands matches str.
 * Returns false if userAgentData is not supported.
 * @param {string} str
 * @return {boolean} Whether any brand string from userAgentData contains the
 *     given string.
 */
function matchUserAgentDataBrand(str) {
  if (!useClientHints()) return false;
  const data = getUserAgentData();
  if (!data) return false;
  return data.brands.some(({brand}) => brand && contains(brand, str));
}

/**
 * @param {string} str
 * @return {boolean} Whether the user agent contains the given string.
 */
function matchUserAgent(str) {
  const userAgent = getUserAgent();
  return contains(userAgent, str);
}

/**
 * @param {string} str
 * @return {boolean} Whether the user agent contains the given string, ignoring
 *     case.
 */
function matchUserAgentIgnoreCase(str) {
  const userAgent = getUserAgent();
  return caseInsensitiveContains(userAgent, str);
}

/**
 * Parses the user agent into tuples for each section.
 * @param {string} userAgent
 * @return {!Array<!Array<string>>} Tuples of key, version, and the contents of
 *     the parenthetical.
 */
function extractVersionTuples(userAgent) {
  // Matches each section of a user agent string.
  // Example UA:
  // Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us)
  // AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405
  // This has three version tuples: Mozilla, AppleWebKit, and Mobile.

  const versionRegExp = new RegExp(
      // Key. Note that a key may have a space.
      // (i.e. 'Mobile Safari' in 'Mobile Safari/5.0')
      '([A-Z][\\w ]+)' +

          '/' +                // slash
          '([^\\s]+)' +        // version (i.e. '5.0b')
          '\\s*' +             // whitespace
          '(?:\\((.*?)\\))?',  // parenthetical info. parentheses not matched.
      'g');

  const data = [];
  let match;

  // Iterate and collect the version tuples.  Each iteration will be the
  // next regex match.
  while (match = versionRegExp.exec(userAgent)) {
    data.push([
      match[1],  // key
      match[2],  // value
      // || undefined as this is not undefined in IE7 and IE8
      match[3] || undefined  // info
    ]);
  }

  return data;
}

exports = {
  ASSUME_CLIENT_HINTS_SUPPORT,
  extractVersionTuples,
  getNativeUserAgentString,
  getUserAgent,
  getUserAgentData,
  matchUserAgent,
  matchUserAgentDataBrand,
  matchUserAgentIgnoreCase,
  resetUserAgentData,
  setUserAgent,
  setUserAgentData,
};
