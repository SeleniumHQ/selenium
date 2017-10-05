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

const assert = require('../testing/assert');
const chrome = require('../chrome');
const edge = require('../edge');
const firefox = require('../firefox');
const ie = require('../ie');
const safari = require('../safari');
const test = require('../lib/test');
const {Browser} = require('../lib/capabilities');
const {Pages} = require('../lib/test');
const {WebDriver} = require('..');


test.suite(function(env) {
  var browsers = env.browsers;

  const BROWSER_MAP = new Map([
    [Browser.CHROME, chrome.Driver],
    [Browser.EDGE, edge.Driver],
    [Browser.FIREFOX, firefox.Driver],
    [Browser.INTERNET_EXPLORER, ie.Driver],
    [Browser.SAFARI, safari.Driver],
  ]);

  if (BROWSER_MAP.has(env.currentBrowser())) {
    describe('builder creates thenable driver instances', function() {
      let driver;

      after(() => driver && driver.quit());

      it(env.currentBrowser(), function() {
        driver = env.builder().build();

        const want = BROWSER_MAP.get(env.currentBrowser());
        assert(driver).instanceOf(want,
            `want ${want.name}, but got ${driver.name}`);
        assert(typeof driver.then).equalTo('function');

        return driver
            .then(
                d => assert(d)
                    .instanceOf(want, `want ${want.name}, but got ${d.name}`))
            // Load something so the safari driver doesn't crash from starting and
            // stopping in short time.
            .then(() => driver.get(Pages.echoPage));
      });
    });
  }
});
