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

const proxy = require('../proxy');
const safari = require('../safari');
const test = require('../lib/test');
const webdriver = require('..');


describe('safari.Options', function() {
  describe('fromCapabilities', function() {
    it('returns a new Options instance  if none were defined', function() {
      let options = safari.Options.fromCapabilities(
        new webdriver.Capabilities());
      assert(options instanceof safari.Options);
    });

    it('returns the options instance if present', function() {
      let options = new safari.Options().setCleanSession(true),
        caps = options.toCapabilities();
      assert.equal(safari.Options.fromCapabilities(caps), options);
    });

    it('extracts supported WebDriver capabilities', function() {
      let proxyPrefs = proxy.direct(),
        caps = webdriver.Capabilities.chrome()
          .set(webdriver.Capability.PROXY, proxyPrefs);

      let options = safari.Options.fromCapabilities(caps);
      assert.equal(options.proxy_, proxyPrefs);
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
      assert(caps instanceof webdriver.Capabilities);
      assert.equal(caps.get('browserName'), 'safari');
      assert.equal(caps.get('safari.options'), options);
    });

    it('adds to input capabilities object', function() {
      let caps = webdriver.Capabilities.safari();
      assert.equal(options.toCapabilities(caps), caps);
      assert.equal(caps.get('safari.options'), options);
    });

    it('sets generic driver capabilities', function() {
      let proxyPrefs = proxy.direct();

      options.setProxy(proxyPrefs);

      let caps = options.toCapabilities();
      assert.equal(caps.get('proxy'), proxyPrefs);
    });
  });
});

test.suite(function(env) {
  describe('safaridriver', function() {
    let service;

    afterEach(function() {
      if (service) {
        return service.kill();
      }
    });

    it('can start safaridriver', async function() {
      service = new safari.ServiceBuilder().build();

      let url = await service.start();
      assert(/127\.0\.0\.1/.test(url), `unexpected url: ${url}`);
    });
  });
}, {browsers: ['safari']});
