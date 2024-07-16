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
const { Browser } = require('selenium-webdriver')
const { Pages, suite } = require('../../lib/test')
const BrowsingContext = require('selenium-webdriver/bidi/browsingContext')
const ScriptManager = require('selenium-webdriver/bidi/scriptManager')
const {
  ChannelValue,
  LocalValue,
  ReferenceValue,
  RemoteReferenceType,
} = require('selenium-webdriver/bidi/protocolValue')
const { ArgumentValue } = require('selenium-webdriver/bidi/argumentValue')
const { EvaluateResultType } = require('selenium-webdriver/bidi/evaluateResult')
const { ResultOwnership } = require('selenium-webdriver/bidi/resultOwnership')
const { RealmType } = require('selenium-webdriver/bidi/realmInfo')
const { WebDriverError } = require('selenium-webdriver/lib/error')

suite(
  function (env) {
    let driver
    let manager

    beforeEach(async function () {
      driver = await env.builder().build()
    })

    afterEach(async function () {
      await manager.close()
      await driver.quit()
    })

    describe('Script Manager', function () {
      it('can call function with declaration', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        const result = await manager.callFunctionInBrowsingContext(id, '()=>{return 1+2;}', false)
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'number')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value, 3)
      })

      it('can call function to get iframe browsing context', async function () {
        await driver.get(Pages.iframePage)
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '() => document.querySelector(\'iframe[id="iframe1"]\').contentWindow',
          false,
        )
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'window')
        assert.notEqual(result.result.value, null)
        assert.notEqual(result.result.value.context, null)
      })

      it('can call function to get element', async function () {
        await driver.get(Pages.logEntryAdded)
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '() => document.getElementById("consoleLog")',
          false,
        )
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'node')
        assert.notEqual(result.result.value, null)
        assert.notEqual(result.result.value.nodeType, null)
      })

      it('can call function with arguments', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        let argumentValues = []
        let value1 = LocalValue.createStringValue('ARGUMENT_STRING_VALUE')
        let value2 = LocalValue.createNumberValue(42)
        argumentValues.push(value1)
        argumentValues.push(value2)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          '(...args)=>{return args}',
          false,
          argumentValues,
        )
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'array')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value.length, 2)
      })

      it('can call function with await promise', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          'async function() {{\n' +
            '            await new Promise(r => setTimeout(() => r(), 0));\n' +
            '            return "SOME_DELAYED_RESULT";\n' +
            '          }}',
          true,
        )
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'string')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value, 'SOME_DELAYED_RESULT')
      })

      it('can call function with await promise false', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          'async function() {{\n' +
            '            await new Promise(r => setTimeout(() => r(), 0));\n' +
            '            return "SOME_DELAYED_RESULT";\n' +
            '          }}',
          false,
        )
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'promise')
        assert.equal(result.result.value, undefined)
      })

      it('can call function with this parameter', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        let mapValue = { some_property: LocalValue.createNumberValue(42) }
        let thisParameter = LocalValue.createObjectValue(mapValue).asMap()

        const result = await manager.callFunctionInBrowsingContext(
          id,
          'function(){return this.some_property}',
          false,
          null,
          thisParameter,
        )
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'number')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value, 42)
      })

      it('can call function with ownership root', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          'async function(){return {a:1}}',
          true,
          null,
          null,
          ResultOwnership.ROOT,
        )
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.notEqual(result.result.handle, null)
        assert.notEqual(result.result.value, null)
      })

      it('can call function with ownership none', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        const result = await manager.callFunctionInBrowsingContext(
          id,
          'async function(){return {a:1}}',
          true,
          null,
          null,
          ResultOwnership.NONE,
        )
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.handle, undefined)
        assert.notEqual(result.result.value, null)
      })

      it('can call function that throws exception', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        const result = await manager.callFunctionInBrowsingContext(id, '))) !!@@## some invalid JS script (((', false)
        assert.equal(result.resultType, EvaluateResultType.EXCEPTION)
        assert.notEqual(result.realmId, null)

        assert.equal(result.exceptionDetails.exception.type, 'error')
        assert.equal(result.exceptionDetails.text.includes('SyntaxError:'), true)
        assert.notEqual(result.exceptionDetails.columnNumber, null)
        assert.equal(result.exceptionDetails.stackTrace.callFrames.length, 0)
      })

      it('can call function in a sandbox', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        // Make changes without sandbox
        await manager.callFunctionInBrowsingContext(id, '() => { window.foo = 1; }', true)

        // Check changes are not present in the sandbox
        const resultNotInSandbox = await manager.callFunctionInBrowsingContext(
          id,
          '() => window.foo',
          true,
          null,
          null,
          null,
          'sandbox',
        )

        assert.equal(resultNotInSandbox.resultType, EvaluateResultType.SUCCESS)
        assert.equal(resultNotInSandbox.result.type, 'undefined')

        // Make changes in the sandbox

        await manager.callFunctionInBrowsingContext(id, '() => { window.foo = 2; }', true, null, null, null, 'sandbox')

        // Check if the changes are present in the sandbox

        const resultInSandbox = await manager.callFunctionInBrowsingContext(
          id,
          '() => window.foo',
          true,
          null,
          null,
          null,
          'sandbox',
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
        manager = await ScriptManager(firstTab, driver)

        const realms = await manager.getAllRealms()
        const firstTabRealmId = realms[0].realmId
        const secondTabRealmId = realms[1].realmId

        await manager.callFunctionInRealm(firstTabRealmId, '() => { window.foo = 3; }', true)

        await manager.callFunctionInRealm(secondTabRealmId, '() => { window.foo = 5; }', true)

        const firstContextResult = await manager.callFunctionInRealm(firstTabRealmId, '() => window.foo', true)

        assert.equal(firstContextResult.resultType, EvaluateResultType.SUCCESS)
        assert.equal(firstContextResult.result.type, 'number')
        assert.notEqual(firstContextResult.result.value, null)
        assert.equal(firstContextResult.result.value, 3)

        const secondContextResult = await manager.callFunctionInRealm(secondTabRealmId, '() => window.foo', true)

        assert.equal(secondContextResult.resultType, EvaluateResultType.SUCCESS)
        assert.equal(secondContextResult.result.type, 'number')
        assert.notEqual(secondContextResult.result.value, null)
        assert.equal(secondContextResult.result.value, 5)
      })

      it('can evaluate script', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        const result = await manager.evaluateFunctionInBrowsingContext(id, '1 + 2', true)

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'number')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value, 3)
      })

      it('can evaluate script that throws exception', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        const result = await manager.evaluateFunctionInBrowsingContext(
          id,
          '))) !!@@## some invalid JS script (((',
          false,
        )

        assert.equal(result.resultType, EvaluateResultType.EXCEPTION)
        assert.notEqual(result.realmId, null)

        assert.equal(result.exceptionDetails.exception.type, 'error')
        assert.equal(result.exceptionDetails.text.includes('SyntaxError:'), true)
        assert.notEqual(result.exceptionDetails.columnNumber, null)
        assert.equal(result.exceptionDetails.stackTrace.callFrames.length, 0)
      })

      it('can evaluate script with result ownership', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        const result = await manager.evaluateFunctionInBrowsingContext(
          id,
          'Promise.resolve({a:1})',
          true,
          ResultOwnership.ROOT,
        )

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'object')
        assert.notEqual(result.result.value, null)
        assert.notEqual(result.result.handle, null)
      })

      it('can evaluate in a sandbox', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        // Make changes without sandbox
        await manager.evaluateFunctionInBrowsingContext(id, 'window.foo = 1', true)

        // Check changes are not present in the sandbox
        const resultNotInSandbox = await manager.evaluateFunctionInBrowsingContext(
          id,
          'window.foo',
          true,
          null,
          'sandbox',
        )

        assert.equal(resultNotInSandbox.resultType, EvaluateResultType.SUCCESS)
        assert.equal(resultNotInSandbox.result.type, 'undefined')

        // Make changes in the sandbox
        await manager.evaluateFunctionInBrowsingContext(id, 'window.foo = 2', true, null, 'sandbox')

        const resultInSandbox = await manager.evaluateFunctionInBrowsingContext(id, 'window.foo', true, null, 'sandbox')

        assert.equal(resultInSandbox.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(resultInSandbox.realmId, null)

        assert.equal(resultInSandbox.result.type, 'number')
        assert.notEqual(resultInSandbox.result.value, null)
        assert.equal(resultInSandbox.result.value, 2)
      })

      it('can evaluate in a realm', async function () {
        const firstTab = await driver.getWindowHandle()
        await driver.switchTo().newWindow('tab')
        manager = await ScriptManager(firstTab, driver)

        const realms = await manager.getAllRealms()
        const firstTabRealmId = realms[0].realmId
        const secondTabRealmId = realms[1].realmId

        await manager.evaluateFunctionInRealm(firstTabRealmId, 'window.foo = 3', true)

        await manager.evaluateFunctionInRealm(secondTabRealmId, 'window.foo = 5', true)

        const firstContextResult = await manager.evaluateFunctionInRealm(firstTabRealmId, 'window.foo', true)

        assert.equal(firstContextResult.resultType, EvaluateResultType.SUCCESS)
        assert.equal(firstContextResult.result.type, 'number')
        assert.notEqual(firstContextResult.result.value, null)
        assert.equal(firstContextResult.result.value, 3)

        const secondContextResult = await manager.evaluateFunctionInRealm(secondTabRealmId, 'window.foo', true)

        assert.equal(secondContextResult.resultType, EvaluateResultType.SUCCESS)
        assert.equal(secondContextResult.result.type, 'number')
        assert.notEqual(secondContextResult.result.value, null)
        assert.equal(secondContextResult.result.value, 5)
      })

      it('can disown handles', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        const evaluateResult = await manager.evaluateFunctionInBrowsingContext(
          id,
          '({a:1})',
          false,
          ResultOwnership.ROOT,
        )

        assert.equal(evaluateResult.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(evaluateResult.realmId, null)
        assert.notEqual(evaluateResult.result.handle, null)

        let argumentValues = []
        let valueMap = evaluateResult.result.value

        let value1 = LocalValue.createObjectValue(valueMap)
        let value2 = new ReferenceValue(RemoteReferenceType.HANDLE, evaluateResult.result.handle)
        argumentValues.push(value1)
        argumentValues.push(value2)

        await manager.callFunctionInBrowsingContext(id, 'arg => arg.a', false, argumentValues)

        assert.notEqual(evaluateResult.result.value, null)

        let handles = [evaluateResult.result.handle]
        await manager.disownBrowsingContextScript(id, handles)

        await manager.callFunctionInBrowsingContext(id, 'arg => arg.a', false, argumentValues).catch((error) => {
          assert(error instanceof TypeError)
        })
      })

      it('can disown handles in realm', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        const evaluateResult = await manager.evaluateFunctionInBrowsingContext(
          id,
          '({a:1})',
          false,
          ResultOwnership.ROOT,
        )

        assert.equal(evaluateResult.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(evaluateResult.realmId, null)
        assert.notEqual(evaluateResult.result.handle, null)

        let argumentValues = []
        let valueMap = evaluateResult.result.value

        let value1 = LocalValue.createObjectValue(valueMap)
        let value2 = new ReferenceValue(RemoteReferenceType.HANDLE, evaluateResult.result.handle)
        argumentValues.push(value1)
        argumentValues.push(value2)

        await manager.callFunctionInBrowsingContext(id, 'arg => arg.a', false, argumentValues)

        assert.notEqual(evaluateResult.result.value, null)

        let handles = [evaluateResult.result.handle]
        await manager.disownRealmScript(evaluateResult.realmId, handles)

        await manager.callFunctionInBrowsingContext(id, 'arg => arg.a', false, argumentValues).catch((error) => {
          assert(error instanceof TypeError)
        })
      })

      it('can get all realms', async function () {
        const firstWindow = await driver.getWindowHandle()
        await driver.switchTo().newWindow('window')
        const secondWindow = await driver.getWindowHandle()
        manager = await ScriptManager(firstWindow, driver)

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
        manager = await ScriptManager(firstWindow, driver)

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
        manager = await ScriptManager(windowId, driver)

        const realms = await manager.getRealmsInBrowsingContext(tabId)

        const tabRealm = realms[0]
        assert.equal(tabRealm.realmType, RealmType.WINDOW)
        assert.notEqual(tabRealm.realmId, null)
        assert.equal(tabRealm.browsingContext, tabId)
      })

      it('can get realm in browsing context by type', async function () {
        const windowId = await driver.getWindowHandle()
        await driver.switchTo().newWindow('tab')
        manager = await ScriptManager(windowId, driver)

        const realms = await manager.getRealmsInBrowsingContextByType(windowId, RealmType.WINDOW)

        const windowRealm = realms[0]
        assert.equal(windowRealm.realmType, RealmType.WINDOW)
        assert.notEqual(windowRealm.realmId, null)
        assert.equal(windowRealm.browsingContext, windowId)
      })

      it('can add preload script test', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager([], driver)

        await manager.addPreloadScript("() => { window.foo='bar'; }")

        // Check that preload script didn't apply the changes to the current context
        let result = await manager.evaluateFunctionInBrowsingContext(id, 'window.foo', true)
        assert.equal(result.result.type, 'undefined')

        await driver.switchTo().newWindow('window')
        const new_window_id = await driver.getWindowHandle()

        // Check that preload script applied the changes to the window
        result = await manager.evaluateFunctionInBrowsingContext(new_window_id, 'window.foo', true)

        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(result.realmId, null)
        assert.equal(result.result.type, 'string')
        assert.notEqual(result.result.value, null)
        assert.equal(result.result.value, 'bar')

        const browsingContext = await BrowsingContext(driver, {
          type: 'tab',
        })

        await browsingContext.navigate(Pages.logEntryAdded, 'complete')

        // Check that preload script was applied after navigation
        result = await manager.evaluateFunctionInBrowsingContext(new_window_id, 'window.foo', true)

        assert.equal(result.result.type, 'string')
        assert.equal(result.result.value, 'bar')
      })

      it('can add same preload script twice', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        const script_1 = await manager.addPreloadScript('() => { return 42; }')
        const script_2 = await manager.addPreloadScript('() => { return 42; }')

        assert.notEqual(script_1, script_2)
      })

      it('can access preload script properties', async function () {
        manager = await ScriptManager([], driver)

        await manager.addPreloadScript('() => { window.preloadScriptFunction = () => window.baz = 42; }')

        await driver.switchTo().newWindow('tab')
        const new_tab_id = await driver.getWindowHandle()
        await driver.get(Pages.scriptTestAccessProperty)

        const result = await manager.evaluateFunctionInBrowsingContext(new_tab_id, 'window.baz', true)

        assert.equal(result.result.type, 'number')
        assert.equal(result.result.value, 42)
      })

      it('can add preload script to sandbox', async function () {
        manager = await ScriptManager([], driver)

        await manager.addPreloadScript('() => { window.foo = 1; }')
        await manager.addPreloadScript('() => { window.bar = 2; }', [], 'sandbox')

        await driver.switchTo().newWindow('tab')
        const new_tab_id = await driver.getWindowHandle()

        let result_in_sandbox = await manager.evaluateFunctionInBrowsingContext(
          new_tab_id,
          'window.foo',
          true,
          null,
          'sandbox',
        )

        assert.equal(result_in_sandbox.result.type, 'undefined')

        let result = await manager.evaluateFunctionInBrowsingContext(new_tab_id, 'window.bar', true)

        assert.equal(result.result.type, 'undefined')

        result_in_sandbox = await manager.evaluateFunctionInBrowsingContext(
          new_tab_id,
          'window.bar',
          true,
          null,
          'sandbox',
        )

        assert.equal(result_in_sandbox.result.type, 'number')
        assert.equal(result_in_sandbox.result.value, 2)
      })

      it('can remove properties set by preload script', async function () {
        manager = await ScriptManager([], driver)

        await manager.addPreloadScript('() => { window.foo = 42; }')
        await manager.addPreloadScript('() => { window.foo = 50; }', [], 'sandbox_1')

        await driver.switchTo().newWindow('tab')
        const new_tab_id = await driver.getWindowHandle()
        await driver.get(Pages.scriptTestRemoveProperty)

        let result = await manager.evaluateFunctionInBrowsingContext(new_tab_id, 'window.foo', true)
        assert.equal(result.result.type, 'undefined')

        result = await manager.evaluateFunctionInBrowsingContext(new_tab_id, 'window.foo', true, null, 'sandbox_1')
        assert.equal(result.result.type, 'number')
        assert.equal(result.result.value, 50)
      })

      it('can remove preload script', async function () {
        manager = await ScriptManager([], driver)

        let script = await manager.addPreloadScript("() => { window.foo='bar'; }")

        await driver.switchTo().newWindow('tab')
        const tab_1_id = await driver.getWindowHandle()

        let result = await manager.evaluateFunctionInBrowsingContext(tab_1_id, 'window.foo', true)

        assert.equal(result.result.type, 'string')
        assert.equal(result.result.value, 'bar')

        await manager.removePreloadScript(script)

        await driver.switchTo().newWindow('tab')
        const tab_2_id = await driver.getWindowHandle()

        // Check that changes from preload script were not applied after script was removed
        result = await manager.evaluateFunctionInBrowsingContext(tab_2_id, 'window.foo', true)

        assert.equal(result.result.type, 'undefined')
      })

      it('cannot remove same preload script twice', async function () {
        manager = await ScriptManager([], driver)

        let script = await manager.addPreloadScript("() => { window.foo='bar'; }")

        await manager.removePreloadScript(script)

        await manager.removePreloadScript(script).catch((error) => {
          assert(error instanceof WebDriverError)
        })
      })

      it('can remove one of preload script', async function () {
        manager = await ScriptManager([], driver)

        let script_1 = await manager.addPreloadScript("() => { window.bar='foo'; }")

        let script_2 = await manager.addPreloadScript("() => { window.baz='bar'; }")

        await manager.removePreloadScript(script_1)

        await driver.switchTo().newWindow('tab')
        const new_tab_id = await driver.getWindowHandle()

        // Check that the first script didn't run
        let result = await manager.evaluateFunctionInBrowsingContext(new_tab_id, 'window.bar', true)

        assert.equal(result.result.type, 'undefined')

        // Check that the second script still applied the changes to the window
        result = await manager.evaluateFunctionInBrowsingContext(new_tab_id, 'window.baz', true)

        assert.equal(result.result.type, 'string')
        assert.equal(result.result.value, 'bar')

        // Clean up the second script
        await manager.removePreloadScript(script_2)
      })

      it('can remove one of preload script from sandbox', async function () {
        const id = await driver.getWindowHandle()
        manager = await ScriptManager(id, driver)

        let script_1 = await manager.addPreloadScript('() => { window.foo = 1; }')

        let script_2 = await manager.addPreloadScript('() => { window.bar = 2; }', [], 'sandbox')

        // Remove first preload script
        await manager.removePreloadScript(script_1)

        // Remove second preload script
        await manager.removePreloadScript(script_2)

        await driver.switchTo().newWindow('tab')
        const new_tab_id = await driver.getWindowHandle()

        // Make sure that changes from first preload script were not applied
        let result_in_window = await manager.evaluateFunctionInBrowsingContext(new_tab_id, 'window.foo', true)

        assert.equal(result_in_window.result.type, 'undefined')

        // Make sure that changes from second preload script were not applied
        let result_in_sandbox = await manager.evaluateFunctionInBrowsingContext(
          new_tab_id,
          'window.bar',
          true,
          null,
          'sandbox',
        )

        assert.equal(result_in_sandbox.result.type, 'undefined')
      })

      it('can listen to channel message', async function () {
        manager = await ScriptManager(undefined, driver)

        let message = null

        await manager.onMessage((m) => {
          message = m
        })

        let argumentValues = []
        let value = LocalValue.createChannelValue(new ChannelValue('channel_name'))
        argumentValues.push(value)

        const result = await manager.callFunctionInBrowsingContext(
          await driver.getWindowHandle(),
          '(channel) => channel("foo")',
          false,
          argumentValues,
        )
        assert.equal(result.resultType, EvaluateResultType.SUCCESS)
        assert.notEqual(message, null)
        assert.equal(message.channel, 'channel_name')
        assert.equal(message.data.type, 'string')
        assert.equal(message.data.value, 'foo')
      })

      it('can listen to realm created message', async function () {
        manager = await ScriptManager(undefined, driver)

        let realmInfo = null

        await manager.onRealmCreated((result) => {
          realmInfo = result
        })

        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        await browsingContext.navigate(Pages.blankPage, 'complete')

        assert.notEqual(realmInfo, null)
        assert.notEqual(realmInfo.realmId, null)
        assert.equal(realmInfo.realmType, RealmType.WINDOW)
      })

      xit('can listen to realm destroyed message', async function () {
        manager = await ScriptManager(undefined, driver)

        let realmInfo = null

        await manager.onRealmDestroyed((result) => {
          realmInfo = result
        })

        const id = await driver.getWindowHandle()
        const browsingContext = await BrowsingContext(driver, {
          browsingContextId: id,
        })

        await browsingContext.close()

        assert.notEqual(realmInfo, null)
        assert.notEqual(realmInfo.realmId, null)
        assert.equal(realmInfo.realmType, RealmType.WINDOW)
      })
    })
  },
  { browsers: [Browser.FIREFOX, Browser.CHROME, Browser.EDGE] },
)
