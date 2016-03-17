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
 * @fileoverview Defines a WebDriver client for Safari. Before using this
 * module, you must install the
 * [latest version](http://selenium-release.storage.googleapis.com/index.html)
 * of the SafariDriver browser extension; using Safari for normal browsing is
 * not recommended once the extension has been installed. You can, and should,
 * disable the extension when the browser is not being used with WebDriver.
 */

'use strict';

const events = require('events');
const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');
const util = require('util');
const ws = require('ws');

const error = require('./error');
const io = require('./io');
const exec = require('./io/exec');
const isDevMode = require('./lib/devmode');
const Capabilities = require('./lib/capabilities').Capabilities;
const Capability = require('./lib/capabilities').Capability;
const command = require('./lib/command');
const promise = require('./lib/promise');
const Symbols = require('./lib/symbols');
const webdriver = require('./lib/webdriver');
const portprober = require('./net/portprober');


/** @const */
const CLIENT_PATH = isDevMode
    ? path.join(__dirname,
        '../../../build/javascript/safari-driver/client.js')
    : path.join(__dirname, 'lib/safari/client.js');


/** @const */
const LIBRARY_DIR = (function() {
  if (process.platform === 'darwin') {
    return path.join('/Users', process.env['USER'], 'Library/Safari');
  } else if (process.platform === 'win32') {
    return path.join(process.env['APPDATA'], 'Apple Computer', 'Safari');
  } else {
    return '/dev/null';
  }
})();


/** @const */
const SESSION_DATA_FILES = (function() {
  if (process.platform === 'darwin') {
    var libraryDir = path.join('/Users', process.env['USER'], 'Library');
    return [
      path.join(libraryDir, 'Caches/com.apple.Safari/Cache.db'),
      path.join(libraryDir, 'Cookies/Cookies.binarycookies'),
      path.join(libraryDir, 'Cookies/Cookies.plist'),
      path.join(libraryDir, 'Safari/History.plist'),
      path.join(libraryDir, 'Safari/LastSession.plist'),
      path.join(libraryDir, 'Safari/LocalStorage'),
      path.join(libraryDir, 'Safari/Databases')
    ];
  } else if (process.platform === 'win32') {
    var appDataDir = path.join(process.env['APPDATA'],
        'Apple Computer', 'Safari');
    var localDataDir = path.join(process.env['LOCALAPPDATA'],
        'Apple Computer', 'Safari');
    return [
      path.join(appDataDir, 'History.plist'),
      path.join(appDataDir, 'LastSession.plist'),
      path.join(appDataDir, 'Cookies/Cookies.plist'),
      path.join(appDataDir, 'Cookies/Cookies.binarycookies'),
      path.join(localDataDir, 'Cache.db'),
      path.join(localDataDir, 'Databases'),
      path.join(localDataDir, 'LocalStorage')
    ];
  } else {
    return [];
  }
})();


/** @typedef {{port: number, address: string, family: string}} */
var Host;


/**
 * A basic HTTP/WebSocket server used to communicate with the SafariDriver
 * browser extension.
 */
class Server extends events.EventEmitter {
  constructor() {
    super();
    var server = http.createServer(function(req, res) {
      if (req.url === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
      }

      var query = url.parse(/** @type {string} */(req.url)).query || '';
      if (query.indexOf('url=') == -1) {
        var address = server.address()
        var host = address.address + ':' + address.port;
        res.writeHead(
            302, {'Location': 'http://' + host + '?url=ws://' + host});
        res.end();
      }

      fs.readFile(CLIENT_PATH, 'utf8', function(err, data) {
        if (err) {
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end(err.stack);
          return;
        }
        var content = '<!DOCTYPE html><body><script>' + data + '</script>';
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Length': Buffer.byteLength(content, 'utf8'),
        });
        res.end(content);
      });
    });

    var wss = new ws.Server({server: server});
    wss.on('connection', this.emit.bind(this, 'connection'));

    /**
     * Starts the server on a random port.
     * @return {!promise.Promise<Host>} A promise that will resolve
     *     with the server host when it has fully started.
     */
    this.start = function() {
      if (server.address()) {
        return promise.fulfilled(server.address());
      }
      return portprober.findFreePort('localhost').then(function(port) {
        return promise.checkedNodeCall(
            server.listen.bind(server, port, 'localhost'));
      }).then(function() {
        return server.address();
      });
    };

    /**
     * Stops the server.
     * @return {!promise.Promise} A promise that will resolve when
     *     the server has closed all connections.
     */
    this.stop = function() {
      return new promise.Promise(function(fulfill) {
        server.close(fulfill);
      });
    };

    /**
     * @return {Host} This server's host info.
     * @throws {Error} If the server is not running.
     */
    this.address = function() {
      var addr = server.address();
      if (!addr) {
        throw Error('There server is not running!');
      }
      return addr;
    };
  }
}


/**
 * @return {!Promise<string>} A promise that will resolve with the path
 *     to Safari on the current system.
 */
function findSafariExecutable() {
  switch (process.platform) {
    case 'darwin':
      return Promise.resolve('/Applications/Safari.app/Contents/MacOS/Safari');

    case 'win32':
      var files = [
        process.env['PROGRAMFILES'] || '\\Program Files',
        process.env['PROGRAMFILES(X86)'] || '\\Program Files (x86)'
      ].map(function(prefix) {
        return path.join(prefix, 'Safari\\Safari.exe');
      });
      return io.exists(files[0]).then(function(exists) {
        return exists ? files[0] : io.exists(files[1]).then(function(exists) {
          if (exists) {
            return files[1];
          }
          throw Error('Unable to find Safari on the current system');
        });
      });

    default:
      return Promise.reject(
          Error('Safari is not supported on the current platform: ' +
              process.platform));
  }
}


/**
 * @param {string} serverUrl The URL to connect to.
 * @return {!Promise<string>} A promise for the path to a file that Safari can
 *     open on start-up to trigger a new connection to the WebSocket server.
 */
function createConnectFile(serverUrl) {
  return io.tmpFile({postfix: '.html'}).then(function(f) {
    var writeFile =  promise.checkedNodeCall(fs.writeFile,
        f,
        '<!DOCTYPE html><script>window.location = "' + serverUrl + '";</script>',
        {encoding: 'utf8'});
    return writeFile.then(function() {
      return f;
    });
  });
}


/**
 * Deletes all session data files if so desired.
 * @param {!Object} desiredCapabilities .
 * @return {!Array<promise.Promise>} A list of promises for the deleted files.
 */
function cleanSession(desiredCapabilities) {
  if (!desiredCapabilities) {
    return [];
  }
  var options = desiredCapabilities[OPTIONS_CAPABILITY_KEY];
  if (!options) {
    return [];
  }
  if (!options['cleanSession']) {
    return [];
  }
  return SESSION_DATA_FILES.map(function(file) {
    return io.unlink(file);
  });
}


/** @return {string} . */
function getRandomString() {
  let seed = Date.now();
  return Math.floor(Math.random() * seed).toString(36)
      + Math.abs(Math.floor(Math.random() * seed) ^ Date.now()).toString(36);
}


/**
 * @implements {command.Executor}
 */
class CommandExecutor {
  constructor() {
    this.server_ = null;

    /** @private {ws.WebSocket} */
    this.socket_ = null;

    /** @private {promise.Promise.<!exec.Command>} */
    this.safari_ = null;
  }

  /** @override */
  execute(cmd) {
    var self = this;
    return new promise.Promise(function(fulfill, reject) {
      var safariCommand = JSON.stringify({
        'origin': 'webdriver',
        'type': 'command',
        'command': {
          'id': getRandomString(),
          'name': cmd.getName(),
          'parameters': cmd.getParameters()
        }
      });

      switch (cmd.getName()) {
        case command.Name.NEW_SESSION:
          self.startSafari_(cmd)
              .then(() => self.sendCommand_(safariCommand))
              .then(fulfill, reject);
          break;

        case command.Name.QUIT:
          self.destroySession_().then(() => fulfill(null), reject);
          break;

        default:
          self.sendCommand_(safariCommand).then(fulfill, reject);
          break;
      }
    });
  }

  /**
   * @param {string} data .
   * @return {!promise.Promise} .
   * @private
   */
  sendCommand_(data) {
    let self = this;
    return new promise.Promise(function(fulfill, reject) {
      // TODO: support reconnecting with the extension.
      if (!self.socket_) {
        self.destroySession_().thenFinally(function() {
          reject(Error('The connection to the SafariDriver was closed'));
        });
        return;
      }

      self.socket_.send(data, function(err) {
        if (err) {
          reject(err);
          return;
        }
      });

      self.socket_.once('message', function(data) {
        try {
          data = JSON.parse(data);
        } catch (ex) {
          reject(Error('Failed to parse driver message: ' + data));
          return;
        }

        try {
          error.checkLegacyResponse(data['response']);
          fulfill(data['response']['value']);
        } catch (ex) {
          reject(ex);
        }
      });
    });
  }

  /**
   * @param {!command.Command} command .
   * @private
   */
  startSafari_(command) {
    this.server_ = new Server();

    this.safari_ = this.server_.start().then(function(address) {
      var tasks = cleanSession(
          /** @type {!Object} */(
                command.getParameters()['desiredCapabilities']));
      tasks.push(
        findSafariExecutable(),
        createConnectFile(
            'http://' + address.address + ':' + address.port));
      return promise.all(tasks).then(function(tasks) {
        var exe = tasks[tasks.length - 2];
        var html = tasks[tasks.length - 1];
        return exec(exe, {args: [html]});
      });
    });

    var connected = promise.defer();
    var self = this;
    var start = Date.now();
    var timer = setTimeout(function() {
      connected.reject(Error(
        'Failed to connect to the SafariDriver after ' + (Date.now() - start) +
        ' ms; Have you installed the latest extension from ' +
        'http://selenium-release.storage.googleapis.com/index.html?'));
    }, 10 * 1000);
    this.server_.once('connection', function(socket) {
      clearTimeout(timer);
      self.socket_ = socket;
      socket.once('close', function() {
        self.socket_ = null;
      });
      connected.fulfill();
    });
    return connected.promise;
  }

  /**
   * Destroys the active session by stopping the WebSocket server and killing the
   * Safari subprocess.
   * @private
   */
  destroySession_() {
    var tasks = [];
    if (this.server_) {
      tasks.push(this.server_.stop());
    }
    if (this.safari_) {
      tasks.push(this.safari_.then(function(safari) {
        safari.kill();
        return safari.result();
      }));
    }
    var self = this;
    return promise.all(tasks).finally(function() {
      self.server_ = null;
      self.socket_ = null;
      self.safari_ = null;
    });
  }
}



/** @const */
const OPTIONS_CAPABILITY_KEY = 'safari.options';



/**
 * Configuration options specific to the {@link Driver SafariDriver}.
 */
class Options {
  constructor() {
    /** @private {Object<string, *>} */
    this.options_ = null;

    /** @private {./lib/logging.Preferences} */
    this.logPrefs_ = null;
  }

  /**
   * Extracts the SafariDriver specific options from the given capabilities
   * object.
   * @param {!Capabilities} capabilities The capabilities object.
   * @return {!Options} The ChromeDriver options.
   */
  static fromCapabilities(capabilities) {
    var options = new Options();

    var o = capabilities.get(OPTIONS_CAPABILITY_KEY);
    if (o instanceof Options) {
      options = o;
    } else if (o) {
      options.setCleanSession(o.cleanSession);
    }

    if (capabilities.has(Capability.LOGGING_PREFS)) {
      options.setLoggingPrefs(capabilities.get(Capability.LOGGING_PREFS));
    }

    return options;
  }

  /**
   * Sets whether to force Safari to start with a clean session. Enabling this
   * option will cause all global browser data to be deleted.
   * @param {boolean} clean Whether to make sure the session has no cookies,
   *     cache entries, local storage, or databases.
   * @return {!Options} A self reference.
   */
  setCleanSession(clean) {
    if (!this.options_) {
      this.options_ = {};
    }
    this.options_['cleanSession'] = clean;
    return this;
  }

  /**
   * Sets the logging preferences for the new session.
   * @param {!./lib/logging.Preferences} prefs The logging preferences.
   * @return {!Options} A self reference.
   */
  setLoggingPrefs(prefs) {
    this.logPrefs_ = prefs;
    return this;
  }

  /**
   * Converts this options instance to a {@link Capabilities} object.
   * @param {Capabilities=} opt_capabilities The capabilities to
   *     merge these options into, if any.
   * @return {!Capabilities} The capabilities.
   */
  toCapabilities(opt_capabilities) {
    var caps = opt_capabilities || Capabilities.safari();
    if (this.logPrefs_) {
      caps.set(Capability.LOGGING_PREFS, this.logPrefs_);
    }
    if (this.options_) {
      caps.set(OPTIONS_CAPABILITY_KEY, this);
    }
    return caps;
  }

  /**
   * Converts this instance to its JSON wire protocol representation. Note this
   * function is an implementation detail not intended for general use.
   * @return {!Object<string, *>} The JSON wire protocol representation of this
   *     instance.
   */
  [Symbols.serialize]() {
    return this.options_ || {};
  }
}


/**
 * A WebDriver client for Safari. This class should never be instantiated
 * directly; instead, use the {@linkplain ./builder.Builder Builder}:
 *
 *     var driver = new Builder()
 *         .forBrowser('safari')
 *         .build();
 *
 */
class Driver extends webdriver.WebDriver {
  /**
   * @param {(Options|Capabilities)=} opt_config The configuration
   *     options for the new session.
   * @param {promise.ControlFlow=} opt_flow The control flow to create
   *     the driver under.
   */
  constructor(opt_config, opt_flow) {
    var executor = new CommandExecutor();
    var caps =
        opt_config instanceof Options ? opt_config.toCapabilities() :
        (opt_config || Capabilities.safari());

    var driver = webdriver.WebDriver.createSession(executor, caps, opt_flow);
    super(driver.getSession(), executor, driver.controlFlow());
  }
}


// Public API


exports.Driver = Driver;
exports.Options = Options;
