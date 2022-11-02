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

const {
  StubError,
  assertIsInstance,
  assertIsStubError,
  throwStubError,
} = require('./testutil')

const error = require('../../lib/error')
const logging = require('../../lib/logging')
const promise = require('../../lib/promise')
const until = require('../../lib/until')
const {
  Alert,
  AlertPromise,
  WebDriver,
  WebElement,
  WebElementPromise,
} = require('../../lib/webdriver')
const { By } = require('../../lib/by')
const { Capabilities } = require('../../lib/capabilities')
const { Name } = require('../../lib/command')
const { Session } = require('../../lib/session')
const assert = require('assert')

const CName = Name
const SESSION_ID = 'test_session_id'
const fail = (msg) => assert.fail(msg)

describe('WebDriver', function () {
  const LOG = logging.getLogger('webdriver.test')

  function defer() {
    let d = {}
    let promise = new Promise((resolve, reject) => {
      Object.assign(d, { resolve, reject })
    })
    d.promise = promise
    return d
  }

  function expectedError(ctor, message) {
    return function (e) {
      assertIsInstance(ctor, e)
      assert.strictEqual(message, e.message)
    }
  }

  class Expectation {
    constructor(executor, name, opt_parameters) {
      this.executor_ = executor
      this.name_ = name
      this.times_ = 1
      this.sessionId_ = SESSION_ID
      this.check_ = null
      this.toDo_ = null
      this.withParameters(opt_parameters || {})
    }

    anyTimes() {
      this.times_ = Infinity
      return this
    }

    times(n) {
      this.times_ = n
      return this
    }

    withParameters(parameters) {
      this.parameters_ = parameters
      if (this.name_ !== CName.NEW_SESSION) {
        this.parameters_['sessionId'] = this.sessionId_
      }
      return this
    }

    andReturn(code, opt_value) {
      this.toDo_ = function (command) {
        LOG.info('executing ' + command.getName() + '; returning ' + code)
        return Promise.resolve(opt_value !== void 0 ? opt_value : null)
      }
      return this
    }

    andReturnSuccess(opt_value) {
      this.toDo_ = function (command) {
        LOG.info('executing ' + command.getName() + '; returning success')
        return Promise.resolve(opt_value !== void 0 ? opt_value : null)
      }
      return this
    }

    andReturnError(error) {
      if (typeof error === 'number') {
        throw Error('need error type')
      }
      this.toDo_ = function (command) {
        LOG.info('executing ' + command.getName() + '; returning failure')
        return Promise.reject(error)
      }
      return this
    }

    expect(name, opt_parameters) {
      this.end()
      return this.executor_.expect(name, opt_parameters)
    }

    end() {
      if (!this.toDo_) {
        this.andReturnSuccess(null)
      }
      return this.executor_
    }

    execute(command) {
      assert.deepStrictEqual(command.getParameters(), this.parameters_)
      return this.toDo_(command)
    }
  }

  class FakeExecutor {
    constructor() {
      this.commands_ = new Map()
    }

    execute(command) {
      let expectations = this.commands_.get(command.getName())
      if (!expectations || !expectations.length) {
        assert.fail('unexpected command: ' + command.getName())
        return
      }

      let next = expectations[0]
      let result = next.execute(command)
      if (next.times_ !== Infinity) {
        next.times_ -= 1
        if (!next.times_) {
          expectations.shift()
        }
      }
      return result
    }

    expect(commandName, opt_parameters) {
      if (!this.commands_.has(commandName)) {
        this.commands_.set(commandName, [])
      }
      let e = new Expectation(this, commandName, opt_parameters)
      this.commands_.get(commandName).push(e)
      return e
    }

    createDriver(opt_session) {
      let session = opt_session || new Session(SESSION_ID, {})
      return new WebDriver(session, this)
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  //    Tests
  //
  /////////////////////////////////////////////////////////////////////////////

  describe('testCreateSession', function () {
    it('happyPathWithCapabilitiesHashObject', function () {
      let aSession = new Session(SESSION_ID, { browserName: 'firefox' })
      let executor = new FakeExecutor()
        .expect(CName.NEW_SESSION)
        .withParameters({
          capabilities: {
            alwaysMatch: { browserName: 'firefox' },
            firstMatch: [{}],
          },
        })
        .andReturnSuccess(aSession)
        .end()

      const driver = WebDriver.createSession(executor, {
        browserName: 'firefox',
      })
      return driver.getSession().then((v) => assert.strictEqual(v, aSession))
    })

    it('happy Path With Capabilities Instance', function () {
      let aSession = new Session(SESSION_ID, { browserName: 'firefox' })
      let executor = new FakeExecutor()
        .expect(CName.NEW_SESSION)
        .withParameters({
          capabilities: {
            alwaysMatch: {
              'moz:debuggerAddress': true,
              browserName: 'firefox',
            },
            firstMatch: [{}],
          },
        })
        .andReturnSuccess(aSession)
        .end()

      const driver = WebDriver.createSession(executor, Capabilities.firefox())
      return driver.getSession().then((v) => assert.strictEqual(v, aSession))
    })

    it('drops non-W3C capability names from W3C capabilities', function () {
      let aSession = new Session(SESSION_ID, { browserName: 'firefox' })
      let executor = new FakeExecutor()
        .expect(CName.NEW_SESSION)
        .withParameters({
          capabilities: {
            alwaysMatch: { browserName: 'firefox' },
            firstMatch: [{}],
          },
        })
        .andReturnSuccess(aSession)
        .end()

      const driver = WebDriver.createSession(executor, {
        browserName: 'firefox',
        foo: 'bar',
      })
      return driver.getSession().then((v) => assert.strictEqual(v, aSession))
    })

    it('failsToCreateSession', function () {
      let executor = new FakeExecutor()
        .expect(CName.NEW_SESSION)
        .withParameters({
          capabilities: {
            alwaysMatch: { browserName: 'firefox' },
            firstMatch: [{}],
          },
        })
        .andReturnError(new StubError())
        .end()

      const driver = WebDriver.createSession(executor, {
        browserName: 'firefox',
      })
      return driver.getSession().then(fail, assertIsStubError)
    })

    it('invokes quit callback if it fails to create a session', function () {
      let called = false
      let executor = new FakeExecutor()
        .expect(CName.NEW_SESSION)
        .withParameters({
          capabilities: {
            alwaysMatch: { browserName: 'firefox' },
            firstMatch: [{}],
          },
        })
        .andReturnError(new StubError())
        .end()

      let driver = WebDriver.createSession(
        executor,
        { browserName: 'firefox' },
        () => (called = true)
      )
      return driver.getSession().then(fail, (err) => {
        assert.ok(called)
        assertIsStubError(err)
      })
    })
  })

  it('testDoesNotExecuteCommandIfSessionDoesNotResolve', function () {
    const session = Promise.reject(new StubError())
    return new FakeExecutor()
      .createDriver(session)
      .getTitle()
      .then((_) => assert.fail('should have failed'), assertIsStubError)
  })

  it('testCommandReturnValuesArePassedToFirstCallback', function () {
    let executor = new FakeExecutor()
      .expect(CName.GET_TITLE)
      .andReturnSuccess('Google Search')
      .end()

    const driver = executor.createDriver()
    return driver
      .getTitle()
      .then((title) => assert.strictEqual('Google Search', title))
  })

  it('testStopsCommandExecutionWhenAnErrorOccurs', function () {
    let e = new error.NoSuchWindowError('window not found')
    let executor = new FakeExecutor()
      .expect(CName.SWITCH_TO_WINDOW)
      .withParameters({
        name: 'foo',
        handle: 'foo',
      })
      .andReturnError(e)
      .end()

    let driver = executor.createDriver()
    return driver
      .switchTo()
      .window('foo')
      .then(
        (_) => driver.getTitle(), // mock should blow if this gets executed
        (v) => assert.strictEqual(v, e)
      )
  })

  it('testReportsErrorWhenExecutingCommandsAfterExecutingAQuit', function () {
    let executor = new FakeExecutor().expect(CName.QUIT).end()

    let verifyError = expectedError(
      error.NoSuchSessionError,
      'This driver instance does not have a valid session ID ' +
        '(did you call WebDriver.quit()?) and may no longer be used.'
    )

    let driver = executor.createDriver()
    return driver
      .quit()
      .then((_) => driver.get('http://www.google.com'))
      .then(assert.fail, verifyError)
  })

  describe('returningAPromise', function () {
    it('fromACallback', function () {
      let executor = new FakeExecutor()
        .expect(CName.GET_TITLE)
        .expect(CName.GET_CURRENT_URL)
        .andReturnSuccess('http://www.google.com')
        .end()

      const driver = executor.createDriver()
      return driver
        .getTitle()
        .then(function () {
          return driver.getCurrentUrl()
        })
        .then(function (value) {
          assert.strictEqual('http://www.google.com', value)
        })
    })

    it('fromAnErrbackSuppressesTheError', function () {
      let executor = new FakeExecutor()
        .expect(CName.SWITCH_TO_WINDOW, {
          name: 'foo',
          handle: 'foo',
        })
        .andReturnError(new StubError())
        .expect(CName.GET_CURRENT_URL)
        .andReturnSuccess('http://www.google.com')
        .end()

      const driver = executor.createDriver()
      return driver
        .switchTo()
        .window('foo')
        .catch(function (e) {
          assertIsStubError(e)
          return driver.getCurrentUrl()
        })
        .then((url) => assert.strictEqual('http://www.google.com', url))
    })
  })

  describe('WebElementPromise', function () {
    let driver = new FakeExecutor().createDriver()

    it('resolvesWhenUnderlyingElementDoes', function () {
      let el = new WebElement(driver, { ELEMENT: 'foo' })
      return new WebElementPromise(driver, Promise.resolve(el)).then((e) =>
        assert.strictEqual(e, el)
      )
    })

    it('resolvesBeforeCallbacksOnWireValueTrigger', function () {
      const el = defer()

      const element = new WebElementPromise(driver, el.promise)
      const messages = []

      let steps = [
        element.then((_) => messages.push('element resolved')),
        element.getId().then((_) => messages.push('wire value resolved')),
      ]

      el.resolve(new WebElement(driver, { ELEMENT: 'foo' }))
      return Promise.all(steps).then(function () {
        assert.deepStrictEqual(
          ['element resolved', 'wire value resolved'],
          messages
        )
      })
    })

    it('isRejectedIfUnderlyingIdIsRejected', function () {
      let element = new WebElementPromise(
        driver,
        Promise.reject(new StubError())
      )
      return element.then(fail, assertIsStubError)
    })
  })

  describe('executeScript', function () {
    it('nullReturnValue', function () {
      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT)
        .withParameters({
          script: 'return document.body;',
          args: [],
        })
        .andReturnSuccess(null)
        .end()

      const driver = executor.createDriver()
      return driver
        .executeScript('return document.body;')
        .then((result) => assert.strictEqual(null, result))
    })

    it('primitiveReturnValue', function () {
      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT)
        .withParameters({
          script: 'return document.body;',
          args: [],
        })
        .andReturnSuccess(123)
        .end()

      const driver = executor.createDriver()
      return driver
        .executeScript('return document.body;')
        .then((result) => assert.strictEqual(123, result))
    })

    it('webElementReturnValue', function () {
      const json = WebElement.buildId('foo')

      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT)
        .withParameters({
          script: 'return document.body;',
          args: [],
        })
        .andReturnSuccess(json)
        .end()

      const driver = executor.createDriver()
      return driver
        .executeScript('return document.body;')
        .then((element) => element.getId())
        .then((id) => assert.strictEqual(id, 'foo'))
    })

    it('arrayReturnValue', function () {
      const json = [WebElement.buildId('foo')]

      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT)
        .withParameters({
          script: 'return document.body;',
          args: [],
        })
        .andReturnSuccess(json)
        .end()

      const driver = executor.createDriver()
      return driver
        .executeScript('return document.body;')
        .then(function (array) {
          assert.strictEqual(1, array.length)
          return array[0].getId()
        })
        .then((id) => assert.strictEqual('foo', id))
    })

    it('objectReturnValue', function () {
      const json = { foo: WebElement.buildId('foo') }

      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT)
        .withParameters({
          script: 'return document.body;',
          args: [],
        })
        .andReturnSuccess(json)
        .end()

      const driver = executor.createDriver()
      return driver
        .executeScript('return document.body;')
        .then((obj) => obj['foo'].getId())
        .then((id) => assert.strictEqual(id, 'foo'))
    })

    it('scriptAsFunction', function () {
      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT)
        .withParameters({
          script: 'return (' + function () {} + ').apply(null, arguments);',
          args: [],
        })
        .andReturnSuccess(null)
        .end()

      const driver = executor.createDriver()
      return driver.executeScript(function () {})
    })

    it('simpleArgumentConversion', function () {
      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT)
        .withParameters({
          script: 'return 1;',
          args: ['abc', 123, true, [123, { foo: 'bar' }]],
        })
        .andReturnSuccess(null)
        .end()

      const driver = executor.createDriver()
      return driver.executeScript('return 1;', 'abc', 123, true, [
        123,
        { foo: 'bar' },
      ])
    })

    it('webElementArgumentConversion', function () {
      const elementJson = WebElement.buildId('fefifofum')

      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT)
        .withParameters({
          script: 'return 1;',
          args: [elementJson],
        })
        .andReturnSuccess(null)
        .end()

      const driver = executor.createDriver()
      return driver.executeScript(
        'return 1;',
        new WebElement(driver, 'fefifofum')
      )
    })

    it('webElementPromiseArgumentConversion', function () {
      const elementJson = WebElement.buildId('bar')

      let executor = new FakeExecutor()
        .expect(CName.FIND_ELEMENT, {
          using: 'css selector',
          value: '*[id="foo"]',
        })
        .andReturnSuccess(elementJson)
        .expect(CName.EXECUTE_SCRIPT)
        .withParameters({
          script: 'return 1;',
          args: [elementJson],
        })
        .andReturnSuccess(null)
        .end()

      const driver = executor.createDriver()
      const element = driver.findElement(By.id('foo'))
      return driver.executeScript('return 1;', element)
    })

    it('argumentConversion', function () {
      const elementJson = WebElement.buildId('fefifofum')

      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT)
        .withParameters({
          script: 'return 1;',
          args: ['abc', 123, true, elementJson, [123, { foo: 'bar' }]],
        })
        .andReturnSuccess(null)
        .end()

      const driver = executor.createDriver()
      const element = new WebElement(driver, 'fefifofum')
      return driver.executeScript('return 1;', 'abc', 123, true, element, [
        123,
        { foo: 'bar' },
      ])
    })

    it('scriptReturnsAnError', function () {
      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT)
        .withParameters({
          script: 'throw Error(arguments[0]);',
          args: ['bam'],
        })
        .andReturnError(new StubError())
        .end()
      const driver = executor.createDriver()
      return driver
        .executeScript('throw Error(arguments[0]);', 'bam')
        .then(fail, assertIsStubError)
    })

    it('failsIfArgumentIsARejectedPromise', function () {
      let executor = new FakeExecutor()

      const arg = Promise.reject(new StubError())
      arg.catch(function () {}) // Suppress default handler.

      const driver = executor.createDriver()
      return driver
        .executeScript(function () {}, arg)
        .then(fail, assertIsStubError)
    })
  })

  describe('executeAsyncScript', function () {
    it('failsIfArgumentIsARejectedPromise', function () {
      const arg = Promise.reject(new StubError())
      arg.catch(function () {}) // Suppress default handler.

      const driver = new FakeExecutor().createDriver()
      return driver
        .executeAsyncScript(function () {}, arg)
        .then(fail, assertIsStubError)
    })
  })

  describe('findElement', function () {
    it('elementNotFound', function () {
      let executor = new FakeExecutor()
        .expect(CName.FIND_ELEMENT, {
          using: 'css selector',
          value: '*[id="foo"]',
        })
        .andReturnError(new StubError())
        .end()

      const driver = executor.createDriver()
      return driver
        .findElement(By.id('foo'))
        .then(assert.fail, assertIsStubError)
    })

    it('elementNotFoundInACallback', function () {
      let executor = new FakeExecutor()
        .expect(CName.FIND_ELEMENT, {
          using: 'css selector',
          value: '*[id="foo"]',
        })
        .andReturnError(new StubError())
        .end()

      const driver = executor.createDriver()
      return Promise.resolve()
        .then((_) => driver.findElement(By.id('foo')))
        .then(assert.fail, assertIsStubError)
    })

    it('elementFound', function () {
      let executor = new FakeExecutor()
        .expect(CName.FIND_ELEMENT, {
          using: 'css selector',
          value: '*[id="foo"]',
        })
        .andReturnSuccess(WebElement.buildId('bar'))
        .expect(CName.CLICK_ELEMENT, { id: WebElement.buildId('bar') })
        .andReturnSuccess()
        .end()

      const driver = executor.createDriver()
      const element = driver.findElement(By.id('foo'))
      return element.click()
    })

    it('canUseElementInCallback', function () {
      let executor = new FakeExecutor()
        .expect(CName.FIND_ELEMENT, {
          using: 'css selector',
          value: '*[id="foo"]',
        })
        .andReturnSuccess(WebElement.buildId('bar'))
        .expect(CName.CLICK_ELEMENT, { id: WebElement.buildId('bar') })
        .andReturnSuccess()
        .end()

      const driver = executor.createDriver()
      return driver.findElement(By.id('foo')).then((e) => e.click())
    })

    it('byJs', function () {
      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT, {
          script: 'return document.body',
          args: [],
        })
        .andReturnSuccess(WebElement.buildId('bar'))
        .expect(CName.CLICK_ELEMENT, { id: WebElement.buildId('bar') })
        .end()

      const driver = executor.createDriver()
      return driver
        .findElement(By.js('return document.body'))
        .then((e) => e.click())
    })

    it('byJs_returnsNonWebElementValue', function () {
      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT, { script: 'return 123', args: [] })
        .andReturnSuccess(123)
        .end()

      const driver = executor.createDriver()
      return driver
        .findElement(By.js('return 123'))
        .then(assert.fail, function (e) {
          assertIsInstance(TypeError, e)
          assert.strictEqual(
            'Custom locator did not return a WebElement',
            e.message
          )
        })
    })

    it('byJs_canPassArguments', function () {
      const script = 'return document.getElementsByTagName(arguments[0]);'
      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT, {
          script: script,
          args: ['div'],
        })
        .andReturnSuccess(WebElement.buildId('one'))
        .end()
      const driver = executor.createDriver()
      return driver.findElement(By.js(script, 'div'))
    })

    it('customLocator', function () {
      let executor = new FakeExecutor()
        .expect(CName.FIND_ELEMENTS, { using: 'css selector', value: '.a' })
        .andReturnSuccess([
          WebElement.buildId('foo'),
          WebElement.buildId('bar'),
        ])
        .expect(CName.CLICK_ELEMENT, { id: WebElement.buildId('foo') })
        .andReturnSuccess()
        .end()

      const driver = executor.createDriver()
      const element = driver.findElement(function (d) {
        assert.strictEqual(driver, d)
        return d.findElements(By.className('a'))
      })
      return element.click()
    })

    it('customLocatorThrowsIfresultIsNotAWebElement', function () {
      const driver = new FakeExecutor().createDriver()
      return driver
        .findElement((_) => 1)
        .then(assert.fail, function (e) {
          assertIsInstance(TypeError, e)
          assert.strictEqual(
            'Custom locator did not return a WebElement',
            e.message
          )
        })
    })
  })

  describe('findElements', function () {
    it('returnsMultipleElements', function () {
      const ids = ['foo', 'bar', 'baz']
      let executor = new FakeExecutor()
        .expect(CName.FIND_ELEMENTS, { using: 'css selector', value: '.a' })
        .andReturnSuccess(ids.map(WebElement.buildId))
        .end()

      const driver = executor.createDriver()
      return driver
        .findElements(By.className('a'))
        .then(function (elements) {
          return Promise.all(
            elements.map(function (e) {
              assert.ok(e instanceof WebElement)
              return e.getId()
            })
          )
        })
        .then((actual) => assert.deepStrictEqual(ids, actual))
    })

    it('byJs', function () {
      const ids = ['foo', 'bar', 'baz']
      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT, {
          script: 'return document.getElementsByTagName("div");',
          args: [],
        })
        .andReturnSuccess(ids.map(WebElement.buildId))
        .end()

      const driver = executor.createDriver()

      return driver
        .findElements(By.js('return document.getElementsByTagName("div");'))
        .then(function (elements) {
          return Promise.all(
            elements.map(function (e) {
              assert.ok(e instanceof WebElement)
              return e.getId()
            })
          )
        })
        .then((actual) => assert.deepStrictEqual(ids, actual))
    })

    it('byJs_filtersOutNonWebElementResponses', function () {
      const ids = ['foo', 'bar', 'baz']
      const json = [
        WebElement.buildId(ids[0]),
        123,
        'a',
        false,
        WebElement.buildId(ids[1]),
        { 'not a web element': 1 },
        WebElement.buildId(ids[2]),
      ]
      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT, {
          script: 'return document.getElementsByTagName("div");',
          args: [],
        })
        .andReturnSuccess(json)
        .end()

      const driver = executor.createDriver()
      return driver
        .findElements(By.js('return document.getElementsByTagName("div");'))
        .then(function (elements) {
          return Promise.all(
            elements.map(function (e) {
              assert.ok(e instanceof WebElement)
              return e.getId()
            })
          )
        })
        .then((actual) => assert.deepStrictEqual(ids, actual))
    })

    it('byJs_convertsSingleWebElementResponseToArray', function () {
      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT, {
          script: 'return document.getElementsByTagName("div");',
          args: [],
        })
        .andReturnSuccess(WebElement.buildId('foo'))
        .end()

      const driver = executor.createDriver()
      return driver
        .findElements(By.js('return document.getElementsByTagName("div");'))
        .then(function (elements) {
          return Promise.all(
            elements.map(function (e) {
              assert.ok(e instanceof WebElement)
              return e.getId()
            })
          )
        })
        .then((actual) => assert.deepStrictEqual(['foo'], actual))
    })

    it('byJs_canPassScriptArguments', function () {
      const script = 'return document.getElementsByTagName(arguments[0]);'
      let executor = new FakeExecutor()
        .expect(CName.EXECUTE_SCRIPT, {
          script: script,
          args: ['div'],
        })
        .andReturnSuccess([
          WebElement.buildId('one'),
          WebElement.buildId('two'),
        ])
        .end()

      const driver = executor.createDriver()
      return driver
        .findElements(By.js(script, 'div'))
        .then(function (elements) {
          return Promise.all(
            elements.map(function (e) {
              assert.ok(e instanceof WebElement)
              return e.getId()
            })
          )
        })
        .then((actual) => assert.deepStrictEqual(['one', 'two'], actual))
    })
  })

  describe('sendKeys', function () {
    it('convertsVarArgsIntoStrings_simpleArgs', function () {
      let executor = new FakeExecutor()
        .expect(CName.SEND_KEYS_TO_ELEMENT, {
          id: WebElement.buildId('one'),
          text: '12abc3',
          value: '12abc3'.split(''),
        })
        .andReturnSuccess()
        .end()

      const driver = executor.createDriver()
      const element = new WebElement(driver, 'one')
      return element.sendKeys(1, 2, 'abc', 3)
    })

    it('sendKeysWithEmojiRepresentedByPairOfCodePoints', function () {
      let executor = new FakeExecutor()
        .expect(CName.SEND_KEYS_TO_ELEMENT, {
          id: WebElement.buildId('one'),
          text: '\uD83D\uDE00',
          value: ['\uD83D\uDE00'],
        })
        .andReturnSuccess()
        .end()

      const driver = executor.createDriver()
      const element = new WebElement(driver, 'one')
      return element.sendKeys('\uD83D\uDE00')
    })

    it('convertsVarArgsIntoStrings_promisedArgs', function () {
      let executor = new FakeExecutor()
        .expect(CName.FIND_ELEMENT, {
          using: 'css selector',
          value: '*[id="foo"]',
        })
        .andReturnSuccess(WebElement.buildId('one'))
        .expect(CName.SEND_KEYS_TO_ELEMENT, {
          id: WebElement.buildId('one'),
          text: 'abc123def',
          value: 'abc123def'.split(''),
        })
        .andReturnSuccess()
        .end()

      const driver = executor.createDriver()
      const element = driver.findElement(By.id('foo'))
      return element.sendKeys(
        Promise.resolve('abc'),
        123,
        Promise.resolve('def')
      )
    })

    it('sendKeysWithAFileDetector', function () {
      let executor = new FakeExecutor()
        .expect(CName.FIND_ELEMENT, {
          using: 'css selector',
          value: '*[id="foo"]',
        })
        .andReturnSuccess(WebElement.buildId('one'))
        .expect(CName.SEND_KEYS_TO_ELEMENT, {
          id: WebElement.buildId('one'),
          text: 'modified/path',
          value: 'modified/path'.split(''),
        })
        .andReturnSuccess()
        .end()

      let driver = executor.createDriver()
      let handleFile = function (d, path) {
        assert.strictEqual(driver, d)
        assert.strictEqual(path, 'original/path')
        return Promise.resolve('modified/path')
      }
      driver.setFileDetector({ handleFile })

      return driver.findElement(By.id('foo')).sendKeys('original/', 'path')
    })
  })

  describe('switchTo()', function () {
    describe('window', function () {
      it('should return a resolved promise when the window is found', function () {
        let executor = new FakeExecutor()
          .expect(CName.SWITCH_TO_WINDOW)
          .withParameters({
            name: 'foo',
            handle: 'foo',
          })
          .andReturnSuccess()
          .end()

        return executor.createDriver().switchTo().window('foo')
      })

      it('should propagate exceptions', function () {
        let e = new error.NoSuchWindowError('window not found')
        let executor = new FakeExecutor()
          .expect(CName.SWITCH_TO_WINDOW)
          .withParameters({
            name: 'foo',
            handle: 'foo',
          })
          .andReturnError(e)
          .end()

        return executor
          .createDriver()
          .switchTo()
          .window('foo')
          .then(assert.fail, (v) => assert.strictEqual(v, e))
      })
    })
  })

  describe('elementEquality', function () {
    it('isReflexive', function () {
      const a = new WebElement(new FakeExecutor().createDriver(), 'foo')
      return WebElement.equals(a, a).then(assert.ok)
    })

    it('failsIfAnInputElementCouldNotBeFound', function () {
      let id = Promise.reject(new StubError())

      const driver = new FakeExecutor().createDriver()
      const a = new WebElement(driver, 'foo')
      const b = new WebElementPromise(driver, id)

      return WebElement.equals(a, b).then(fail, assertIsStubError)
    })
  })

  describe('waiting', function () {
    it('on a condition that always returns true', function () {
      let executor = new FakeExecutor()
      let driver = executor.createDriver()
      let count = 0
      function condition() {
        count++
        return true
      }
      return driver.wait(condition, 1).then(() => assert.strictEqual(1, count))
    })

    it('on a simple counting condition', function () {
      let executor = new FakeExecutor()
      let driver = executor.createDriver()
      let count = 0
      function condition() {
        return ++count === 3
      }
      return driver
        .wait(condition, 250)
        .then(() => assert.strictEqual(3, count))
    })

    it('on a condition that returns a promise that resolves to true after a short timeout', function () {
      let executor = new FakeExecutor()
      let driver = executor.createDriver()

      let count = 0
      function condition() {
        count += 1
        return new Promise((resolve) => {
          setTimeout(() => resolve(true), 50)
        })
      }

      return driver.wait(condition, 75).then(() => assert.strictEqual(1, count))
    })

    it('on a condition that returns a promise', function () {
      let executor = new FakeExecutor()
      let driver = executor.createDriver()

      let count = 0
      function condition() {
        count += 1
        return new Promise((resolve) => {
          setTimeout(() => resolve(count === 3), 25)
        })
      }

      return driver
        .wait(condition, 100, null, 25)
        .then(() => assert.strictEqual(3, count))
    })

    it('fails if condition throws', function () {
      let executor = new FakeExecutor()
      let driver = executor.createDriver()
      return driver
        .wait(throwStubError, 0, 'goes boom')
        .then(fail, assertIsStubError)
    })

    it('fails if condition returns a rejected promise', function () {
      let executor = new FakeExecutor()
      let driver = executor.createDriver()
      function condition() {
        return new Promise((_, reject) => reject(new StubError()))
      }
      return driver
        .wait(condition, 0, 'goes boom')
        .then(fail, assertIsStubError)
    })

    it('supports message function if condition exceeds timeout', function () {
      let executor = new FakeExecutor()
      let driver = executor.createDriver()
      let message = () => 'goes boom'
      return driver
        .wait(() => false, 0.001, message)
        .then(fail, (e) => {
          assert.ok(/^goes boom\nWait timed out after \d+ms$/.test(e.message))
        })
    })

    it('handles if the message function throws an error after a condition exceeds timeout', function () {
      let executor = new FakeExecutor()
      let driver = executor.createDriver()
      let message = () => {
        throw new Error('message function error')
      }
      return driver
        .wait(() => false, 0.001, message)
        .then(fail, (e) => {
          assert.ok(
            /^message function error\nWait timed out after \d+ms$/.test(
              e.message
            )
          )
        })
    })

    it('supports message function if condition returns a rejected promise', function () {
      let executor = new FakeExecutor()
      let driver = executor.createDriver()
      let condition = new Promise((res) => setTimeout(res, 100))
      let message = () => 'goes boom'
      return driver.wait(condition, 1, message).then(fail, (e) => {
        assert.ok(
          /^goes boom\nTimed out waiting for promise to resolve after \d+ms$/.test(
            e.message
          )
        )
      })
    })

    it('handles if the message function returns an error after a rejected promise', function () {
      let executor = new FakeExecutor()
      let driver = executor.createDriver()
      let condition = new Promise((res) => setTimeout(res, 100))
      let message = () => {
        throw new Error('message function error')
      }
      return driver.wait(condition, 1, message).then(fail, (e) => {
        assert.ok(
          /^message function error\nTimed out waiting for promise to resolve after \d+ms$/.test(
            e.message
          )
        )
      })
    })

    it('waits forever on a zero timeout', function () {
      let done = false
      setTimeout(() => (done = true), 150)

      let executor = new FakeExecutor()
      let driver = executor.createDriver()
      let waitResult = driver.wait(() => done, 0)

      return driver
        .sleep(75)
        .then(function () {
          assert.ok(!done)
          return driver.sleep(100)
        })
        .then(function () {
          assert.ok(done)
          return waitResult
        })
    })

    it('waits forever if timeout omitted', function () {
      let done = false
      setTimeout(() => (done = true), 150)

      let executor = new FakeExecutor()
      let driver = executor.createDriver()
      let waitResult = driver.wait(() => done)

      return driver
        .sleep(75)
        .then(function () {
          assert.ok(!done)
          return driver.sleep(100)
        })
        .then(function () {
          assert.ok(done)
          return waitResult
        })
    })

    it('times out when timer expires', function () {
      let executor = new FakeExecutor()
      let driver = executor.createDriver()

      let count = 0
      let wait = driver.wait(
        function () {
          count += 1
          let ms = count === 2 ? 65 : 5
          return promise.delayed(ms).then(function () {
            return false
          })
        },
        60,
        'counting to 3'
      )

      return wait.then(fail, function (e) {
        assert.strictEqual(2, count)
        assert.ok(e instanceof error.TimeoutError, 'Unexpected error: ' + e)
        assert.ok(/^counting to 3\nWait timed out after \d+ms$/.test(e.message))
      })
    })

    it('requires condition to be a promise or function', function () {
      let executor = new FakeExecutor()
      let driver = executor.createDriver()
      assert.throws(() => driver.wait(1234, 0))
    })

    it('promise that does not resolve before timeout', function () {
      let d = defer()

      let executor = new FakeExecutor()
      let driver = executor.createDriver()
      return driver.wait(d.promise, 5).then(fail, (e) => {
        assert.ok(e instanceof error.TimeoutError, 'Unexpected error: ' + e)
        assert.ok(
          /Timed out waiting for promise to resolve after \d+ms/.test(
            e.message
          ),
          'unexpected error message: ' + e.message
        )
      })
    })

    it('unbounded wait on promise resolution', function () {
      let messages = []
      let d = defer()

      let executor = new FakeExecutor()
      let driver = executor.createDriver()
      let waitResult = driver.wait(d.promise).then(function (value) {
        messages.push('b')
        assert.strictEqual(1234, value)
      })

      setTimeout(() => messages.push('a'), 5)
      return driver
        .sleep(10)
        .then(function () {
          assert.deepStrictEqual(['a'], messages)
          d.resolve(1234)
          return waitResult
        })
        .then(function () {
          assert.deepStrictEqual(['a', 'b'], messages)
        })
    })

    describe('supports custom wait functions', function () {
      it('waitSucceeds', function () {
        let executor = new FakeExecutor()
          .expect(CName.FIND_ELEMENTS, {
            using: 'css selector',
            value: '*[id="foo"]',
          })
          .andReturnSuccess([])
          .times(2)
          .expect(CName.FIND_ELEMENTS, {
            using: 'css selector',
            value: '*[id="foo"]',
          })
          .andReturnSuccess([WebElement.buildId('bar')])
          .end()

        const driver = executor.createDriver()
        return driver.wait(
          function () {
            return driver
              .findElements(By.id('foo'))
              .then((els) => els.length > 0)
          },
          200,
          null,
          25
        )
      })

      it('waitTimesout_timeoutCaught', function () {
        let executor = new FakeExecutor()
          .expect(CName.FIND_ELEMENTS, {
            using: 'css selector',
            value: '*[id="foo"]',
          })
          .andReturnSuccess([])
          .anyTimes()
          .end()

        const driver = executor.createDriver()
        return driver
          .wait(function () {
            return driver
              .findElements(By.id('foo'))
              .then((els) => els.length > 0)
          }, 25)
          .then(fail, function (e) {
            assert.strictEqual(
              'Wait timed out after ',
              e.message.substring(0, 'Wait timed out after '.length)
            )
          })
      })
    })

    describe('supports condition objects', function () {
      it('wait succeeds', function () {
        let executor = new FakeExecutor()
          .expect(CName.FIND_ELEMENTS, {
            using: 'css selector',
            value: '*[id="foo"]',
          })
          .andReturnSuccess([])
          .times(2)
          .expect(CName.FIND_ELEMENTS, {
            using: 'css selector',
            value: '*[id="foo"]',
          })
          .andReturnSuccess([WebElement.buildId('bar')])
          .end()

        let driver = executor.createDriver()
        return driver.wait(until.elementLocated(By.id('foo')), 200, null, 25)
      })

      it('wait times out', function () {
        let executor = new FakeExecutor()
          .expect(CName.FIND_ELEMENTS, {
            using: 'css selector',
            value: '*[id="foo"]',
          })
          .andReturnSuccess([])
          .anyTimes()
          .end()

        let driver = executor.createDriver()
        return driver
          .wait(until.elementLocated(By.id('foo')), 5)
          .then(fail, (err) => assert.ok(err instanceof error.TimeoutError))
      })
    })

    describe('supports promise objects', function () {
      it('wait succeeds', function () {
        let promise = new Promise((resolve) => {
          setTimeout(() => resolve(1), 10)
        })

        let driver = new FakeExecutor().createDriver()
        return driver.wait(promise, 200).then((v) => assert.strictEqual(v, 1))
      })

      it('wait times out', function () {
        let promise = new Promise(() => {
          /* never resolves */
        })

        let driver = new FakeExecutor().createDriver()
        return driver
          .wait(promise, 5)
          .then(fail, (err) => assert.ok(err instanceof error.TimeoutError))
      })

      it('wait fails if promise is rejected', function () {
        let err = Error('boom')
        let driver = new FakeExecutor().createDriver()
        return driver
          .wait(Promise.reject(err), 5)
          .then(fail, (e) => assert.strictEqual(e, err))
      })
    })

    it('fails if not supported condition type provided', function () {
      let driver = new FakeExecutor().createDriver()
      assert.throws(() => driver.wait({}, 5), TypeError)
    })
  })

  describe('alert handling', function () {
    it('alertResolvesWhenPromisedTextResolves', function () {
      let driver = new FakeExecutor().createDriver()
      let deferredText = defer()

      let alert = new AlertPromise(driver, deferredText.promise)

      deferredText.resolve(new Alert(driver, 'foo'))
      return alert.getText().then((text) => assert.strictEqual(text, 'foo'))
    })

    it('cannotSwitchToAlertThatIsNotPresent', function () {
      let e = new error.NoSuchAlertError()
      let executor = new FakeExecutor()
        .expect(CName.GET_ALERT_TEXT)
        .andReturnError(e)
        .end()

      return executor
        .createDriver()
        .switchTo()
        .alert()
        .then(assert.fail, (v) => assert.strictEqual(v, e))
    })

    it('commandsFailIfAlertNotPresent', function () {
      let e = new error.NoSuchAlertError()
      let executor = new FakeExecutor()
        .expect(CName.GET_ALERT_TEXT)
        .andReturnError(e)
        .end()

      const driver = executor.createDriver()
      const alert = driver.switchTo().alert()

      const expectError = (v) => assert.strictEqual(v, e)

      return alert
        .getText()
        .then(fail, expectedError)
        .then(() => alert.accept())
        .then(fail, expectedError)
        .then(() => alert.dismiss())
        .then(fail, expectError)
        .then(() => alert.sendKeys('hi'))
        .then(fail, expectError)
    })
  })

  it('testFetchingLogs', function () {
    let executor = new FakeExecutor()
      .expect(CName.GET_LOG, { type: 'browser' })
      .andReturnSuccess([
        { level: 'INFO', message: 'hello', timestamp: 1234 },
        { level: 'DEBUG', message: 'abc123', timestamp: 5678 },
      ])
      .end()

    const driver = executor.createDriver()
    return driver
      .manage()
      .logs()
      .get('browser')
      .then(function (entries) {
        assert.strictEqual(2, entries.length)

        assert.ok(entries[0] instanceof logging.Entry)
        assert.strictEqual(logging.Level.INFO.value, entries[0].level.value)
        assert.strictEqual('hello', entries[0].message)
        assert.strictEqual(1234, entries[0].timestamp)

        assert.ok(entries[1] instanceof logging.Entry)
        assert.strictEqual(logging.Level.DEBUG.value, entries[1].level.value)
        assert.strictEqual('abc123', entries[1].message)
        assert.strictEqual(5678, entries[1].timestamp)
      })
  })

  it('testCommandsFailIfInitialSessionCreationFailed', function () {
    const session = Promise.reject(new StubError())

    const driver = new FakeExecutor().createDriver(session)
    const navigateResult = driver.get('some-url').then(fail, assertIsStubError)
    const quitResult = driver.quit().then(fail, assertIsStubError)
    return Promise.all([navigateResult, quitResult])
  })

  it('testWebElementCommandsFailIfInitialDriverCreationFailed', function () {
    const session = Promise.reject(new StubError())
    const driver = new FakeExecutor().createDriver(session)
    return driver
      .findElement(By.id('foo'))
      .click()
      .then(fail, assertIsStubError)
  })

  it('testWebElementCommansFailIfElementCouldNotBeFound', function () {
    let e = new error.NoSuchElementError('Unable to find element')
    let executor = new FakeExecutor()
      .expect(CName.FIND_ELEMENT, {
        using: 'css selector',
        value: '*[id="foo"]',
      })
      .andReturnError(e)
      .end()

    const driver = executor.createDriver()
    return driver
      .findElement(By.id('foo'))
      .click()
      .then(fail, (v) => assert.strictEqual(v, e))
  })

  it('testCannotFindChildElementsIfParentCouldNotBeFound', function () {
    let e = new error.NoSuchElementError('Unable to find element')
    let executor = new FakeExecutor()
      .expect(CName.FIND_ELEMENT, {
        using: 'css selector',
        value: '*[id="foo"]',
      })
      .andReturnError(e)
      .end()

    const driver = executor.createDriver()
    return driver
      .findElement(By.id('foo'))
      .findElement(By.id('bar'))
      .findElement(By.id('baz'))
      .then(fail, (v) => assert.strictEqual(v, e))
  })

  describe('actions()', function () {
    describe('move()', function () {
      it('no origin', function () {
        let executor = new FakeExecutor()
          .expect(CName.ACTIONS, {
            actions: [
              {
                type: 'pointer',
                id: 'default mouse',
                parameters: {
                  pointerType: 'mouse',
                },
                actions: [
                  {
                    duration: 100,
                    origin: 'viewport',
                    type: 'pointerMove',
                    x: 0,
                    y: 125,
                    altitudeAngle: 0,
                    azimuthAngle: 0,
                    width: 0,
                    height: 0,
                    pressure: 0,
                    tangentialPressure: 0,
                    tiltX: 0,
                    tiltY: 0,
                    twist: 0,
                  },
                ],
              },
            ],
          })
          .andReturnSuccess()
          .end()

        let driver = executor.createDriver()
        return driver.actions().move({ x: 0, y: 125 }).perform()
      })

      it('origin = element', function () {
        let executor = new FakeExecutor()
          .expect(CName.FIND_ELEMENT, {
            using: 'css selector',
            value: '*[id="foo"]',
          })
          .andReturnSuccess(WebElement.buildId('abc123'))
          .expect(CName.ACTIONS, {
            actions: [
              {
                type: 'pointer',
                id: 'default mouse',
                parameters: {
                  pointerType: 'mouse',
                },
                actions: [
                  {
                    duration: 100,
                    origin: WebElement.buildId('abc123'),
                    type: 'pointerMove',
                    x: 0,
                    y: 125,
                    altitudeAngle: 0,
                    azimuthAngle: 0,
                    width: 0,
                    height: 0,
                    pressure: 0,
                    tangentialPressure: 0,
                    tiltX: 0,
                    tiltY: 0,
                    twist: 0,
                  },
                ],
              },
            ],
          })
          .end()

        let driver = executor.createDriver()
        let element = driver.findElement(By.id('foo'))
        return driver
          .actions()
          .move({ x: 0, y: 125, origin: element })
          .perform()
      })
    })
  })

  describe('manage()', function () {
    describe('setTimeouts()', function () {
      describe('throws if no timeouts are specified', function () {
        let driver
        before(() => (driver = new FakeExecutor().createDriver()))

        it('; no arguments', function () {
          assert.throws(() => driver.manage().setTimeouts(), TypeError)
        })

        it('; ignores unrecognized timeout keys', function () {
          assert.throws(
            () => driver.manage().setTimeouts({ foo: 123 }),
            TypeError
          )
        })

        it('; ignores positional arguments', function () {
          assert.throws(() => driver.manage().setTimeouts(1234, 56), TypeError)
        })
      })

      describe('throws timeout is not a number, null, or undefined', () => {
        let driver
        before(() => (driver = new FakeExecutor().createDriver()))

        function checkError(e) {
          return (
            e instanceof TypeError &&
            /expected "(script|pageLoad|implicit)" to be a number/.test(
              e.message
            )
          )
        }

        it('script', function () {
          assert.throws(
            () => driver.manage().setTimeouts({ script: 'abc' }),
            checkError
          )
        })

        it('pageLoad', function () {
          assert.throws(
            () => driver.manage().setTimeouts({ pageLoad: 'abc' }),
            checkError
          )
        })

        it('implicit', function () {
          assert.throws(
            () => driver.manage().setTimeouts({ implicit: 'abc' }),
            checkError
          )
        })
      })

      it('can set multiple timeouts', function () {
        let executor = new FakeExecutor()
          .expect(CName.SET_TIMEOUT, { script: 1, pageLoad: 2, implicit: 3 })
          .andReturnSuccess()
          .end()
        let driver = executor.createDriver()
        return driver
          .manage()
          .setTimeouts({ script: 1, pageLoad: 2, implicit: 3 })
      })

      it('falls back to legacy wire format if W3C version fails', () => {
        let executor = new FakeExecutor()
          .expect(CName.SET_TIMEOUT, { implicit: 3 })
          .andReturnError(Error('oops'))
          .expect(CName.SET_TIMEOUT, { type: 'implicit', ms: 3 })
          .andReturnSuccess()
          .end()
        let driver = executor.createDriver()
        return driver.manage().setTimeouts({ implicit: 3 })
      })
    })
  })
})
