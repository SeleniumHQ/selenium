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
const { Select, By} = require('..')
const { Pages, ignore, suite } = require('../lib/test')
const { Browser } = require('../index')

let singleSelectValues1 = {'name': 'selectomatic', 'values': ['One', 'Two', 'Four', 'Still learning how to count, apparently']};
let disabledSelect = {'name': 'no-select', 'values': ['Foo']};

suite(
  function (env) {
    const browsers = (...args) => env.browsers(...args)

    let driver

    before(async function () {
      driver = await env.builder().build()
    })
    after(async () => await driver.quit())

    describe('Select by tests', function () {
      it('Should be able to select by value', async function () {
        await driver.get(Pages.formPage)

        let selector = new Select(driver.findElement(By.name(singleSelectValues1['name'])));
        for(let x in singleSelectValues1['values']) {
          await selector.selectByValue(singleSelectValues1['values'][x].toLowerCase())
          let ele = await selector.getFirstSelectedOption();
          assert.deepEqual(await ele.getText(), singleSelectValues1['values'][x] )
        }
      })

      it('Should be able to select by index', async function () {
        await driver.get(Pages.formPage)

        let selector = new Select(driver.findElement(By.name(singleSelectValues1['name'])));
        for(let x in singleSelectValues1['values']) {
          await selector.selectByIndex(x)
          let ele = await selector.getFirstSelectedOption();
          assert.deepEqual(await ele.getText(), singleSelectValues1['values'][x] )
        }
      })

      it('Should be able to select by visible text', async function () {
        await driver.get(Pages.formPage)

        let selector = new Select(driver.findElement(By.name(singleSelectValues1['name'])));
        for(let x in singleSelectValues1['values']) {
          await selector.selectByVisibleText(singleSelectValues1['values'][x])
          let ele = await selector.getFirstSelectedOption();
          assert.deepEqual(await ele.getText(), singleSelectValues1['values'][x] )
        }
      })

      ignore(browsers(Browser.FIREFOX)).it('Should check selected option if select is disabled by index', async function () {
        await driver.get(Pages.formPage)

        let selectorObject = new Select(driver.findElement(By.name(disabledSelect['name'])));
        let firstSelected = await selectorObject.getFirstSelectedOption()
        await selectorObject.selectByIndex(1);
        let lastSelected = await selectorObject.getFirstSelectedOption()
        assert.deepEqual(await firstSelected.getAttribute('value'), await lastSelected.getAttribute('value') )
      })

      ignore(browsers(Browser.FIREFOX)).it('Should check selected option if select is disabled by value', async function () {
        await driver.get(Pages.formPage)

        let selectorObject = new Select(driver.findElement(By.name(disabledSelect['name'])));
        let firstSelected = await selectorObject.getFirstSelectedOption()
        await selectorObject.selectByValue('bar');
        let lastSelected = await selectorObject.getFirstSelectedOption()
        assert.deepEqual(await firstSelected.getAttribute('value'), await lastSelected.getAttribute('value') )
      })

      ignore(browsers(Browser.FIREFOX)).it('Should check selected option if select is disabled by visible text', async function () {
        await driver.get(Pages.formPage)

        let selectorObject = new Select(driver.findElement(By.name(disabledSelect['name'])));
        let firstSelected = await selectorObject.getFirstSelectedOption()
        await selectorObject.selectByVisibleText('Bar');
        let lastSelected = await selectorObject.getFirstSelectedOption()
        assert.deepEqual(await firstSelected.getAttribute('value'), await lastSelected.getAttribute('value') )
      })
    })
  },
  { browsers: ['firefox', 'chrome'] }
)
