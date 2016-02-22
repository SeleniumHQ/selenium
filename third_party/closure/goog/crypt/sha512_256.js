// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview SHA-512/256 cryptographic hash.
 *
 * WARNING:  SHA-256 and SHA-512/256 are different members of the SHA-2
 * family of hashes.  Although both give 32-byte results, the two results
 * should bear no relationship to each other.
 *
 * Please be careful before using this hash function.
 * <p>
 * Usage:
 *   var sha512_256 = new goog.crypt.Sha512_256();
 *   sha512_256.update(bytes);
 *   var hash = sha512_256.digest();
 *
 * @author fy@google.com (Frank Yellin)
 */

goog.provide('goog.crypt.Sha512_256');

goog.require('goog.crypt.Sha2_64bit');



/**
 * Constructs a SHA-512/256 cryptographic hash.
 *
 * @constructor
 * @extends {goog.crypt.Sha2_64bit}
 * @final
 * @struct
 */
goog.crypt.Sha512_256 = function() {
  goog.crypt.Sha512_256.base(this, 'constructor', 4  /* numHashBlocks */,
      goog.crypt.Sha512_256.INIT_HASH_BLOCK_);
};
goog.inherits(goog.crypt.Sha512_256, goog.crypt.Sha2_64bit);


/** @private {!Array<number>} */
goog.crypt.Sha512_256.INIT_HASH_BLOCK_ = [
  // Section 5.3.6.2 of
  // csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
  0x22312194, 0xFC2BF72C,  // H0
  0x9F555FA3, 0xC84C64C2,  // H1
  0x2393B86B, 0x6F53B151,  // H2
  0x96387719, 0x5940EABD,  // H3
  0x96283EE2, 0xA88EFFE3,  // H4
  0xBE5E1E25, 0x53863992,  // H5
  0x2B0199FC, 0x2C85B8AA,  // H6
  0x0EB72DDC, 0x81C52CA2   // H7
];
