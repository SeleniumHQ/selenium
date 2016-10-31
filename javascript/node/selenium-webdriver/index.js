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
 * @fileoverview The main user facing module. Exports WebDriver's primary
 * public API and provides convenience assessors to certain sub-modules.
 */

'use strict';

const chrome = require('./chrome');
const edge = require('./edge');
const firefox = require('./firefox');
const _http = require('./http');
const ie = require('./ie');
const actions = require('./lib/actions');
const by = require('./lib/by');
const capabilities = require('./lib/capabilities');
const command = require('./lib/command');
const error = require('./lib/error');
const events = require('./lib/events');
const input = require('./lib/input');
const logging = require('./lib/logging');
const promise = require('./lib/promise');
const session = require('./lib/session');
const until = require('./lib/until');
const webdriver = require('./lib/webdriver');
const opera = require('./opera');
const phantomjs = require('./phantomjs');
const remote = require('./remote');
const safari = require('./safari');

const Browser = capabilities.Browser;
const Capabilities = capabilities.Capabilities;
const Capability = capabilities.Capability;
const Session = session.Session;
const WebDriver = webdriver.WebDriver;



var seleniumServer;

/**
 * Starts an instance of the Selenium server if not yet running.
 * @param {string} jar Path to the server jar to use.
 * @return {!Promise<string>} A promise for the server's
 *     addrss once started.
 */
function startSeleniumServer(jar) {
  if (!seleniumServer) {
    seleniumServer = new remote.SeleniumServer(jar);
  }
  return seleniumServer.start();
}


/**
 * {@linkplain webdriver.WebDriver#setFileDetector WebDriver's setFileDetector}
 * method uses a non-standard command to transfer files from the local client
 * to the remote end hosting the browser. Many of the WebDriver sub-types, like
 * the {@link chrome.Driver} and {@link firefox.Driver}, do not support this
 * command. Thus, these classes override the `setFileDetector` to no-op.
 *
 * This function uses a mixin to re-enable `setFileDetector` by calling the
 * original method on the WebDriver prototype directly. This is used only when
 * the builder creates a Chrome or Firefox instance that communicates with a
 * remote end (and thus, support for remote file detectors is unknown).
 *
 * @param {function(new: webdriver.WebDriver, ...?)} ctor
 * @return {function(new: webdriver.WebDriver, ...?)}
 */
function ensureFileDetectorsAreEnabled(ctor) {
  const mixin = class extends ctor {
    /** @param {input.FileDetector} detector */
    setFileDetector(detector) {
      webdriver.WebDriver.prototype.setFileDetector.call(this, detector);
    }
  };
  return mixin;
}


/**
 * A thenable wrapper around a {@linkplain webdriver.IWebDriver IWebDriver}
 * instance that allows commands to be issued directly instead of having to
 * repeatedly call `then`:
 *
 *     let driver = new Builder().build();
 *     driver.then(d => d.get(url));  // You can do this...
 *     driver.get(url);               // ...or this
 *
 * If the driver instance fails to resolve (e.g. the session cannot be created),
 * every issued command will fail.
 *
 * @extends {webdriver.IWebDriver}
 * @extends {promise.CancellableThenable<!webdriver.IWebDriver>}
 * @interface
 */
class ThenableWebDriver {
  /** @param {...?} args */
  static createSession(...args) {}
}


/**
 * @const {!Map<function(new: WebDriver, !IThenable<!Session>, ...?),
 *              function(new: ThenableWebDriver, !IThenable<!Session>, ...?)>}
 */
const THENABLE_DRIVERS = new Map;


/**
 * @param {function(new: WebDriver, !IThenable<!Session>, ...?)} ctor
 * @param {...?} args
 * @return {!ThenableWebDriver}
 */
function createDriver(ctor, ...args) {
  let thenableWebDriverProxy = THENABLE_DRIVERS.get(ctor);
  if (!thenableWebDriverProxy) {
    /** @implements {ThenableWebDriver} */
    thenableWebDriverProxy = class extends ctor {
      /**
       * @param {!IThenable<!Session>} session
       * @param {...?} rest
       */
      constructor(session, ...rest) {
        super(session, ...rest);

        const pd = this.getSession().then(session => {
          return new ctor(session, ...rest);
        });

        /**
         * @param {(string|Error)=} opt_reason
         * @override
         */
        this.cancel = function(opt_reason) {
          if (promise.CancellableThenable.isImplementation(pd)) {
            /** @type {!promise.CancellableThenable} */(pd).cancel(opt_reason);
          }
        };

        /** @override */
        this.then = pd.then.bind(pd);

        /** @override */
        this.catch = pd.then.bind(pd);
      }
    }
    promise.CancellableThenable.addImplementation(thenableWebDriverProxy);
    THENABLE_DRIVERS.set(ctor, thenableWebDriverProxy);
  }
  return thenableWebDriverProxy.createSession(...args);
}


/**
 * Creates new {@link webdriver.WebDriver WebDriver} instances. The environment
 * variables listed below may be used to override a builder's configuration,
 * allowing quick runtime changes.
 *
 * - {@code SELENIUM_BROWSER}: defines the target browser in the form
 *   {@code browser[:version][:platform]}.
 *
 * - {@code SELENIUM_REMOTE_URL}: defines the remote URL for all builder
 *   instances. This environment variable should be set to a fully qualified
 *   URL for a WebDriver server (e.g. http://localhost:4444/wd/hub). This
 *   option always takes precedence over {@code SELENIUM_SERVER_JAR}.
 *
 * - {@code SELENIUM_SERVER_JAR}: defines the path to the
 *   <a href="http://selenium-release.storage.googleapis.com/index.html">
 *   standalone Selenium server</a> jar to use. The server will be started the
 *   first time a WebDriver instance and be killed when the process exits.
 *
 * Suppose you had mytest.js that created WebDriver with
 *
 *     var driver = new webdriver.Builder()
 *         .forBrowser('chrome')
 *         .build();
 *
 * This test could be made to use Firefox on the local machine by running with
 * `SELENIUM_BROWSER=firefox node mytest.js`. Rather than change the code to
 * target Google Chrome on a remote machine, you can simply set the
 * `SELENIUM_BROWSER` and `SELENIUM_REMOTE_URL` environment variables:
 *
 *     SELENIUM_BROWSER=chrome:36:LINUX \
 *     SELENIUM_REMOTE_URL=http://www.example.com:4444/wd/hub \
 *     node mytest.js
 *
 * You could also use a local copy of the standalone Selenium server:
 *
 *     SELENIUM_BROWSER=chrome:36:LINUX \
 *     SELENIUM_SERVER_JAR=/path/to/selenium-server-standalone.jar \
 *     node mytest.js
 */
class Builder {
  constructor() {
    /** @private @const */
    this.log_ = logging.getLogger('webdriver.Builder');

    /** @private {promise.ControlFlow} */
    this.flow_ = null;

    /** @private {string} */
    this.url_ = '';

    /** @private {?string} */
    this.proxy_ = null;

    /** @private {!Capabilities} */
    this.capabilities_ = new Capabilities();

    /** @private {chrome.Options} */
    this.chromeOptions_ = null;

    /** @private {firefox.Options} */
    this.firefoxOptions_ = null;

    /** @private {opera.Options} */
    this.operaOptions_ = null;

    /** @private {ie.Options} */
    this.ieOptions_ = null;

    /** @private {safari.Options} */
    this.safariOptions_ = null;

    /** @private {edge.Options} */
    this.edgeOptions_ = null;

    /** @private {boolean} */
    this.ignoreEnv_ = false;

    /** @private {http.Agent} */
    this.agent_ = null;
  }

  /**
   * Configures this builder to ignore any environment variable overrides and to
   * only use the configuration specified through this instance's API.
   *
   * @return {!Builder} A self reference.
   */
  disableEnvironmentOverrides() {
    this.ignoreEnv_ = true;
    return this;
  }

  /**
   * Sets the URL of a remote WebDriver server to use. Once a remote URL has
   * been specified, the builder direct all new clients to that server. If this
   * method is never called, the Builder will attempt to create all clients
   * locally.
   *
   * As an alternative to this method, you may also set the
   * `SELENIUM_REMOTE_URL` environment variable.
   *
   * @param {string} url The URL of a remote server to use.
   * @return {!Builder} A self reference.
   */
  usingServer(url) {
    this.url_ = url;
    return this;
  }

  /**
   * @return {string} The URL of the WebDriver server this instance is
   *     configured to use.
   */
  getServerUrl() {
    return this.url_;
  }

  /**
   * Sets the URL of the proxy to use for the WebDriver's HTTP connections.
   * If this method is never called, the Builder will create a connection
   * without a proxy.
   *
   * @param {string} proxy The URL of a proxy to use.
   * @return {!Builder} A self reference.
   */
  usingWebDriverProxy(proxy) {
    this.proxy_ = proxy;
    return this;
  }

  /**
   * @return {?string} The URL of the proxy server to use for the WebDriver's
   *    HTTP connections, or `null` if not set.
   */
  getWebDriverProxy() {
    return this.proxy_;
  }

  /**
   * Sets the http agent to use for each request.
   * If this method is not called, the Builder will use http.globalAgent by default.
   *
   * @param {http.Agent} agent The agent to use for each request.
   * @return {!Builder} A self reference.
   */
  usingHttpAgent(agent) {
    this.agent_ = agent;
    return this;
  }

  /**
   * @return {http.Agent} The http agent used for each request
   */
  getHttpAgent() {
    return this.agent_;
  }

  /**
   * Sets the desired capabilities when requesting a new session. This will
   * overwrite any previously set capabilities.
   * @param {!(Object|Capabilities)} capabilities The desired capabilities for
   *     a new session.
   * @return {!Builder} A self reference.
   */
  withCapabilities(capabilities) {
    this.capabilities_ = new Capabilities(capabilities);
    return this;
  }

  /**
   * Returns the base set of capabilities this instance is currently configured
   * to use.
   * @return {!Capabilities} The current capabilities for this builder.
   */
  getCapabilities() {
    return this.capabilities_;
  }

  /**
   * Configures the target browser for clients created by this instance.
   * Any calls to {@link #withCapabilities} after this function will
   * overwrite these settings.
   *
   * You may also define the target browser using the {@code SELENIUM_BROWSER}
   * environment variable. If set, this environment variable should be of the
   * form `browser[:[version][:platform]]`.
   *
   * @param {(string|Browser)} name The name of the target browser;
   *     common defaults are available on the {@link webdriver.Browser} enum.
   * @param {string=} opt_version A desired version; may be omitted if any
   *     version should be used.
   * @param {string=} opt_platform The desired platform; may be omitted if any
   *     version may be used.
   * @return {!Builder} A self reference.
   */
  forBrowser(name, opt_version, opt_platform) {
    this.capabilities_.set(Capability.BROWSER_NAME, name);
    this.capabilities_.set(Capability.VERSION, opt_version || null);
    this.capabilities_.set(Capability.PLATFORM, opt_platform || null);
    return this;
  }

  /**
   * Sets the proxy configuration for the target browser.
   * Any calls to {@link #withCapabilities} after this function will
   * overwrite these settings.
   *
   * @param {!capabilities.ProxyConfig} config The configuration to use.
   * @return {!Builder} A self reference.
   */
  setProxy(config) {
    this.capabilities_.setProxy(config);
    return this;
  }

  /**
   * Sets the logging preferences for the created session. Preferences may be
   * changed by repeated calls, or by calling {@link #withCapabilities}.
   * @param {!(./lib/logging.Preferences|Object<string, string>)} prefs The
   *     desired logging preferences.
   * @return {!Builder} A self reference.
   */
  setLoggingPrefs(prefs) {
    this.capabilities_.setLoggingPrefs(prefs);
    return this;
  }

  /**
   * Sets whether native events should be used.
   * @param {boolean} enabled Whether to enable native events.
   * @return {!Builder} A self reference.
   */
  setEnableNativeEvents(enabled) {
    this.capabilities_.setEnableNativeEvents(enabled);
    return this;
  }

  /**
   * Sets how elements should be scrolled into view for interaction.
   * @param {number} behavior The desired scroll behavior: either 0 to align
   *     with the top of the viewport or 1 to align with the bottom.
   * @return {!Builder} A self reference.
   */
  setScrollBehavior(behavior) {
    this.capabilities_.setScrollBehavior(behavior);
    return this;
  }

  /**
   * Sets the default action to take with an unexpected alert before returning
   * an error.
   * @param {string} behavior The desired behavior; should be "accept",
   *     "dismiss", or "ignore". Defaults to "dismiss".
   * @return {!Builder} A self reference.
   */
  setAlertBehavior(behavior) {
    this.capabilities_.setAlertBehavior(behavior);
    return this;
  }

  /**
   * Sets Chrome specific {@linkplain chrome.Options options} for drivers
   * created by this builder. Any logging or proxy settings defined on the given
   * options will take precedence over those set through
   * {@link #setLoggingPrefs} and {@link #setProxy}, respectively.
   *
   * @param {!chrome.Options} options The ChromeDriver options to use.
   * @return {!Builder} A self reference.
   */
  setChromeOptions(options) {
    this.chromeOptions_ = options;
    return this;
  }

  /**
   * Sets Firefox specific {@linkplain firefox.Options options} for drivers
   * created by this builder. Any logging or proxy settings defined on the given
   * options will take precedence over those set through
   * {@link #setLoggingPrefs} and {@link #setProxy}, respectively.
   *
   * @param {!firefox.Options} options The FirefoxDriver options to use.
   * @return {!Builder} A self reference.
   */
  setFirefoxOptions(options) {
    this.firefoxOptions_ = options;
    return this;
  }

  /**
   * @return {firefox.Options} the Firefox specific options currently configured
   *     for this instance.
   */
  getFirefoxOptions() {
    return this.firefoxOptions_;
  }

  /**
   * Sets Opera specific {@linkplain opera.Options options} for drivers created
   * by this builder. Any logging or proxy settings defined on the given options
   * will take precedence over those set through {@link #setLoggingPrefs} and
   * {@link #setProxy}, respectively.
   *
   * @param {!opera.Options} options The OperaDriver options to use.
   * @return {!Builder} A self reference.
   */
  setOperaOptions(options) {
    this.operaOptions_ = options;
    return this;
  }

  /**
   * Set Internet Explorer specific {@linkplain ie.Options options} for drivers
   * created by this builder. Any proxy settings defined on the given options
   * will take precedence over those set through {@link #setProxy}.
   *
   * @param {!ie.Options} options The IEDriver options to use.
   * @return {!Builder} A self reference.
   */
  setIeOptions(options) {
    this.ieOptions_ = options;
    return this;
  }

  /**
   * Set {@linkplain edge.Options options} specific to Microsoft's Edge browser
   * for drivers created by this builder. Any proxy settings defined on the
   * given options will take precedence over those set through
   * {@link #setProxy}.
   *
   * @param {!edge.Options} options The MicrosoftEdgeDriver options to use.
   * @return {!Builder} A self reference.
   */
  setEdgeOptions(options) {
    this.edgeOptions_ = options;
    return this;
  }

  /**
   * Sets Safari specific {@linkplain safari.Options options} for drivers
   * created by this builder. Any logging settings defined on the given options
   * will take precedence over those set through {@link #setLoggingPrefs}.
   *
   * @param {!safari.Options} options The Safari options to use.
   * @return {!Builder} A self reference.
   */
  setSafariOptions(options) {
    this.safariOptions_ = options;
    return this;
  }

  /**
   * @return {safari.Options} the Safari specific options currently configured
   *     for this instance.
   */
  getSafariOptions() {
    return this.safariOptions_;
  }

  /**
   * Sets the control flow that created drivers should execute actions in. If
   * the flow is never set, or is set to {@code null}, it will use the active
   * flow at the time {@link #build()} is called.
   * @param {promise.ControlFlow} flow The control flow to use, or
   *     {@code null} to
   * @return {!Builder} A self reference.
   */
  setControlFlow(flow) {
    this.flow_ = flow;
    return this;
  }

  /**
   * Creates a new WebDriver client based on this builder's current
   * configuration.
   *
   * This method will return a {@linkplain ThenableWebDriver} instance, allowing
   * users to issue commands directly without calling `then()`. The returned
   * thenable wraps a promise that will resolve to a concrete
   * {@linkplain webdriver.WebDriver WebDriver} instance. The promise will be
   * rejected if the remote end fails to create a new session.
   *
   * @return {!ThenableWebDriver} A new WebDriver instance.
   * @throws {Error} If the current configuration is invalid.
   */
  build() {
    // Create a copy for any changes we may need to make based on the current
    // environment.
    var capabilities = new Capabilities(this.capabilities_);

    var browser;
    if (!this.ignoreEnv_ && process.env.SELENIUM_BROWSER) {
      this.log_.fine(`SELENIUM_BROWSER=${process.env.SELENIUM_BROWSER}`);
      browser = process.env.SELENIUM_BROWSER.split(/:/, 3);
      capabilities.set(Capability.BROWSER_NAME, browser[0]);
      capabilities.set(Capability.VERSION, browser[1] || null);
      capabilities.set(Capability.PLATFORM, browser[2] || null);
    }

    browser = capabilities.get(Capability.BROWSER_NAME);

    if (typeof browser !== 'string') {
      throw TypeError(
          `Target browser must be a string, but is <${typeof browser}>;` +
          ' did you forget to call forBrowser()?');
    }

    if (browser === 'ie') {
      browser = Browser.INTERNET_EXPLORER;
    }

    // Apply browser specific overrides.
    if (browser === Browser.CHROME && this.chromeOptions_) {
      capabilities.merge(this.chromeOptions_.toCapabilities());

    } else if (browser === Browser.FIREFOX && this.firefoxOptions_) {
      capabilities.merge(this.firefoxOptions_.toCapabilities());

    } else if (browser === Browser.INTERNET_EXPLORER && this.ieOptions_) {
      capabilities.merge(this.ieOptions_.toCapabilities());

    } else if (browser === Browser.OPERA && this.operaOptions_) {
      capabilities.merge(this.operaOptions_.toCapabilities());

    } else if (browser === Browser.SAFARI && this.safariOptions_) {
      capabilities.merge(this.safariOptions_.toCapabilities());

    } else if (browser === Browser.EDGE && this.edgeOptions_) {
      capabilities.merge(this.edgeOptions_.toCapabilities());
    }

    // Check for a remote browser.
    let url = this.url_;
    if (!this.ignoreEnv_) {
      if (process.env.SELENIUM_REMOTE_URL) {
        this.log_.fine(
            `SELENIUM_REMOTE_URL=${process.env.SELENIUM_REMOTE_URL}`);
        url = process.env.SELENIUM_REMOTE_URL;
      } else if (process.env.SELENIUM_SERVER_JAR) {
        this.log_.fine(
            `SELENIUM_SERVER_JAR=${process.env.SELENIUM_SERVER_JAR}`);
        url = startSeleniumServer(process.env.SELENIUM_SERVER_JAR);
      }
    }

    if (url) {
      this.log_.fine('Creating session on remote server');
      let client = Promise.resolve(url)
          .then(url => new _http.HttpClient(url, this.agent_, this.proxy_));
      let executor = new _http.Executor(client);

      if (browser === Browser.CHROME) {
        const driver = ensureFileDetectorsAreEnabled(chrome.Driver);
        return createDriver(
            driver, capabilities, executor, this.flow_);
      }

      if (browser === Browser.FIREFOX) {
        const driver = ensureFileDetectorsAreEnabled(firefox.Driver);
        return createDriver(
            driver, capabilities, executor, this.flow_);
      }
      return createDriver(
          WebDriver, executor, capabilities, this.flow_);
    }

    // Check for a native browser.
    switch (browser) {
      case Browser.CHROME:
        return createDriver(chrome.Driver, capabilities, null, this.flow_);

      case Browser.FIREFOX:
        return createDriver(firefox.Driver, capabilities, null, this.flow_);

      case Browser.INTERNET_EXPLORER:
        return createDriver(ie.Driver, capabilities, this.flow_);

      case Browser.EDGE:
        return createDriver(edge.Driver, capabilities, null, this.flow_);

      case Browser.OPERA:
        return createDriver(opera.Driver, capabilities, null, this.flow_);

      case Browser.PHANTOM_JS:
        return createDriver(phantomjs.Driver, capabilities, this.flow_);

      case Browser.SAFARI:
        return createDriver(safari.Driver, capabilities, this.flow_);

      default:
        throw new Error('Do not know how to build driver: ' + browser
            + '; did you forget to call usingServer(url)?');
    }
  }
}


// PUBLIC API


exports.ActionSequence = actions.ActionSequence;
exports.Browser = capabilities.Browser;
exports.Builder = Builder;
exports.Button = input.Button;
exports.By = by.By;
exports.Capabilities = capabilities.Capabilities;
exports.Capability = capabilities.Capability;
exports.Condition = webdriver.Condition;
exports.EventEmitter = events.EventEmitter;
exports.FileDetector = input.FileDetector;
exports.Key = input.Key;
exports.Session = session.Session;
exports.ThenableWebDriver = ThenableWebDriver;
exports.TouchSequence = actions.TouchSequence;
exports.WebDriver = webdriver.WebDriver;
exports.WebElement = webdriver.WebElement;
exports.WebElementCondition = webdriver.WebElementCondition;
exports.WebElementPromise = webdriver.WebElementPromise;
exports.error = error;
exports.logging = logging;
exports.promise = promise;
exports.until = until;
