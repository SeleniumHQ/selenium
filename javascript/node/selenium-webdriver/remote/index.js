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

var spawn = require('child_process').spawn,
    os = require('os'),
    url = require('url');

var promise = require('../').promise,
    httpUtil = require('../http/util'),
    net = require('../net'),
    portprober = require('../net/portprober');



/**
 * Manages the life and death of the Selenium standalone server. The server
 * may be obtained from https://code.google.com/p/selenium/downloads/list.
 *
 * <p>The options argument accepts the following properties:
 * <dl>
 *   <dt>jar
 *   <dd>Path to the Selenium server jar.
 *   <dt>port
 *   <dd>The port to start the server on, or 0 for any free port.
 *       Defaults to 0.
 *   <dt>jvmArgs
 *   <dd>Arguments to pass to the JVM.
 *   <dt>args
 *   <dd>Arguments to pass to the server.
 *   <dt>env
 *   <dd>Environment to run the server in. Defaults to the current environment.
 *   <dt>stdio
 *   <dd>The fd configuration for the child process, as defined by
 *       child_process.spawn.  Defaults to 'ignore'.
 *   <dt>
 * </dl>
 *
 * @param {!Object} options A hash describing the server parameters.
 * @throws {Error} If the port is < 0.
 * @constructor
 */
function SeleniumServer(options) {
  this.jar_ = options.jar;
  this.port_ = options.port || 0;
  this.jvmArgs_ = options.jvmArgs || [];
  this.args_ = options.args || [];
  this.env_ = options.env;
  this.stdio_ = options.stdio || 'ignore';

  if (!this.jar_) {
    throw Error('Path to the Selenium jar must be provided');
  }

  if (this.port_ < 0) {
    throw Error('Port must be > 0: ' + this.port_);
  }
};


/**
 * The default amount of time, in milliseconds, to wait for the server to
 * start.
 * @type {number}
 */
SeleniumServer.DEFAULT_START_TIMEOUT_MS = 30 * 1000;


/** @private {child_process.ChildProcess} */
SeleniumServer.prototype.process_ = null;


/**
 * Promise that resolves to the server's address or null if the server has not
 * been started.
 * @private {webdriver.promise.Promise.<string>}
 */
SeleniumServer.prototype.address_ = null;


/**
 * Promise that tracks the status of shutting down the server, or null if the
 * server is not currently shutting down.
 * @private {webdriver.promise.Promise}
 */
SeleniumServer.prototype.shutdownHook_ = null;


/**
 * @return {!webdriver.promise.Promise.<string>} A promise that resolves to
 *    the server's address.
 * @throws {Error} If the SeleniumServer has not been started.
 */
SeleniumServer.prototype.address = function() {
  if (this.address_) {
    return this.address_;
  }
  throw Error('Server has not been started.');
};


/**
 * Starts the server if it is not already running.
 * @param {number=} opt_timeoutMs How long to wait, in milliseconds, for the
 *     server to start accepting requests. Defaults to 30 seconds.
 * @return {!webdriver.promise.Promise.<string>} A promise that will resolve
 *     to the server's base URL when it has started accepting requests. If the
 *     timeout expires before the server has started, the promise will be
 *     rejected.
 */
SeleniumServer.prototype.start = function(opt_timeoutMs) {
  if (this.address_) {
    return this.address_;
  }

  var timeout = opt_timeoutMs || SeleniumServer.DEFAULT_START_TIMEOUT_MS;
  var port = this.port_ || portprober.findFreePort();

  var self = this;
  this.address_ = promise.defer();  // TODO(jleyba): handle cancellation.
  this.address_.resolve(promise.when(port, function(port) {
    var args = self.jvmArgs_.concat(
        '-jar', self.jar_, '-port', port, self.args_);

    self.process_ = spawn('java', args, {
      env: self.env_ || process.env,
      stdio: self.stdio_
    }).once('exit', function(code, signal) {
      if (self.address_.isPending()) {
        var error = Error(code == null ?
            ('Server was killed with ' + signal) :
            ('Server exited with ' + code));
        self.address_.reject(error);
      }

      if (self.shutdownHook_ && self.shutdownHook_.isPending()) {
        self.shutdownHook_.resolve();
      }

      self.shutdownHook_ = null;
      self.address_ = null;
      self.process_ = null;
      process.removeListener('exit', killServer);
    });

    process.once('exit', killServer);

    var serverUrl = url.format({
      protocol: 'http',
      hostname: net.getAddress(),
      port: port,
      pathname: '/wd/hub'
    });

    return httpUtil.waitForServer(serverUrl, timeout).then(function() {
      return serverUrl;
    });
  }));

  return this.address_;

  function killServer() {
    process.removeListener('exit', killServer);
    self.process_ && self.process_.kill('SIGTERM');
  }
};


/**
 * Stops the server if it is currently running. This function will kill the
 * server immediately. To synchronize with the active control flow, use
 * {@link #stop}.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when
 *     the server has been stopped.
 */
SeleniumServer.prototype.kill = function() {
  if (!this.address_) {
    return promise.resolved();  // Not currently running.
  }

  if (!this.shutdownHook_) {
    // No process: still starting; wait on address.
    // Otherwise, kill process now. Exit handler will resolve shutdown hook.
    if (this.process_) {
      this.shutdownHook_ = promise.defer();
      this.process_.kill('SIGTERM');
    } else {
      this.shutdownHook_ = this.address_.addBoth(function() {
        this.process_ && this.process_.kill('SIGTERM');
      }, this);
    }
  }

  return this.shutdownHook_;
};


/**
 * Schedules a task in the current control flow to stop the server if it is
 * currently running.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when
 *     the server has been stopped.
 */
SeleniumServer.prototype.stop = function() {
  return promise.controlFlow().execute(this.kill.bind(this));
};

// PUBLIC API


exports.SeleniumServer = SeleniumServer;
