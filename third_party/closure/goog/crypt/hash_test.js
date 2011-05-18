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
 * @fileoverview Unit tests for the abstract cryptographic hash interface.
 *
 */

goog.provide('goog.crypt.hash_test');

goog.require('goog.testing.asserts');
goog.setTestOnly('hash_test');


goog.crypt.hash_test.runBasicTests = function(hash) {
  // Compute some hash.
  hash.update([97, 158]);
  var golden = hash.digest();

  // Recompute the hash.
  hash.reset();
  hash.update([97, 158]);
  assertArrayEquals('The reset did not produce the initial state',
      golden, hash.digest());

  // Check for a trivial collision.
  hash.reset();
  hash.update([158, 97]);
  assertTrue('Swapping bytes resulted in a hash collision',
      !!goog.testing.asserts.findDifferences(golden, hash.digest()));

  // Compute in parts.
  hash.reset();
  hash.update([97]);
  hash.update([158]);
  assertArrayEquals('Partial updates resulted in a different hash',
      golden, hash.digest());

  // Test update with specified length.
  hash.reset();
  hash.update([97, 158], 0);
  hash.update([97, 158, 32], 2);
  assertArrayEquals('Updating with an explicit buffer length did not work',
      golden, hash.digest());

  // Test array and string inputs.
  hash.reset();
  hash.update([97, 66]);
  golden = hash.digest();
  hash.reset();
  hash.update('aB');
  assertArrayEquals('String and array inputs should give the same result',
      golden, hash.digest());

  // Empty hash.
  hash.reset();
  var empty = hash.digest();
  assertTrue('Empty hash collided with a non-trivial one',
      !!goog.testing.asserts.findDifferences(golden, empty));

  // Zero-length array update.
  hash.reset();
  hash.update([]);
  assertArrayEquals('Updating with an empty array did not give an empty hash',
      empty, hash.digest());

  // Zero-length string update.
  hash.reset();
  hash.update('');
  assertArrayEquals('Updating with an empty string did not give an empty hash',
      empty, hash.digest());
};
