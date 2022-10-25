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

const Capabilities = require('../../lib/capabilities').Capabilities
const Symbols = require('../../lib/symbols')
const test = require('../../lib/test')
const chrome = require('../../chrome')
const { Browser, By, until } = require('../../')
const remote = require('../../remote')

const assert = require('assert')
const fs = require('fs')
const io = require('../../io')

const Pages = test.Pages

describe('Capabilities', function () {
  it('can set and unset a capability', function () {
    let caps = new Capabilities()
    assert.strictEqual(undefined, caps.get('foo'))
    assert.ok(!caps.has('foo'))

    caps.set('foo', 'bar')
    assert.strictEqual('bar', caps.get('foo'))
    assert.ok(caps.has('foo'))

    caps.set('foo', null)
    assert.strictEqual(null, caps.get('foo'))
    assert.ok(caps.has('foo'))
  })

  it('requires string capability keys', function () {
    let caps = new Capabilities()
    assert.throws(() => caps.set({}, 'hi'))
  })

  it('can merge capabilities', function () {
    const caps1 = new Capabilities().set('foo', 'bar').set('color', 'red')

    const caps2 = new Capabilities().set('color', 'green')

    assert.strictEqual('bar', caps1.get('foo'))
    assert.strictEqual('red', caps1.get('color'))
    assert.strictEqual('green', caps2.get('color'))
    assert.strictEqual(undefined, caps2.get('foo'))

    caps2.merge(caps1)
    assert.strictEqual('bar', caps1.get('foo'))
    assert.strictEqual('red', caps1.get('color'))
    assert.strictEqual('red', caps2.get('color'))
    assert.strictEqual('bar', caps2.get('foo'))

    const caps3 = new Map().set('color', 'blue')

    caps2.merge(caps3)
    assert.strictEqual('blue', caps2.get('color'))
    assert.strictEqual('bar', caps2.get('foo'))

    const caps4 = { foo: 'baz' }

    const caps5 = caps2.merge(caps4)

    assert.strictEqual('blue', caps2.get('color'))
    assert.strictEqual('baz', caps2.get('foo'))
    assert.strictEqual('blue', caps5.get('color'))
    assert.strictEqual('baz', caps5.get('foo'))
    assert.strictEqual(true, caps5 instanceof Capabilities)
    assert.strictEqual(caps2, caps5)
  })

  it('can be initialized from a hash object', function () {
    let caps = new Capabilities({ one: 123, abc: 'def' })
    assert.strictEqual(123, caps.get('one'))
    assert.strictEqual('def', caps.get('abc'))
  })

  it('can be initialized from a map', function () {
    let m = new Map([
      ['one', 123],
      ['abc', 'def'],
    ])

    let caps = new Capabilities(m)
    assert.strictEqual(123, caps.get('one'))
    assert.strictEqual('def', caps.get('abc'))
  })

  describe('serialize', function () {
    it('works for simple capabilities', function () {
      let m = new Map([
        ['one', 123],
        ['abc', 'def'],
      ])
      let caps = new Capabilities(m)
      assert.deepStrictEqual(
        { one: 123, abc: 'def' },
        caps[Symbols.serialize]()
      )
    })

    it('does not omit capabilities set to a false-like value', function () {
      let caps = new Capabilities()
      caps.set('bool', false)
      caps.set('number', 0)
      caps.set('string', '')

      assert.deepStrictEqual(
        { bool: false, number: 0, string: '' },
        caps[Symbols.serialize]()
      )
    })

    it('omits capabilities with a null value', function () {
      let caps = new Capabilities()
      caps.set('foo', null)
      caps.set('bar', 123)
      assert.deepStrictEqual({ bar: 123 }, caps[Symbols.serialize]())
    })

    it('omits capabilities with an undefined value', function () {
      let caps = new Capabilities()
      caps.set('foo', undefined)
      caps.set('bar', 123)
      assert.deepStrictEqual({ bar: 123 }, caps[Symbols.serialize]())
    })
  })
})

test.suite(function (env) {
  test
    .ignore(env.browsers(Browser.SAFARI, Browser.FIREFOX))
    .it(
      'should fail to upload files to a non interactable input when StrictFileInteractability is on',
      async function () {
        const options = new chrome.Options()
        options.setStrictFileInteractability(true)
        const driver = env.builder().setChromeOptions(options).build()

        const LOREM_IPSUM_TEXT = 'lorem ipsum dolor sit amet'
        const FILE_HTML = '<!DOCTYPE html><div>' + LOREM_IPSUM_TEXT + '</div>'

        let fp = await io.tmpFile().then(function (fp) {
          fs.writeFileSync(fp, FILE_HTML)
          return fp
        })

        driver.setFileDetector(new remote.FileDetector())
        await driver.get(Pages.uploadInvisibleTestPage)
        const input = await driver.findElement(By.id('upload'))
        try {
          await input.sendKeys(fp)
          assert(false, 'element was interactable')
        } catch (e) {
          assert(e.message.includes('element not interactable'))
        }

        if (driver) {
          return driver.quit()
        }
      }
    )

  test
    .ignore(env.browsers(Browser.SAFARI, Browser.FIREFOX))
    .it(
      'Should upload files to a non interactable file input',
      async function () {
        const LOREM_IPSUM_TEXT = 'lorem ipsum dolor sit amet'
        const FILE_HTML = '<!DOCTYPE html><div>' + LOREM_IPSUM_TEXT + '</div>'

        let fp = await io.tmpFile().then(function (fp) {
          fs.writeFileSync(fp, FILE_HTML)
          return fp
        })

        const options = new chrome.Options()
        options.setStrictFileInteractability(false)
        const driver = env.builder().setChromeOptions(options).build()

        driver.setFileDetector(new remote.FileDetector())
        await driver.get(Pages.uploadInvisibleTestPage)

        const input1 = await driver.findElement(By.id('upload'))
        input1.sendKeys(fp)
        await driver.findElement(By.id('go')).click()

        // Uploading files across a network may take a while, even if they're really small
        let label = await driver.findElement(By.id('upload_label'))
        await driver.wait(
          until.elementIsNotVisible(label),
          10 * 1000,
          'File took longer than 10 seconds to upload!'
        )

        const frame = await driver.findElement(By.id('upload_target'))
        await driver.switchTo().frame(frame)
        assert.strictEqual(
          await driver.findElement(By.css('body')).getText(),
          LOREM_IPSUM_TEXT
        )

        if (driver) {
          return driver.quit()
        }
      }
    )
})
