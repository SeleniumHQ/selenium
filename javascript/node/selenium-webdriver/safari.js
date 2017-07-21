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
 */

'use strict';

const http = require('./http');
const io = require('./io');
const {Capabilities, Capability} = require('./lib/capabilities');
const command = require('./lib/command');
const error = require('./lib/error');
const logging = require('./lib/logging');
const promise = require('./lib/promise');
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
const TECHNOLOGY_PREVIEW_OPTIONS_KEY = 'technologyPreview';

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
  }

  /**
   * Extracts the SafariDriver specific options from the given capabilities
   * object.
   * @param {!Capabilities} capabilities The capabilities object.
   * @return {!Options} The SafariDriver options.
   */
  static fromCapabilities(capabilities) {
    var options = new Options();
    var o = capabilities.get(OPTIONS_CAPABILITY_KEY);

    if (o instanceof Options) {
      options = o;
    } else if (o) {
      options.setCleanSession(o.cleanSession);
      options.setTechnologyPreview(o[TECHNOLOGY_PREVIEW_OPTIONS_KEY]);
    }

    if (capabilities.has(Capability.PROXY)) {
      options.setProxy(capabilities.get(Capability.PROXY));
    }

    if (capabilities.has(Capability.LOGGING_PREFS)) {
      options.setLoggingPrefs(capabilities.get(Capability.LOGGING_PREFS));
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
   * Instruct the SafariDriver to use the Safari Technology Preview if true.
   * Otherwise, use the release version of Safari. Defaults to using the release version of Safari.
   *
   * @param {boolean} useTechnologyPreview
   * @return {!Options} A self reference.
   */
  setTechnologyPreview(useTechnologyPreview) {
    if (!this.options_) {
      this.options_ = {};
    }

    this.options_[TECHNOLOGY_PREVIEW_OPTIONS_KEY] = !!useTechnologyPreview;
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
 * @param  {(Options|Object<string, *>)=} o The options object
 * @return {boolean}
 */
function useTechnologyPreview(o) {
  if (o instanceof Options) {
    return !!(o.options_ && o.options_[TECHNOLOGY_PREVIEW_OPTIONS_KEY]);
  }

  if (o && typeof o === 'object') {
    return !!o[TECHNOLOGY_PREVIEW_OPTIONS_KEY];
  }

  return false;
}

const SAFARIDRIVER_TECHNOLOGY_PREVIEW_EXE = '/Applications/Safari Technology Preview.app/Contents/MacOS/safaridriver';

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
   * Creates a new Safari session.
   *
   * @param {(Options|Capabilities)=} opt_config The configuration
   *     options for the new session.
   * @param {promise.ControlFlow=} opt_flow The control flow to create
   *     the driver under.
   * @return {!Driver} A new driver instance.
   */
  static createSession(opt_config, opt_flow) {
    let caps, exe;

    if (opt_config instanceof Options) {
      caps = opt_config.toCapabilities();
    } else {
      caps = opt_config || Capabilities.safari();
    }

    if (useTechnologyPreview(caps.get(OPTIONS_CAPABILITY_KEY))) {
      exe = SAFARIDRIVER_TECHNOLOGY_PREVIEW_EXE;
    }

    let service = new ServiceBuilder(exe).build();
    let executor = new http.Executor(
        service.start().then(url => new http.HttpClient(url)));

    return /** @type {!Driver} */(super.createSession(
        executor, caps, opt_flow, () => service.kill()));
  }
}


// Public API


exports.Driver = Driver;
exports.Options = Options;
exports.ServiceBuilder = ServiceBuilder;
