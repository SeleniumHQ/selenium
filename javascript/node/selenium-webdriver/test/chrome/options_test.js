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

var fs = require('fs');

var webdriver = require('../..'),
    chrome = require('../../chrome'),
    symbols = require('../../lib/symbols'),
    proxy = require('../../proxy'),
    assert = require('../../testing/assert');

var test = require('../../lib/test');


describe('chrome.Options', function() {
  describe('fromCapabilities', function() {

    it('should return a new Options instance if none were defined',
       function() {
         var options = chrome.Options.fromCapabilities(
             new webdriver.Capabilities());
         assert(options).instanceOf(chrome.Options);
       });

    it('should return options instance if present', function() {
      var options = new chrome.Options();
      var caps = options.toCapabilities();
      assert(caps).instanceOf(webdriver.Capabilities);
      assert(chrome.Options.fromCapabilities(caps)).equalTo(options);
    });

    it('should rebuild options from wire representation', function() {
      var expectedExtension = fs.readFileSync(__filename, 'base64');
      var caps = webdriver.Capabilities.chrome().set('chromeOptions', {
        args: ['a', 'b'],
        extensions: [__filename],
        binary: 'binaryPath',
        logPath: 'logFilePath',
        detach: true,
        localState: 'localStateValue',
        prefs: 'prefsValue'
      });

      var options = chrome.Options.fromCapabilities(caps);
      var json = options[symbols.serialize]();

      assert(json.args.length).equalTo(2);
      assert(json.args[0]).equalTo('a');
      assert(json.args[1]).equalTo('b');
      assert(json.extensions.length).equalTo(1);
      assert(json.extensions[0]).equalTo(expectedExtension);
      assert(json.binary).equalTo('binaryPath');
      assert(json.logPath).equalTo('logFilePath');
      assert(json.detach).equalTo(true);
      assert(json.localState).equalTo('localStateValue');
      assert(json.prefs).equalTo('prefsValue');
    });

    it('should rebuild options from incomplete wire representation',
        function() {
          var caps = webdriver.Capabilities.chrome().set('chromeOptions', {
            logPath: 'logFilePath'
          });

          var options = chrome.Options.fromCapabilities(caps);
          var json = options[symbols.serialize]();
          assert(json.args).isUndefined();
          assert(json.binary).isUndefined();
          assert(json.detach).isUndefined();
          assert(json.excludeSwitches).isUndefined();
          assert(json.extensions).isUndefined();
          assert(json.localState).isUndefined();
          assert(json.logPath).equalTo('logFilePath');
          assert(json.prefs).isUndefined();
          assert(json.minidumpPath).isUndefined();
          assert(json.mobileEmulation).isUndefined();
          assert(json.perfLoggingPrefs).isUndefined();
        });

    it('should extract supported WebDriver capabilities', function() {
      var proxyPrefs = proxy.direct();
      var logPrefs = {};
      var caps = webdriver.Capabilities.chrome().
          set(webdriver.Capability.PROXY, proxyPrefs).
          set(webdriver.Capability.LOGGING_PREFS, logPrefs);

      var options = chrome.Options.fromCapabilities(caps);
      assert(options.proxy_).equalTo(proxyPrefs);
      assert(options.logPrefs_).equalTo(logPrefs);
    });
  });

  describe('addArguments', function() {
    it('takes var_args', function() {
      var options = new chrome.Options();
      assert(options[symbols.serialize]().args).isUndefined();

      options.addArguments('a', 'b');
      var json = options[symbols.serialize]();
      assert(json.args.length).equalTo(2);
      assert(json.args[0]).equalTo('a');
      assert(json.args[1]).equalTo('b');
    });

    it('flattens input arrays', function() {
      var options = new chrome.Options();
      assert(options[symbols.serialize]().args).isUndefined();

      options.addArguments(['a', 'b'], 'c', [1, 2], 3);
      var json = options[symbols.serialize]();
      assert(json.args.length).equalTo(6);
      assert(json.args[0]).equalTo('a');
      assert(json.args[1]).equalTo('b');
      assert(json.args[2]).equalTo('c');
      assert(json.args[3]).equalTo(1);
      assert(json.args[4]).equalTo(2);
      assert(json.args[5]).equalTo(3);
    });
  });

  describe('addExtensions', function() {
    it('takes var_args', function() {
      var options = new chrome.Options();
      assert(options.extensions_.length).equalTo(0);

      options.addExtensions('a', 'b');
      assert(options.extensions_.length).equalTo(2);
      assert(options.extensions_[0]).equalTo('a');
      assert(options.extensions_[1]).equalTo('b');
    });

    it('flattens input arrays', function() {
      var options = new chrome.Options();
      assert(options.extensions_.length).equalTo(0);

      options.addExtensions(['a', 'b'], 'c', [1, 2], 3);
      assert(options.extensions_.length).equalTo(6);
      assert(options.extensions_[0]).equalTo('a');
      assert(options.extensions_[1]).equalTo('b');
      assert(options.extensions_[2]).equalTo('c');
      assert(options.extensions_[3]).equalTo(1);
      assert(options.extensions_[4]).equalTo(2);
      assert(options.extensions_[5]).equalTo(3);
    });
  });

  describe('serialize', function() {
    it('base64 encodes extensions', function() {
      var expected = fs.readFileSync(__filename, 'base64');
      var wire = new chrome.Options()
          .addExtensions(__filename)
          [symbols.serialize]();
      assert(wire.extensions.length).equalTo(1);
      assert(wire.extensions[0]).equalTo(expected);
    });
  });

  describe('toCapabilities', function() {
    it('returns a new capabilities object if one is not provided', function() {
      var options = new chrome.Options();
      var caps = options.toCapabilities();
      assert(caps.get('browserName')).equalTo('chrome');
      assert(caps.get('chromeOptions')).equalTo(options);
    });

    it('adds to input capabilities object', function() {
      var caps = webdriver.Capabilities.firefox();
      var options = new chrome.Options();
      assert(options.toCapabilities(caps)).equalTo(caps);
      assert(caps.get('browserName')).equalTo('firefox');
      assert(caps.get('chromeOptions')).equalTo(options);
    });

    it('sets generic driver capabilities', function() {
      var proxyPrefs = {};
      var loggingPrefs = {};
      var options = new chrome.Options().
          setLoggingPrefs(loggingPrefs).
          setProxy(proxyPrefs);

      var caps = options.toCapabilities();
      assert(caps.get('proxy')).equalTo(proxyPrefs);
      assert(caps.get('loggingPrefs')).equalTo(loggingPrefs);
    });
  });
});

test.suite(function(env) {
  var driver;

  test.afterEach(function() {
    driver.quit();
  });

  describe('Chrome options', function() {
    test.it('can start Chrome with custom args', function() {
      var options = new chrome.Options().
          addArguments('user-agent=foo;bar');

      driver = env.builder().
          setChromeOptions(options).
          build();

      driver.get(test.Pages.ajaxyPage);

      var userAgent = driver.executeScript(
          'return window.navigator.userAgent');
      assert(userAgent).equalTo('foo;bar');
    });
  });
}, {browsers: ['chrome']});
