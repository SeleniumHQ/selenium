// Copyright 2014 Selenium committers
// Copyright 2014 Software Freedom Conservancy
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

/**
 * @fileoverview Defines the {@linkplain Driver WebDriver} client for Firefox.
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
 */

'use strict';

var url = require('url'),
    util = require('util');

var Binary = require('./binary').Binary,
    Profile = require('./profile').Profile,
    decodeProfile = require('./profile').decode,
    webdriver = require('..'),
    executors = require('../executors'),
    httpUtil = require('../http/util'),
    io = require('../io'),
    net = require('../net'),
    portprober = require('../net/portprober');


/**
 * Configuration options for the FirefoxDriver.
 * @constructor
 */
var Options = function() {
  /** @private {Profile} */
  this.profile_ = null;

  /** @private {Binary} */
  this.binary_ = null;

  /** @private {webdriver.logging.Preferences} */
  this.logPrefs_ = null;

  /** @private {webdriver.ProxyConfig} */
  this.proxy_ = null;
};


/**
 * Sets the profile to use. The profile may be specified as a
 * {@link Profile} object or as the path to an existing Firefox profile to use
 * as a template.
 *
 * @param {(string|!Profile)} profile The profile to use.
 * @return {!Options} A self reference.
 */
Options.prototype.setProfile = function(profile) {
  if (typeof profile === 'string') {
    profile = new Profile(profile);
  }
  this.profile_ = profile;
  return this;
};


/**
 * Sets the binary to use. The binary may be specified as the path to a Firefox
 * executable, or as a {@link Binary} object.
 *
 * @param {(string|!Binary)} binary The binary to use.
 * @return {!Options} A self reference.
 */
Options.prototype.setBinary = function(binary) {
  if (typeof binary === 'string') {
    binary = new Binary(binary);
  }
  this.binary_ = binary;
  return this;
};


/**
 * Sets the logging preferences for the new session.
 * @param {webdriver.logging.Preferences} prefs The logging preferences.
 * @return {!Options} A self reference.
 */
Options.prototype.setLoggingPreferences = function(prefs) {
  this.logPrefs_ = prefs;
  return this;
};


/**
 * Sets the proxy to use.
 *
 * @param {webdriver.ProxyConfig} proxy The proxy configuration to use.
 * @return {!Options} A self reference.
 */
Options.prototype.setProxy = function(proxy) {
  this.proxy_ = proxy;
  return this;
};


/**
 * Converts these options to a {@link webdriver.Capabilities} instance.
 *
 * @return {!webdriver.Capabilities} A new capabilities object.
 */
Options.prototype.toCapabilities = function(opt_remote) {
  var caps = webdriver.Capabilities.firefox();
  if (this.logPrefs_) {
    caps.set(webdriver.Capability.LOGGING_PREFS, this.logPrefs_);
  }
  if (this.proxy_) {
    caps.set(webdriver.Capability.PROXY, this.proxy_);
  }
  if (this.binary_) {
    caps.set('firefox_binary', this.binary_);
  }
  if (this.profile_) {
    caps.set('firefox_profile', this.profile_);
  }
  return caps;
};


/**
 * A WebDriver client for Firefox.
 *
 * @param {(Options|webdriver.Capabilities|Object)=} opt_config The
 *    configuration options for this driver, specified as either an
 *    {@link Options} or {@link webdriver.Capabilities}, or as a raw hash
 *    object.
 * @param {webdriver.promise.ControlFlow=} opt_flow The flow to
 *     schedule commands through. Defaults to the active flow object.
 * @constructor
 * @extends {webdriver.WebDriver}
 */
var Driver = function(opt_config, opt_flow) {
  var caps;
  if (opt_config instanceof Options) {
    caps = opt_config.toCapabilities();
  } else {
    caps = new webdriver.Capabilities(opt_config);
  }

  var binary = caps.get('firefox_binary') || new Binary();
  if (typeof binary === 'string') {
    binary = new Binary(binary);
  }

  var profile = caps.get('firefox_profile') || new Profile();

  caps.set('firefox_binary', null);
  caps.set('firefox_profile', null);

  /** @private {?string} */
  this.profilePath_ = null;

  var self = this;
  var serverUrl = portprober.findFreePort().then(function(port) {
    var prepareProfile;
    if (typeof profile === 'string') {
      prepareProfile = decodeProfile(profile).then(function(dir) {
        var profile = new Profile(dir);
        profile.setPreference('webdriver_firefox_port', port);
        return profile.writeToDisk();
      });
    } else {
      profile.setPreference('webdriver_firefox_port', port);
      prepareProfile = profile.writeToDisk();
    }

    return prepareProfile.then(function(dir) {
      self.profilePath_ = dir;
      return binary.launch(dir);
    }).then(function() {
      var serverUrl = url.format({
        protocol: 'http',
        hostname: net.getLoopbackAddress(),
        port: port,
        pathname: '/hub'
      });

      return httpUtil.waitForServer(serverUrl, 45 * 1000).then(function() {
        return serverUrl;
      });
    });
  });

  var executor = executors.createExecutor(serverUrl);
  var driver = webdriver.WebDriver.createSession(executor, caps, opt_flow);

  webdriver.WebDriver.call(this, driver.getSession(), executor, opt_flow);
};
util.inherits(Driver, webdriver.WebDriver);


/**
 * This function is a no-op as file detectors are not supported by this
 * implementation.
 * @override
 */
Driver.prototype.setFileDetector = function() {
};


/** @override */
Driver.prototype.quit = function() {
  return this.call(function() {
    var self = this;
    return Driver.super_.prototype.quit.call(this).thenFinally(function() {
      if (self.profilePath_) {
        return io.rmDir(self.profilePath_);
      }
    });
  }, this);
};


// PUBLIC API


exports.Binary = Binary;
exports.Driver = Driver;
exports.Options = Options;
exports.Profile = Profile;
