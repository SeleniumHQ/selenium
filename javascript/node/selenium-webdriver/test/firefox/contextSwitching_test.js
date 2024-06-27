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

const assert = require('node:assert')
const error = require('selenium-webdriver/lib/error')
const { Browser } = require('selenium-webdriver/index')
const { Context } = require('selenium-webdriver/firefox')
const { suite } = require('../../lib/test')

suite(
  function (env) {
    describe('firefox', function () {
      let driver

      beforeEach(function () {
        driver = null
      })

      afterEach(function () {
        return driver && driver.quit()
      })

      describe('context switching', function () {
        beforeEach(async function () {
          driver = await env.builder().build()
        })

        it('can get context', async function () {
          assert.strictEqual(await driver.getContext(), Context.CONTENT)
        })

        it('can set context', async function () {
          await driver.setContext(Context.CHROME)
          let ctxt = await driver.getContext()
          assert.strictEqual(ctxt, Context.CHROME)

          await driver.setContext(Context.CONTENT)
          ctxt = await driver.getContext()
          assert.strictEqual(ctxt, Context.CONTENT)
        })

        it('throws on unknown context', function () {
          return driver.setContext('foo').then(assert.fail, function (e) {
            assert(e instanceof error.InvalidArgumentError)
          })
        })
      })
    })
  },
  { browsers: [Browser.FIREFOX] },
)
