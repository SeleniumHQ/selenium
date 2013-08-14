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
 * @fileoverview Unit tests for storage mechanism separation.
 *
 * These tests should be included by tests of any mechanism which natively
 * implements namespaces. There is no need to include those tests for mechanisms
 * extending goog.storage.mechanism.PrefixedMechanism. Make sure a different
 * namespace is used for each object.
 *
 */

goog.provide('goog.storage.mechanism.mechanismSeparationTester');

goog.require('goog.iter.Iterator');
goog.require('goog.storage.mechanism.IterableMechanism');
goog.require('goog.testing.asserts');
goog.setTestOnly('goog.storage.mechanism.mechanismSeparationTester');


var mechanism = null;
var mechanism_separate = null;


function testSeparateSet() {
  if (!mechanism || !mechanism_separate) {
    return;
  }
  mechanism.set('first', 'one');
  assertNull(mechanism_separate.get('first'));
  assertEquals(0, mechanism_separate.getCount());
  assertEquals(goog.iter.StopIteration,
               assertThrows(mechanism_separate.__iterator__().next));
}


function testSeparateSetInverse() {
  if (!mechanism || !mechanism_separate) {
    return;
  }
  mechanism.set('first', 'one');
  mechanism_separate.set('first', 'two');
  assertEquals('one', mechanism.get('first'));
  assertEquals(1, mechanism.getCount());
  var iterator = mechanism.__iterator__();
  assertEquals('one', iterator.next());
  assertEquals(goog.iter.StopIteration,
               assertThrows(iterator.next));
}


function testSeparateRemove() {
  if (!mechanism || !mechanism_separate) {
    return;
  }
  mechanism.set('first', 'one');
  mechanism_separate.remove('first');
  assertEquals('one', mechanism.get('first'));
  assertEquals(1, mechanism.getCount());
  var iterator = mechanism.__iterator__();
  assertEquals('one', iterator.next());
  assertEquals(goog.iter.StopIteration,
               assertThrows(iterator.next));
}


function testSeparateClean() {
  if (!mechanism || !mechanism_separate) {
    return;
  }
  mechanism_separate.set('first', 'two');
  mechanism.clear();
  assertEquals('two', mechanism_separate.get('first'));
  assertEquals(1, mechanism_separate.getCount());
  var iterator = mechanism_separate.__iterator__();
  assertEquals('two', iterator.next());
  assertEquals(goog.iter.StopIteration,
               assertThrows(iterator.next));
}
