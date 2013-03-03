// Copyright 2013 Selenium committers
// Copyright 2013 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

require('./lib/_bootstrap')(module);

var assert = require('assert'),
    By = require('selenium-webdriver').By;

var test = require('./lib/testbase'),
    Browser = test.Browser,
    browsers = test.browsers,
    Pages = test.Pages;


describe('Page loading', function() {
  var driver;
  beforeEach(function() { driver = test.driver; });

  test.it('should wait for document to be loaded', function() {
    driver.get(Pages.simpleTestPage);
    test.assertTitleIs('Hello WebDriver');
  });

  test.it('should follow redirects sent in the http response headers',
      function() {
    driver.get(Pages.redirectPage);
    test.assertTitleIs('We Arrive Here');
  });

  test.ignore(browsers(Browser.ANDROID)).it('should follow meta redirects',
      function() {
    driver.get(Pages.metaRedirectPage);
    test.assertTitleIs('We Arrive Here');
  });

  test.it('should be able to get a fragment on the current page', function() {
    driver.get(Pages.xhtmlTestPage);
    driver.get(Pages.xhtmlTestPage + '#text');
    driver.findElement(By.id('id1'));
  });

  test.ignore(browsers(Browser.ANDROID, Browser.IOS)).
  it('should wait for all frames to load in a frameset', function() {
    driver.get(Pages.framesetPage);
    driver.switchTo().frame(0);

    driver.findElement(By.css('span#pageNumber')).getText().then(function(txt) {
      assert.equal('1', txt.trim());
    });

    driver.switchTo().defaultContent();
    driver.switchTo().frame(1);
    driver.findElement(By.css('span#pageNumber')).getText().then(function(txt) {
      assert.equal('2', txt.trim());
    });
  });

  test.ignore(browsers(Browser.ANDROID, Browser.SAFARI)).
  it('should be able to navigate back in browser history', function() {
    driver.get(Pages.formPage);

    driver.findElement(By.id('imageButton')).click();
    test.waitForTitleToBe('We Arrive Here');

    driver.navigate().back();
    test.assertTitleIs('We Leave From Here');
  });

  test.ignore(browsers(Browser.SAFARI)).
  it('should be able to navigate back in presence of iframes', function() {
    driver.get(Pages.xhtmlTestPage);

    driver.findElement(By.name('sameWindow')).click();
    test.waitForTitleToBe('This page has iframes');

    driver.navigate().back();
    test.assertTitleIs('XHTML Test Page');
  });

  test.ignore(browsers(Browser.ANDROID, Browser.SAFARI)).
  it('should be able to navigate forwards in browser history', function() {
    driver.get(Pages.formPage);

    driver.findElement(By.id('imageButton')).click();
    test.waitForTitleToBe('We Arrive Here');

    driver.navigate().back();
    test.waitForTitleToBe('We Leave From Here');

    driver.navigate().forward();
    test.waitForTitleToBe('We Arrive Here');
  });

  test.it('should be able to refresh a page', function() {
    driver.get(Pages.xhtmlTestPage);

    driver.navigate().refresh();

    test.assertTitleIs('XHTML Test Page');
  });

  test.it('should return title of page if set', function() {
    driver.get(Pages.xhtmlTestPage);
    test.assertTitleIs('XHTML Test Page');

    driver.get(Pages.simpleTestPage);
    test.assertTitleIs('Hello WebDriver');
  });
});
