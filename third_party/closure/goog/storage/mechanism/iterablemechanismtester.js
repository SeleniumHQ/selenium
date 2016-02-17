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
 * @fileoverview Unit tests for the iterable storage mechanism interface.
 *
 * These tests should be included in tests of any class extending
 * goog.storage.mechanism.IterableMechanism.
 *
 */

goog.provide('goog.storage.mechanism.iterableMechanismTester');

goog.require('goog.iter.Iterator');
goog.require('goog.storage.mechanism.IterableMechanism');
goog.require('goog.testing.asserts');
goog.setTestOnly('iterableMechanismTester');


var mechanism = null;


function testCount() {
  if (!mechanism) {
    return;
  }
  assertEquals(0, mechanism.getCount());
  mechanism.set('first', 'one');
  assertEquals(1, mechanism.getCount());
  mechanism.set('second', 'two');
  assertEquals(2, mechanism.getCount());
  mechanism.set('first', 'three');
  assertEquals(2, mechanism.getCount());
}


function testIteratorBasics() {
  if (!mechanism) {
    return;
  }
  mechanism.set('first', 'one');
  assertEquals('first', mechanism.__iterator__(true).next());
  assertEquals('one', mechanism.__iterator__(false).next());
  var iterator = mechanism.__iterator__();
  assertEquals('one', iterator.next());
  assertEquals(goog.iter.StopIteration, assertThrows(iterator.next));
}


function testIteratorWithTwoValues() {
  if (!mechanism) {
    return;
  }
  mechanism.set('first', 'one');
  mechanism.set('second', 'two');
  assertSameElements(['one', 'two'], goog.iter.toArray(mechanism));
  assertSameElements(
      ['first', 'second'], goog.iter.toArray(mechanism.__iterator__(true)));
}


function testClear() {
  if (!mechanism) {
    return;
  }
  mechanism.set('first', 'one');
  mechanism.set('second', 'two');
  mechanism.clear();
  assertNull(mechanism.get('first'));
  assertNull(mechanism.get('second'));
  assertEquals(0, mechanism.getCount());
  assertEquals(
      goog.iter.StopIteration, assertThrows(mechanism.__iterator__(true).next));
  assertEquals(
      goog.iter.StopIteration,
      assertThrows(mechanism.__iterator__(false).next));
}


function testClearClear() {
  if (!mechanism) {
    return;
  }
  mechanism.clear();
  mechanism.clear();
  assertEquals(0, mechanism.getCount());
}


function testIteratorWithWeirdKeys() {
  if (!mechanism) {
    return;
  }
  mechanism.set(' ', 'space');
  mechanism.set('=+!@#$%^&*()-_\\|;:\'",./<>?[]{}~`', 'control');
  mechanism.set(
      '\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341', 'ten');
  assertEquals(3, mechanism.getCount());
  assertSameElements(
      [
        ' ', '=+!@#$%^&*()-_\\|;:\'",./<>?[]{}~`',
        '\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341'
      ],
      goog.iter.toArray(mechanism.__iterator__(true)));
  mechanism.clear();
  assertEquals(0, mechanism.getCount());
}
