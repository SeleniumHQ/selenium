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

'use strict'

const assert = require('assert')
const test = require('../lib/test')
const { By } = require('..')

test.suite(function (env) {
  var driver

  before(async function () {
    driver = await env.builder().build()
  })
  after(function () {
    return driver.quit()
  })

  beforeEach(function () {
    return driver.switchTo().defaultContent()
  })

  it('can switch to a frame and back to the parent frame', async function () {
    await driver.get(test.Pages.iframePage)

    let frame = await driver.findElement(By.name('iframe1-name'))
    await driver.switchTo().frame(frame)
    assert.strictEqual(
      await driver.executeScript('return document.title'),
      'We Leave From Here'
    )
    await driver.switchTo().parentFrame()
    assert.strictEqual(
      await driver.executeScript('return document.title'),
      'This page has iframes'
    )
  })

  it('can switch to a frame by id', async function () {
    await driver.get(test.Pages.iframePage)
    await driver.switchTo().frame('iframe1')
    assert.strictEqual(
      await driver.executeScript('return document.title'),
      'We Leave From Here'
    )
    await driver.switchTo().parentFrame()
    assert.strictEqual(
      await driver.executeScript('return document.title'),
      'This page has iframes'
    )
  })

  it('can switch to a frame by name', async function () {
    await driver.get(test.Pages.iframePage)
    await driver.switchTo().frame('iframe1-name')
    assert.strictEqual(
      await driver.executeScript('return document.title'),
      'We Leave From Here'
    )
    await driver.switchTo().parentFrame()
    assert.strictEqual(
      await driver.executeScript('return document.title'),
      'This page has iframes'
    )
  })
})
