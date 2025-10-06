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
const firefox = require('selenium-webdriver/firefox')
const test = require('../../lib/test')
const { getBinaryPaths } = require('selenium-webdriver/common/driverFinder')

test.suite(
  function (_env) {
    describe('geckodriver', function () {
      let service

      afterEach(function () {
        if (service) {
          return service.kill()
        }
      })

      it('can start geckodriver', async function () {
        service = new firefox.ServiceBuilder().build()
        service.setExecutable(getBinaryPaths(new firefox.Options()).driverPath)
        let url = await service.start()
        assert(/127\.0\.0\.1/.test(url), `unexpected url: ${url}`)
      })

      describe('environment variable support', function () {
        let originalEnvValue

        beforeEach(function () {
          originalEnvValue = process.env.SE_GECKODRIVER
        })

        afterEach(function () {
          if (originalEnvValue) {
            process.env.SE_GECKODRIVER = originalEnvValue
          } else {
            delete process.env.SE_GECKODRIVER
          }
        })

        it('uses SE_GECKODRIVER environment variable when set', function () {
          const testPath = '/custom/path/to/geckodriver'
          process.env.SE_GECKODRIVER = testPath

          const serviceBuilder = new firefox.ServiceBuilder()
          const service = serviceBuilder.build()
          assert.strictEqual(service.getExecutable(), testPath)
        })

        it('explicit path overrides environment variable', function () {
          const envPath = '/env/path/to/geckodriver'
          const explicitPath = '/explicit/path/to/geckodriver'

          process.env.SE_GECKODRIVER = envPath
          const serviceBuilder = new firefox.ServiceBuilder(explicitPath)
          const service = serviceBuilder.build()

          assert.strictEqual(service.getExecutable(), explicitPath)
        })

        it('falls back to default behavior when environment variable is not set', function () {
          delete process.env.SE_GECKODRIVER

          const serviceBuilder = new firefox.ServiceBuilder()
          const service = serviceBuilder.build()
          // Should be null/undefined when no explicit path and no env var
          assert.ok(!service.getExecutable())
        })

        it('environment variable ignores selenium manager', function () {
          // This test mimics Java's environmentVariableIgnoresSeleniumManager test
          const testDriverPath = '/custom/path/to/geckodriver'
          process.env.SE_GECKODRIVER = testDriverPath

          // Create ServiceBuilder without explicit path (null equivalent)
          const serviceBuilder = new firefox.ServiceBuilder()
          const service = serviceBuilder.build()

          // Verify that the environment variable path is used
          assert.strictEqual(service.getExecutable(), testDriverPath)
        })
      })
    })
  },
  { browsers: ['firefox'] },
)
