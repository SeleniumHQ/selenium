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

var webdriver = require('..'),
    executors = require('../executors'),
    io = require('../io'),
    portprober = require('../net/portprober'),
    remote = require('../remote');


/**
 * Name of the ChromeDriver executable.
 * @type {string}
 * @const
 */
var CHROMEDRIVER_EXE =
    process.platform === 'win32' ? 'chromedriver.exe' : 'chromedriver';


function ServiceBuilder() {}


/** @private {?string} */
ServiceBuilder.prototype.executable_ = null;


/** @private {number} */
ServiceBuilder.prototype.port_ = 0;


/** @private {?string} */
ServiceBuilder.prototype.logFile_ = null;


/** @private {Object.<string, string>} */
ServiceBuilder.prototype.env_ = null;


/**
 * Defines the path to the ChromeDriver server to use. If this function is
 * never called, the ServiceBuilder will attempt to find the server on
 * the PATH.
 * @param {string} path Path to the ChromeDriver server to use.
 * @return {!ServiceBuilder} A self reference.
 * @throws {Error} If the specified path does not exist.
 */
ServiceBuilder.prototype.usingServer = function(path) {
  if (!fs.existsSync(path)) {
    throw Error('File does not exist: ' + path);
  }
  this.executable_ = path;
  return this;
};


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
 * Sets the path of the log file the driver should use. If a log file is
 * not specified, the driver will log to "chromedriver.log" in the current
 * working directory.
 * @param {string} logFile Path to the log file to use.
 * @return {!ServiceBuilder} A self reference.
 */
ServiceBuilder.prototype.withLogFile = function(logFile) {
  this.logFile_ = logFile;
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
  var exe = this.executable_;
  if (!exe) {
    exe = io.findInPath(CHROMEDRIVER_EXE);
    if (!exe) {
      throw Error(
          'ChromeDriver could not be found on the current path. Please ' +
          'download the latest version of the ChromeDriver from ' +
          'http://code.google.com/p/chromedriver/downloads/list and ensure ' +
          'it can be found on your PATH. Alternatively, you may specify ' +
          'the path to the executable with ' +
          'ServiceBuilder#usingServer(string)');
    }
    this.executable_ = io.findInPath(CHROMEDRIVER_EXE);
  }

  var self = this;
  var port = this.port_ || portprober.findFreePort();
  var args = webdriver.promise.when(port, function(port) {
    var args = ['--port=' + port];
    if (self.logFile_) {
      args.push('--log-path=' + self.logFile_);
    }
    return args;
  });

  return new remote.DriverService(this.executable_, {
    port: port,
    args: args,
    env: self.env
  });
};


/** @type {remote.DriverService} */
var defaultService = null;


function getDefaultService() {
  if (!defaultService) {
    defaultService = new ServiceBuilder().build();
  }
  return defaultService;
}


/**
 * Builder that may be used to construct ChromeDriver clients.
 * @constructor
 */
var Builder = function() {

  /** @private {!webdriver.Capabilities} */
  this.capabilities_ = webdriver.Capabilities.chrome();
};


/** @private {remote.DriverService} */
Builder.prototype.service_ = null;


/**
 * Sets the driver service to use. If this function is never called, the default
 * service, which uses the chromedriver server found on the current PATH, will
 * be used. The service will be started upon calling {@link #build()}, but will
 * be left running for the life of this program so that it may be reused for
 * multiple sessions.
 * @param {!remote.DriverService} service The service to use.
 * @return {!Builder} A self reference.
 */
Builder.prototype.usingService = function(service) {
  this.service_ = service;
  return this;
};


/**
 * Sets the desired capabilities for the new session.
 * @param {!webdriver.Capabilities} capabilities The desired capabilities.
 * @return {!Builder} A self reference.
 */
Builder.prototype.withCapabilities = function(capabilities) {
  // TODO(jleyba): Replace this with a ChromeOptions class.
  this.capabilities_ = capabilities;
  return this;
};


/**
 * @return {!webdriver.WebDriver} A new webdriver instance.
 */
Builder.prototype.build = function() {
  var service = this.service_ || getDefaultService();
  var executor = executors.createExecutor(service.start());
  return webdriver.WebDriver.createSession(executor, this.capabilities_);
};


// PUBLIC API


exports.ServiceBuilder = ServiceBuilder;
exports.Builder = Builder;
