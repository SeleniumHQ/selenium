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
 * @fileoverview Defines a {@linkplain Driver WebDriver} client for Microsoft's
 * Internet Explorer. Before using the IEDriver, you must download the latest
 * [IEDriverServer](http://selenium-release.storage.googleapis.com/index.html)
 * and place it on your
 * [PATH](http://en.wikipedia.org/wiki/PATH_%28variable%29). You must also apply
 * the system configuration outlined on the Selenium project
 * [wiki](https://github.com/SeleniumHQ/selenium/wiki/InternetExplorerDriver)
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
 * @const
 * @final
 */
var IEDRIVER_EXE = 'IEDriverServer.exe';



/**
 * IEDriverServer logging levels.
 * @enum {string}
 */
var Level = {
  FATAL: 'FATAL',
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  TRACE: 'TRACE'
};



/**
 * Option keys:
 * https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities#ie-specific
 * @enum {string}
 */
var Key = {
  IGNORE_PROTECTED_MODE_SETTINGS: 'ignoreProtectedModeSettings',
  IGNORE_ZOOM_SETTING: 'ignoreZoomSetting',
  INITIAL_BROWSER_URL: 'initialBrowserUrl',
  ENABLE_PERSISTENT_HOVER: 'enablePersistentHover',
  ENABLE_ELEMENT_CACHE_CLEANUP: 'enableElementCacheCleanup',
  REQUIRE_WINDOW_FOCUS: 'requireWindowFocus',
  BROWSER_ATTACH_TIMEOUT: 'browserAttachTimeout',
  FORCE_CREATE_PROCESS: 'ie.forceCreateProcessApi',
  BROWSER_COMMAND_LINE_SWITCHES: 'ie.browserCommandLineSwitches',
  USE_PER_PROCESS_PROXY: 'ie.usePerProcessProxy',
  ENSURE_CLEAN_SESSION: 'ie.ensureCleanSession',
  LOG_FILE: 'logFile',
  LOG_LEVEL: 'logLevel',
  HOST: 'host',
  EXTRACT_PATH: 'extractPath',
  SILENT: 'silent'
};


/**
 * Class for managing IEDriver specific options.
 * @constructor
 */
var Options = function() {
  /** @private {!Object<(boolean|number|string)>} */
  this.options_ = {};

  /** @private {(webdriver.ProxyConfig|null)} */
  this.proxy_ = null;
};



/**
 * Extracts the IEDriver specific options from the given capabilities
 * object.
 * @param {!webdriver.Capabilities} capabilities The capabilities object.
 * @return {!Options} The IEDriver options.
 */
Options.fromCapabilities = function(capabilities) {
  var options = new Options();
  var map = options.options_;

  Object.keys(Key).forEach(function(key) {
    key = Key[key];
    if (capabilities.has(key)) {
      map[key] = capabilities.get(key);
    }
  });

  if (capabilities.has(webdriver.Capability.PROXY)) {
    options.setProxy(capabilities.get(webdriver.Capability.PROXY));
  }

  return options;
};


/**
 * Whether to disable the protected mode settings check when the session is
 * created. Disbling this setting may lead to significant instability as the
 * browser may become unresponsive/hang. Only "best effort" support is provided
 * when using this capability.
 *
 * For more information, refer to the IEDriver's
 * [required system configuration](http://goo.gl/eH0Yi3).
 *
 * @param {boolean} ignoreSettings Whether to ignore protected mode settings.
 * @return {!Options} A self reference.
 */
Options.prototype.introduceFlakinessByIgnoringProtectedModeSettings =
    function(ignoreSettings) {
      this.options_[Key.IGNORE_PROTECTED_MODE_SETTINGS] = !!ignoreSettings;
      return this;
    };


/**
 * Indicates whether to skip the check that the browser's zoom level is set to
 * 100%.
 *
 * @parm {boolean} ignore Whether to ignore the browser's zoom level settings.
 * @return {!Options} A self reference.
 */
Options.prototype.ignoreZoomSetting = function(ignore) {
  this.options_[Key.IGNORE_ZOOM_SETTING] = !!ignore;
  return this;
};


/**
 * Sets the initial URL loaded when IE starts. This is intended to be used with
 * {@link #ignoreProtectedModeSettings} to allow the user to initialize IE in
 * the proper Protected Mode zone. Setting this option may cause browser
 * instability or flaky and unresponsive code. Only "best effort" support is
 * provided when using this option.
 *
 * @param {string} url The initial browser URL.
 * @return {!Options} A self reference.
 */
Options.prototype.initialBrowserUrl = function(url) {
  this.options_[Key.INITIAL_BROWSER_URL] = url;
  return this;
};


/**
 * Configures whether to enable persistent mouse hovering (true by default).
 * Persistent hovering is achieved by continuously firing mouse over events at
 * the last location the mouse cursor has been moved to.
 *
 * @param {boolean} enable Whether to enable persistent hovering.
 * @return {!Options} A self reference.
 */
Options.prototype.enablePersistentHover = function(enable) {
  this.options_[Key.ENABLE_PERSISTENT_HOVER] = !!enable;
  return this;
};


/**
 * Configures whether the driver should attempt to remove obsolete
 * {@linkplain webdriver.WebElement WebElements} from its internal cache on
 * page navigation (true by default). Disabling this option will cause the
 * driver to run with a larger memory footprint.
 *
 * @param {boolean} enable Whether to enable element reference cleanup.
 * @return {!Options} A self reference.
 */
Options.prototype.enableElementCacheCleanup = function(enable) {
  this.options_[Key.ENABLE_ELEMENT_CACHE_CLEANUP] = !!enable;
  return this;
};


/**
 * Configures whether to require the IE window to have input focus before
 * performing any user interactions (i.e. mouse or keyboard events). This
 * option is disabled by default, but delivers much more accurate interaction
 * events when enabled.
 *
 * @param {boolean} require Whether to require window focus.
 * @return {!Options} A self reference.
 */
Options.prototype.requireWindowFocus = function(require) {
  this.options_[Key.REQUIRE_WINDOW_FOCUS] = !!require;
  return this;
};


/**
 * Configures the timeout, in milliseconds, that the driver will attempt to
 * located and attach to a newly opened instance of Internet Explorer. The
 * default is zero, which indicates waiting indefinitely.
 *
 * @param {number} timeout How long to wait for IE.
 * @return {!Options} A self reference.
 */
Options.prototype.browserAttachTimeout = function(timeout) {
  this.options_[Key.BROWSER_ATTACH_TIMEOUT] = Math.max(timeout, 0);
  return this;
};


/**
 * Configures whether to launch Internet Explorer using the CreateProcess API.
 * If this option is not specified, IE is launched using IELaunchURL, if
 * available. For IE 8 and above, this option requires the TabProcGrowth
 * registry value to be set to 0.
 *
 * @param {boolean} force Whether to use the CreateProcess API.
 * @return {!Options} A self reference.
 */
Options.prototype.forceCreateProcessApi = function(force) {
  this.options_[Key.FORCE_CREATE_PROCESS] = !!force;
  return this;
};


/**
 * Specifies command-line switches to use when launching Internet Explorer.
 * This is only valid when used with {@link #forceCreateProcessApi}.
 *
 * @param {...(string|!Array.<string>)} var_args The arguments to add.
 * @return {!Options} A self reference.
 */
Options.prototype.addArguments = function(var_args) {
  var args = this.options_[Key.BROWSER_COMMAND_LINE_SWITCHES] || [];
  args = args.concat.apply(args, arguments);
  this.options_[Key.BROWSER_COMMAND_LINE_SWITCHES] = args;
  return this;
};


/**
 * Configures whether proxies should be configured on a per-process basis. If
 * not set, setting a {@linkplain #setProxy proxy} will configure the system
 * proxy. The default behavior is to use the system proxy.
 *
 * @param {boolean} enable Whether to enable per-process proxy settings.
 * @return {!Options} A self reference.
 */
Options.prototype.usePerProcessProxy = function(enable) {
  this.options_[Key.USE_PER_PROCESS_PROXY] = !!enable;
  return this;
};


/**
 * Configures whether to clear the cache, cookies, history, and saved form data
 * before starting the browser. _Using this capability will clear session data
 * for all running instances of Internet Explorer, including those started
 * manually._
 *
 * @param {boolean} cleanSession Whether to clear all session data on startup.
 * @return {!Options} A self reference.
 */
Options.prototype.ensureCleanSession = function(cleanSession) {
  this.options_[Key.ENSURE_CLEAN_SESSION] = !!cleanSession;
  return this;
};


/**
 * Sets the path to the log file the driver should log to.
 * @param {string} path The log file path.
 * @return {!Options} A self reference.
 */
Options.prototype.setLogFile = function(file) {
  this.options_[Key.LOG_FILE] = file;
  return this;
};


/**
 * Sets the IEDriverServer's logging {@linkplain Level level}.
 * @param {Level} level The logging level.
 * @return {!Options} A self reference.
 */
Options.prototype.setLogLevel = function(level) {
  this.options_[Key.LOG_LEVEL] = level;
  return this;
};


/**
 * Sets the IP address of the driver's host adapter.
 * @param {string} host The IP address to use.
 * @return {!Options} A self reference.
 */
Options.prototype.setHost = function(host) {
  this.options_[Key.HOST] = host;
  return this;
};


/**
 * Sets the path of the temporary data directory to use.
 * @param {string} path The log file path.
 * @return {!Options} A self reference.
 */
Options.prototype.setExtractPath = function(path) {
  this.options_[Key.EXTRACT_PATH] = path;
  return this;
};


/**
 * Sets whether the driver should start in silent mode.
 * @param {boolean} silent Whether to run in silent mode.
 * @return {!Options} A self reference.
 */
Options.prototype.silent = function(silent) {
  this.options_[Key.SILENT] = silent;
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
  var capabilities = opt_capabilities || webdriver.Capabilities.ie();
  if (this.proxy_) {
    capabilities.set(webdriver.Capability.PROXY, this.proxy_);
  }
  Object.keys(this.options_).forEach(function(key) {
    capabilities.set(key, this.options_[key]);
  }, this);
  return capabilities;
};


function createServiceFromCapabilities(capabilities) {
  if (process.platform !== 'win32') {
    throw Error(
        'The IEDriver may only be used on Windows, but you appear to be on ' +
        process.platform + '. Did you mean to run against a remote ' +
        'WebDriver server?');
  }

  var exe = io.findInPath(IEDRIVER_EXE, true);
  if (!fs.existsSync(exe)) {
    throw Error('File does not exist: ' + exe);
  }
 
  var args = [];
  if (capabilities.has(Key.HOST)) {
    args.push('--host=' + capabilities.get(Key.HOST));
  }
  if (capabilities.has(Key.LOG_FILE)) {
    args.push('--log-file=' + capabilities.get(Key.LOG_FILE));
  }
  if (capabilities.has(Key.LOG_LEVEL)) {
    args.push('--log-level=' + capabilities.get(Key.LOG_LEVEL));
  }
  if (capabilities.has(Key.EXTRACT_PATH)) {
    args.push('--extract-path=' + capabilities.get(Key.EXTRACT_PATH));
  }
  if (capabilities.get(Key.SILENT)) {
    args.push('--silent');
  }

  var port = portprober.findFreePort();
  return new remote.DriverService(exe, {
    loopback: true,
    port: port,
    args: port.then(function(port) {
      return args.concat('--port=' + port);
    }),
    stdio: 'ignore'
  });
}


/**
 * A WebDriver client for Microsoft's Internet Explorer.
 *
 * @param {(webdriver.Capabilities|Options)=} opt_config The configuration
 *     options.
 * @param {webdriver.promise.ControlFlow=} opt_flow The control flow to use, or
 *     {@code null} to use the currently active flow.
 * @constructor
 * @extends {webdriver.WebDriver}
 */
var Driver = function(opt_config, opt_flow) {
  var capabilities = opt_config instanceof Options ? 
      opt_config.toCapabilities() :
      (opt_config || webdriver.Capabilities.ie());

  var service = createServiceFromCapabilities(capabilities);
  var executor = executors.createExecutor(service.start());
  var driver = webdriver.WebDriver.createSession(
      executor, capabilities, opt_flow);

  webdriver.WebDriver.call(
      this, driver.getSession(), executor, driver.controlFlow());

  var boundQuit = this.quit.bind(this);

  /** @override */
  this.quit = function() {
    return boundQuit().thenFinally(service.kill.bind(service));
  };
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
exports.Level = Level;
