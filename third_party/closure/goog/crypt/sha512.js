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
 * @fileoverview SHA-512 cryptographic hash.
 *
 * Usage:
 *   var sha512 = new goog.crypt.Sha512();
 *   sha512.update(bytes);
 *   var hash = sha512.digest();
 *
 */

goog.provide('goog.crypt.Sha512');

goog.require('goog.crypt.Sha2_64bit');



/**
 * Constructs a SHA-512 cryptographic hash.
 *
 * @constructor
 * @extends {goog.crypt.Sha2_64bit}
 * @final
 * @struct
 */
goog.crypt.Sha512 = function() {
  goog.crypt.Sha512.base(this, 'constructor', 8,
      // Section 5.3.5 of
      // csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
      [0x6a09e667, 0xf3bcc908,  // H0
       0xbb67ae85, 0x84caa73b,  // H1
       0x3c6ef372, 0xfe94f82b,  // H2
       0xa54ff53a, 0x5f1d36f1,  // H3
       0x510e527f, 0xade682d1,  // H4
       0x9b05688c, 0x2b3e6c1f,  // H5
       0x1f83d9ab, 0xfb41bd6b,  // H6
       0x5be0cd19, 0x137e2179   // H7
      ]);
};
goog.inherits(goog.crypt.Sha512, goog.crypt.Sha2_64bit);
