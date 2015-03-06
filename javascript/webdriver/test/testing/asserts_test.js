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

goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('webdriver.test.testutil');
goog.require('webdriver.testing.assert');
goog.require('webdriver.testing.asserts');

var assert = webdriver.testing.assert;
var result;

function shouldRunTests() {
  return !goog.userAgent.IE || goog.userAgent.isVersionOrHigher(10);
}


function setUp() {
  result = webdriver.test.testutil.callbackPair();
}


function testAssertion_nonPromiseValue_valueMatches() {
  assert('foo').equalTo('foo');
  // OK if it does not throw.
}


function testAssertion_nonPromiseValue_notValueMatches() {
  var a = assert('foo');
  assertThrows(goog.bind(a.equalTo, a, 'bar'));
}


function testAssertion_promiseValue_valueMatches() {
  return assert(webdriver.promise.fulfilled('foo')).equalTo('foo');
}


function testAssertion_promiseValue_notValueMatches() {
  var d = new webdriver.promise.Deferred();
  return assert(webdriver.promise.fulfilled('bar')).equalTo('foo').
      then(fail, goog.nullFunction);
}


function testAssertion_promiseValue_promiseRejected() {
  var err = Error();
  return assert(webdriver.promise.rejected(err)).equalTo('foo').
      then(fail, function(e) {
        assertEquals(err, e);
      });
}


function testAssertion_decoration() {
  assert('foo').is.equalTo('foo');
  // Ok if no throws.
}


function testAssertion_negation() {
  var a = assert('false');

  a.not.equalTo('bar');  // OK if this does not throw.
  a.is.not.equalTo('bar');  // OK if this does not throw.

  var notA = a.not;
  assertThrows(goog.bind(notA.equalTo, notA, 123));

  notA = a.is.not;
  assertThrows(goog.bind(notA.equalTo, notA, 123));
}


function testApplyMatcher_nonPromiseValue_valueMatches() {
  return assertThat('foo', equals('foo'));
}


function testApplyMatcher_nonPromiseValue_notValueMatches() {
  return assertThat('foo', equals('bar')).then(fail, goog.nullFunction);
}


function testApplyMatcher_promiseValue_valueMatches() {
  return assertThat(webdriver.promise.fulfilled('foo'), equals('foo'));
}


function testApplyMatcher_promiseValue_notValueMatches() {
  return assertThat(webdriver.promise.fulfilled('bar'), equals('foo')).
      then(fail, goog.nullFunction);
}


function testApplyMatcher_promiseValue_promiseRejected() {
  var err = Error();
  return assertThat(webdriver.promise.rejected(err), equals('foo')).
      then(fail, function(e) {
        assertEquals(err, e);
      });
}
