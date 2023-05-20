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

// Imports for LogInspector and BrowsingContext
const assert = require('assert')
const firefox = require('../../firefox')
const { Browser } = require('../../')
const { Pages, suite } = require('../../lib/test')
const logInspector = require('../../bidi/logInspector')
const BrowsingContext = require('../../bidi/browsingContext')
const BrowsingConextInspector = require('../../bidi/browsingContextInspector')
const filterBy = require('../../bidi/filterBy')
const until = require('../../lib/until')

// Imports for Script Module
const ScriptManager = require('../../bidi/scriptManager')
const {
  LocalValue,
  ReferenceValue,
  RemoteReferenceType,
  RegExpValue,
} = require('../../bidi/protocolValue')
const { ArgumentValue } = require('../../bidi/argumentValue')
const { EvaluateResultType } = require('../../bidi/evaluateResult')
const { ResultOwnership } = require('../../bidi/resultOwnership')
const { SpecialNumberType } = require('../../bidi/protocolType')
const { RealmType } = require('../../bidi/realmInfo')

suite(
  function (env) {
    let driver

    beforeEach(async function () {
      driver = await env
        .builder()
        .setFirefoxOptions(new firefox.Options().enableBidi())
        .build()
    })

    afterEach(async function () {
      await driver.quit()
    })

    describe('Session', function () {
      it('can create bidi session', async function () {
        const bidi = await driver.getBidi()
        const status = await bidi.status

        assert('ready' in status['result'])
        assert.notEqual(status['result']['message'], null)
      })
    })

    describe('Log Inspector', function () {
      it('can listen to console log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onConsoleEntry(function (log) {
          logEntry = log
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        assert.equal(logEntry.text, 'Hello, world!')
        assert.equal(logEntry.realm, null)
        assert.equal(logEntry.type, 'console')
        assert.equal(logEntry.level, 'info')
        assert.equal(logEntry.method, 'log')
        assert.equal(logEntry.stackTrace, null)
        assert.equal(logEntry.args.length, 1)

        await inspector.close()
      })

      it('can listen to console log with different consumers', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onConsoleEntry(function (log) {
          logEntry = log
        })

        let logEntryText = null
        await inspector.onConsoleEntry(function (log) {
          logEntryText = log.text
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        assert.equal(logEntry.text, 'Hello, world!')
        assert.equal(logEntry.realm, null)
        assert.equal(logEntry.type, 'console')
        assert.equal(logEntry.level, 'info')
        assert.equal(logEntry.method, 'log')
        assert.equal(logEntry.stackTrace, null)
        assert.equal(logEntry.args.length, 1)

        assert.equal(logEntryText, 'Hello, world!')

        await inspector.close()
      })

      it('can filter console info level log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onConsoleEntry(function (log) {
          logEntry = log
        }, filterBy.FilterBy.logLevel('info'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        assert.equal(logEntry.text, 'Hello, world!')
        assert.equal(logEntry.realm, null)
        assert.equal(logEntry.type, 'console')
        assert.equal(logEntry.level, 'info')
        assert.equal(logEntry.method, 'log')
        assert.equal(logEntry.stackTrace, null)
        assert.equal(logEntry.args.length, 1)

        await inspector.close()
      })

      it('can filter console log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onConsoleEntry(function (log) {
          logEntry = log
        }, filterBy.FilterBy.logLevel('error'))

        await driver.get(Pages.logEntryAdded)
        // Generating info level log but we are filtering by error level
        await driver.findElement({ id: 'consoleLog' }).click()

        assert.equal(logEntry, null)
        await inspector.close()
      })

      it('can listen to javascript log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptLog(function (log) {
          logEntry = log
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        assert.equal(logEntry.text, 'Error: Not working')
        assert.equal(logEntry.type, 'javascript')
        assert.equal(logEntry.level, 'error')

        await inspector.close()
      })

      it('can filter javascript log at error level', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptLog(function (log) {
          logEntry = log
        }, filterBy.FilterBy.logLevel('error'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        assert.equal(logEntry.text, 'Error: Not working')
        assert.equal(logEntry.type, 'javascript')
        assert.equal(logEntry.level, 'error')

        await inspector.close()
      })

      it('can filter javascript log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptLog(function (log) {
          logEntry = log
        }, filterBy.FilterBy.logLevel('info'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        assert.equal(logEntry, null)

        await inspector.close()
      })

      it('can listen to javascript error log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptException(function (log) {
          logEntry = log
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        assert.equal(logEntry.text, 'Error: Not working')
        assert.equal(logEntry.type, 'javascript')
        assert.equal(logEntry.level, 'error')

        await inspector.close()
      })

      it('can retrieve stack trace for a log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptException(function (log) {
          logEntry = log
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        const stackTrace = logEntry.stackTrace
        assert.notEqual(stackTrace, null)
        assert.equal(stackTrace.callFrames.length, 3)

        await inspector.close()
      })

      it('can listen to any log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onLog(function (log) {
          logEntry = log
        })

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        assert.equal(logEntry.text, 'Hello, world!')
        assert.equal(logEntry.realm, null)
        assert.equal(logEntry.type, 'console')
        assert.equal(logEntry.level, 'info')
        assert.equal(logEntry.method, 'log')
        assert.equal(logEntry.stackTrace, null)
        assert.equal(logEntry.args.length, 1)

        await inspector.close()
      })

      it('can filter any log', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onLog(function (log) {
          logEntry = log
        }, filterBy.FilterBy.logLevel('info'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'consoleLog' }).click()

        assert.equal(logEntry.text, 'Hello, world!')
        assert.equal(logEntry.realm, null)
        assert.equal(logEntry.type, 'console')
        assert.equal(logEntry.level, 'info')
        assert.equal(logEntry.method, 'log')
        assert.equal(logEntry.stackTrace, null)
        assert.equal(logEntry.args.length, 1)

        await inspector.close()
      })

      it('can filter any log at error level', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onLog(function (log) {
          logEntry = log
        }, filterBy.FilterBy.logLevel('error'))

        await driver.get(Pages.logEntryAdded)
        await driver.findElement({ id: 'jsException' }).click()

        assert.equal(logEntry.text, 'Error: Not working')
        assert.equal(logEntry.type, 'javascript')
        assert.equal(logEntry.level, 'error')
        await inspector.close()
      })
    })

    describe('Browsing Context', function () {
      it('can create a browsing context for given id', async function () {
        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })
        assert.equal(browsingContext.id, id)
      })

      it('can create a window', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'window',
        })
        assert.notEqual(browsingContext.id, null)
      })

      it('can create a window with a reference context', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'window',
          referenceContext: await driver.getWindowHandle(),
        })
        assert.notEqual(browsingContext.id, null)
      })

      it('can create a tab', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'tab',
        })
        assert.notEqual(browsingContext.id, null)
      })

      it('can create a tab with a reference context', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'tab',
          referenceContext: await driver.getWindowHandle(),
        })
        assert.notEqual(browsingContext.id, null)
      })

      it('can navigate to a url', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'tab',
        })

        let info = await browsingContext.navigate(Pages.logEntryAdded)

        assert.notEqual(browsingContext.id, null)
        assert.equal(info.navigationId, null)
        assert(info.url.includes('/bidi/logEntryAdded.html'))
      })

      it('can navigate to a url with readiness state', async function () {
        const browsingContext = await BrowsingContext(driver, {
          type: 'tab',
        })

        const info = await browsingContext.navigate(
          Pages.logEntryAdded,
          'complete'
        )

        assert.notEqual(browsingContext.id, null)
        assert.equal(info.navigationId, null)
        assert(info.url.includes('/bidi/logEntryAdded.html'))
      })

      it('can get tree with a child', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const parentWindow = await BrowsingContext(driver, {
          browsingContextId: browsingContextId,
        })
        await parentWindow.navigate(Pages.iframePage, 'complete')

        const contextInfo = await parentWindow.getTree()
        assert.equal(contextInfo.children.length, 1)
        assert.equal(contextInfo.id, browsingContextId)
        assert(contextInfo.children[0]['url'].includes('formPage.html'))
      })

      it('can get tree with depth', async function () {
        const browsingContextId = await driver.getWindowHandle()
        const parentWindow = await BrowsingContext(driver, {
          browsingContextId: browsingContextId,
        })
        await parentWindow.navigate(Pages.iframePage, 'complete')

        const contextInfo = await parentWindow.getTree(0)
        assert.equal(contextInfo.children, null)
        assert.equal(contextInfo.id, browsingContextId)
      })

      it('can close a window', async function () {
        const window1 = await BrowsingContext(driver, { type: 'window' })
        const window2 = await BrowsingContext(driver, { type: 'window' })

        await window2.close()

        assert.doesNotThrow(async function () {
          await window1.getTree()
        })
        await assert.rejects(window2.getTree(), { message: 'no such frame' })
      })
    })

    describe('Browsing Context Inspector', function () {
      it('can listen to window browsing context created event', async function () {
        let contextInfo = null
        const browsingConextInspector = await BrowsingConextInspector(driver)
        await browsingConextInspector.onBrowsingContextCreated((entry) => {
          contextInfo = entry
        })

        await driver.switchTo().newWindow('window')
        const windowHandle = await driver.getWindowHandle()
        assert.equal(contextInfo.id, windowHandle)
        assert.equal(contextInfo.url, 'about:blank')
        assert.equal(contextInfo.children, null)
        assert.equal(contextInfo.parentBrowsingContext, null)
      })

      it('can listen to tab browsing context created event', async function () {
        let contextInfo = null
        const browsingConextInspector = await BrowsingConextInspector(driver)
        await browsingConextInspector.onBrowsingContextCreated((entry) => {
          contextInfo = entry
        })

        await driver.switchTo().newWindow('tab')
        const tabHandle = await driver.getWindowHandle()

        assert.equal(contextInfo.id, tabHandle)
        assert.equal(contextInfo.url, 'about:blank')
        assert.equal(contextInfo.children, null)
        assert.equal(contextInfo.parentBrowsingContext, null)
      })

      it('can listen to dom content loaded event', async function () {
        const browsingConextInspector = await BrowsingConextInspector(driver)
        let navigationInfo = null
        await browsingConextInspector.onDomContentLoaded((entry) => {
          navigationInfo = entry
        })

        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: await driver.getWindowHandle(),
        })
        await browsingContext.navigate(Pages.logEntryAdded, 'complete')

        assert.equal(navigationInfo.browsingContextId, browsingContext.id)
        assert(navigationInfo.url.includes('/bidi/logEntryAdded.html'))
      })

      it('can listen to browsing context loaded event', async function () {
        let navigationInfo = null
        const browsingConextInspector = await BrowsingConextInspector(driver)

        await browsingConextInspector.onBrowsingContextLoaded((entry) => {
          navigationInfo = entry
        })
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: await driver.getWindowHandle(),
        })
        await browsingContext.navigate(Pages.logEntryAdded, 'complete')

        assert.equal(navigationInfo.browsingContextId, browsingContext.id)
        assert(navigationInfo.url.includes('/bidi/logEntryAdded.html'))
      })
    })

    describe('Local Value', function () {
      it('can call function with undefined argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let value = new ArgumentValue(LocalValue.createUndefinedValue())
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(arg!==undefined)\n' +
            '                throw Error("Argument should be undefined, but was "+arg);\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'undefined')
      })

      it('can call function with null argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let value = new ArgumentValue(LocalValue.createNullValue())
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(arg!==null)\n' +
            '                throw Error("Argument should be null, but was "+arg);\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'null')
      })

      it('can call function with minus zero argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let value = new ArgumentValue(
          LocalValue.createSpecialNumberValue(SpecialNumberType.MINUS_ZERO)
        )
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(arg!==-0)\n' +
            '                throw Error("Argument should be -0, but was "+arg);\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues
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
        let value = new ArgumentValue(
          LocalValue.createSpecialNumberValue(SpecialNumberType.INFINITY)
        )
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(arg!==Infinity)\n' +
            '                throw Error("Argument should be Infinity, but was "+arg);\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues
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
        let value = new ArgumentValue(
          LocalValue.createSpecialNumberValue(SpecialNumberType.MINUS_INFINITY)
        )
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(arg!==-Infinity)\n' +
            '                throw Error("Argument should be -Infinity, but was "+arg);\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues
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
        let value = new ArgumentValue(LocalValue.createNumberValue(1.4))
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(arg!==1.4)\n' +
            '                throw Error("Argument should be 1.4, but was "+arg);\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues
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
        let value = new ArgumentValue(LocalValue.createBooleanValue(true))
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(arg!==true)\n' +
            '                throw Error("Argument should be true, but was "+arg);\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues
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
        let value = new ArgumentValue(LocalValue.createBigIntValue('42'))
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(arg) => {{\n' +
            '            if(arg!==42n)\n' +
            '                throw Error("Argument should be 42n, but was "+arg);\n' +
            '            return arg;\n' +
            '        }}',
          false,
          argumentValues
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
        let value = new ArgumentValue(LocalValue.createArrayValue(arrayValue))
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
          argumentValues
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
        let value = new ArgumentValue(LocalValue.createSetValue(setValue))
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
          argumentValues
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
        let value = new ArgumentValue(
          LocalValue.createDateValue('2022-05-31T13:47:29.000Z')
        )
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
          argumentValues
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
        let value = new ArgumentValue(LocalValue.createMapValue(mapValue))
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
          argumentValues
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'map')
        assert.notEqual(result.result.value, null)

        let resultValue = result.result.value

        assert.equal(Object.keys(resultValue).length, 1)
        assert.equal(resultValue['foobar'].type, 'string')
        assert.equal(resultValue['foobar'].value, 'foobar')
      })

      it('can call function with object argument', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)
        let argumentValues = []
        let mapValue = { foobar: LocalValue.createStringValue('foobar') }
        let value = new ArgumentValue(LocalValue.createObjectValue(mapValue))
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
          argumentValues
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
        let value = new ArgumentValue(
          LocalValue.createRegularExpressionValue(new RegExpValue('foo', 'g'))
        )
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
          argumentValues
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

    describe('Script Manager', function () {
      it('can call function with declaration', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '()=>{return 1+2;}',
          false
        )
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'number')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value, 3)
      })

      it('can call function with arguments', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)

        let argumentValues = []
        let value1 = new ArgumentValue(
          LocalValue.createStringValue('ARGUMENT_STRING_VALUE')
        )
        let value2 = new ArgumentValue(LocalValue.createNumberValue(42))
        argumentValues.push(value1)
        argumentValues.push(value2)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(...args)=>{return args}',
          false,
          argumentValues
        )
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'array')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value.length, 2)
      })

      it('can call function with await promise', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          'async function() {{\n' +
            '            await new Promise(r => setTimeout(() => r(), 0));\n' +
            '            return "SOME_DELAYED_RESULT";\n' +
            '          }}',
          true
        )
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'string')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value, 'SOME_DELAYED_RESULT')
      })

      it('can call function with await promise false', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          'async function() {{\n' +
            '            await new Promise(r => setTimeout(() => r(), 0));\n' +
            '            return "SOME_DELAYED_RESULT";\n' +
            '          }}',
          false
        )
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'promise')
        assert.equal(result.result.value, undefined)
      })

      it('can call function with this parameter', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)

        let mapValue = { some_property: LocalValue.createNumberValue(42) }
        let thisParameter = new ArgumentValue(
          LocalValue.createObjectValue(mapValue)
        ).asMap()

        const result = await manager.callFunctionInBrowsingContext(
          id,
          'function(){return this.some_property}',
          false,
          null,
          thisParameter
        )
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'number')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value, 42)
      })

      it('can call function with ownership root', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          'async function(){return {a:1}}',
          true,
          null,
          null,
          ResultOwnership.ROOT
        )
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.notEqual(result.result.handle, null)
        assert.notEqual(result.result.value, null)
      })

      it('can call function with ownership none', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          'async function(){return {a:1}}',
          true,
          null,
          null,
          ResultOwnership.NONE
        )
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.handle, undefined)
        assert.notEqual(result.result.value, null)
      })

      it('can call function that throws exception', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '))) !!@@## some invalid JS script (((',
          false
        )
        assert.equal(result.resultType, EvaluateResultType.EXCEPTION)
        assert.notEqual(result.realmId, null)

        assert.equal(result.exceptionDetails.exception.type, 'error')
        assert.equal(
          result.exceptionDetails.text,
          "SyntaxError: expected expression, got ')'"
        )
        assert.equal(result.exceptionDetails.lineNumber, 285)
        assert.equal(result.exceptionDetails.columnNumber, 39)
        assert.equal(result.exceptionDetails.stackTrace.callFrames.length, 0)
      })

      it('can call function in a sandbox', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)

        // Make changes without sandbox
        await manager.callFunctionInBrowsingContext(
          id,
          '() => { window.foo = 1; }',
          true
        )

        // Check changes are not present in the sandbox
        const resultNotInSandbox = await manager.callFunctionInBrowsingContext(
          id,
          '() => window.foo',
          true,
          null,
          null,
          null,
          'sandbox'
        )

        assert.equal(resultNotInSandbox.resultType, EvaluateResultType.SUCCESS)
        assert.equal(resultNotInSandbox.result.type, 'undefined')

        // Make changes in the sandbox

        await manager.callFunctionInBrowsingContext(
          id,
          '() => { window.foo = 2; }',
          true,
          null,
          null,
          null,
          'sandbox'
        )

        // Check if the changes are present in the sandbox

        const resultInSandbox = await manager.callFunctionInBrowsingContext(
          id,
          '() => window.foo',
          true,
          null,
          null,
          null,
          'sandbox'
        )

        assert.equal(resultInSandbox.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(resultInSandbox.realmId, null)

        assert.equal(resultInSandbox.result.type, 'number')
        assert.notEqual(resultInSandbox.result.value, null)
        assert.equal(resultInSandbox.result.value, 2)
      })

      it('can call function in a realm', async function () {
        const firstTab = await driver.getWindowHandle()
        await driver.switchTo().newWindow('tab')
        const manager = await ScriptManager(firstTab, driver)

        const realms = await manager.getAllRealms()
        const firstTabRealmId = realms[0].realmId
        const secondTabRealmId = realms[1].realmId

        await manager.callFunctionInRealm(
          firstTabRealmId,
          '() => { window.foo = 3; }',
          true
        )

        await manager.callFunctionInRealm(
          secondTabRealmId,
          '() => { window.foo = 5; }',
          true
        )

        const firstContextResult = await manager.callFunctionInRealm(
          firstTabRealmId,
          '() => window.foo',
          true
        )

        assert.equal(firstContextResult.resultType, EvaluateResultType.SUCCESS)
        assert.equal(firstContextResult.result.type, 'number')
        assert.notEqual(firstContextResult.result.value, null)
        assert.equal(firstContextResult.result.value, 3)

        const secondContextResult = await manager.callFunctionInRealm(
          secondTabRealmId,
          '() => window.foo',
          true
        )

        assert.equal(secondContextResult.resultType, EvaluateResultType.SUCCESS)
        assert.equal(secondContextResult.result.type, 'number')
        assert.notEqual(secondContextResult.result.value, null)
        assert.equal(secondContextResult.result.value, 5)
      })

      it('can evaluate script', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)

        const result = await manager.evaluateFunctionInBrowsingContext(
          id,
          '1 + 2',
          true
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'number')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value, 3)
      })

      it('can evaluate script that throws exception', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)

        const result = await manager.evaluateFunctionInBrowsingContext(
          id,
          '))) !!@@## some invalid JS script (((',
          false
        )

        assert.equal(result.resultType, EvaluateResultType.EXCEPTION)
        assert.notEqual(result.realmId, null)

        assert.equal(result.exceptionDetails.exception.type, 'error')
        assert.equal(
          result.exceptionDetails.text,
          "SyntaxError: expected expression, got ')'"
        )
        assert.equal(result.exceptionDetails.lineNumber, 251)
        assert.equal(result.exceptionDetails.columnNumber, 39)
        assert.equal(result.exceptionDetails.stackTrace.callFrames.length, 0)
      })

      it('can evaluate script with result ownership', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)

        const result = await manager.evaluateFunctionInBrowsingContext(
          id,
          'Promise.resolve({a:1})',
          true,
          ResultOwnership.ROOT
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'object')
        assert.notEqual(result.result.value, null)
        assert.notEqual(result.result.handle, null)
      })

      it('can evaluate in a sandbox', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)

        // Make changes without sandbox
        await manager.evaluateFunctionInBrowsingContext(
          id,
          'window.foo = 1',
          true
        )

        // Check changes are not present in the sandbox
        const resultNotInSandbox =
          await manager.evaluateFunctionInBrowsingContext(
            id,
            'window.foo',
            true,
            null,
            'sandbox'
          )

        assert.equal(resultNotInSandbox.resultType, EvaluateResultType.SUCCESS)
        assert.equal(resultNotInSandbox.result.type, 'undefined')

        // Make changes in the sandbox
        await manager.evaluateFunctionInBrowsingContext(
          id,
          'window.foo = 2',
          true,
          null,
          'sandbox'
        )

        const resultInSandbox = await manager.evaluateFunctionInBrowsingContext(
          id,
          'window.foo',
          true,
          null,
          'sandbox'
        )

        assert.equal(resultInSandbox.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(resultInSandbox.realmId, null)

        assert.equal(resultInSandbox.result.type, 'number')
        assert.notEqual(resultInSandbox.result.value, null)
        assert.equal(resultInSandbox.result.value, 2)
      })

      it('can evaluate in a realm', async function () {
        const firstTab = await driver.getWindowHandle()
        await driver.switchTo().newWindow('tab')
        const secondTab = await driver.getWindowHandle()
        const manager = await ScriptManager(firstTab, driver)

        const realms = await manager.getAllRealms()
        const firstTabRealmId = realms[0].realmId
        const secondTabRealmId = realms[1].realmId

        await manager.evaluateFunctionInRealm(
          firstTabRealmId,
          'window.foo = 3',
          true
        )

        await manager.evaluateFunctionInRealm(
          secondTabRealmId,
          'window.foo = 5',
          true
        )

        const firstContextResult = await manager.evaluateFunctionInRealm(
          firstTabRealmId,
          'window.foo',
          true
        )

        assert.equal(firstContextResult.resultType, EvaluateResultType.SUCCESS)
        assert.equal(firstContextResult.result.type, 'number')
        assert.notEqual(firstContextResult.result.value, null)
        assert.equal(firstContextResult.result.value, 3)

        const secondContextResult = await manager.evaluateFunctionInRealm(
          secondTabRealmId,
          'window.foo',
          true
        )

        assert.equal(secondContextResult.resultType, EvaluateResultType.SUCCESS)
        assert.equal(secondContextResult.result.type, 'number')
        assert.notEqual(secondContextResult.result.value, null)
        assert.equal(secondContextResult.result.value, 5)
      })

      it('can disown handles', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)

        const evaluateResult = await manager.evaluateFunctionInBrowsingContext(
          id,
          '({a:1})',
          false,
          ResultOwnership.ROOT
        )

        assert.equal(evaluateResult.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(evaluateResult.realmId, null)
        assert.notEqual(evaluateResult.result.handle, null)

        let argumentValues = []
        let valueMap = evaluateResult.result.value

        let value1 = new ArgumentValue(LocalValue.createObjectValue(valueMap))
        let value2 = new ArgumentValue(
          new ReferenceValue(
            RemoteReferenceType.HANDLE,
            evaluateResult.result.handle
          )
        )
        argumentValues.push(value1)
        argumentValues.push(value2)

        await manager.callFunctionInBrowsingContext(
          id,
          'arg => arg.a',
          false,
          argumentValues
        )

        assert.notEqual(evaluateResult.result.value, null)

        let handles = [evaluateResult.result.handle]
        await manager.disownBrowsingContextScript(id, handles)

        await manager
          .callFunctionInBrowsingContext(
            id,
            'arg => arg.a',
            false,
            argumentValues
          )
          .catch((error) => {
            assert(error instanceof TypeError)
          })
      })

      it('can disown handles in realm', async function () {
        const id = await driver.getWindowHandle()
        const manager = await ScriptManager(id, driver)

        const evaluateResult = await manager.evaluateFunctionInBrowsingContext(
          id,
          '({a:1})',
          false,
          ResultOwnership.ROOT
        )

        assert.equal(evaluateResult.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(evaluateResult.realmId, null)
        assert.notEqual(evaluateResult.result.handle, null)

        let argumentValues = []
        let valueMap = evaluateResult.result.value

        let value1 = new ArgumentValue(LocalValue.createObjectValue(valueMap))
        let value2 = new ArgumentValue(
          new ReferenceValue(
            RemoteReferenceType.HANDLE,
            evaluateResult.result.handle
          )
        )
        argumentValues.push(value1)
        argumentValues.push(value2)

        await manager.callFunctionInBrowsingContext(
          id,
          'arg => arg.a',
          false,
          argumentValues
        )

        assert.notEqual(evaluateResult.result.value, null)

        let handles = [evaluateResult.result.handle]
        await manager.disownRealmScript(evaluateResult.realmId, handles)

        await manager
          .callFunctionInBrowsingContext(
            id,
            'arg => arg.a',
            false,
            argumentValues
          )
          .catch((error) => {
            assert(error instanceof TypeError)
          })
      })

      it('can get all realms', async function () {
        const firstWindow = await driver.getWindowHandle()
        await driver.switchTo().newWindow('window')
        const secondWindow = await driver.getWindowHandle()
        const manager = await ScriptManager(firstWindow, driver)

        const realms = await manager.getAllRealms()
        assert.equal(realms.length, 2)

        const firstWindowRealm = realms[0]
        assert.equal(firstWindowRealm.realmType, RealmType.WINDOW)
        assert.notEqual(firstWindowRealm.realmId, null)
        assert.equal(firstWindowRealm.browsingContext, firstWindow)

        const secondWindowRealm = realms[1]
        assert.equal(secondWindowRealm.realmType, RealmType.WINDOW)
        assert.notEqual(secondWindowRealm.realmId, null)
        assert.equal(secondWindowRealm.browsingContext, secondWindow)
      })

      it('can get realm by type', async function () {
        const firstWindow = await driver.getWindowHandle()
        await driver.switchTo().newWindow('window')
        const secondWindow = await driver.getWindowHandle()
        const manager = await ScriptManager(firstWindow, driver)

        const realms = await manager.getRealmsByType(RealmType.WINDOW)
        assert.equal(realms.length, 2)

        const firstWindowRealm = realms[0]
        assert.equal(firstWindowRealm.realmType, RealmType.WINDOW)
        assert.notEqual(firstWindowRealm.realmId, null)
        assert.equal(firstWindowRealm.browsingContext, firstWindow)

        const secondWindowRealm = realms[1]
        assert.equal(secondWindowRealm.realmType, RealmType.WINDOW)
        assert.notEqual(secondWindowRealm.realmId, null)
        assert.equal(secondWindowRealm.browsingContext, secondWindow)
      })

      it('can get realm in browsing context', async function () {
        const windowId = await driver.getWindowHandle()
        await driver.switchTo().newWindow('tab')
        const tabId = await driver.getWindowHandle()
        const manager = await ScriptManager(windowId, driver)

        const realms = await manager.getRealmsInBrowsingContext(tabId)

        const tabRealm = realms[0]
        assert.equal(tabRealm.realmType, RealmType.WINDOW)
        assert.notEqual(tabRealm.realmId, null)
        assert.equal(tabRealm.browsingContext, tabId)
      })

      it('can get realm in browsing context by type', async function () {
        const windowId = await driver.getWindowHandle()
        await driver.switchTo().newWindow('tab')
        const manager = await ScriptManager(windowId, driver)

        const realms = await manager.getRealmsInBrowsingContextByType(
          windowId,
          RealmType.WINDOW
        )

        const windowRealm = realms[0]
        assert.equal(windowRealm.realmType, RealmType.WINDOW)
        assert.notEqual(windowRealm.realmId, null)
        assert.equal(windowRealm.browsingContext, windowId)
      })
    })

    describe('Integration Tests', function () {
      it('can navigate and listen to errors', async function () {
        let logEntry = null
        const inspector = await logInspector(driver)
        await inspector.onJavascriptException(function (log) {
          logEntry = log
        })

        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })
        const info = await browsingContext.navigate(Pages.logEntryAdded)

        assert.notEqual(browsingContext.id, null)
        assert.equal(info.navigationId, null)
        assert(info.url.includes('/bidi/logEntryAdded.html'))

        await driver.wait(until.urlIs(Pages.logEntryAdded))
        await driver.findElement({ id: 'jsException' }).click()

        assert.equal(logEntry.text, 'Error: Not working')
        assert.equal(logEntry.type, 'javascript')
        assert.equal(logEntry.level, 'error')

        await inspector.close()
        await browsingContext.close()
      })
    })
  },
  { browsers: [Browser.FIREFOX] }
)
