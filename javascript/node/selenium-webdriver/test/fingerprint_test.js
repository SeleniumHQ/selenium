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

var assert = require('../testing/assert'),
    test = require('../lib/test'),
    Pages = test.Pages;


test.suite(function(env) {
  var browsers = env.browsers;

  var driver;
  test.before(function() {
    driver = env.builder().build();
  });

  test.after(function() {
    driver.quit();
  });

  describe('fingerprinting', function() {
    test.it('it should fingerprint the navigator object', function*() {
      yield driver.get(Pages.simpleTestPage);

      let wd = yield driver.executeScript('return navigator.webdriver');
      assert(wd).equalTo(true);
    });

    test.it('fingerprint must not be writable', function*() {
      yield driver.get(Pages.simpleTestPage);

      let wd = yield driver.executeScript(
          'navigator.webdriver = "ohai"; return navigator.webdriver');
      assert(wd).equalTo(true);
    });

    test.it('leaves fingerprint on svg pages', function*() {
      yield driver.get(Pages.svgPage);

      let wd = yield driver.executeScript('return navigator.webdriver');
      assert(wd).equalTo(true);
    });
  });

// Currently only implemented in legacy firefox.
}, {browsers: ['legacy-firefox']});
