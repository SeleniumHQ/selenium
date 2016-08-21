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
 * @fileoverview Defines a {@linkplain Driver WebDriver} client for the
 * Opera web browser (v26+). Before using this module, you must download the
 * latest OperaDriver
 * [release](https://github.com/operasoftware/operachromiumdriver/releases) and
 * ensure it can be found on your system
 * [PATH](http://en.wikipedia.org/wiki/PATH_%28variable%29).
 *
 * There are three primary classes exported by this module:
 *
 * 1. {@linkplain ServiceBuilder}: configures the
 *     {@link selenium-webdriver/remote.DriverService remote.DriverService}
 *     that manages the
 *     [OperaDriver](https://github.com/operasoftware/operachromiumdriver)
 *     child process.
 *
 * 2. {@linkplain Options}: defines configuration options for each new Opera
 *     session, such as which {@linkplain Options#setProxy proxy} to use,
 *     what {@linkplain Options#addExtensions extensions} to install, or
 *     what {@linkplain Options#addArguments command-line switches} to use when
 *     starting the browser.
 *
 * 3. {@linkplain Driver}: the WebDriver client; each new instance will control
 *     a unique browser session with a clean user profile (unless otherwise
 *     configured through the {@link Options} class).
 *
 * By default, every Opera session will use a single driver service, which is
 * started the first time a {@link Driver} instance is created and terminated
 * when this process exits. The default service will inherit its environment
 * from the current process and direct all output to /dev/null. You may obtain
 * a handle to this default service using
 * {@link #getDefaultService getDefaultService()} and change its configuration
 * with {@link #setDefaultService setDefaultService()}.
 *
 * You may also create a {@link Driver} with its own driver service. This is
 * useful if you need to capture the server's log output for a specific session:
 *
 *     var opera = require('selenium-webdriver/opera');
 *
 *     var service = new opera.ServiceBuilder()
 *         .loggingTo('/my/log/file.txt')
 *         .enableVerboseLogging()
 *         .build();
 *
 *     var options = new opera.Options();
 *     // configure browser options ...
 *
 *     var driver = new opera.Driver(options, service);
 *
 * Users should only instantiate the {@link Driver} class directly when they
 * need a custom driver service configuration (as shown above). For normal
 * operation, users should start Opera using the
 * {@link selenium-webdriver.Builder}.
 */

'use strict';

const fs = require('fs');

const http = require('./http'),
    io = require('./io'),
    capabilities = require('./lib/capabilities'),
    promise = require('./lib/promise'),
    Symbols = require('./lib/symbols'),
    webdriver = require('./lib/webdriver'),
    portprober = require('./net/portprober'),
    remote = require('./remote');


/**
 * Name of the OperaDriver executable.
 * @type {string}
 * @const
 */
const OPERADRIVER_EXE =
    process.platform === 'win32' ? 'operadriver.exe' : 'operadriver';


/**
 * Creates {@link remote.DriverService} instances that manages an
 * [OperaDriver](https://github.com/operasoftware/operachromiumdriver)
 * server in a child process.
 */
class ServiceBuilder extends remote.DriverService.Builder {
  /**
   * @param {string=} opt_exe Path to the server executable to use. If omitted,
   *     the builder will attempt to locate the operadriver on the current
   *     PATH.
   * @throws {Error} If provided executable does not exist, or the operadriver
   *     cannot be found on the PATH.
   */
  constructor(opt_exe) {
    let exe = opt_exe || io.findInPath(OPERADRIVER_EXE, true);
    if (!exe) {
      throw Error(
          'The OperaDriver could not be found on the current PATH. Please ' +
          'download the latest version of the OperaDriver from ' +
          'https://github.com/operasoftware/operachromiumdriver/releases and ' +
          'ensure it can be found on your PATH.');
    }

    super(exe);
    this.setLoopback(true);
  }

  /**
   * Sets the path of the log file the driver should log to. If a log file is
   * not specified, the driver will log to stderr.
   * @param {string} path Path of the log file to use.
   * @return {!ServiceBuilder} A self reference.
   */
  loggingTo(path) {
    return this.addArguments('--log-path=' + path);
  }

  /**
   * Enables verbose logging.
   * @return {!ServiceBuilder} A self reference.
   */
  enableVerboseLogging() {
    return this.addArguments('--verbose');
  }

  /**
   * Silence sthe drivers output.
   * @return {!ServiceBuilder} A self reference.
   */
  silent() {
    return this.addArguments('--silent');
  }
}



/** @type {remote.DriverService} */
var defaultService = null;


/**
 * Sets the default service to use for new OperaDriver instances.
 * @param {!remote.DriverService} service The service to use.
 * @throws {Error} If the default service is currently running.
 */
function setDefaultService(service) {
  if (defaultService && defaultService.isRunning()) {
    throw Error(
        'The previously configured OperaDriver service is still running. ' +
        'You must shut it down before you may adjust its configuration.');
  }
  defaultService = service;
}


/**
 * Returns the default OperaDriver service. If such a service has not been
 * configured, one will be constructed using the default configuration for
 * a OperaDriver executable found on the system PATH.
 * @return {!remote.DriverService} The default OperaDriver service.
 */
function getDefaultService() {
  if (!defaultService) {
    defaultService = new ServiceBuilder().build();
  }
  return defaultService;
}


/**
 * @type {string}
 * @const
 */
var OPTIONS_CAPABILITY_KEY = 'chromeOptions';


/**
 * Class for managing {@linkplain Driver OperaDriver} specific options.
 */
class Options {
  constructor() {
    /** @private {!Array.<string>} */
    this.args_ = [];

    /** @private {?string} */
    this.binary_ = null;

    /** @private {!Array.<(string|!Buffer)>} */
    this.extensions_ = [];

    /** @private {./lib/logging.Preferences} */
    this.logPrefs_ = null;

    /** @private {?capabilities.ProxyConfig} */
    this.proxy_ = null;
  }

  /**
   * Extracts the OperaDriver specific options from the given capabilities
   * object.
   * @param {!capabilities.Capabilities} caps The capabilities object.
   * @return {!Options} The OperaDriver options.
   */
  static fromCapabilities(caps) {
    var options;
    var o = caps.get(OPTIONS_CAPABILITY_KEY);
    if (o instanceof Options) {
      options = o;
    } else if (o) {
      options = new Options()
          .addArguments(o.args || [])
          .addExtensions(o.extensions || [])
          .setOperaBinaryPath(o.binary);
    } else {
      options = new Options;
    }

    if (caps.has(capabilities.Capability.PROXY)) {
      options.setProxy(caps.get(capabilities.Capability.PROXY));
    }

    if (caps.has(capabilities.Capability.LOGGING_PREFS)) {
      options.setLoggingPrefs(
          caps.get(capabilities.Capability.LOGGING_PREFS));
    }

    return options;
  }

  /**
   * Add additional command line arguments to use when launching the Opera
   * browser.  Each argument may be specified with or without the "--" prefix
   * (e.g. "--foo" and "foo"). Arguments with an associated value should be
   * delimited by an "=": "foo=bar".
   * @param {...(string|!Array.<string>)} var_args The arguments to add.
   * @return {!Options} A self reference.
   */
  addArguments(var_args) {
    this.args_ = this.args_.concat.apply(this.args_, arguments);
    return this;
  }

  /**
   * Add additional extensions to install when launching Opera. Each extension
   * should be specified as the path to the packed CRX file, or a Buffer for an
   * extension.
   * @param {...(string|!Buffer|!Array.<(string|!Buffer)>)} var_args The
   *     extensions to add.
   * @return {!Options} A self reference.
   */
  addExtensions(var_args) {
    this.extensions_ = this.extensions_.concat.apply(
        this.extensions_, arguments);
    return this;
  }

  /**
   * Sets the path to the Opera binary to use. On Mac OS X, this path should
   * reference the actual Opera executable, not just the application binary. The
   * binary path be absolute or relative to the operadriver server executable, but
   * it must exist on the machine that will launch Opera.
   *
   * @param {string} path The path to the Opera binary to use.
   * @return {!Options} A self reference.
   */
  setOperaBinaryPath(path) {
    this.binary_ = path;
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
   * Sets the proxy settings for the new session.
   * @param {capabilities.ProxyConfig} proxy The proxy configuration to use.
   * @return {!Options} A self reference.
   */
  setProxy(proxy) {
    this.proxy_ = proxy;
    return this;
  }

  /**
   * Converts this options instance to a {@link capabilities.Capabilities}
   *     object.
   * @param {capabilities.Capabilities=} opt_capabilities The capabilities to
   *     merge these options into, if any.
   * @return {!capabilities.Capabilities} The capabilities.
   */
  toCapabilities(opt_capabilities) {
    var caps = opt_capabilities || capabilities.Capabilities.opera();
    caps.
        set(capabilities.Capability.PROXY, this.proxy_).
        set(capabilities.Capability.LOGGING_PREFS, this.logPrefs_).
        set(OPTIONS_CAPABILITY_KEY, this);
    return caps;
  }

  /**
   * Converts this instance to its JSON wire protocol representation. Note this
   * function is an implementation not intended for general use.
   * @return {!Object} The JSON wire protocol representation of this instance.
   */
  [Symbols.serialize]() {
    var json = {
      args: this.args_,
      extensions: this.extensions_.map(function(extension) {
        if (Buffer.isBuffer(extension)) {
          return extension.toString('base64');
        }
        return io.read(/** @type {string} */(extension))
            .then(buffer => buffer.toString('base64'));
      })
    };
    if (this.binary_) {
      json.binary = this.binary_;
    }
    return json;
  }
}


/**
 * Creates a new WebDriver client for Opera.
 */
class Driver extends webdriver.WebDriver {
  /**
   * @param {(capabilities.Capabilities|Options)=} opt_config The configuration
   *     options.
   * @param {remote.DriverService=} opt_service The session to use; will use
   *     the {@link getDefaultService default service} by default.
   * @param {promise.ControlFlow=} opt_flow The control flow to use,
   *     or {@code null} to use the currently active flow.
   */
  constructor(opt_config, opt_service, opt_flow) {
    var service = opt_service || getDefaultService();
    var client = service.start().then(url => new http.HttpClient(url));
    var executor = new http.Executor(client);

    var caps =
        opt_config instanceof Options ? opt_config.toCapabilities() :
        (opt_config || capabilities.Capabilities.opera());

    // On Linux, the OperaDriver does not look for Opera on the PATH, so we
    // must explicitly find it. See: operachromiumdriver #9.
    if (process.platform === 'linux') {
      var options = Options.fromCapabilities(caps);
      if (!options.binary_) {
        let exe = io.findInPath('opera', true);
        if (!exe) {
          throw Error(
              'The opera executable could not be found on the current PATH');
        }
        options.setOperaBinaryPath(exe);
      }
      caps = options.toCapabilities(caps);
    }

    var driver = webdriver.WebDriver.createSession(executor, caps, opt_flow);
    super(driver.getSession(), executor, driver.controlFlow());
  }

  /**
   * This function is a no-op as file detectors are not supported by this
   * implementation.
   * @override
   */
  setFileDetector() {}
}


// PUBLIC API


exports.Driver = Driver;
exports.Options = Options;
exports.ServiceBuilder = ServiceBuilder;
exports.getDefaultService = getDefaultService;
exports.setDefaultService = setDefaultService;
