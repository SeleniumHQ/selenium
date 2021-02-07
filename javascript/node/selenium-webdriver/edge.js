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
 * Microsoft's Edge web browser. Both Edge (Chromium), and Edge Legacy (EdgeHTML) are
 * supported. Before using this module, you must download and install the correct
 * [WebDriver](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/)
 * server.
 *
 * Ensure that the either MicrosoftWebDriver (EdgeHTML) or msedgedriver (Chromium)
 * is on your [PATH](http://en.wikipedia.org/wiki/PATH_%28variable%29). MicrosoftWebDriver
 * and Edge Legacy (EdgeHTML) will be used by default.
 *
 * You may use {@link Options} to specify whether Edge Chromium should be used:

 *     var options = new edge.Options();
 *     options.useEdgeChromium(true);
 *     // configure browser options ...

 * Note that Chromium-specific {@link Options} will be ignored when using Edge Legacy.
 *
 * There are three primary classes exported by this module:
 *
 * 1. {@linkplain ServiceBuilder}: configures the
 *     {@link ./remote.DriverService remote.DriverService}
 *     that manages the [WebDriver] child process.
 *
 * 2. {@linkplain Options}: defines configuration options for each new
 *     WebDriver session, such as which
 *     {@linkplain Options#setProxy proxy} to use when starting the browser.
 *
 * 3. {@linkplain Driver}: the WebDriver client; each new instance will control
 *     a unique browser session.
 *
 * __Customizing the WebDriver Server__ <a id="custom-server"></a>
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
 * [WebDriver (EdgeHTML)]: https://docs.microsoft.com/en-us/microsoft-edge/webdriver
 * [WebDriver (Chromium)]: https://docs.microsoft.com/en-us/microsoft-edge/webdriver-chromium
 */

'use strict'

const http = require('./http')
const io = require('./io')
const webdriver = require('./lib/webdriver')
const { Browser, Capabilities } = require('./lib/capabilities')
const chromium = require('./chromium')

const EDGE_CHROMIUM_BROWSER_NAME = 'msedge'
const EDGEDRIVER_LEGACY_EXE = 'MicrosoftWebDriver.exe'
const EDGEDRIVER_CHROMIUM_EXE =
  process.platform === 'win32' ? 'msedgedriver.exe' : 'msedgedriver'

/**
 * _Synchronously_ attempts to locate the Edge driver executable
 * on the current system. Searches for the legacy MicrosoftWebDriver by default.
 *
 * @param {string=} browserName Name of the Edge driver executable to locate.
 *   May be either 'msedge' to locate the Edge Chromium driver, or 'MicrosoftEdge' to
 *   locate the Edge Legacy driver. If omitted, will attempt to locate Edge Legacy.
 * @return {?string} the located executable, or `null`.
 */
function locateSynchronously(browserName) {
  browserName = browserName || Browser.EDGE

  if (browserName === EDGE_CHROMIUM_BROWSER_NAME) {
    return io.findInPath(EDGEDRIVER_CHROMIUM_EXE, true)
  }

  return process.platform === 'win32'
    ? io.findInPath(EDGEDRIVER_LEGACY_EXE, true)
    : null
}

/**
 * Class for managing Edge specific options.
 */
class Options extends chromium.Options {
  /**
   * Instruct the EdgeDriver to use Edge Chromium if true.
   * Otherwise, use Edge Legacy (EdgeHTML). Defaults to using Edge Legacy.
   *
   * @param {boolean} useEdgeChromium
   * @return {!Options} A self reference.
   */
  setEdgeChromium(useEdgeChromium) {
    this.set(Options.USE_EDGE_CHROMIUM, !!useEdgeChromium)
    return this
  }
}

Options.USE_EDGE_CHROMIUM = 'ms:edgeChromium'
Options.prototype.BROWSER_NAME_VALUE = Browser.EDGE
Options.prototype.CAPABILITY_KEY = 'ms:edgeOptions'
Options.prototype.VENDOR_CAPABILITY_PREFIX = 'ms'

/**
 * @param  {(Capabilities|Object<string, *>)=} o The options object
 * @return {boolean}
 */
function useEdgeChromium(o) {
  if (o instanceof Capabilities) {
    return !!o.get(Options.USE_EDGE_CHROMIUM)
  }

  if (o && typeof o === 'object') {
    return !!o[Options.USE_EDGE_CHROMIUM]
  }

  return false
}

/**
 * Creates {@link remote.DriverService} instances that manage a
 * WebDriver server in a child process. Used for driving both
 * Microsoft Edge Legacy and Chromium. A ServiceBuilder constructed
 * with default parameters will launch a MicrosoftWebDriver child
 * process for driving Edge Legacy. You may pass in a path to
 * msedgedriver.exe to use Edge Chromium instead.
 */
class ServiceBuilder extends chromium.ServiceBuilder {
  /**
   * @param {string=} opt_exe Path to the server executable to use. If omitted,
   *   the builder will attempt to locate MicrosoftWebDriver on the current
   *   PATH.
   * @throws {Error} If provided executable does not exist, or the
   *   MicrosoftWebDriver cannot be found on the PATH.
   */
  constructor(opt_exe) {
    const exe = opt_exe || locateSynchronously()
    if (!exe) {
      throw Error(
        'The WebDriver for Edge could not be found on the current PATH. Please ' +
          'download the latest version of ' +
          EDGEDRIVER_LEGACY_EXE +
          ' from ' +
          'https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/ and ' +
          'ensure it can be found on your PATH.'
      )
    }

    super(exe)
  }
}

/** @type {remote.DriverService} */
var defaultService = null

/**
 * Sets the default service to use for new Edge instances.
 * @param {!remote.DriverService} service The service to use.
 * @throws {Error} If the default service is currently running.
 */
function setDefaultService(service) {
  if (defaultService && defaultService.isRunning()) {
    throw Error(
      'The previously configured EdgeDriver service is still running. ' +
        'You must shut it down before you may adjust its configuration.'
    )
  }
  defaultService = service
}

/**
 * Returns the default Microsoft Edge driver service. If such a service has
 * not been configured, one will be constructed using the default configuration
 * for a MicrosoftWebDriver executable found on the system PATH.
 * @return {!remote.DriverService} The default Microsoft Edge driver service.
 */
function getDefaultService() {
  if (!defaultService) {
    defaultService = new ServiceBuilder().build()
  }
  return defaultService
}

function createServiceFromCapabilities(options) {
  let exe
  if (useEdgeChromium(options)) {
    exe = locateSynchronously(EDGE_CHROMIUM_BROWSER_NAME)
  }
  return new ServiceBuilder(exe).build()
}

/**
 * Creates a new WebDriver client for Microsoft's Edge.
 */
class Driver extends webdriver.WebDriver {
  /**
   * Creates a new browser session for Microsoft's Edge browser.
   *
   * @param {(Capabilities|Options)=} options The configuration options.
   * @param {remote.DriverService=} opt_service The service to use; will create
   *     a new Legacy or Chromium service based on {@linkplain Options} by default.
   * @return {!Driver} A new driver instance.
   */
  static createSession(options, opt_service) {
    options = options || new Options()
    let service = opt_service || createServiceFromCapabilities(options)
    let client = service.start().then((url) => new http.HttpClient(url))
    let executor = new http.Executor(client)

    return /** @type {!Driver} */ (super.createSession(executor, options, () =>
      service.kill()
    ))
  }

  /**
   * This function is a no-op as file detectors are not supported by this
   * implementation.
   * @override
   */
  setFileDetector() {}
}

// PUBLIC API

exports.Driver = Driver
exports.Options = Options
exports.ServiceBuilder = ServiceBuilder
exports.getDefaultService = getDefaultService
exports.setDefaultService = setDefaultService
exports.locateSynchronously = locateSynchronously
