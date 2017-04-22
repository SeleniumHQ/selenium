// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

'use strict';

/**
 * @fileoverview Defines types related to describing the capabilities of a
 * WebDriver session.
 */

const Symbols = require('./symbols');


/**
 * Recognized browser names.
 * @enum {string}
 */
const Browser = {
  ANDROID: 'android',
  CHROME: 'chrome',
  EDGE: 'MicrosoftEdge',
  FIREFOX: 'firefox',
  IE: 'internet explorer',
  INTERNET_EXPLORER: 'internet explorer',
  IPAD: 'iPad',
  IPHONE: 'iPhone',
  OPERA: 'opera',
  PHANTOM_JS: 'phantomjs',
  SAFARI: 'safari',
  HTMLUNIT: 'htmlunit'
};


/**
 * Common Capability keys.
 * @enum {string}
 */
const Capability = {

  /**
   * Indicates whether a driver should accept all SSL certs by default. This
   * capability only applies when requesting a new session. To query whether
   * a driver can handle insecure SSL certs, see {@link #SECURE_SSL}.
   */
  ACCEPT_SSL_CERTS: 'acceptSslCerts',


  /**
   * The browser name. Common browser names are defined in the {@link Browser}
   * enum.
   */
  BROWSER_NAME: 'browserName',

  /**
   * Defines how elements should be scrolled into the viewport for interaction.
   * This capability will be set to zero (0) if elements are aligned with the
   * top of the viewport, or one (1) if aligned with the bottom. The default
   * behavior is to align with the top of the viewport.
   */
  ELEMENT_SCROLL_BEHAVIOR: 'elementScrollBehavior',

  /**
   * Whether the driver is capable of handling modal alerts (e.g. alert,
   * confirm, prompt). To define how a driver <i>should</i> handle alerts,
   * use {@link #UNEXPECTED_ALERT_BEHAVIOR}.
   */
  HANDLES_ALERTS: 'handlesAlerts',

  /**
   * Key for the logging driver logging preferences.
   */
  LOGGING_PREFS: 'loggingPrefs',

  /**
   * Whether this session generates native events when simulating user input.
   */
  NATIVE_EVENTS: 'nativeEvents',

  /**
   * Describes the platform the browser is running on. Will be one of
   * ANDROID, IOS, LINUX, MAC, UNIX, or WINDOWS. When <i>requesting</i> a
   * session, ANY may be used to indicate no platform preference (this is
   * semantically equivalent to omitting the platform capability).
   */
  PLATFORM: 'platform',

  /**
   * Describes the proxy configuration to use for a new WebDriver session.
   */
  PROXY: 'proxy',

  /** Whether the driver supports changing the browser's orientation. */
  ROTATABLE: 'rotatable',

  /**
   * Whether a driver is only capable of handling secure SSL certs. To request
   * that a driver accept insecure SSL certs by default, use
   * {@link #ACCEPT_SSL_CERTS}.
   */
  SECURE_SSL: 'secureSsl',

  /** Whether the driver supports manipulating the app cache. */
  SUPPORTS_APPLICATION_CACHE: 'applicationCacheEnabled',

  /** Whether the driver supports locating elements with CSS selectors. */
  SUPPORTS_CSS_SELECTORS: 'cssSelectorsEnabled',

  /** Whether the browser supports JavaScript. */
  SUPPORTS_JAVASCRIPT: 'javascriptEnabled',

  /** Whether the driver supports controlling the browser's location info. */
  SUPPORTS_LOCATION_CONTEXT: 'locationContextEnabled',

  /** Whether the driver supports taking screenshots. */
  TAKES_SCREENSHOT: 'takesScreenshot',

  /**
   * Defines how the driver should handle unexpected alerts. The value should
   * be one of "accept", "dismiss", or "ignore".
   */
  UNEXPECTED_ALERT_BEHAVIOR: 'unexpectedAlertBehaviour',

  /** Defines the browser version. */
  VERSION: 'version'
};


/**
 * Describes how a proxy should be configured for a WebDriver session.
 * @record
 */
function ProxyConfig() {}

/**
 * The proxy type. Must be one of {"manual", "pac", "system"}.
 * @type {string}
 */
ProxyConfig.prototype.proxyType;

/**
 * URL for the PAC file to use. Only used if {@link #proxyType} is "pac".
 * @type {(string|undefined)}
 */
ProxyConfig.prototype.proxyAutoconfigUrl;

/**
 * The proxy host for FTP requests. Only used if {@link #proxyType} is "manual".
 * @type {(string|undefined)}
 */
ProxyConfig.prototype.ftpProxy;

/**
 * The proxy host for HTTP requests. Only used if {@link #proxyType} is
 * "manual".
 * @type {(string|undefined)}
 */
ProxyConfig.prototype.httpProxy;

/**
 * The proxy host for HTTPS requests. Only used if {@link #proxyType} is
 * "manual".
 * @type {(string|undefined)}
 */
ProxyConfig.prototype.sslProxy;

/**
 * A comma delimited list of hosts which should bypass all proxies. Only used if
 * {@link #proxyType} is "manual".
 * @type {(string|undefined)}
 */
ProxyConfig.prototype.noProxy;


/**
 * Converts a generic hash object to a map.
 * @param {!Object<string, ?>} hash The hash object.
 * @return {!Map<string, ?>} The converted map.
 */
function toMap(hash) {
  let m = new Map;
  for (let key in hash) {
    if (hash.hasOwnProperty(key)) {
      m.set(key, hash[key]);
    }
  }
  return m;
}


/**
 * Describes a set of capabilities for a WebDriver session.
 */
class Capabilities extends Map {
  /**
   * @param {(Capabilities|Map<string, ?>|Object)=} opt_other Another set of
   *     capabilities to initialize this instance from.
   */
  constructor(opt_other) {
    if (opt_other && !(opt_other instanceof Map)) {
      opt_other = toMap(opt_other);
    }
    super(opt_other);
  }

  /**
   * @return {!Capabilities} A basic set of capabilities for Android.
   */
  static android() {
    return new Capabilities()
        .set(Capability.BROWSER_NAME, Browser.ANDROID)
        .set(Capability.PLATFORM, 'ANDROID');
  }

  /**
   * @return {!Capabilities} A basic set of capabilities for Chrome.
   */
  static chrome() {
    return new Capabilities().set(Capability.BROWSER_NAME, Browser.CHROME);
  }

  /**
   * @return {!Capabilities} A basic set of capabilities for Microsoft Edge.
   */
  static edge() {
    return new Capabilities()
        .set(Capability.BROWSER_NAME, Browser.EDGE)
        .set(Capability.PLATFORM, 'WINDOWS');
  }

  /**
   * @return {!Capabilities} A basic set of capabilities for Firefox.
   */
  static firefox() {
    return new Capabilities().set(Capability.BROWSER_NAME, Browser.FIREFOX);
  }

  /**
   * @return {!Capabilities} A basic set of capabilities for Internet Explorer.
   */
  static ie() {
    return new Capabilities().
        set(Capability.BROWSER_NAME, Browser.INTERNET_EXPLORER).
        set(Capability.PLATFORM, 'WINDOWS');
  }

  /**
   * @return {!Capabilities} A basic set of capabilities for iPad.
   */
  static ipad() {
    return new Capabilities().
        set(Capability.BROWSER_NAME, Browser.IPAD).
        set(Capability.PLATFORM, 'MAC');
  }

  /**
   * @return {!Capabilities} A basic set of capabilities for iPhone.
   */
  static iphone() {
    return new Capabilities().
        set(Capability.BROWSER_NAME, Browser.IPHONE).
        set(Capability.PLATFORM, 'MAC');
  }

  /**
   * @return {!Capabilities} A basic set of capabilities for Opera.
   */
  static opera() {
    return new Capabilities().
        set(Capability.BROWSER_NAME, Browser.OPERA);
  }

  /**
   * @return {!Capabilities} A basic set of capabilities for PhantomJS.
   */
  static phantomjs() {
    return new Capabilities().
        set(Capability.BROWSER_NAME, Browser.PHANTOM_JS);
  }

  /**
   * @return {!Capabilities} A basic set of capabilities for Safari.
   */
  static safari() {
    return new Capabilities().
        set(Capability.BROWSER_NAME, Browser.SAFARI).
        set(Capability.PLATFORM, 'MAC');
  }

  /**
   * @return {!Capabilities} A basic set of capabilities for HTMLUnit.
   */
  static htmlunit() {
    return new Capabilities().
        set(Capability.BROWSER_NAME, Browser.HTMLUNIT);
  }

  /**
   * @return {!Capabilities} A basic set of capabilities for HTMLUnit
   *     with enabled Javascript.
   */
  static htmlunitwithjs() {
    return new Capabilities().
        set(Capability.BROWSER_NAME, Browser.HTMLUNIT).
        set(Capability.SUPPORTS_JAVASCRIPT, true);
  }

  /**
   * @return {!Object<string, ?>} The JSON representation of this instance.
   *     Note, the returned object may contain nested promised values.
   * @suppress {checkTypes} Suppress [] access on a struct (state inherited from
   *     Map).
   */
  [Symbols.serialize]() {
    return serialize(this);
  }

  /**
   * Merges another set of capabilities into this instance.
   * @param {!(Capabilities|Map<String, ?>|Object<string, ?>)} other The other
   *     set of capabilities to merge.
   * @return {!Capabilities} A self reference.
   */
  merge(other) {
    if (!other) {
      throw new TypeError('no capabilities provided for merge');
    }

    if (!(other instanceof Map)) {
      other = toMap(other);
    }

    for (let key of other.keys()) {
      this.set(key, other.get(key));
    }

    return this;
  }

  /**
   * @param {string} key The capability key.
   * @param {*} value The capability value.
   * @return {!Capabilities} A self reference.
   * @throws {TypeError} If the `key` is not a string.
   * @override
   */
  set(key, value) {
    if (typeof key !== 'string') {
      throw new TypeError('Capability keys must be strings: ' + typeof key);
    }
    super.set(key, value);
    return this;
  }

  /**
   * Sets the logging preferences. Preferences may be specified as a
   * {@link ./logging.Preferences} instance, or as a map of log-type to
   * log-level.
   * @param {!(./logging.Preferences|Object<string>)} prefs The logging
   *     preferences.
   * @return {!Capabilities} A self reference.
   */
  setLoggingPrefs(prefs) {
    return this.set(Capability.LOGGING_PREFS, prefs);
  }

  /**
   * Sets the proxy configuration for this instance.
   * @param {ProxyConfig} proxy The desired proxy configuration.
   * @return {!Capabilities} A self reference.
   */
  setProxy(proxy) {
    return this.set(Capability.PROXY, proxy);
  }

  /**
   * Sets whether native events should be used.
   * @param {boolean} enabled Whether to enable native events.
   * @return {!Capabilities} A self reference.
   */
  setEnableNativeEvents(enabled) {
    return this.set(Capability.NATIVE_EVENTS, enabled);
  }

  /**
   * Sets how elements should be scrolled into view for interaction.
   * @param {number} behavior The desired scroll behavior: either 0 to align
   *     with the top of the viewport or 1 to align with the bottom.
   * @return {!Capabilities} A self reference.
   */
  setScrollBehavior(behavior) {
    return this.set(Capability.ELEMENT_SCROLL_BEHAVIOR, behavior);
  }

  /**
   * Sets the default action to take with an unexpected alert before returning
   * an error.
   * @param {string} behavior The desired behavior should be "accept",
   *     "dismiss", or "ignore". Defaults to "dismiss".
   * @return {!Capabilities} A self reference.
   */
  setAlertBehavior(behavior) {
    return this.set(Capability.UNEXPECTED_ALERT_BEHAVIOR, behavior);
  }
}


/**
 * Serializes a capabilities object. This is defined as a standalone function
 * so it may be type checked (where Capabilities[Symbols.serialize] has type
 * checking disabled since it is defined with [] access on a struct).
 *
 * @param {!Capabilities} caps The capabilities to serialize.
 * @return {!Object<string, ?>} The JSON representation of this instance.
 *     Note, the returned object may contain nested promised values.
 */
function serialize(caps) {
  let ret = {};
  for (let key of caps.keys()) {
    let cap = caps.get(key);
    if (cap !== undefined && cap !== null) {
      ret[key] = cap;
    }
  }
  return ret;
}


// PUBLIC API


module.exports = {
  Browser: Browser,
  Capabilities: Capabilities,
  Capability: Capability,
  ProxyConfig: ProxyConfig
};
