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

/**
 * @fileoverview An example WebDriver script using generator functions.
 *
 * Usage: node selenium-webdriver/example/google_search_generator.js
 */

var webdriver = require('..'),
    By = webdriver.By;

var driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();

driver.get('http://www.google.com/ncr');
driver.call(function* () {
  var query = yield driver.findElement(By.name('q'));
  query.sendKeys('webdriver');

  var submit = yield driver.findElement(By.name('btnG'));
  submit.click();
});

driver.wait(function* () {
  var title = yield driver.getTitle();
  return 'webdriver - Google Search' === title;
}, 1000);

driver.quit();
