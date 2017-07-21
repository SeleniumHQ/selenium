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
const opera = require('../opera');
const phantomjs = require('../phantomjs');
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
    [Browser.OPERA, opera.Driver],
    [Browser.PHANTOM_JS, phantomjs.Driver],
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

  describe('session management', function() {
    var driver;
    test.before(function*() {
      driver = yield env.builder().build();
    });

    test.after(function() {
      return driver.quit();
    });

    test.it('can connect to an existing session', function*() {
      yield driver.get(Pages.simpleTestPage);
      yield assert(driver.getTitle()).equalTo('Hello WebDriver');

      return driver.getSession().then(session1 => {
        let driver2 = WebDriver.attachToSession(
            driver.getExecutor(),
            session1.getId());

        return assert(driver2.getTitle()).equalTo('Hello WebDriver')
            .then(_ => {
              let session2Id = driver2.getSession().then(s => s.getId());
              return assert(session2Id).equalTo(session1.getId());
            });
      });
    });
  });
});
