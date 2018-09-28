/**
 * @requires crypto/public_key/dsa
 * @requires crypto/public_key/elgamal
 * @requires crypto/public_key/rsa
 * @module crypto/public_key
 */

'use strict';

/** @see module:crypto/public_key/rsa */
import rsa from './rsa.js';
/** @see module:crypto/public_key/elgamal */
import elgamal from './elgamal.js';
/** @see module:crypto/public_key/dsa */
import dsa from './dsa.js';

export default {
  rsa: rsa,
  elgamal: elgamal,
  dsa: dsa
};
