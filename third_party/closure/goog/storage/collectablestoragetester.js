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
 * @fileoverview Unit tests for the collectable storage interface.
 *
 */

goog.provide('goog.storage.collectableStorageTester');

goog.require('goog.testing.asserts');
goog.setTestOnly('collectablestorage_test');


/**
 * Tests basic operation: expiration and collection of collectable storage.
 *
 * @param {goog.storage.mechanism.IterableMechanism} mechanism
 * @param {goog.testing.MockClock} clock
 * @param {goog.storage.CollectableStorage} storage
  */
goog.storage.collectableStorageTester.runBasicTests = function(
    mechanism, clock, storage) {
  // No expiration.
  storage.set('first', 'three seconds', 3000);
  storage.set('second', 'one second', 1000);
  storage.set('third', 'permanent');
  storage.set('fourth', 'two seconds', 2000);
  clock.tick(100);
  storage.collect();
  assertEquals('three seconds', storage.get('first'));
  assertEquals('one second', storage.get('second'));
  assertEquals('permanent', storage.get('third'));
  assertEquals('two seconds', storage.get('fourth'));

  // A key has expired.
  clock.tick(1000);
  storage.collect();
  assertNull(mechanism.get('second'));
  assertEquals('three seconds', storage.get('first'));
  assertUndefined(storage.get('second'));
  assertEquals('permanent', storage.get('third'));
  assertEquals('two seconds', storage.get('fourth'));

  // Another two keys have expired.
  clock.tick(2000);
  storage.collect();
  assertNull(mechanism.get('first'));
  assertNull(mechanism.get('fourth'));
  assertUndefined(storage.get('first'));
  assertEquals('permanent', storage.get('third'));
  assertUndefined(storage.get('fourth'));

  // Clean up.
  storage.remove('third');
  assertNull(mechanism.get('third'));
  assertUndefined(storage.get('third'));
  storage.collect();
  clock.uninstall();
};
