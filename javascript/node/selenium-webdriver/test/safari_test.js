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

const webdriver = require('..'),
  proxy = require('../proxy'),
  safari = require('../safari'),
  assert = require('../testing/assert'),
  test = require('../lib/test');


describe('safari.Options', function() {
  describe('fromCapabilities', function() {
    it('returns a new Options instance  if none were defined', function() {
      let options = safari.Options.fromCapabilities(
        new webdriver.Capabilities());
      assert(options).instanceOf(safari.Options);
    });

    it('returns the options instance if present', function() {
      let options = new safari.Options().setCleanSession(true),
        caps = options.toCapabilities();
      assert(safari.Options.fromCapabilities(caps)).equalTo(options);
    });

    it('extracts supported WebDriver capabilities', function() {
      let proxyPrefs = proxy.direct(),
        logPrefs = {},
        caps = webdriver.Capabilities.chrome()
          .set(webdriver.Capability.PROXY, proxyPrefs)
          .set(webdriver.Capability.LOGGING_PREFS, logPrefs)
          .set('legacyDriver', true);

      let options = safari.Options.fromCapabilities(caps);
      assert(options.proxy_).equalTo(proxyPrefs);
      assert(options.logPrefs_).equalTo(logPrefs);
      assert(options.legacyDriver_).equalTo(true);
    });
  });

  describe('toCapabilities', function() {
    let options;

    before(function() {
      options = new safari.Options()
        .setCleanSession(true);
    });

    it('returns a new capabilities object if one is not provided', function() {
      let caps = options.toCapabilities();
      assert(caps).instanceOf(webdriver.Capabilities);
      assert(caps.get('browserName')).equalTo('safari');
      assert(caps.get('safari.options')).equalTo(options);
    });

    it('adds to input capabilities object', function() {
      let caps = webdriver.Capabilities.safari();
      assert(options.toCapabilities(caps)).equalTo(caps);
      assert(caps.get('safari.options')).equalTo(options);
    });

    it('sets generic driver capabilities', function() {
      let proxyPrefs = proxy.direct(),
        loggingPrefs = {};

      options
        .setLoggingPrefs(loggingPrefs)
        .setProxy(proxyPrefs)
        .useLegacyDriver(true);

      let caps = options.toCapabilities();
      assert(caps.get('proxy')).equalTo(proxyPrefs);
      assert(caps.get('loggingPrefs')).equalTo(loggingPrefs);
      assert(caps.get('legacyDriver')).equalTo(true);
    });
  });
});

test.suite(function(env) {
  describe('safaridriver', function() {
    let service;

    test.afterEach(function() {
      if (service) {
        return service.kill();
      }
    });

    test.it('can start safaridriver', function() {
      service = new safari.ServiceBuilder().build();

      return service.start().then(function(url) {
        assert(url).matches(/127\.0\.0\.1/);
      });
    });
  });
}, {browsers: ['safari']});
