/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Closure user agent platform detection.
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For more information on browser brand, rendering engine, or device see the
 * other sub-namespaces in goog.labs.userAgent (browser, engine, and device
 * respectively).
 */

goog.module('goog.labs.userAgent.platform');
goog.module.declareLegacyNamespace();

const googString = goog.require('goog.string.internal');
const util = goog.require('goog.labs.userAgent.util');
const {AsyncValue, Version} = goog.require('goog.labs.userAgent.highEntropy.highEntropyValue');
const {platformVersion} = goog.require('goog.labs.userAgent.highEntropy.highEntropyData');
const {useClientHints} = goog.require('goog.labs.userAgent');

/**
 * @param {boolean=} ignoreClientHintsFlag Iff truthy, the `useClientHints`
 *     function will not be called when evaluating if User-Agent Client Hints
 *     Brand data can be used. For existing labs.userAgent API surfaces with
 *     widespread use, this should be a falsy value so that usage of the Client
 *     Hints APIs can be gated behind flags / experiment rollouts.
 * @return {boolean} Whether to use navigator.userAgentData to determine
 * the current platform.
 * userAgentData.platform was enabled by default in Chrome 93:
 * https://www.chromestatus.com/feature/5733498725859328
 * TODO(user): Skip this check with FEATURESET_YEAR once userAgentData is
 * present in all major browsers (may not be until 2024).
 * See https://caniuse.com/mdn-api_navigator_useragentdata.
 */
function useUserAgentDataPlatform(ignoreClientHintsFlag = false) {
  if (util.ASSUME_CLIENT_HINTS_SUPPORT) return true;
  // High-entropy API surfaces should not be gated behind the useClientHints
  // check (as in production it is gated behind a define).
  if (!ignoreClientHintsFlag && !useClientHints()) return false;
  const userAgentData = util.getUserAgentData();
  return !!userAgentData && !!userAgentData.platform;
}

/**
 * @return {boolean} Whether the platform is Android.
 */
function isAndroid() {
  if (useUserAgentDataPlatform()) {
    return util.getUserAgentData().platform === 'Android';
  }
  return util.matchUserAgent('Android');
}

/**
 * @return {boolean} Whether the platform is iPod.
 * TODO(user): Combine iPod/iPhone detection since they may become
 * indistinguishable if we begin relying on userAgentdata in iOS.
 */
function isIpod() {
  // navigator.userAgentData is currently not supported on any iOS browser, so
  // rely only on navigator.userAgent.
  return util.matchUserAgent('iPod');
}

/**
 * @return {boolean} Whether the platform is iPhone.
 */
function isIphone() {
  // navigator.userAgentData is currently not supported on any iOS browser, so
  // rely only on navigator.userAgent.
  return util.matchUserAgent('iPhone') && !util.matchUserAgent('iPod') &&
      !util.matchUserAgent('iPad');
}

/**
 * Returns whether the platform is iPad.
 * Note that iPadOS 13+ spoofs macOS Safari by default in its user agent, and in
 * this scenario the platform will not be recognized as iPad. If you must have
 * iPad-specific behavior, use
 * {@link goog.labs.userAgent.extra.isSafariDesktopOnMobile}.
 * @return {boolean} Whether the platform is iPad.
 */
function isIpad() {
  // navigator.userAgentData is currently not supported on any iOS browser, so
  // rely only on navigator.userAgent.
  return util.matchUserAgent('iPad');
}

/**
 * Returns whether the platform is iOS.
 * Note that iPadOS 13+ spoofs macOS Safari by default in its user agent, and in
 * this scenario the platform will not be recognized as iOS. If you must have
 * iPad-specific behavior, use
 * {@link goog.labs.userAgent.extra.isSafariDesktopOnMobile}.
 * @return {boolean} Whether the platform is iOS.
 */
function isIos() {
  return isIphone() || isIpad() || isIpod();
}

/**
 * @return {boolean} Whether the platform is Mac.
 */
function isMacintosh() {
  if (useUserAgentDataPlatform()) {
    return util.getUserAgentData().platform === 'macOS';
  }
  return util.matchUserAgent('Macintosh');
}

/**
 * Note: ChromeOS is not considered to be Linux as it does not report itself
 * as Linux in the user agent string.
 * @return {boolean} Whether the platform is Linux.
 */
function isLinux() {
  if (useUserAgentDataPlatform()) {
    return util.getUserAgentData().platform === 'Linux';
  }
  return util.matchUserAgent('Linux');
}

/**
 * @return {boolean} Whether the platform is Windows.
 */
function isWindows() {
  if (useUserAgentDataPlatform()) {
    return util.getUserAgentData().platform === 'Windows';
  }
  return util.matchUserAgent('Windows');
}

/**
 * @return {boolean} Whether the platform is ChromeOS.
 */
function isChromeOS() {
  if (useUserAgentDataPlatform()) {
    return util.getUserAgentData().platform === 'Chrome OS';
  }
  return util.matchUserAgent('CrOS');
}

/**
 * @return {boolean} Whether the platform is Chromecast.
 */
function isChromecast() {
  // TODO(user): Check against util.getUserAgentData().platform once the
  // OS string for Chromecast is known.
  return util.matchUserAgent('CrKey');
}

/**
 * @return {boolean} Whether the platform is KaiOS.
 */
function isKaiOS() {
  // navigator.userAgentData is currently not supported on any KaiOS browser, so
  // rely only on navigator.userAgent.
  return util.matchUserAgentIgnoreCase('KaiOS');
}

/**
 * The version of the platform. We only determine the version for Windows,
 * Mac, and Chrome OS. It doesn't make much sense on Linux. For Windows, we only
 * look at the NT version. Non-NT-based versions (e.g. 95, 98, etc.) are given
 * version 0.0.
 *
 * @return {string} The platform version or empty string if version cannot be
 *     determined.
 */
function getVersion() {
  const userAgentString = util.getUserAgent();
  let version = '', re;
  if (isWindows()) {
    re = /Windows (?:NT|Phone) ([0-9.]+)/;
    const match = re.exec(userAgentString);
    if (match) {
      version = match[1];
    } else {
      version = '0.0';
    }
  } else if (isIos()) {
    re = /(?:iPhone|iPod|iPad|CPU)\s+OS\s+(\S+)/;
    const match = re.exec(userAgentString);
    // Report the version as x.y.z and not x_y_z
    version = match && match[1].replace(/_/g, '.');
  } else if (isMacintosh()) {
    re = /Mac OS X ([0-9_.]+)/;
    const match = re.exec(userAgentString);
    // Note: some old versions of Camino do not report an OSX version.
    // Default to 10.
    version = match ? match[1].replace(/_/g, '.') : '10';
  } else if (isKaiOS()) {
    re = /(?:KaiOS)\/(\S+)/i;
    const match = re.exec(userAgentString);
    version = match && match[1];
  } else if (isAndroid()) {
    re = /Android\s+([^\);]+)(\)|;)/;
    const match = re.exec(userAgentString);
    version = match && match[1];
  } else if (isChromeOS()) {
    re = /(?:CrOS\s+(?:i686|x86_64)\s+([0-9.]+))/;
    const match = re.exec(userAgentString);
    version = match && match[1];
  }
  return version || '';
}

/**
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the browser version is higher or the same as the
 *     given version.
 */
function isVersionOrHigher(version) {
  return googString.compareVersions(getVersion(), version) >= 0;
}

/**
 * Represents a high-entropy version string.
 * @implements {AsyncValue<!Version>}
 */
class PlatformVersion {
  constructor() {
    /** @private {boolean} */
    this.preUachHasLoaded_ = false;
  }

  /**
   * @return {!Version|undefined}
   * @override
   */
  getIfLoaded() {
    if (useUserAgentDataPlatform(true)) {
      const loadedPlatformVersion = platformVersion.getIfLoaded();
      if (loadedPlatformVersion === undefined) {
        // No platform data has been cached
        return undefined;
      }
      return new Version(loadedPlatformVersion);
    } else if (!this.preUachHasLoaded_) {
      // Nobody ever called `load` on this class instance, so we should return
      // nothing to match the semantics of the class when using the Client Hint
      // APIs.
      return undefined;
    } else {
      // `load` has been called, so we can return a Version derived from the
      // useragent string.
      return new Version(getVersion());
    }
  }

  /**
   * @return {!Promise<!Version>}
   * @override
   */
  async load() {
    if (useUserAgentDataPlatform(true)) {
      return new Version(await platformVersion.load());
    } else {
      this.preUachHasLoaded_ = true;
      return new Version(getVersion());
    }
  }

  /** @package */
  resetForTesting() {
    platformVersion.resetForTesting();
    this.preUachHasLoaded_ = false;
  }
}

/**
 * The platform version, a high-entropy value.
 * @type {!PlatformVersion}
 */
const version = new PlatformVersion();

exports = {
  getVersion,
  isAndroid,
  isChromeOS,
  isChromecast,
  isIos,
  isIpad,
  isIphone,
  isIpod,
  isKaiOS,
  isLinux,
  isMacintosh,
  isVersionOrHigher,
  isWindows,
  version,
};
