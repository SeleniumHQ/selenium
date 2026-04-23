/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Methods to verify IE versions.
 * TODO(johnlenz): delete this remove this file on the experiment is complete.
 */

goog.module('goog.labs.useragent.verifier');
goog.module.declareLegacyNamespace();

/** @const */
const NOT_IE = 0;

/**
 * Detect the current IE version using runtime behavior, returns 0 if a version
 * of IE is not detected.
 * @return {number}
 */
function detectIeVersionByBehavior() {
  if (document.all) {
    if (!document.compatMode) {
      return 5;
    }
    if (!window.XMLHttpRequest) {
      return 6;
    }
    if (!document.querySelector) {
      return 7;
    }
    if (!document.addEventListener) {
      return 8;
    }
    if (!window.atob) {
      return 9;
    }

    return 10;
  }
  if (!(window.ActiveXObject) && 'ActiveXObject' in window) {
    return 11;
  }

  return NOT_IE;
}

/**
 * Detect the current IE version using MSIE version presented in the user agent
 * string (This will not detected IE 11 which does not present a MSIE version),
 * or zero if IE is not detected.
 * @return {number}
 */
function detectIeVersionByNavigator() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.indexOf('msie') != -1) {
    const value = parseInt(ua.split('msie')[1], 10);
    if (typeof value == 'number' && !isNaN(value)) {
      return value;
    }
  }

  return NOT_IE;
}

/**
 * Correct the actual IE version based on the Trident version in the user agent
 * string.  This adjusts for IE's "compatiblity modes".
 * @return {number}
 */
function getCorrectedIEVersionByNavigator() {
  const ua = navigator.userAgent;
  if (/Trident/.test(ua) || /MSIE/.test(ua)) {
    return getIEVersion(ua);
  } else {
    return NOT_IE;
  }
}

/**
 * Get corrected IE version, see goog.labs.userAgent.browser.getIEVersion_
 * @param {string} userAgent the User-Agent.
 * @return {number}
 */
function getIEVersion(userAgent) {
  // IE11 may identify itself as MSIE 9.0 or MSIE 10.0 due to an IE 11 upgrade
  // bug. Example UA:
  // Mozilla/5.0 (MSIE 9.0; Windows NT 6.1; WOW64; Trident/7.0; rv:11.0)
  // like Gecko.
  const rv = /rv: *([\d\.]*)/.exec(userAgent);
  if (rv && rv[1]) {
    return Number(rv[1]);
  }

  const msie = /MSIE +([\d\.]+)/.exec(userAgent);
  if (msie && msie[1]) {
    // IE in compatibility mode usually identifies itself as MSIE 7.0; in this
    // case, use the Trident version to determine the version of IE. For more
    // details, see the links above.
    const tridentVersion = /Trident\/(\d.\d)/.exec(userAgent);
    if (msie[1] == '7.0') {
      if (tridentVersion && tridentVersion[1]) {
        switch (tridentVersion[1]) {
          case '4.0':
            return 8;
          case '5.0':
            return 9;
          case '6.0':
            return 10;
          case '7.0':
            return 11;
        }
      } else {
        return 7;
      }
    } else {
      return Number(msie[1]);
    }
  }
  return NOT_IE;
}

exports = {
  NOT_IE,
  detectIeVersionByBehavior,
  detectIeVersionByNavigator,
  getCorrectedIEVersionByNavigator,
};
