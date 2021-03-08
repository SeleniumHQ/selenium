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
const { Select, By } = require('../../..')
const { Pages, suite } = require('../../../lib/test')

suite(function (env) {
  let driver

  before(async function () {
    driver = await env.builder().build()
  })

  after(function () {
    return driver.quit()
  })

  describe('test Select.isMultiple()', function () {
    it('should be false when no multiple attribute is set', async function () {
      await driver.get(Pages.selectPage)
      const target = await driver.findElement(By.id('selectWithoutMultiple'))
      const actual = await new Select(target).isMultiple()
      assert.strictEqual(actual, false)
    })

    it('should be true when the multiple attribute is set to "multiple"', async function () {
      await driver.get(Pages.selectPage)
      const target = await driver.findElement(
        By.id('selectWithMultipleEqualsMultiple')
      )
      const actual = await new Select(target).isMultiple()
      assert.strictEqual(actual, true)
    })

    it('should be true when the multiple attribute is set to ""', async function () {
      await driver.get(Pages.selectPage)
      const target = await driver.findElement(
        By.id('selectWithEmptyStringMultiple')
      )
      const actual = await new Select(target).isMultiple()
      assert.strictEqual(actual, true)
    })

    it('should be true when the multiple attribute is set without a value', async function () {
      await driver.get(Pages.selectPage)
      const target = await driver.findElement(
        By.id('selectWithMultipleWithoutValue')
      )
      const actual = await new Select(target).isMultiple()
      assert.strictEqual(actual, true)
    })

    it('should be true when the multiple attribute is set to something random', async function () {
      await driver.get(Pages.selectPage)
      const target = await driver.findElement(
        By.id('selectWithRandomMultipleValue')
      )
      const actual = await new Select(target).isMultiple()
      assert.strictEqual(actual, true)
    })
  })
})
