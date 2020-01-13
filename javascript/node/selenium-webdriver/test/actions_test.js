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

const chrome = require('../chrome');
const error = require('../lib/error');
const fileServer = require('../lib/test/fileserver');
const firefox = require('../firefox');
const test = require('../lib/test');
const {Key, Origin} = require('../lib/input');
const {Browser, By, until} = require('..');

test.suite(function(env) {
  describe('WebDriver.actions()', function() {
    let driver;

    before(async function() {
      driver = await env.builder().build();
    });

    afterEach(async function() {
      try {
        await driver.actions().clear();
      } catch (e) {
        if (e instanceof error.UnsupportedOperationError
            || e instanceof error.UnknownCommandError) {
          return;
        }
        throw e;
      }
    });

    after(function() {
      return driver.quit();
    });

    it('click(element)', async function() {
      await driver.get(fileServer.whereIs('/data/actions/click.html'));

      let box = await driver.findElement(By.id('box'));
      assert.equal(await box.getAttribute('class'), '');

      await driver.actions().click(box).perform();
      assert.equal(await box.getAttribute('class'), 'green');
    });

    it('click(element) clicks in center of element', async function() {
      await driver.get(fileServer.whereIs('/data/actions/record_click.html'));

      const div = await driver.findElement(By.css('div'));
      const rect = await div.getRect();
      assert.deepEqual(rect, {width: 500, height: 500, x: 0, y: 0});

      await driver.actions().click(div).perform();

      const clicks = await driver.executeScript('return clicks');
      assert.deepEqual(clicks, [[250, 250]]);
    });

    it('can move relative to element center', async function() {
      await driver.get(fileServer.whereIs('/data/actions/record_click.html'));

      const div = await driver.findElement(By.css('div'));
      const rect = await div.getRect();
      assert.deepEqual(rect, {width: 500, height: 500, x: 0, y: 0});

      await driver.actions()
          .move({x: 10, y: 10, origin: div})
          .click()
          .perform();

      const clicks = await driver.executeScript('return clicks');
      assert.deepEqual(clicks, [[260, 260]]);
    });

    test.ignore(env.browsers(Browser.SAFARI)).
    it('doubleClick(element)', async function() {
      await driver.get(fileServer.whereIs('/data/actions/click.html'));

      let box = await driver.findElement(By.id('box'));
      assert.equal(await box.getAttribute('class'), '');

      await driver.actions().doubleClick(box).perform();
      assert.equal(await box.getAttribute('class'), 'blue');
    });

    // For some reason for Chrome 75 we need to wrap this test in an extra
    // describe for the afterEach hook above to properly clear action sequences.
    // This appears to be a quirk of the timing around mocha tests and not
    // necessarily a bug in the chromedriver.
    // TODO(jleyba): dig into this more so we can remove this hack.
    describe('dragAndDrop()', function() {
      it('', async function() {
        await driver.get(fileServer.whereIs('/data/actions/drag.html'));

        let slide = await driver.findElement(By.id('slide'));
        assert.equal(await slide.getCssValue('left'), '0px');
        assert.equal(await slide.getCssValue('top'), '0px');

        let br = await driver.findElement(By.id('BR'));
        await driver.actions().dragAndDrop(slide, br).perform();
        assert.equal(await slide.getCssValue('left'), '206px');
        assert.equal(await slide.getCssValue('top'), '206px');

        let tr = await driver.findElement(By.id('TR'));
        await driver.actions().dragAndDrop(slide, tr).perform();
        assert.equal(await slide.getCssValue('left'), '206px');
        assert.equal(await slide.getCssValue('top'), '1px');
      });
    });

    it('move()', async function() {
      await driver.get(fileServer.whereIs('/data/actions/drag.html'));

      let slide = await driver.findElement(By.id('slide'));
      assert.equal(await slide.getCssValue('left'), '0px');
      assert.equal(await slide.getCssValue('top'), '0px');

      await driver.actions()
          .move({origin: slide})
          .press()
          .move({x: 100, y: 100, origin: Origin.POINTER})
          .release()
          .perform();
      assert.equal(await slide.getCssValue('left'), '101px');
      assert.equal(await slide.getCssValue('top'), '101px');
    });

    it('can move to and click element in an iframe', async function() {
      await driver.get(fileServer.whereIs('click_tests/click_in_iframe.html'));

      await driver.wait(until.elementLocated(By.id('ifr')), 5000)
          .then(frame => driver.switchTo().frame(frame));

      let link = await driver.findElement(By.id('link'));

      await driver.actions().click(link).perform();
      await driver.switchTo().defaultContent();
      return driver.wait(until.titleIs('Submitted Successfully!'), 5000);
    });

    it('can send keys to focused element', async function() {
      await driver.get(test.Pages.formPage);

      let el = await driver.findElement(By.id('email'));
      assert.equal(await el.getAttribute('value'), '');

      await driver.executeScript('arguments[0].focus()', el);

      await driver.actions().sendKeys('foobar').perform();

      assert.equal(await el.getAttribute('value'), 'foobar');
    });

    it('can get the property of element', async function() {
      await driver.get(test.Pages.formPage);

      let el = await driver.findElement(By.id('email'));
      assert.equal(await el.getProperty('value'), '');

      await driver.executeScript('arguments[0].focus()', el);

      await driver.actions().sendKeys('foobar').perform();

      assert.equal(await el.getProperty('value'), 'foobar');
    });

    it('can send keys to focused element (with modifiers)', async function() {
      await driver.get(test.Pages.formPage);

      let el = await driver.findElement(By.id('email'));
      assert.equal(await el.getAttribute('value'), '');

      await driver.executeScript('arguments[0].focus()', el);

      await driver.actions()
          .sendKeys('fo')
          .keyDown(Key.SHIFT)
          .sendKeys('OB')
          .keyUp(Key.SHIFT)
          .sendKeys('ar')
          .perform();

      assert.equal(await el.getAttribute('value'), 'foOBar');
    });

    it('can interact with simple form elements', async function() {
      await driver.get(test.Pages.formPage);

      let el = await driver.findElement(By.id('email'));
      assert.equal(await el.getAttribute('value'), '');

      await driver.actions()
          .click(el)
          .sendKeys('foobar')
          .perform();

      assert.equal(await el.getAttribute('value'), 'foobar');
    });
  });
});

