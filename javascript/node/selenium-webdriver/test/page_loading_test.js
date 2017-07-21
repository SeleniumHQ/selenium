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
    until = require('..').until,
    assert = require('../testing/assert'),
    error = require('../lib/error'),
    test = require('../lib/test'),
    Pages = test.Pages;


test.suite(function(env) {
  var browsers = env.browsers;

  var driver;
  test.before(function*() {
    driver = yield env.builder().build();
  });

  test.beforeEach(function*() {
    if (!driver) {
      driver = yield env.builder().build();
    }
  });

  test.after(function() {
    if (driver) {
      return driver.quit();
    }
  });

  test.it('should wait for document to be loaded', function*() {
    yield driver.get(Pages.simpleTestPage);
    return assert(driver.getTitle()).equalTo('Hello WebDriver');
  });

  test.it('should follow redirects sent in the http response headers',
      function*() {
    yield driver.get(Pages.redirectPage);
    return assert(driver.getTitle()).equalTo('We Arrive Here');
  });

  // Skip Firefox; see https://bugzilla.mozilla.org/show_bug.cgi?id=1280300
  test.ignore(browsers(Browser.FIREFOX)).
  it('should be able to get a fragment on the current page', function*() {
    yield driver.get(Pages.xhtmlTestPage);
    yield driver.get(Pages.xhtmlTestPage + '#text');
    yield driver.findElement(By.id('id1'));
  });

  test.ignore(browsers(Browser.IPAD, Browser.IPHONE)).
  it('should wait for all frames to load in a frameset', function*() {
    yield driver.get(Pages.framesetPage);
    yield driver.switchTo().frame(0);

    let txt = yield driver.findElement(By.css('span#pageNumber')).getText();
    assert(txt.trim()).equalTo('1');

    yield driver.switchTo().defaultContent();
    yield driver.switchTo().frame(1);
    txt = yield driver.findElement(By.css('span#pageNumber')).getText();

    assert(txt.trim()).equalTo('2');
  });

  test.ignore(browsers(Browser.SAFARI)).
  it('should be able to navigate back in browser history', function*() {
    yield driver.get(Pages.formPage);

    yield driver.findElement(By.id('imageButton')).click();
    yield driver.wait(until.titleIs('We Arrive Here'), 2500);

    yield driver.navigate().back();
    yield driver.wait(until.titleIs('We Leave From Here'), 2500);
  });

  test.ignore(browsers(Browser.SAFARI)).
  it('should be able to navigate back in presence of iframes', function*() {
    yield driver.get(Pages.xhtmlTestPage);

    yield driver.findElement(By.name('sameWindow')).click();
    yield driver.wait(until.titleIs('This page has iframes'), 2500);

    yield driver.navigate().back();
    yield driver.wait(until.titleIs('XHTML Test Page'), 2500);
  });

  test.ignore(browsers(Browser.SAFARI)).
  it('should be able to navigate forwards in browser history', function*() {
    yield driver.get(Pages.formPage);

    yield driver.findElement(By.id('imageButton')).click();
    yield driver.wait(until.titleIs('We Arrive Here'), 5000);

    yield driver.navigate().back();
    yield driver.wait(until.titleIs('We Leave From Here'), 5000);

    yield driver.navigate().forward();
    yield driver.wait(until.titleIs('We Arrive Here'), 5000);
  });

  // PhantomJS 2.0 does not properly reload pages on refresh.
  test.ignore(browsers(Browser.PHANTOM_JS)).
  it('should be able to refresh a page', function*() {
    yield driver.get(Pages.xhtmlTestPage);

    yield driver.navigate().refresh();

    yield assert(driver.getTitle()).equalTo('XHTML Test Page');
  });

  test.it('should return title of page if set', function*() {
    yield driver.get(Pages.xhtmlTestPage);
    yield assert(driver.getTitle()).equalTo('XHTML Test Page');

    yield driver.get(Pages.simpleTestPage);
    yield assert(driver.getTitle()).equalTo('Hello WebDriver');
  });

  describe('timeouts', function() {
    test.afterEach(function() {
      let nullDriver = () => driver = null;
      if (driver) {
        return driver.quit().then(nullDriver, nullDriver);
      }
    });

    // Only implemented in Firefox.
    test.ignore(browsers(
        Browser.CHROME,
        Browser.IE,
        Browser.IPAD,
        Browser.IPHONE,
        Browser.OPERA,
        Browser.PHANTOM_JS)).
    it('should timeout if page load timeout is set', function*() {
      yield driver.manage().timeouts().pageLoadTimeout(1);
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
