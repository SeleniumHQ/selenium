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

var fail = require('assert').fail;

var Browser = require('..').Browser,
    By = require('..').By,
    error = require('..').error,
    until = require('..').until,
    assert = require('../testing/assert'),
    test = require('../lib/test'),
    Pages = test.Pages;


test.suite(function(env) {
  var driver;
  test.before(function() { driver = env.builder().build(); });
  test.after(function() { driver.quit(); });

  test.it(
      'dynamically removing elements from the DOM trigger a ' +
          'StaleElementReferenceError',
      function() {
        driver.get(Pages.javascriptPage);

        var toBeDeleted = driver.findElement(By.id('deleted'));
        assert(toBeDeleted.isDisplayed()).isTrue();

        driver.findElement(By.id('delete')).click();
        driver.wait(until.stalenessOf(toBeDeleted), 5000);
      });

  test.it('an element found in a different frame is stale', function() {
    driver.get(Pages.missedJsReferencePage);

    var frame = driver.findElement(By.css('iframe[name="inner"]'));
    driver.switchTo().frame(frame);

    var el = driver.findElement(By.id('oneline'));
    driver.switchTo().defaultContent();
    el.getText().then(fail, function(e) {
      assert(e).instanceOf(error.StaleElementReferenceError);
    });
  });
});
