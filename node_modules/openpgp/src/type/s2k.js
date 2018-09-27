// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA

/**
 * Implementation of the String-to-key specifier ({@link http://tools.ietf.org/html/rfc4880#section-3.7|RFC4880 3.7})<br/>
 * <br/>
 * String-to-key (S2K) specifiers are used to convert passphrase strings
 * into symmetric-key encryption/decryption keys.  They are used in two
 * places, currently: to encrypt the secret part of private keys in the
 * private keyring, and to convert passphrases to encryption keys for
 * symmetrically encrypted messages.
 * @requires crypto
 * @requires enums
 * @requires util
 * @module type/s2k
 */

'use strict';

import enums from '../enums.js';
import util from '../util.js';
import crypto from '../crypto';

/**
 * @constructor
 */
export default function S2K() {
  /** @type {module:enums.hash} */
  this.algorithm = 'sha256';
  /** @type {module:enums.s2k} */
  this.type = 'iterated';
  this.c = 96;
  /** Eight bytes of salt in a binary string.
   * @type {String}
   */
  this.salt = crypto.random.getRandomBytes(8);
}

S2K.prototype.get_count = function () {
  // Exponent bias, defined in RFC4880
  var expbias = 6;

  return (16 + (this.c & 15)) << ((this.c >> 4) + expbias);
};

/**
 * Parsing function for a string-to-key specifier ({@link http://tools.ietf.org/html/rfc4880#section-3.7|RFC 4880 3.7}).
 * @param {String} input Payload of string-to-key specifier
 * @return {Integer} Actual length of the object
 */
S2K.prototype.read = function (bytes) {
  var i = 0;
  this.type = enums.read(enums.s2k, bytes[i++]);
  this.algorithm = enums.read(enums.hash, bytes[i++]);

  switch (this.type) {
    case 'simple':
      break;

    case 'salted':
      this.salt = bytes.subarray(i, i + 8);
      i += 8;
      break;

    case 'iterated':
      this.salt = bytes.subarray(i, i + 8);
      i += 8;

      // Octet 10: count, a one-octet, coded value
      this.c = bytes[i++];
      break;

    case 'gnu':
      if (util.Uint8Array2str(bytes.subarray(i, 3)) === "GNU") {
        i += 3; // GNU
        var gnuExtType = 1000 + bytes[i++];
        if (gnuExtType === 1001) {
          this.type = gnuExtType;
          // GnuPG extension mode 1001 -- don't write secret key at all
        } else {
          throw new Error("Unknown s2k gnu protection mode.");
        }
      } else {
        throw new Error("Unknown s2k type.");
      }
      break;

    default:
      throw new Error("Unknown s2k type.");
  }

  return i;
};


/**
 * Serializes s2k information
 * @return {Uint8Array} binary representation of s2k
 */
S2K.prototype.write = function () {

  var arr = [new Uint8Array([enums.write(enums.s2k, this.type), enums.write(enums.hash, this.algorithm)])];

  switch (this.type) {
    case 'simple':
      break;
    case 'salted':
      arr.push(this.salt);
      break;
    case 'iterated':
      arr.push(this.salt);
      arr.push(new Uint8Array([this.c]));
      break;
    case 'gnu':
      throw new Error("GNU s2k type not supported.");
    default:
      throw new Error("Unknown s2k type.");
  }

  return util.concatUint8Array(arr);
};

/**
 * Produces a key using the specified passphrase and the defined
 * hashAlgorithm
 * @param {String} passphrase Passphrase containing user input
 * @return {Uint8Array} Produced key with a length corresponding to
 * hashAlgorithm hash length
 */
S2K.prototype.produce_key = function (passphrase, numBytes) {
  passphrase = util.str2Uint8Array(util.encode_utf8(passphrase));

  function round(prefix, s2k) {
    var algorithm = enums.write(enums.hash, s2k.algorithm);

    switch (s2k.type) {
      case 'simple':
        return crypto.hash.digest(algorithm, util.concatUint8Array([prefix,passphrase]));

      case 'salted':
        return crypto.hash.digest(algorithm,
          util.concatUint8Array([prefix, s2k.salt, passphrase]));

      case 'iterated':
        var isp = [],
          count = s2k.get_count(),
          data = util.concatUint8Array([s2k.salt,passphrase]);

        while (isp.length * data.length < count) {
          isp.push(data);
        }

        isp = util.concatUint8Array(isp);

        if (isp.length > count) {
          isp = isp.subarray(0, count);
        }

        return crypto.hash.digest(algorithm, util.concatUint8Array([prefix,isp]));

      case 'gnu':
        throw new Error("GNU s2k type not supported.");

      default:
        throw new Error("Unknown s2k type.");
    }
  }

  var arr = [],
    rlength = 0,
    prefix = new Uint8Array(numBytes);

  for(var i = 0; i<numBytes; i++) {
    prefix[i] = 0;
  }
  i = 0;

  while (rlength < numBytes) {
    var result = round(prefix.subarray(0,i), this);
    arr.push(result);
    rlength += result.length;
    i++;
  }

  return util.concatUint8Array(arr).subarray(0, numBytes);
};

S2K.fromClone = function (clone) {
  var s2k = new S2K();
  s2k.algorithm = clone.algorithm;
  s2k.type = clone.type;
  s2k.c = clone.c;
  s2k.salt = clone.salt;
  return s2k;
};
