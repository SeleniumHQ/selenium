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

/**
 * @fileoverview Defines a WebDriver client for Safari.
 *
 *
 * __Testing Older Versions of Safari__
 *
 * To test versions of Safari prior to Safari 10.0, you must install the
 * [latest version](http://selenium-release.storage.googleapis.com/index.html)
 * of the SafariDriver browser extension; using Safari for normal browsing is
 * not recommended once the extension has been installed. You can, and should,
 * disable the extension when the browser is not being used with WebDriver.
 *
 * You must also enable the use of legacy driver using the {@link Options} class.
 *
 *     let options = new safari.Options()
 *       .useLegacyDriver(true);
 *
 *     let driver = new (require('selenium-webdriver')).Builder()
 *       .forBrowser('safari')
 *       .setSafariOptions(options)
 *       .build();
 */

'use strict';

const http = require('./http');
const io = require('./io');
const Capabilities = require('./lib/capabilities').Capabilities;
const Capability = require('./lib/capabilities').Capability;
const command = require('./lib/command');
const error = require('./lib/error');
const logging = require('./lib/logging');
const promise = require('./lib/promise');
const Session = require('./lib/session').Session;
const Symbols = require('./lib/symbols');
const webdriver = require('./lib/webdriver');
const portprober = require('./net/portprober');
const remote = require('./remote');


/**
 * @return {string} .
 * @throws {Error}
 */
function findSafariDriver() {
  let exe = io.findInPath('safaridriver', true);
  if (!exe) {
    throw Error(
      `The safaridriver executable could not be found on the current PATH.
      Please ensure you are using Safari 10.0 or above.`);
  }
  return exe;
}


/**
 * Creates {@link selenium-webdriver/remote.DriverService} instances that manage
 * a [safaridriver] server in a child process.
 *
 * [safaridriver]: https://developer.apple.com/library/prerelease/content/releasenotes/General/WhatsNewInSafari/Articles/Safari_10_0.html#//apple_ref/doc/uid/TP40014305-CH11-DontLinkElementID_28
 */
class ServiceBuilder extends remote.DriverService.Builder {
  /**
   * @param {string=} opt_exe Path to the server executable to use. If omitted,
   *     the builder will attempt to locate the safaridriver on the system PATH.
   */
  constructor(opt_exe) {
    super(opt_exe || findSafariDriver());
    this.setLoopback(true);  // Required.
  }
}


const OPTIONS_CAPABILITY_KEY = 'safari.options';
const LEGACY_DRIVER_CAPABILITY_KEY = 'useLegacyDriver';


/**
 * Configuration options specific to the {@link Driver SafariDriver}.
 */
class Options {
  constructor() {
    /** @private {Object<string, *>} */
    this.options_ = null;

    /** @private {./lib/logging.Preferences} */
    this.logPrefs_ = null;

    /** @private {?./lib/capabilities.ProxyConfig} */
    this.proxy_ = null;

    /** @private {boolean} */
    this.legacyDriver_ = false;
  }

  /**
   * Extracts the SafariDriver specific options from the given capabilities
   * object.
   * @param {!Capabilities} capabilities The capabilities object.
   * @return {!Options} The ChromeDriver options.
   */
  static fromCapabilities(capabilities) {
    var options = new Options();

    var o = capabilities.get(OPTIONS_CAPABILITY_KEY);
    if (o instanceof Options) {
      options = o;
    } else if (o) {
      options.setCleanSession(o.cleanSession);
    }

    if (capabilities.has(Capability.PROXY)) {
      options.setProxy(capabilities.get(Capability.PROXY));
    }

    if (capabilities.has(Capability.LOGGING_PREFS)) {
      options.setLoggingPrefs(capabilities.get(Capability.LOGGING_PREFS));
    }

    if (capabilities.has(LEGACY_DRIVER_CAPABILITY_KEY)) {
      options.useLegacyDriver(capabilities.get(LEGACY_DRIVER_CAPABILITY_KEY));
    }

    return options;
  }

  /**
   * Sets whether to force Safari to start with a clean session. Enabling this
   * option will cause all global browser data to be deleted.
   * @param {boolean} clean Whether to make sure the session has no cookies,
   *     cache entries, local storage, or databases.
   * @return {!Options} A self reference.
   */
  setCleanSession(clean) {
    if (!this.options_) {
      this.options_ = {};
    }
    this.options_['cleanSession'] = clean;
    return this;
  }

  /**
   * Sets whether to use the legacy driver from the Selenium project. This option
   * is disabled by default.
   *
   * @param {boolean} enable Whether to enable the legacy driver.
   * @return {!Options} A self reference.
   */
  useLegacyDriver(enable) {
    this.legacyDriver_ = enable;
    return this;
  }

  /**
   * Sets the logging preferences for the new session.
   * @param {!./lib/logging.Preferences} prefs The logging preferences.
   * @return {!Options} A self reference.
   */
  setLoggingPrefs(prefs) {
    this.logPrefs_ = prefs;
    return this;
  }

  /**
   * Sets the proxy to use.
   *
   * @param {./lib/capabilities.ProxyConfig} proxy The proxy configuration to use.
   * @return {!Options} A self reference.
   */
  setProxy(proxy) {
    this.proxy_ = proxy;
    return this;
  }

  /**
   * Converts this options instance to a {@link Capabilities} object.
   * @param {Capabilities=} opt_capabilities The capabilities to
   *     merge these options into, if any.
   * @return {!Capabilities} The capabilities.
   */
  toCapabilities(opt_capabilities) {
    var caps = opt_capabilities || Capabilities.safari();
    if (this.logPrefs_) {
      caps.set(Capability.LOGGING_PREFS, this.logPrefs_);
    }
    if (this.proxy_) {
      caps.set(Capability.PROXY, this.proxy_);
    }
    if (this.options_) {
      caps.set(OPTIONS_CAPABILITY_KEY, this);
    }
    caps.set(LEGACY_DRIVER_CAPABILITY_KEY, this.legacyDriver_);
    return caps;
  }

  /**
   * Converts this instance to its JSON wire protocol representation. Note this
   * function is an implementation detail not intended for general use.
   * @return {!Object<string, *>} The JSON wire protocol representation of this
   *     instance.
   */
  [Symbols.serialize]() {
    return this.options_ || {};
  }
}


/**
 * A WebDriver client for Safari. This class should never be instantiated
 * directly; instead, use the {@linkplain ./builder.Builder Builder}:
 *
 *     var driver = new Builder()
 *         .forBrowser('safari')
 *         .build();
 *
 */
class Driver extends webdriver.WebDriver {
  /**
   * @param {(Options|Capabilities)=} opt_config The configuration
   *     options for the new session.
   * @param {promise.ControlFlow=} opt_flow The control flow to create
   *     the driver under.
   */
  constructor(opt_config, opt_flow) {
    let caps;
    if (opt_config instanceof Options) {
      caps = opt_config.toCapabilities();
    } else {
      caps = opt_config || Capabilities.safari()
    }

    if (caps.get(LEGACY_DRIVER_CAPABILITY_KEY)) {
      throw Error(
          'The legacy SafariDriver may only be used with the Selenium ' +
          'standalone server: http://www.seleniumhq.org/download/');
    }

    let service = new ServiceBuilder().build();
    let executor = new http.Executor(
        service.start().then(url => new http.HttpClient(url)));
    let onQuit = () => service.kill();

    let driver = webdriver.WebDriver.createSession(executor, caps, opt_flow);
    super(driver.getSession(), executor, driver.controlFlow());

    /** @override */
    this.quit = () => {
      return super.quit().finally(onQuit);
    };
  }
}


// Public API


exports.Driver = Driver;
exports.Options = Options;
exports.ServiceBuilder = ServiceBuilder;
