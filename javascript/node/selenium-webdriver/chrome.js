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
 * __Headless Chrome__ <a id="headless"></a>
 *
 * To start Chrome in headless mode, simply call
 * {@linkplain Options#headless Options.headless()}.
 *
 *     let chrome = require('selenium-webdriver/chrome');
 *     let {Builder} = require('selenium-webdriver');
 *
 *     let driver = new Builder()
 *         .forBrowser('chrome')
 *         .setChromeOptions(new chrome.Options().headless())
 *         .build();
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
 *     let chrome = require('selenium-webdriver/chrome');
 *
 *     let service = new chrome.ServiceBuilder()
 *         .loggingTo('/my/log/file.txt')
 *         .enableVerboseLogging()
 *         .build();
 *
 *     let options = new chrome.Options();
 *     // configure browser options ...
 *
 *     let driver = chrome.Driver.createSession(options, service);
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
 *     let service = new chrome.ServiceBuilder()
 *         .setAdbPort(1234)
 *         build();
 *     // etc.
 *
 * The ChromeDriver may be configured to launch Chrome on Android using
 * {@link Options#androidChrome()}:
 *
 *     let driver = new Builder()
 *         .forBrowser('chrome')
 *         .setChromeOptions(new chrome.Options().androidChrome())
 *         .build();
 *
 * Alternatively, you can configure the ChromeDriver to launch an app with a
 * Chrome-WebView by setting the {@linkplain Options#androidActivity
 * androidActivity} option:
 *
 *     let driver = new Builder()
 *         .forBrowser('chrome')
 *         .setChromeOptions(new chrome.Options()
 *             .androidPackage('com.example')
 *             .androidActivity('com.example.Activity'))
 *         .build();
 *
 * [Refer to the ChromeDriver site] for more information on using the
 * [ChromeDriver with Android][android].
 *
 * [ChromeDriver]: https://chromedriver.chromium.org/
 * [ChromeDriver release]: http://chromedriver.storage.googleapis.com/index.html
 * [PATH]: http://en.wikipedia.org/wiki/PATH_%28variable%29
 * [android]: https://chromedriver.chromium.org/getting-started/getting-started---android
 * [webview]: https://developer.chrome.com/multidevice/webview/overview
 */

'use strict';

const http = require('./http');
const io = require('./io');
const {Browser, Capabilities} = require('./lib/capabilities');
const remote = require('./remote');
const chromium = require('./chromium');


/**
 * Name of the ChromeDriver executable.
 * @type {string}
 * @const
 */
const CHROMEDRIVER_EXE =
    process.platform === 'win32' ? 'chromedriver.exe' : 'chromedriver';


/**
 * Custom command names supported by ChromeDriver.
 * @enum {string}
 */
const Command = {
  LAUNCH_APP: 'launchApp',
  GET_NETWORK_CONDITIONS: 'getNetworkConditions',
  SET_NETWORK_CONDITIONS: 'setNetworkConditions',
  SEND_DEVTOOLS_COMMAND: 'sendDevToolsCommand',
  SEND_AND_GET_DEVTOOLS_COMMAND: 'sendAndGetDevToolsCommand',

  GET_CAST_SINKS: 'getCastSinks',
  SET_CAST_SINK_TO_USE: 'setCastSinkToUse',
  START_CAST_TAB_MIRRORING: 'setCastTabMirroring',
  GET_CAST_ISSUE_MESSAGE: 'getCastIssueMessage',
  STOP_CASTING: 'stopCasting',
};


/**
 * Creates a command executor with support for ChromeDriver's custom commands.
 * @param {!Promise<string>} url The server's URL.
 * @return {!command.Executor} The new command executor.
 */
function createExecutor(url) {
  let agent = new http.Agent({ keepAlive: true });
  let client = url.then(url => new http.HttpClient(url, agent));
  let executor = new http.Executor(client);
  configureExecutor(executor);
  return executor;
}


/**
 * Configures the given executor with Chrome-specific commands.
 * @param {!http.Executor} executor the executor to configure.
 */
function configureExecutor(executor) {
  executor.defineCommand(
      Command.LAUNCH_APP,
      'POST',
      '/session/:sessionId/chromium/launch_app');
  executor.defineCommand(
      Command.GET_NETWORK_CONDITIONS,
      'GET',
      '/session/:sessionId/chromium/network_conditions');
  executor.defineCommand(
      Command.SET_NETWORK_CONDITIONS,
      'POST',
      '/session/:sessionId/chromium/network_conditions');
  executor.defineCommand(
      Command.SEND_DEVTOOLS_COMMAND,
      'POST',
      '/session/:sessionId/chromium/send_command');
  executor.defineCommand(
      Command.SEND_AND_GET_DEVTOOLS_COMMAND,
      'POST',
      '/session/:sessionId/chromium/send_command_and_get_result');
  executor.defineCommand(
      Command.GET_CAST_SINKS,
      'GET',
      '/session/:sessionId/goog/cast/get_sinks');
  executor.defineCommand(
      Command.SET_CAST_SINK_TO_USE,
      'POST',
      '/session/:sessionId/goog/cast/set_sink_to_use');
  executor.defineCommand(
      Command.START_CAST_TAB_MIRRORING,
      'POST',
      '/session/:sessionId/goog/cast/start_tab_mirroring');
  executor.defineCommand(
      Command.GET_CAST_ISSUE_MESSAGE,
      'GET',
      '/session/:sessionId/goog/cast/get_issue_message');
  executor.defineCommand(
      Command.STOP_CASTING,
      'POST',
      '/session/:sessionId/goog/cast/stop_casting');
}


/**
 * _Synchronously_ attempts to locate the chromedriver executable on the current
 * system.
 *
 * @return {?string} the located executable, or `null`.
 */
function locateSynchronously() {
  return io.findInPath(CHROMEDRIVER_EXE, true);
}


/**
 * Creates {@link selenium-webdriver/remote.DriverService} instances that manage
 * a [ChromeDriver](https://chromedriver.chromium.org/)
 * server in a child process.
 */
class ServiceBuilder extends chromium.ServiceBuilder {
  /**
   * @param {string=} opt_exe Path to the server executable to use. If omitted,
   *     the builder will attempt to locate the chromedriver on the current
   *     PATH.
   * @throws {Error} If provided executable does not exist, or the chromedriver
   *     cannot be found on the PATH.
   */
  constructor(opt_exe) {
    let exe = opt_exe || locateSynchronously();
    if (!exe) {
      throw Error(
          'The ChromeDriver could not be found on the current PATH. Please ' +
          'download the latest version of the ChromeDriver from ' +
          'http://chromedriver.storage.googleapis.com/index.html and ensure ' +
          'it can be found on your PATH.');
    }

    super(exe);
  }
}


/** @type {remote.DriverService} */
let defaultService = null;


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
 * Class for managing ChromeDriver specific options.
 */
class Options extends chromium.Options {
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
  setChromeBinaryPath(path) {
    return this.setBinaryPath(path);
  }

  /**
   * Configures the ChromeDriver to launch Chrome on Android via adb. This
   * function is shorthand for
   * {@link #androidPackage options.androidPackage('com.android.chrome')}.
   * @return {!Options} A self reference.
   */
  androidChrome() {
    return this.androidPackage('com.android.chrome');
  }

  /**
   * Sets the path to Chrome's log file. This path should exist on the machine
   * that will launch Chrome.
   * @param {string} path Path to the log file to use.
   * @return {!Options} A self reference.
   */
  setChromeLogFile(path) {
    return this.setBrowserLogFile(path);
  }

  /**
   * Sets the directory to store Chrome minidumps in. This option is only
   * supported when ChromeDriver is running on Linux.
   * @param {string} path The directory path.
   * @return {!Options} A self reference.
   */
  setChromeMinidumpPath(path) {
    return this.setBrowserMinidumpPath(path);
  }
}

Options.prototype.CAPABILITY_KEY = 'goog:chromeOptions';
Options.prototype.BROWSER_NAME_VALUE = Browser.CHROME;


/**
 * Creates a new WebDriver client for Chrome.
 */
class Driver extends chromium.Driver {
  /**
   * Creates a new session with the ChromeDriver.
   *
   * @param {(Capabilities|Options)=} opt_config The configuration options.
   * @param {(remote.DriverService|http.Executor)=} opt_serviceExecutor Either
   *     a  DriverService to use for the remote end, or a preconfigured executor
   *     for an externally managed endpoint. If neither is provided, the
   *     {@linkplain ##getDefaultService default service} will be used by
   *     default.
   * @return {!Driver} A new driver instance.
   */
  static createSession(opt_config, opt_serviceExecutor) {
    let caps = opt_config || new Options();
    return /** @type {!Driver} */(super.createSession(caps, opt_serviceExecutor));
  }

  /**
   * This function is a no-op as file detectors are not supported by this
   * implementation.
   * @override
   */
  setFileDetector() {}

  /**
   * Schedules a command to launch Chrome App with given ID.
   * @param {string} id ID of the App to launch.
   * @return {!Promise<void>} A promise that will be resolved
   *     when app is launched.
   */
  launchApp(id) {
    return this.execute(
        new command.Command(Command.LAUNCH_APP).setParameter('id', id));
  }

  /**
   * Schedules a command to get Chrome network emulation settings.
   * @return {!Promise} A promise that will be resolved when network
   *     emulation settings are retrievied.
   */
  getNetworkConditions() {
    return this.execute(new command.Command(Command.GET_NETWORK_CONDITIONS));
  }

  /**
   * Schedules a command to set Chrome network emulation settings.
   *
   * __Sample Usage:__
   *
   *  driver.setNetworkConditions({
   *    offline: false,
   *    latency: 5, // Additional latency (ms).
   *    download_throughput: 500 * 1024, // Maximal aggregated download throughput.
   *    upload_throughput: 500 * 1024 // Maximal aggregated upload throughput.
   * });
   *
   * @param {Object} spec Defines the network conditions to set
   * @return {!Promise<void>} A promise that will be resolved when network
   *     emulation settings are set.
   */
  setNetworkConditions(spec) {
    if (!spec || typeof spec !== 'object') {
      throw TypeError('setNetworkConditions called with non-network-conditions parameter');
    }
    return this.execute(
        new command.Command(Command.SET_NETWORK_CONDITIONS)
            .setParameter('network_conditions', spec));
  }

  /**
   * Sends an arbitrary devtools command to the browser.
   *
   * @param {string} cmd The name of the command to send.
   * @param {Object=} params The command parameters.
   * @return {!Promise<void>} A promise that will be resolved when the command
   *     has finished.
   * @see <https://chromedevtools.github.io/devtools-protocol/>
   */
  sendDevToolsCommand(cmd, params = {}) {
    return this.execute(
        new command.Command(Command.SEND_DEVTOOLS_COMMAND)
            .setParameter('cmd', cmd)
            .setParameter('params', params));
  }

  /**
   * Sends an arbitrary devtools command to the browser and get the result.
   *
   * @param {string} cmd The name of the command to send.
   * @param {Object=} params The command parameters.
   * @return {!Promise<Object>} A promise that will be resolved when the command
   *     has finished.
   * @see <https://chromedevtools.github.io/devtools-protocol/>
   */
  sendAndGetDevToolsCommand(cmd, params = {}) {
    return this.schedule(
      new command.Command(Command.SEND_AND_GET_DEVTOOLS_COMMAND)
        .setParameter('cmd', cmd)
        .setParameter('params', params)
    );
  }

  /**
   * Sends a DevTools command to change Chrome's download directory.
   *
   * @param {string} path The desired download directory.
   * @return {!Promise<void>} A promise that will be resolved when the command
   *     has finished.
   * @see #sendDevToolsCommand
   */
  async setDownloadPath(path) {
    if (!path || typeof path !== 'string') {
      throw new error.InvalidArgumentError('invalid download path');
    }
    const stat = await io.stat(path);
    if (!stat.isDirectory()) {
      throw new error.InvalidArgumentError('not a directory: ' + path);
    }
    return this.sendDevToolsCommand('Page.setDownloadBehavior', {
      'behavior': 'allow',
      'downloadPath': path
    });
  }


  /**
   * Returns the list of cast sinks (Cast devices) available to the Chrome media router.
   *
   * @return {!promise.Thenable<void>} A promise that will be resolved with an array of Strings
   *   containing the friendly device names of available cast sink targets.
   */
  getCastSinks() {
    return this.schedule(
        new command.Command(Command.GET_CAST_SINKS),
        'Driver.getCastSinks()');
  }

  /**
   * Selects a cast sink (Cast device) as the recipient of media router intents (connect or play).
   *
   * @param {String} Friendly name of the target device.
   * @return {!promise.Thenable<void>} A promise that will be resolved
   *     when the target device has been selected to respond further webdriver commands.
   */
  setCastSinkToUse(deviceName) {
    return this.schedule(
        new command.Command(Command.SET_CAST_SINK_TO_USE).setParameter('sinkName', deviceName),
        'Driver.setCastSinkToUse(' + deviceName + ')');
  }

  /**
   * Initiates tab mirroring for the current browser tab on the specified device.
   *
   * @param {String} Friendly name of the target device.
   * @return {!promise.Thenable<void>} A promise that will be resolved
   *     when the mirror command has been issued to the device.
   */
  startCastTabMirroring(deviceName) {
    return this.schedule(
        new command.Command(Command.START_CAST_TAB_MIRRORING).setParameter('sinkName', deviceName),
        'Driver.startCastTabMirroring(' + deviceName + ')');
  }

  /**
   *  a
   *
   * @param {String} Friendly name of the target device.
   * @return {!promise.Thenable<void>} A promise that will be resolved
   *     when the mirror command has been issued to the device.
   */
  getCastIssueMessage() {
    return this.schedule(
        new command.Command(Command.GET_CAST_ISSUE_MESSAGE),
        'Driver.getCastIssueMessage()');
  }

  /**
   * Stops casting from media router to the specified device, if connected.
   *
   * @param {String} Friendly name of the target device.
   * @return {!promise.Thenable<void>} A promise that will be resolved
   *     when the stop command has been issued to the device.
   */
  stopCasting(deviceName) {
    return this.schedule(
        new command.Command(Command.STOP_CASTING).setParameter('sinkName', deviceName),
        'Driver.stopCasting(' + deviceName + ')');
  }
}

Driver.getDefaultService = getDefaultService;
Driver.prototype.VENDOR_COMMAND_PREFIX = "goog";


// PUBLIC API


exports.Driver = Driver;
exports.Options = Options;
exports.ServiceBuilder = ServiceBuilder;
exports.getDefaultService = getDefaultService;
exports.setDefaultService = setDefaultService;
exports.locateSynchronously = locateSynchronously;
