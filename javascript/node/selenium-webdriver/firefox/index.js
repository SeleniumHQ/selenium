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
 * @fileoverview Defines the {@linkplain Driver WebDriver} client for Firefox.
 * Before using this module, you must download the latest
 * [geckodriver release] and ensure it can be found on your system [PATH].
 *
 * Each FirefoxDriver instance will be created with an anonymous profile,
 * ensuring browser historys do not share session data (cookies, history, cache,
 * offline storage, etc.)
 *
 * __Customizing the Firefox Profile__
 *
 * The {@link Profile} class may be used to configure the browser profile used
 * with WebDriver, with functions to install additional
 * {@linkplain Profile#addExtension extensions}, configure browser
 * {@linkplain Profile#setPreference preferences}, and more. For example, you
 * may wish to include Firebug:
 *
 *     var firefox = require('selenium-webdriver/firefox');
 *
 *     var profile = new firefox.Profile();
 *     profile.addExtension('/path/to/firebug.xpi');
 *     profile.setPreference('extensions.firebug.showChromeErrors', true);
 *
 *     var options = new firefox.Options().setProfile(profile);
 *     var driver = new firefox.Driver(options);
 *
 * The {@link Profile} class may also be used to configure WebDriver based on a
 * pre-existing browser profile:
 *
 *     var profile = new firefox.Profile(
 *         '/usr/local/home/bob/.mozilla/firefox/3fgog75h.testing');
 *     var options = new firefox.Options().setProfile(profile);
 *     var driver = new firefox.Driver(options);
 *
 * The FirefoxDriver will _never_ modify a pre-existing profile; instead it will
 * create a copy for it to modify. By extension, there are certain browser
 * preferences that are required for WebDriver to function properly and they
 * will always be overwritten.
 *
 * __Using a Custom Firefox Binary__
 *
 * On Windows and OSX, the FirefoxDriver will search for Firefox in its
 * default installation location:
 *
 * * Windows: C:\Program Files and C:\Program Files (x86).
 * * Mac OS X: /Applications/Firefox.app
 *
 * For Linux, Firefox will be located on the PATH: `$(where firefox)`.
 *
 * You can configure WebDriver to start use a custom Firefox installation with
 * the {@link Binary} class:
 *
 *     var firefox = require('selenium-webdriver/firefox');
 *     var binary = new firefox.Binary('/my/firefox/install/dir/firefox-bin');
 *     var options = new firefox.Options().setBinary(binary);
 *     var driver = new firefox.Driver(options);
 *
 * __Remote Testing__
 *
 * You may customize the Firefox binary and profile when running against a
 * remote Selenium server. Your custom profile will be packaged as a zip and
 * transfered to the remote host for use. The profile will be transferred
 * _once for each new session_. The performance impact should be minimal if
 * you've only configured a few extra browser preferences. If you have a large
 * profile with several extensions, you should consider installing it on the
 * remote host and defining its path via the {@link Options} class. Custom
 * binaries are never copied to remote machines and must be referenced by
 * installation path.
 *
 *     var options = new firefox.Options()
 *         .setProfile('/profile/path/on/remote/host')
 *         .setBinary('/install/dir/on/remote/host/firefox-bin');
 *
 *     var driver = new (require('selenium-webdriver')).Builder()
 *         .forBrowser('firefox')
 *         .usingServer('http://127.0.0.1:4444/wd/hub')
 *         .setFirefoxOptions(options)
 *         .build();
 *
 * __Testing Older Versions of Firefox__
 *
 * To test versions of Firefox prior to Firefox 47, you must disable the use of
 * the geckodriver using the {@link Options} class.
 *
 *     var options = new firefox.Options().useGeckoDriver(false);
 *     var driver = new firefox.Driver(options);
 *
 * Alternatively, you may disable the geckodriver at runtime by setting the
 * environment variable `SELENIUM_MARIONETTE=false`.
 *
 * [geckodriver release]: https://github.com/mozilla/geckodriver/releases/
 * [PATH]: http://en.wikipedia.org/wiki/PATH_%28variable%29
 */

'use strict';

const url = require('url');

const Binary = require('./binary').Binary,
    Profile = require('./profile').Profile,
    decodeProfile = require('./profile').decode,
    http = require('../http'),
    httpUtil = require('../http/util'),
    io = require('../io'),
    capabilities = require('../lib/capabilities'),
    command = require('../lib/command'),
    logging = require('../lib/logging'),
    promise = require('../lib/promise'),
    webdriver = require('../lib/webdriver'),
    net = require('../net'),
    portprober = require('../net/portprober'),
    remote = require('../remote');


/**
 * Firefox-specific capability keys. Users should use the {@linkplain Options}
 * class instead of referencing these keys directly. _These keys are considered
 * implementation details and may be removed or changed at any time._
 *
 * @enum {string}
 */
const Capability = {
  /**
   * Defines the Firefox binary to use. May be set to either a
   * {@linkplain Binary} instance, or a string path to the Firefox executable.
   */
  BINARY: 'firefox_binary',

  /**
   * Specifies whether to use Mozilla's Marionette, or the legacy FirefoxDriver
   * from the Selenium project. Defaults to false.
   */
  MARIONETTE: 'marionette',

  /**
   * Defines the Firefox profile to use. May be set to either a
   * {@linkplain Profile} instance, or to a base-64 encoded zip of a profile
   * directory.
   */
  PROFILE: 'firefox_profile'
};


/**
 * Configuration options for the FirefoxDriver.
 */
class Options {
  constructor() {
    /** @private {Profile} */
    this.profile_ = null;

    /** @private {Binary} */
    this.binary_ = null;

    /** @private {logging.Preferences} */
    this.logPrefs_ = null;

    /** @private {?capabilities.ProxyConfig} */
    this.proxy_ = null;

    /** @private {boolean} */
    this.marionette_ = true;
  }

  /**
   * Sets the profile to use. The profile may be specified as a
   * {@link Profile} object or as the path to an existing Firefox profile to use
   * as a template.
   *
   * @param {(string|!Profile)} profile The profile to use.
   * @return {!Options} A self reference.
   */
  setProfile(profile) {
    if (typeof profile === 'string') {
      profile = new Profile(profile);
    }
    this.profile_ = profile;
    return this;
  }

  /**
   * Sets the binary to use. The binary may be specified as the path to a Firefox
   * executable, or as a {@link Binary} object.
   *
   * @param {(string|!Binary)} binary The binary to use.
   * @return {!Options} A self reference.
   */
  setBinary(binary) {
    if (typeof binary === 'string') {
      binary = new Binary(binary);
    }
    this.binary_ = binary;
    return this;
  }

  /**
   * Sets the logging preferences for the new session.
   * @param {logging.Preferences} prefs The logging preferences.
   * @return {!Options} A self reference.
   */
  setLoggingPreferences(prefs) {
    this.logPrefs_ = prefs;
    return this;
  }

  /**
   * Sets the proxy to use.
   *
   * @param {capabilities.ProxyConfig} proxy The proxy configuration to use.
   * @return {!Options} A self reference.
   */
  setProxy(proxy) {
    this.proxy_ = proxy;
    return this;
  }

  /**
   * Sets whether to use Mozilla's geckodriver to drive the browser. This option
   * is enabled by default and required for Firefox 47+.
   *
   * @param {boolean} enable Whether to enable the geckodriver.
   * @see https://github.com/mozilla/geckodriver
   */
  useGeckoDriver(enable) {
    this.marionette_ = enable;
    return this;
  }

  /**
   * Converts these options to a {@link capabilities.Capabilities} instance.
   *
   * @return {!capabilities.Capabilities} A new capabilities object.
   */
  toCapabilities() {
    var caps = capabilities.Capabilities.firefox();
    if (this.logPrefs_) {
      caps.set(capabilities.Capability.LOGGING_PREFS, this.logPrefs_);
    }
    if (this.proxy_) {
      caps.set(capabilities.Capability.PROXY, this.proxy_);
    }
    if (this.binary_) {
      caps.set(Capability.BINARY, this.binary_);
    }
    if (this.profile_) {
      caps.set(Capability.PROFILE, this.profile_);
    }
    caps.set(Capability.MARIONETTE, this.marionette_);
    return caps;
  }
}


/**
 * Enum of available command contexts.
 *
 * Command contexts are specific to Marionette, and may be used with the
 * {@link #context=} method. Contexts allow you to direct all subsequent
 * commands to either "content" (default) or "chrome". The latter gives
 * you elevated security permissions.
 *
 * @enum {string}
 */
const Context = {
  CONTENT: "content",
  CHROME: "chrome",
};


const GECKO_DRIVER_EXE =
    process.platform === 'win32' ? 'geckodriver.exe' : 'geckodriver';


/**
 * @return {string} .
 * @throws {Error}
 */
function findGeckoDriver() {
  let exe = io.findInPath(GECKO_DRIVER_EXE, true);
  if (!exe) {
    throw Error(
      'The ' + GECKO_DRIVER_EXE + ' executable could not be found on the current ' +
      'PATH. Please download the latest version from ' +
      'https://github.com/mozilla/geckodriver/releases/' +
      'WebDriver and ensure it can be found on your PATH.');
  }
  return exe;
}


/**
 * @param {(string|!Binary)} binary .
 * @return {!remote.DriverService} .
 */
function createGeckoDriverService(binary) {
  let exe = typeof binary === 'string' ?
    Promise.resolve(binary) : binary.locate();

  let geckoDriver = findGeckoDriver();
  let port =  portprober.findFreePort();
  let marionettePort = portprober.findFreePort();
  return new remote.DriverService(geckoDriver, {
    loopback: true,
    port: port,
    args: Promise.all([exe, port, marionettePort]).then(args => {
      return ['-b', args[0],
              '--port', args[1],
              '--marionette-port', args[2]];
    })
    // ,stdio: 'inherit'
  });
}


/**
 * @param {(Profile|string)} profile The profile to prepare.
 * @param {number} port The port the FirefoxDriver should listen on.
 * @return {!Promise<string>} a promise for the path to the profile directory.
 */
function prepareProfile(profile, port) {
  if (typeof profile === 'string') {
    return decodeProfile(/** @type {string} */(profile)).then(dir => {
      profile = new Profile(dir);
      profile.setPreference('webdriver_firefox_port', port);
      return profile.writeToDisk();
    });
  }

  profile = profile || new Profile;
  profile.setPreference('webdriver_firefox_port', port);
  return profile.writeToDisk();
}


function normalizeProxyConfiguration(config) {
  if ('manual' === config.proxyType) {
    if (config.ftpProxy && !config.ftpProxyPort) {
      let hostAndPort = net.splitHostAndPort(config.ftpProxy);
      config.ftpProxy = hostAndPort.host;
      config.ftpProxyPort = hostAndPort.port;
    }

    if (config.httpProxy && !config.httpProxyPort) {
      let hostAndPort = net.splitHostAndPort(config.httpProxy);
      config.httpProxy = hostAndPort.host;
      config.httpProxyPort = hostAndPort.port;
    }

    if (config.sslProxy && !config.sslProxyPort) {
      let hostAndPort = net.splitHostAndPort(config.sslProxy);
      config.sslProxy = hostAndPort.host;
      config.sslProxyPort = hostAndPort.port;
    }

    if (config.socksProxy && !config.socksProxyPort) {
      let hostAndPort = net.splitHostAndPort(config.socksProxy);
      config.socksProxy = hostAndPort.host;
      config.socksProxyPort = hostAndPort.port;
    }
  } else if ('pac' === config.proxyType) {
    if (config.proxyAutoconfigUrl && !config.pacUrl) {
      config.pacUrl = config.proxyAutoconfigUrl;
    }
  }
  return config;
}


/** @enum {string} */
const ExtensionCommand = {
  GET_CONTEXT: 'getContext',
  SET_CONTEXT: 'setContext',
};


/**
 * Creates a command executor with support for Marionette's custom commands.
 * @param {!Promise<string>} serverUrl The server's URL.
 * @return {!command.Executor} The new command executor.
 */
function createExecutor(serverUrl) {
  let client = serverUrl.then(url => new http.HttpClient(url));
  let executor = new http.Executor(client);
  configureExecutor(executor);
  return executor;
}


/**
 * Configures the given executor with Firefox-specific commands.
 * @param {!http.Executor} executor the executor to configure.
 */
function configureExecutor(executor) {
  executor.defineCommand(
      ExtensionCommand.GET_CONTEXT,
      'GET',
      '/session/:sessionId/moz/context');

  executor.defineCommand(
      ExtensionCommand.SET_CONTEXT,
      'POST',
      '/session/:sessionId/moz/context');
}


/**
 * Creates {@link selenium-webdriver/remote.DriverService} instances that manage
 * a [geckodriver](https://github.com/mozilla/geckodriver) server in a child
 * process.
 */
class ServiceBuilder extends remote.DriverService.Builder {
  /**
   * @param {string=} opt_exe Path to the server executable to use. If omitted,
   *     the builder will attempt to locate the geckodriver on the system PATH.
   */
  constructor(opt_exe) {
    super(opt_exe || findGeckoDriver());
    this.setLoopback(true);  // Required.
  }

  /**
   * Enables verbose logging.
   *
   * @param {boolean=} opt_trace Whether to enable trace-level logging. By
   *     default, only debug logging is enabled.
   * @return {!ServiceBuilder} A self reference.
   */
  enableVerboseLogging(opt_trace) {
    return this.addArguments(opt_trace ? '-vv' : '-v');
  }

  /**
   * Sets the path to the executable Firefox binary that the geckodriver should
   * use. If this method is not called, this builder will attempt to locate
   * Firefox in the default installation location for the current platform.
   *
   * @param {(string|!Binary)} binary Path to the executable Firefox binary to use.
   * @return {!ServiceBuilder} A self reference.
   * @see Binary#locate()
   */
  setFirefoxBinary(binary) {
    let exe = typeof binary === 'string'
        ? Promise.resolve(binary) : binary.locate();
    return this.addArguments('-b', exe);
  }
}


/**
 * @typedef {{driver: !webdriver.WebDriver, onQuit: function()}}
 */
var DriverSpec;


/**
 * @param {(http.Executor|remote.DriverService|undefined)} executor
 * @param {!capabilities.Capabilities} caps
 * @param {Profile} profile
 * @param {Binary} binary
 * @param {(promise.ControlFlow|undefined)} flow
 * @return {DriverSpec}
 */
function createGeckoDriver(
    executor, caps, profile, binary, flow) {
  if (profile) {
    caps.set(Capability.PROFILE, profile.encode());
  }

  let sessionCaps = caps;
  if (caps.has(capabilities.Capability.PROXY)) {
    let proxy = normalizeProxyConfiguration(
        caps.get(capabilities.Capability.PROXY));

    // Marionette requires proxy settings to be specified as required
    // capabilities. See mozilla/geckodriver#97
    let required = new capabilities.Capabilities()
        .set(capabilities.Capability.PROXY, proxy);

    caps.delete(capabilities.Capability.PROXY);
    sessionCaps = {required, desired: caps};
  }

  /** @type {(command.Executor|undefined)} */
  let cmdExecutor;
  let onQuit = function() {};

  if (executor instanceof http.Executor) {
    configureExecutor(executor);
    cmdExecutor = executor;
  } else if (executor instanceof remote.DriverService) {
    cmdExecutor = createExecutor(executor.start());
    onQuit = () => executor.kill();
  } else {
    let builder = new ServiceBuilder();
    if (binary) {
      builder.setFirefoxBinary(binary);
    }
    let service = builder.build();
    cmdExecutor = createExecutor(service.start());
    onQuit = () => service.kill();
  }

  let driver =
      webdriver.WebDriver.createSession(
          /** @type {!http.Executor} */(cmdExecutor),
          sessionCaps,
          flow);
  return {driver, onQuit};
}


/**
 * @param {!capabilities.Capabilities} caps
 * @param {Profile} profile
 * @param {!Binary} binary
 * @param {(promise.ControlFlow|undefined)} flow
 * @return {DriverSpec}
 */
function createLegacyDriver(caps, profile, binary, flow) {
  profile = profile || new Profile;

  let freePort = portprober.findFreePort();
  let preparedProfile =
      freePort.then(port => prepareProfile(profile, port));
  let command = preparedProfile.then(dir => binary.launch(dir));

  let serverUrl = command.then(() => freePort)
      .then(function(/** number */port) {
        let serverUrl = url.format({
          protocol: 'http',
          hostname: net.getLoopbackAddress(),
          port: port + '',
          pathname: '/hub'
        });
        let ready = httpUtil.waitForServer(serverUrl, 45 * 1000);
        return ready.then(() => serverUrl);
      });

  let onQuit = function() {
    return command.then(command => {
      command.kill();
      return preparedProfile.then(io.rmDir)
          .then(() => command.result(),
                () => command.result());
    });
  };

  let executor = createExecutor(serverUrl);
  let driver = webdriver.WebDriver.createSession(executor, caps, flow);
  return {driver, onQuit};
}


/**
 * A WebDriver client for Firefox.
 */
class Driver extends webdriver.WebDriver {
  /**
   * @param {(Options|capabilities.Capabilities|Object)=} opt_config The
   *    configuration options for this driver, specified as either an
   *    {@link Options} or {@link capabilities.Capabilities}, or as a raw hash
   *    object.
   * @param {(http.Executor|remote.DriverService)=} opt_executor Either a
   *   pre-configured command executor to use for communicating with an
   *   externally managed remote end (which is assumed to already be running),
   *   or the `DriverService` to use to start the geckodriver in a child
   *   process.
   *
   *   If an executor is provided, care should e taken not to use reuse it with
   *   other clients as its internal command mappings will be updated to support
   *   Firefox-specific commands.
   *
   *   _This parameter may only be used with Mozilla's GeckoDriver._
   *
   * @param {promise.ControlFlow=} opt_flow The flow to
   *     schedule commands through. Defaults to the active flow object.
   * @throws {Error} If a custom command executor is provided and the driver is
   *     configured to use the legacy FirefoxDriver from the Selenium project.
   */
  constructor(opt_config, opt_executor, opt_flow) {
    let caps;
    if (opt_config instanceof Options) {
      caps = opt_config.toCapabilities();
    } else {
      caps = new capabilities.Capabilities(opt_config);
    }

    let hasBinary = caps.has(Capability.BINARY);
    let binary = caps.get(Capability.BINARY) || new Binary();
    caps.delete(Capability.BINARY);
    if (typeof binary === 'string') {
      binary = new Binary(binary);
    }

    let profile;
    if (caps.has(Capability.PROFILE)) {
      profile = caps.get(Capability.PROFILE);
      caps.delete(Capability.PROFILE);
    }

    let serverUrl, onQuit;

    // Users must now explicitly disable marionette to use the legacy
    // FirefoxDriver.
    let noMarionette =
        caps.get(Capability.MARIONETTE) === false
            || /^0|false$/i.test(process.env['SELENIUM_MARIONETTE']);
    let useMarionette = !noMarionette;

    let spec;
    if (useMarionette) {
      spec = createGeckoDriver(
          opt_executor,
          caps,
          profile,
          hasBinary ? binary : null,
          opt_flow);
    } else {
      if (opt_executor) {
        throw Error('You may not use a custom command executor with the legacy'
            + ' FirefoxDriver');
      }
      spec = createLegacyDriver(caps, profile, binary, opt_flow);
    }

    super(spec.driver.getSession(),
          spec.driver.getExecutor(),
          spec.driver.controlFlow());

    /** @override */
    this.quit = () => {
      return super.quit().finally(spec.onQuit);
    };
  }

  /**
   * This function is a no-op as file detectors are not supported by this
   * implementation.
   * @override
   */
  setFileDetector() {
  }

  /**
   * Get the context that is currently in effect.
   *
   * @return {!promise.Promise<Context>} Current context.
   */
  getContext() {
    return this.schedule(
        new command.Command(ExtensionCommand.GET_CONTEXT),
        'get WebDriver.context');
  }

  /**
   * Changes target context for commands between chrome- and content.
   *
   * Changing the current context has a stateful impact on all subsequent
   * commands. The {@link Context.CONTENT} context has normal web
   * platform document permissions, as if you would evaluate arbitrary
   * JavaScript. The {@link Context.CHROME} context gets elevated
   * permissions that lets you manipulate the browser chrome itself,
   * with full access to the XUL toolkit.
   *
   * Use your powers wisely.
   *
   * @param {!promise.Promise<void>} ctx The context to switch to.
   */
  setContext(ctx) {
    return this.schedule(
        new command.Command(ExtensionCommand.SET_CONTEXT)
            .setParameter("context", ctx),
        'set WebDriver.context');
  }
}


// PUBLIC API


exports.Binary = Binary;
exports.Context = Context;
exports.Driver = Driver;
exports.Options = Options;
exports.Profile = Profile;
exports.ServiceBuilder = ServiceBuilder;
