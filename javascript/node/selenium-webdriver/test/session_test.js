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

var WebDriver = require('..').WebDriver,
    assert = require('../testing/assert'),
    test = require('../lib/test'),
    Pages = test.Pages;


test.suite(function(env) {
  var browsers = env.browsers;

  var driver;
  test.before(function*() {
    driver = yield env.builder().build();
  });

  test.after(function() {
    return driver.quit();
  });

  test.it('can connect to an existing session', function*() {
    yield driver.get(Pages.simpleTestPage);
    yield assert(driver.getTitle()).equalTo('Hello WebDriver');

    return driver.getSession().then(session1 => {
      let driver2 = WebDriver.attachToSession(
          driver.getExecutor(),
          session1.getId());

      return assert(driver2.getTitle()).equalTo('Hello WebDriver')
          .then(_ => {
            let session2Id = driver2.getSession().then(s => s.getId());
            return assert(session2Id).equalTo(session1.getId());
          });
    });
  });
});
