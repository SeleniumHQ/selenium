// Copyright 2011 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unit tests for the abstract storage mechanism interface.
 *
 * These tests should be included in tests of any class extending
 * goog.storage.mechanism.Mechanism.
 *
 */

goog.provide('goog.storage.mechanism.mechanism_test');

goog.require('goog.storage.mechanism.ErrorCode');
goog.require('goog.storage.mechanism.HTML5LocalStorage');
goog.require('goog.storage.mechanism.Mechanism');
goog.require('goog.testing.asserts');
goog.require('goog.userAgent.product');
goog.require('goog.userAgent.product.isVersion');
goog.setTestOnly('mechanism_test');


var mechanism = null;
var minimumQuota = 0;


function testSetGet() {
  if (!mechanism) {
    return;
  }
  mechanism.set('first', 'one');
  assertEquals('one', mechanism.get('first'));
}


function testChange() {
  if (!mechanism) {
    return;
  }
  mechanism.set('first', 'one');
  mechanism.set('first', 'two');
  assertEquals('two', mechanism.get('first'));
}


function testRemove() {
  if (!mechanism) {
    return;
  }
  mechanism.set('first', 'one');
  mechanism.remove('first');
  assertNull(mechanism.get('first'));
}


function testSetRemoveSet() {
  if (!mechanism) {
    return;
  }
  mechanism.set('first', 'one');
  mechanism.remove('first');
  mechanism.set('first', 'one');
  assertEquals('one', mechanism.get('first'));
}


function testRemoveRemove() {
  if (!mechanism) {
    return;
  }
  mechanism.remove('first');
  mechanism.remove('first');
  assertNull(mechanism.get('first'));
}


function testSetTwo() {
  if (!mechanism) {
    return;
  }
  mechanism.set('first', 'one');
  mechanism.set('second', 'two');
  assertEquals('one', mechanism.get('first'));
  assertEquals('two', mechanism.get('second'));
}


function testChangeTwo() {
  if (!mechanism) {
    return;
  }
  mechanism.set('first', 'one');
  mechanism.set('second', 'two');
  mechanism.set('second', 'three');
  mechanism.set('first', 'four');
  assertEquals('four', mechanism.get('first'));
  assertEquals('three', mechanism.get('second'));
}


function testSetRemoveThree() {
  if (!mechanism) {
    return;
  }
  mechanism.set('first', 'one');
  mechanism.set('second', 'two');
  mechanism.set('third', 'three');
  mechanism.remove('second');
  assertNull(mechanism.get('second'));
  assertEquals('one', mechanism.get('first'));
  assertEquals('three', mechanism.get('third'));
  mechanism.remove('first');
  assertNull(mechanism.get('first'));
  assertEquals('three', mechanism.get('third'));
  mechanism.remove('third');
  assertNull(mechanism.get('third'));
}


function testEmptyValue() {
  if (!mechanism) {
    return;
  }
  mechanism.set('third', '');
  assertEquals('', mechanism.get('third'));
}


function testWeirdKeys() {
  if (!mechanism) {
    return;
  }
  // Some weird keys. We leave out some tests for some browsers where they
  // trigger browser bugs, and where the keys are too obscure to prepare a
  // workaround.
  mechanism.set(' ', 'space');
  mechanism.set('=+!@#$%^&*()-_\\|;:\'",./<>?[]{}~`', 'control');
  mechanism.set(
      '\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341', 'ten');
  mechanism.set('\0', 'null');
  mechanism.set('\0\0', 'double null');
  mechanism.set('\0A', 'null A');
  mechanism.set('', 'zero');
  assertEquals('space', mechanism.get(' '));
  assertEquals('control', mechanism.get('=+!@#$%^&*()-_\\|;:\'",./<>?[]{}~`'));
  assertEquals('ten', mechanism.get(
      '\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341'));
  if (!goog.userAgent.IE ||
      !mechanism instanceof goog.storage.mechanism.HTML5LocalStorage) {
    // IE does not properly handle nulls in HTML5 localStorage keys (IE8, IE9).
    // https://connect.microsoft.com/IE/feedback/details/667799/
    assertEquals('null', mechanism.get('\0'));
    assertEquals('double null', mechanism.get('\0\0'));
    assertEquals('null A', mechanism.get('\0A'));
  }
  if (!goog.userAgent.GECKO) {
    // Firefox does not properly handle the empty key (FF 3.5, 3.6, 4.0).
    // https://bugzilla.mozilla.org/show_bug.cgi?id=510849
    assertEquals('zero', mechanism.get(''));
  }
}


function testQuota() {
  if (!mechanism) {
    return;
  }
  // This test might crash Safari 4, so it is disabled for this version.
  // It works fine on Safari 3 and Safari 5.
  if (goog.userAgent.product.SAFARI &&
      goog.userAgent.product.isVersion(4) &&
      !goog.userAgent.product.isVersion(5)) {
    return;
  }
  var buffer = '\u03ff'; // 2 bytes
  var savedBytes = 0;
   try {
    while (buffer.length < minimumQuota) {
      buffer = buffer + buffer;
      mechanism.set('foo', buffer);
      savedBytes = buffer.length;
    }
  } catch (ex) {
    if (ex != goog.storage.mechanism.ErrorCode.QUOTA_EXCEEDED) {
      throw ex;
    }
  }
  mechanism.remove('foo');
  assertTrue(savedBytes >= minimumQuota);
}
