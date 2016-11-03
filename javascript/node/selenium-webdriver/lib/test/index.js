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

var assert = require('assert');

var build = require('./build'),
    isDevMode = require('../devmode'),
    webdriver = require('../../'),
    flow = webdriver.promise.controlFlow(),
    firefox = require('../../firefox'),
    safari = require('../../safari'),
    remote = require('../../remote'),
    testing = require('../../testing'),
    fileserver = require('./fileserver');


const LEGACY_FIREFOX = 'legacy-' + webdriver.Browser.FIREFOX;


/**
 * Browsers with native support.
 * @type {!Array.<webdriver.Browser>}
 */
var NATIVE_BROWSERS = [
  webdriver.Browser.CHROME,
  webdriver.Browser.EDGE,
  webdriver.Browser.FIREFOX,
  LEGACY_FIREFOX,
  webdriver.Browser.IE,
  webdriver.Browser.OPERA,
  webdriver.Browser.PHANTOM_JS,
  webdriver.Browser.SAFARI
];


var serverJar = process.env['SELENIUM_SERVER_JAR'];
var remoteUrl = process.env['SELENIUM_REMOTE_URL'];
var useLoopback = process.env['SELENIUM_USE_LOOP_BACK'] == '1';
var noMarionette = /^0|false$/i.test(process.env['SELENIUM_GECKODRIVER']);
var startServer = !!serverJar && !remoteUrl;
var nativeRun = !serverJar && !remoteUrl;

var browsersToTest = (function() {
  var permitRemoteBrowsers = !!remoteUrl || !!serverJar;
  var permitUnknownBrowsers = !nativeRun;
  var browsers = process.env['SELENIUM_BROWSER'] || webdriver.Browser.FIREFOX;

  browsers = browsers.split(',').map(function(browser) {
    var parts = browser.split(/:/);
    if (parts[0] === 'ie') {
      parts[0] = webdriver.Browser.IE;
    }
    if (parts[0] === 'edge') {
      parts[0] = webdriver.Browser.EDGE;
    }
    if (noMarionette && parts[0] === webdriver.Browser.FIREFOX) {
      parts[0] = LEGACY_FIREFOX;
    }
    return parts.join(':');
  });

  browsers.forEach(function(browser) {
    var parts = browser.split(/:/, 3);
    if (parts[0] === 'ie') {
      parts[0] = webdriver.Browser.IE;
    }

    if (parts[0] === LEGACY_FIREFOX) {
      return;
    }

    if (NATIVE_BROWSERS.indexOf(parts[0]) == -1 && !permitRemoteBrowsers) {
      throw Error('Browser ' + parts[0] + ' requires a WebDriver server and ' +
          'neither the SELENIUM_REMOTE_URL nor the SELENIUM_SERVER_JAR ' +
          'environment variables have been set.');
    }

    var recognized = false;
    for (var prop in webdriver.Browser) {
      if (webdriver.Browser.hasOwnProperty(prop) &&
          webdriver.Browser[prop] === parts[0]) {
        recognized = true;
        break;
      }
    }

    if (!recognized && !permitUnknownBrowsers) {
      throw Error('Unrecognized browser: ' + browser);
    }
  });

  console.log('Running tests against [' + browsers.join(',') + ']');
  if (remoteUrl) {
    console.log('Using remote server ' + remoteUrl);
  } else if (serverJar) {
    console.log('Using standalone Selenium server ' + serverJar);
    if (useLoopback) {
      console.log('Running tests using loopback address')
    }
  }
  console.log(
      'Promise manager is enabled? ' + webdriver.promise.USE_PROMISE_MANAGER);

  return browsers;
})();


/**
 * Creates a predicate function that ignores tests for specific browsers.
 * @param {string} currentBrowser The name of the current browser.
 * @param {!Array.<!Browser>} browsersToIgnore The browsers to ignore.
 * @return {function(): boolean} The predicate function.
 */
function browsers(currentBrowser, browsersToIgnore) {
  return function() {
    return browsersToIgnore.indexOf(currentBrowser) != -1;
  };
}


/**
 * @param {string} browserName The name to use.
 * @param {remote.DriverService} server The server to use, if any.
 * @constructor
 */
function TestEnvironment(browserName, server) {
  var name = browserName;

  this.currentBrowser = function() {
    return browserName;
  };

  this.isRemote = function() {
    return server || remoteUrl;
  };

  this.isMarionette = function() {
    return !noMarionette;
  };

  this.browsers = function(var_args) {
    var browsersToIgnore = Array.prototype.slice.apply(arguments, [0]);
    return browsers(browserName, browsersToIgnore);
  };

  this.builder = function() {
    var builder = new webdriver.Builder();
    var realBuild = builder.build;

    builder.build = function() {
      var parts = browserName.split(/:/, 3);

      if (parts[0] === LEGACY_FIREFOX) {
        var options = builder.getFirefoxOptions() || new firefox.Options();
        options.useGeckoDriver(false);
        builder.setFirefoxOptions(options);

        parts[0] = webdriver.Browser.FIREFOX;
      }

      builder.forBrowser(parts[0], parts[1], parts[2]);
      if (server) {
        builder.usingServer(server.address());
      } else if (remoteUrl) {
        builder.usingServer(remoteUrl);
      }

      builder.disableEnvironmentOverrides();
      return realBuild.call(builder);
    };

    return builder;
  };
}


var seleniumServer;
var inSuite = false;


/**
 * Expands a function to cover each of the target browsers.
 * @param {function(!TestEnvironment)} fn The top level suite
 *     function.
 * @param {{browsers: !Array.<string>}=} opt_options Suite specific options.
 */
function suite(fn, opt_options) {
  assert.ok(!inSuite, 'You may not nest suite calls');
  inSuite = true;

  var suiteOptions = opt_options || {};
  var browsers = suiteOptions.browsers;
  if (browsers) {
    // Filter out browser specific tests when that browser is not currently
    // selected for testing.
    browsers = browsers.filter(function(browser) {
      return browsersToTest.indexOf(browser) != -1;
    });
  } else {
    browsers = browsersToTest;
  }

  try {

    before(function() {
      if (isDevMode) {
        return build.of(
            '//javascript/atoms/fragments:is-displayed',
            '//javascript/webdriver/atoms:getAttribute')
            .onlyOnce().go();
      }
    });

    // Server is only started if required for a specific config.
    after(function() {
      if (seleniumServer) {
        return seleniumServer.stop();
      }
    });

    browsers.forEach(function(browser) {
      describe('[' + browser + ']', function() {

        if (isDevMode && nativeRun) {
          if (browser === LEGACY_FIREFOX) {
            before(function() {
              return build.of('//javascript/firefox-driver:webdriver')
                  .onlyOnce().go();
            });
          }
        }

        var serverToUse = null;

        if (!!serverJar && !remoteUrl) {
          if (!(serverToUse = seleniumServer)) {
            serverToUse = seleniumServer = new remote.SeleniumServer(
                serverJar, {loopback: useLoopback});
          }

          before(function() {
            this.timeout(0);
            return seleniumServer.start(60 * 1000);
          });
        }
        fn(new TestEnvironment(browser, serverToUse));
      });
    });
  } finally {
    inSuite = false;
  }
}


// GLOBAL TEST SETUP

before(function() {
   // Do not pass register fileserver.start directly with testing.before,
   // as start takes an optional port, which before assumes is an async
   // callback.
   return fileserver.start();
});

after(function() {
   return fileserver.stop();
});

// PUBLIC API


exports.suite = suite;
exports.after = testing.after;
exports.afterEach = testing.afterEach;
exports.before = testing.before;
exports.beforeEach = testing.beforeEach;
exports.it = testing.it;
exports.ignore = testing.ignore;

exports.Pages = fileserver.Pages;
exports.whereIs = fileserver.whereIs;
