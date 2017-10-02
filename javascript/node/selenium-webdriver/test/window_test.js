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

var Browser = require('..').Browser,
    By = require('..').By,
    assert = require('../testing/assert'),
    test = require('../lib/test');


test.suite(function(env) {
  var driver;

  before(async function() { driver = await env.builder().build(); });
  after(function() { return driver.quit(); });

  beforeEach(function() {
    return driver.switchTo().defaultContent();
  });

  it('can set size of the current window', async function() {
    await driver.get(test.Pages.echoPage);
    await changeSizeBy(-20, -20);
  });

  it('can set size of the current window from frame', async function() {
    await driver.get(test.Pages.framesetPage);

    var frame = await driver.findElement({css: 'frame[name="fourth"]'});
    await driver.switchTo().frame(frame);
    await changeSizeBy(-20, -20);
  });

  it('can set size of the current window from iframe', async function() {
    await driver.get(test.Pages.iframePage);

    var frame = await driver.findElement({css: 'iframe[name="iframe1-name"]'});
    await driver.switchTo().frame(frame);
    await changeSizeBy(-20, -20);
  });

  it('can switch to a new window', async function() {
    await driver.get(test.Pages.xhtmlTestPage);

    let handle = await driver.getWindowHandle();
    let originalHandles = await driver.getAllWindowHandles();

    await driver.findElement(By.linkText("Open new window")).click();
    await driver.wait(forNewWindowToBeOpened(originalHandles), 2000);
    await assert(driver.getTitle()).equalTo("XHTML Test Page");

    let newHandle = await getNewWindowHandle(originalHandles);

    await driver.switchTo().window(newHandle);
    await assert(driver.getTitle()).equalTo("We Arrive Here");
  });

  it('can set the window position of the current window', async function() {
    let position = await driver.manage().window().getPosition();

    await driver.manage().window().setSize(640, 480);
    await driver.manage().window().setPosition(position.x + 10, position.y + 10);

    // For phantomjs, setPosition is a no-op and the "window" stays at (0, 0)
    if (env.currentBrowser() === Browser.PHANTOM_JS) {
      position = await driver.manage().window().getPosition();
      assert(position.x).equalTo(0);
      assert(position.y).equalTo(0);
    } else {
      var dx = position.x + 10;
      var dy = position.y + 10;
      return driver.wait(forPositionToBe(dx, dy), 1000);
    }
  });

  it('can set the window position from a frame', async function() {
    await driver.get(test.Pages.iframePage);

    let frame = await driver.findElement(By.name('iframe1-name'));
    await driver.switchTo().frame(frame);

    let position = await driver.manage().window().getPosition();
    await driver.manage().window().setSize(640, 480);
    await driver.manage().window().setPosition(position.x + 10, position.y + 10);

    // For phantomjs, setPosition is a no-op and the "window" stays at (0, 0)
    if (env.currentBrowser() === Browser.PHANTOM_JS) {
      return driver.manage().window().getPosition().then(function(position) {
        assert(position.x).equalTo(0);
        assert(position.y).equalTo(0);
      });
    } else {
      var dx = position.x + 10;
      var dy = position.y + 10;
      return driver.wait(forPositionToBe(dx, dy), 1000);
    }
  });

  function changeSizeBy(dx, dy) {
    return driver.manage().window().getSize().then(function(size) {
      return driver.manage().window()
          .setSize(size.width + dx, size.height + dy)
          .then(_ => {
            return driver.wait(
                forSizeToBe(size.width + dx, size.height + dy), 1000);
          });
    });
  }

  function forSizeToBe(w, h) {
    return function() {
      return driver.manage().window().getSize().then(function(size) {
        return size.width === w && size.height === h;
      });
    };
  }

  function forPositionToBe(x, y) {
    return function() {
      return driver.manage().window().getPosition().then(function(position) {
        return position.x === x &&
            // On OSX, the window height may be bumped down 22px for the top
            // status bar.
            // On Linux, Opera's window position will be off by 28px.
           (position.y >= y && position.y <= (y + 28));
      });
    };
  }

  function forNewWindowToBeOpened(originalHandles) {
    return function() {
      return driver.getAllWindowHandles().then(function(currentHandles) {
        return currentHandles.length > originalHandles.length;
      });
    };
  }

  function getNewWindowHandle(originalHandles) {
    // Note: this assumes there's just one new window.
    return driver.getAllWindowHandles().then(function(currentHandles) {
      return currentHandles.filter(function(i) {
        return originalHandles.indexOf(i) < 0;
      })[0];
    });
  }
});
