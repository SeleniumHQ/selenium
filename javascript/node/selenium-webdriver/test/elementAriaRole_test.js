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

    describe('Testing Aria role', function () {
      it('Should return explicitly defined role', async function () {
        await driver.get(`data:text/html,<!DOCTYPE html>
  <div role='heading' aria-level='1'>Level 1 Header</div>`)
        let header = driver.findElement(By.css('div'))
        assert.strictEqual(await header.getAriaRole(), 'heading')
      })

      it('Should return implicit role defined by tagName', async function () {
        await driver.get(`data:text/html,<!DOCTYPE html>
  <h1> Level 1 Header</h1>`)
        let header = driver.findElement(By.css('h1'))
        assert.strictEqual(await header.getAriaRole(), 'heading')
      })

      it('Should return explicit role even if it contradicts TagName', async function () {
        await driver.get(`data:text/html,<!DOCTYPE html>
  <h1 role='alert'>Level 1 Header</h1>`)
        let header = driver.findElement(By.css('h1'))
        assert.strictEqual(await header.getAriaRole(), 'alert')
      })
    })
  },
  { browsers: ['chrome'] }
)
