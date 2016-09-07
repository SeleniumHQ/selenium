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

  test.before(function() { driver = env.builder().build(); });
  test.after(function() { driver.quit(); });

  test.beforeEach(function() {
    driver.switchTo().defaultContent();
  });

  test.it('can set size of the current window', function() {
    driver.get(test.Pages.echoPage);
    changeSizeBy(-20, -20);
  });

  test.it('can set size of the current window from frame', function() {
    driver.get(test.Pages.framesetPage);

    var frame = driver.findElement({css: 'frame[name="fourth"]'});
    driver.switchTo().frame(frame);
    changeSizeBy(-20, -20);
  });

  test.it('can set size of the current window from iframe', function() {
    driver.get(test.Pages.iframePage);

    var frame = driver.findElement({css: 'iframe[name="iframe1-name"]'});
    driver.switchTo().frame(frame);
    changeSizeBy(-20, -20);
  });

  test.it('can switch to a new window', function() {
    driver.get(test.Pages.xhtmlTestPage);

    driver.getWindowHandle().then(function(handle) {
      driver.getAllWindowHandles().then(function(originalHandles) {
        driver.findElement(By.linkText("Open new window")).click();

        driver.wait(forNewWindowToBeOpened(originalHandles), 2000);

        assert(driver.getTitle()).equalTo("XHTML Test Page");

        getNewWindowHandle(originalHandles).then(function(newHandle) {
          driver.switchTo().window(newHandle);

          assert(driver.getTitle()).equalTo("We Arrive Here")
        });
      });
    });
  });

  // See https://github.com/mozilla/geckodriver/issues/113
  test.ignore(env.browsers(Browser.FIREFOX)).
  it('can set the window position of the current window', function() {
    driver.manage().window().getPosition().then(function(position) {
      driver.manage().window().setSize(640, 480);
      driver.manage().window().setPosition(position.x + 10, position.y + 10);

      // For phantomjs, setPosition is a no-op and the "window" stays at (0, 0)
      if (env.currentBrowser() === Browser.PHANTOM_JS) {
        driver.manage().window().getPosition().then(function(position) {
          assert(position.x).equalTo(0);
          assert(position.y).equalTo(0);
        });
      } else {
        var dx = position.x + 10;
        var dy = position.y + 10;
        // On OSX, Safari position's the window relative to below the menubar
        // at the top of the screen, which is 23 pixels tall.
        if (env.currentBrowser() === Browser.SAFARI &&
            process.platform === 'darwin') {
          dy += 23;
        }
      }
    });
  });

  // See https://github.com/mozilla/geckodriver/issues/113
  test.ignore(env.browsers(Browser.FIREFOX)).
  it('can set the window position from a frame', function() {
    driver.get(test.Pages.iframePage);
    driver.switchTo().frame('iframe1-name');
    driver.manage().window().getPosition().then(function(position) {
      driver.manage().window().setSize(640, 480);
      driver.manage().window().setPosition(position.x + 10, position.y + 10);

      // For phantomjs, setPosition is a no-op and the "window" stays at (0, 0)
      if (env.currentBrowser() === Browser.PHANTOM_JS) {
        driver.manage().window().getPosition().then(function(position) {
          assert(position.x).equalTo(0);
          assert(position.y).equalTo(0);
        });
      } else {
        var dx = position.x + 10;
        var dy = position.y + 10;
        // On OSX, Safari position's the window relative to below the menubar
        // at the top of the screen, which is 23 pixels tall.
        if (env.currentBrowser() === Browser.SAFARI &&
            process.platform === 'darwin') {
          dy += 23;
        }
        driver.wait(forPositionToBe(dx, dy), 1000);
      }
    });
  });

  function changeSizeBy(dx, dy) {
    driver.manage().window().getSize().then(function(size) {
      driver.manage().window().setSize(size.width + dx, size.height + dy);
      driver.wait(forSizeToBe(size.width + dx, size.height + dy), 1000);
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
