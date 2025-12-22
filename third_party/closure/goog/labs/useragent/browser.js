/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Closure user agent detection (Browser).
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For more information on rendering engine, platform, or device see the other
 * sub-namespaces in goog.labs.userAgent, goog.labs.userAgent.platform,
 * goog.labs.userAgent.device respectively.)
 */

goog.module('goog.labs.userAgent.browser');
goog.module.declareLegacyNamespace();

const util = goog.require('goog.labs.userAgent.util');
const {AsyncValue, Version} = goog.require('goog.labs.userAgent.highEntropy.highEntropyValue');
const {assert, assertExists} = goog.require('goog.asserts');
const {compareVersions} = goog.require('goog.string.internal');
const {fullVersionList} = goog.require('goog.labs.userAgent.highEntropy.highEntropyData');
const {useClientHints} = goog.require('goog.labs.userAgent');

// TODO(nnaze): Refactor to remove excessive exclusion logic in matching
// functions.

/**
 * A browser brand represents an opaque string that is used for making
 * brand-specific version checks in userAgentData.
 * @enum {string}
 */
const Brand = {
  /**
   * The browser brand for Android Browser.
   * Do not depend on the value of this string. Because Android Browser has not
   * implemented userAgentData yet, the value of this string is not guaranteed
   * to stay the same in future revisions.
   */
  ANDROID_BROWSER: 'Android Browser',
  /**
   * The browser brand for Chromium, including Chromium-based Edge and Opera.
   */
  CHROMIUM: 'Chromium',
  /**
   * The browser brand for Edge.
   * This brand can be used to get the version of both EdgeHTML and
   * Chromium-based Edge.
   */
  EDGE: 'Microsoft Edge',
  /**
   * The browser brand for Firefox.
   * Do not depend on the value of this string. Because Firefox has not
   * implemented userAgentData yet, the value of this string is not guaranteed
   * to stay the same in future revisions.
   */
  FIREFOX: 'Firefox',
  /**
   * The browser brand for Internet Explorer.
   * Do not depend on the value of this string. Because IE will never support
   * userAgentData, the value of this string should be treated as opaque (it's
   * used internally for legacy-userAgent fallback).
   */
  IE: 'Internet Explorer',
  /**
   * The browser brand for Opera.
   * This brand can be used to get the version of both Presto- and
   * Chromium-based Opera.
   */
  OPERA: 'Opera',
  /**
   * The browser brand for Safari.
   * Do not depend on the value of this string. Because Safari has not
   * implemented userAgentData yet, the value of this string is not guaranteed
   * to stay the same in future revisions.
   */
  SAFARI: 'Safari',
  /**
   * The browser brand for Silk.
   * See
   * https://docs.aws.amazon.com/silk/latest/developerguide/what-is-silk.html
   * Do not depend on the value of this string. Because Silk does not
   * identify itself in userAgentData yet, the value of this string is not
   * guaranteed to stay the same in future revisions.
   */
  SILK: 'Silk',
};
exports.Brand = Brand;

/**
 * @param {boolean=} ignoreClientHintsFlag Iff truthy, the `useClientHints`
 *     function will not be called when evaluating if User-Agent Client Hints
 *     Brand data can be used. For existing labs.userAgent API surfaces with
 *     widespread use, this should be a falsy value so that usage of the Client
 *     Hints APIs can be gated behind flags / experiment rollouts.
 * @return {boolean} Whether to use navigator.userAgentData to determine
 * browser's brand.
 */
function useUserAgentDataBrand(ignoreClientHintsFlag = false) {
  if (util.ASSUME_CLIENT_HINTS_SUPPORT) return true;
  // High-entropy API surfaces should not be gated behind the useClientHints
  // check (as in production it is gated behind a define).
  if (!ignoreClientHintsFlag && !useClientHints()) return false;
  const userAgentData = util.getUserAgentData();
  return !!userAgentData && userAgentData.brands.length > 0;
}

/**
 * @return {boolean} Whether this browser is likely to have the fullVersionList
 * high-entropy Client Hint.
 */
function hasFullVersionList() {
  // https://chromiumdash.appspot.com/commits?commit=1eb643c3057e64ff4d22468432ad16c4cab12879&platform=Linux
  // indicates that for all platforms Chromium 98 shipped this feature.
  // See also
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-CH-UA-Full-Version-List#browser_compatibility
  return isAtLeast(Brand.CHROMIUM, 98);
}

/**
 * @return {boolean} Whether the user's browser is Opera. Note: Chromium based
 *     Opera (Opera 15+) is detected as Chrome to avoid unnecessary special
 *     casing.
 */
function matchOpera() {
  if (useUserAgentDataBrand()) {
    // Pre-Chromium Edge doesn't support navigator.userAgentData.
    return false;
  }
  return util.matchUserAgent('Opera');
}

/** @return {boolean} Whether the user's browser is IE. */
function matchIE() {
  if (useUserAgentDataBrand()) {
    // IE doesn't support navigator.userAgentData.
    return false;
  }
  return util.matchUserAgent('Trident') || util.matchUserAgent('MSIE');
}

/**
 * @return {boolean} Whether the user's browser is Edge. This refers to
 *     EdgeHTML based Edge.
 */
function matchEdgeHtml() {
  if (useUserAgentDataBrand()) {
    // Pre-Chromium Edge doesn't support navigator.userAgentData.
    return false;
  }
  return util.matchUserAgent('Edge');
}

/** @return {boolean} Whether the user's browser is Chromium based Edge. */
function matchEdgeChromium() {
  if (useUserAgentDataBrand()) {
    return util.matchUserAgentDataBrand(Brand.EDGE);
  }
  return util.matchUserAgent('Edg/');
}

/** @return {boolean} Whether the user's browser is Chromium based Opera. */
function matchOperaChromium() {
  if (useUserAgentDataBrand()) {
    return util.matchUserAgentDataBrand(Brand.OPERA);
  }
  return util.matchUserAgent('OPR');
}

/** @return {boolean} Whether the user's browser is Firefox. */
function matchFirefox() {
  // Firefox doesn't support navigator.userAgentData yet, so use
  // navigator.userAgent.
  return util.matchUserAgent('Firefox') || util.matchUserAgent('FxiOS');
}

/** @return {boolean} Whether the user's browser is Safari. */
function matchSafari() {
  // Apple-based browsers don't support navigator.userAgentData yet, so use
  // navigator.userAgent.
  return util.matchUserAgent('Safari') &&
      !(matchChrome() || matchCoast() || matchOpera() || matchEdgeHtml() ||
        matchEdgeChromium() || matchOperaChromium() || matchFirefox() ||
        isSilk() || util.matchUserAgent('Android'));
}

/**
 * @return {boolean} Whether the user's browser is Coast (Opera's Webkit-based
 *     iOS browser).
 */
function matchCoast() {
  if (useUserAgentDataBrand()) {
    // Coast doesn't support navigator.userAgentData.
    return false;
  }
  return util.matchUserAgent('Coast');
}

/** @return {boolean} Whether the user's browser is iOS Webview. */
function matchIosWebview() {
  // Apple-based browsers don't support navigator.userAgentData yet, so use
  // navigator.userAgent.
  // iOS Webview does not show up as Chrome or Safari.
  return (util.matchUserAgent('iPad') || util.matchUserAgent('iPhone')) &&
      !matchSafari() && !matchChrome() && !matchCoast() && !matchFirefox() &&
      util.matchUserAgent('AppleWebKit');
}

/**
 * @return {boolean} Whether the user's browser is any Chromium browser. This
 *     returns true for Chrome, Opera 15+, and Edge Chromium.
 */
function matchChrome() {
  if (useUserAgentDataBrand()) {
    return util.matchUserAgentDataBrand(Brand.CHROMIUM);
  }
  return ((util.matchUserAgent('Chrome') || util.matchUserAgent('CriOS')) &&
          !matchEdgeHtml()) ||
      isSilk();
}

/** @return {boolean} Whether the user's browser is the Android browser. */
function matchAndroidBrowser() {
  // Android can appear in the user agent string for Chrome on Android.
  // This is not the Android standalone browser if it does.
  return util.matchUserAgent('Android') &&
      !(isChrome() || isFirefox() || isOpera() || isSilk());
}

/** @return {boolean} Whether the user's browser is Opera. */
const isOpera = matchOpera;
exports.isOpera = isOpera;

/** @return {boolean} Whether the user's browser is IE. */
const isIE = matchIE;
exports.isIE = isIE;

/** @return {boolean} Whether the user's browser is EdgeHTML based Edge. */
const isEdge = matchEdgeHtml;
exports.isEdge = isEdge;

/** @return {boolean} Whether the user's browser is Chromium based Edge. */
const isEdgeChromium = matchEdgeChromium;
exports.isEdgeChromium = isEdgeChromium;

/** @return {boolean} Whether the user's browser is Chromium based Opera. */
const isOperaChromium = matchOperaChromium;
exports.isOperaChromium = isOperaChromium;

/** @return {boolean} Whether the user's browser is Firefox. */
const isFirefox = matchFirefox;
exports.isFirefox = isFirefox;

/** @return {boolean} Whether the user's browser is Safari. */
const isSafari = matchSafari;
exports.isSafari = isSafari;

/**
 * @return {boolean} Whether the user's browser is Coast (Opera's Webkit-based
 *     iOS browser).
 */
const isCoast = matchCoast;
exports.isCoast = isCoast;

/** @return {boolean} Whether the user's browser is iOS Webview. */
const isIosWebview = matchIosWebview;
exports.isIosWebview = isIosWebview;

/**
 * @return {boolean} Whether the user's browser is any Chromium based browser (
 *     Chrome, Blink-based Opera (15+) and Edge Chromium).
 */
const isChrome = matchChrome;
exports.isChrome = isChrome;

/** @return {boolean} Whether the user's browser is the Android browser. */
const isAndroidBrowser = matchAndroidBrowser;
exports.isAndroidBrowser = isAndroidBrowser;

/**
 * For more information, see:
 * http://docs.aws.amazon.com/silk/latest/developerguide/user-agent.html
 * @return {boolean} Whether the user's browser is Silk.
 */
function isSilk() {
  // As of Silk 93, Silk does not identify itself in userAgentData.brands.
  // When Silk changes this behavior, update this method to call
  // matchUserAgentDataBrand (akin to isChrome, etc.)
  return util.matchUserAgent('Silk');
}
exports.isSilk = isSilk;

/**
 * A helper function that returns a function mapping a list of candidate
 * version tuple keys to the first version string present under a key.
 * Ex:
 * <code>
 * // Arg extracted from "Foo/1.2.3 Bar/0.2021"
 * const mapVersion = createVersionMap([["Foo", "1.2.3"], ["Bar", "0.2021"]]);
 * mapVersion(["Bar", "Foo"]); // returns "0.2021"
 * mapVersion(["Baz", "Foo"]); // returns "1.2.3"
 * mapVersion(["Baz", "???"]); // returns ""
 * </code>
 * @param {!Array<!Array<string>>} versionTuples Version tuples pre-extracted
 *     from a user agent string.
 * @return {function(!Array<string>): string} The version string, or empty
 * string if it doesn't exist under the given key.
 */
function createVersionMap(versionTuples) {
  // Construct a map for easy lookup.
  const versionMap = {};
  versionTuples.forEach((tuple) => {
    // Note that the tuple is of length three, but we only care about the
    // first two.
    const key = tuple[0];
    const value = tuple[1];
    versionMap[key] = value;
  });

  // Gives the value with the first key it finds, otherwise empty string.
  return (keys) => versionMap[keys.find((key) => key in versionMap)] || '';
}

/**
 * Returns the browser version.
 *
 * Note that for browsers with multiple brands, this function assumes a primary
 * brand and returns the version for that brand.
 *
 * Additionally, this function is not userAgentData-aware and will return
 * incorrect values when the User Agent string is frozen. The current status of
 * User Agent string freezing is available here:
 * https://www.chromestatus.com/feature/5704553745874944
 *
 * To mitigate both of these potential issues, use
 * getVersionStringForLogging() or fullVersionOf() instead.
 *
 * @return {string} The browser version or empty string if version cannot be
 *     determined. Note that for Internet Explorer, this returns the version of
 *     the browser, not the version of the rendering engine. (IE 8 in
 *     compatibility mode will return 8.0 rather than 7.0. To determine the
 *     rendering engine version, look at document.documentMode instead. See
 *     http://msdn.microsoft.com/en-us/library/cc196988(v=vs.85).aspx for more
 *     details.)
 */
function getVersion() {
  const userAgentString = util.getUserAgent();

  // Special case IE since IE's version is inside the parenthesis and
  // without the '/'.
  if (isIE()) {
    return getIEVersion(userAgentString);
  }

  const versionTuples = util.extractVersionTuples(userAgentString);
  const lookUpValueWithKeys = createVersionMap(versionTuples);

  // Check Opera before Chrome since Opera 15+ has "Chrome" in the string.
  // See
  // http://my.opera.com/ODIN/blog/2013/07/15/opera-user-agent-strings-opera-15-and-beyond
  if (isOpera()) {
    // Opera 10 has Version/10.0 but Opera/9.8, so look for "Version" first.
    // Opera uses 'OPR' for more recent UAs.
    return lookUpValueWithKeys(['Version', 'Opera']);
  }

  // Check Edge before Chrome since it has Chrome in the string.
  if (isEdge()) {
    return lookUpValueWithKeys(['Edge']);
  }

  // Check Chromium Edge before Chrome since it has Chrome in the string.
  if (isEdgeChromium()) {
    return lookUpValueWithKeys(['Edg']);
  }

  // Check Silk before Chrome since it may have Chrome in its string and be
  // treated as Chrome.
  if (isSilk()) {
    return lookUpValueWithKeys(['Silk']);
  }

  if (isChrome()) {
    return lookUpValueWithKeys(['Chrome', 'CriOS', 'HeadlessChrome']);
  }

  // Usually products browser versions are in the third tuple after "Mozilla"
  // and the engine.
  const tuple = versionTuples[2];
  return tuple && tuple[1] || '';
}
exports.getVersion = getVersion;

/**
 * Returns whether the current browser's version is at least as high as the
 * given one.
 *
 * Note that for browsers with multiple brands, this function assumes a primary
 * brand and checks the version for that brand.
 *
 * Additionally, this function is not userAgentData-aware and will return
 * incorrect values when the User Agent string is frozen. The current status of
 * User Agent string freezing is available here:
 * https://www.chromestatus.com/feature/5704553745874944
 *
 * To mitigate both of these potential issues, use isAtLeast()/isAtMost() or
 * fullVersionOf() instead.
 *
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the browser version is higher or the same as the
 *     given version.
 * @deprecated Use isAtLeast()/isAtMost() instead.
 */
function isVersionOrHigher(version) {
  return compareVersions(getVersion(), version) >= 0;
}
exports.isVersionOrHigher = isVersionOrHigher;

/**
 * A helper function to determine IE version. More information:
 * http://msdn.microsoft.com/en-us/library/ie/bg182625(v=vs.85).aspx#uaString
 * http://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
 * http://blogs.msdn.com/b/ie/archive/2010/03/23/introducing-ie9-s-user-agent-string.aspx
 * http://blogs.msdn.com/b/ie/archive/2009/01/09/the-internet-explorer-8-user-agent-string-updated-edition.aspx
 * @param {string} userAgent the User-Agent.
 * @return {string}
 */
function getIEVersion(userAgent) {
  // IE11 may identify itself as MSIE 9.0 or MSIE 10.0 due to an IE 11 upgrade
  // bug. Example UA:
  // Mozilla/5.0 (MSIE 9.0; Windows NT 6.1; WOW64; Trident/7.0; rv:11.0)
  // like Gecko.
  // See http://www.whatismybrowser.com/developers/unknown-user-agent-fragments.
  const rv = /rv: *([\d\.]*)/.exec(userAgent);
  if (rv && rv[1]) {
    return rv[1];
  }

  let version = '';
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
}

/**
 * A helper function to return the navigator.userAgent-supplied full version
 * number of the current browser or an empty string, based on whether the
 * current browser is the one specified.
 * @param {string} browser The brand whose version should be returned.
 * @return {string}
 */
function getFullVersionFromUserAgentString(browser) {
  const userAgentString = util.getUserAgent();
  // Special case IE since IE's version is inside the parenthesis and
  // without the '/'.
  if (browser === Brand.IE) {
    return isIE() ? getIEVersion(userAgentString) : '';
  }

  const versionTuples = util.extractVersionTuples(userAgentString);
  const lookUpValueWithKeys = createVersionMap(versionTuples);
  switch (browser) {
    case Brand.OPERA:
      // Opera 10 has Version/10.0 but Opera/9.8, so look for "Version"
      // first. Opera uses 'OPR' for more recent UAs.
      if (isOpera()) {
        return lookUpValueWithKeys(['Version', 'Opera']);
      } else if (isOperaChromium()) {
        return lookUpValueWithKeys(['OPR']);
      }
      break;
    case Brand.EDGE:
      if (isEdge()) {
        return lookUpValueWithKeys(['Edge']);
      } else if (isEdgeChromium()) {
        return lookUpValueWithKeys(['Edg']);
      }
      break;
    case Brand.CHROMIUM:
      if (isChrome()) {
        return lookUpValueWithKeys(['Chrome', 'CriOS', 'HeadlessChrome']);
      }
      break;
  }

  // For the following browsers, the browser version is in the third tuple after
  // "Mozilla" and the engine.
  if ((browser === Brand.FIREFOX && isFirefox()) ||
      (browser === Brand.SAFARI && isSafari()) ||
      (browser === Brand.ANDROID_BROWSER && isAndroidBrowser()) ||
      (browser === Brand.SILK && isSilk())) {
    const tuple = versionTuples[2];
    return tuple && tuple[1] || '';
  }

  return '';
}

/**
 * Returns the major version of the given browser brand, or NaN if the current
 * browser is not the given brand.
 * Note that the major version number may be different depending on which
 * browser is specified. The returned value can be used to make browser version
 * comparisons using comparison operators.
 * @private
 * @param {!Brand} browser The brand whose version should be returned.
 * @return {number} The major version number associated with the current
 * browser under the given brand, or NaN if the current browser doesn't match
 * the given brand.
 */
function versionOf_(browser) {
  let versionParts;
  // Silk currently does not identify itself in its userAgentData.brands array,
  // so if checking its version, always fall back to the user agent string.
  if (useUserAgentDataBrand() && browser !== Brand.SILK) {
    const data = util.getUserAgentData();
    const matchingBrand = data.brands.find(({brand}) => brand === browser);
    if (!matchingBrand || !matchingBrand.version) {
      return NaN;
    }
    versionParts = matchingBrand.version.split('.');
  } else {
    const fullVersion = getFullVersionFromUserAgentString(browser);
    if (fullVersion === '') {
      return NaN;
    }
    versionParts = fullVersion.split('.');
  }
  if (versionParts.length === 0) {
    return NaN;
  }
  const majorVersion = versionParts[0];
  return Number(majorVersion);  // Returns NaN if it is not parseable.
}

/**
 * Returns true if the current browser matches the given brand and is at least
 * the given major version. The major version must be a whole number (i.e.
 * decimals should not be used to represent a minor version).
 * @param {!Brand} brand The brand whose version should be returned.
 * @param {number} majorVersion The major version number to compare against.
 *     This must be a whole number.
 * @return {boolean} Whether the current browser both matches the given brand
 *     and is at least the given version.
 */
function isAtLeast(brand, majorVersion) {
  assert(
      Math.floor(majorVersion) === majorVersion,
      'Major version must be an integer');
  return versionOf_(brand) >= majorVersion;
}
exports.isAtLeast = isAtLeast;

/**
 * Returns true if the current browser matches the given brand and is at most
 * the given version. The major version must be a whole number (i.e. decimals
 * should not be used to represent a minor version).
 * @param {!Brand} brand The brand whose version should be returned.
 * @param {number} majorVersion The major version number to compare against.
 *     This must be a whole number.
 * @return {boolean} Whether the current browser both matches the given brand
 *     and is at most the given version.
 */
function isAtMost(brand, majorVersion) {
  assert(
      Math.floor(majorVersion) === majorVersion,
      'Major version must be an integer');
  return versionOf_(brand) <= majorVersion;
}
exports.isAtMost = isAtMost;

/**
 * Loads the high-entropy browser brand/version data and wraps the correct
 * version string in a Version object.
 * @implements {AsyncValue<!Version>}
 */
class HighEntropyBrandVersion {
  /**
   * @param {string} brand The brand whose version is retrieved in this
   *     container.
   * @param {boolean} useUach Whether to attempt to use the User-Agent Client
   *     Hints (UACH) API surface.
   * @param {string} fallbackVersion The fallback version derived from the
   *     userAgent string.
   */
  constructor(brand, useUach, fallbackVersion) {
    /** @private @const {string} */
    this.brand_ = brand;

    /** @private @const {!Version} */
    this.version_ = new Version(fallbackVersion);

    /** @private @const {boolean} */
    this.useUach_ = useUach;
  }

  /**
   * @return {!Version|undefined}
   * @override
   */
  getIfLoaded() {
    if (this.useUach_) {
      const loadedVersionList = fullVersionList.getIfLoaded();
      if (loadedVersionList !== undefined) {
        const matchingBrand =
            loadedVersionList.find(({brand}) => this.brand_ === brand);
        // We assumed in fullVersionOf that if the fullVersionList is defined
        // the brands must match. Double-check this here.
        assertExists(matchingBrand);
        return new Version(matchingBrand.version);
      }
      // Fallthrough to fallback on Pre-UACH implementation
    }
    // We want to make sure the loading semantics of the Pre-UACH implementation
    // match those of the UACH implementation. Loading must happen before any
    // data can be retrieved from getIfLoaded.
    // For HighEntropyBrandVersion, loading can either be done by calling #load
    // or by calling the module-local loadFullVersions function.
    if (preUachHasLoaded) {
      return this.version_;
    }
    return;
  }

  /**
   * @return {!Promise<!Version>}
   * @override
   */
  async load() {
    if (this.useUach_) {
      const loadedVersionList = await fullVersionList.load();
      if (loadedVersionList !== undefined) {
        const matchingBrand =
            loadedVersionList.find(({brand}) => this.brand_ === brand);
        assertExists(matchingBrand);
        return new Version(matchingBrand.version);
      }
      // Fallthrough to fallback on Pre-UACH implementation
    } else {
      // Await something so that calling load with or without UACH API
      // availability results in waiting at least one macrotask before allowing
      // access to the cached version information.
      await 0;
    }
    // Regardless of whether we are using UACH APIs, we can now allow access to
    // the fallback case
    preUachHasLoaded = true;
    return this.version_;
  }
}

/**
 * Whether full version data should be considered available when using UACH
 * fallback implementations. This is flipped to true when either
 * loadFullVersions or HighEntropyBrandVersion.prototype.load are called,
 * matching the global singleton semantics of the UACH codepaths.
 */
let preUachHasLoaded = false;

/**
 * Requests all full browser versions to be cached.  When the returned promise
 * resolves, subsequent calls to `fullVersionOf(...).getIfLoaded()` will return
 * a value.
 *
 * This method should be avoided in favor of directly awaiting
 * `fullVersionOf(...).load()` where it is used.
 *
 * @return {!Promise<void>}
 */
async function loadFullVersions() {
  if (useUserAgentDataBrand(true)) {
    await fullVersionList.load();
  }
  preUachHasLoaded = true;
}
exports.loadFullVersions = loadFullVersions;

/**
 * Resets module-local caches used by functionality in this module.
 * This is only for use by goog.labs.userAgent.testUtil.resetUserAgent (and
 * labs.userAgent tests).
 * @package
 */
exports.resetForTesting = () => {
  preUachHasLoaded = false;
  fullVersionList.resetForTesting();
};


/**
 * Returns an object that provides access to the full version string of the
 * current browser -- or undefined, based on whether the current browser matches
 * the requested browser brand. Note that the full version string is a
 * high-entropy value, and must be asynchronously loaded before it can be
 * accessed synchronously.
 * @param {!Brand} browser The brand whose version should be returned.
 * @return {!AsyncValue<!Version>|undefined} An object that can be used
 *     to get or load the full version string as a high-entropy value, or
 * undefined if the current browser doesn't match the given brand.
 */
function fullVersionOf(browser) {
  let fallbackVersionString = '';
  // If we are reasonably certain now that the browser we are on has the
  // fullVersionList high-entropy hint, then we can skip computing the fallback
  // value as we won't end up using it.
  if (!hasFullVersionList()) {
    fallbackVersionString = getFullVersionFromUserAgentString(browser);
  }
  // Silk has the UACH API surface, but currently does not identify itself in
  // the userAgentData.brands array. Fallback to using userAgent string version
  // for Silk.
  const useUach = browser !== Brand.SILK && useUserAgentDataBrand(true);
  if (useUach) {
    const data = util.getUserAgentData();
    // Operate under the assumption that the low-entropy and high-entropy lists
    // of brand/version pairs contain an identical set of brands. Therefore, if
    // the low-entropy list doesn't contain the given brand, return undefined.
    if (!data.brands.find(({brand}) => brand === browser)) {
      return undefined;
    }
  } else if (fallbackVersionString === '') {
    return undefined;
  }
  return new HighEntropyBrandVersion(browser, useUach, fallbackVersionString);
}
exports.fullVersionOf = fullVersionOf;


/**
 * Returns a version string for the current browser or undefined, based on
 * whether the current browser is the one specified.
 * This value should ONLY be used for logging/debugging purposes. Do not use it
 * to branch code paths. For comparing versions, use isAtLeast()/isAtMost() or
 * fullVersionOf() instead.
 * @param {!Brand} browser The brand whose version should be returned.
 * @return {string} The version as a string.
 */
function getVersionStringForLogging(browser) {
  if (useUserAgentDataBrand(true)) {
    const fullVersionObj = fullVersionOf(browser);
    if (fullVersionObj) {
      const fullVersion = fullVersionObj.getIfLoaded();
      if (fullVersion) {
        return fullVersion.toVersionStringForLogging();
      }
      // No full version, return the major version instead.
      const data = util.getUserAgentData();
      const matchingBrand = data.brands.find(({brand}) => brand === browser);
      // Checking for the existence of matchingBrand is not necessary because
      // the existence of fullVersionObj implies that there is already a
      // matching brand.
      assertExists(matchingBrand);
      return matchingBrand.version;
    }
    // If fullVersionObj is undefined, this doesn't mean that the full version
    // is unavailable, but rather that the current browser doesn't match the
    // input `browser` argument.
    return '';
  } else {
    return getFullVersionFromUserAgentString(browser);
  }
}
exports.getVersionStringForLogging = getVersionStringForLogging;
