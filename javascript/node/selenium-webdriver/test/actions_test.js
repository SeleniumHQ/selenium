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

const {Browser, By, until} = require('..');
const test = require('../lib/test');
const fileServer = require('../lib/test/fileserver');


test.suite(function(env) {
  test.ignore(env.browsers(Browser.CHROME, Browser.SAFARI)).
  describe('WebDriver.actions()', function() {
    let driver;

    before(async function() { driver = await env.builder().build(); });
    afterEach(function() { return driver.actions().clear(); });
    after(function() { return driver.quit(); });

    it('can move to and click element in an iframe', async function() {
      await driver.get(fileServer.whereIs('click_tests/click_in_iframe.html'));

      await driver.wait(until.elementLocated(By.id('ifr')), 5000)
          .then(frame => driver.switchTo().frame(frame));

      let link = await driver.findElement(By.id('link'));

      let actions = driver.actions();
      actions.mouse().click(link);
      await actions.perform();

      return driver.wait(until.titleIs('Submitted Successfully!'), 5000);
    });

    it('can interact with simple form elements', async function() {
      await driver.get(test.Pages.formPage);

      let el = await driver.findElement(By.id('email'));
      assert.equal(await el.getAttribute('value'), '');

      let actions = driver.actions();
      actions.mouse().click(el);
      actions.synchronize();
      actions.keyboard().sendKeys('foobar');
      await actions.perform();

      assert.equal(await el.getAttribute('value'), 'foobar');
    });
  });
});
