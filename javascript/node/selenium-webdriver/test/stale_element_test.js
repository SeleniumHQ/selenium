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
  test.before(function*() { driver = yield env.builder().build(); });
  test.after(function() { return driver.quit(); });

  // Element never goes stale in Safari.
  test.ignore(env.browsers(Browser.SAFARI)).
  it(
      'dynamically removing elements from the DOM trigger a ' +
          'StaleElementReferenceError',
      function*() {
        yield driver.get(Pages.javascriptPage);

        var toBeDeleted = yield driver.findElement(By.id('deleted'));
        yield assert(toBeDeleted.getTagName()).isEqualTo('p');

        yield driver.findElement(By.id('delete')).click();
        yield driver.wait(until.stalenessOf(toBeDeleted), 5000);
      });

  test.it('an element found in a different frame is stale', function*() {
    yield driver.get(Pages.missedJsReferencePage);

    var frame = yield driver.findElement(By.css('iframe[name="inner"]'));
    yield driver.switchTo().frame(frame);

    var el = yield driver.findElement(By.id('oneline'));
    yield driver.switchTo().defaultContent();
    return el.getText().then(fail, function(e) {
      assert(e).instanceOf(error.StaleElementReferenceError);
    });
  });
});
