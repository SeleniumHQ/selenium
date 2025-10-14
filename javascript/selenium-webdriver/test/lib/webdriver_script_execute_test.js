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
const { Browser } = require('selenium-webdriver/')
const { suite } = require('../../lib/test')

const ScriptManager = require('selenium-webdriver/bidi/scriptManager')
const { LocalValue, RegExpValue } = require('selenium-webdriver/bidi/protocolValue')
const { SpecialNumberType } = require('selenium-webdriver/bidi/protocolType')

suite(
  function (env) {
    let driver

    beforeEach(async function () {
      driver = await env.builder().build()
    })

    afterEach(async function () {
      await driver.quit()
    })

    describe('Execute script', function () {
      it('can execute script with undefined argument', async function () {
        const result = await driver
          .script()
          .execute(
            '(arg) => {{\n' +
              '            if(arg!==undefined)\n' +
              '                throw Error("Argument should be undefined, but was "+arg);\n' +
              '            return arg;\n' +
              '        }}',
            undefined,
          )

        assert.equal(result.type, 'undefined')
      })

      it('can execute script with null argument', async function () {
        const result = await driver
          .script()
          .execute(
            '(arg) => {{\n' +
              '            if(arg!==null)\n' +
              '                throw Error("Argument should be null, but was "+arg);\n' +
              '            return arg;\n' +
              '        }}',
            null,
          )

        assert.equal(result.type, 'null')
      })
      it('can execute script with minus zero argument', async function () {
        const result = await driver
          .script()
          .execute(
            '(arg) => {{\n' +
              '            if(arg!==-0)\n' +
              '                throw Error("Argument should be -0, but was " + arg);\n' +
              '            return arg;\n' +
              '        }}',
            SpecialNumberType.MINUS_ZERO,
          )

        assert.equal(result.type, 'number')
        assert.equal(result.value, '-0')
      })

      it('can execute script with infinity argument', async function () {
        const result = await driver
          .script()
          .execute(
            '(arg) => {{\n' +
              '            if(arg!==Infinity)\n' +
              '                throw Error("Argument should be Infinity, but was "+arg);\n' +
              '            return arg;\n' +
              '        }}',
            SpecialNumberType.INFINITY,
          )

        assert.equal(result.type, 'number')
        assert.equal(result.value, 'Infinity')
      })

      it('can execute script with minus infinity argument', async function () {
        const result = await driver
          .script()
          .execute(
            '(arg) => {{\n' +
              '            if(arg!==-Infinity)\n' +
              '                throw Error("Argument should be -Infinity, but was "+arg);\n' +
              '            return arg;\n' +
              '        }}',
            SpecialNumberType.MINUS_INFINITY,
          )

        assert.equal(result.type, 'number')
        assert.equal(result.value, '-Infinity')
      })

      it('can execute script with number argument', async function () {
        const result = await driver
          .script()
          .execute(
            '(arg) => {{\n' +
              '            if(arg!==1.4)\n' +
              '                throw Error("Argument should be 1.4, but was "+arg);\n' +
              '            return arg;\n' +
              '        }}',
            1.4,
          )

        assert.equal(result.type, 'number')
        assert.equal(result.value, 1.4)
      })

      it('can execute script with boolean argument', async function () {
        const result = await driver
          .script()
          .execute(
            '(arg) => {{\n' +
              '            if(arg!==true)\n' +
              '                throw Error("Argument should be true, but was "+arg);\n' +
              '            return arg;\n' +
              '        }}',
            true,
          )

        assert.equal(result.type, 'boolean')
        assert.equal(result.value, true)
      })

      it('can execute script with big int argument', async function () {
        const result = await driver
          .script()
          .execute(
            '(arg) => {{\n' +
              '            if(arg!==42n)\n' +
              '                throw Error("Argument should be 42n, but was "+arg);\n' +
              '            return arg;\n' +
              '        }}',
            42n,
          )

        assert.equal(result.type, 'bigint')
        assert.equal(result.value, '42')
      })

      it('can execute script with array argument', async function () {
        let arrayValue = ['foobar']

        const result = await driver
          .script()
          .execute(
            '(arg) => {{\n' +
              '            if(! (arg instanceof Array))\n' +
              '                throw Error("Argument type should be Array, but was "+\n' +
              '                    Object.prototype.toString.call(arg));\n' +
              '            return arg;\n' +
              '        }}',
            arrayValue,
          )

        assert.equal(result.type, 'array')

        let resultValue = result.value
        assert.equal(resultValue.length, 1)
        assert.equal(resultValue[0].type, 'string')
        assert.equal(resultValue[0].value, 'foobar')
      })

      it('can execute script with set argument', async function () {
        let setValues = new Set()
        setValues.add('foobar')
        setValues.add('test')

        const result = await driver
          .script()
          .execute(
            '(arg) => {{\n' +
              '            if(! (arg instanceof Set))\n' +
              '                throw Error("Argument type should be Set, but was "+\n' +
              '                    Object.prototype.toString.call(arg));\n' +
              '            return arg;\n' +
              '        }}',
            setValues,
          )

        assert.equal(result.type, 'set')

        let resultValue = result.value
        assert.equal(resultValue.length, 2)
        assert.equal(resultValue[0].type, 'string')
        assert.equal(resultValue[0].value, 'foobar')
        assert.equal(resultValue[1].type, 'string')
        assert.equal(resultValue[1].value, 'test')
      })

      it('can execute script with date argument', async function () {
        const result = await driver
          .script()
          .execute(
            '(arg) => {{\n' +
              '            if(! (arg instanceof Date))\n' +
              '                throw Error("Argument type should be Date, but was "+\n' +
              '                    Object.prototype.toString.call(arg));\n' +
              '            return arg;\n' +
              '        }}',
            new Date('2022-05-31T13:47:29.000Z'),
          )

        assert.equal(result.type, 'date')
        assert.equal(result.value, '2022-05-31T13:47:29.000Z')
      })

      it('can execute script with map argument', async function () {
        let mapValue = new Map()
        mapValue.set(1, 2)
        mapValue.set('foo', 'bar')
        mapValue.set(true, false)
        mapValue.set('baz', [1, 2, 3])

        const result = await driver
          .script()
          .execute(
            '(arg) => {{\n' +
              '            if(! (arg instanceof Map))\n' +
              '                throw Error("Argument type should be Map, but was "+\n' +
              '                    Object.prototype.toString.call(arg));\n' +
              '            return arg;\n' +
              '        }}',
            mapValue,
          )
        assert.equal(result.type, 'map')
        assert.notEqual(result.value, null)

        let resultValue = result.value

        assert.equal(resultValue.length, 4)

        assert.equal(
          JSON.stringify(resultValue),
          '[[{"type":"number","value":1},{"type":"number","value":2}],["foo",{"type":"string","value":"bar"}],[{"type":"boolean","value":true},{"type":"boolean","value":false}],["baz",{"type":"array","value":[{"type":"number","value":1},{"type":"number","value":2},{"type":"number","value":3}]}]]',
        )
      })

      it('can execute script with object argument', async function () {
        const result = await driver
          .script()
          .execute(
            '(arg) => {{\n' +
              '            if(! (arg instanceof Object))\n' +
              '                throw Error("Argument type should be Object, but was "+\n' +
              '                    Object.prototype.toString.call(arg));\n' +
              '            return arg;\n' +
              '        }}',
            { foobar: 'foobar' },
          )

        assert.equal(result.type, 'object')

        let resultValue = result.value
        assert.equal(resultValue['foobar'].type, 'string')
        assert.equal(resultValue['foobar'].value, 'foobar')
      })

      it('can execute script with regex argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let value = LocalValue.createRegularExpressionValue(new RegExpValue('foo', 'g'))
        argumentValues.push(value)

        const result = await driver
          .script()
          .execute(
            '(arg) => {{\n' +
              '            if(! (arg instanceof RegExp))\n' +
              '                throw Error("Argument type should be RegExp, but was "+\n' +
              '                    Object.prototype.toString.call(arg));\n' +
              '            return arg;\n' +
              '        }}',
            new RegExp('foo', 'g'),
          )

        let resultValue = result.value

        assert.equal(resultValue.pattern, 'foo')
        assert.equal(resultValue.flags, 'g')
      })
    })
  },
  { browsers: [Browser.FIREFOX, Browser.CHROME, Browser.EDGE] },
)
