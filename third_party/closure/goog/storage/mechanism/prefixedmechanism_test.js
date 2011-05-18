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
 * @fileoverview Unit tests for storage mechanism sharing and separation.
 *
 */

goog.provide('goog.storage.mechanism.prefixedmechanism_test');

goog.require('goog.iter.Iterator');
goog.require('goog.storage.mechanism.IterableMechanism');
goog.require('goog.testing.asserts');
goog.setTestOnly('prefixedmechanism_test');


goog.storage.mechanism.prefixedmechanism_test.runSharingTests = function(
    mechanismA, mechanismB) {
  // Clean up A, should clean up B.
  mechanismA.clear();
  assertEquals(0, mechanismB.getCount());
  assertEquals(goog.iter.StopIteration,
               assertThrows(mechanismB.__iterator__().next));

  // Modifying A should modify B.
  mechanismA.set('first', 'one');
  assertEquals('one', mechanismB.get('first'));
  assertEquals(1, mechanismB.getCount());
  var iterator = mechanismB.__iterator__();
  assertEquals('one', iterator.next());
  assertEquals(goog.iter.StopIteration,
               assertThrows(iterator.next));

  // Modifying B should modify A.
  mechanismB.set('first', 'two');
  assertEquals('two', mechanismA.get('first'));
  assertEquals(1, mechanismA.getCount());
  var iterator = mechanismA.__iterator__();
  assertEquals('two', iterator.next());
  assertEquals(goog.iter.StopIteration,
               assertThrows(iterator.next));

  // More elements.
  mechanismB.set('second', 'one');
  assertEquals(2, mechanismA.getCount());
  assertSameElements(['one', 'two'], goog.iter.toArray(mechanismA));

  // Removing from A should remove from B.
  mechanismA.remove('first');
  assertNull(mechanismB.get('first'));
  assertEquals('one', mechanismB.get('second'));
  assertEquals(1, mechanismB.getCount());
  var iterator = mechanismB.__iterator__();
  assertEquals('one', iterator.next());
  assertEquals(goog.iter.StopIteration,
               assertThrows(iterator.next));

  // Clean up B, should clean up A.
  mechanismB.clear();
  assertEquals(0, mechanismA.getCount());
  assertEquals(goog.iter.StopIteration,
               assertThrows(mechanismA.__iterator__().next));
};


goog.storage.mechanism.prefixedmechanism_test.runSeparationTests = function(
    mechanismA, mechanismB) {
  // Clean up.
  mechanismA.clear();
  mechanismB.clear();

  // Modifying A should not influence B.
  mechanismA.set('first', 'one');
  assertNull(mechanismB.get('first'));
  assertEquals(0, mechanismB.getCount());
  assertEquals(goog.iter.StopIteration,
               assertThrows(mechanismB.__iterator__().next));

  // Modifying B should not influence A.
  mechanismB.set('first', 'two');
  assertEquals('one', mechanismA.get('first'));
  assertEquals(1, mechanismA.getCount());
  var iterator = mechanismA.__iterator__();
  assertEquals('one', iterator.next());
  assertEquals(goog.iter.StopIteration,
               assertThrows(iterator.next));

  // Some more values.
  mechanismB.set('second', 'three');
  assertNull(mechanismA.get('second'));
  assertEquals(1, mechanismA.getCount());
  var iterator = mechanismA.__iterator__();
  assertEquals('one', iterator.next());
  assertEquals(goog.iter.StopIteration,
               assertThrows(iterator.next));

  // Removing from B should not influence A.
  mechanismB.remove('first');
  assertEquals('one', mechanismA.get('first'));
  assertEquals(1, mechanismA.getCount());
  var iterator = mechanismA.__iterator__();
  assertEquals('one', iterator.next());
  assertEquals(goog.iter.StopIteration,
               assertThrows(iterator.next));

  // Clearing A should not influence B.
  mechanismA.clear();
  assertEquals('three', mechanismB.get('second'));
  assertEquals(1, mechanismB.getCount());
  var iterator = mechanismB.__iterator__();
  assertEquals('three', iterator.next());
  assertEquals(goog.iter.StopIteration,
               assertThrows(iterator.next));

  // Clean up.
  mechanismB.clear();
};
