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

'use strict';

const AdmZip = require('adm-zip'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    util = require('util');

const httpUtil = require('../http/util'),
    exec = require('../io/exec'),
    cmd = require('../lib/command'),
    input = require('../lib/input'),
    promise = require('../lib/promise'),
    webdriver = require('../lib/webdriver'),
    net = require('../net'),
    portprober = require('../net/portprober');



/**
 * A record object that defines the configuration options for a DriverService
 * instance.
 *
 * @record
 */
function ServiceOptions() {}

/**
 * Whether the service should only be accessed on this host's loopback address.
 *
 * @type {(boolean|undefined)}
 */
ServiceOptions.prototype.loopback;

/**
 * The host name to access the server on. If this option is specified, the
 * {@link #loopback} option will be ignored.
 *
 * @type {(string|undefined)}
 */
ServiceOptions.prototype.hostname;

/**
 * The port to start the server on (must be > 0). If the port is provided as a
 * promise, the service will wait for the promise to resolve before starting.
 *
 * @type {(number|!promise.Promise<number>)}
 */
ServiceOptions.prototype.port;

/**
 * The arguments to pass to the service. If a promise is provided, the service
 * will wait for it to resolve before starting.
 *
 * @type {!(Array<string>|promise.Promise<!Array<string>>)}
 */
ServiceOptions.prototype.args;

/**
 * The base path on the server for the WebDriver wire protocol (e.g. '/wd/hub').
 * Defaults to '/'.
 *
 * @type {(string|undefined|null)}
 */
ServiceOptions.prototype.path;

/**
 * The environment variables that should be visible to the server process.
 * Defaults to inheriting the current process's environment.
 *
 * @type {(Object<string, string>|undefined)}
 */
ServiceOptions.prototype.env;

/**
 * IO configuration for the spawned server process. For more information, refer
 * to the documentation of `child_process.spawn`.
 *
 * @type {(string|!Array<string|number|!stream.Stream|null|undefined>|
 *         undefined)}
 * @see https://nodejs.org/dist/latest-v4.x/docs/api/child_process.html#child_process_options_stdio
 */
ServiceOptions.prototype.stdio;


/**
 * Manages the life and death of a native executable WebDriver server.
 *
 * It is expected that the driver server implements the
 * https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol.
 * Furthermore, the managed server should support multiple concurrent sessions,
 * so that this class may be reused for multiple clients.
 */
class DriverService {
  /**
   * @param {string} executable Path to the executable to run.
   * @param {!ServiceOptions} options Configuration options for the service.
   */
  constructor(executable, options) {
    /** @private {string} */
    this.executable_ = executable;

    /** @private {boolean} */
    this.loopbackOnly_ = !!options.loopback;

    /** @private {(string|undefined)} */
    this.hostname_ = options.hostname;

    /** @private {(number|!promise.Promise<number>)} */
    this.port_ = options.port;

    /**
     * @private {!(Array<string>|promise.Promise<!Array<string>>)}
     */
    this.args_ = options.args;

    /** @private {string} */
    this.path_ = options.path || '/';

    /** @private {!Object<string, string>} */
    this.env_ = options.env || process.env;

    /**
     * @private {(string|!Array<string|number|!stream.Stream|null|undefined>)}
     */
    this.stdio_ = options.stdio || 'ignore';

    /**
     * A promise for the managed subprocess, or null if the server has not been
     * started yet. This promise will never be rejected.
     * @private {promise.Deferred<!exec.Command>}
     */
    this.command_ = null;

    /**
     * Promise that resolves to the server's address or null if the server has
     * not been started. This promise will be rejected if the server terminates
     * before it starts accepting WebDriver requests.
     * @private {promise.Deferred<string>}
     */
    this.address_ = null;
  }

  /**
   * @return {!promise.Promise<string>} A promise that resolves to
   *    the server's address.
   * @throws {Error} If the server has not been started.
   */
  address() {
    if (this.address_) {
      return this.address_.promise;
    }
    throw Error('Server has not been started.');
  }

  /**
   * Returns whether the underlying process is still running. This does not take
   * into account whether the process is in the process of shutting down.
   * @return {boolean} Whether the underlying service process is running.
   */
  isRunning() {
    return !!this.address_;
  }

  /**
   * Starts the server if it is not already running.
   * @param {number=} opt_timeoutMs How long to wait, in milliseconds, for the
   *     server to start accepting requests. Defaults to 30 seconds.
   * @return {!promise.Promise<string>} A promise that will resolve
   *     to the server's base URL when it has started accepting requests. If the
   *     timeout expires before the server has started, the promise will be
   *     rejected.
   */
  start(opt_timeoutMs) {
    if (this.address_) {
      return this.address_.promise;
    }

    var timeout = opt_timeoutMs || DriverService.DEFAULT_START_TIMEOUT_MS;

    var self = this;
    this.command_ = promise.defer();
    this.address_ = promise.defer();
    this.address_.fulfill(promise.when(this.port_, function(port) {
      if (port <= 0) {
        throw Error('Port must be > 0: ' + port);
      }
      return promise.when(self.args_, function(args) {
        var command = exec(self.executable_, {
          args: args,
          env: self.env_,
          stdio: self.stdio_
        });

        self.command_.fulfill(command);

        var earlyTermination = command.result().then(function(result) {
          var error = result.code == null ?
              Error('Server was killed with ' + result.signal) :
              Error('Server terminated early with status ' + result.code);
          self.address_.reject(error);
          self.address_ = null;
          self.command_ = null;
          throw error;
        });

        var hostname = self.hostname_;
        if (!hostname) {
          hostname = !self.loopbackOnly_ && net.getAddress()
              || net.getLoopbackAddress();
        }

        var serverUrl = url.format({
          protocol: 'http',
          hostname: hostname,
          port: port,
          pathname: self.path_
        });

        return new promise.Promise(function(fulfill, reject) {
          var ready = httpUtil.waitForServer(serverUrl, timeout)
              .then(fulfill, reject);
          earlyTermination.catch(function(e) {
            ready.cancel(/** @type {Error} */(e));
            reject(Error(e.message));
          });
        }).then(function() {
          return serverUrl;
        });
      });
    }));

    return this.address_.promise;
  }

  /**
   * Stops the service if it is not currently running. This function will kill
   * the server immediately. To synchronize with the active control flow, use
   * {@link #stop()}.
   * @return {!promise.Promise} A promise that will be resolved when
   *     the server has been stopped.
   */
  kill() {
    if (!this.address_ || !this.command_) {
      return promise.fulfilled();  // Not currently running.
    }
    return this.command_.promise.then(function(command) {
      command.kill('SIGTERM');
    });
  }

  /**
   * Schedules a task in the current control flow to stop the server if it is
   * currently running.
   * @return {!promise.Promise} A promise that will be resolved when
   *     the server has been stopped.
   */
  stop() {
    return promise.controlFlow().execute(this.kill.bind(this));
  }
}


/**
 * The default amount of time, in milliseconds, to wait for the server to
 * start.
 * @const {number}
 */
DriverService.DEFAULT_START_TIMEOUT_MS = 30 * 1000;


/**
 * Manages the life and death of the
 * <a href="http://selenium-release.storage.googleapis.com/index.html">
 * standalone Selenium server</a>.
 */
class SeleniumServer extends DriverService {
  /**
   * @param {string} jar Path to the Selenium server jar.
   * @param {SeleniumServer.Options=} opt_options Configuration options for the
   *     server.
   * @throws {Error} If the path to the Selenium jar is not specified or if an
   *     invalid port is specified.
   */
  constructor(jar, opt_options) {
    if (!jar) {
      throw Error('Path to the Selenium jar not specified');
    }

    var options = opt_options || {};

    if (options.port < 0) {
      throw Error('Port must be >= 0: ' + options.port);
    }

    var port = options.port || portprober.findFreePort();
    var args = promise.when(options.jvmArgs || [], function(jvmArgs) {
      return promise.when(options.args || [], function(args) {
        return promise.when(port, function(port) {
          return jvmArgs.concat(['-jar', jar, '-port', port]).concat(args);
        });
      });
    });

    super('java', {
      loopback: options.loopback,
      port: port,
      args: args,
      path: '/wd/hub',
      env: options.env,
      stdio: options.stdio
    });
  }
}


/**
 * Options for the Selenium server:
 *
 * - `loopback` - Whether the server should only be accessed on this host's
 *     loopback address.
 * - `port` - The port to start the server on (must be > 0). If the port is
 *     provided as a promise, the service will wait for the promise to resolve
 *     before starting.
 * - `args` - The arguments to pass to the service. If a promise is provided,
 *     the service will wait for it to resolve before starting.
 * - `jvmArgs` - The arguments to pass to the JVM. If a promise is provided,
 *     the service will wait for it to resolve before starting.
 * - `env` - The environment variables that should be visible to the server
 *     process. Defaults to inheriting the current process's environment.
 * - `stdio` - IO configuration for the spawned server process. For more
 *     information, refer to the documentation of `child_process.spawn`.
 *
 * @typedef {{
 *   loopback: (boolean|undefined),
 *   port: (number|!promise.Promise<number>),
 *   args: !(Array<string>|promise.Promise<!Array<string>>),
 *   jvmArgs: (!Array<string>|
 *             !promise.Promise<!Array<string>>|
 *             undefined),
 *   env: (!Object<string, string>|undefined),
 *   stdio: (string|!Array<string|number|!stream.Stream|null|undefined>|
 *           undefined)
 * }}
 */
SeleniumServer.Options;



/**
 * A {@link webdriver.FileDetector} that may be used when running
 * against a remote
 * [Selenium server](http://selenium-release.storage.googleapis.com/index.html).
 *
 * When a file path on the local machine running this script is entered with
 * {@link webdriver.WebElement#sendKeys WebElement#sendKeys}, this file detector
 * will transfer the specified file to the Selenium server's host; the sendKeys
 * command will be updated to use the transfered file's path.
 *
 * __Note:__ This class depends on a non-standard command supported on the
 * Java Selenium server. The file detector will fail if used with a server that
 * only supports standard WebDriver commands (such as the ChromeDriver).
 *
 * @final
 */
class FileDetector extends input.FileDetector {
  /**
   * Prepares a `file` for use with the remote browser. If the provided path
   * does not reference a normal file (i.e. it does not exist or is a
   * directory), then the promise returned by this method will be resolved with
   * the original file path. Otherwise, this method will upload the file to the
   * remote server, which will return the file's path on the remote system so
   * it may be referenced in subsequent commands.
   *
   * @override
   */
  handleFile(driver, file) {
    return promise.checkedNodeCall(fs.stat, file).then(function(stats) {
      if (stats.isDirectory()) {
        return file;  // Not a valid file, return original input.
      }

      var zip = new AdmZip();
      zip.addLocalFile(file);
      // Stored compression, see https://en.wikipedia.org/wiki/Zip_(file_format)
      zip.getEntries()[0].header.method = 0;

      var command = new cmd.Command(cmd.Name.UPLOAD_FILE)
          .setParameter('file', zip.toBuffer().toString('base64'));
      return driver.schedule(command,
          'remote.FileDetector.handleFile(' + file + ')');
    }, function(err) {
      if (err.code === 'ENOENT') {
        return file;  // Not a file; return original input.
      }
      throw err;
    });
  }
}


// PUBLIC API

exports.DriverService = DriverService;
exports.FileDetector = FileDetector;
exports.SeleniumServer = SeleniumServer;
exports.ServiceOptions = ServiceOptions;  // Exported for API docs.
