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

  test.it('should follow meta redirects', function() {
    driver.get(Pages.metaRedirectPage);
    test.assertTitleIs('We Arrive Here');
  });

  test.it('should be able to get a fragment on the current page', function() {
    driver.get(Pages.xhtmlTestPage);
    driver.get(Pages.xhtmlTestPage + '#text');
    driver.findElement(By.id('id1'));
  });
});
