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
  test.before(function() {
    driver = env.builder().build();
  });

  test.beforeEach(function() {
    if (!driver) {
      driver = env.builder().build();
    }
  });

  test.after(function() {
    if (driver) {
      driver.quit();
    }
  });

  test.it('should wait for document to be loaded', function() {
    driver.get(Pages.simpleTestPage);
    assert(driver.getTitle()).equalTo('Hello WebDriver');
  });

  test.it('should follow redirects sent in the http response headers',
      function() {
    driver.get(Pages.redirectPage);
    assert(driver.getTitle()).equalTo('We Arrive Here');
  });

  test.ignore(browsers(Browser.SAFARI)).
  it('should follow meta redirects', function() {
    driver.get(Pages.metaRedirectPage);
    assert(driver.getTitle()).equalTo('We Arrive Here');
  });

  // Skip Firefox; see https://bugzilla.mozilla.org/show_bug.cgi?id=1280300
  test.ignore(browsers(Browser.FIREFOX)).
  it('should be able to get a fragment on the current page', function() {
    driver.get(Pages.xhtmlTestPage);
    driver.get(Pages.xhtmlTestPage + '#text');
    driver.findElement(By.id('id1'));
  });

  test.ignore(browsers(Browser.IPAD, Browser.IPHONE)).
  it('should wait for all frames to load in a frameset', function() {
    driver.get(Pages.framesetPage);
    driver.switchTo().frame(0);

    driver.findElement(By.css('span#pageNumber')).getText().then(function(txt) {
      assert(txt.trim()).equalTo('1');
    });

    driver.switchTo().defaultContent();
    driver.switchTo().frame(1);
    driver.findElement(By.css('span#pageNumber')).getText().then(function(txt) {
      assert(txt.trim()).equalTo('2');
    });
  });

  test.ignore(browsers(Browser.SAFARI)).
  it('should be able to navigate back in browser history', function() {
    driver.get(Pages.formPage);

    driver.findElement(By.id('imageButton')).click();
    driver.wait(until.titleIs('We Arrive Here'), 2500);

    driver.navigate().back();
    driver.wait(until.titleIs('We Leave From Here'), 2500);
  });

  test.ignore(browsers(Browser.SAFARI)).
  it('should be able to navigate back in presence of iframes', function() {
    driver.get(Pages.xhtmlTestPage);

    driver.findElement(By.name('sameWindow')).click();
    driver.wait(until.titleIs('This page has iframes'), 2500);

    driver.navigate().back();
    driver.wait(until.titleIs('XHTML Test Page'), 2500);
  });

  test.ignore(browsers(Browser.SAFARI)).
  it('should be able to navigate forwards in browser history', function() {
    driver.get(Pages.formPage);

    driver.findElement(By.id('imageButton')).click();
    driver.wait(until.titleIs('We Arrive Here'), 5000);

    driver.navigate().back();
    driver.wait(until.titleIs('We Leave From Here'), 5000);

    driver.navigate().forward();
    driver.wait(until.titleIs('We Arrive Here'), 5000);
  });

  // PhantomJS 2.0 does not properly reload pages on refresh.
  test.ignore(browsers(Browser.PHANTOM_JS)).
  it('should be able to refresh a page', function() {
    driver.get(Pages.xhtmlTestPage);

    driver.navigate().refresh();

    assert(driver.getTitle()).equalTo('XHTML Test Page');
  });

  test.it('should return title of page if set', function() {
    driver.get(Pages.xhtmlTestPage);
    assert(driver.getTitle()).equalTo('XHTML Test Page');

    driver.get(Pages.simpleTestPage);
    assert(driver.getTitle()).equalTo('Hello WebDriver');
  });

  describe('timeouts', function() {
    test.afterEach(function() {
      let nullDriver = () => driver = null;
      return driver.quit().then(nullDriver, nullDriver);
    });

    // Only implemented in Firefox.
    test.ignore(browsers(
        Browser.CHROME,
        Browser.IE,
        Browser.IPAD,
        Browser.IPHONE,
        Browser.OPERA,
        Browser.PHANTOM_JS)).
    it('should timeout if page load timeout is set', function() {
      driver.call(function() {
        driver.manage().timeouts().pageLoadTimeout(1);
        driver.get(Pages.sleepingPage + '?time=3').
            then(function() {
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
});
