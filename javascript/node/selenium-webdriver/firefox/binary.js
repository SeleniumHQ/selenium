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
    promise = require('../lib/promise'),
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


let foundBinary = null;
let foundDevBinary = null;


/**
 * Checks the default Windows Firefox locations in Program Files.
 *
 * @param {boolean=} opt_dev Whether to find the Developer Edition.
 * @return {!Promise<?string>} A promise for the located executable.
 *     The promise will resolve to {@code null} if Firefox was not found.
 */
function defaultWindowsLocation(opt_dev) {
  var files = [
    process.env['PROGRAMFILES'] || 'C:\\Program Files',
    process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)'
  ].map(function(prefix) {
    if (opt_dev) {
      return path.join(prefix, 'Firefox Developer Edition\\firefox.exe');
    }
    return path.join(prefix, 'Mozilla Firefox\\firefox.exe');
  });
  return io.exists(files[0]).then(function(exists) {
    return exists ? files[0] : io.exists(files[1]).then(function(exists) {
      return exists ? files[1] : null;
    });
  });
}


/**
 * Locates the Firefox binary for the current system.
 *
 * @param {boolean=} opt_dev Whether to find the Developer Edition. This only
 *     used on Windows and OSX.
 * @return {!Promise<string>} A promise for the located binary. The promise will
 *     be rejected if Firefox cannot be located.
 */
function findFirefox(opt_dev) {
  if (opt_dev && foundDevBinary) {
    return foundDevBinary;
  }

  if (!opt_dev && foundBinary) {
    return foundBinary;
  }

  let found;
  if (process.platform === 'darwin') {
    let exe = opt_dev
        ? '/Applications/FirefoxDeveloperEdition.app/Contents/MacOS/firefox-bin'
        : '/Applications/Firefox.app/Contents/MacOS/firefox-bin';
    found = io.exists(exe).then(exists => exists ? exe : null);

  } else if (process.platform === 'win32') {
    found = defaultWindowsLocation(opt_dev);

  } else {
    found = Promise.resolve(io.findInPath('firefox'));
  }

  found = found.then(found => {
    if (found) {
      return found;
    }
    throw Error('Could not locate Firefox on the current system');
  });

  if (opt_dev) {
    return foundDevBinary = found;
  } else {
    return foundBinary = found;
  }
}


/**
 * Copies the no focus libs into the given profile directory.
 * @param {string} profileDir Path to the profile directory to install into.
 * @return {!promise.Promise.<string>} The LD_LIBRARY_PATH prefix string to use
 *     for the installed libs.
 */
function installNoFocusLibs(profileDir) {
  var x86 = path.join(profileDir, 'x86');
  var amd64 = path.join(profileDir, 'amd64');

  return mkdir(x86)
      .then(copyLib.bind(null, NO_FOCUS_LIB_X86, x86))
      .then(mkdir.bind(null, amd64))
      .then(copyLib.bind(null, NO_FOCUS_LIB_AMD64, amd64))
      .then(function() {
        return x86 + ':' + amd64;
      });

  function mkdir(dir) {
    return io.exists(dir).then(function(exists) {
      if (!exists) {
        return promise.checkedNodeCall(fs.mkdir, dir);
      }
    });
  }

  function copyLib(src, dir) {
    return io.copy(src, path.join(dir, X_IGNORE_NO_FOCUS_LIB));
  }
}


/**
 * Provides a mechanism to configure and launch Firefox in a subprocess for
 * use with WebDriver.
 *
 * If created _without_ a path for the Firefox binary to use, this class will
 * attempt to find Firefox when {@link #launch()} is called. For OSX and
 * Windows, this class will look for Firefox in the current platform's default
 * installation location (e.g. /Applications/Firefox.app on OSX). For all other
 * platforms, the Firefox executable must be available on your system `PATH`.
 *
 * @final
 */
class Binary {
  /**
   * @param {string=} opt_exe Path to the Firefox binary to use.
   */
  constructor(opt_exe) {
    /** @private {(string|undefined)} */
    this.exe_ = opt_exe;

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
   * Specifies whether to use Firefox Developer Edition instead of the normal
   * stable channel. Setting this option has no effect if this instance was
   * created with a path to a specific Firefox binary.
   *
   * This method has no effect on Unix systems where the Firefox application
   * has the same (default) name regardless of version.
   *
   * @param {boolean=} opt_use Whether to use the developer edition. Defaults to
   *     true.
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
   * @return {!promise.Promise<string>} a promise for the path to the Firefox
   *     executable used by this instance.
   */
  locate() {
    return promise.fulfilled(this.exe_ || findFirefox(this.devEdition_));
  }

  /**
   * Launches Firefox and returns a promise that will be fulfilled when the
   * process terminates.
   * @param {string} profile Path to the profile directory to use.
   * @return {!promise.Promise<!exec.Command>} A promise for the handle to the
   *     started subprocess.
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
   * @return {!promise.Promise<string>} A promise for this binary's wire
   *     representation.
   */
  [Symbols.serialize]() {
    return this.locate();
  }
}


// PUBLIC API


exports.Binary = Binary;

