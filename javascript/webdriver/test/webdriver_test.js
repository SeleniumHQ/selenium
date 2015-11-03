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

goog.require('bot.ErrorCode');
goog.require('goog.Promise');
goog.require('goog.functions');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('webdriver.Capabilities');
goog.require('webdriver.Command');
goog.require('webdriver.CommandExecutor');
goog.require('webdriver.CommandName');
goog.require('webdriver.FileDetector');
goog.require('webdriver.WebDriver');
goog.require('webdriver.Serializable');
goog.require('webdriver.Session');
goog.require('webdriver.logging');
goog.require('webdriver.promise');
goog.require('webdriver.test.testutil');

var SESSION_ID = 'test_session_id';

var STUB_DRIVER = {
  controlFlow: goog.nullFunction
};

// Alias some long names that interfere with test readability.
var CName = webdriver.CommandName,
    ECode = bot.ErrorCode,
    StubError = webdriver.test.testutil.StubError,
    throwStubError = webdriver.test.testutil.throwStubError,
    assertIsStubError = webdriver.test.testutil.assertIsStubError;

// By is exported by webdriver.By, but IDEs don't recognize
// goog.exportSymbol. Explicitly define it here to make the
// IDE stop complaining.
var By = webdriver.By;

var driver;
var flow;
var mockControl;
var uncaughtExceptions;

function shouldRunTests() {
  return !goog.userAgent.IE || goog.userAgent.isVersionOrHigher(10);
}


function setUp() {
  mockControl = new goog.testing.MockControl();
  flow = webdriver.promise.controlFlow();
  uncaughtExceptions = [];
  flow.on('uncaughtException', onUncaughtException);
}


function tearDown() {
  return waitForIdle(flow).then(function() {
    mockControl.$verifyAll();
    mockControl.$tearDown();

    assertArrayEquals('There were uncaught exceptions',
        [], uncaughtExceptions);
    flow.reset();
  });
}


function onUncaughtException(e) {
  uncaughtExceptions.push(e);
}


function waitForIdle(opt_flow) {
  var theFlow = opt_flow || flow;
  return new goog.Promise(function(fulfill, reject) {
    if (theFlow.isIdle()) {
      fulfill();
      return;
    }
    theFlow.once('idle', fulfill);
    theFlow.once('uncaughtException', reject);
  });
}


function waitForAbort(opt_flow, opt_n) {
  var n = opt_n || 1;
  var theFlow = opt_flow || flow;
  theFlow.removeAllListeners(
      webdriver.promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION);
  return new goog.Promise(function(fulfill, reject) {
    theFlow.once('idle', function() {
      reject(Error('expected flow to report an unhandled error'));
    });

    var errors = [];
    theFlow.on('uncaughtException', onError);
    function onError(e) {
      errors.push(e);
      if (errors.length === n) {
        theFlow.removeListener('uncaughtException', onError);
        fulfill(n === 1 ? errors[0] : errors);
      }
    }
  });
}


function expectedError(code, message) {
  return function(e) {
    assertEquals('Wrong error message', message, e.message);
    assertEquals('Wrong error code', code, e.code);
  };
}


function createCommandMatcher(commandName, parameters) {
  return new goog.testing.mockmatchers.ArgumentMatcher(function(actual) {
    assertEquals('wrong name', commandName, actual.getName());
    var differences = goog.testing.asserts.findDifferences(
        parameters, actual.getParameters());
    assertNull(
        'Wrong parameters for "' + commandName + '"' +
            '\n    Expected: ' + JSON.stringify(parameters) +
            '\n    Actual: ' + JSON.stringify(actual.getParameters()),
        differences);
    return true;
  }, commandName + '(' + JSON.stringify(parameters) + ')');
}


TestHelper = function() {
  this.executor = mockControl.createStrictMock(webdriver.CommandExecutor);
};


TestHelper.prototype.expect = function(commandName, opt_parameters) {
  return new TestHelper.Command(this, commandName, opt_parameters);
};


TestHelper.prototype.replayAll = function() {
  mockControl.$replayAll();
  return this;
};


TestHelper.Command = function(testHelper, commandName, opt_parameters) {
  this.helper_ = testHelper;
  this.name_ = commandName;
  this.toDo_ = null;
  this.anyTimes_ = false;
  this.times_ = 0;
  this.sessionId_ = SESSION_ID;
  this.withParameters(opt_parameters || {});
};


TestHelper.Command.prototype.withParameters = function(parameters) {
  this.parameters_ = parameters;
  if (this.name_ !== CName.NEW_SESSION) {
    this.parameters_['sessionId'] = this.sessionId_;
  }
  return this;
};


TestHelper.Command.prototype.buildExpectation_ = function() {
  var commandMatcher = createCommandMatcher(this.name_, this.parameters_);
  assertNotNull(this.toDo_);
  var expectation = this.helper_.executor.
      execute(commandMatcher, goog.testing.mockmatchers.isFunction).
      $does(this.toDo_);
  if (this.anyTimes_) {
    assertEquals(0, this.times_);
    expectation.$anyTimes();
  }
  if (this.times_) {
    assertFalse(this.anyTimes_);
    expectation.$times(this.times_);
  }
};


TestHelper.Command.prototype.andReturn = function(code, opt_value) {
  this.toDo_ = function(command, callback) {
    callback(null, {
      'status': code,
      'sessionId': {
        'value': SESSION_ID
      },
      'value': goog.isDef(opt_value) ? opt_value : null
    });
  };
  return this;
};


TestHelper.Command.prototype.anyTimes = function() {
  this.anyTimes_ = true;
  return this;
};


TestHelper.Command.prototype.times = function(n) {
  this.times_ = n;
  return this;
};


TestHelper.Command.prototype.andReturnSuccess = function(opt_returnValue) {
  return this.andReturn(ECode.SUCCESS, opt_returnValue);
};


TestHelper.Command.prototype.andReturnError = function(errCode, opt_value) {
  return this.andReturn(errCode, opt_value);
};


TestHelper.Command.prototype.replayAll = function() {
  if (!this.toDo_) {
    this.andReturnSuccess(null);
  }
  this.buildExpectation_();
  return this.helper_.replayAll();
};


TestHelper.Command.prototype.expect = function(name, opt_parameters) {
  if (!this.toDo_) {
    this.andReturnSuccess(null);
  }
  this.buildExpectation_();
  return this.helper_.expect(name, opt_parameters);
};


/**
 * @param {!(webdriver.Session|webdriver.promise.Promise)=} opt_session The
 *     session to use.
 * @return {!webdriver.WebDriver} A new driver instance.
 */
TestHelper.prototype.createDriver = function(opt_session) {
  var session = opt_session || new webdriver.Session(SESSION_ID, {});
  return new webdriver.WebDriver(session, this.executor);
};


//////////////////////////////////////////////////////////////////////////////
//
//    Tests
//
//////////////////////////////////////////////////////////////////////////////

function testAttachToSession_sessionIsAvailable() {
  var testHelper = new TestHelper().
      expect(CName.DESCRIBE_SESSION).
      withParameters({'sessionId': SESSION_ID}).
      andReturnSuccess({'browserName': 'firefox'}).
      replayAll();

  var driver = webdriver.WebDriver.attachToSession(testHelper.executor,
      SESSION_ID);
  return driver.getSession().then(function(session) {
    webdriver.test.testutil.assertObjectEquals({
      'value':'test_session_id'
    }, session.getId());
    assertEquals('firefox', session.getCapability('browserName'));
  });
}


function testAttachToSession_failsToGetSessionInfo() {
  var testHelper = new TestHelper().
      expect(CName.DESCRIBE_SESSION).
      withParameters({'sessionId': SESSION_ID}).
      andReturnError(ECode.UNKNOWN_ERROR, {'message': 'boom'}).
      replayAll();

  var driver = webdriver.WebDriver.attachToSession(testHelper.executor,
      SESSION_ID);
  return driver.getSession().then(fail, function(e) {
    assertEquals(bot.ErrorCode.UNKNOWN_ERROR, e.code);
    assertEquals('boom', e.message);
  });
}


function testAttachToSession_usesActiveFlowByDefault() {
  var testHelper = new TestHelper().
      expect(CName.DESCRIBE_SESSION).
      withParameters({'sessionId': SESSION_ID}).
      andReturnSuccess({}).
      replayAll();

  var driver = webdriver.WebDriver.attachToSession(testHelper.executor,
      SESSION_ID);
  assertEquals(driver.controlFlow(), webdriver.promise.controlFlow());

  return waitForIdle(driver.controlFlow());
}


function testAttachToSession_canAttachInCustomFlow() {
  var testHelper = new TestHelper().
      expect(CName.DESCRIBE_SESSION).
      withParameters({'sessionId': SESSION_ID}).
      andReturnSuccess({}).
      replayAll();

  var otherFlow = new webdriver.promise.ControlFlow();
  var driver = webdriver.WebDriver.attachToSession(
      testHelper.executor, SESSION_ID, otherFlow);
  assertEquals(otherFlow, driver.controlFlow());
  assertNotEquals(otherFlow, webdriver.promise.controlFlow());

  return waitForIdle(otherFlow);
}


function testCreateSession_happyPathWithCapabilitiesHashObject() {
  var testHelper = new TestHelper().
      expect(CName.NEW_SESSION).
      withParameters({
        'desiredCapabilities': {'browserName': 'firefox'}
      }).
      andReturnSuccess({'browserName': 'firefox'}).
      replayAll();

  var driver = webdriver.WebDriver.createSession(testHelper.executor, {
    'browserName': 'firefox'
  });
  return driver.getSession().then(function(session) {
    webdriver.test.testutil.assertObjectEquals({
      'value':'test_session_id'
    }, session.getId());
    assertEquals('firefox', session.getCapability('browserName'));
  });
}


function testCreateSession_happyPathWithCapabilitiesInstance() {
  var testHelper = new TestHelper().
      expect(CName.NEW_SESSION).
      withParameters({
        'desiredCapabilities': {'browserName': 'firefox'}
      }).
      andReturnSuccess({'browserName': 'firefox'}).
      replayAll();

  var driver = webdriver.WebDriver.createSession(
      testHelper.executor, webdriver.Capabilities.firefox());
  return driver.getSession().then(function(session) {
    webdriver.test.testutil.assertObjectEquals({
      'value':'test_session_id'
    }, session.getId());
    assertEquals('firefox', session.getCapability('browserName'));
  });
}


function testCreateSession_failsToCreateSession() {
  var testHelper = new TestHelper().
      expect(CName.NEW_SESSION).
      withParameters({
        'desiredCapabilities': {'browserName': 'firefox'}
      }).
      andReturnError(ECode.UNKNOWN_ERROR, {'message': 'boom'}).
      replayAll();

  var driver = webdriver.WebDriver.createSession(testHelper.executor, {
    'browserName': 'firefox'
  });
  return driver.getSession().then(fail, function(e) {
    assertEquals(bot.ErrorCode.UNKNOWN_ERROR, e.code);
    assertEquals('boom', e.message);
  });
}


function testCreateSession_usesActiveFlowByDefault() {
  var testHelper = new TestHelper().
      expect(CName.NEW_SESSION).
      withParameters({'desiredCapabilities': {}}).
      andReturnSuccess({}).
      replayAll();

  var driver = webdriver.WebDriver.createSession(testHelper.executor, {});
  assertEquals(webdriver.promise.controlFlow(), driver.controlFlow());

  return waitForIdle(driver.controlFlow());
}


function testCreateSession_canCreateInCustomFlow() {
  var testHelper = new TestHelper().
      expect(CName.NEW_SESSION).
      withParameters({'desiredCapabilities': {}}).
      andReturnSuccess({}).
      replayAll();

  var otherFlow = new webdriver.promise.ControlFlow(goog.global);
  var driver = webdriver.WebDriver.createSession(
      testHelper.executor, {}, otherFlow);
  assertEquals(otherFlow, driver.controlFlow());
  assertNotEquals(otherFlow, webdriver.promise.controlFlow());

  return waitForIdle(otherFlow);
}


function testToWireValue_function() {
  var fn = function() { return 'foo'; };
  return webdriver.WebDriver.toWireValue_(fn).then(function(value) {
    assertEquals(fn + '', value);
  });
}


function testToWireValue_date() {
  if (goog.userAgent.IE) {
    return;  // Because IE...
  }
  return webdriver.WebDriver.toWireValue_(new Date(605728511546)).
      then(function(value) {
        assertEquals('1989-03-12T17:55:11.546Z', value);
      });
}


function testToWireValue_simpleObject() {
  var expected = {'sessionId': 'foo'};
  return webdriver.WebDriver.toWireValue_({
    'sessionId': new webdriver.Session('foo', {})
  }).then(function(actual) {
    webdriver.test.testutil.assertObjectEquals(expected, actual);
  });
}


function testToWireValue_nestedObject() {
  var expected = {'sessionId': {'value': 'foo'}};
  return webdriver.WebDriver.toWireValue_({
    'sessionId': {
      'value': new webdriver.Session('foo', {})
    }
  }).then(function(actual) {
    webdriver.test.testutil.assertObjectEquals(expected, actual);
  });
}


function testToWireValue_capabilities() {
  var prefs = new webdriver.logging.Preferences();
  prefs.setLevel(webdriver.logging.Type.BROWSER,
      webdriver.logging.Level.DEBUG);

  var caps = webdriver.Capabilities.chrome();
  caps.set(webdriver.Capability.LOGGING_PREFS, prefs);

  return webdriver.WebDriver.toWireValue_(caps).then(function(actual) {
    webdriver.test.testutil.assertObjectEquals({
      'browserName': 'chrome',
      'loggingPrefs': {
        'browser': 'DEBUG'
      }
    }, actual);
  });
}


function testToWireValue_webElement() {
  var expected = {};
  expected[webdriver.WebElement.ELEMENT_KEY] = 'fefifofum';

  var element = new webdriver.WebElement(STUB_DRIVER, expected);
  return webdriver.WebDriver.toWireValue_(element).then(function(actual) {
    webdriver.test.testutil.assertObjectEquals(expected, actual);
  });
}


function testToWireValue_webElementPromise() {
  var expected = {};
  expected[webdriver.WebElement.ELEMENT_KEY] = 'fefifofum';

  var element = new webdriver.WebElement(STUB_DRIVER, expected);
  var elementPromise = new webdriver.WebElementPromise(STUB_DRIVER,
      webdriver.promise.fulfilled(element));
  return webdriver.WebDriver.toWireValue_(elementPromise).
      then(function(actual) {
        webdriver.test.testutil.assertObjectEquals(expected, actual);
      });
}


function testToWireValue_domElement() {
  assertThrows(
      goog.partial(webdriver.WebDriver.toWireValue_, document.body));
}


function testToWireValue_serializableObject() {
  /**
   * @constructor
   * @extends {webdriver.Serializable}
   */
  var CustomSerializable = function () {
    webdriver.Serializable.call(this);
  };
  goog.inherits(CustomSerializable, webdriver.Serializable);

  /** @override */
  CustomSerializable.prototype.serialize = function() {
    return webdriver.promise.fulfilled({
      name: webdriver.promise.fulfilled('bob'),
      age: 30
    });
  };

  var obj = new CustomSerializable();
  return webdriver.WebDriver.toWireValue_(obj).
      then(function(actual) {
        webdriver.test.testutil.assertObjectEquals(
            {name: 'bob', age: 30}, actual);
      });
}


function testToWireValue_simpleArray() {
  var expected = ['foo'];
  return webdriver.WebDriver.toWireValue_([new webdriver.Session('foo', {})]).
      then(function(actual) {
        assertArrayEquals(expected, actual);
      });
}


function testToWireValue_arrayWithWebElement() {
  var elementJson = {};
  elementJson[webdriver.WebElement.ELEMENT_KEY] = 'fefifofum';

  var element = new webdriver.WebElement(STUB_DRIVER, elementJson);
  return webdriver.WebDriver.toWireValue_([element]).
      then(function(actual) {
        assertTrue(goog.isArray(actual));
        assertEquals(1, actual.length);
        webdriver.test.testutil.assertObjectEquals(elementJson, actual[0]);
      });
}


function testToWireValue_arrayWithWebElementPromise() {
  var elementJson = {};
  elementJson[webdriver.WebElement.ELEMENT_KEY] = 'fefifofum';

  var element = new webdriver.WebElement(STUB_DRIVER, elementJson);
  var elementPromise = new webdriver.WebElementPromise(STUB_DRIVER,
      webdriver.promise.fulfilled(element));

  return webdriver.WebDriver.toWireValue_([elementPromise]).
      then(function(actual) {
        assertTrue(goog.isArray(actual));
        assertEquals(1, actual.length);
        webdriver.test.testutil.assertObjectEquals(elementJson, actual[0]);
      });
}


function testToWireValue_complexArray() {
  var elementJson = {};
  elementJson[webdriver.WebElement.ELEMENT_KEY] = 'fefifofum';
  var expected = ['abc', 123, true, elementJson, [123, {'foo': 'bar'}]];

  var element = new webdriver.WebElement(STUB_DRIVER, elementJson);
  var input = ['abc', 123, true, element, [123, {'foo': 'bar'}]];
  return webdriver.WebDriver.toWireValue_(input).
      then(function(actual) {
        webdriver.test.testutil.assertObjectEquals(expected, actual);
      });
}


function testToWireValue_arrayWithNestedPromises() {
  return webdriver.WebDriver.toWireValue_([
    'abc',
    webdriver.promise.fulfilled([
      123,
     webdriver.promise.fulfilled(true)
    ])
  ]).then(function(actual) {
    assertEquals(2, actual.length);
    assertEquals('abc', actual[0]);
    assertArrayEquals([123, true], actual[1]);
  });
}


function testToWireValue_complexHash() {
  var elementJson = {};
  elementJson[webdriver.WebElement.ELEMENT_KEY] = 'fefifofum';
  var expected = {
    'script': 'return 1',
    'args': ['abc', 123, true, elementJson, [123, {'foo': 'bar'}]],
    'sessionId': 'foo'
  };

  var element = new webdriver.WebElement(STUB_DRIVER, elementJson);
  var parameters = {
    'script': 'return 1',
    'args':['abc', 123, true, element, [123, {'foo': 'bar'}]],
    'sessionId': new webdriver.Session('foo', {})
  };

  return webdriver.WebDriver.toWireValue_(parameters).
      then(function(actual) {
        webdriver.test.testutil.assertObjectEquals(expected, actual);
      });
}


function testFromWireValue_primitives() {
  assertEquals(1, webdriver.WebDriver.fromWireValue_({}, 1));
  assertEquals('', webdriver.WebDriver.fromWireValue_({}, ''));
  assertEquals(true, webdriver.WebDriver.fromWireValue_({}, true));

  assertUndefined(webdriver.WebDriver.fromWireValue_({}, undefined));
  assertNull(webdriver.WebDriver.fromWireValue_({}, null));
}


function testFromWireValue_webElements() {
  var json = {};
  json[webdriver.WebElement.ELEMENT_KEY] = 'foo';

  var element = webdriver.WebDriver.fromWireValue_(STUB_DRIVER, json);
  assertEquals(STUB_DRIVER, element.getDriver());

  return element.getId().then(function(id) {
    webdriver.test.testutil.assertObjectEquals(json, id);
  });
}


function testFromWireValue_simpleObject() {
  var json = {'sessionId': 'foo'};
  var out = webdriver.WebDriver.fromWireValue_({}, json);
  webdriver.test.testutil.assertObjectEquals(json, out);
}


function testFromWireValue_nestedObject() {
  var json = {'foo': {'bar': 123}};
  var out = webdriver.WebDriver.fromWireValue_({}, json);
  webdriver.test.testutil.assertObjectEquals(json, out);
}


function testFromWireValue_array() {
  var json = [{'foo': {'bar': 123}}];
  var out = webdriver.WebDriver.fromWireValue_({}, json);
  webdriver.test.testutil.assertObjectEquals(json, out);
}


function testFromWireValue_passesThroughFunctionProperties() {
  var json = [{'foo': {'bar': 123}, 'func': goog.nullFunction}];
  var out = webdriver.WebDriver.fromWireValue_({}, json);
  webdriver.test.testutil.assertObjectEquals(json, out);
}


function testDoesNotExecuteCommandIfSessionDoesNotResolve() {
  var session = webdriver.promise.rejected(new StubError);
  var testHelper = new TestHelper().replayAll();
  testHelper.createDriver(session).getTitle();
  return waitForAbort().then(assertIsStubError);
}


function testCommandReturnValuesArePassedToFirstCallback() {
  var testHelper = new TestHelper().
      expect(CName.GET_TITLE).andReturnSuccess('Google Search').
      replayAll();

  var driver = testHelper.createDriver();
  return driver.getTitle().then(function(title) {
    assertEquals('Google Search', title);
  });
}


function testStopsCommandExecutionWhenAnErrorOccurs() {
  var testHelper = new TestHelper().
      expect(CName.SWITCH_TO_WINDOW).
      withParameters({'name': 'foo'}).
      andReturnError(ECode.NO_SUCH_WINDOW, {'message': 'window not found'}).
      replayAll();

  var driver = testHelper.createDriver();
  driver.switchTo().window('foo');
  driver.getTitle();  // mock should blow if this gets executed

  return waitForAbort().
      then(expectedError(ECode.NO_SUCH_WINDOW, 'window not found'));
}


function testCanSuppressCommandFailures() {
  var testHelper = new TestHelper().
      expect(CName.SWITCH_TO_WINDOW).
          withParameters({'name': 'foo'}).
          andReturnError(ECode.NO_SUCH_WINDOW, {'message': 'window not found'}).
      expect(CName.GET_TITLE).
          andReturnSuccess('Google Search').
      replayAll();

  var driver = testHelper.createDriver();
  driver.switchTo().window('foo').thenCatch(function(e) {
    assertEquals(ECode.NO_SUCH_WINDOW, e.code);
    assertEquals('window not found', e.message);
  });
  driver.getTitle();
  return waitForIdle();
}


function testErrorsPropagateUpToTheRunningApplication() {
  var testHelper = new TestHelper().
      expect(CName.SWITCH_TO_WINDOW).
          withParameters({'name':'foo'}).
          andReturnError(ECode.NO_SUCH_WINDOW, {'message': 'window not found'}).
      replayAll();

  testHelper.createDriver().switchTo().window('foo');
  return waitForAbort().
      then(expectedError(ECode.NO_SUCH_WINDOW, 'window not found'));
}


function testErrbacksThatReturnErrorsStillSwitchToCallbackChain() {
  var testHelper = new TestHelper().
      expect(CName.SWITCH_TO_WINDOW).
          withParameters({'name':'foo'}).
          andReturnError(ECode.NO_SUCH_WINDOW, {'message':'window not found'}).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.switchTo().window('foo').
      thenCatch(function() { return new StubError; });
      then(assertIsStubError);
}


function testErrbacksThrownCanOverrideOriginalError() {
  var testHelper = new TestHelper().
      expect(CName.SWITCH_TO_WINDOW, {'name': 'foo'}).
      andReturnError(ECode.NO_SUCH_WINDOW, {'message':'window not found'}).
      replayAll();

  var driver = testHelper.createDriver();
  driver.switchTo().window('foo').thenCatch(throwStubError);

  return waitForAbort().then(assertIsStubError);
}


function testCannotScheduleCommandsIfTheSessionIdHasBeenDeleted() {
  var testHelper = new TestHelper().replayAll();
  var driver = testHelper.createDriver();
  delete driver.session_;
  assertThrows(goog.bind(driver.get, driver, 'http://www.google.com'));
}


function testDeletesSessionIdAfterQuitting() {
  var driver;
  var testHelper = new TestHelper().
      expect(CName.QUIT).
      replayAll();

  driver = testHelper.createDriver();
  return driver.quit().then(function() {
    assertUndefined('Session ID should have been deleted', driver.session_);
  });
}


function testReportsErrorWhenExecutingCommandsAfterExecutingAQuit() {
  var testHelper = new TestHelper().
      expect(CName.QUIT).
      replayAll();

  var driver = testHelper.createDriver();
  driver.quit();
  driver.get('http://www.google.com');
  return waitForAbort().
      then(expectedError(undefined,
          'This driver instance does not have a valid session ID ' +
          '(did you call WebDriver.quit()?) and may no longer be used.'));
}


function testCallbackCommandsExecuteBeforeNextCommand() {
  var testHelper = new TestHelper().
      expect(CName.GET_CURRENT_URL).
      expect(CName.GET, {'url': 'http://www.google.com'}).
      expect(CName.CLOSE).
      expect(CName.GET_TITLE).
      replayAll();

  var driver = testHelper.createDriver();
  driver.getCurrentUrl().then(function() {
    driver.get('http://www.google.com').then(function() {
      driver.close();
    });
  });
  driver.getTitle();

  return waitForIdle();
}


function testEachCallbackFrameRunsToCompletionBeforeTheNext() {
  var testHelper = new TestHelper().
      expect(CName.GET_TITLE).
      expect(CName.GET_CURRENT_URL).
      expect(CName.GET_CURRENT_WINDOW_HANDLE).
      expect(CName.CLOSE).
      expect(CName.QUIT).
      replayAll();

  var driver = testHelper.createDriver();
  driver.getTitle().
      // Everything in this callback...
      then(function() {
        driver.getCurrentUrl();
        driver.getWindowHandle();
      }).
      // ...should execute before everything in this callback.
      then(function() {
        driver.close();
      });
  // This should execute after everything above
  driver.quit();

  return waitForIdle();
}


function testNestedCommandFailuresBubbleUpToGlobalHandlerIfUnsuppressed() {
  var testHelper = new TestHelper().
      expect(CName.GET_TITLE).
      expect(CName.SWITCH_TO_WINDOW, {'name': 'foo'}).
          andReturnError(ECode.NO_SUCH_WINDOW, {'message':'window not found'}).
      replayAll();

  var driver = testHelper.createDriver();
  driver.getTitle().then(function() {
    driver.switchTo().window('foo');
  });

  return waitForAbort().
      then(expectedError(ECode.NO_SUCH_WINDOW, 'window not found'));
}


function testNestedCommandFailuresCanBeSuppressWhenTheyOccur() {
  var testHelper = new TestHelper().
      expect(CName.GET_TITLE).
      expect(CName.SWITCH_TO_WINDOW, {'name':'foo'}).
          andReturnError(ECode.NO_SUCH_WINDOW, {'message':'window not found'}).
      expect(CName.CLOSE).
      replayAll();

  var driver = testHelper.createDriver();
  driver.getTitle().then(function() {
    driver.switchTo().window('foo').thenCatch(goog.nullFunction);
  });
  driver.close();

  return waitForIdle();
}


function testNestedCommandFailuresBubbleUpThroughTheFrameStack() {
  var testHelper = new TestHelper().
      expect(CName.GET_TITLE).
      expect(CName.SWITCH_TO_WINDOW, {'name':'foo'}).
          andReturnError(ECode.NO_SUCH_WINDOW, {'message':'window not found'}).
      replayAll();

  var driver = testHelper.createDriver();
  driver.getTitle().
      then(function() {
        return driver.switchTo().window('foo');
      }).
      thenCatch(function(e) {
        assertEquals(ECode.NO_SUCH_WINDOW, e.code);
        assertEquals('window not found', e.message);
      });

  return waitForIdle();
}


function testNestedCommandFailuresCanBeCaughtAndSuppressed() {
  var testHelper = new TestHelper().
      expect(CName.GET_TITLE).
      expect(CName.GET_CURRENT_URL).
      expect(CName.SWITCH_TO_WINDOW, {'name':'foo'}).
          andReturnError(ECode.NO_SUCH_WINDOW, {'message':'window not found'}).
      expect(CName.CLOSE).
      replayAll();

  var driver = testHelper.createDriver();
  driver.getTitle().then(function() {
    driver.getCurrentUrl().
        then(function() {
          return driver.switchTo().window('foo');
        }).
        thenCatch(goog.nullFunction);
    driver.close();
  });

  return waitForIdle();
}


function testReturningADeferredResultFromACallback() {
  var testHelper = new TestHelper().
      expect(CName.GET_TITLE).
      expect(CName.GET_CURRENT_URL).
          andReturnSuccess('http://www.google.com').
      replayAll();

  var driver = testHelper.createDriver();
  driver.getTitle().
      then(function() {
        return driver.getCurrentUrl();
      }).
      then(function(value) {
        assertEquals('http://www.google.com', value);
      });
  return waitForIdle();
}


function testReturningADeferredResultFromAnErrbackSuppressesTheError() {
  var count = 0;
  var testHelper = new TestHelper().
      expect(CName.SWITCH_TO_WINDOW, {'name':'foo'}).
          andReturnError(ECode.NO_SUCH_WINDOW, {'message':'window not found'}).
      expect(CName.GET_CURRENT_URL).
          andReturnSuccess('http://www.google.com').
      replayAll();

  var driver = testHelper.createDriver();
  driver.switchTo().window('foo').
      thenCatch(function(e) {
        assertEquals(ECode.NO_SUCH_WINDOW, e.code);
        assertEquals('window not found', e.message);
        count += 1;
        return driver.getCurrentUrl();
      }).
      then(function(url) {
        count += 1;
        assertEquals('http://www.google.com', url);
      });
  return waitForIdle().then(function() {
    assertEquals(2, count);
  });
}


function testExecutingACustomFunctionThatReturnsANonDeferred() {
  var testHelper = new TestHelper().replayAll();

  var driver = testHelper.createDriver();
  return driver.call(goog.functions.constant('abc123')).then(function(value) {
    assertEquals('abc123', value);
  });
}


function testExecutionOrderwithCustomFunctions() {
  var msg = [];
  var testHelper = new TestHelper().
      expect(CName.GET_TITLE).andReturnSuccess('cheese ').
      expect(CName.GET_CURRENT_URL).andReturnSuccess('tasty').
      replayAll();

  var driver = testHelper.createDriver();

  var pushMsg = goog.bind(msg.push, msg);
  driver.getTitle().then(pushMsg);
  driver.call(goog.functions.constant('is ')).then(pushMsg);
  driver.getCurrentUrl().then(pushMsg);
  driver.call(goog.functions.constant('!')).then(pushMsg);

  return waitForIdle().then(function() {
    assertEquals('cheese is tasty!', msg.join(''));
  });
}


function testPassingArgumentsToACustomFunction() {
  var testHelper = new TestHelper().replayAll();

  var add = function(a, b) {
    return a + b;
  };
  var driver = testHelper.createDriver();
  return driver.call(add, null, 1, 2).then(function(value) {
    assertEquals(3, value);
  });
}

function testPassingPromisedArgumentsToACustomFunction() {
  var testHelper = new TestHelper().replayAll();

  var promisedArg = webdriver.promise.fulfilled(2);
  var add = function(a, b) {
    return a + b;
  };
  var driver = testHelper.createDriver();
  return driver.call(add, null, 1, promisedArg).then(function(value) {
    assertEquals(3, value);
  });
}

function testPassingArgumentsAndScopeToACustomFunction() {
  function Foo(name) {
    this.name = name;
  }
  Foo.prototype.getName = function() {
    return this.name;
  };
  var foo = new Foo('foo');

  var testHelper = new TestHelper().replayAll();
  var driver = testHelper.createDriver();
  return driver.call(foo.getName, foo).then(function(value) {
    assertEquals('foo', value);
  });
}


function testExecutingACustomFunctionThatThrowsAnError() {
  var testHelper = new TestHelper().replayAll();
  var driver = testHelper.createDriver();
  return driver.call(goog.functions.error('bam!')).then(fail, function(e) {
    assertTrue(e instanceof Error);
    assertEquals('bam!', e.message);
  });
}


function testExecutingACustomFunctionThatSchedulesCommands() {
  var testHelper = new TestHelper().
      expect(CName.GET_TITLE).
      expect(CName.CLOSE).
      expect(CName.QUIT).
      replayAll();

  var driver = testHelper.createDriver();
  driver.call(function() {
    driver.getTitle();
    driver.close();
  });
  driver.quit();
  return waitForIdle();
}


function testExecutingAFunctionThatReturnsATaskResultAfterSchedulingAnother() {
  var testHelper = new TestHelper().
      expect(CName.GET_TITLE).
          andReturnSuccess('Google Search').
      expect(CName.CLOSE).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.call(function() {
    var title = driver.getTitle();
    driver.close();
    return title;
  }).then(function(title) {
    assertEquals('Google Search', title);
  });
}


function testExecutingACustomFunctionWhoseNestedCommandFails() {
  var testHelper = new TestHelper().
      expect(CName.SWITCH_TO_WINDOW, {'name': 'foo'}).
          andReturnError(ECode.NO_SUCH_WINDOW, {'message':'window not found'}).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.call(function() {
    return driver.switchTo().window('foo');
  }).then(fail, function(e) {
    assertEquals(ECode.NO_SUCH_WINDOW, e.code);
    assertEquals('window not found', e.message);
  });
}


function testCustomFunctionDoesNotCompleteUntilReturnedPromiseIsResolved() {
  var testHelper = new TestHelper().replayAll();

  var order = [];
  var driver = testHelper.createDriver();

  var d = webdriver.promise.defer();
  d.promise.then(function() {
    order.push('b');
  });

  driver.call(function() {
    order.push('a');
    return d.promise;
  });
  driver.call(function() {
    order.push('c');
  });

  // timeout to ensure the first function starts its execution before we
  // trigger d's callbacks.
  return new Promise(f => setTimeout(f, 0)).then(function() {
    assertArrayEquals(['a'], order);
    d.fulfill();
    return waitForIdle().then(function() {
      assertArrayEquals(['a', 'b', 'c'], order);
    });
  });
}


function testNestedFunctionCommandExecutionOrder() {
  var msg = [];
  var testHelper = new TestHelper().replayAll();

  var driver = testHelper.createDriver();
  driver.call(msg.push, msg, 'a');
  driver.call(function() {
    driver.call(msg.push, msg, 'c');
    driver.call(function() {
      driver.call(msg.push, msg, 'e');
      driver.call(msg.push, msg, 'f');
    });
    driver.call(msg.push, msg, 'd');
  });
  driver.call(msg.push, msg, 'b');
  return waitForIdle().then(function() {
    assertEquals('acefdb', msg.join(''));
  });
}


function testExecutingNestedFunctionCommands() {
  var msg = [];
  var testHelper = new TestHelper().replayAll();
  var driver = testHelper.createDriver();
  var pushMsg = goog.bind(msg.push, msg);
  driver.call(goog.functions.constant('cheese ')).then(pushMsg);
  driver.call(function() {
    driver.call(goog.functions.constant('is ')).then(pushMsg);
    driver.call(goog.functions.constant('tasty')).then(pushMsg);
  });
  driver.call(goog.functions.constant('!')).then(pushMsg);
  return waitForIdle().then(function() {
    assertEquals('cheese is tasty!', msg.join(''));
  });
}


function testReturnValuesFromNestedFunctionCommands() {
  var testHelper = new TestHelper().replayAll();
  var driver = testHelper.createDriver();
  return driver.call(function() {
    return driver.call(function() {
      return driver.call(goog.functions.constant('foobar'));
    });
  }).then(function(value) {
    assertEquals('foobar', value);
  });
}


function testExecutingANormalCommandAfterNestedCommandsThatReturnsAnAction() {
  var msg = [];
  var testHelper = new TestHelper().
      expect(CName.CLOSE).
      replayAll();
  var driver = testHelper.createDriver();
  driver.call(function() {
    return driver.call(function() {
      msg.push('a');
      return driver.call(goog.functions.constant('foobar'));
    });
  });
  driver.close().then(function() {
    msg.push('b');
  });
  return waitForIdle().then(function() {
    assertEquals('ab', msg.join(''));
  });
}


function testNestedCommandErrorsBubbleUp_caught() {
  var testHelper = new TestHelper().replayAll();
  var driver = testHelper.createDriver();
  var result = driver.call(function() {
    return driver.call(function() {
      return driver.call(goog.functions.error('bam!'));
    });
  }).then(fail, expectedError(undefined, 'bam!'));
  return goog.Promise.all([waitForIdle(), result]);
}


function testNestedCommandErrorsBubbleUp_uncaught() {
  var testHelper = new TestHelper().replayAll();
  var driver = testHelper.createDriver();
  driver.call(function() {
    return driver.call(function() {
      return driver.call(goog.functions.error('bam!'));
    });
  });
  return waitForAbort().then(expectedError(undefined, 'bam!'));
}


function testExecutingNestedCustomFunctionsThatSchedulesCommands() {
  var testHelper = new TestHelper().
      expect(CName.GET_TITLE).
      expect(CName.CLOSE).
      replayAll();

  var driver = testHelper.createDriver();
  driver.call(function() {
    driver.call(function() {
      driver.getTitle();
    });
    driver.close();
  });
  return waitForIdle();
}


function testExecutingACustomFunctionThatReturnsADeferredAction() {
  var testHelper = new TestHelper().
      expect(CName.GET_TITLE).andReturnSuccess('Google').
      replayAll();

  var driver = testHelper.createDriver();
  driver.call(function() {
    return driver.getTitle();
  }).then(function(title) {
    assertEquals('Google', title);
  });
  return waitForIdle();
}

function testWebElementPromise_resolvesWhenUnderlyingElementDoes() {
  var el = new webdriver.WebElement(STUB_DRIVER, {'ELEMENT': 'foo'});
  var promise = webdriver.promise.fulfilled(el);
  return new webdriver.WebElementPromise(STUB_DRIVER, promise).
      then(function(e) {
        assertEquals(e, el);
      });
}

function testWebElement_resolvesBeforeCallbacksOnWireValueTrigger() {
  var el = new webdriver.promise.Deferred();

  var element = new webdriver.WebElementPromise(STUB_DRIVER, el.promise);
  var messages = [];

  element.then(function() {
    messages.push('element resolved');
  });
  element.getId().then(function() {
    messages.push('wire value resolved');
  });

  assertArrayEquals([], messages);
  el.fulfill(new webdriver.WebElement(STUB_DRIVER, {'ELEMENT': 'foo'}));
  return waitForIdle().then(function() {
    assertArrayEquals([
      'element resolved',
      'wire value resolved'
    ], messages);
  });
}

function testWebElement_isRejectedIfUnderlyingIdIsRejected() {
  var element = new webdriver.WebElementPromise(
      STUB_DRIVER, webdriver.promise.rejected(new StubError));
  return element.then(fail, assertIsStubError);
}


function testExecuteScript_nullReturnValue() {
  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT).
          withParameters({
            'script': 'return document.body;',
            'args': []
          }).
          andReturnSuccess(null).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.executeScript('return document.body;').then(function(result) {
    assertNull(result);
  });
}


function testExecuteScript_primitiveReturnValue() {
  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT).
          withParameters({
            'script': 'return document.body;',
            'args': []
          }).
          andReturnSuccess(123).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.executeScript('return document.body;').then(function(result) {
    assertEquals(123, result);
  });
}


function testExecuteScript_webElementReturnValue() {
  var json = {};
  json[webdriver.WebElement.ELEMENT_KEY] = 'foo';

  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT).
          withParameters({
            'script': 'return document.body;',
            'args': []
          }).
          andReturnSuccess(json).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.executeScript('return document.body;').
      then(function(webelement) {
        return webdriver.promise.when(webelement.id_, function(id) {
          webdriver.test.testutil.assertObjectEquals(id, json);
        });
      });
}


function testExecuteScript_arrayReturnValue() {
  var json = [{}];
  json[0][webdriver.WebElement.ELEMENT_KEY] = 'foo';

  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT).
          withParameters({
            'script': 'return document.body;',
            'args': []
          }).
          andReturnSuccess(json).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.executeScript('return document.body;').
      then(function(array) {
        return webdriver.promise.when(array[0].id_, function(id) {
          webdriver.test.testutil.assertObjectEquals(id, json[0]);
        });
      });
}


function testExecuteScript_objectReturnValue() {
  var json = {'foo':{}};
  json['foo'][webdriver.WebElement.ELEMENT_KEY] = 'foo';

  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT).
          withParameters({
            'script': 'return document.body;',
            'args': []
          }).
          andReturnSuccess(json).
      replayAll();

  var driver = testHelper.createDriver();
  var callback;
  return driver.executeScript('return document.body;').
      then(function(obj) {
        return webdriver.promise.when(obj['foo'].id_, function(id) {
          webdriver.test.testutil.assertObjectEquals(id, json['foo']);
        });
      });
}


function testExecuteScript_scriptAsFunction() {
  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT).
          withParameters({
            'script': 'return (' + goog.nullFunction +
                      ').apply(null, arguments);',
            'args': []
          }).
          andReturnSuccess(null).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.executeScript(goog.nullFunction);
}


function testExecuteScript_simpleArgumentConversion() {
  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT).
          withParameters({
            'script': 'return 1;',
            'args': ['abc', 123, true, [123, {'foo': 'bar'}]]
          }).
          andReturnSuccess(null).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.executeScript(
      'return 1;', 'abc', 123, true, [123, {'foo': 'bar'}]);
}


function testExecuteScript_webElementArgumentConversion() {
  var elementJson = {};
  elementJson[webdriver.WebElement.ELEMENT_KEY] = 'fefifofum';

  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT).
          withParameters({
            'script': 'return 1;',
            'args': [elementJson]
          }).
          andReturnSuccess(null).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.executeScript('return 1;',
      new webdriver.WebElement(driver, elementJson));
}


function testExecuteScript_webElementPromiseArgumentConversion() {
  var elementJson = {'ELEMENT':'bar'};

  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENT, {'using':'id', 'value':'foo'}).
          andReturnSuccess(elementJson).
      expect(CName.EXECUTE_SCRIPT).
          withParameters({
            'script': 'return 1;',
            'args': [elementJson]
          }).
          andReturnSuccess(null).
      replayAll();

  var driver = testHelper.createDriver();
  var element = driver.findElement(By.id('foo'));
  return driver.executeScript('return 1;', element);
}


function testExecuteScript_argumentConversion() {
  var elementJson = {};
  elementJson[webdriver.WebElement.ELEMENT_KEY] = 'fefifofum';

  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT).
          withParameters({
            'script': 'return 1;',
            'args': ['abc', 123, true, elementJson, [123, {'foo': 'bar'}]]
          }).
          andReturnSuccess(null).
      replayAll();

  var driver = testHelper.createDriver();
  var element = new webdriver.WebElement(driver, elementJson);
  return driver.executeScript('return 1;',
      'abc', 123, true, element, [123, {'foo': 'bar'}]);
}


function testExecuteScript_scriptReturnsAnError() {
  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT).
          withParameters({
            'script': 'throw Error(arguments[0]);',
            'args': ['bam']
          }).
          andReturnError(ECode.UNKNOWN_ERROR, {'message':'bam'}).
      replayAll();
  var driver = testHelper.createDriver();
  return driver.executeScript('throw Error(arguments[0]);', 'bam').
      then(fail, expectedError(ECode.UNKNOWN_ERROR, 'bam'));
}


function testExecuteScript_failsIfArgumentIsARejectedPromise() {
  var testHelper = new TestHelper().replayAll();

  var arg = webdriver.promise.rejected(new StubError);
  arg.thenCatch(goog.nullFunction);  // Suppress default handler.

  var driver = testHelper.createDriver();
  return driver.executeScript(goog.nullFunction, arg).
      then(fail, assertIsStubError);
}


function testExecuteAsyncScript_failsIfArgumentIsARejectedPromise() {
  var testHelper = new TestHelper().replayAll();

  var arg = webdriver.promise.rejected(new StubError);
  arg.thenCatch(goog.nullFunction);  // Suppress default handler.

  var driver = testHelper.createDriver();
  return driver.executeAsyncScript(goog.nullFunction, arg).
      then(fail, assertIsStubError);
}


function testFindElement_elementNotFound() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENT, {'using':'id', 'value':'foo'}).
      andReturnError(ECode.NO_SUCH_ELEMENT, {
          'message':'Unable to find element'
      }).
      replayAll();

  var driver = testHelper.createDriver();
  var element = driver.findElement(By.id('foo'));
  element.click();  // This should never execute.
  return waitForAbort().then(
      expectedError(ECode.NO_SUCH_ELEMENT, 'Unable to find element'));
}


function testFindElement_elementNotFoundInACallback() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENT, {'using':'id', 'value':'foo'}).
      andReturnError(
          ECode.NO_SUCH_ELEMENT, {'message':'Unable to find element'}).
      replayAll();

  var driver = testHelper.createDriver();
  webdriver.promise.fulfilled().then(function() {
    var element = driver.findElement(By.id('foo'));
    return element.click();  // Should not execute.
  });
  return waitForAbort().then(
      expectedError(ECode.NO_SUCH_ELEMENT, 'Unable to find element'));
}


function testFindElement_elementFound() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENT, {'using':'id', 'value':'foo'}).
          andReturnSuccess({'ELEMENT':'bar'}).
      expect(CName.CLICK_ELEMENT, {'id':{'ELEMENT':'bar'}}).
          andReturnSuccess().
      replayAll();

  var driver = testHelper.createDriver();
  var element = driver.findElement(By.id('foo'));
  element.click();
  return waitForIdle();
}


function testFindElement_canUseElementInCallback() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENT, {'using':'id', 'value':'foo'}).
          andReturnSuccess({'ELEMENT':'bar'}).
      expect(CName.CLICK_ELEMENT, {'id':{'ELEMENT':'bar'}}).
          andReturnSuccess().
      replayAll();

  var driver = testHelper.createDriver();
  driver.findElement(By.id('foo')).then(function(element) {
    element.click();
  });
  return waitForIdle();
}


function testFindElement_byJs() {
  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT, {
        'script': 'return document.body',
        'args': []
      }).
      andReturnSuccess({'ELEMENT':'bar'}).
      expect(CName.CLICK_ELEMENT, {'id':{'ELEMENT':'bar'}}).
      replayAll();

  var driver = testHelper.createDriver();
  var element = driver.findElement(By.js('return document.body'));
  element.click();  // just to make sure
  return waitForIdle();
}


function testFindElement_byJs_returnsNonWebElementValue() {
  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT, {'script': 'return 123', 'args': []}).
      andReturnSuccess(123).
      replayAll();

  var driver = testHelper.createDriver();
  var element = driver.findElement(By.js('return 123'));
  element.click();  // Should not execute.
  return waitForAbort().then(function(e) {
    assertEquals(
        'Not the expected error message',
        'Custom locator did not return a WebElement', e.message);
  });
}


function testFindElement_byJs_canPassArguments() {
  var script = 'return document.getElementsByTagName(arguments[0]);';
  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT, {
        'script': script,
        'args': ['div']
      }).
      andReturnSuccess({'ELEMENT':'one'}).
      replayAll();
  var driver = testHelper.createDriver();
  driver.findElement(By.js(script, 'div'));
  return waitForIdle();
}


function testFindElement_customLocator() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENTS, {'using':'tag name', 'value':'a'}).
      andReturnSuccess([{'ELEMENT':'foo'}, {'ELEMENT':'bar'}]).
      expect(CName.CLICK_ELEMENT, {'id':{'ELEMENT':'foo'}}).
      andReturnSuccess().
      replayAll();

  var driver = testHelper.createDriver();
  var element = driver.findElement(function(d) {
    assertEquals(driver, d);
    return d.findElements(By.tagName('a'));
  });
  element.click();
  return waitForIdle();
}


function testFindElement_customLocatorThrowsIfResultIsNotAWebElement() {
  var testHelper = new TestHelper().replayAll();

  var driver = testHelper.createDriver();
  driver.findElement(function() {
    return 1;
  });
  return waitForAbort().then(function(e) {
    assertEquals(
        'Not the expected error message',
        'Custom locator did not return a WebElement', e.message);
  });
}


function testIsElementPresent_elementNotFound() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENTS, {'using':'id', 'value':'foo'}).
      andReturnSuccess([]).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.isElementPresent(By.id('foo')).then(assertFalse);
}


function testIsElementPresent_elementFound() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENTS, {'using':'id', 'value':'foo'}).
      andReturnSuccess([{'ELEMENT':'bar'}]).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.isElementPresent(By.id('foo')).then(assertTrue);
}


function testIsElementPresent_letsErrorsPropagate() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENTS, {'using':'id', 'value':'foo'}).
      andReturnError(ECode.UNKNOWN_ERROR, {'message':'There is no spoon'}).
      replayAll();

  var driver = testHelper.createDriver();
  driver.isElementPresent(By.id('foo'));
  return waitForAbort().then(
      expectedError(ECode.UNKNOWN_ERROR, 'There is no spoon'));
}


function testIsElementPresent_byJs() {
  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT, {'script': 'return 123', 'args': []}).
      andReturnSuccess([{'ELEMENT':'bar'}]).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.isElementPresent(By.js('return 123')).then(assertTrue);
}


function testIsElementPresent_byJs_canPassScriptArguments() {
  var script = 'return document.getElementsByTagName(arguments[0]);';
  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT, {
        'script': script,
        'args': ['div']
      }).
      andReturnSuccess({'ELEMENT':'one'}).
      replayAll();

  var driver = testHelper.createDriver();
  driver.isElementPresent(By.js(script, 'div'));
  return waitForIdle();
}


function testFindElements() {
  var json = [
      {'ELEMENT':'foo'},
      {'ELEMENT':'bar'},
      {'ELEMENT':'baz'}
  ];
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENTS, {'using':'tag name', 'value':'a'}).
      andReturnSuccess(json).
      replayAll();

  var driver = testHelper.createDriver();
  driver.findElements(By.tagName('a')).then(function(elements) {
    assertEquals(3, elements.length);

    var callbacks = new Array(3);
    assertTypeAndId(0);
    assertTypeAndId(1);
    assertTypeAndId(2);

    return webdriver.promise.all(callbacks);

    function assertTypeAndId(index) {
      assertTrue('Not a WebElement at index ' + index,
          elements[index] instanceof webdriver.WebElement);
      callbacks[index] = elements[index].getId().then(function(id) {
        webdriver.test.testutil.assertObjectEquals(json[index], id);
      });
    }
  });
}


function testFindElements_byJs() {
  var json = [
      {'ELEMENT':'foo'},
      {'ELEMENT':'bar'},
      {'ELEMENT':'baz'}
  ];
  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT, {
        'script': 'return document.getElementsByTagName("div");',
        'args': []
      }).
      andReturnSuccess(json).
      replayAll();

  var driver = testHelper.createDriver();

  return driver.
      findElements(By.js('return document.getElementsByTagName("div");')).
      then(function(elements) {
        var callbacks = new Array(3);
        assertEquals(3, elements.length);

        assertTypeAndId(0);
        assertTypeAndId(1);
        assertTypeAndId(2);
        return webdriver.promise.all(callbacks);

        function assertTypeAndId(index) {
          assertTrue('Not a WebElement at index ' + index,
              elements[index] instanceof webdriver.WebElement);
          callbacks[index] = elements[index].getId().then(function(id) {
            webdriver.test.testutil.assertObjectEquals(json[index], id);
          });
        }
      });
}


function testFindElements_byJs_filtersOutNonWebElementResponses() {
  var json = [
      {'ELEMENT':'foo'},
      123,
      'a',
      false,
      {'ELEMENT':'bar'},
      {'not a web element': 1},
      {'ELEMENT':'baz'}
  ];
  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT, {
        'script': 'return document.getElementsByTagName("div");',
        'args': []
      }).
      andReturnSuccess(json).
      replayAll();

  var driver = testHelper.createDriver();
  driver.findElements(By.js('return document.getElementsByTagName("div");')).
      then(function(elements) {
        assertEquals(3, elements.length);
        var callbacks = new Array(3);
        assertTypeAndId(0, 0);
        assertTypeAndId(1, 4);
        assertTypeAndId(2, 6);
        return webdriver.promise.all(callbacks);

        function assertTypeAndId(index, jsonIndex) {
          assertTrue('Not a WebElement at index ' + index,
              elements[index] instanceof webdriver.WebElement);
          callbacks[index] = elements[index].getId().then(function(id) {
            webdriver.test.testutil.assertObjectEquals(json[jsonIndex], id);
          });
        }
      });
  return waitForIdle();
}


function testFindElements_byJs_convertsSingleWebElementResponseToArray() {
  var json = {'ELEMENT':'foo'};
  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT, {
        'script': 'return document.getElementsByTagName("div");',
        'args': []
      }).
      andReturnSuccess(json).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.
      findElements(By.js('return document.getElementsByTagName("div");')).
      then(function(elements) {
        assertEquals(1, elements.length);
        assertTrue(elements[0] instanceof webdriver.WebElement);
        return elements[0].getId().then(function(id) {
          webdriver.test.testutil.assertObjectEquals(json, id);
        });
      });
}


function testFindElements_byJs_canPassScriptArguments() {
  var script = 'return document.getElementsByTagName(arguments[0]);';
  var testHelper = new TestHelper().
      expect(CName.EXECUTE_SCRIPT, {
        'script': script,
        'args': ['div']
      }).
      andReturnSuccess([{'ELEMENT':'one'}, {'ELEMENT':'two'}]).
      replayAll();

  var driver = testHelper.createDriver();
  driver.findElements(By.js(script, 'div'));
  return waitForIdle();
}


function testSendKeysConvertsVarArgsIntoStrings_simpleArgs() {
  var testHelper = new TestHelper().
      expect(CName.SEND_KEYS_TO_ELEMENT, {'id':{'ELEMENT':'one'},
                                          'value':['1','2','abc','3']}).
          andReturnSuccess().
      replayAll();

  var driver = testHelper.createDriver();
  var element = new webdriver.WebElement(driver, {'ELEMENT': 'one'});
  element.sendKeys(1, 2, 'abc', 3);
  return waitForIdle();
}


function testSendKeysConvertsVarArgsIntoStrings_promisedArgs() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENT, {'using':'id', 'value':'foo'}).
          andReturnSuccess({'ELEMENT':'one'}).
      expect(CName.SEND_KEYS_TO_ELEMENT, {'id':{'ELEMENT':'one'},
                                          'value':['abc', '123', 'def']}).
          andReturnSuccess().
      replayAll();

  var driver = testHelper.createDriver();
  var element = driver.findElement(By.id('foo'));
  element.sendKeys(
      webdriver.promise.fulfilled('abc'), 123,
      webdriver.promise.fulfilled('def'));
  return waitForIdle();
}


function testSendKeysWithAFileDetector() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENT, {'using':'id', 'value':'foo'}).
          andReturnSuccess({'ELEMENT':'one'}).
      expect(CName.SEND_KEYS_TO_ELEMENT, {'id':{'ELEMENT':'one'},
                                          'value':['modified/path']}).
          andReturnSuccess().
      replayAll();

  var driver = testHelper.createDriver();

  var mockDetector = mockControl.createStrictMock(webdriver.FileDetector);
  mockDetector.handleFile(driver, 'original/path').
      $returns(webdriver.promise.fulfilled('modified/path'));
  mockDetector.$replay();

  driver.setFileDetector(mockDetector);

  var element = driver.findElement(By.id('foo'));
  element.sendKeys('original/', 'path');
}

function testElementEquality_isReflexive() {
  var a = new webdriver.WebElement(STUB_DRIVER, 'foo');
  return webdriver.WebElement.equals(a, a).then(assertTrue);
}

function testElementEquals_doesNotSendRpcIfElementsHaveSameId() {
  var a = new webdriver.WebElement(STUB_DRIVER, 'foo'),
      b = new webdriver.WebElement(STUB_DRIVER, 'foo'),
      c = new webdriver.WebElement(STUB_DRIVER, 'foo');
  return webdriver.promise.all([
    webdriver.WebElement.equals(a, b).then(
        goog.partial(assertTrue, 'a should == b!')),
    webdriver.WebElement.equals(b, a).then(
        goog.partial(assertTrue, 'symmetry check failed')),
    webdriver.WebElement.equals(a, c).then(
        goog.partial(assertTrue, 'a should == c!')),
    webdriver.WebElement.equals(b, c).then(
        goog.partial(assertTrue, 'transitive check failed'))
  ]);
}

function testElementEquals_sendsRpcIfElementsHaveDifferentIds() {
  var id1 = {'ELEMENT':'foo'};
  var id2 = {'ELEMENT':'bar'};
  var testHelper = new TestHelper().
      expect(CName.ELEMENT_EQUALS, {'id':id1, 'other':id2}).
      andReturnSuccess(true).
      replayAll();

  var driver = testHelper.createDriver();
  var a = new webdriver.WebElement(driver, id1),
      b = new webdriver.WebElement(driver, id2);
  return webdriver.WebElement.equals(a, b).then(assertTrue);
}


function testElementEquals_failsIfAnInputElementCouldNotBeFound() {
  var testHelper = new TestHelper().replayAll();

  var id = webdriver.promise.rejected(new StubError);
  id.thenCatch(goog.nullFunction);  // Suppress default handler.

  var driver = testHelper.createDriver();
  var a = new webdriver.WebElement(driver, {'ELEMENT': 'foo'});
  var b = new webdriver.WebElementPromise(driver, id);

  return webdriver.WebElement.equals(a, b).then(fail, assertIsStubError);
}


function testWaiting_waitSucceeds() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENTS, {'using':'id', 'value':'foo'}).
          andReturnSuccess([]).
          times(2).
      expect(CName.FIND_ELEMENTS, {'using':'id', 'value':'foo'}).
          andReturnSuccess([{'ELEMENT':'bar'}]).
      replayAll();

  var driver = testHelper.createDriver();
  driver.wait(function() {
    return driver.isElementPresent(By.id('foo'));
  }, 200);
  return waitForIdle();
}


function testWaiting_waitTimesout_timeoutCaught() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENTS, {'using':'id', 'value':'foo'}).
          andReturnSuccess([]).
          anyTimes().
      replayAll();

  var driver = testHelper.createDriver();
  return driver.wait(function() {
    return driver.isElementPresent(By.id('foo'));
  }, 25).then(fail, function(e) {
    assertEquals('Wait timed out after ',
        e.message.substring(0, 'Wait timed out after '.length));
  });
}


function testWaiting_waitTimesout_timeoutNotCaught() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENTS, {'using':'id', 'value':'foo'}).
          andReturnSuccess([]).
          anyTimes().
      replayAll();

  var driver = testHelper.createDriver();
  driver.wait(function() {
    return driver.isElementPresent(By.id('foo'));
  }, 25);
  return waitForAbort().then(function(e) {
    assertEquals('Wait timed out after ',
        e.message.substring(0, 'Wait timed out after '.length));
  });
}

function testInterceptsAndTransformsUnhandledAlertErrors() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENT, {'using':'id', 'value':'foo'}).
      andReturnError(ECode.UNEXPECTED_ALERT_OPEN, {
        'message': 'boom',
        'alert': {'text': 'hello'}
      }).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.findElement(By.id('foo')).then(fail, function(e) {
    assertTrue(e instanceof webdriver.UnhandledAlertError);
    assertEquals('hello', e.getAlertText());
  });
}

function
testUnhandledAlertErrors_usesEmptyStringIfAlertTextOmittedFromResponse() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENT, {'using':'id', 'value':'foo'}).
      andReturnError(ECode.UNEXPECTED_ALERT_OPEN, {'message': 'boom'}).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.findElement(By.id('foo')).then(fail, function(e) {
    assertTrue(e instanceof webdriver.UnhandledAlertError);
    assertEquals('', e.getAlertText());
  });
}

function testAlertHandleResolvesWhenPromisedTextResolves() {
  var promise = new webdriver.promise.Deferred();

  var alert = new webdriver.AlertPromise(STUB_DRIVER, promise);
  assertTrue(alert.isPending());

  promise.fulfill(new webdriver.Alert(STUB_DRIVER, 'foo'));
  return alert.getText().then(function(text) {
    assertEquals('foo', text);
  });
}


function testWebElementsBelongToSameFlowAsParentDriver() {
  var testHelper = new TestHelper()
      .expect(CName.FIND_ELEMENT, {'using':'id', 'value':'foo'})
      .andReturnSuccess({'ELEMENT': 'abc123'})
      .replayAll();

  var driver = testHelper.createDriver();
  var otherFlow = new webdriver.promise.ControlFlow();
  otherFlow.execute(function() {
    driver.findElement({id: 'foo'}).then(function() {
      assertEquals(
          'WebElement should belong to the same flow as its parent driver',
          driver.controlFlow(), webdriver.promise.controlFlow());
    });
  });

  assertNotEquals(otherFlow, driver.controlFlow);
  return goog.Promise.all([
    waitForIdle(otherFlow),
    waitForIdle(driver.controlFlow())
  ]);
}


function testSwitchToAlertThatIsNotPresent() {
  var testHelper = new TestHelper()
      .expect(CName.GET_ALERT_TEXT)
      .andReturnError(ECode.NO_SUCH_ALERT, {'message': 'no alert'})
      .replayAll();

  var driver = testHelper.createDriver();
  var alert = driver.switchTo().alert();
  alert.dismiss();  // Should never execute.
  return waitForAbort().then(expectedError(ECode.NO_SUCH_ALERT, 'no alert'));
}


function testAlertsBelongToSameFlowAsParentDriver() {
  var testHelper = new TestHelper()
      .expect(CName.GET_ALERT_TEXT).andReturnSuccess('hello')
      .replayAll();

  var driver = testHelper.createDriver();
  var otherFlow = new webdriver.promise.ControlFlow();
  otherFlow.execute(function() {
    driver.switchTo().alert().then(function() {
      assertEquals(
          'Alert should belong to the same flow as its parent driver',
          driver.controlFlow(), webdriver.promise.controlFlow());
    });
  });

  assertNotEquals(otherFlow, driver.controlFlow);
  return goog.Promise.all([
    waitForIdle(otherFlow),
    waitForIdle(driver.controlFlow())
  ]);
}

function testFetchingLogs() {
  var testHelper = new TestHelper().
      expect(CName.GET_LOG, {'type': 'browser'}).
      andReturnSuccess([
        new webdriver.logging.Entry(
            webdriver.logging.Level.INFO, 'hello', 1234),
        {'level': 'DEBUG', 'message': 'abc123', 'timestamp': 5678}
      ]).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.manage().logs().get('browser').then(function(entries) {
    assertEquals(2, entries.length);

    assertTrue(entries[0] instanceof webdriver.logging.Entry);
    assertEquals(webdriver.logging.Level.INFO.value, entries[0].level.value);
    assertEquals('hello', entries[0].message);
    assertEquals(1234, entries[0].timestamp);

    assertTrue(entries[1] instanceof webdriver.logging.Entry);
    assertEquals(webdriver.logging.Level.DEBUG.value, entries[1].level.value);
    assertEquals('abc123', entries[1].message);
    assertEquals(5678, entries[1].timestamp);
  });
}


function testCommandsFailIfInitialSessionCreationFailed() {
  var testHelper = new TestHelper().replayAll();

  var session = webdriver.promise.rejected(new StubError);

  var driver = testHelper.createDriver(session);
  var navigateResult = driver.get('some-url').then(fail, assertIsStubError);
  var quitResult = driver.quit().then(fail, assertIsStubError);

  return waitForIdle().then(function() {
    return webdriver.promise.all(navigateResult, quitResult);
  });
}


function testWebElementCommandsFailIfInitialDriverCreationFailed() {
  var testHelper = new TestHelper().replayAll();

  var session = webdriver.promise.rejected(new StubError);

  var driver = testHelper.createDriver(session);
  return driver.findElement(By.id('foo')).click().
      then(fail, assertIsStubError);
}


function testWebElementCommansFailIfElementCouldNotBeFound() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENT, {'using':'id', 'value':'foo'}).
          andReturnError(ECode.NO_SUCH_ELEMENT,
                         {'message':'Unable to find element'}).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.findElement(By.id('foo')).click().
      then(fail,
            expectedError(ECode.NO_SUCH_ELEMENT, 'Unable to find element'));
}


function testCannotFindChildElementsIfParentCouldNotBeFound() {
  var testHelper = new TestHelper().
      expect(CName.FIND_ELEMENT, {'using':'id', 'value':'foo'}).
      andReturnError(ECode.NO_SUCH_ELEMENT,
                     {'message':'Unable to find element'}).
      replayAll();

  var driver = testHelper.createDriver();
  return driver.findElement(By.id('foo'))
      .findElement(By.id('bar'))
      .findElement(By.id('baz'))
      .then(fail,
            expectedError(ECode.NO_SUCH_ELEMENT, 'Unable to find element'));
}


function testActionSequenceFailsIfInitialDriverCreationFailed() {
  var testHelper = new TestHelper().replayAll();

  var session = webdriver.promise.rejected(new StubError);

  // Suppress the default error handler so we can verify it propagates
  // to the perform() call below.
  session.thenCatch(goog.nullFunction);

  return testHelper.createDriver(session).
      actions().
      mouseDown().
      mouseUp().
      perform().
      thenCatch(assertIsStubError);
}


function testActionSequence_mouseMove_noElement() {
  var testHelper = new TestHelper()
      .expect(CName.MOVE_TO, {'xoffset': 0, 'yoffset': 125})
      .andReturnSuccess()
      .replayAll();

  return testHelper.createDriver().
      actions().
      mouseMove({x: 0, y: 125}).
      perform();
}


function testActionSequence_mouseMove_element() {
  var testHelper = new TestHelper()
      .expect(CName.FIND_ELEMENT, {'using':'id', 'value':'foo'})
          .andReturnSuccess({'ELEMENT': 'abc123'})
      .expect(
          CName.MOVE_TO, {'element': 'abc123', 'xoffset': 0, 'yoffset': 125})
          .andReturnSuccess()
      .replayAll();

  var driver = testHelper.createDriver();
  var element = driver.findElement(By.id('foo'));
  return driver.actions()
      .mouseMove(element, {x: 0, y: 125})
      .perform();
}


function testActionSequence_mouseDown() {
  var testHelper = new TestHelper()
      .expect(CName.MOUSE_DOWN, {'button': webdriver.Button.LEFT})
          .andReturnSuccess()
      .replayAll();

  return testHelper.createDriver().
      actions().
      mouseDown().
      perform();
}


function testActionSequence() {
  var testHelper = new TestHelper()
      .expect(CName.FIND_ELEMENT, {'using':'id', 'value':'a'})
          .andReturnSuccess({'ELEMENT': 'id1'})
      .expect(CName.FIND_ELEMENT, {'using':'id', 'value':'b'})
          .andReturnSuccess({'ELEMENT': 'id2'})
      .expect(CName.SEND_KEYS_TO_ACTIVE_ELEMENT,
          {'value': [webdriver.Key.SHIFT]})
          .andReturnSuccess()
      .expect(CName.MOVE_TO, {'element': 'id1'})
          .andReturnSuccess()
      .expect(CName.CLICK, {'button': webdriver.Button.LEFT})
          .andReturnSuccess()
      .expect(CName.MOVE_TO, {'element': 'id2'})
          .andReturnSuccess()
      .expect(CName.CLICK, {'button': webdriver.Button.LEFT})
          .andReturnSuccess()
      .replayAll();

  var driver = testHelper.createDriver();
  var element1 = driver.findElement(By.id('a'));
  var element2 = driver.findElement(By.id('b'));

  return driver.actions()
      .keyDown(webdriver.Key.SHIFT)
      .click(element1)
      .click(element2)
      .perform();
}


function testAlertCommandsFailIfAlertNotPresent() {
  var testHelper = new TestHelper()
      .expect(CName.GET_ALERT_TEXT)
          .andReturnError(ECode.NO_SUCH_ALERT, {'message': 'no alert'})
      .replayAll();

  var driver = testHelper.createDriver();
  var alert = driver.switchTo().alert();

  var expectError = expectedError(ECode.NO_SUCH_ALERT, 'no alert');
  var callbacks = [];
  for (var key in webdriver.Alert.prototype) {
    if (webdriver.Alert.prototype.hasOwnProperty(key)) {
      callbacks.push(key, alert[key].call(alert).thenCatch(expectError));
    }
  }

  return waitForIdle().then(function() {
    return webdriver.promise.all(callbacks);
  });
}
