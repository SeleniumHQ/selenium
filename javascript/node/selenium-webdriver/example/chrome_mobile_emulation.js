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
 * @fileoverview This is an example of emulating a mobile device using the
 * ChromeDriver.
 */

'use strict';

const {Builder, By, promise, until} = require('..');
const {Options} = require('../chrome');

promise.consume(function* () {
  let driver;
  try {
    driver = yield new Builder()
        .forBrowser('chrome')
        .setChromeOptions(
            new Options().setMobileEmulation({deviceName: 'Nexus 5X'}))
        .build();
    yield driver.get('http://www.google.com/ncr');
    yield driver.findElement(By.name('q')).sendKeys('webdriver');
    yield driver.findElement(By.name('btnG')).click();
    yield driver.wait(until.titleIs('webdriver - Google Search'), 1000);
  } finally {
    yield driver && driver.quit();
  }
}).then(_ => console.log('SUCCESS'), err => console.error('ERROR: ' + err));
