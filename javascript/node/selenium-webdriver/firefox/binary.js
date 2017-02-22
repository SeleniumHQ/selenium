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
 * @fileoverview Manages Firefox binaries. This module is considered internal;
 * users should use {@link ./firefox selenium-webdriver/firefox}.
 */

'use strict';

const child = require('child_process'),
    fs = require('fs'),
    path = require('path'),
    util = require('util');

const isDevMode = require('../lib/devmode'),
    Symbols = require('../lib/symbols'),
    io = require('../io'),
    exec = require('../io/exec');



/** @const */
const NO_FOCUS_LIB_X86 = isDevMode ?
    path.join(__dirname, '../../../../cpp/prebuilt/i386/libnoblur.so') :
    path.join(__dirname, '../lib/firefox/i386/libnoblur.so') ;

/** @const */
const NO_FOCUS_LIB_AMD64 = isDevMode ?
    path.join(__dirname, '../../../../cpp/prebuilt/amd64/libnoblur64.so') :
    path.join(__dirname, '../lib/firefox/amd64/libnoblur64.so') ;

const X_IGNORE_NO_FOCUS_LIB = 'x_ignore_nofocus.so';


/**
 * @param {string} file Path to the file to find, relative to the program files
 *     root.
 * @return {!Promise<?string>} A promise for the located executable.
 *     The promise will resolve to {@code null} if Firefox was not found.
 */
function findInProgramFiles(file) {
  let files = [
    process.env['PROGRAMFILES'] || 'C:\\Program Files',
    process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)'
  ].map(prefix => path.join(prefix, file));
  return io.exists(files[0]).then(function(exists) {
    return exists ? files[0] : io.exists(files[1]).then(function(exists) {
      return exists ? files[1] : null;
    });
  });
}


/**
 * Provides methods for locating the executable for a Firefox release channel
 * on Windows and MacOS. For other systems (i.e. Linux), Firefox will always
 * be located on the system PATH.
 *
 * @final
 */
class Channel {
  /**
   * @param {string} darwin The path to check when running on MacOS.
   * @param {string} win32 The path to check when running on Windows.
   */
  constructor(darwin, win32) {
    /** @private @const */ this.darwin_ = darwin;
    /** @private @const */ this.win32_ = win32;
    /** @private {Promise<string>} */
    this.found_ = null;
  }

  /**
   * Attempts to locate the Firefox executable for this release channel. This
   * will first check the default installation location for the channel before
   * checking the user's PATH. The returned promise will be rejected if Firefox
   * can not be found.
   *
   * @return {!Promise<string>} A promise for the location of the located
   *     Firefox executable.
   */
  locate() {
    if (this.found_) {
      return this.found_;
    }

    let found;
    switch (process.platform) {
      case 'darwin':
        found = io.exists(this.darwin_)
            .then(exists => exists ? this.darwin_ : io.findInPath('firefox'));
        break;

      case 'win32':
        found = findInProgramFiles(this.win32_)
            .then(found => found || io.findInPath('firefox.exe'));
        break;

      default:
        found = Promise.resolve(io.findInPath('firefox'));
        break;
    }

    this.found_ = found.then(found => {
      if (found) {
        // TODO: verify version info.
        return found;
      }
      throw Error('Could not locate Firefox on the current system');
    });
    return this.found_;
  }
}


/**
 * Firefox's developer channel.
 * @const
 * @see <https://www.mozilla.org/en-US/firefox/channel/desktop/#aurora>
 */
Channel.AURORA = new Channel(
  '/Applications/FirefoxDeveloperEdition.app/Contents/MacOS/firefox-bin',
  'Firefox Developer Edition\\firefox.exe');

/**
 * Firefox's beta channel. Note this is provided mainly for convenience as
 * the beta channel has the same installation location as the main release
 * channel.
 * @const
 * @see <https://www.mozilla.org/en-US/firefox/channel/desktop/#beta>
 */
Channel.BETA = new Channel(
  '/Applications/Firefox.app/Contents/MacOS/firefox-bin',
  'Mozilla Firefox\\firefox.exe');

/**
 * Firefox's release channel.
 * @const
 * @see <https://www.mozilla.org/en-US/firefox/desktop/>
 */
Channel.RELEASE = new Channel(
  '/Applications/Firefox.app/Contents/MacOS/firefox-bin',
  'Mozilla Firefox\\firefox.exe');

/**
 * Firefox's nightly release channel.
 * @const
 * @see <https://www.mozilla.org/en-US/firefox/channel/desktop/#nightly>
 */
Channel.NIGHTLY = new Channel(
  '/Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin',
  'Nightly\\firefox.exe');


/**
 * Copies the no focus libs into the given profile directory.
 * @param {string} profileDir Path to the profile directory to install into.
 * @return {!Promise<string>} The LD_LIBRARY_PATH prefix string to use
 *     for the installed libs.
 */
function installNoFocusLibs(profileDir) {
  var x86 = path.join(profileDir, 'x86');
  var amd64 = path.join(profileDir, 'amd64');

  return io.mkdir(x86)
      .then(() => copyLib(NO_FOCUS_LIB_X86, x86))
      .then(() => io.mkdir(amd64))
      .then(() => copyLib(NO_FOCUS_LIB_AMD64, amd64))
      .then(function() {
        return x86 + ':' + amd64;
      });

  function copyLib(src, dir) {
    return io.copy(src, path.join(dir, X_IGNORE_NO_FOCUS_LIB));
  }
}


/**
 * Provides a mechanism to configure and launch Firefox in a subprocess for
 * use with WebDriver.
 *
 * If created _without_ a path for the Firefox binary to use, this class will
 * attempt to find Firefox when {@link #launch()} is called. For MacOS and
 * Windows, this class will look for Firefox in the current platform's default
 * installation location (e.g. /Applications/Firefox.app on MacOS). For all
 * other platforms, the Firefox executable must be available on your system
 * `PATH`.
 *
 * @final
 */
class Binary {
  /**
   * @param {?(string|Channel)=} opt_exeOrChannel Either the path to a specific
   *     Firefox binary to use, or a {@link Channel} instance that describes
   *     how to locate the desired Firefox version.
   */
  constructor(opt_exeOrChannel) {
    /** @private {?(string|Channel)} */
    this.exe_ = opt_exeOrChannel || null;

    /** @private {!Array.<string>} */
    this.args_ = [];

    /** @private {!Object<string, string>} */
    this.env_ = {};
    Object.assign(this.env_, process.env, {
      MOZ_CRASHREPORTER_DISABLE: '1',
      MOZ_NO_REMOTE: '1',
      NO_EM_RESTART: '1'
    });

    /** @private {boolean} */
    this.devEdition_ = false;
  }

  /**
   * @return {(string|undefined)} The path to the Firefox executable to use, or
   *     `undefined` if WebDriver should attempt to locate Firefox automatically
   *     on the current system.
   */
  getExe() {
    return typeof this.exe_ === 'string' ? this.exe_ : undefined;
  }

  /**
   * Add arguments to the command line used to start Firefox.
   * @param {...(string|!Array.<string>)} var_args Either the arguments to add
   *     as varargs, or the arguments as an array.
   */
  addArguments(var_args) {
    for (var i = 0; i < arguments.length; i++) {
      if (Array.isArray(arguments[i])) {
        this.args_ = this.args_.concat(arguments[i]);
      } else {
        this.args_.push(arguments[i]);
      }
    }
  }

  /**
   * @return {!Array<string>} The command line arguments to use when starting
   *     the browser.
   */
  getArguments() {
    return this.args_;
  }

  /**
   * Specifies whether to use Firefox Developer Edition instead of the normal
   * stable channel. Setting this option has no effect if this instance was
   * created with a path to a specific Firefox binary.
   *
   * This method has no effect on Unix systems where the Firefox application
   * has the same (default) name regardless of version.
   *
   * @param {boolean=} opt_use Whether to use the developer edition. Defaults to
   *     true.
   * @deprecated Use the {@link Channel} class to indicate the desired Firefox
   *     version when creating a new binary: `new Binary(Channel.AURORA)`.
   */
  useDevEdition(opt_use) {
    this.devEdition_ = opt_use === undefined || !!opt_use;
  }

  /**
   * Returns a promise for the Firefox executable used by this instance. The
   * returned promise will be immediately resolved if the user supplied an
   * executable path when this instance was created. Otherwise, an attempt will
   * be made to find Firefox on the current system.
   *
   * @return {!Promise<string>} a promise for the path to the Firefox executable
   *     used by this instance.
   */
  locate() {
    if (typeof this.exe_ === 'string') {
      return Promise.resolve(this.exe_);
    } else if (this.exe_ instanceof Channel) {
      return this.exe_.locate();
    }
    let channel = this.devEdition_ ? Channel.AURORA : Channel.RELEASE;
    return channel.locate();
  }

  /**
   * Launches Firefox and returns a promise that will be fulfilled when the
   * process terminates.
   * @param {string} profile Path to the profile directory to use.
   * @return {!Promise<!exec.Command>} A promise for the handle to the started
   *     subprocess.
   */
  launch(profile) {
    let env = {};
    Object.assign(env, this.env_, {XRE_PROFILE_PATH: profile});

    let args = ['-foreground'].concat(this.args_);

    return this.locate().then(function(firefox) {
      if (process.platform === 'win32' || process.platform === 'darwin') {
        return exec(firefox, {args: args, env: env});
      }
      return installNoFocusLibs(profile).then(function(ldLibraryPath) {
        env['LD_LIBRARY_PATH'] = ldLibraryPath + ':' + env['LD_LIBRARY_PATH'];
        env['LD_PRELOAD'] = X_IGNORE_NO_FOCUS_LIB;
        return exec(firefox, {args: args, env: env});
      });
    });
  }

  /**
   * Returns a promise for the wire representation of this binary. Note: the
   * FirefoxDriver only supports passing the path to the binary executable over
   * the wire; all command line arguments and environment variables will be
   * discarded.
   *
   * @return {!Promise<string>} A promise for this binary's wire representation.
   */
  [Symbols.serialize]() {
    return this.locate();
  }
}


// PUBLIC API


exports.Binary = Binary;
exports.Channel = Channel;

