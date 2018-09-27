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
 * Implementation of the Key Material Packet (Tag 5,6,7,14)<br/>
 * <br/>
 * {@link http://tools.ietf.org/html/rfc4880#section-5.5|RFC4480 5.5}:
 * A key material packet contains all the information about a public or
 * private key.  There are four variants of this packet type, and two
 * major versions.  Consequently, this section is complex.
 * @requires crypto
 * @requires enums
 * @requires packet/public_key
 * @requires type/mpi
 * @requires type/s2k
 * @requires util
 * @module packet/secret_key
 */

'use strict';

import publicKey from './public_key.js';
import enums from '../enums.js';
import util from '../util.js';
import crypto from '../crypto';
import type_mpi from '../type/mpi.js';
import type_s2k from '../type/s2k.js';

/**
 * @constructor
 * @extends module:packet/public_key
 */
export default function SecretKey() {
  publicKey.call(this);
  this.tag = enums.packet.secretKey;
  // encrypted secret-key data
  this.encrypted = null;
  // indicator if secret-key data is available in decrypted form
  this.isDecrypted = false;
}

SecretKey.prototype = new publicKey();
SecretKey.prototype.constructor = SecretKey;

function get_hash_len(hash) {
  if (hash === 'sha1') {
    return 20;
  } else {
    return 2;
  }
}

function get_hash_fn(hash) {
  if (hash === 'sha1') {
    return crypto.hash.sha1;
  } else {
    return function(c) {
      return util.writeNumber(util.calc_checksum(c), 2);
    };
  }
}

// Helper function

function parse_cleartext_mpi(hash_algorithm, cleartext, algorithm) {
  var hashlen = get_hash_len(hash_algorithm),
    hashfn = get_hash_fn(hash_algorithm);

  var hashtext = util.Uint8Array2str(cleartext.subarray(cleartext.length - hashlen, cleartext.length));
  cleartext = cleartext.subarray(0, cleartext.length - hashlen);

  var hash = util.Uint8Array2str(hashfn(cleartext));

  if (hash !== hashtext) {
    return new Error("Hash mismatch.");
  }

  var mpis = crypto.getPrivateMpiCount(algorithm);

  var j = 0;
  var mpi = [];

  for (var i = 0; i < mpis && j < cleartext.length; i++) {
    mpi[i] = new type_mpi();
    j += mpi[i].read(cleartext.subarray(j, cleartext.length));
  }

  return mpi;
}

function write_cleartext_mpi(hash_algorithm, algorithm, mpi) {
  var arr = [];
  var discard = crypto.getPublicMpiCount(algorithm);

  for (var i = discard; i < mpi.length; i++) {
    arr.push(mpi[i].write());
  }

  var bytes = util.concatUint8Array(arr);

  var hash = get_hash_fn(hash_algorithm)(bytes);

  return util.concatUint8Array([bytes, hash]);
}


// 5.5.3.  Secret-Key Packet Formats

/**
 * Internal parser for private keys as specified in {@link http://tools.ietf.org/html/rfc4880#section-5.5.3|RFC 4880 section 5.5.3}
 * @param {String} bytes Input string to read the packet from
 */
SecretKey.prototype.read = function (bytes) {
  // - A Public-Key or Public-Subkey packet, as described above.
  var len = this.readPublicKey(bytes);

  bytes = bytes.subarray(len, bytes.length);


  // - One octet indicating string-to-key usage conventions.  Zero
  //   indicates that the secret-key data is not encrypted.  255 or 254
  //   indicates that a string-to-key specifier is being given.  Any
  //   other value is a symmetric-key encryption algorithm identifier.
  var isEncrypted = bytes[0];

  if (isEncrypted) {
    this.encrypted = bytes;
  } else {
    // - Plain or encrypted multiprecision integers comprising the secret
    //   key data.  These algorithm-specific fields are as described
    //   below.
    var parsedMPI = parse_cleartext_mpi('mod', bytes.subarray(1, bytes.length), this.algorithm);
    if (parsedMPI instanceof Error) {
      throw parsedMPI;
    }
    this.mpi = this.mpi.concat(parsedMPI);
    this.isDecrypted = true;
  }

};

/** Creates an OpenPGP key packet for the given key.
  * @return {String} A string of bytes containing the secret key OpenPGP packet
  */
SecretKey.prototype.write = function () {
  var arr = [this.writePublicKey()];

  if (!this.encrypted) {
    arr.push(new Uint8Array([0]));
    arr.push(write_cleartext_mpi('mod', this.algorithm, this.mpi));
  } else {
    arr.push(this.encrypted);
  }

  return util.concatUint8Array(arr);
};




/** Encrypt the payload. By default, we use aes256 and iterated, salted string
 * to key specifier. If the key is in a decrypted state (isDecrypted === true)
 * and the passphrase is empty or undefined, the key will be set as not encrypted.
 * This can be used to remove passphrase protection after calling decrypt().
 * @param {String} passphrase
 */
SecretKey.prototype.encrypt = function (passphrase) {
  if (this.isDecrypted && !passphrase) {
    this.encrypted = null;
    return;
  } else if (!passphrase) {
    throw new Error('The key must be decrypted before removing passphrase protection.');
  }

  var s2k = new type_s2k(),
    symmetric = 'aes256',
    cleartext = write_cleartext_mpi('sha1', this.algorithm, this.mpi),
    key = produceEncryptionKey(s2k, passphrase, symmetric),
    blockLen = crypto.cipher[symmetric].blockSize,
    iv = crypto.random.getRandomBytes(blockLen);

  var arr = [ new Uint8Array([254, enums.write(enums.symmetric, symmetric)]) ];
  arr.push(s2k.write());
  arr.push(iv);
  arr.push(crypto.cfb.normalEncrypt(symmetric, key, cleartext, iv));

  this.encrypted = util.concatUint8Array(arr);
};

function produceEncryptionKey(s2k, passphrase, algorithm) {
  return s2k.produce_key(passphrase,
    crypto.cipher[algorithm].keySize);
}

/**
 * Decrypts the private key MPIs which are needed to use the key.
 * @link module:packet/secret_key.isDecrypted should be
 * false otherwise a call to this function is not needed
 *
 * @param {String} str_passphrase The passphrase for this private key
 * as string
 * @return {Boolean} True if the passphrase was correct or MPI already
 *                   decrypted; false if not
 */
SecretKey.prototype.decrypt = function (passphrase) {
  if (this.isDecrypted) {
    return true;
  }

  var i = 0,
    symmetric,
    key;

  var s2k_usage = this.encrypted[i++];

  // - [Optional] If string-to-key usage octet was 255 or 254, a one-
  //   octet symmetric encryption algorithm.
  if (s2k_usage === 255 || s2k_usage === 254) {
    symmetric = this.encrypted[i++];
    symmetric = enums.read(enums.symmetric, symmetric);

    // - [Optional] If string-to-key usage octet was 255 or 254, a
    //   string-to-key specifier.  The length of the string-to-key
    //   specifier is implied by its type, as described above.
    var s2k = new type_s2k();
    i += s2k.read(this.encrypted.subarray(i, this.encrypted.length));

    key = produceEncryptionKey(s2k, passphrase, symmetric);
  } else {
    symmetric = s2k_usage;
    symmetric = enums.read(enums.symmetric, symmetric);
    key = crypto.hash.md5(passphrase);
  }

  // - [Optional] If secret data is encrypted (string-to-key usage octet
  //   not zero), an Initial Vector (IV) of the same length as the
  //   cipher's block size.
  var iv = this.encrypted.subarray(i,
    i + crypto.cipher[symmetric].blockSize);

  i += iv.length;

  var cleartext,
    ciphertext = this.encrypted.subarray(i, this.encrypted.length);

  cleartext = crypto.cfb.normalDecrypt(symmetric, key, ciphertext, iv);

  var hash = s2k_usage === 254 ?
    'sha1' :
    'mod';

  var parsedMPI = parse_cleartext_mpi(hash, cleartext, this.algorithm);
  if (parsedMPI instanceof Error) {
    return false;
  }
  this.mpi = this.mpi.concat(parsedMPI);
  this.isDecrypted = true;
  this.encrypted = null;
  return true;
};

SecretKey.prototype.generate = function (bits) {
  var self = this;

  return crypto.generateMpi(self.algorithm, bits).then(function(mpi) {
    self.mpi = mpi;
    self.isDecrypted = true;
  });
};

/**
 * Clear private MPIs, return to initial state
 */
SecretKey.prototype.clearPrivateMPIs = function () {
  if (!this.encrypted) {
    throw new Error('If secret key is not encrypted, clearing private MPIs is irreversible.');
  }
  this.mpi = this.mpi.slice(0, crypto.getPublicMpiCount(this.algorithm));
  this.isDecrypted = false;
};
