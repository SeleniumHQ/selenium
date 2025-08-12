'use strict'

const assert = require('node:assert')
const { suite } = require('../../lib/test')
const Extension = require('selenium-webdriver/bidi/extension/extension')
const ExtensionData = require('selenium-webdriver/bidi/extension/extensionData')
const {locate} = require("../../lib/test/resources")
const {Browser} = require('selenium-webdriver')
const fs = require('fs')

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

    const  ARCHIVE_PATH= locate('common/extensions/webextensions-selenium-example.xpi')

    describe('BiDi Module Extension', function () {
      it('can install extension from a given path', async function () {
        const extension = await Extension(driver)
        const id = await extension.install(ExtensionData.setPath(WEBEXTENSION_CRX))

        assert.strictEqual(id, "webextensions-selenium-example-v3@example.com")
      })

      it('can install extension from an archive path', async function () {
          const extension = await Extension(driver)
          const id = await extension.install(ExtensionData.setArchivePath(ARCHIVE_PATH))

          assert.strictEqual(id, "webextensions-selenium-example-v3@example.com")
        })

      it('can install extension from a base64 encoded path', async function () {
        const extension = await Extension(driver)

        const base64Path = fs.readFileSync(ARCHIVE_PATH, { encoding: 'base64' })
        const id = await extension.install(ExtensionData.setBase64Encoded(base64Path))

        assert.strictEqual(id, "webextensions-selenium-example-v3@example.com")
      })

      it('can uninstall an extension', async function () {
        const extension = await Extension(driver)
        const id = await extension.install(ExtensionData.setPath(WEBEXTENSION_CRX))

        assert.strictEqual(id, "webextensions-selenium-example-v3@example.com")

        await extension.uninstall(id)
      })
    })
  },
  { browsers: [Browser.FIREFOX] },
)
