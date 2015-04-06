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
    test = require('../lib/test'),
    fileServer = require('../lib/test/fileserver');


test.suite(function(env) {
  var driver;
  test.beforeEach(function() { driver = env.builder().build(); });
  test.afterEach(function() { driver.quit(); });

  test.ignore(env.browsers(Browser.PHANTOM_JS, Browser.SAFARI)).
  describe('WebDriver.actions()', function() {

    test.it('can move to and click element in an iframe', function() {
      driver.get(fileServer.whereIs('click_tests/click_in_iframe.html'));

      driver.wait(until.elementLocated(By.id('ifr')), 5000)
          .then(function(frame) {
            driver.switchTo().frame(frame);
          });

      var link = driver.findElement(By.id('link'));
      driver.actions()
          .mouseMove(link)
          .click()
          .perform();

      driver.wait(until.titleIs('Submitted Successfully!'), 5000);
    });

  });
});
