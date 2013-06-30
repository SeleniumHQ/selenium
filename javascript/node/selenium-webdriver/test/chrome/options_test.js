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

var fs = require('fs');

var webdriver = require('../..'),
    chrome = require('../../chrome'),
    proxy = require('../../proxy'),
    asserts = require('../../testing/asserts'),
    assertThat = asserts.assertThat,
    equals = asserts.equals,
    instanceOfClass = asserts.instanceOfClass;

var test = require('../../lib/test');


describe('chrome.Options', function() {

  describe('fromCapabilities', function() {

    it('should return a new Options instance if none were defined',
       function() {
         var options = chrome.Options.fromCapabilities(
             new webdriver.Capabilities());
         assertThat(options, instanceOfClass(chrome.Options));
       });

    it('should return options instance if present', function() {
      var options = new chrome.Options();
      var caps = options.toCapabilities();
      assertThat(caps, instanceOfClass(webdriver.Capabilities));
      assertThat(chrome.Options.fromCapabilities(caps), equals(options));
    });

    it('should rebuild options from wire representation', function() {
      var caps = webdriver.Capabilities.chrome().set('chromeOptions', {
        args: ['a', 'b'],
        extensions: [1, 2],
        binary: 'binaryPath',
        logFile: 'logFilePath',
        detach: true,
        localState: 'localStateValue',
        prefs: 'prefsValue'
      });

      var options = chrome.Options.fromCapabilities(caps);

      assertThat(options.args_.length, equals(2));
      assertThat(options.args_[0], equals('a'));
      assertThat(options.args_[1], equals('b'));
      assertThat(options.extensions_.length, equals(2));
      assertThat(options.extensions_[0], equals(1));
      assertThat(options.extensions_[1], equals(2));
      assertThat(options.binary_, equals('binaryPath'));
      assertThat(options.logFile_, equals('logFilePath'));
      assertThat(options.detach_, equals(true));
      assertThat(options.localState_, equals('localStateValue'));
      assertThat(options.prefs_, equals('prefsValue'));
    });

    it('should extract supported WebDriver capabilities', function() {
      var proxyPrefs = proxy.direct();
      var logPrefs = {};
      var caps = webdriver.Capabilities.chrome().
          set(webdriver.Capability.PROXY, proxyPrefs).
          set(webdriver.Capability.LOGGING_PREFS, logPrefs);

      var options = chrome.Options.fromCapabilities(caps);
      assertThat(options.proxy_, equals(proxyPrefs));
      assertThat(options.logPrefs_, equals(logPrefs));
    });
  });

  describe('addArguments', function() {
    it('takes var_args', function() {
      var options = new chrome.Options();
      assertThat(options.args_.length, equals(0));

      options.addArguments('a', 'b');
      assertThat(options.args_.length, equals(2));
      assertThat(options.args_[0], equals('a'));
      assertThat(options.args_[1], equals('b'));
    });

    it('flattens input arrays', function() {
      var options = new chrome.Options();
      assertThat(options.args_.length, equals(0));

      options.addArguments(['a', 'b'], 'c', [1, 2], 3);
      assertThat(options.args_.length, equals(6));
      assertThat(options.args_[0], equals('a'));
      assertThat(options.args_[1], equals('b'));
      assertThat(options.args_[2], equals('c'));
      assertThat(options.args_[3], equals(1));
      assertThat(options.args_[4], equals(2));
      assertThat(options.args_[5], equals(3));
    });
  });

  describe('addExtensions', function() {
    it('takes var_args', function() {
      var options = new chrome.Options();
      assertThat(options.extensions_.length, equals(0));

      options.addExtensions('a', 'b');
      assertThat(options.extensions_.length, equals(2));
      assertThat(options.extensions_[0], equals('a'));
      assertThat(options.extensions_[1], equals('b'));
    });

    it('flattens input arrays', function() {
      var options = new chrome.Options();
      assertThat(options.extensions_.length, equals(0));

      options.addExtensions(['a', 'b'], 'c', [1, 2], 3);
      assertThat(options.extensions_.length, equals(6));
      assertThat(options.extensions_[0], equals('a'));
      assertThat(options.extensions_[1], equals('b'));
      assertThat(options.extensions_[2], equals('c'));
      assertThat(options.extensions_[3], equals(1));
      assertThat(options.extensions_[4], equals(2));
      assertThat(options.extensions_[5], equals(3));
    });
  });

  describe('toJSON', function() {
    it('base64 encodes extensions', function() {
      var expected = fs.readFileSync(__filename, 'base64');
      var wire = new chrome.Options().addExtensions(__filename).toJSON();
      assertThat(wire.extensions.length, equals(1));
      assertThat(wire.extensions[0], equals(expected));
    });
  });

  describe('toCapabilities', function() {
    it('returns a new capabilities object if one is not provided', function() {
      var options = new chrome.Options();
      var caps = options.toCapabilities();
      assertThat(caps.get('browserName'), equals('chrome'));
      assertThat(caps.get('chromeOptions'), equals(options));
    });

    it('adds to input capabilities object', function() {
      var caps = webdriver.Capabilities.firefox();
      var options = new chrome.Options();
      assertThat(options.toCapabilities(caps), equals(caps));
      assertThat(caps.get('browserName'), equals('firefox'));
      assertThat(caps.get('chromeOptions'), equals(options));
    });

    it('sets generic driver capabilities', function() {
      var proxyPrefs = {};
      var loggingPrefs = {};
      var options = new chrome.Options().
          setLoggingPreferences(loggingPrefs).
          setProxy(proxyPrefs);

      var caps = options.toCapabilities();
      assertThat(caps.get('proxy'), equals(proxyPrefs));
      assertThat(caps.get('loggingPrefs'), equals(loggingPrefs));
    });
  });
});

test.suite(function(env) {
  env.autoCreateDriver = false;

  describe('options', function() {
    test.it('can start Chrome with custom args', function() {
      var options = new chrome.Options().
          addArguments('user-agent=foo;bar');

      var driver = env.builder().
          setChromeOptions(options).
          build();

      driver.get(test.Pages.ajaxyPage);

      var userAgent = driver.executeScript(
          'return window.navigator.userAgent');
      assertThat(userAgent, equals('foo;bar'));
    });
  });
}, {browsers: ['chrome']});