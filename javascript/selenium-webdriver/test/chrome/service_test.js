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
const chrome = require('selenium-webdriver/chrome')
const test = require('../../lib/test')
const { getBinaryPaths } = require('selenium-webdriver/common/driverFinder')

test.suite(
  function (_env) {
    describe('chromedriver', function () {
      let service
      afterEach(function () {
        if (service) {
          return service.kill()
        }
      })

      it('can be started on a custom path', function () {
        service = new chrome.ServiceBuilder().setPath('/foo/bar/baz').build()
        if (!service.getExecutable()) {
          service.setExecutable(getBinaryPaths(new chrome.Options()).driverPath)
        }
        return service.start().then(function (url) {
          assert.ok(url.endsWith('/foo/bar/baz'), 'unexpected url: ' + url)
        })
      })

      describe('environment variable support', function () {
        let originalEnvValue

        beforeEach(function () {
          originalEnvValue = process.env.SE_CHROMEDRIVER
        })

        afterEach(function () {
          if (originalEnvValue) {
            process.env.SE_CHROMEDRIVER = originalEnvValue
          } else {
            delete process.env.SE_CHROMEDRIVER
          }
        })

        it('uses SE_CHROMEDRIVER environment variable when set', function () {
          const testPath = '/custom/path/to/chromedriver'
          process.env.SE_CHROMEDRIVER = testPath

          const serviceBuilder = new chrome.ServiceBuilder()
          const service = serviceBuilder.build()
          assert.strictEqual(service.getExecutable(), testPath)
        })

        it('explicit path overrides environment variable', function () {
          const envPath = '/env/path/to/chromedriver'
          const explicitPath = '/explicit/path/to/chromedriver'

          process.env.SE_CHROMEDRIVER = envPath
          const serviceBuilder = new chrome.ServiceBuilder(explicitPath)
          const service = serviceBuilder.build()

          assert.strictEqual(service.getExecutable(), explicitPath)
        })

        it('falls back to default behavior when environment variable is not set', function () {
          delete process.env.SE_CHROMEDRIVER

          const serviceBuilder = new chrome.ServiceBuilder()
          const service = serviceBuilder.build()
          // Should be null/undefined when no explicit path and no env var
          assert.ok(!service.getExecutable())
        })

        it('environment variable ignores selenium manager', function () {
          // This test mimics Java's environmentVariableIgnoresSeleniumManager test
          const testDriverPath = '/custom/path/to/chromedriver'
          process.env.SE_CHROMEDRIVER = testDriverPath

          // Create ServiceBuilder without explicit path (null equivalent)
          const serviceBuilder = new chrome.ServiceBuilder()
          const service = serviceBuilder.build()

          // Verify that the environment variable path is used
          assert.strictEqual(service.getExecutable(), testDriverPath)
        })
      })
    })
  },
  { browsers: ['chrome'] },
)
