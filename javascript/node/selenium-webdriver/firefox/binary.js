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

const path = require('path');

const io = require('../io');
const exec = require('../io/exec');


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




// PUBLIC API


exports.Channel = Channel;

