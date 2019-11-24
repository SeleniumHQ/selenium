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

const fs = require('fs');
const util = require('util');

const http = require('./http');
const io = require('./io');
const portprober = require('./net/portprober');
const promise = require('./lib/promise');
const remote = require('./remote');
const Symbols = require('./lib/symbols');
const webdriver = require('./lib/webdriver');
const {Browser, Capabilities} = require('./lib/capabilities');

const EDGEDRIVER_EXE = 'MicrosoftWebDriver.exe';


/**
 * _Synchronously_ attempts to locate the edge driver executable on the current
 * system.
 *
 * @return {?string} the located executable, or `null`.
 */
function locateSynchronously() {
  return process.platform === 'win32'
      ? io.findInPath(EDGEDRIVER_EXE, true) : null;
}


/**
 * Class for managing MicrosoftEdgeDriver specific options.
 */
class Options extends Capabilities {
  /**
   * @param {(Capabilities|Map<string, ?>|Object)=} other Another set of
   *     capabilities to initialize this instance from.
   */
  constructor(other = undefined) {
    super(other);
    this.setBrowserName(Browser.EDGE);
  }
}


/**
 * Creates {@link remote.DriverService} instances that manage a
 * MicrosoftEdgeDriver server in a child process.
 */
class ServiceBuilder extends remote.DriverService.Builder {
  /**
   * @param {string=} opt_exe Path to the server executable to use. If omitted,
   *   the builder will attempt to locate the MicrosoftEdgeDriver on the current
   *   PATH.
   * @throws {Error} If provided executable does not exist, or the
   *   MicrosoftEdgeDriver cannot be found on the PATH.
   */
  constructor(opt_exe) {
    let exe = opt_exe || locateSynchronously();
    if (!exe) {
      throw Error(
        'The ' + EDGEDRIVER_EXE + ' could not be found on the current PATH. ' +
        'Please download the latest version of the MicrosoftEdgeDriver from ' +
        'https://www.microsoft.com/en-us/download/details.aspx?id=48212 and ' +
        'ensure it can be found on your PATH.');
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
 * Returns the default MicrosoftEdgeDriver service. If such a service has
 * not been configured, one will be constructed using the default configuration
 * for an MicrosoftEdgeDriver executable found on the system PATH.
 * @return {!remote.DriverService} The default MicrosoftEdgeDriver service.
 */
function getDefaultService() {
  if (!defaultService) {
    defaultService = new ServiceBuilder().build();
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
