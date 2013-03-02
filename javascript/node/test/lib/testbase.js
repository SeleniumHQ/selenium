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


var server = new Server(), driver;


// PUBLIC API


exports.after = wrapped(after);
exports.afterEach = wrapped(afterEach);
exports.before = wrapped(before);
exports.beforeEach = wrapped(beforeEach);
exports.it = wrapped(it);
exports.it.only = exports.iit = wrapped(it.only);
exports.it.skip = exports.xit = wrapped(it.skip);

exports.Pages = fileserver.Pages;
exports.__defineGetter__('driver', function() { return driver; });

exports.assertTitleIs = function(expected) {
  driver.getTitle().then(function(title) {
    assert.equal(expected, title);
  });
};


// GLOBAL TEST SETUP


exports.before(server.start.bind(server, 60 * 1000));
exports.before(fileserver.start);

exports.beforeEach(function() {
  if (!driver) {
    driver = new webdriver.Builder().
        withCapabilities({browserName: 'chrome'}).
        usingServer(server.address()).
        build();
  }
});

exports.after(function() {
  if (driver) {
    driver.quit();
  }
});
exports.after(server.stop.bind(server));
exports.after(fileserver.stop);
