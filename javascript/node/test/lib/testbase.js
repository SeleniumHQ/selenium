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

require('./_bootstrap')(module);

var assert = require('assert'),
    webdriver = require('selenium-webdriver'),
    flow = webdriver.promise.controlFlow(),
    testing = require('selenium-webdriver/testing'),
    fileserver = require('./fileserver'),
    seleniumserver = require('./seleniumserver');


var Browser = {
  ANDROID: 'android',
  CHROME: 'chrome',
  IE: 'internet explorer',
  // Shorthand for IPAD && IPHONE when using the browsers predciate.
  IOS: 'iOS',
  IPAD: 'iPad',
  IPHONE: 'iPhone',
  FIREFOX: 'firefox',
  OPERA: 'opera',
  PHANTOMJS: 'phantomjs',
  SAFARI: 'safari'
};


var browsersToTest = (function() {
  var browsers = process.env['SELENIUM_BROWSER'] || Browser.CHROME;
  browsers = browsers.split(',');
  browsers.forEach(function(browser) {
    if (browser === Browser.IOS) {
      throw Error('Invalid browser name: ' + browser);
    }

    for (var name in Browser) {
      if (Browser[name] === browser) {
        return;
      }
    }

    throw Error('Unrecognized browser: ' + browser);
  });
  return browsers;
})();


/**
 * Creates a predicate function that ignores tests for speific browsers.
 * @param {string} currentBrowser The name of the current browser.
 * @param {...Browser} var_args Names of the browsers to ignore.
 */
function browsers(currentBrowser, browsersToIgnore) {
  return function() {
    var checkIos =
        currentBrowser === Browser.IPAD || currentBrowser === Browser.IPHONE;
    return browsersToIgnore.indexOf(currentBrowser) != -1 ||
        (checkIos && browsersToIgnore.indexOf(Browser.IOS) != -1);
  };
}


/**
 * @param {string} browserName The name to use.
 * @constructor
 */
function TestEnvironment(browserName) {
  var driver;

  this.__defineGetter__('driver', function() { return driver; });

  this.browsers = function(var_args) {
    var browsersToIgnore = Array.prototype.slice.apply(arguments, [0]);
    return browsers(browserName, browsersToIgnore);
  };

  this.createDriver = function() {
    if (!driver) {
      driver = new webdriver.Builder().
          withCapabilities({browserName: browserName}).
          usingServer(server.address()).
          build();
    }
    return driver;
  };

  this.refreshDriver = function() {
    if (driver) {
      driver.quit();
      driver = null;
    }
    this.createDriver();
  };

  this.dispose = function() {
    if (driver) {
      driver.quit();
      driver = null;
    }
  };

  this.assertTitleIs = function(expected) {
    driver.getTitle().then(function(title) {
      assert.equal(expected, title);
    });
  };

  this.waitForTitleToBe = function(expected) {
    driver.wait(function() {
      return driver.getTitle().then(function(title) {
        return title === expected;
      });
    }, 5000, 'Waiting for title to be ' + expected);
  };
}


var inSuite = false;


/**
 * Expands a function to cover each of the target browsers.
 * @param {f}
 * @param {function(!TestEnvironment)} fn The top level suite
 *     function.
 */
function suite(fn) {
  assert.ok(!inSuite, 'You may not nest suite calls');
  inSuite = true;

  try {
    browsersToTest.forEach(function(browser) {

      testing.describe('[' + browser + ']', function() {
        var env = new TestEnvironment(browser);

        testing.beforeEach(function() {
          env.createDriver();
        });

        testing.after(function() {
          env.dispose();
        });

        fn(env);
      });
    });
  } finally {
    inSuite = false;
  }
}


var server = new seleniumserver.Server();


// GLOBAL TEST SETUP


testing.before(server.start.bind(server, 60 * 1000));
testing.before(fileserver.start);
testing.after(server.stop.bind(server));
testing.after(fileserver.stop);


// PUBLIC API


exports.suite = suite;
exports.after = testing.after;
exports.afterEach = testing.afterEach;
exports.before = testing.before;
exports.beforeEach = testing.beforeEach;
exports.it = testing.it;
exports.ignore = testing.ignore;

exports.Browser = Browser;
exports.Pages = fileserver.Pages;
exports.whereIs = fileserver.whereIs;
