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
 * @fileoverview Profile management module. This module is considered internal;
 * users should use {@link selenium-webdriver/firefox}.
 */

'use strict';

const fs = require('fs'),
    path = require('path'),
    vm = require('vm');

const isDevMode = require('../lib/devmode'),
    Symbols = require('../lib/symbols'),
    io = require('../io'),
    {Zip, unzip} = require('../io/zip'),
    extension = require('./extension');


/**
 * Parses a user.js file in a Firefox profile directory.
 * @param {string} f Path to the file to parse.
 * @return {!Promise<!Object>} A promise for the parsed preferences as
 *     a JSON object. If the file does not exist, an empty object will be
 *     returned.
 */
function loadUserPrefs(f) {
  return io.read(f).then(
      function onSuccess(contents) {
        var prefs = {};
        var context = vm.createContext({
          'user_pref': function(key, value) {
            prefs[key] = value;
          }
        });
        vm.runInContext(contents.toString(), context, f);
        return prefs;
      },
      function onError(err) {
        if (err && err.code === 'ENOENT') {
          return {};
        }
        throw err;
      });
}



/**
 * @param {!Object} prefs The default preferences to write. Will be
 *     overridden by user.js preferences in the template directory and the
 *     frozen preferences required by WebDriver.
 * @param {string} dir Path to the directory write the file to.
 * @return {!Promise<string>} A promise for the profile directory,
 *     to be fulfilled when user preferences have been written.
 */
function writeUserPrefs(prefs, dir) {
  var userPrefs = path.join(dir, 'user.js');
  return loadUserPrefs(userPrefs).then(function(overrides) {
    Object.assign(prefs, overrides);

    let keys = Object.keys(prefs);
    if (!keys.length) {
      return dir;
    }

    let contents = Object.keys(prefs).map(function(key) {
      return 'user_pref(' + JSON.stringify(key) + ', ' +
          JSON.stringify(prefs[key]) + ');';
    }).join('\n');

    return new Promise((resolve, reject) => {
      fs.writeFile(userPrefs, contents, function(err) {
        err && reject(err) || resolve(dir);
      });
    });
  });
};


/**
 * Installs a group of extensions in the given profile directory. If the
 * WebDriver extension is not included in this set, the default version
 * bundled with this package will be installed.
 * @param {!Array.<string>} extensions The extensions to install, as a
 *     path to an unpacked extension directory or a path to a xpi file.
 * @param {string} dir The profile directory to install to.
 * @return {!Promise<string>} A promise for the main profile directory
 *     once all extensions have been installed.
 */
function installExtensions(extensions, dir) {
  var next = 0;
  var extensionDir = path.join(dir, 'extensions');

  return new Promise(function(fulfill, reject) {
    io.mkdir(extensionDir).then(installNext, reject);

    function installNext() {
      if (next >= extensions.length) {
        fulfill(dir);
      } else {
        install(extensions[next++]);
      }
    }

    function install(ext) {
      extension.install(ext, extensionDir).then(function(id) {
        installNext();
      }, reject);
    }
  });
}



/**
 * Models a Firefox profile directory for use with the FirefoxDriver. The
 * {@code Profile} directory uses an in-memory model until
 * {@link #writeToDisk} or {@link #encode} is called.
 */
class Profile {
  /**
   * @param {string=} opt_dir Path to an existing Firefox profile directory to
   *     use a template for this profile. If not specified, a blank profile will
   *     be used.
   */
  constructor(opt_dir) {
    /** @private {!Object} */
    this.preferences_ = {};

    /** @private {(string|undefined)} */
    this.template_ = opt_dir;

    /** @private {!Array<string>} */
    this.extensions_ = [];
  }

  /**
   * @return {(string|undefined)} Path to an existing Firefox profile directory
   *     to use as a template when writing this Profile to disk.
   */
  getTemplateDir() {
    return this.template_;
  }

  /**
   * Registers an extension to be included with this profile.
   * @param {string} extension Path to the extension to include, as either an
   *     unpacked extension directory or the path to a xpi file.
   */
  addExtension(extension) {
    this.extensions_.push(extension);
  }

  /**
   * @return {!Array<string>} A list of extensions to install in this profile.
   */
  getExtensions() {
    return this.extensions_;
  }

  /**
   * Sets a desired preference for this profile.
   * @param {string} key The preference key.
   * @param {(string|number|boolean)} value The preference value.
   * @throws {Error} If attempting to set a frozen preference.
   */
  setPreference(key, value) {
    this.preferences_[key] = value;
  }

  /**
   * Returns the currently configured value of a profile preference. This does
   * not include any defaults defined in the profile's template directory user.js
   * file (if a template were specified on construction).
   * @param {string} key The desired preference.
   * @return {(string|number|boolean|undefined)} The current value of the
   *     requested preference.
   */
  getPreference(key) {
    return this.preferences_[key];
  }

  /**
   * @return {!Object} A copy of all currently configured preferences.
   */
  getPreferences() {
    return Object.assign({}, this.preferences_);
  }

  /**
   * Specifies which host the driver should listen for commands on. If not
   * specified, the driver will default to "localhost". This option should be
   * specified when "localhost" is not mapped to the loopback address
   * (127.0.0.1) in `/etc/hosts`.
   *
   * @param {string} host the host the driver should listen for commands on
   */
  setHost(host) {
    this.preferences_['webdriver_firefox_allowed_hosts'] = host;
  }

  /**
   * @return {boolean} Whether the FirefoxDriver is configured to automatically
   *     accept untrusted SSL certificates.
   */
  acceptUntrustedCerts() {
    return !!this.preferences_['webdriver_accept_untrusted_certs'];
  }

  /**
   * Sets whether the FirefoxDriver should automatically accept untrusted SSL
   * certificates.
   * @param {boolean} value .
   */
  setAcceptUntrustedCerts(value) {
    this.preferences_['webdriver_accept_untrusted_certs'] = !!value;
  }

  /**
   * Sets whether to assume untrusted certificates come from untrusted issuers.
   * @param {boolean} value .
   */
  setAssumeUntrustedCertIssuer(value) {
    this.preferences_['webdriver_assume_untrusted_issuer'] = !!value;
  }

  /**
   * @return {boolean} Whether to assume untrusted certs come from untrusted
   *     issuers.
   */
  assumeUntrustedCertIssuer() {
    return !!this.preferences_['webdriver_assume_untrusted_issuer'];
  }

  /**
   * Writes this profile to disk.
   * @return {!Promise<string>} A promise for the path to the new profile
   *     directory.
   */
  writeToDisk() {
    var profileDir = io.tmpDir();
    if (this.template_) {
      profileDir = profileDir.then(function(dir) {
        return io.copyDir(
            /** @type {string} */(this.template_),
            dir, /(parent\.lock|lock|\.parentlock)/);
      }.bind(this));
    }

    // Freeze preferences for async operations.
    let prefs = Object.assign({}, this.preferences_);

    // Freeze extensions for async operations.
    var extensions = this.extensions_.concat();

    return profileDir.then(function(dir) {
      return writeUserPrefs(prefs, dir);
    }).then(function(dir) {
      return installExtensions(extensions, dir);
    });
  }

  /**
   * Write profile to disk, compress its containing directory, and return
   * it as a Base64 encoded string.
   *
   * @return {!Promise<string>} A promise for the encoded profile as
   *     Base64 string.
   *
   */
  encode() {
    return this.writeToDisk().then(function(dir) {
      let zip = new Zip;
      return zip.addDir(dir)
          .then(() => zip.toBuffer())
          .then(buf => buf.toString('base64'));
    });
  }

  /**
   * Encodes this profile as a zipped, base64 encoded directory.
   * @return {!Promise<string>} A promise for the encoded profile.
   */
  [Symbols.serialize]() {
    return this.encode();
  }
}


// PUBLIC API


exports.Profile = Profile;
exports.loadUserPrefs = loadUserPrefs;
