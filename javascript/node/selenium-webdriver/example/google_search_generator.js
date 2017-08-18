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
 * Before running this script, ensure that Mozilla's geckodriver is present on
 * your system PATH: <https://github.com/mozilla/geckodriver/releases>
 *
 * Usage:
 *
 *     node selenium-webdriver/example/google_search_generator.js
 */

'use strict';

const {Builder, By, Key, promise, until} = require('..');

promise.consume(function* () {
  let driver;
  try {
    driver = yield new Builder().forBrowser('firefox').build();

    yield driver.get('http://www.google.com/ncr');

    let q = yield driver.findElement(By.name('q'));
    yield q.sendKeys('webdriver', Key.RETURN);

    yield driver.wait(until.titleIs('webdriver - Google Search'), 1000);
  } finally {
    yield driver && driver.quit();
  }
}).then(_ => console.log('SUCCESS'), err => console.error('ERROR: ' + err));
