// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview SHA-256 cryptographic hash.
 *
 * Usage:
 *   var sha256 = new goog.crypt.Sha256();
 *   sha256.update(bytes);
 *   var hash = sha256.digest();
 *
 */

goog.provide('goog.crypt.Sha256');

goog.require('goog.crypt.Sha2');



/**
 * SHA-256 cryptographic hash constructor.
 *
 * @constructor
 * @extends {goog.crypt.Sha2}
 * @final
 * @struct
 */
goog.crypt.Sha256 = function() {
  goog.crypt.Sha256.base(this, 'constructor',
      8, goog.crypt.Sha256.INIT_HASH_BLOCK_);
};
goog.inherits(goog.crypt.Sha256, goog.crypt.Sha2);


/** @private {!Array<number>} */
goog.crypt.Sha256.INIT_HASH_BLOCK_ = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
