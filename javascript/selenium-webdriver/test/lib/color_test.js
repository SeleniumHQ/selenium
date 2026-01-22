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
const { By, Color, Colors } = require('selenium-webdriver')
const { Pages, suite } = require('../../lib/test')

suite(function (env) {
  let driver

  before(async function () {
    driver = await env.builder().build()
  })

  after(async function () {
    await driver.quit()
  })

  describe('Color', function () {
    describe('parsing', function () {
      it('parses rgb()', function () {
        const c = Color.fromString('rgb(255, 0, 0)')
        assert.strictEqual(c.asHex(), '#ff0000')
        assert.strictEqual(c.asRgb(), 'rgb(255, 0, 0)')
        assert.strictEqual(c.asRgba(), 'rgba(255, 0, 0, 1)')
      })

      it('parses rgba() with alpha', function () {
        const c = Color.fromString('rgba(0, 0, 255, 0.5)')
        assert.strictEqual(c.asRgba(), 'rgba(0, 0, 255, 0.5)')
      })

      it('parses rgb% with truncation', function () {
        const c = Color.fromString('rgb(50%, 50%, 50%)')
        // Java impl truncates 127.5 -> 127
        assert.strictEqual(c.asRgb(), 'rgb(127, 127, 127)')
      })

      it('parses hex #rrggbb and #rgb', function () {
        assert.strictEqual(Color.fromString('#ff0000').asRgb(), 'rgb(255, 0, 0)')
        assert.strictEqual(Color.fromString('#0f0').asRgb(), 'rgb(0, 255, 0)')
      })

      it('parses hsl()', function () {
        const c = Color.fromString('hsl(0, 100%, 50%)')
        assert.strictEqual(c.asHex(), '#ff0000')
      })

      it('parses named colors', function () {
        const c1 = Color.fromString('rebeccapurple')
        assert.strictEqual(c1.asRgb(), 'rgb(102, 51, 153)')
        const c2 = Color.fromString('transparent')
        assert.strictEqual(c2.asRgba(), 'rgba(0, 0, 0, 0)')
        const c3 = Color.fromString('gray')
        const c4 = Color.fromString('grey')
        assert.strictEqual(c3.asRgb(), c4.asRgb())
        assert.ok(Colors.gray instanceof Color)
      })

      it('equals compares normalized rgba string', function () {
        const a = Color.fromString('rgba(255, 0, 0, 1)')
        const b = Color.fromString('rgb(255, 0, 0)')
        assert.ok(a.equals(b))
      })
    })

    describe('integration with getCssValue()', function () {
      before(async function () {
        await driver.get(Pages.colorPage)
      })

      it('handles named color', async function () {
        const css = await driver.findElement(By.id('namedColor')).getCssValue('background-color')
        const c = Color.fromString(css)
        assert.strictEqual(c.asHex(), '#008000') // green
      })

      it('handles rgb()', async function () {
        const css = await driver.findElement(By.id('rgb')).getCssValue('background-color')
        const c = Color.fromString(css)
        assert.strictEqual(c.asHex(), '#008000')
      })

      it('handles rgb%()', async function () {
        const css = await driver.findElement(By.id('rgbpct')).getCssValue('background-color')
        const c = Color.fromString(css)
        assert.strictEqual(c.asRgb(), 'rgb(0, 128, 0)')
      })

      it('handles hex #rrggbb', async function () {
        const css = await driver.findElement(By.id('hex')).getCssValue('background-color')
        const c = Color.fromString(css)
        assert.strictEqual(c.asHex(), '#008000')
      })

      it('handles short hex #rgb', async function () {
        const css = await driver.findElement(By.id('hexShort')).getCssValue('background-color')
        const c = Color.fromString(css)
        assert.strictEqual(c.asHex(), '#eeeeee')
      })

      it('handles hsl()', async function () {
        const css = await driver.findElement(By.id('hsl')).getCssValue('background-color')
        const c = Color.fromString(css)
        assert.strictEqual(c.asHex(), '#008000')
      })

      it('handles rgba()', async function () {
        const css = await driver.findElement(By.id('rgba')).getCssValue('background-color')
        const c = Color.fromString(css)
        assert.strictEqual(c.asRgba(), 'rgba(0, 128, 0, 0.5)')
      })

      it('handles rgba%()', async function () {
        const css = await driver.findElement(By.id('rgbapct')).getCssValue('background-color')
        const c = Color.fromString(css)
        assert.strictEqual(c.asRgba(), 'rgba(0, 128, 0, 0.5)')
      })

      it('handles hsla()', async function () {
        const css = await driver.findElement(By.id('hsla')).getCssValue('background-color')
        const c = Color.fromString(css)
        assert.strictEqual(c.asRgba(), 'rgba(0, 128, 0, 0.5)')
      })
    })
  })
})
