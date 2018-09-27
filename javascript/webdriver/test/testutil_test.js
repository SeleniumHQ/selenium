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

goog.require('goog.testing.jsunit');
goog.require('webdriver.test.testutil');

// Aliases for readability.
var callbackHelper = webdriver.test.testutil.callbackHelper,
    callbackPair = webdriver.test.testutil.callbackPair;

function testCallbackHelper_functionCalled() {
  var callback = callbackHelper();
  callback();
  assertNotThrows(callback.assertCalled);
  assertThrowsJsUnitException(callback.assertNotCalled);
}

function testCallbackHelper_functionCalledMoreThanOnce() {
  var callback = callbackHelper();
  callback();
  callback(123, 'abc');
  assertThrowsJsUnitException(callback.assertCalled);
  assertThrowsJsUnitException(callback.assertNotCalled);
}

function testCallbackHelper_functionNotCalled() {
  var callback = callbackHelper();
  assertNotThrows(callback.assertNotCalled);
  assertThrowsJsUnitException(callback.assertCalled);
}

function testCallbackHelper_wrappedFunctionIsCalled() {
  var count = 0;
  var callback = callbackHelper(function() {
    count += 1;
  });
  callback();
  assertNotThrows(callback.assertCalled);
  assertThrowsJsUnitException(callback.assertNotCalled);
  assertEquals(1, count);
}

function testCallbackPair_callbackExpected() {
  var pair = callbackPair();
  assertThrowsJsUnitException(pair.assertCallback);
  pair.callback();
  assertNotThrows(pair.assertCallback);
  pair.errback();
  assertThrowsJsUnitException(pair.assertCallback);

  pair.reset();
  pair.callback();
  assertNotThrows(pair.assertCallback);
  pair.callback();
}

function testCallbackPair_errbackExpected() {
  var pair = callbackPair();
  assertThrowsJsUnitException(pair.assertErrback);
  pair.errback();
  assertNotThrows(pair.assertErrback);
  pair.callback();
  assertThrowsJsUnitException(pair.assertErrback);
}

function testCallbackPair_eitherExpected() {
  var pair = callbackPair();
  assertThrowsJsUnitException(pair.assertEither);
  pair.errback();
  assertNotThrows(pair.assertEither);
  pair.reset();
  pair.callback();
  assertNotThrows(pair.assertEither);
  pair.errback();
  assertNotThrows(pair.assertEither);
}

function testCallbackPair_neitherExpected() {
  var pair = callbackPair();
  assertNotThrows(pair.assertNeither);
  pair.errback();
  assertThrowsJsUnitException(pair.assertNeither);
  pair.reset();
  pair.callback();
  assertThrowsJsUnitException(pair.assertNeither);
  pair.errback();
  assertThrowsJsUnitException(pair.assertNeither);
}
