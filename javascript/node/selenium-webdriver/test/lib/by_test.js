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

var assert = require('assert')
var by = require('../../lib/by')

describe('by', function () {
  describe('By', function () {
    describe('className', function () {
      it('delegates to By.css', function () {
        let locator = by.By.className('foo')
        assert.strictEqual('css selector', locator.using)
        assert.strictEqual('.foo', locator.value)
      })

      it('escapes class name', function () {
        let locator = by.By.className('foo#bar')
        assert.strictEqual('css selector', locator.using)
        assert.strictEqual('.foo\\#bar', locator.value)
      })

      it('translates compound class names', function () {
        let locator = by.By.className('a b')
        assert.strictEqual('css selector', locator.using)
        assert.strictEqual('.a.b', locator.value)

        locator = by.By.className('  x   y   z-1  "g" ')
        assert.strictEqual('css selector', locator.using)
        assert.strictEqual('.x.y.z-1.\\"g\\"', locator.value)
      })
    })

    describe('id', function () {
      it('delegates to By.css', function () {
        let locator = by.By.id('foo')
        assert.strictEqual('css selector', locator.using)
        assert.strictEqual('*[id="foo"]', locator.value)
      })

      it('escapes the ID', function () {
        let locator = by.By.id('foo#bar')
        assert.strictEqual('css selector', locator.using)
        assert.strictEqual('*[id="foo\\#bar"]', locator.value)
      })
    })

    describe('name', function () {
      it('delegates to By.css', function () {
        let locator = by.By.name('foo')
        assert.strictEqual('css selector', locator.using)
        assert.strictEqual('*[name="foo"]', locator.value)
      })

      it('escapes the name', function () {
        let locator = by.By.name('foo"bar"')
        assert.strictEqual('css selector', locator.using)
        assert.strictEqual('*[name="foo\\"bar\\""]', locator.value)
      })

      it('escapes the name when it starts with a number', function () {
        let locator = by.By.name('123foo"bar"')
        assert.strictEqual('css selector', locator.using)
        assert.strictEqual('*[name="\\31 23foo\\"bar\\""]', locator.value)
      })

      it('escapes the name when it starts with a negative number', function () {
        let locator = by.By.name('-123foo"bar"')
        assert.strictEqual('css selector', locator.using)
        assert.strictEqual('*[name="-\\31 23foo\\"bar\\""]', locator.value)
      })
    })
  })

  describe('RelativeBy', function () {
    it('marshalls the RelativeBy object', function () {
      let relative = by.locateWith(by.By.tagName('p')).above(by.By.name('foobar'))

      let expected = {
        relative: {
          root: { 'css selector': 'p' },
          filters: [
            { kind: 'above', args: [{ 'css selector': '*[name="foobar"]' }] },
          ],
        },
      }
      assert.deepStrictEqual(relative.marshall(), expected)
    })
  })

  describe('checkedLocator', function () {
    it('accepts a By instance', function () {
      let original = by.By.name('foo')
      let locator = by.checkedLocator(original)
      assert.strictEqual(locator, original)
    })

    it('accepts custom locator functions', function () {
      let original = function () { }
      let locator = by.checkedLocator(original)
      assert.strictEqual(locator, original)
    })

    // See https://github.com/SeleniumHQ/selenium/issues/3056
    it('accepts By-like objects', function () {
      let fakeBy = { using: 'id', value: 'foo' }
      let locator = by.checkedLocator(fakeBy)
      assert.strictEqual(locator.constructor, by.By)
      assert.strictEqual(locator.using, 'id')
      assert.strictEqual(locator.value, 'foo')
    })

    it('accepts class name', function () {
      let locator = by.checkedLocator({ className: 'foo' })
      assert.strictEqual('css selector', locator.using)
      assert.strictEqual('.foo', locator.value)
    })

    it('accepts css', function () {
      let locator = by.checkedLocator({ css: 'a > b' })
      assert.strictEqual('css selector', locator.using)
      assert.strictEqual('a > b', locator.value)
    })

    it('accepts id', function () {
      let locator = by.checkedLocator({ id: 'foobar' })
      assert.strictEqual('css selector', locator.using)
      assert.strictEqual('*[id="foobar"]', locator.value)
    })

    it('accepts linkText', function () {
      let locator = by.checkedLocator({ linkText: 'hello' })
      assert.strictEqual('link text', locator.using)
      assert.strictEqual('hello', locator.value)
    })

    it('accepts name', function () {
      let locator = by.checkedLocator({ name: 'foobar' })
      assert.strictEqual('css selector', locator.using)
      assert.strictEqual('*[name="foobar"]', locator.value)
    })

    it('accepts partialLinkText', function () {
      let locator = by.checkedLocator({ partialLinkText: 'hello' })
      assert.strictEqual('partial link text', locator.using)
      assert.strictEqual('hello', locator.value)
    })

    it('accepts tagName', function () {
      let locator = by.checkedLocator({ tagName: 'div' })
      assert.strictEqual('css selector', locator.using)
      assert.strictEqual('div', locator.value)
    })

    it('accepts xpath', function () {
      let locator = by.checkedLocator({ xpath: '//div[1]' })
      assert.strictEqual('xpath', locator.using)
      assert.strictEqual('//div[1]', locator.value)
    })
  })
})
