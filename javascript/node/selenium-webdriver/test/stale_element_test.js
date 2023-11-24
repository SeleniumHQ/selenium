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
const { Browser, By, error, until } = require('..')
const Pages = test.Pages

test.suite(function (env) {
  var driver
  before(async function () {
    driver = await env.builder().build()
  })
  after(function () {
    return driver.quit()
  })

  // Element never goes stale in Safari.
  test
    .ignore(env.browsers(Browser.SAFARI))
    .it(
      'dynamically removing elements from the DOM trigger a ' +
        'StaleElementReferenceError',
      async function () {
        await driver.get(Pages.javascriptPage)

        var toBeDeleted = await driver.findElement(By.id('deleted'))
        assert.strictEqual(await toBeDeleted.getTagName(), 'p')

        await driver.findElement(By.id('delete')).click()
        await driver.wait(until.stalenessOf(toBeDeleted), 5000)
      }
    )

  xit('an element found in a different frame is stale', async function () {
    await driver.get(Pages.missedJsReferencePage)

    var frame = await driver.findElement(By.css('iframe[name="inner"]'))
    await driver.switchTo().frame(frame)

    var el = await driver.findElement(By.id('oneline'))
    await driver.switchTo().defaultContent()
    return el.getText().then(assert.fail, function (e) {
      assert.ok(
        e instanceof error.StaleElementReferenceError,
        `The error is ${JSON.stringify(e)}`
      )
    })
  })
})
