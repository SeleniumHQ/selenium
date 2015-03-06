// Copyright 2013 Selenium committers
// Copyright 2013 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
 * Name of the PhantomJS executable.
 * @type {string}
 * @const
 */
var PHANTOMJS_EXE =
    process.platform === 'win32' ? 'phantomjs.exe' : 'phantomjs';


/**
 * Capability that designates the location of the PhantomJS executable to use.
 * @type {string}
 * @const
 */
var BINARY_PATH_CAPABILITY = 'phantomjs.binary.path';


/**
 * Capability that designates the CLI arguments to pass to PhantomJS.
 * @type {string}
 * @const
 */
var CLI_ARGS_CAPABILITY = 'phantomjs.cli.args';


/**
 * Default log file to use if one is not specified through CLI args.
 * @type {string}
 * @const
 */
var DEFAULT_LOG_FILE = 'phantomjsdriver.log';


/**
 * Custom command names supported by PhantomJS.
 * @enum {string}
 */
var Command = {
  EXECUTE_PHANTOM_SCRIPT: 'executePhantomScript'
};


/**
 * Finds the PhantomJS executable.
 * @param {string=} opt_exe Path to the executable to use.
 * @return {string} The located executable.
 * @throws {Error} If the executable cannot be found on the PATH, or if the
 *     provided executable path does not exist.
 */
function findExecutable(opt_exe) {
  var exe = opt_exe || io.findInPath(PHANTOMJS_EXE, true);
  if (!exe) {
    throw Error(
        'The PhantomJS executable could not be found on the current PATH. ' +
        'Please download the latest version from ' +
        'http://phantomjs.org/download.html and ensure it can be found on ' +
        'your PATH. For more information, see ' +
        'https://github.com/ariya/phantomjs/wiki');
  }
  if (!fs.existsSync(exe)) {
    throw Error('File does not exist: ' + exe);
  }
  return exe;
}


/**
 * Maps WebDriver logging level name to those recognised by PhantomJS.
 * @type {!Object.<string, string>}
 * @const
 */
var WEBDRIVER_TO_PHANTOMJS_LEVEL = (function() {
  var map = {};
  map[webdriver.logging.Level.ALL.name] = 'DEBUG';
  map[webdriver.logging.Level.DEBUG.name] = 'DEBUG';
  map[webdriver.logging.Level.INFO.name] = 'INFO';
  map[webdriver.logging.Level.WARNING.name] = 'WARN';
  map[webdriver.logging.Level.SEVERE.name] = 'ERROR';
  return map;
})();


/**
 * Creates a new PhantomJS WebDriver client.
 * @param {webdriver.Capabilities=} opt_capabilities The desired capabilities.
 * @param {webdriver.promise.ControlFlow=} opt_flow The control flow to use, or
 *     {@code null} to use the currently active flow.
 * @return {!webdriver.WebDriver} A new WebDriver instance.
 * @deprecated Use {@link Driver}.
 */
function createDriver(opt_capabilities, opt_flow) {
  return new Driver(opt_capabilities, opt_flow);
}


/**
 * Creates a command executor with support for PhantomJS' custom commands.
 * @param {!webdriver.promise.Promise<string>} url The server's URL.
 * @return {!webdriver.CommandExecutor} The new command executor.
 */
function createExecutor(url) {
  return new executors.DeferredExecutor(url.then(function(url) {
    var client = new http.HttpClient(url);
    var executor = new http.Executor(client);

    executor.defineCommand(
        Command.EXECUTE_PHANTOM_SCRIPT,
        'POST', '/session/:sessionId/phantom/execute');

    return executor;
  }));
}

/**
 * Creates a new WebDriver client for PhantomJS.
 *
 * @param {webdriver.Capabilities=} opt_capabilities The desired capabilities.
 * @param {webdriver.promise.ControlFlow=} opt_flow The control flow to use, or
 *     {@code null} to use the currently active flow.
 * @constructor
 * @extends {webdriver.WebDriver}
 */
var Driver = function(opt_capabilities, opt_flow) {
  var capabilities = opt_capabilities || webdriver.Capabilities.phantomjs();
  var exe = findExecutable(capabilities.get(BINARY_PATH_CAPABILITY));
  var args = ['--webdriver-logfile=' + DEFAULT_LOG_FILE];

  var logPrefs = capabilities.get(webdriver.Capability.LOGGING_PREFS);
  if (logPrefs instanceof webdriver.logging.Preferences) {
    logPrefs = logPrefs.toJSON();
  }

  if (logPrefs && logPrefs[webdriver.logging.Type.DRIVER]) {
    var level = WEBDRIVER_TO_PHANTOMJS_LEVEL[
        logPrefs[webdriver.logging.Type.DRIVER]];
    if (level) {
      args.push('--webdriver-loglevel=' + level);
    }
  }

  var proxy = capabilities.get(webdriver.Capability.PROXY);
  if (proxy) {
    switch (proxy.proxyType) {
      case 'manual':
        if (proxy.httpProxy) {
          args.push(
              '--proxy-type=http',
              '--proxy=http://' + proxy.httpProxy);
        }
        break;
      case 'pac':
        throw Error('PhantomJS does not support Proxy PAC files');
      case 'system':
        args.push('--proxy-type=system');
        break;
      case 'direct':
        args.push('--proxy-type=none');
        break;
    }
  }
  args = args.concat(capabilities.get(CLI_ARGS_CAPABILITY) || []);

  var port = portprober.findFreePort();
  var service = new remote.DriverService(exe, {
    port: port,
    args: webdriver.promise.when(port, function(port) {
      args.push('--webdriver=' + port);
      return args;
    })
  });

  var executor = createExecutor(service.start());
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


/**
 * Executes a PhantomJS fragment. This method is similar to
 * {@link #executeScript}, except it exposes the
 * <a href="http://phantomjs.org/api/">PhantomJS API</a> to the injected
 * script.
 *
 * <p>The injected script will execute in the context of PhantomJS's
 * {@code page} variable. If a page has not been loaded before calling this
 * method, one will be created.</p>
 *
 * <p>Be sure to wrap callback definitions in a try/catch block, as failures
 * may cause future WebDriver calls to fail.</p>
 *
 * <p>Certain callbacks are used by GhostDriver (the PhantomJS WebDriver
 * implementation) and overriding these may cause the script to fail. It is
 * recommended that you check for existing callbacks before defining your own.
 * </p>
 *
 * As with {@link #executeScript}, the injected script may be defined as
 * a string for an anonymous function body (e.g. "return 123;"), or as a
 * function. If a function is provided, it will be decompiled to its original
 * source. Note that injecting functions is provided as a convenience to
 * simplify defining complex scripts. Care must be taken that the function
 * only references variables that will be defined in the page's scope and
 * that the function does not override {@code Function.prototype.toString}
 * (overriding toString() will interfere with how the function is
 * decompiled.
 *
 * @param {(string|!Function)} script The script to execute.
 * @param {...*} var_args The arguments to pass to the script.
 * @return {!webdriver.promise.Promise<T>} A promise that resolve to the
 *     script's return value.
 * @template T
 */
Driver.prototype.executePhantomJS = function(script, args) {
  if (typeof script === 'function') {
    script = 'return (' + script + ').apply(this, arguments);';
  }
  var args = arguments.length > 1
      ? Array.prototype.slice.call(arguments, 1) : [];
  return this.schedule(
      new webdriver.Command(Command.EXECUTE_PHANTOM_SCRIPT)
          .setParameter('script', script)
          .setParameter('args', args),
      'Driver.executePhantomJS()');
};


// PUBLIC API

exports.Driver = Driver;
exports.createDriver = createDriver;
