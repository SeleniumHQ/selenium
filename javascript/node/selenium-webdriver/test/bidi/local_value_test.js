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
const { EvaluateResultType } = require('selenium-webdriver/bidi/evaluateResult')
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

    describe('Local Value', function () {
      it('can call function with undefined argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let value = LocalValue.createUndefinedValue()
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(arg!==undefined)\n' +
            '                throw Error("Argument should be undefined, but was "+arg);\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues,
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'undefined')
      })

      it('can call function with null argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let value = LocalValue.createNullValue()
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(arg!==null)\n' +
            '                throw Error("Argument should be null, but was "+arg);\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues,
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'null')
      })

      it('can call function with minus zero argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let value = LocalValue.createSpecialNumberValue(SpecialNumberType.MINUS_ZERO)
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(arg!==-0)\n' +
            '                throw Error("Argument should be -0, but was "+arg);\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues,
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'number')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value, '-0')
      })

      it('can call function with infinity argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let value = LocalValue.createSpecialNumberValue(SpecialNumberType.INFINITY)
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(arg!==Infinity)\n' +
            '                throw Error("Argument should be Infinity, but was "+arg);\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues,
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'number')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value, 'Infinity')
      })

      it('can call function with minus infinity argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let value = LocalValue.createSpecialNumberValue(SpecialNumberType.MINUS_INFINITY)
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(arg!==-Infinity)\n' +
            '                throw Error("Argument should be -Infinity, but was "+arg);\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues,
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'number')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value, '-Infinity')
      })

      it('can call function with number argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let value = LocalValue.createNumberValue(1.4)
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(arg!==1.4)\n' +
            '                throw Error("Argument should be 1.4, but was "+arg);\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues,
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'number')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value, 1.4)
      })

      it('can call function with boolean argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let value = LocalValue.createBooleanValue(true)
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(arg!==true)\n' +
            '                throw Error("Argument should be true, but was "+arg);\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues,
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'boolean')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value, true)
      })

      it('can call function with big int argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let value = LocalValue.createBigIntValue('42')
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(arg!==42n)\n' +
            '                throw Error("Argument should be 42n, but was "+arg);\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues,
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'bigint')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value, '42')
      })

      it('can call function with array argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let arrayValue = [LocalValue.createStringValue('foobar')]
        let value = LocalValue.createArrayValue(arrayValue)
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(! (arg instanceof Array))\n' +
            '                throw Error("Argument type should be Array, but was "+\n' +
            '                    Object.prototype.toString.call(arg));\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues,
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'array')
        assert.notEqual(result.result.value, null)

        let resultValue = result.result.value
        assert.equal(resultValue.length, 1)
        assert.equal(resultValue[0].type, 'string')
        assert.equal(resultValue[0].value, 'foobar')
      })

      it('can call function with set argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let setValue = [LocalValue.createStringValue('foobar')]
        let value = LocalValue.createSetValue(setValue)
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(! (arg instanceof Set))\n' +
            '                throw Error("Argument type should be Set, but was "+\n' +
            '                    Object.prototype.toString.call(arg));\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues,
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'set')
        assert.notEqual(result.result.value, null)

        let resultValue = result.result.value
        assert.equal(resultValue.length, 1)
        assert.equal(resultValue[0].type, 'string')
        assert.equal(resultValue[0].value, 'foobar')
      })

      it('can call function with date argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let value = LocalValue.createDateValue('2022-05-31T13:47:29.000Z')
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(! (arg instanceof Date))\n' +
            '                throw Error("Argument type should be Date, but was "+\n' +
            '                    Object.prototype.toString.call(arg));\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues,
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'date')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value, '2022-05-31T13:47:29.000Z')
      })

      it('can call function with map argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let mapValue = { foobar: LocalValue.createStringValue('foobar') }
        let value = LocalValue.createMapValue(mapValue)
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(! (arg instanceof Map))\n' +
            '                throw Error("Argument type should be Map, but was "+\n' +
            '                    Object.prototype.toString.call(arg));\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues,
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'map')
        assert.notEqual(result.result.value, null)

        let resultValue = result.result.value

        assert.equal(resultValue[0][0], 'foobar')
        assert.equal(resultValue[0][1].type, 'string')
        assert.equal(resultValue[0][1].value, 'foobar')
      })

      it('can call function with object argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let mapValue = { foobar: LocalValue.createStringValue('foobar') }
        let value = LocalValue.createObjectValue(mapValue)
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(! (arg instanceof Object))\n' +
            '                throw Error("Argument type should be Object, but was "+\n' +
            '                    Object.prototype.toString.call(arg));\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues,
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'object')
        assert.notEqual(result.result.value, null)

        let resultValue = result.result.value
        assert.equal(Object.keys(resultValue).length, 1)
        assert.equal(resultValue['foobar'].type, 'string')
        assert.equal(resultValue['foobar'].value, 'foobar')
      })

      it('can call function with regex argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let value = LocalValue.createRegularExpressionValue(new RegExpValue('foo', 'g'))
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(! (arg instanceof RegExp))\n' +
            '                throw Error("Argument type should be RegExp, but was "+\n' +
            '                    Object.prototype.toString.call(arg));\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues,
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'regexp')
        assert.notEqual(result.result.value, null)

        let resultValue = result.result.value
        assert.equal(resultValue.pattern, 'foo')
        assert.equal(resultValue.flags, 'g')
      })
    })
  },
  { browsers: [Browser.FIREFOX, Browser.CHROME, Browser.EDGE] },
)
