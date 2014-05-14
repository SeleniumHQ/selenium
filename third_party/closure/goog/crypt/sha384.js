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
 * @fileoverview SHA-384  cryptographic hash.
 *
 * Usage:
 *   var sha384 = new goog.crypt.Sha384();
 *   sha384.update(bytes);
 *   var hash = sha384.digest();
 *
 */

goog.provide('goog.crypt.Sha384');

goog.require('goog.crypt.Sha2_64bit');



/**
 * Constructs a SHA-384 cryptographic hash.
 *
 * @constructor
 * @extends {goog.crypt.Sha2_64bit}
 * @final
 * @struct
 */
goog.crypt.Sha384 = function() {
  goog.crypt.Sha384.base(this, 'constructor', 6,
      // Section 5.3.4 of
      // csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
      [0xcbbb9d5d, 0xc1059ed8,  // H0
       0x629a292a, 0x367cd507,  // H1
       0x9159015a, 0x3070dd17,  // H2
       0x152fecd8, 0xf70e5939,  // H3
       0x67332667, 0xffc00b31,  // H4
       0x8eb44a87, 0x68581511,  // H5
       0xdb0c2e0d, 0x64f98fa7,  // H6
       0x47b5481d, 0xbefa4fa4   // H7
      ]);
};
goog.inherits(goog.crypt.Sha384, goog.crypt.Sha2_64bit);
