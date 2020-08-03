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

'use strict'

const { Builder, By, Key, promise, until } = require('..')
const { Channel, Options } = require('../firefox')

let i = 0
function resposition(driver) {
  return driver
    .manage()
    .window()
    .setRect({
      width: 600,
      height: 400,
      x: 300 * i++,
      y: 0,
    })
}

async function doSearch(driver) {
  try {
    // Start on the base about page.
    await driver.get('about:')
    // Reposition so users can see the three windows.
    await resposition(driver)
    // Pause so users can see the magic.
    await promise.delayed(750)
    // Now do the rest.
    await driver.get('http://www.google.com/ncr')
    await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN)
    await driver.wait(until.titleIs('webdriver - Google Search'), 1000)
    console.log('Success!')
  } catch (ex) {
    console.log('An error occured! ' + ex)
  } finally {
    await driver.quit()
  }
}

function createDriver(channel) {
  let options = new Options().setBinary(channel)
  return new Builder().forBrowser('firefox').setFirefoxOptions(options).build()
}

Promise.all([
  doSearch(createDriver(Channel.RELEASE)),
  doSearch(createDriver(Channel.AURORA)), // Developer Edition.
  doSearch(createDriver(Channel.NIGHTLY)),
]).then(
  (_) => {
    console.log('All done!')
  },
  (err) => {
    console.error('An error occured! ' + err)
    setTimeout(() => {
      throw err
    }, 0)
  }
)
