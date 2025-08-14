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
const { suite } = require('../../lib/test')
const WebExtension = require('selenium-webdriver/bidi/webExtension/webExtension')
const ExtensionData = require('selenium-webdriver/bidi/webExtension/extensionData')
const { locate } = require('../../lib/test/resources')
const { Browser } = require('selenium-webdriver')
const fs = require('node:fs')

suite(
  function (env) {
    let driver

    beforeEach(async function () {
      driver = await env.builder().build()
    })

    afterEach(async function () {
      await driver.quit()
    })

    const WEBEXTENSION_CRX = locate('common/extensions/webextensions-selenium-example.crx')

    const ARCHIVE_PATH = locate('common/extensions/webextensions-selenium-example.xpi')

    describe('BiDi Module Extension', function () {
      it('can install webExtension from a given path', async function () {
        const extension = await WebExtension(driver)
        const id = await extension.install(ExtensionData.setPath(WEBEXTENSION_CRX))

        assert.strictEqual(id, 'webextensions-selenium-example-v3@example.com')

        await extension.uninstall(id)
      })

      it('can install webExtension from an archive path', async function () {
        const extension = await WebExtension(driver)
        const id = await extension.install(ExtensionData.setArchivePath(ARCHIVE_PATH))

        assert.strictEqual(id, 'webextensions-selenium-example-v3@example.com')

        await extension.uninstall(id)
      })

      it('can install webExtension from a base64 encoded path', async function () {
        const extension = await WebExtension(driver)

        const base64Path = fs.readFileSync(ARCHIVE_PATH, { encoding: 'base64' })
        const id = await extension.install(ExtensionData.setBase64Encoded(base64Path))

        assert.strictEqual(id, 'webextensions-selenium-example-v3@example.com')

        await extension.uninstall(id)
      })

      it('can uninstall an webExtension', async function () {
        const extension = await WebExtension(driver)
        const id = await extension.install(ExtensionData.setPath(WEBEXTENSION_CRX))

        assert.strictEqual(id, 'webextensions-selenium-example-v3@example.com')

        await extension.uninstall(id)
      })

      it('can throw an error if webExtension does not exist', async function () {
        const extension = await WebExtension(driver)

        try {
          await extension.uninstall('webextensions-selenium-example-v3@example.com')
          assert.fail('Expected uninstall to throw an error')
        } catch (e) {
          assert.match(e.message, /no such web extension/i)
        }
      })
    })
  },
  { browsers: [Browser.FIREFOX] },
)
