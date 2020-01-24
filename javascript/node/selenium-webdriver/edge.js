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
 * @fileoverview Defines a {@linkplain Driver WebDriver} client for
 * Microsoft's Edge web browser. Before using this module,
 * you must download and install the latest
 * [MicrosoftEdgeDriver](http://go.microsoft.com/fwlink/?LinkId=619687) server.
 * Ensure that the MicrosoftEdgeDriver is on your
 * [PATH](http://en.wikipedia.org/wiki/PATH_%28variable%29).
 *
 * There are three primary classes exported by this module:
 *
 * 1. {@linkplain ServiceBuilder}: configures the
 *     {@link ./remote.DriverService remote.DriverService}
 *     that manages the [MicrosoftEdgeDriver] child process.
 *
 * 2. {@linkplain Options}: defines configuration options for each new
 *     MicrosoftEdgeDriver session, such as which
 *     {@linkplain Options#setProxy proxy} to use when starting the browser.
 *
 * 3. {@linkplain Driver}: the WebDriver client; each new instance will control
 *     a unique browser session.
 *
 * __Customizing the MicrosoftEdgeDriver Server__ <a id="custom-server"></a>
 *
 * By default, every MicrosoftEdge session will use a single driver service,
 * which is started the first time a {@link Driver} instance is created and
 * terminated when this process exits. The default service will inherit its
 * environment from the current process.
 * You may obtain a handle to this default service using
 * {@link #getDefaultService getDefaultService()} and change its configuration
 * with {@link #setDefaultService setDefaultService()}.
 *
 * You may also create a {@link Driver} with its own driver service. This is
 * useful if you need to capture the server's log output for a specific session:
 *
 *     var edge = require('selenium-webdriver/edge');
 *
 *     var service = new edge.ServiceBuilder()
 *         .setPort(55555)
 *         .build();
 *
 *     var options = new edge.Options();
 *     // configure browser options ...
 *
 *     var driver = edge.Driver.createSession(options, service);
 *
 * Users should only instantiate the {@link Driver} class directly when they
 * need a custom driver service configuration (as shown above). For normal
 * operation, users should start MicrosoftEdge using the
 * {@link ./builder.Builder selenium-webdriver.Builder}.
 *
 * [MicrosoftEdgeDriver]: https://msdn.microsoft.com/en-us/library/mt188085(v=vs.85).aspx
 */

'use strict';

const http = require('./http');
const io = require('./io');
const remote = require('./remote');
const webdriver = require('./lib/webdriver');
const {Browser, Capabilities} = require('./lib/capabilities');
const chromium = require('./chromium');

const EDGEDRIVER_LEGACY_EXE = 'MicrosoftWebDriver.exe';
const EDGEDRIVER_CHROMIUM_EXE =
    process.platform === 'win32' ? 'msedgedriver.exe' : 'msedgedriver';

const EDGE_DEV_CHANNEL_EXECUTABLE_PATH =
    process.platform === 'win32' ? 'C:\\Program Files (x86)\\Microsoft\\Edge Dev\\Application\\msedge.exe' :
    process.platform === 'darwin' /*macOS*/ ? '/Applications/Microsoft Edge Dev.app/Contents/MacOS/Microsoft Edge Dev' : null;

function getDownloadMessage(exe) {
  return 'The Microsoft Edge Driver could not be found on the current PATH. Please ' +
         'download the latest version of ' + exe + ' from ' +
         'https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/ and ' +
         'ensure it can be found on your PATH.';
}

/**
 * _Synchronously_ attempts to locate the msedgedriver executable on the current
 * system.
 *
 * @return {?string} the located executable, or `null`.
 */
function locateSynchronously() {
  return io.findInPath(EDGEDRIVER_CHROMIUM_EXE, true);
}

/**
 * _Synchronously_ attempts to locate the legacy MicrosoftWebDriver executable
 * on the current system.
 *
 * @return {?string} the located executable, or `null`.
 */
function locateLegacyDriverSynchronously() {
  return process.platform === 'win32'
      ? io.findInPath(EDGEDRIVER_LEGACY_EXE, true) : null;
}

/**
 * Class for managing Edge specific options.
 */
class Options extends chromium.Options {}

Options.prototype.BROWSER_NAME_VALUE = Browser.EDGE;
Options.prototype.CAPABILITY_KEY = 'ms:edgeOptions';
Options.prototype.VENDOR_CAPABILITY_PREFIX = 'ms';


/**
 * Creates {@link remote.DriverService} instances that manage an
 * msedgedriver server in a child process. Used for driving
 * Microsoft Edge Chromium.
 */
class ServiceBuilder extends chromium.ServiceBuilder {
  /**
   * @param {string=} opt_exe Path to the server executable to use. If omitted,
   *     the builder will attempt to locate the msedgedriver on the current
   *     PATH.
   * @throws {Error} If provided executable does not exist, or the msedgedriver
   *     cannot be found on the PATH.
   */
  constructor(opt_exe) {
    let exe = opt_exe || locateSynchronously();
    if (!exe) {
      throw Error(getDownloadMessage(EDGEDRIVER_CHROMIUM_EXE));
    }

    super(exe);
  }
}

/**
 * Creates {@link remote.DriverService} instances that manage a
 * MicrosoftWebDriver server in a child process. Used for driving
 * Microsoft Edge Legacy.
 */
ServiceBuilder.Legacy = class extends remote.DriverService.Builder {
  /**
   * @param {string=} opt_exe Path to the server executable to use. If omitted,
   *   the builder will attempt to locate the MicrosoftEdgeDriver on the current
   *   PATH.
   * @throws {Error} If provided executable does not exist, or the
   *   MicrosoftWebDriver cannot be found on the PATH.
   */
  constructor(opt_exe) {
    let exe = opt_exe || locateLegacyDriverSynchronously();
    if (!exe) {
      throw Error(getDownloadMessage(EDGEDRIVER_LEGACY_EXE));
    }

    super(exe);

    // Binding to the loopback address will fail if not running with
    // administrator privileges. Since we cannot test for that in script
    // (or can we?), force the DriverService to use "localhost".
    this.setHostname('localhost');
  }

  /**
   * Enables verbose logging.
   * @return {!ServiceBuilder} A self reference.
   */
  enableVerboseLogging() {
    return this.addArguments('--verbose');
  }
}


/** @type {remote.DriverService} */
var defaultService = null;


/**
 * Sets the default service to use for new MicrosoftEdgeDriver instances.
 * @param {!remote.DriverService} service The service to use.
 * @throws {Error} If the default service is currently running.
 */
function setDefaultService(service) {
  if (defaultService && defaultService.isRunning()) {
    throw Error(
      'The previously configured EdgeDriver service is still running. ' +
      'You must shut it down before you may adjust its configuration.');
  }
  defaultService = service;
}


/**
 * Returns the default Microsoft Edge driver service. If such a service has
 * not been configured, one will be constructed using the default configuration
 * for a driver executable found on the system PATH. This will look for the legacy
 * MicrosoftWebDriver executable by default. To use Edge Chromium with msedgedriver,
 * you will need to create the driver service manually.
 * @return {!remote.DriverService} The default Microsoft Edge driver service.
 */
function getDefaultService() {
  if (!defaultService) {
    defaultService = new ServiceBuilder.Legacy().build();
  }
  return defaultService;
}


/**
 * Creates a new WebDriver client for Microsoft's Edge.
 */
class Driver extends webdriver.WebDriver {
  /**
   * Creates a new browser session for Microsoft's Edge browser.
   *
   * @param {(Capabilities|Options)=} options The configuration options.
   * @param {remote.DriverService=} service The session to use; will use
   *     the {@linkplain #getDefaultService default service} by default.
   * @return {!Driver} A new driver instance.
   */
  static createSession(options, opt_service) {
    let service = opt_service || getDefaultService();
    let client = service.start().then(url => new http.HttpClient(url));
    let executor = new http.Executor(client);

    options = options || new Options();
    return /** @type {!Driver} */(super.createSession(
        executor, options, () => service.kill()));
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
exports.locateSynchronously = locateSynchronously;
exports.locateLegacyDriverSynchronously = locateLegacyDriverSynchronously;
exports.EDGE_DEV_CHANNEL_EXECUTABLE_PATH = EDGE_DEV_CHANNEL_EXECUTABLE_PATH;