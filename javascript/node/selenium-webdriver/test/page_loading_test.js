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

const error = require('../lib/error');
const test = require('../lib/test');
const {Browser, By, until} = require('..');

const Pages = test.Pages;


test.suite(function(env) {
  var browsers = (...args) => env.browsers(...args);

  var driver;
  before(async function() {
    driver = await env.builder().build();
  });

  beforeEach(async function() {
    if (!driver) {
      driver = await env.builder().build();
    }
  });

  after(function() {
    if (driver) {
      return driver.quit();
    }
  });

  it('should wait for document to be loaded', async function() {
    await driver.get(Pages.simpleTestPage);
    assert.equal(await driver.getTitle(), 'Hello WebDriver');
  });

  it('should follow redirects sent in the http response headers',
      async function() {
    await driver.get(Pages.redirectPage);
    assert.equal(await driver.getTitle(), 'We Arrive Here');
  });

  it('should be able to get a fragment on the current page', async function() {
    await driver.get(Pages.xhtmlTestPage);
    await driver.get(Pages.xhtmlTestPage + '#text');
    await driver.findElement(By.id('id1'));
  });

  it('should wait for all frames to load in a frameset', async function() {
    await driver.get(Pages.framesetPage);
    await driver.switchTo().frame(0);

    let txt = await driver.findElement(By.css('span#pageNumber')).getText();
    assert.equal(txt.trim(), '1');

    await driver.switchTo().defaultContent();
    await driver.switchTo().frame(1);
    txt = await driver.findElement(By.css('span#pageNumber')).getText();

    assert.equal(txt.trim(), '2');

    // For safari, need to make sure browser is focused on the main frame or
    // subsequent tests will fail.
    if (env.browser.name === Browser.SAFARI) {
      await driver.switchTo().defaultContent();
    }
  });

  it('should be able to navigate back in browser history', async function() {
    await driver.get(Pages.formPage);

    await driver.findElement(By.id('imageButton')).click();
    await driver.wait(until.titleIs('We Arrive Here'), 2500);

    await driver.navigate().back();
    await driver.wait(until.titleIs('We Leave From Here'), 2500);
  });

  it('should be able to navigate back in presence of iframes', async function() {
    await driver.get(Pages.xhtmlTestPage);

    await driver.findElement(By.name('sameWindow')).click();
    await driver.wait(until.titleIs('This page has iframes'), 2500);

    await driver.navigate().back();
    await driver.wait(until.titleIs('XHTML Test Page'), 2500);
  });

  it('should be able to navigate forwards in browser history', async function() {
    await driver.get(Pages.formPage);

    await driver.findElement(By.id('imageButton')).click();
    await driver.wait(until.titleIs('We Arrive Here'), 5000);

    await driver.navigate().back();
    await driver.wait(until.titleIs('We Leave From Here'), 5000);

    await driver.navigate().forward();
    await driver.wait(until.titleIs('We Arrive Here'), 5000);
  });

  it('should be able to refresh a page', async function() {
    await driver.get(Pages.xhtmlTestPage);

    await driver.navigate().refresh();

    assert.equal(await driver.getTitle(), 'XHTML Test Page');
  });

  it('should return title of page if set', async function() {
    await driver.get(Pages.xhtmlTestPage);
    assert.equal(await driver.getTitle(), 'XHTML Test Page');

    await driver.get(Pages.simpleTestPage);
    assert.equal(await driver.getTitle(), 'Hello WebDriver');
  });

  describe('timeouts', function() {
    afterEach(function() {
      let nullDriver = () => driver = null;
      if (driver) {
        return driver.quit().then(nullDriver, nullDriver);
      }
    });

    it('should timeout if page load timeout is set', async function() {
      await driver.manage().setTimeouts({pageLoad: 1});
      return driver.get(Pages.sleepingPage + '?time=3')
          .then(function() {
            throw Error('Should have timed out on page load');
          }, function(e) {
            if (!(e instanceof error.ScriptTimeoutError)
                && !(e instanceof error.TimeoutError)) {
              throw Error('Unexpected error response: ' + e);
            }
          });
    });
  });
});
