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
 * @fileoverview Defines a {@linkplain Driver WebDriver} client for the Chrome
 * web browser. Before using this module, you must download the latest
 * [ChromeDriver release] and ensure it can be found on your system [PATH].
 *
 * There are three primary classes exported by this module:
 *
 * 1. {@linkplain ServiceBuilder}: configures the
 *     {@link selenium-webdriver/remote.DriverService remote.DriverService}
 *     that manages the [ChromeDriver] child process.
 *
 * 2. {@linkplain Options}: defines configuration options for each new Chrome
 *     session, such as which {@linkplain Options#setProxy proxy} to use,
 *     what {@linkplain Options#addExtensions extensions} to install, or
 *     what {@linkplain Options#addArguments command-line switches} to use when
 *     starting the browser.
 *
 * 3. {@linkplain Driver}: the WebDriver client; each new instance will control
 *     a unique browser session with a clean user profile (unless otherwise
 *     configured through the {@link Options} class).
 *
 * __Customizing the ChromeDriver Server__ <a id="custom-server"></a>
 *
 * By default, every Chrome session will use a single driver service, which is
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
 *     var chrome = require('selenium-webdriver/chrome');
 *
 *     var service = new chrome.ServiceBuilder()
 *         .loggingTo('/my/log/file.txt')
 *         .enableVerboseLogging()
 *         .build();
 *
 *     var options = new chrome.Options();
 *     // configure browser options ...
 *
 *     var driver = new chrome.Driver(options, service);
 *
 * Users should only instantiate the {@link Driver} class directly when they
 * need a custom driver service configuration (as shown above). For normal
 * operation, users should start Chrome using the
 * {@link selenium-webdriver.Builder}.
 *
 * __Working with Android__ <a id="android"></a>
 *
 * The [ChromeDriver][android] supports running tests on the Chrome browser as
 * well as [WebView apps][webview] starting in Android 4.4 (KitKat). In order to
 * work with Android, you must first start the adb
 *
 *     adb start-server
 *
 * By default, adb will start on port 5037. You may change this port, but this
 * will require configuring a [custom server](#custom-server) that will connect
 * to adb on the {@linkplain ServiceBuilder#setAdbPort correct port}:
 *
 *     var service = new chrome.ServiceBuilder()
 *         .setAdbPort(1234)
 *         build();
 *     // etc.
 *
 * The ChromeDriver may be configured to launch Chrome on Android using
 * {@link Options#androidChrome()}:
 *
 *     var driver = new Builder()
 *         .forBrowser('chrome')
 *         .setChromeOptions(new chrome.Options().androidChrome())
 *         .build();
 *
 * Alternatively, you can configure the ChromeDriver to launch an app with a
 * Chrome-WebView by setting the {@linkplain Options#androidActivity
 * androidActivity} option:
 *
 *     var driver = new Builder()
 *         .forBrowser('chrome')
 *         .setChromeOptions(new chrome.Options()
 *             .androidPackage('com.example')
 *             .androidActivity('com.example.Activity'))
 *         .build();
 *
 * [Refer to the ChromeDriver site] for more information on using the
 * [ChromeDriver with Android][android].
 *
 * [ChromeDriver]: https://sites.google.com/a/chromium.org/chromedriver/
 * [ChromeDriver release]: http://chromedriver.storage.googleapis.com/index.html
 * [PATH]: http://en.wikipedia.org/wiki/PATH_%28variable%29
 * [android]: https://sites.google.com/a/chromium.org/chromedriver/getting-started/getting-started---android
 * [webview]: https://developer.chrome.com/multidevice/webview/overview
 */

'use strict';

var fs = require('fs'),
    util = require('util');

var webdriver = require('./index'),
    executors = require('./executors'),
    http = require('./http'),
    io = require('./io'),
    portprober = require('./net/portprober'),
    remote = require('./remote');


/**
 * Name of the ChromeDriver executable.
 * @type {string}
 * @const
 */
var CHROMEDRIVER_EXE =
    process.platform === 'win32' ? 'chromedriver.exe' : 'chromedriver';


/**
 * Custom command names supported by ChromeDriver.
 * @enum {string}
 */
var Command = {
  LAUNCH_APP: 'launchApp'
};


/**
 * Creates a command executor with support for ChromeDriver's custom commands.
 * @param {!webdriver.promise.Promise<string>} url The server's URL.
 * @return {!webdriver.CommandExecutor} The new command executor.
 */
function createExecutor(url) {
  return new executors.DeferredExecutor(url.then(function(url) {
    var client = new http.HttpClient(url);
    var executor = new http.Executor(client);
    executor.defineCommand(
        Command.LAUNCH_APP,
        'POST', '/session/:sessionId/chromium/launch_app');
    return executor;
  }));
}


/**
 * Creates {@link selenium-webdriver/remote.DriverService} instances that manage
 * a [ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/)
 * server in a child process.
 *
 * @param {string=} opt_exe Path to the server executable to use. If omitted,
 *     the builder will attempt to locate the chromedriver on the current
 *     PATH.
 * @throws {Error} If provided executable does not exist, or the chromedriver
 *     cannot be found on the PATH.
 * @constructor
 */
var ServiceBuilder = function(opt_exe) {
  /** @private {string} */
  this.exe_ = opt_exe || io.findInPath(CHROMEDRIVER_EXE, true);
  if (!this.exe_) {
    throw Error(
        'The ChromeDriver could not be found on the current PATH. Please ' +
        'download the latest version of the ChromeDriver from ' +
        'http://chromedriver.storage.googleapis.com/index.html and ensure ' +
        'it can be found on your PATH.');
  }

  if (!fs.existsSync(this.exe_)) {
    throw Error('File does not exist: ' + this.exe_);
  }

  /** @private {!Array.<string>} */
  this.args_ = [];
  this.stdio_ = 'ignore';
};


/** @private {string} */
ServiceBuilder.prototype.path_ = null;

/** @private {number} */
ServiceBuilder.prototype.port_ = 0;


/** @private {(string|!Array.<string|number|!Stream|null|undefined>)} */
ServiceBuilder.prototype.stdio_ = 'ignore';


/** @private {Object.<string, string>} */
ServiceBuilder.prototype.env_ = null;


/**
 * Sets the port to start the ChromeDriver on.
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
 * Sets which port adb is listening to. _The ChromeDriver will connect to adb
 * if an {@linkplain Options#androidPackage Android session} is requested, but
 * adb **must** be started beforehand._
 *
 * @param {number} port Which port adb is running on.
 * @return {!ServiceBuilder} A self reference.
 */
ServiceBuilder.prototype.setAdbPort = function(port) {
  this.args_.push('--adb-port=' + port);
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
 * Sets the number of threads the driver should use to manage HTTP requests.
 * By default, the driver will use 4 threads.
 * @param {number} n The number of threads to use.
 * @return {!ServiceBuilder} A self reference.
 */
ServiceBuilder.prototype.setNumHttpThreads = function(n) {
  this.args_.push('--http-threads=' + n);
  return this;
};


/**
 * Sets the base path for WebDriver REST commands (e.g. "/wd/hub").
 * By default, the driver will accept commands relative to "/".
 * @param {string} path The base path to use.
 * @return {!ServiceBuilder} A self reference.
 */
ServiceBuilder.prototype.setUrlBasePath = function(path) {
  this.args_.push('--url-base=' + path);
  this.path_ = path;
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
    path: this.path_,
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
 * Sets the default service to use for new ChromeDriver instances.
 * @param {!remote.DriverService} service The service to use.
 * @throws {Error} If the default service is currently running.
 */
function setDefaultService(service) {
  if (defaultService && defaultService.isRunning()) {
    throw Error(
        'The previously configured ChromeDriver service is still running. ' +
        'You must shut it down before you may adjust its configuration.');
  }
  defaultService = service;
}


/**
 * Returns the default ChromeDriver service. If such a service has not been
 * configured, one will be constructed using the default configuration for
 * a ChromeDriver executable found on the system PATH.
 * @return {!remote.DriverService} The default ChromeDriver service.
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
 * Class for managing ChromeDriver specific options.
 * @constructor
 * @extends {webdriver.Serializable}
 */
var Options = function() {
  webdriver.Serializable.call(this);

  /** @private {!Object} */
  this.options_ = {};

  /** @private {!Array.<(string|!Buffer)>} */
  this.extensions_ = [];

  /** @private {?webdriver.logging.Preferences} */
  this.logPrefs_ = null;

  /** @private {?webdriver.ProxyConfig} */
  this.proxy_ = null;
};
util.inherits(Options, webdriver.Serializable);


/**
 * Extracts the ChromeDriver specific options from the given capabilities
 * object.
 * @param {!webdriver.Capabilities} capabilities The capabilities object.
 * @return {!Options} The ChromeDriver options.
 */
Options.fromCapabilities = function(capabilities) {
  var options = new Options();

  var o = capabilities.get(OPTIONS_CAPABILITY_KEY);
  if (o instanceof Options) {
    options = o;
  } else if (o) {
    options.
        addArguments(o.args || []).
        addExtensions(o.extensions || []).
        detachDriver(o.detach).
        excludeSwitches(o.excludeSwitches || []).
        setChromeBinaryPath(o.binary).
        setChromeLogFile(o.logPath).
        setChromeMinidumpPath(o.minidumpPath).
        setLocalState(o.localState).
        setMobileEmulation(o.mobileEmulation).
        setUserPreferences(o.prefs).
        setPerfLoggingPrefs(o.perfLoggingPrefs);
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
 * Add additional command line arguments to use when launching the Chrome
 * browser.  Each argument may be specified with or without the "--" prefix
 * (e.g. "--foo" and "foo"). Arguments with an associated value should be
 * delimited by an "=": "foo=bar".
 * @param {...(string|!Array.<string>)} var_args The arguments to add.
 * @return {!Options} A self reference.
 */
Options.prototype.addArguments = function(var_args) {
  var args = this.options_.args || [];
  args = args.concat.apply(args, arguments);
  if (args.length) {
    this.options_.args = args;
  }
  return this;
};


/**
 * List of Chrome command line switches to exclude that ChromeDriver by default
 * passes when starting Chrome.  Do not prefix switches with "--".
 *
 * @param {...(string|!Array<string>)} var_args The switches to exclude.
 * @return {!Options} A self reference.
 */
Options.prototype.excludeSwitches = function(var_args) {
  var switches = this.options_.excludeSwitches || [];
  switches = switches.concat.apply(switches, arguments);
  if (switches.length) {
    this.options_.excludeSwitches = switches;
  }
  return this;
};


/**
 * Add additional extensions to install when launching Chrome. Each extension
 * should be specified as the path to the packed CRX file, or a Buffer for an
 * extension.
 * @param {...(string|!Buffer|!Array.<(string|!Buffer)>)} var_args The
 *     extensions to add.
 * @return {!Options} A self reference.
 */
Options.prototype.addExtensions = function(var_args) {
  this.extensions_ = this.extensions_.concat.apply(this.extensions_, arguments);
  return this;
};


/**
 * Sets the path to the Chrome binary to use. On Mac OS X, this path should
 * reference the actual Chrome executable, not just the application binary
 * (e.g. "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome").
 *
 * The binary path be absolute or relative to the chromedriver server
 * executable, but it must exist on the machine that will launch Chrome.
 *
 * @param {string} path The path to the Chrome binary to use.
 * @return {!Options} A self reference.
 */
Options.prototype.setChromeBinaryPath = function(path) {
  this.options_.binary = path;
  return this;
};


/**
 * Sets whether to leave the started Chrome browser running if the controlling
 * ChromeDriver service is killed before {@link webdriver.WebDriver#quit()} is
 * called.
 * @param {boolean} detach Whether to leave the browser running if the
 *     chromedriver service is killed before the session.
 * @return {!Options} A self reference.
 */
Options.prototype.detachDriver = function(detach) {
  this.options_.detach = detach;
  return this;
};


/**
 * Sets the user preferences for Chrome's user profile. See the "Preferences"
 * file in Chrome's user data directory for examples.
 * @param {!Object} prefs Dictionary of user preferences to use.
 * @return {!Options} A self reference.
 */
Options.prototype.setUserPreferences = function(prefs) {
  this.options_.prefs = prefs;
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
 * Sets the performance logging preferences. Options include:
 *
 * - `enableNetwork`: Whether or not to collect events from Network domain.
 * - `enablePage`: Whether or not to collect events from Page domain.
 * - `enableTimeline`: Whether or not to collect events from Timeline domain.
 *     Note: when tracing is enabled, Timeline domain is implicitly disabled,
 *     unless `enableTimeline` is explicitly set to true.
 * - `tracingCategories`: A comma-separated string of Chrome tracing categories
 *     for which trace events should be collected. An unspecified or empty
 *     string disables tracing.
 * - `bufferUsageReportingInterval`: The requested number of milliseconds
 *     between DevTools trace buffer usage events. For example, if 1000, then
 *     once per second, DevTools will report how full the trace buffer is. If a
 *     report indicates the buffer usage is 100%, a warning will be issued.
 *
 * @param {{enableNetwork: boolean,
 *          enablePage: boolean,
 *          enableTimeline: boolean,
 *          tracingCategories: string,
 *          bufferUsageReportingInterval: number}} prefs The performance
 *     logging preferences.
 * @return {!Options} A self reference.
 */
Options.prototype.setPerfLoggingPrefs = function(prefs) {
  this.options_.perfLoggingPrefs = prefs;
  return this;
};


/**
 * Sets preferences for the "Local State" file in Chrome's user data
 * directory.
 * @param {!Object} state Dictionary of local state preferences.
 * @return {!Options} A self reference.
 */
Options.prototype.setLocalState = function(state) {
  this.options_.localState = state;
  return this;
};


/**
 * Sets the name of the activity hosting a Chrome-based Android WebView. This
 * option must be set to connect to an [Android WebView](
 * https://sites.google.com/a/chromium.org/chromedriver/getting-started/getting-started---android)
 *
 * @param {string} name The activity name.
 * @return {!Options} A self reference.
 */
Options.prototype.androidActivity = function(name) {
  this.options_.androidActivity = name;
  return this;
};


/**
 * Sets the device serial number to connect to via ADB. If not specified, the
 * ChromeDriver will select an unused device at random. An error will be
 * returned if all devices already have active sessions.
 *
 * @param {string} serial The device serial number to connect to.
 * @return {!Options} A self reference.
 */
Options.prototype.androidDeviceSerial = function(serial) {
  this.options_.androidDeviceSerial = serial;
  return this;
};


/**
 * Configures the ChromeDriver to launch Chrome on Android via adb. This
 * function is shorthand for
 * {@link #androidPackage options.androidPackage('com.android.chrome')}.
 * @return {!Options} A self reference.
 */
Options.prototype.androidChrome = function() {
  return this.androidPackage('com.android.chrome');
};


/**
 * Sets the package name of the Chrome or WebView app.
 *
 * @param {?string} pkg The package to connect to, or `null` to disable Android
 *     and switch back to using desktop Chrome.
 * @return {!Options} A self reference.
 */
Options.prototype.androidPackage = function(pkg) {
  this.options_.androidPackage = pkg;
  return this;
};


/**
 * Sets the process name of the Activity hosting the WebView (as given by `ps`).
 * If not specified, the process name is assumed to be the same as
 * {@link #androidPackage}.
 *
 * @param {string} processName The main activity name.
 * @return {!Options} A self reference.
 */
Options.prototype.androidProcess = function(processName) {
  this.options_.androidProcess = processName;
  return this;
};


/**
 * Sets whether to connect to an already-running instead of the specified
 * {@linkplain #androidProcess app} instead of launching the app with a clean
 * data directory.
 *
 * @param {boolean} useRunning Whether to connect to a running instance.
 * @return {!Options} A self reference.
 */
Options.prototype.androidUseRunningApp = function(useRunning) {
  this.options_.androidUseRunningApp = useRunning;
  return this;
};


/**
 * Sets the path to Chrome's log file. This path should exist on the machine
 * that will launch Chrome.
 * @param {string} path Path to the log file to use.
 * @return {!Options} A self reference.
 */
Options.prototype.setChromeLogFile = function(path) {
  this.options_.logPath = path;
  return this;
};


/**
 * Sets the directory to store Chrome minidumps in. This option is only
 * supported when ChromeDriver is running on Linux.
 * @param {string} path The directory path.
 * @return {!Options} A self reference.
 */
Options.prototype.setChromeMinidumpPath = function(path) {
  this.options_.minidumpPath = path;
  return this;
};


/**
 * Configures Chrome to emulate a mobile device. For more information, refer to
 * the ChromeDriver project page on [mobile emulation][em]. Configuration
 * options include:
 *
 * - `deviceName`: The name of a pre-configured [emulated device][devem]
 * - `width`: screen width, in pixels
 * - `height`: screen height, in pixels
 * - `pixelRatio`: screen pixel ratio
 *
 * __Example 1: Using a Pre-configured Device__
 *
 *     var options = new chrome.Options().setMobileEmulation(
 *         {deviceName: 'Google Nexus 5'});
 *
 *     var driver = new chrome.Driver(options);
 *
 * __Example 2: Using Custom Screen Configuration__
 *
 *     var options = new chrome.Options().setMobileEmulation({
 *         width: 360,
 *         height: 640,
 *         pixelRatio: 3.0
 *     });
 *
 *     var driver = new chrome.Driver(options);
 *
 *
 * [em]: https://sites.google.com/a/chromium.org/chromedriver/mobile-emulation
 * [devem]: https://developer.chrome.com/devtools/docs/device-mode
 *
 * @param {?({deviceName: string}|
 *           {width: number, height: number, pixelRatio: number})} config The
 *     mobile emulation configuration, or `null` to disable emulation.
 * @return {!Options} A self reference.
 */
Options.prototype.setMobileEmulation = function(config) {
  this.options_.mobileEmulation = config;
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
  var capabilities = opt_capabilities || webdriver.Capabilities.chrome();
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
 *           extensions: !Array.<(string|!webdriver.promise.Promise.<string>)>,
 *           localState: (Object|undefined),
 *           logPath: (string|undefined),
 *           prefs: (Object|undefined)}} The JSON wire protocol representation
 *     of this instance.
 * @override
 */
Options.prototype.serialize = function() {
  var json = {};
  for (var key in this.options_) {
    if (this.options_[key] != null) {
      json[key] = this.options_[key];
    }
  }
  if (this.extensions_.length) {
    json.extensions = this.extensions_.map(function(extension) {
      if (Buffer.isBuffer(extension)) {
        return extension.toString('base64');
      }
      return webdriver.promise.checkedNodeCall(
          fs.readFile, extension, 'base64');
    });
  }
  return json;
};


/**
 * Creates a new WebDriver client for Chrome.
 *
 * @param {(webdriver.Capabilities|Options)=} opt_config The configuration
 *     options.
 * @param {remote.DriverService=} opt_service The session to use; will use
 *     the {@linkplain #getDefaultService default service} by default.
 * @param {webdriver.promise.ControlFlow=} opt_flow The control flow to use, or
 *     {@code null} to use the currently active flow.
 * @constructor
 * @extends {webdriver.WebDriver}
 */
var Driver = function(opt_config, opt_service, opt_flow) {
  var service = opt_service || getDefaultService();
  var executor = createExecutor(service.start());

  var capabilities =
      opt_config instanceof Options ? opt_config.toCapabilities() :
      (opt_config || webdriver.Capabilities.chrome());

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


/**
 * Schedules a command to launch Chrome App with given ID.
 * @param {string} id ID of the App to launch.
 * @return {!webdriver.promise.Promise<void>} A promise that will be resolved
 *     when app is launched.
 */
Driver.prototype.launchApp = function(id) {
  return this.schedule(
      new webdriver.Command(Command.LAUNCH_APP).setParameter('id', id),
      'Driver.launchApp()');
};


// PUBLIC API


exports.Driver = Driver;
exports.Options = Options;
exports.ServiceBuilder = ServiceBuilder;
exports.getDefaultService = getDefaultService;
exports.setDefaultService = setDefaultService;
