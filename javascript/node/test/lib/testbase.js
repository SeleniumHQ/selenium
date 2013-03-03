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
    fileserver = require('./fileserver'),
    Server = require('./seleniumserver').Server;


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


var currentBrowser;
var server = new Server(), driver;


(function() {
  currentBrowser = process.env['SELENIUM_BROWSER'] || Browser.CHROME;
  if (currentBrowser === Browser.IOS) {
    throw Error('Invalid browser name: ' + currentBrowser);
  }

  for (var name in Browser) {
    if (Browser[name] === currentBrowser) {
      return;
    }
  }
  throw Error('Unrecognized browser: ' + currentBrowser);
})();


/**
 * Creates a predicate function that ignores tests for speific browsers.
 * @param {...Browser} var_args Names of the browsers to ignore.
 */
function browsers(var_args) {
  var browserNames = Array.prototype.slice.apply(arguments, [0]);
  return function() {
    var checkIos =
        currentBrowser === Browser.IPAD || currentBrowser === Browser.IPHONE;
    return browserNames.indexOf(currentBrowser) != -1 ||
        (checkIos && browserNames.indexOf(Browser.IOS) != -1);
  };
}


/**
 * Wraps a function so that all passed arguments are ignored.
 * @param {!Function} fn The function to wrap.
 * @return {!Function} The wrapped function.
 */
function seal(fn) {
  return function() {
    fn();
  };
}


function wrapped(globalFn) {
  return function() {
    switch (arguments.length) {
      case 1:
        globalFn(asyncTestFn(arguments[0]));
        break;

      case 2:
        globalFn(arguments[0], asyncTestFn(arguments[1]));
        break;

      default:
        throw Error('Invalid # arguments: ' + arguments.length);
    }
  };

  function asyncTestFn(fn) {
    return function(done) {
      this.timeout(0);
      flow.execute(fn).then(seal(done), done);
    };
  }
}


/**
 * Configures a test to be conditionally supressed.
 * @param {function(): boolean} predicateFn A predicate to call to determine
 *     if the test should be suppressed. This function MUST be synchronous.
 * @return {!Object} A wrapped version of exports.it that ignores tests as
 *     indicated by the predicate.
 */
function ignore(predicateFn) {
  var it = function(title, fn) {
    if (predicateFn()) {
      exports.xit(title, fn);
    } else {
      exports.it(title, fn);
    }
  };

  it.only = function(title, fn) {
    if (predicateFn()) {
      exports.xit(title, fn);
    } else {
      exports.it(title, fn);
    }
  };

  return {it: it};
};


function createDriver() {
  if (!driver) {
    driver = new webdriver.Builder().
        withCapabilities({browserName: currentBrowser}).
        usingServer(server.address()).
        build();
  }
}

function refreshDriver() {
  if (driver) {
    driver.quit();
    driver = null;
  }
  createDriver();
}


// PUBLIC API


exports.after = wrapped(after);
exports.afterEach = wrapped(afterEach);
exports.before = wrapped(before);
exports.beforeEach = wrapped(beforeEach);

exports.it = wrapped(it);
exports.it.only = exports.iit = wrapped(it.only);
exports.it.skip = exports.xit = wrapped(it.skip);

exports.ignore = ignore;
exports.browsers = browsers;
exports.Browser = Browser;

exports.refreshDriver = refreshDriver;
exports.Pages = fileserver.Pages;
exports.whereIs = fileserver.whereIs;
exports.__defineGetter__('driver', function() { return driver; });

exports.assertTitleIs = function(expected) {
  driver.getTitle().then(function(title) {
    assert.equal(expected, title);
  });
};

exports.waitForTitleToBe = function(expected) {
  driver.wait(function() {
    return driver.getTitle().then(function(title) {
      return title === expected;
    });
  }, 5000, 'Waiting for title to be ' + expected);
};


// GLOBAL TEST SETUP


exports.before(server.start.bind(server, 60 * 1000));
exports.before(fileserver.start);
exports.beforeEach(createDriver);
exports.after(function() {
  if (driver) {
    driver.quit();
    driver = null;
  }
});
exports.after(server.stop.bind(server));
exports.after(fileserver.stop);
