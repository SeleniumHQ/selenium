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
const { Browser } = require('selenium-webdriver')
const { suite } = require('../../lib/test')
const Network = require('selenium-webdriver/bidi/network')
const { AddInterceptParameters } = require('selenium-webdriver/bidi/addInterceptParameters')
const { InterceptPhase } = require('selenium-webdriver/bidi/interceptPhase')
const { UrlPattern } = require('selenium-webdriver/bidi/urlPattern')

suite(
  function (env) {
    let driver
    let network

    beforeEach(async function () {
      driver = await env.builder().build()
      network = await Network(driver)
    })

    afterEach(async function () {
      await network.close()
      await driver.quit()
    })

    describe('Add Intercept parameters test', function () {
      it('can add intercept phase', async function () {
        const intercept = await network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT))
        assert.notEqual(intercept, null)
      })

      it('can add intercept phases', async function () {
        const intercept = await network.addIntercept(
          new AddInterceptParameters(InterceptPhase.AUTH_REQUIRED, InterceptPhase.BEFORE_REQUEST_SENT),
        )
        assert.notEqual(intercept, null)
      })

      it('can add string url pattern', async function () {
        const intercept = await network.addIntercept(
          new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT).urlStringPattern(
            'http://localhost:4444/basicAuth',
          ),
        )
        assert.notEqual(intercept, null)
      })

      it('can add string url patterns', async function () {
        const intercept = await network.addIntercept(
          new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT).urlStringPatterns([
            'http://localhost:4444/basicAuth',
            'http://localhost:4445/logEntryAdded',
          ]),
        )
        assert.notEqual(intercept, null)
      })

      it('can add url pattern', async function () {
        const urlPattern = new UrlPattern().protocol('http').hostname('localhost').port(4444).pathname('basicAuth')
        const intercept = await network.addIntercept(
          new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT).urlPattern(urlPattern),
        )
        assert.notEqual(intercept, null)
      })

      it('can add url patterns', async function () {
        const urlPattern1 = new UrlPattern()
          .protocol('http')
          .hostname('localhost')
          .port(4444)
          .pathname('logEntryAdded')
          .search('')

        const urlPattern2 = new UrlPattern()
          .protocol('https')
          .hostname('localhost')
          .port(4445)
          .pathname('basicAuth')
          .search('auth')

        const intercept = await network.addIntercept(
          new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT).urlPatterns([urlPattern1, urlPattern2]),
        )
        assert.notEqual(intercept, null)
      })
    })
  },
  { browsers: [Browser.FIREFOX, Browser.CHROME, Browser.EDGE] },
)
