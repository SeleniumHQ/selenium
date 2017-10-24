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
 * @fileoverview This is an example of working with the different Firefox
 * release channels. Before running this example, you will need to have
 * installed Firefox's release, nightly, and developer editions:
 *
 * - https://www.mozilla.org/en-US/firefox/channel/desktop/#aurora
 * - https://www.mozilla.org/en-US/firefox/channel/desktop/#nightly
 */


'use strict';

const {Builder, By, Key, promise, until} = require('..');
const {Channel, Options} = require('../firefox');

let i = 0;
function resposition(driver) {
  return driver.manage().window().setSize(600, 400)
      .then(_ => driver.manage().window().setPosition(300 * (i++), 0));
}

function doSearch(driver) {
  // Start on the base about page.
  return driver.get('about:')
    // Reposition so users can see the three windows.
    .then(_ => resposition(driver))
    // Pause so users can see the magic.
    .then(_ => promise.delayed(750))
    // Now do the rest.
    .then(_ => driver.get('http://www.google.com/ncr'))
    .then(_ =>
        driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN))
    .then(_ => driver.wait(until.titleIs('webdriver - Google Search'), 1000))
    .then(_ => driver.quit());
}

function createDriver(channel) {
  let options = new Options().setBinary(channel);
  return new Builder().forBrowser('firefox').setFirefoxOptions(options).build();
}

// NOTE: disabling the promise manager so searches all run concurrently.
// For more on the promise manager and its pending deprecation, see
// https://github.com/SeleniumHQ/selenium/issues/2969
promise.USE_PROMISE_MANAGER = false;

Promise.all([
  doSearch(createDriver(Channel.RELEASE)),
  doSearch(createDriver(Channel.AURORA)),  // Developer Edition.
  doSearch(createDriver(Channel.NIGHTLY)),
]).then(_ => {
  console.log('Success!');
}, err => {
  console.error('An error occured! ' + err);
  setTimeout(() => {throw err}, 0);
});
