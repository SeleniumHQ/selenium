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
const { Select, By } = require('..')
const { Pages, suite } = require('../lib/test')

let singleSelectValues1 = {
  name: 'selectomatic',
  values: ['One', 'Two', 'Four', 'Still learning how to count, apparently'],
}

let disabledSingleSelect = {
  name: 'single_disabled',
  values: ['Enabled', 'Disabled'],
}
let disabledMultiSelect = {
  name: 'multi_disabled',
  values: ['Enabled', 'Disabled'],
}

let multiSelectValues1 = {
  name: 'multi',
  values: ['Eggs', 'Ham', 'Sausages', 'Onion gravy'],
}
let multiSelectValues2 = {
  name: 'select_empty_multiple',
  values: ['select_1', 'select_2', 'select_3', 'select_4'],
}

suite(
  function (env) {
    let driver

    before(async function () {
      driver = await env.builder().build()
    })
    after(async () => await driver.quit())

    describe('Select by tests', function () {
      it('Should be able to select by value', async function () {
        await driver.get(Pages.formPage)

        let selector = new Select(
          driver.findElement(By.name(singleSelectValues1['name']))
        )
        for (let x in singleSelectValues1['values']) {
          await selector.selectByValue(
            singleSelectValues1['values'][x].toLowerCase()
          )
          let ele = await selector.getFirstSelectedOption()
          assert.deepEqual(
            await ele.getText(),
            singleSelectValues1['values'][x]
          )
        }
      })

      it('Should be able to select by index', async function () {
        await driver.get(Pages.formPage)

        let selector = new Select(
          driver.findElement(By.name(singleSelectValues1['name']))
        )
        for (let x in singleSelectValues1['values']) {
          await selector.selectByIndex(x)
          let ele = await selector.getFirstSelectedOption()
          assert.deepEqual(
            await ele.getText(),
            singleSelectValues1['values'][x]
          )
        }
      })

      it('Should be able to select by visible text', async function () {
        await driver.get(Pages.formPage)

        let selector = new Select(
          driver.findElement(By.name(singleSelectValues1['name']))
        )
        for (let x in singleSelectValues1['values']) {
          await selector.selectByVisibleText(singleSelectValues1['values'][x])
          let ele = await selector.getFirstSelectedOption()
          assert.deepEqual(
            await ele.getText(),
            singleSelectValues1['values'][x]
          )
        }
      })

      it('Should select by multiple index', async function () {
        await driver.get(Pages.formPage)

        let selector = new Select(
          driver.findElement(By.name(multiSelectValues1['name']))
        )
        await selector.deselectAll()

        for (let x in multiSelectValues1['values']) {
          await selector.selectByIndex(x)
        }

        let ele = await selector.getAllSelectedOptions()

        for (let x in ele) {
          assert.deepEqual(
            await ele[x].getText(),
            multiSelectValues1['values'][x]
          )
        }
      })

      it('Should select by multiple value', async function () {
        await driver.get(Pages.formPage)

        let selector = new Select(
          driver.findElement(By.name(multiSelectValues2['name']))
        )
        await selector.deselectAll()

        for (let value of multiSelectValues2['values']) {
          await selector.selectByValue(value)
        }

        let ele = await selector.getAllSelectedOptions()

        for (let x in ele) {
          assert.deepEqual(
            await ele[x].getText(),
            multiSelectValues2['values'][x]
          )
        }
      })

      it('Should select by multiple text', async function () {
        await driver.get(Pages.formPage)

        let selector = new Select(
          driver.findElement(By.name(multiSelectValues2['name']))
        )
        await selector.deselectAll()

        for (let value of multiSelectValues2['values']) {
          await selector.selectByVisibleText(value)
        }

        let ele = await selector.getAllSelectedOptions()

        for (let x in ele) {
          assert.deepEqual(
            await ele[x].getText(),
            multiSelectValues2['values'][x]
          )
        }
      })

      it('Should raise exception select by value single disabled', async function () {
        await driver.get(Pages.formPage)

        let selector = new Select(
          driver.findElement(By.name(disabledSingleSelect['name']))
        )

        await assert.rejects(
          async () => {
            await selector.selectByValue(
              disabledSingleSelect.values[1].toLowerCase()
            )
          },
          (err) => {
            assert.strictEqual(err.name, 'UnsupportedOperationError')
            assert.strictEqual(
              err.message,
              'You may not select a disabled option'
            )
            return true
          }
        )
      })

      it('Should raise exception select by index single disabled', async function () {
        await driver.get(Pages.formPage)

        let selector = new Select(
          driver.findElement(By.name(disabledSingleSelect['name']))
        )

        await assert.rejects(
          async () => {
            await selector.selectByIndex(1)
          },
          (err) => {
            assert.strictEqual(err.name, 'UnsupportedOperationError')
            assert.strictEqual(
              err.message,
              'You may not select a disabled option'
            )
            return true
          }
        )
      })

      it('Should raise exception select by text single disabled', async function () {
        await driver.get(Pages.formPage)

        let selector = new Select(
          driver.findElement(By.name(disabledSingleSelect['name']))
        )

        await assert.rejects(
          async () => {
            await selector.selectByVisibleText(disabledSingleSelect.values[1])
          },
          (err) => {
            assert.strictEqual(err.name, 'UnsupportedOperationError')
            assert.strictEqual(
              err.message,
              'You may not select a disabled option'
            )
            return true
          }
        )
      })

      it('Should raise exception select by index multiple disabled', async function () {
        await driver.get(Pages.formPage)

        let selector = new Select(
          driver.findElement(By.name(disabledMultiSelect['name']))
        )

        await assert.rejects(
          async () => {
            await selector.selectByIndex(1)
          },
          (err) => {
            assert.strictEqual(err.name, 'UnsupportedOperationError')
            assert.strictEqual(
              err.message,
              'You may not select a disabled option'
            )
            return true
          }
        )
      })

      it('Should raise exception select by value multiple disabled', async function () {
        await driver.get(Pages.formPage)

        let selector = new Select(
          driver.findElement(By.name(disabledMultiSelect['name']))
        )

        await assert.rejects(
          async () => {
            await selector.selectByValue(
              disabledMultiSelect.values[1].toLowerCase()
            )
          },
          (err) => {
            assert.strictEqual(err.name, 'UnsupportedOperationError')
            assert.strictEqual(
              err.message,
              'You may not select a disabled option'
            )
            return true
          }
        )
      })

      it('Should raise exception select by text multiple disabled', async function () {
        await driver.get(Pages.formPage)

        let selector = new Select(
          driver.findElement(By.name(disabledMultiSelect['name']))
        )

        await assert.rejects(
          async () => {
            await selector.selectByVisibleText(disabledMultiSelect.values[1])
          },
          (err) => {
            assert.strictEqual(err.name, 'UnsupportedOperationError')
            assert.strictEqual(
              err.message,
              'You may not select a disabled option'
            )
            return true
          }
        )
      })
    })
  },
  { browsers: ['firefox', 'chrome'] }
)
