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
const { By } = require('../index')

test.suite(
  function (env) {
    let driver

    before(async function () {
      driver = await env.builder().build()
    })
    after(() => driver.quit())

    describe('Testing Aria Label', function () {
      it('Should return computed label', async function () {
        await driver.get(`data:text/html,<!DOCTYPE html>
          <h1>Level 1 Header</h1>`)
        let header = driver.findElement(By.css('h1'))
        assert.strictEqual(await header.getAccessibleName(), 'Level 1 Header')
      })

      it('Should return computed label for img', async function () {
        await driver.get(`data:text/html,<!DOCTYPE html>
          <img src="tequila.png" alt="Test Image">`)
        let imgLabel = driver.findElement(By.css('img'))
        assert.strictEqual(await imgLabel.getAccessibleName(), 'Test Image')
      })

      it('Should return computed label for label', async function () {
        await driver.get(`data:text/html,<!DOCTYPE html>
          <input type="checkbox" id="label_test">
            <label for="label_test">Test Label</label>`)
        let computedLabel = driver.findElement(By.css('input'))
        assert.strictEqual(
          await computedLabel.getAccessibleName(),
          'Test Label'
        )
      })

      it('Should return computed label for aria-label', async function () {
        await driver.get(`data:text/html,<!DOCTYPE html>
          <button aria-label="Add sample button to cart">Add to cart</button>`)
        let computedAriaLabel = driver.findElement(By.css('button'))
        assert.strictEqual(
          await computedAriaLabel.getAccessibleName(),
          'Add sample button to cart'
        )
      })

      it('Should return computed label for aria-labelby', async function () {
        await driver.get(`data:text/html,<!DOCTYPE html>
          <input type="search" aria-labelledby="this">
            <button id="this">Search</button>`)
        let computedAriaLabel = driver.findElement(By.css('input'))
        assert.strictEqual(
          await computedAriaLabel.getAccessibleName(),
          'Search'
        )
      })
    })
  },
  { browsers: ['chrome'] }
)
