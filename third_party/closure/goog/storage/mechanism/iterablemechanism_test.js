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
 */

goog.provide('goog.storage.mechanism.iterablemechanism_test');

goog.require('goog.iter.Iterator');
goog.require('goog.storage.mechanism.IterableMechanism');
goog.require('goog.testing.asserts');
goog.setTestOnly('iterablemechanism_test');


goog.storage.mechanism.iterablemechanism_test.runIterableTests = function(
    mechanism) {
  // Clean up and empty checks.
  mechanism.clear();
  assertEquals(0, mechanism.getCount());
  mechanism.clear();
  assertEquals(0, mechanism.getCount());
  assertEquals(goog.iter.StopIteration,
               assertThrows(mechanism.__iterator__().next));

  // Count.
  mechanism.set('first', 'one');
  assertEquals(1, mechanism.getCount());

  // Iterator.
  assertEquals('first', mechanism.__iterator__(true).next());
  assertEquals('one', mechanism.__iterator__(false).next());
  var iterator = mechanism.__iterator__();
  assertEquals('one', iterator.next());
  assertEquals(goog.iter.StopIteration,
               assertThrows(iterator.next));

  // More values.
  mechanism.set('second', 'two');
  assertEquals(2, mechanism.getCount());
  assertSameElements(['one', 'two'], goog.iter.toArray(mechanism));
  assertSameElements(['first', 'second'],
                     goog.iter.toArray(mechanism.__iterator__(true)));

  // Clear.
  mechanism.clear();
  assertNull(mechanism.get('first'));
  assertNull(mechanism.get('second'));
  assertEquals(0, mechanism.getCount());
  assertEquals(goog.iter.StopIteration,
               assertThrows(mechanism.__iterator__().next));

  // Some weird keys.
  mechanism.set(' ', 'space');
  mechanism.set('=+!@#$%^&*()-_\\|;:\'",./<>?[]{}~`', 'control');
  mechanism.set(
      '\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341', 'ten');
  assertEquals(3, mechanism.getCount());
  assertSameElements([' ', '=+!@#$%^&*()-_\\|;:\'",./<>?[]{}~`',
      '\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341'],
      goog.iter.toArray(mechanism.__iterator__(true)));
  mechanism.clear();
  assertEquals(0, mechanism.getCount());
};
