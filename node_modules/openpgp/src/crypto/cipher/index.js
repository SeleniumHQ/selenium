/**
 * @requires crypto/cipher/aes
 * @requires crypto/cipher/blowfish
 * @requires crypto/cipher/cast5
 * @requires crypto/cipher/twofish
 * @module crypto/cipher
 */

'use strict';

import aes from'./aes.js';
import desModule from './des.js';
import cast5 from './cast5.js';
import twofish from './twofish.js';
import blowfish from './blowfish.js';

export default {
  /** @see module:crypto/cipher/aes */
  aes128: aes[128],
  aes192: aes[192],
  aes256: aes[256],
  /** @see module:crypto/cipher/des.originalDes */
  des: desModule.originalDes,
  /** @see module:crypto/cipher/des.des */
  tripledes: desModule.des,
  /** @see module:crypto/cipher/cast5 */
  cast5: cast5,
  /** @see module:crypto/cipher/twofish */
  twofish: twofish,
  /** @see module:crypto/cipher/blowfish */
  blowfish: blowfish,
  /** Not implemented */
  idea: function() {
    throw new Error('IDEA symmetric-key algorithm not implemented');
  }
};