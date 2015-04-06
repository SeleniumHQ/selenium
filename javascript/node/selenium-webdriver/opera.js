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

var fs = require('fs'),
    util = require('util');

var webdriver = require('./index'),
    executors = require('./executors'),
    io = require('./io'),
    portprober = require('./net/portprober'),
    remote = require('./remote');


/**
 * Name of the OperaDriver executable.
 * @type {string}
 * @const
 */
var OPERADRIVER_EXE =
    process.platform === 'win32' ? 'operadriver.exe' : 'operadriver';


/**
 * Creates {@link remote.DriverService} instances that manages an
 * [OperaDriver](https://github.com/operasoftware/operachromiumdriver)
 * server in a child process.
 *
 * @param {string=} opt_exe Path to the server executable to use. If omitted,
 *     the builder will attempt to locate the operadriver on the current
 *     PATH.
 * @throws {Error} If provided executable does not exist, or the operadriver
 *     cannot be found on the PATH.
 * @constructor
 */
var ServiceBuilder = function(opt_exe) {
  /** @private {string} */
  this.exe_ = opt_exe || io.findInPath(OPERADRIVER_EXE, true);
  if (!this.exe_) {
    throw Error(
        'The OperaDriver could not be found on the current PATH. Please ' +
        'download the latest version of the OperaDriver from ' +
        'https://github.com/operasoftware/operachromiumdriver/releases and ' +
        'ensure it can be found on your PATH.');
  }

  if (!fs.existsSync(this.exe_)) {
    throw Error('File does not exist: ' + this.exe_);
  }

  /** @private {!Array.<string>} */
  this.args_ = [];
  this.stdio_ = 'ignore';
};


/** @private {number} */
ServiceBuilder.prototype.port_ = 0;


/** @private {(string|!Array.<string|number|!Stream|null|undefined>)} */
ServiceBuilder.prototype.stdio_ = 'ignore';


/** @private {Object.<string, string>} */
ServiceBuilder.prototype.env_ = null;


/**
 * Sets the port to start the OperaDriver on.
 * @param {number} port The port to use, or 0 for any free port.
 * @return {!ServiceBuilder} A self reference.
 * @throws {Error} If the port is invalid.
 */
ServiceBuilder.prototype.usingPort = function(port) {
  if (port < 0) {
    throw Error('port must be >= 0: ' + port);
  }
  this.port_ = port;
  return this;
};


/**
 * Sets the path of the log file the driver should log to. If a log file is
 * not specified, the driver will log to stderr.
 * @param {string} path Path of the log file to use.
 * @return {!ServiceBuilder} A self reference.
 */
ServiceBuilder.prototype.loggingTo = function(path) {
  this.args_.push('--log-path=' + path);
  return this;
};


/**
 * Enables verbose logging.
 * @return {!ServiceBuilder} A self reference.
 */
ServiceBuilder.prototype.enableVerboseLogging = function() {
  this.args_.push('--verbose');
  return this;
};


/**
 * Silence sthe drivers output.
 * @return {!ServiceBuilder} A self reference.
 */
ServiceBuilder.prototype.silent = function() {
  this.args_.push('--silent');
  return this;
};


/**
 * Defines the stdio configuration for the driver service. See
 * {@code child_process.spawn} for more information.
 * @param {(string|!Array.<string|number|!Stream|null|undefined>)} config The
 *     configuration to use.
 * @return {!ServiceBuilder} A self reference.
 */
ServiceBuilder.prototype.setStdio = function(config) {
  this.stdio_ = config;
  return this;
};


/**
 * Defines the environment to start the server under. This settings will be
 * inherited by every browser session started by the server.
 * @param {!Object.<string, string>} env The environment to use.
 * @return {!ServiceBuilder} A self reference.
 */
ServiceBuilder.prototype.withEnvironment = function(env) {
  this.env_ = env;
  return this;
};


/**
 * Creates a new DriverService using this instance's current configuration.
 * @return {remote.DriverService} A new driver service using this instance's
 *     current configuration.
 * @throws {Error} If the driver exectuable was not specified and a default
 *     could not be found on the current PATH.
 */
ServiceBuilder.prototype.build = function() {
  var port = this.port_ || portprober.findFreePort();
  var args = this.args_.concat();  // Defensive copy.

  return new remote.DriverService(this.exe_, {
    loopback: true,
    port: port,
    args: webdriver.promise.when(port, function(port) {
      return args.concat('--port=' + port);
    }),
    env: this.env_,
    stdio: this.stdio_
  });
};


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
 * Class for managing {@link Driver OperaDriver} specific options.
 * @constructor
 * @extends {webdriver.Serializable}
 */
var Options = function() {
  webdriver.Serializable.call(this);

  /** @private {!Array.<string>} */
  this.args_ = [];

  /** @private {!Array.<(string|!Buffer)>} */
  this.extensions_ = [];
};
util.inherits(Options, webdriver.Serializable);


/**
 * Extracts the OperaDriver specific options from the given capabilities
 * object.
 * @param {!webdriver.Capabilities} capabilities The capabilities object.
 * @return {!Options} The OperaDriver options.
 */
Options.fromCapabilities = function(capabilities) {
  var options;
  var o = capabilities.get(OPTIONS_CAPABILITY_KEY);
  if (o instanceof Options) {
    options = o;
  } else if (o) {
    options.
        addArguments(o.args || []).
        addExtensions(o.extensions || []).
        setOperaBinaryPath(o.binary);
  } else {
    options = new Options;
  }

  if (capabilities.has(webdriver.Capability.PROXY)) {
    options.setProxy(capabilities.get(webdriver.Capability.PROXY));
  }

  if (capabilities.has(webdriver.Capability.LOGGING_PREFS)) {
    options.setLoggingPrefs(
        capabilities.get(webdriver.Capability.LOGGING_PREFS));
  }

  return options;
};


/**
 * Add additional command line arguments to use when launching the Opera
 * browser.  Each argument may be specified with or without the "--" prefix
 * (e.g. "--foo" and "foo"). Arguments with an associated value should be
 * delimited by an "=": "foo=bar".
 * @param {...(string|!Array.<string>)} var_args The arguments to add.
 * @return {!Options} A self reference.
 */
Options.prototype.addArguments = function(var_args) {
  this.args_ = this.args_.concat.apply(this.args_, arguments);
  return this;
};


/**
 * Add additional extensions to install when launching Opera. Each extension
 * should be specified as the path to the packed CRX file, or a Buffer for an
 * extension.
 * @param {...(string|!Buffer|!Array.<(string|!Buffer)>)} var_args The
 *     extensions to add.
 * @return {!Options} A self reference.
 */
Options.prototype.addExtensions = function(var_args) {
  this.extensions_ = this.extensions_.concat.apply(
      this.extensions_, arguments);
  return this;
};


/**
 * Sets the path to the Opera binary to use. On Mac OS X, this path should
 * reference the actual Opera executable, not just the application binary. The
 * binary path be absolute or relative to the operadriver server executable, but
 * it must exist on the machine that will launch Opera.
 *
 * @param {string} path The path to the Opera binary to use.
 * @return {!Options} A self reference.
 */
Options.prototype.setOperaBinaryPath = function(path) {
  this.binary_ = path;
  return this;
};


/**
 * Sets the logging preferences for the new session.
 * @param {!webdriver.logging.Preferences} prefs The logging preferences.
 * @return {!Options} A self reference.
 */
Options.prototype.setLoggingPrefs = function(prefs) {
  this.logPrefs_ = prefs;
  return this;
};


/**
 * Sets the proxy settings for the new session.
 * @param {webdriver.ProxyConfig} proxy The proxy configuration to use.
 * @return {!Options} A self reference.
 */
Options.prototype.setProxy = function(proxy) {
  this.proxy_ = proxy;
  return this;
};


/**
 * Converts this options instance to a {@link webdriver.Capabilities} object.
 * @param {webdriver.Capabilities=} opt_capabilities The capabilities to merge
 *     these options into, if any.
 * @return {!webdriver.Capabilities} The capabilities.
 */
Options.prototype.toCapabilities = function(opt_capabilities) {
  var capabilities = opt_capabilities || webdriver.Capabilities.opera();
  capabilities.
      set(webdriver.Capability.PROXY, this.proxy_).
      set(webdriver.Capability.LOGGING_PREFS, this.logPrefs_).
      set(OPTIONS_CAPABILITY_KEY, this);
  return capabilities;
};


/**
 * Converts this instance to its JSON wire protocol representation. Note this
 * function is an implementation not intended for general use.
 * @return {{args: !Array.<string>,
 *           binary: (string|undefined),
 *           detach: boolean,
 *           extensions: !Array.<(string|!webdriver.promise.Promise.<string>))>,
 *           localState: (Object|undefined),
 *           logPath: (string|undefined),
 *           prefs: (Object|undefined)}} The JSON wire protocol representation
 *     of this instance.
 * @override
 */
Options.prototype.serialize = function() {
  var json = {
    args: this.args_,
    extensions: this.extensions_.map(function(extension) {
      if (Buffer.isBuffer(extension)) {
        return extension.toString('base64');
      }
      return webdriver.promise.checkedNodeCall(
          fs.readFile, extension, 'base64');
    })
  };
  if (this.binary_) {
    json.binary = this.binary_;
  }
  if (this.logFile_) {
    json.logPath = this.logFile_;
  }
  if (this.prefs_) {
    json.prefs = this.prefs_;
  }

  return json;
};


/**
 * Creates a new WebDriver client for Opera.
 *
 * @param {(webdriver.Capabilities|Options)=} opt_config The configuration
 *     options.
 * @param {remote.DriverService=} opt_service The session to use; will use
 *     the {@link getDefaultService default service} by default.
 * @param {webdriver.promise.ControlFlow=} opt_flow The control flow to use, or
 *     {@code null} to use the currently active flow.
 * @constructor
 * @extends {webdriver.WebDriver}
 */
var Driver = function(opt_config, opt_service, opt_flow) {
  var service = opt_service || getDefaultService();
  var executor = executors.createExecutor(service.start());

  var capabilities =
      opt_config instanceof Options ? opt_config.toCapabilities() :
      (opt_config || webdriver.Capabilities.opera());

  // On Linux, the OperaDriver does not look for Opera on the PATH, so we
  // must explicitly find it. See: operachromiumdriver #9.
  if (process.platform === 'linux') {
    var options = Options.fromCapabilities(capabilities);
    if (!options.binary_) {
      options.setOperaBinaryPath(io.findInPath('opera', true));
    }
    capabilities = options.toCapabilities(capabilities);
  }

  var driver = webdriver.WebDriver.createSession(
      executor, capabilities, opt_flow);

  webdriver.WebDriver.call(
      this, driver.getSession(), executor, driver.controlFlow());
};
util.inherits(Driver, webdriver.WebDriver);


/**
 * This function is a no-op as file detectors are not supported by this
 * implementation.
 * @override
 */
Driver.prototype.setFileDetector = function() {
};


// PUBLIC API


exports.Driver = Driver;
exports.Options = Options;
exports.ServiceBuilder = ServiceBuilder;
exports.getDefaultService = getDefaultService;
exports.setDefaultService = setDefaultService;
