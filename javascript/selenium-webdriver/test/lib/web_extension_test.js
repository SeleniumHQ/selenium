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
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const util = require('node:util')
const error = require('selenium-webdriver/lib/error')
const firefox = require('selenium-webdriver/firefox')
const { WebExtension } = require('selenium-webdriver')
const { WebDriver } = require('selenium-webdriver/lib/webdriver')
const { Capabilities } = require('selenium-webdriver/lib/capabilities')
const { Name } = require('selenium-webdriver/lib/command')
const { Session } = require('selenium-webdriver/lib/session')
const Symbols = require('selenium-webdriver/lib/symbols')
const { load } = require('selenium-webdriver/io/zip')
const { extensionData } = require('selenium-webdriver/lib/web_extension')
const { locate } = require('../../lib/test/resources')

const EXT_XPI = locate('common/extensions/webextensions-selenium-example.xpi')
const EXT_DIR = locate('common/extensions/webextensions-selenium-example')

/** Answers each command with the handler registered for its name, recording what it was sent. */
class RecordingExecutor {
  constructor(handlers = {}) {
    this.handlers = handlers
    this.commands = []
  }

  execute(command) {
    this.commands.push(command)
    const handler = this.handlers[command.getName()]
    if (!handler) {
      return Promise.reject(new error.UnknownCommandError(`unexpected command: ${command.getName()}`))
    }
    return Promise.resolve().then(() => handler(command.getParameters()))
  }
}

/**
 * A driver built directly on an executor, as for a Grid without the Builder. Nothing marks it,
 * so it counts as a remote end.
 */
function remoteDriver(handlers) {
  const executor = new RecordingExecutor(handlers)
  return { driver: new WebDriver(classicSession(), executor), executor }
}

/** A driver on a driver service this client started, as chromium/firefox/ie/safari mark one. */
function localDriver() {
  const executor = new RecordingExecutor()
  executor[Symbols.localDriverService] = true
  return { driver: new WebDriver(classicSession(), executor), executor }
}

function classicSession() {
  return new Session('session-id', new Capabilities())
}

describe('WebExtension', function () {
  it('wraps the id the browser assigned', function () {
    assert.strictEqual(new WebExtension('ext@example.com').id, 'ext@example.com')
  })

  it('shows its id when logged, and cannot be changed', function () {
    const extension = new WebExtension('ext@example.com')
    assert.strictEqual(util.inspect(extension), "WebExtension { id: 'ext@example.com' }")
    assert.throws(() => {
      extension.id = 'other'
    }, TypeError)
  })

  describe('WebDriver#installWebExtension', function () {
    it('raises without BiDi rather than silently doing nothing', async function () {
      const executor = new RecordingExecutor()
      const driver = new WebDriver(classicSession(), executor)

      await assert.rejects(driver.installWebExtension(EXT_DIR), error.UnsupportedOperationError)
      assert.deepStrictEqual(executor.commands, [])
    })
  })

  describe('install options', function () {
    function bidiSession(browserName) {
      return new Session('session-id', new Capabilities({ browserName, webSocketUrl: 'ws://127.0.0.1/session' }))
    }

    it("rejects Firefox's options on another browser rather than dropping them", async function () {
      const executor = new RecordingExecutor()
      const driver = new WebDriver(bidiSession('chrome'), executor)

      await assert.rejects(
        driver.installWebExtension(EXT_DIR, { permanent: true }),
        (err) =>
          err instanceof error.InvalidArgumentError && /chrome supports no options; got "permanent"/.test(err.message),
      )
      assert.deepStrictEqual(executor.commands, [])
    })

    it('rejects a misspelled Firefox option', async function () {
      const driver = new firefox.Driver(classicSession(), new RecordingExecutor())
      await assert.rejects(
        driver.installWebExtension(EXT_XPI, { permenant: true }),
        /Firefox supports only permanent, allowPrivateBrowsing; got "permenant"/,
      )
    })

    it('rejects a non-boolean option value', async function () {
      const driver = new firefox.Driver(classicSession(), new RecordingExecutor())
      await assert.rejects(driver.installWebExtension(EXT_XPI, { permanent: 'yes' }), error.InvalidArgumentError)
    })

    it('treats an option set to undefined as not given', async function () {
      const executor = new RecordingExecutor({ 'install addon': () => 'ext@example.com' })
      const driver = new firefox.Driver(classicSession(), executor)

      await driver.installWebExtension(EXT_XPI, { permanent: undefined })

      assert.strictEqual(Object.hasOwn(executor.commands[0].getParameters(), 'temporary'), false)
    })
  })

  describe('WebDriver#uninstallWebExtension', function () {
    it('rejects a raw id', async function () {
      const driver = new WebDriver(classicSession(), new RecordingExecutor())
      await assert.rejects(driver.uninstallWebExtension('ext@example.com'), error.InvalidArgumentError)
    })

    it('raises without BiDi', async function () {
      const driver = new WebDriver(classicSession(), new RecordingExecutor())
      await assert.rejects(
        driver.uninstallWebExtension(new WebExtension('ext@example.com')),
        error.UnsupportedOperationError,
      )
    })
  })

  describe('firefox.Driver without BiDi', function () {
    function installAddonExecutor(id = 'ext@example.com') {
      return new RecordingExecutor({ 'install addon': () => id, 'uninstall addon': () => null })
    }

    it('installs an archive through the classic endpoint', async function () {
      const executor = installAddonExecutor()
      const driver = new firefox.Driver(classicSession(), executor)

      const extension = await driver.installWebExtension(EXT_XPI)

      assert.strictEqual(extension.id, 'ext@example.com')
      assert.deepStrictEqual(executor.commands[0].getParameters(), {
        sessionId: 'session-id',
        addon: fs.readFileSync(EXT_XPI).toString('base64'),
      })
    })

    it('maps permanent and allowPrivateBrowsing onto the classic parameters', async function () {
      const executor = installAddonExecutor()
      const driver = new firefox.Driver(classicSession(), executor)

      await driver.installWebExtension(EXT_XPI, { permanent: false, allowPrivateBrowsing: true })

      const params = executor.commands[0].getParameters()
      assert.strictEqual(params.temporary, true)
      assert.strictEqual(params.allowPrivateBrowsing, true)
    })

    it('zips a directory', async function () {
      const executor = installAddonExecutor()
      const driver = new firefox.Driver(classicSession(), executor)

      await driver.installWebExtension(EXT_DIR)

      const zip = await loadBase64Zip(executor.commands[0].getParameters().addon)
      assert.ok(zip.has('manifest.json'))
    })

    it('passes base64 bytes through unchanged', async function () {
      const executor = installAddonExecutor()
      const driver = new firefox.Driver(classicSession(), executor)
      const encoded = fs.readFileSync(EXT_XPI).toString('base64')

      await driver.installWebExtension(encoded)

      assert.strictEqual(executor.commands[0].getParameters().addon, encoded)
    })

    it('rejects a path that does not exist', async function () {
      const driver = new firefox.Driver(classicSession(), installAddonExecutor())
      await assert.rejects(driver.installWebExtension('/no/such/extension.xpi'), error.InvalidArgumentError)
    })

    it('rejects a mistyped relative path rather than sending it as base64', async function () {
      const executor = installAddonExecutor()
      const driver = new firefox.Driver(classicSession(), executor)

      // Every character here is also valid base64.
      await assert.rejects(
        driver.installWebExtension('extensions/myext'),
        /No such file or directory, and not base64 of a packed extension.*: extensions\/myext$/,
      )
      assert.deepStrictEqual(executor.commands, [])
    })

    it('rejects base64 that is not a packed extension', async function () {
      const driver = new firefox.Driver(classicSession(), installAddonExecutor())
      await assert.rejects(
        driver.installWebExtension(Buffer.from('not an extension').toString('base64')),
        error.InvalidArgumentError,
      )
    })

    for (const [label, value] of [
      ['undefined', undefined],
      ['an empty string', ''],
      ['a Buffer', fs.readFileSync(EXT_XPI)],
    ]) {
      it(`rejects ${label} with an argument error`, async function () {
        const driver = new firefox.Driver(classicSession(), installAddonExecutor())
        await assert.rejects(driver.installWebExtension(value), /expects a path or a base64 string/)
      })
    }

    it('truncates a long rejected value in the error', async function () {
      const driver = new firefox.Driver(classicSession(), installAddonExecutor())
      await assert.rejects(driver.installWebExtension('a'.repeat(500)), (err) => err.message.length < 200)
    })

    it('uninstalls through the classic endpoint', async function () {
      const executor = installAddonExecutor()
      const driver = new firefox.Driver(classicSession(), executor)

      await driver.uninstallWebExtension(new WebExtension('ext@example.com'))

      assert.strictEqual(executor.commands[0].getName(), 'uninstall addon')
      assert.strictEqual(executor.commands[0].getParameters().id, 'ext@example.com')
    })
  })

  describe('MozWebExtension wire payload', function () {
    const { MozWebExtension } = require('selenium-webdriver/bidi/generated/webextension')
    const { DOMAIN_TOKEN } = require('selenium-webdriver/bidi/domain')

    /** Records each BiDi frame as it would be serialized onto the socket. */
    async function sentParams(installParams) {
      const frames = []
      const bidi = {
        send: async (message) => {
          frames.push(JSON.parse(JSON.stringify(message)))
          return { result: { extension: 'ext@example.com' } }
        },
      }
      await new MozWebExtension(bidi, DOMAIN_TOKEN).install(installParams)
      return frames[0].params
    }

    const extensionData = { type: 'path', path: '/tmp/ext' }

    it('leaves the moz fields off when not given, so Firefox applies its own defaults', async function () {
      assert.deepStrictEqual(await sentParams({ extensionData }), { extensionData })
    })

    it('sends the options under their moz wire keys', async function () {
      assert.deepStrictEqual(await sentParams({ extensionData, permanent: false, allowPrivateBrowsing: true }), {
        extensionData,
        'moz:permanent': false,
        'moz:allowPrivateBrowsing': true,
      })
    })
  })

  describe('extensionData', function () {
    it('sends an archive inline as base64', async function () {
      const { driver, executor } = remoteDriver()
      const data = await extensionData(driver, EXT_XPI)
      assert.deepStrictEqual(executor.commands, [])
      assert.deepStrictEqual(data, { type: 'base64', value: fs.readFileSync(EXT_XPI).toString('base64') })
    })

    it('uploads a directory to a remote end and references the remote path', async function () {
      const { driver, executor } = remoteDriver({ [Name.UPLOAD_FILE]: () => '/remote/upload/ext' })

      const data = await extensionData(driver, EXT_DIR)

      assert.deepStrictEqual(data, { type: 'path', path: '/remote/upload/ext' })
      // The upload endpoint returns its archive's single top-level entry, so the directory
      // itself must be that entry.
      const zip = await loadBase64Zip(executor.commands[0].getParameters().file)
      assert.ok(zip.has(`${path.basename(EXT_DIR)}/manifest.json`))
    })

    it('references a directory in place on a local driver service', async function () {
      const { driver, executor } = localDriver()
      const data = await extensionData(driver, EXT_DIR)
      assert.deepStrictEqual(data, { type: 'path', path: path.resolve(EXT_DIR) })
      assert.deepStrictEqual(executor.commands, [])
    })

    it('surfaces an upload failure', async function () {
      const { driver } = remoteDriver({
        [Name.UPLOAD_FILE]: () => {
          throw new error.WebDriverError('disk full')
        },
      })
      await assert.rejects(extensionData(driver, EXT_DIR), /disk full/)
    })
  })
})

async function loadBase64Zip(encoded) {
  const tmp = path.join(os.tmpdir(), `webext-${process.pid}-${Date.now()}.zip`)
  fs.writeFileSync(tmp, Buffer.from(encoded, 'base64'))
  try {
    return await load(tmp)
  } finally {
    fs.rmSync(tmp)
  }
}
