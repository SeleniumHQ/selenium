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

const assert = require('assert');
const fs = require('fs');

const chrome = require('../../chrome');
const proxy = require('../../proxy');
const symbols = require('../../lib/symbols');
const test = require('../../lib/test');
const webdriver = require('../..');


describe('chrome.Options', function() {
  describe('fromCapabilities', function() {

    it('should return a new Options instance if none were defined',
       function() {
         var options = chrome.Options.fromCapabilities(
             new webdriver.Capabilities());
         assert.ok(options instanceof chrome.Options);
       });

    it('should return options instance if present', function() {
      var options = new chrome.Options();
      var caps = options.toCapabilities();
      assert.ok(caps instanceof webdriver.Capabilities);
      assert.deepEqual(chrome.Options.fromCapabilities(caps), options);
    });

    it('should rebuild options from wire representation', async function() {
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

      assert.equal(json.args.length, 2);
      assert.equal(json.args[0], 'a');
      assert.equal(json.args[1], 'b');
      assert.equal(json.extensions.length, 1);
      assert.equal(await json.extensions[0], expectedExtension);
      assert.equal(json.binary, 'binaryPath');
      assert.equal(json.logPath, 'logFilePath');
      assert.equal(json.detach, true);
      assert.equal(json.localState, 'localStateValue');
      assert.equal(json.prefs, 'prefsValue');
    });

    it('should rebuild options from incomplete wire representation',
        function() {
          var caps = webdriver.Capabilities.chrome().set('chromeOptions', {
            logPath: 'logFilePath'
          });

          var options = chrome.Options.fromCapabilities(caps);
          var json = options[symbols.serialize]();
          assert.strictEqual(json.args, undefined);
          assert.strictEqual(json.binary, undefined);
          assert.strictEqual(json.detach, undefined);
          assert.strictEqual(json.excludeSwitches, undefined);
          assert.strictEqual(json.extensions, undefined);
          assert.strictEqual(json.localState, undefined);
          assert.equal(json.logPath, 'logFilePath');
          assert.strictEqual(json.prefs, undefined);
          assert.strictEqual(json.minidumpPath, undefined);
          assert.strictEqual(json.mobileEmulation, undefined);
          assert.strictEqual(json.perfLoggingPrefs, undefined);
        });

    it('should extract supported WebDriver capabilities', function() {
      var proxyPrefs = proxy.direct();
      var logPrefs = {};
      var caps = webdriver.Capabilities.chrome().
          set(webdriver.Capability.PROXY, proxyPrefs).
          set(webdriver.Capability.LOGGING_PREFS, logPrefs);

      var options = chrome.Options.fromCapabilities(caps);
      assert.equal(options.proxy_, proxyPrefs);
      assert.equal(options.logPrefs_, logPrefs);
    });
  });

  describe('addArguments', function() {
    it('takes var_args', function() {
      var options = new chrome.Options();
      assert.strictEqual(options[symbols.serialize]().args, undefined);

      options.addArguments('a', 'b');
      var json = options[symbols.serialize]();
      assert.equal(json.args.length, 2);
      assert.equal(json.args[0], 'a');
      assert.equal(json.args[1], 'b');
    });

    it('flattens input arrays', function() {
      var options = new chrome.Options();
      assert.strictEqual(options[symbols.serialize]().args, undefined);

      options.addArguments(['a', 'b'], 'c', [1, 2], 3);
      var json = options[symbols.serialize]();
      assert.equal(json.args.length, 6);
      assert.equal(json.args[0], 'a');
      assert.equal(json.args[1], 'b');
      assert.equal(json.args[2], 'c');
      assert.equal(json.args[3], 1);
      assert.equal(json.args[4], 2);
      assert.equal(json.args[5], 3);
    });
  });

  describe('addExtensions', function() {
    it('takes var_args', function() {
      var options = new chrome.Options();
      assert.equal(options.extensions_.length, 0);

      options.addExtensions('a', 'b');
      assert.equal(options.extensions_.length, 2);
      assert.equal(options.extensions_[0], 'a');
      assert.equal(options.extensions_[1], 'b');
    });

    it('flattens input arrays', function() {
      var options = new chrome.Options();
      assert.equal(options.extensions_.length, 0);

      options.addExtensions(['a', 'b'], 'c', [1, 2], 3);
      assert.equal(options.extensions_.length, 6);
      assert.equal(options.extensions_[0], 'a');
      assert.equal(options.extensions_[1], 'b');
      assert.equal(options.extensions_[2], 'c');
      assert.equal(options.extensions_[3], 1);
      assert.equal(options.extensions_[4], 2);
      assert.equal(options.extensions_[5], 3);
    });
  });

  describe('serialize', function() {
    it('base64 encodes extensions', async function() {
      var expected = fs.readFileSync(__filename, 'base64');
      var wire = new chrome.Options()
          .addExtensions(__filename)
          [symbols.serialize]();
      assert.equal(wire.extensions.length, 1);
      assert.equal(await wire.extensions[0], expected);
    });
  });

  describe('toCapabilities', function() {
    it('returns a new capabilities object if one is not provided', function() {
      var options = new chrome.Options();
      var caps = options.toCapabilities();
      assert.equal(caps.get('browserName'), 'chrome');
      assert.strictEqual(caps.get('chromeOptions'), options);
    });

    it('adds to input capabilities object', function() {
      var caps = webdriver.Capabilities.firefox();
      var options = new chrome.Options();
      assert.strictEqual(options.toCapabilities(caps), caps);
      assert.equal(caps.get('browserName'), 'firefox');
      assert.strictEqual(caps.get('chromeOptions'), options);
    });

    it('sets generic driver capabilities', function() {
      var proxyPrefs = {};
      var loggingPrefs = {};
      var options = new chrome.Options().
          setLoggingPrefs(loggingPrefs).
          setProxy(proxyPrefs);

      var caps = options.toCapabilities();
      assert.strictEqual(caps.get('proxy'), proxyPrefs);
      assert.strictEqual(caps.get('loggingPrefs'), loggingPrefs);
    });
  });
});

test.suite(function(env) {
  var driver;

  afterEach(function() {
    return driver.quit();
  });

  describe('Chrome options', function() {
    it('can start Chrome with custom args', async function() {
      var options = new chrome.Options().
          addArguments('user-agent=foo;bar');

      driver = await env.builder()
          .setChromeOptions(options)
          .build();

      await driver.get(test.Pages.ajaxyPage);

      var userAgent =
          await driver.executeScript('return window.navigator.userAgent');
      assert.equal(userAgent, 'foo;bar');
    });
  });
}, {browsers: ['chrome']});
