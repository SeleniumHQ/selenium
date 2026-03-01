/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utilities for getting details about the user's platform.
 */

goog.provide('goog.userAgent.platform');

goog.require('goog.string');
goog.require('goog.userAgent');


/**
 * Detects the version of the OS/platform the browser is running in. Not
 * supported for Linux, where an empty string is returned.
 *
 * @private
 * @return {string} The platform version.
 */
goog.userAgent.platform.determineVersion_ = function() {
  'use strict';
  var re;
  if (goog.userAgent.WINDOWS) {
    re = /Windows NT ([0-9.]+)/;
    var match = re.exec(goog.userAgent.getUserAgentString());
    if (match) {
      return match[1];
    } else {
      return '0';
    }
  } else if (goog.userAgent.MAC) {
    re = /1[0|1][_.][0-9_.]+/;
    var match = re.exec(goog.userAgent.getUserAgentString());
    // Note: some old versions of Camino do not report an OSX version.
    // Default to 10.
    return match ? match[0].replace(/_/g, '.') : '10';
  } else if (goog.userAgent.ANDROID) {
    re = /Android\s+([^\);]+)(\)|;)/;
    var match = re.exec(goog.userAgent.getUserAgentString());
    return match ? match[1] : '';
  } else if (
      goog.userAgent.IPHONE || goog.userAgent.IPAD || goog.userAgent.IPOD) {
    re = /(?:iPhone|CPU)\s+OS\s+(\S+)/;
    var match = re.exec(goog.userAgent.getUserAgentString());
    // Report the version as x.y.z and not x_y_z
    return match ? match[1].replace(/_/g, '.') : '';
  }

  return '';
};


/**
 * The version of the platform. We don't determine the version of Linux.
 * For Windows, we only look at the NT version. Non-NT-based versions
 * (e.g. 95, 98, etc.) are given version 0.0.
 * @type {string}
 */
goog.userAgent.platform.VERSION = goog.userAgent.platform.determineVersion_();


/**
 * Whether the user agent platform version is higher or the same as the given
 * version.
 *
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the user agent platform version is higher or the
 *     same as the given version.
 */
goog.userAgent.platform.isVersion = function(version) {
  'use strict';
  return goog.string.compareVersions(
             goog.userAgent.platform.VERSION, version) >= 0;
};
