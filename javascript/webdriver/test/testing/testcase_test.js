// Copyright 2014 Software Freedom Conservancy. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.require('goog.Promise');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.mockmatchers');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');
goog.require('goog.userAgent');
goog.require('webdriver.test.testutil');
goog.require('webdriver.testing.TestCase');


// Aliases for readability.
var IGNORE_ARGUMENT = goog.testing.mockmatchers.ignoreArgument,
    IS_ARRAY_ARGUMENT = goog.testing.mockmatchers.isArray,
    StubError = webdriver.test.testutil.StubError,
    throwStubError = webdriver.test.testutil.throwStubError,
    assertIsStubError = webdriver.test.testutil.assertIsStubError;

var control = new goog.testing.MockControl();
var mockTestCase, testStub, mockOnComplete, mockOnError, uncaughtExceptions;

function shouldRunTests() {
  return !goog.userAgent.IE || goog.userAgent.isVersionOrHigher(10);
}


function setUp() {
  // Use one master mock so we can assert execution order.
  mockTestCase = control.createStrictMock({
    setUp: goog.nullFunction,
    testFn: goog.nullFunction,
    tearDown: goog.nullFunction,
    onComplete: goog.nullFunction,
    onError: goog.nullFunction
  }, true);

  mockOnComplete = goog.bind(mockTestCase.onComplete, mockTestCase);
  mockOnError = goog.bind(mockTestCase.onError, mockTestCase);

  testStub = {
    name: 'testStub',
    scope: mockTestCase,
    ref: mockTestCase.testFn
  };

  webdriver.test.testutil.messages = [];
  uncaughtExceptions = [];

  webdriver.promise.controlFlow().
      on('uncaughtExceptions', onUncaughtException);
}

function tearDown() {
  var flow = webdriver.promise.controlFlow();
  return new goog.Promise(function(fulfill) {
    flow.execute(goog.nullFunction);  // Flush.
    flow.once('idle', fulfill);
  }).then(function() {
    assertArrayEquals('There were uncaught exceptions',
        [], uncaughtExceptions);
    control.$tearDown();
    flow.reset();
  });
}

function onUncaughtException(e) {
  uncaughtExceptions.push(e);
}

function schedule(msg, opt_fn) {
  var fn = opt_fn || goog.nullFunction;
  return webdriver.promise.controlFlow().execute(fn, msg);
}

function runTest() {
  return webdriver.testing.TestCase.prototype.runSingleTest_.
      call(mockTestCase, testStub, mockOnError).
      then(mockOnComplete);
}

function testExecutesTheBasicTestFlow() {
  mockTestCase.setUp();
  mockTestCase.testFn();
  mockTestCase.tearDown();
  mockOnComplete(IGNORE_ARGUMENT);
  control.$replayAll();

  return runTest();
}

function testExecutingAHappyTestWithScheduledActions() {
  mockTestCase.setUp().$does(function() { schedule('a'); });
  mockTestCase.testFn().$does(function() { schedule('b'); });
  mockTestCase.tearDown().$does(function() { schedule('c'); });
  mockOnComplete(IGNORE_ARGUMENT);
  control.$replayAll();

  return runTest();
}

function testShouldSkipTestFnIfSetupThrows() {
  var e = Error();
  mockTestCase.setUp().$does(function() { throw e; });
  mockOnError(e);
  mockTestCase.tearDown();
  mockOnComplete(IGNORE_ARGUMENT);
  control.$replayAll();

  return runTest();
}

function testShouldSkipTestFnIfSetupActionFails_1() {
  var e = Error();
  mockTestCase.setUp().$does(function() {
    schedule('an explosion', function() { throw e; });
  });
  mockOnError(e);
  mockTestCase.tearDown();
  mockOnComplete(IGNORE_ARGUMENT);
  control.$replayAll();

  return runTest();
}

function testShouldSkipTestFnIfSetupActionFails_2() {
  var e = Error();
  mockTestCase.setUp().$does(function() {
    schedule('an explosion', function() { throw e; });
  });
  mockOnError(e);
  mockTestCase.tearDown();
  mockOnComplete(IGNORE_ARGUMENT);
  control.$replayAll();

  return runTest();
}

function testShouldSkipTestFnIfNestedSetupActionFails() {
  var e = Error();
  mockTestCase.setUp().$does(function() {
    schedule('a', goog.nullFunction).then(function() {
      schedule('b', function() { throw e; });
    });
  });
  mockOnError(e);
  mockTestCase.tearDown();
  mockOnComplete(IGNORE_ARGUMENT);
  control.$replayAll();

  return runTest();
}

function testRunsAllTasksForEachPhaseBeforeTheNextPhase() {
  webdriver.test.testutil.messages = [];
  mockTestCase.setUp().$does(function() { schedule('a'); });
  mockTestCase.testFn().$does(function() { schedule('b'); });
  mockTestCase.tearDown().$does(function() { schedule('c'); });
  mockOnComplete(IGNORE_ARGUMENT);
  control.$replayAll();

  return runTest();
}

function testRecordsErrorsFromTestFnBeforeTearDown() {
  var e = Error();
  mockTestCase.setUp();
  mockTestCase.testFn().$does(function() { throw e; });
  mockOnError(e);
  mockTestCase.tearDown();
  mockOnComplete(IGNORE_ARGUMENT);
  control.$replayAll();

  return runTest();
}

function testRecordsErrorsFromTearDown() {
  var e = Error();
  mockTestCase.setUp();
  mockTestCase.testFn();
  mockTestCase.tearDown().$does(function() { throw e; });
  mockOnError(e);
  mockOnComplete(IGNORE_ARGUMENT);
  control.$replayAll();

  return runTest();
}

function testErrorFromSetUpAndTearDown() {
  var e1 = Error();
  var e2 = Error();
  mockTestCase.setUp().$does(function() { throw e1; });
  mockOnError(e1);
  mockTestCase.tearDown().$does(function() { throw e2; });
  mockOnError(e2);
  mockOnComplete(IGNORE_ARGUMENT);
  control.$replayAll();

  return runTest();
}

function testErrorFromTestFnAndTearDown() {
  var e1 = Error(), e2 = Error();
  mockTestCase.setUp();
  mockTestCase.testFn().$does(function() { throw e1; });
  mockOnError(e1);
  mockTestCase.tearDown().$does(function() { throw e2; });
  mockOnError(e2);
  mockOnComplete(IGNORE_ARGUMENT);
  control.$replayAll();

  return runTest();
}
