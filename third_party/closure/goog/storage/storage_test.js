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
 * @fileoverview Unit tests for the storage interface.
 *
 */

goog.provide('goog.storage.storage_test');

goog.require('goog.storage.Storage');
goog.require('goog.structs.Map');
goog.require('goog.testing.asserts');
goog.setTestOnly('storage_test');


goog.storage.storage_test.runBasicTests = function(storage) {
  // Simple Objects.
  storage.set('first', 'Hello world!');
  storage.set('second', ['one', 'two', 'three']);
  storage.set('third', {'a': 97, 'b': 98});
  assertEquals('Hello world!', storage.get('first'));
  assertObjectEquals(['one', 'two', 'three'], storage.get('second'));
  assertObjectEquals({'a': 97, 'b': 98}, storage.get('third'));

  // Some more complex fun with a Map.
  var map = new goog.structs.Map();
  map.set('Alice', 'Hello world!');
  map.set('Bob', ['one', 'two', 'three']);
  map.set('Cecile', {'a': 97, 'b': 98});
  storage.set('first', map.toObject());
  assertObjectEquals(map.toObject(), storage.get('first'));

  // Setting weird values.
  storage.set('second', null);
  assertEquals(null, storage.get('second'));
  storage.set('second', undefined);
  assertEquals(undefined, storage.get('second'));
  storage.set('second', '');
  assertEquals('', storage.get('second'));

  // Clean up.
  storage.remove('first');
  storage.remove('second');
  storage.remove('third');
  assertUndefined(storage.get('first'));
  assertUndefined(storage.get('second'));
  assertUndefined(storage.get('third'));
};
